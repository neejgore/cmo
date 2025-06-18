export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
import { getGoogleTrends } from '../../../lib/services/google-trends'

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
    const trendsRaw = await getGoogleTrends([brandName, ...brandName.split(' ')]);
    const trendsObj = typeof trendsRaw === 'string' ? JSON.parse(trendsRaw) : trendsRaw;
    const timeline = trendsObj?.default?.timelineData || [];
    const trends = timeline.map((item: any) => ({
      keyword: brandName,
      interest: item.value[0],
      timestamp: new Date(Number(item.time) * 1000).toISOString(),
      formattedTime: item.formattedTime,
    }));
    return NextResponse.json({ trends });
  } catch (error) {
    console.error('Error fetching Google Trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Trends' },
      { status: 500 }
    )
  }
} 