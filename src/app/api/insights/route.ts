import { NextResponse } from 'next/server'
import { getTikTokTrends } from '../../../lib/services/tiktok'
import { getMetaAds } from '../../../lib/services/meta'
import { getGoogleTrends } from '../../../lib/services/google-trends'
import { RedditService } from '../../../lib/services/reddit'
import { RSSService } from '../../../lib/services/rss'
import { AnalyticsService } from '../../../lib/services/analytics'
import { prisma } from '../../../lib/prisma'
import { getTwitterMentions } from '../../../lib/services/twitter'
import { getExplodingTopics } from '../../../lib/services/exploding-topics'
import { getAdbeatData } from '../../../lib/services/adbeat'
import { getMailChartsCampaigns } from '../../../lib/services/mailcharts'
import { interpretInsights } from '../../../lib/services/interpretation'

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
    const redditService = new RedditService()
    const rssService = new RSSService()
    const analyticsService = new AnalyticsService()

    // Fetch data from all sources
    const [
      tiktokTrends,
      metaAds,
      googleTrends,
      redditMentions,
      appleUpdates,
      privacyUpdates,
      martechUpdates,
      emailCampaigns,
      trafficData,
      adSpendData,
      competitorAnalysis,
      twitterMentions,
      explodingTopics,
      adbeatData,
      mailChartsCampaigns
    ] = await Promise.all([
      getTikTokTrends(),
      getMetaAds(brandName),
      getGoogleTrends([brandName, ...brandName.split(' ')]),
      redditService.getBrandMentions(brandName),
      rssService.getAppleUpdates(),
      rssService.getPrivacySandboxUpdates(),
      rssService.getMartechUpdates(),
      rssService.getEmailCampaigns(domain),
      analyticsService.getTrafficData(domain),
      analyticsService.getAdSpendData(domain),
      analyticsService.getCompetitorAnalysis(domain),
      getTwitterMentions(brandName),
      getExplodingTopics(brandName),
      getAdbeatData(domain),
      getMailChartsCampaigns(domain)
    ])

    // Store insights in database
    const workspace = await prisma.workspace.findFirst({
      where: { brandName },
    })

    if (workspace) {
      await prisma.insight.createMany({
        data: [
          // Social Media Insights
          ...tiktokTrends.map(trend => ({
            workspaceId: workspace.id,
            title: `TikTok Trend: ${trend.title}`,
            summary: `Trending on TikTok with ${trend.views} views`,
            confidence: 0.8,
            source: 'TikTok',
            data: JSON.parse(JSON.stringify(trend)) as any,
          })),
          ...metaAds.map(ad => ({
            workspaceId: workspace.id,
            title: `Meta Ad: ${ad.advertiser}`,
            summary: `Active ad on ${ad.platform} with ${ad.impressions} impressions`,
            confidence: 0.9,
            source: 'Meta',
            data: JSON.parse(JSON.stringify(ad)) as any,
          })),
          ...redditMentions.map(mention => ({
            workspaceId: workspace.id,
            title: `Reddit Mention: ${mention.title}`,
            summary: `${mention.sentiment} sentiment in r/${mention.subreddit}`,
            confidence: 0.7,
            source: 'Reddit',
            data: JSON.parse(JSON.stringify(mention)) as any,
          })),

          // Industry Updates
          ...appleUpdates.map(update => ({
            workspaceId: workspace.id,
            title: `Apple Update: ${update.title}`,
            summary: update.content.substring(0, 200),
            confidence: 0.95,
            source: 'Apple Developer News',
            data: JSON.parse(JSON.stringify(update)) as any,
          })),
          ...privacyUpdates.map(update => ({
            workspaceId: workspace.id,
            title: `Privacy Update: ${update.title}`,
            summary: update.content.substring(0, 200),
            confidence: 0.9,
            source: 'Chromium Blog',
            data: JSON.parse(JSON.stringify(update)) as any,
          })),
          ...martechUpdates.map(update => ({
            workspaceId: workspace.id,
            title: `Martech Update: ${update.title}`,
            summary: update.content.substring(0, 200),
            confidence: 0.85,
            source: update.source,
            data: JSON.parse(JSON.stringify(update)) as any,
          })),

          // Analytics Insights
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
      tiktokTrends,
      metaAds,
      googleTrends,
      redditMentions,
      appleUpdates,
      privacyUpdates,
      martechUpdates,
      emailCampaigns,
      trafficData,
      adSpendData,
      competitorAnalysis,
      twitterMentions,
      explodingTopics,
      adbeatData,
      mailChartsCampaigns
    }
    const intelligence = await interpretInsights(rawResults)

    return NextResponse.json({
      social: {
        tiktokTrends,
        metaAds,
        redditMentions,
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
      email: {
        campaigns: emailCampaigns,
        mailChartsCampaigns,
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