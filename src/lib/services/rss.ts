import Parser from 'rss-parser'
import { chromium } from 'playwright'

interface RSSItem {
  title: string
  link: string
  pubDate: Date
  content: string
  source: string
  category?: string
}

export class RSSService {
  private parser: Parser
  private browser: any

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['category', 'category'],
          ['content:encoded', 'content'],
        ],
      },
    })
  }

  async getAppleUpdates(): Promise<RSSItem[]> {
    try {
      const feed = await this.parser.parseURL('https://developer.apple.com/news/rss/news.rss')
      return feed.items.map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: new Date(item.pubDate || ''),
        content: item.content || '',
        source: 'Apple Developer News',
        category: item.category,
      }))
    } catch (error) {
      console.error('Error fetching Apple updates:', error)
      return []
    }
  }

  async getPrivacySandboxUpdates(): Promise<RSSItem[]> {
    try {
      const feed = await this.parser.parseURL('https://blog.chromium.org/feeds/posts/default')
      return feed.items
        .filter(item => {
          const content = (item.content || '').toLowerCase()
          return content.includes('privacy') || content.includes('sandbox')
        })
        .map(item => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: new Date(item.pubDate || ''),
          content: item.content || '',
          source: 'Chromium Blog',
          category: 'Privacy',
        }))
    } catch (error) {
      console.error('Error fetching Privacy Sandbox updates:', error)
      return []
    }
  }

  async getMartechUpdates(): Promise<RSSItem[]> {
    const sources = [
      {
        name: 'G2',
        url: 'https://www.g2.com/news/feed',
      },
      {
        name: 'MarTech',
        url: 'https://martech.org/feed/',
      },
    ]

    try {
      const feeds = await Promise.all(
        sources.map(source => this.parser.parseURL(source.url))
      )

      return feeds.flatMap((feed, index) =>
        feed.items.map(item => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: new Date(item.pubDate || ''),
          content: item.content || '',
          source: sources[index].name,
          category: item.category,
        }))
      )
    } catch (error) {
      console.error('Error fetching Martech updates:', error)
      return []
    }
  }

  async getEmailCampaigns(domain: string): Promise<RSSItem[]> {
    if (!this.browser) {
      this.browser = await chromium.launch()
    }

    const page = await this.browser.newPage()
    try {
      // Navigate to MailCharts or similar service
      await page.goto(`https://www.mailcharts.com/domains/${domain}`)
      
      // Wait for campaign data to load
      await page.waitForSelector('.campaign-item')
      
      // Extract campaign data
      const campaigns = await page.evaluate(() => {
        const items = document.querySelectorAll('.campaign-item')
        return Array.from(items).map(item => ({
          title: item.querySelector('.title')?.textContent || '',
          link: item.querySelector('a')?.href || '',
          pubDate: new Date(item.querySelector('.date')?.textContent || ''),
          content: item.querySelector('.preview')?.textContent || '',
          source: 'MailCharts',
          category: item.querySelector('.category')?.textContent,
        }))
      })

      return campaigns
    } catch (error) {
      console.error('Error fetching email campaigns:', error)
      return []
    } finally {
      await page.close()
    }
  }
} 