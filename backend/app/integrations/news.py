from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings

MOCK_NEWS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "external_id": "news-mufc-01",
        "title": "Ruben Amorim reveals tactical plans ahead of crunch weekend fixture",
        "summary": "Manchester United manager discusses squad fitness, high-pressing intensity and Old Trafford atmosphere ahead of the upcoming clash.",
        "source": "The Athletic / MUFC Official",
        "published_at": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
        "url": "https://www.manutd.com/en/news",
        "image_url": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1000&q=80"
    },
    {
        "id": 2,
        "external_id": "news-mufc-02",
        "title": "Kobbie Mainoo shines in Carrington midfield drills as recovery stays ahead of schedule",
        "summary": "The young England international completed full contact training this morning, receiving praise from the coaching staff.",
        "source": "Manchester Evening News",
        "published_at": (datetime.now(timezone.utc) - timedelta(hours=8)).isoformat(),
        "url": "https://www.manchestereveningnews.co.uk/sport/football",
        "image_url": "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80"
    },
    {
        "id": 3,
        "external_id": "news-mufc-03",
        "title": "Old Trafford regeneration project reaches key consultation milestone",
        "summary": "Fans voice overwhelming support for a modernized stadium village while preserving the historic character of the Theatre of Dreams.",
        "source": "BBC Sport",
        "published_at": (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
        "url": "https://www.bbc.com/sport/football",
        "image_url": "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1000&q=80"
    }
]


class NewsAdapter:
    def __init__(self):
        self.api_key = settings.NEWS_API_KEY

    async def get_news_feed(self) -> List[Dict[str, Any]]:
        # In production with RSS/REST, fetch external and fallback to cache
        return MOCK_NEWS

    async def get_news_detail(self, news_id: int) -> Optional[Dict[str, Any]]:
        for n in MOCK_NEWS:
            if n["id"] == news_id:
                return n
        return None


news_adapter = NewsAdapter()
