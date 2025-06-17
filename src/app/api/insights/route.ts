export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server'
// import { getTikTokTrends } from '../../../lib/services/tiktok'
// import { getMetaAds } from '../../../lib/services/meta'
import { getGoogleTrends } from '../../../lib/services/google-trends'
import { RSSService } from '../../../lib/services/rss'
import { AnalyticsService } from '../../../lib/services/analytics'
import { getTwitterMentions } from '../../../lib/services/twitter'
import { getExplodingTopics } from '../../../lib/services/exploding-topics'
import { getAdbeatData } from '../../../lib/services/adbeat'
// import { getMailChartsCampaigns } from '../../../lib/services/mailcharts'
import { interpretInsights } from '../../../lib/services/interpretation'
import { prisma } from '../../../lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const brandName = searchParams.get('brand')
    const domain = searchParams.get('domain')
    
    if (!brandName || !domain) {
      return NextResponse.json(
        { error: 'Brand name and domain are required' },
        { status: 400 }
      )
    }

    // Initialize services
    const rssService = new RSSService()
    const analyticsService = new AnalyticsService()

    // Robust error handling for each integration
    const [
      googleTrends,
      appleUpdates,
      privacyUpdates,
      martechUpdates,
      trafficData,
      adSpendData,
      competitorAnalysis,
      twitterMentions,
      explodingTopics,
      adbeatData
    ] = await Promise.all([
      (async () => { try { return await getGoogleTrends([brandName, ...brandName.split(' ')]); } catch (e) { console.error('Google Trends error:', e); return []; } })(),
      (async () => { try { return await rssService.getAppleUpdates(); } catch (e) { console.error('Apple Updates error:', e); return []; } })(),
      (async () => { try { return await rssService.getPrivacySandboxUpdates(); } catch (e) { console.error('Privacy Updates error:', e); return []; } })(),
      (async () => { try { return await rssService.getMartechUpdates(); } catch (e) { console.error('Martech Updates error:', e); return []; } })(),
      (async () => { try { return await analyticsService.getTrafficData(domain); } catch (e) { console.error('Traffic Data error:', e); return null; } })(),
      (async () => { try { return await analyticsService.getAdSpendData(domain); } catch (e) { console.error('Ad Spend Data error:', e); return null; } })(),
      (async () => { try { return await analyticsService.getCompetitorAnalysis(domain); } catch (e) { console.error('Competitor Analysis error:', e); return null; } })(),
      (async () => { try { return await getTwitterMentions(brandName); } catch (e) { console.error('Twitter API error:', e); return []; } })(),
      (async () => { try { return await getExplodingTopics(brandName); } catch (e) { console.error('Exploding Topics error:', e); return []; } })(),
      (async () => { try { return await getAdbeatData(domain); } catch (e) { console.error('Adbeat Data error:', e); return null; } })(),
    ])

    // Store insights in database
    const workspace = await prisma.workspace.findFirst({
      where: { brandName },
    })

    if (workspace) {
      await prisma.insight.createMany({
        data: [
          ...(trafficData ? [{
            workspaceId: workspace.id,
            title: 'Traffic Analysis',
            summary: `${trafficData.totalVisits.toLocaleString()} total visits`,
            confidence: 0.9,
            source: 'SimilarWeb',
            data: JSON.parse(JSON.stringify(trafficData)) as any,
          }] : []),
          ...(adSpendData ? [{
            workspaceId: workspace.id,
            title: 'Ad Spend Analysis',
            summary: `$${adSpendData.totalSpend.toLocaleString()} total spend`,
            confidence: 0.85,
            source: 'Adbeat',
            data: JSON.parse(JSON.stringify(adSpendData)) as any,
          }] : []),
          ...(competitorAnalysis ? [{
            workspaceId: workspace.id,
            title: 'Competitor Analysis',
            summary: `${competitorAnalysis.competitors.length} competitors identified`,
            confidence: 0.9,
            source: 'SimilarWeb',
            data: JSON.parse(JSON.stringify(competitorAnalysis)) as any,
          }] : []),
        ],
      })
    }

    const rawResults = {
      googleTrends,
      appleUpdates,
      privacyUpdates,
      martechUpdates,
      trafficData,
      adSpendData,
      competitorAnalysis,
      twitterMentions,
      explodingTopics,
      adbeatData,
    }
    const intelligence = await interpretInsights(rawResults)

    return NextResponse.json({
      social: {
        twitterMentions,
      },
      industry: {
        appleUpdates,
        privacyUpdates,
        martechUpdates,
        explodingTopics,
      },
      analytics: {
        trafficData,
        adSpendData,
        competitorAnalysis,
        adbeatData,
      },
      intelligence,
    })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
} 