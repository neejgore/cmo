import { chromium } from 'playwright'

interface MetaAd {
  advertiser: string
  platform: 'Facebook' | 'Instagram'
  startDate: Date
  endDate: Date
  spend: number
  impressions: number
  creativeUrl: string
}

export async function getMetaAds(advertiserName: string): Promise<MetaAd[]> {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Navigate to Meta Ad Library
    await page.goto('https://www.facebook.com/ads/library/')
    
    // Search for advertiser
    await page.fill('input[name="q"]', advertiserName)
    await page.click('button[type="submit"]')
    
    // Wait for results
    await page.waitForSelector('.ad-item')
    
    // Extract ad data
    const ads = await page.evaluate(() => {
      const adElements = document.querySelectorAll('.ad-item')
      return Array.from(adElements).map(element => ({
        advertiser: element.querySelector('.advertiser')?.textContent || '',
        platform: element.querySelector('.platform')?.textContent as 'Facebook' | 'Instagram',
        startDate: new Date(element.querySelector('.start-date')?.textContent || ''),
        endDate: new Date(element.querySelector('.end-date')?.textContent || ''),
        spend: parseFloat(element.querySelector('.spend')?.textContent || '0'),
        impressions: parseInt(element.querySelector('.impressions')?.textContent || '0'),
        creativeUrl: element.querySelector('.creative-url')?.getAttribute('href') || ''
      }))
    })
    
    return ads
  } catch (error) {
    console.error('Error fetching Meta ads:', error)
    return []
  } finally {
    await browser.close()
  }
} 