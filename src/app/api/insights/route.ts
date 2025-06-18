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
    const rawContent = completion.choices[0].message.content?.trim() || '';
    console.log('OpenAI category mapping raw response:', rawContent);
    // Extract number in parentheses, e.g. (901)
    const match = rawContent.match(/\((\d+)\)/);
    const code = match ? parseInt(match[1], 10) : null;
    return code;
  } catch (e) {
    console.log('OpenAI category mapping failed', e);
    return null;
  }
}

function safeJsonParse(text: string, context: string) {
  if (text.trim().startsWith('<')) {
    console.error(`[${context}] Non-JSON response (likely HTML):`, text.slice(0, 200));
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error(`[${context}] Failed to parse JSON:`, e, text.slice(0, 200));
    return null;
  }
}

async function getRealTimeTrendsCategory(code: number | null): Promise<string> {
  // Map Google Trends category code to realTimeTrends string category
  if (!code) return 'all';
  if ([3, 12, 13, 14, 15, 93].includes(code)) return 'b'; // Business (including 93)
  if ([16, 17, 18, 19].includes(code)) return 'e'; // Entertainment
  if ([7, 8, 9, 10, 11].includes(code)) return 't'; // Science/Tech
  if ([45, 46, 47, 48].includes(code)) return 'm'; // Health
  if ([20, 21, 22, 23, 24].includes(code)) return 's'; // Sports
  if ([0, 1].includes(code)) return 'all'; // All/Top Stories
  return 'all';
}

async function getTopCompetitors(brand: string): Promise<string[]> {
  const prompt = `List the top 3 direct competitors to the brand "${brand}". Only return a comma-separated list of brand names, no explanations.`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 30,
      temperature: 0,
    });
    const raw = completion.choices[0].message.content?.trim() || '';
    console.log('OpenAI competitors raw response:', raw);
    return raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);
  } catch (e) {
    console.log('OpenAI competitor mapping failed', e);
    return [];
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
    // Get competitors
    const competitors = await getTopCompetitors(brandName);
    // Interest over time for brand and competitors
    const allBrands = [brandName, ...competitors];
    let trendsRaw: any = await getGoogleTrends(allBrands);
    if (typeof trendsRaw === 'string') {
      const parsed = safeJsonParse(trendsRaw, 'interestOverTime');
      if (!parsed) trendsRaw = null;
      else trendsRaw = parsed;
    }
    const timeline = trendsRaw?.default?.timelineData || [];
    // Each timelineData item has value: [brand, comp1, comp2, comp3]
    const trendsSeries = allBrands.map((name, idx) => ({
      name,
      data: timeline.map((item: any) => ({
        interest: item.value[idx],
        timestamp: new Date(Number(item.time) * 1000).toISOString(),
        formattedTime: item.formattedTime,
      }))
    }));
    // Interest by DMA
    let dmaRaw = await googleTrends.interestByRegion({ keyword: brandName, geo: 'US', resolution: 'DMA' });
    if (typeof dmaRaw === 'string') {
      const parsed = safeJsonParse(dmaRaw, 'interestByRegion_DMA');
      if (!parsed) dmaRaw = { default: { geoMapData: [] } };
      else dmaRaw = parsed;
    }
    const dmas = dmaRaw?.default?.geoMapData?.map((item: any) => ({
      dma: item.geoName,
      geoCode: item.geoCode,
      value: item.value[0],
    })) || [];
    const top10DMAs = [...dmas].sort((a, b) => b.value - a.value).slice(0, 10);
    const bottom10DMAs = [...dmas].sort((a, b) => a.value - b.value).slice(0, 10);
    // Interest by state (REGION)
    let regionRaw = await googleTrends.interestByRegion({ keyword: brandName, geo: 'US', resolution: 'REGION' });
    if (typeof regionRaw === 'string') {
      const parsed = safeJsonParse(regionRaw, 'interestByRegion_REGION');
      if (!parsed) regionRaw = { default: { geoMapData: [] } };
      else regionRaw = parsed;
    }
    const states = regionRaw?.default?.geoMapData?.map((item: any) => ({
      state: item.geoName,
      geoCode: item.geoCode,
      value: item.value[0],
    })) || [];
    const top10States = [...states].sort((a, b) => b.value - a.value).slice(0, 10);
    // Real-Time Trends for closest category
    let categoryCode = await getCategoryCodeForBrand(brandName);
    const realTimeCategory = await getRealTimeTrendsCategory(categoryCode);
    let realTimeTrends: any[] = [];
    try {
      let realTimeRaw = await googleTrends.realTimeTrends({ geo: 'US', category: realTimeCategory });
      if (typeof realTimeRaw === 'string') {
        const parsed = safeJsonParse(realTimeRaw, 'realTimeTrends');
        if (!parsed) realTimeRaw = { storySummaries: { trendingStories: [] } };
        else realTimeRaw = parsed;
      }
      realTimeTrends = realTimeRaw?.storySummaries?.trendingStories?.map((story: any) => ({
        title: story.title,
        articles: story.articles,
        entityNames: story.entityNames,
        image: story.image,
        shareUrl: story.shareUrl,
      })) || [];
    } catch (e) {
      console.log('No real-time trends found for category', realTimeCategory, e);
    }
    return NextResponse.json({ trendsSeries, top10States, top10DMAs, bottom10DMAs, realTimeTrends });
  } catch (error) {
    console.error('Error fetching Google Trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Trends' },
      { status: 500 }
    )
  }
} 