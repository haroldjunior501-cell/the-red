from typing import List
from fastapi import APIRouter, HTTPException, status
from app.integrations.football import football_adapter
from app.schemas import MatchResponse, MatchDetailResponse

router = APIRouter(prefix="/matches", tags=["Match Center"])


@router.get("", response_model=List[MatchResponse])
async def list_matches():
    matches = await football_adapter.get_fixtures()
    return matches


@router.get("/{id}", response_model=MatchDetailResponse)
async def get_match(id: int):
    match = await football_adapter.get_match_detail(id)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match with ID {id} not found"
        )
    return match
