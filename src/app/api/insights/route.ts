export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { getGoogleTrends } from '../../../lib/services/google-trends'
import googleTrends from 'google-trends-api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const brandName = searchParams.get('brand')
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
    // Interest by region (US states)
    const regionRaw = await googleTrends.interestByRegion({ keyword: brandName, geo: 'US', resolution: 'REGION' });
    const regionObj = typeof regionRaw === 'string' ? JSON.parse(regionRaw) : regionRaw;
    const regions = regionObj?.default?.geoMapData?.map((item: any) => ({
      state: item.geoName,
      geoCode: item.geoCode,
      value: item.value[0],
    })) || [];
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
    return NextResponse.json({ trends, regions, relatedQueries });
  } catch (error) {
    console.error('Error fetching Google Trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Trends' },
      { status: 500 }
    )
  }
} 