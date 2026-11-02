from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import httpx
from app.core.config import settings


# Official / Mock fixtures for Manchester United
MOCK_MATCHES: List[Dict[str, Any]] = [
    {
        "id": 1,
        "external_id": "mu-chelsea-2026",
        "opponent": "Chelsea",
        "competition": "Premier League",
        "kickoff_at": (datetime.now(timezone.utc) + timedelta(days=3, hours=4)).isoformat(),
        "status": "SCHEDULED",
        "home_score": None,
        "away_score": None,
        "is_home": "HOME",
        "venue": "Old Trafford",
    },
    {
        "id": 2,
        "external_id": "mu-arsenal-2026",
        "opponent": "Arsenal",
        "competition": "Premier League",
        "kickoff_at": (datetime.now(timezone.utc) + timedelta(days=10, hours=2)).isoformat(),
        "status": "SCHEDULED",
        "home_score": None,
        "away_score": None,
        "is_home": "AWAY",
        "venue": "Emirates Stadium",
    },
    {
        "id": 3,
        "external_id": "mu-liverpool-2026",
        "opponent": "Liverpool",
        "competition": "Premier League",
        "kickoff_at": (datetime.now(timezone.utc) - timedelta(days=4)).isoformat(),
        "status": "FINISHED",
        "home_score": 2,
        "away_score": 1,
        "is_home": "HOME",
        "venue": "Old Trafford",
    },
    {
        "id": 4,
        "external_id": "mu-city-2026",
        "opponent": "Manchester City",
        "competition": "FA Cup",
        "kickoff_at": (datetime.now(timezone.utc) - timedelta(days=11)).isoformat(),
        "status": "FINISHED",
        "home_score": 2,
        "away_score": 1,
        "is_home": "NEUTRAL",
        "venue": "Wembley Stadium",
    }
]


class FootballAdapter:
    def __init__(self):
        self.api_key = settings.FOOTBALL_API_KEY

    async def get_fixtures(self) -> List[Dict[str, Any]]:
        # If API key configured and reachable, attempt external call with timeout
        if self.api_key:
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    # Example external provider call
                    # resp = await client.get("https://api.football-data.org/v4/teams/66/matches", headers={"X-Auth-Token": self.api_key})
                    pass
            except Exception:
                pass
        return MOCK_MATCHES

    async def get_match_detail(self, match_id: int) -> Optional[Dict[str, Any]]:
        for m in MOCK_MATCHES:
            if m["id"] == match_id:
                return m
        return None


football_adapter = FootballAdapter()
