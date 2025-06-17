import { Snoowrap } from 'snoowrap'

interface RedditMention {
  id: string
  title: string
  subreddit: string
  score: number
  comments: number
  created: Date
  url: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

export class RedditService {
  private client: Snoowrap

  constructor() {
    this.client = new Snoowrap({
      userAgent: 'CMO-Command/1.0.0',
      clientId: process.env.REDDIT_CLIENT_ID,
      clientSecret: process.env.REDDIT_CLIENT_SECRET,
      username: process.env.REDDIT_USERNAME,
      password: process.env.REDDIT_PASSWORD,
    })
  }

  async getBrandMentions(brandName: string, subreddits: string[] = []): Promise<RedditMention[]> {
    try {
      const searchQuery = `"${brandName}"`
      const searchResults = await this.client.search({
        query: searchQuery,
        subreddit: subreddits.join('+'),
        sort: 'relevance',
        time: 'month',
        limit: 100,
      })

      return searchResults.map(post => ({
        id: post.id,
        title: post.title,
        subreddit: post.subreddit.display_name,
        score: post.score,
        comments: post.num_comments,
        created: new Date(post.created_utc * 1000),
        url: post.url,
        sentiment: this.analyzeSentiment(post.title + ' ' + post.selftext),
      }))
    } catch (error) {
      console.error('Error fetching Reddit mentions:', error)
      return []
    }
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    // Simple sentiment analysis based on keyword matching
    const positiveWords = ['love', 'great', 'amazing', 'best', 'awesome', 'recommend']
    const negativeWords = ['hate', 'terrible', 'worst', 'awful', 'disappointed', 'bad']

    const lowerText = text.toLowerCase()
    let positiveCount = 0
    let negativeCount = 0

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++
    })

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++
    })

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }
} 