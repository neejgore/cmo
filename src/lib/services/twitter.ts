import { TwitterApi, TweetV2 } from 'twitter-api-v2';

// Twitter brand chatter service (to be implemented with Twitter API v2)
function analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['love', 'great', 'amazing', 'best', 'awesome', 'recommend', 'good', 'happy', 'win', 'success'];
  const negativeWords = ['hate', 'terrible', 'worst', 'awful', 'disappointed', 'bad', 'angry', 'fail', 'loss', 'problem'];
  const lower = text.toLowerCase();
  let pos = 0, neg = 0;
  positiveWords.forEach(w => { if (lower.includes(w)) pos++; });
  negativeWords.forEach(w => { if (lower.includes(w)) neg++; });
  if (pos > neg) return 'positive';
  if (neg > pos) return 'negative';
  return 'neutral';
}

export async function getTwitterMentions(brand: string) {
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
  try {
    const tweets = await client.v2.search(brand, { max_results: 10, 'tweet.fields': 'created_at,author_id' });
    return tweets.data?.data?.map((tweet: TweetV2) => ({
      text: tweet.text,
      author_id: tweet.author_id,
      created_at: tweet.created_at,
      sentiment: analyzeSentiment(tweet.text),
    })) || [];
  } catch (error) {
    console.error('Twitter API error:', error);
    return [];
  }
} 