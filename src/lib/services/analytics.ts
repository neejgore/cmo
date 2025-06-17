import axios from 'axios'

interface TrafficData {
  totalVisits: number
  uniqueVisitors: number
  pagesPerVisit: number
  avgVisitDuration: number
  bounceRate: number
  trafficSources: {
    direct: number
    referral: number
    search: number
    social: number
    mail: number
  }
}

interface AdSpendData {
  totalSpend: number
  platforms: {
    facebook: number
    instagram: number
    google: number
    other: number
  }
  topAds: Array<{
    platform: string
    spend: number
    impressions: number
    startDate: Date
    endDate: Date
  }>
}

export class AnalyticsService {
  private similarWebApiKey: string
  private adbeatApiKey: string

  constructor() {
    this.similarWebApiKey = process.env.SIMILARWEB_API_KEY || ''
    this.adbeatApiKey = process.env.ADBEAT_API_KEY || ''
  }

  async getTrafficData(domain: string): Promise<TrafficData | null> {
    // SimilarWeb integration temporarily disabled
    return null;
  }

  async getAdSpendData(domain: string): Promise<AdSpendData | null> {
    if (!this.adbeatApiKey) {
      console.warn('Adbeat API key missing. Skipping ad spend data fetch.')
      return null
    }
    try {
      const response = await axios.get(
        `https://api.adbeat.com/v1/domain/${domain}/ad-spend`,
        {
          headers: {
            'Authorization': `Bearer ${this.adbeatApiKey}`,
          },
        }
      )

      return {
        totalSpend: response.data.totalSpend,
        platforms: response.data.platforms,
        topAds: response.data.topAds.map((ad: any) => ({
          ...ad,
          startDate: new Date(ad.startDate),
          endDate: new Date(ad.endDate),
        })),
      }
    } catch (error) {
      console.error('Error fetching Adbeat data:', error)
      return null
    }
  }

  async getCompetitorAnalysis(domain: string): Promise<{
    competitors: string[]
    overlap: number
    marketShare: number
  } | null> {
    // SimilarWeb integration temporarily disabled
    return null;
  }
} 