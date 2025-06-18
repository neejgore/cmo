export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { getGoogleTrends } from '../../../lib/services/google-trends'
import googleTrends from 'google-trends-api';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getCategoryCodeForBrand(brand: string): Promise<number | null> {
  // Prompt OpenAI to map the brand to a Google Trends category code
  const prompt = `Given the brand name "${brand}", return the closest Google Trends category code from this list: https://github.com/pat310/google-trends-api/wiki/Google-Trends-Categories. Only return the numeric code.`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 10,
      temperature: 0,
    });
    const code = parseInt(completion.choices[0].message.content?.trim() || '', 10);
    return isNaN(code) ? null : code;
  } catch (e) {
    console.log('OpenAI category mapping failed', e);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const brandName = searchParams.get('brand')
    const industry = searchParams.get('industry')
    if (!brandName) {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      )
    }
    // Interest over time
    const trendsRaw = await getGoogleTrends([brandName, ...brandName.split(' ')]);
    const trendsObj = typeof trendsRaw === 'string' ? JSON.parse(trendsRaw) : trendsRaw;
    const timeline = trendsObj?.default?.timelineData || [];
    const trends = timeline.map((item: any) => ({
      keyword: brandName,
      interest: item.value[0],
      timestamp: new Date(Number(item.time) * 1000).toISOString(),
      formattedTime: item.formattedTime,
    }));
    // Interest by DMA
    const dmaRaw = await googleTrends.interestByRegion({ keyword: brandName, geo: 'US', resolution: 'DMA' });
    const dmaObj = typeof dmaRaw === 'string' ? JSON.parse(dmaRaw) : dmaRaw;
    const dmas = dmaObj?.default?.geoMapData?.map((item: any) => ({
      dma: item.geoName,
      geoCode: item.geoCode,
      value: item.value[0],
    })) || [];
    const top10DMAs = [...dmas].sort((a, b) => b.value - a.value).slice(0, 10);
    const bottom10DMAs = [...dmas].sort((a, b) => a.value - b.value).slice(0, 10);
    // Interest by state (REGION)
    const regionRaw = await googleTrends.interestByRegion({ keyword: brandName, geo: 'US', resolution: 'REGION' });
    const regionObj = typeof regionRaw === 'string' ? JSON.parse(regionRaw) : regionRaw;
    const states = regionObj?.default?.geoMapData?.map((item: any) => ({
      state: item.geoName,
      geoCode: item.geoCode,
      value: item.value[0],
    })) || [];
    const top10States = [...states].sort((a, b) => b.value - a.value).slice(0, 10);
    // Trending searches for industry (AI-mapped category)
    let trendingSearches: any[] = [];
    let categoryCode = await getCategoryCodeForBrand(brandName);
    try {
      const dailyTrendsRaw = await googleTrends.dailyTrends({ geo: 'US', trendDate: new Date(), category: categoryCode || undefined });
      const dailyTrendsObj = typeof dailyTrendsRaw === 'string' ? JSON.parse(dailyTrendsRaw) : dailyTrendsRaw;
      trendingSearches = dailyTrendsObj?.default?.trendingSearchesDays?.[0]?.trendingSearches?.map((t: any) => ({
        title: t.title.query,
        articles: t.articles,
        traffic: t.formattedTraffic,
      })) || [];
    } catch (e) {
      console.log('No trending searches found for category', categoryCode, e);
      // Fallback: try without category
      try {
        const dailyTrendsRaw = await googleTrends.dailyTrends({ geo: 'US', trendDate: new Date() });
        const dailyTrendsObj = typeof dailyTrendsRaw === 'string' ? JSON.parse(dailyTrendsRaw) : dailyTrendsRaw;
        trendingSearches = dailyTrendsObj?.default?.trendingSearchesDays?.[0]?.trendingSearches?.map((t: any) => ({
          title: t.title.query,
          articles: t.articles,
          traffic: t.formattedTraffic,
        })) || [];
      } catch (e2) {
        console.log('No trending searches found for US fallback', e2);
      }
    }
    // Related queries (top 5)
    const relatedRaw = await googleTrends.relatedQueries({ keyword: brandName, geo: 'US' });
    const relatedObj = typeof relatedRaw === 'string' ? JSON.parse(relatedRaw) : relatedRaw;
    const topRelated = relatedObj?.default?.rankedList?.find((l: any) => l.title === 'Top')?.rankedKeyword || [];
    const relatedQueries = topRelated.slice(0, 5).map((item: any) => ({
      query: item.query,
      value: item.value,
    }));
    if (relatedQueries.length === 0) {
      console.log('No related queries found for', brandName);
    }
    return NextResponse.json({ trends, top10States, top10DMAs, bottom10DMAs, trendingSearches, relatedQueries });
  } catch (error) {
    console.error('Error fetching Google Trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Trends' },
      { status: 500 }
    )
  }
} 