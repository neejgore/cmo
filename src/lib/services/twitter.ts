import { TwitterApi, TweetV2 } from 'twitter-api-v2';

// Twitter brand chatter service (to be implemented with Twitter API v2)
export async function getTwitterMentions(brand: string) {
  const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);
  try {
    const tweets = await client.v2.search(brand, { max_results: 10, 'tweet.fields': 'created_at,author_id' });
    return tweets.data?.data?.map((tweet: TweetV2) => ({
      text: tweet.text,
      author_id: tweet.author_id,
      created_at: tweet.created_at,
    })) || [];
  } catch (error) {
    console.error('Twitter API error:', error);
    return [];
  }
} 