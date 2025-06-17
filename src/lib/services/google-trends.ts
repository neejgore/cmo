// @ts-ignore: No types for google-trends-api
import googleTrends from 'google-trends-api';

interface TrendData {
  keyword: string
  interest: number
  timestamp: Date
}

export async function getGoogleTrends(keywords: string[]): Promise<TrendData[]> {
  try {
    const results = await googleTrends.interestOverTime({
      keyword: keywords,
      startTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
    });
    return JSON.parse(results);
  } catch (error) {
    console.error('Google Trends error:', error);
    return [];
  }
} 