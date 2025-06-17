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
    if (!this.similarWebApiKey) {
      console.warn('SimilarWeb API key missing. Skipping traffic data fetch.')
      return null
    }
    try {
      const response = await axios.get(
        `https://api.similarweb.com/v1/website/${domain}/total-traffic-and-engagement/visits`,
        {
          headers: {
            'api-key': this.similarWebApiKey,
          },
        }
      )

      return {
        totalVisits: response.data.visits,
        uniqueVisitors: response.data.uniqueVisitors,
        pagesPerVisit: response.data.pagesPerVisit,
        avgVisitDuration: response.data.avgVisitDuration,
        bounceRate: response.data.bounceRate,
        trafficSources: response.data.trafficSources,
      }
    } catch (error) {
      console.error('Error fetching SimilarWeb data:', error)
      return null
    }
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
    if (!this.similarWebApiKey) {
      console.warn('SimilarWeb API key missing. Skipping competitor analysis fetch.')
      return null
    }
    try {
      const response = await axios.get(
        `https://api.similarweb.com/v1/website/${domain}/competitors`,
        {
          headers: {
            'api-key': this.similarWebApiKey,
          },
        }
      )

      return {
        competitors: response.data.competitors,
        overlap: response.data.overlap,
        marketShare: response.data.marketShare,
      }
    } catch (error) {
      console.error('Error fetching competitor analysis:', error)
      return null
    }
  }
} 