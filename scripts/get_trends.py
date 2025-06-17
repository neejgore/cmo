from pytrends.request import TrendReq
import json
import sys
from datetime import datetime, timedelta

def get_trends(keywords):
    # Initialize pytrends
    pytrends = TrendReq(hl='en-US', tz=360)
    
    # Get interest over time
    pytrends.build_payload(keywords, timeframe='today 3-m')
    interest_over_time_df = pytrends.interest_over_time()
    
    # Convert to list of dictionaries
    trends = []
    for keyword in keywords:
        if keyword in interest_over_time_df.columns:
            for date, value in interest_over_time_df[keyword].items():
                trends.append({
                    'keyword': keyword,
                    'interest': int(value),
                    'timestamp': date.isoformat()
                })
    
    return trends

if __name__ == '__main__':
    # Get keywords from command line argument
    keywords = json.loads(sys.argv[1])
    
    # Get trends
    trends = get_trends(keywords)
    
    # Output as JSON
    print(json.dumps(trends)) 