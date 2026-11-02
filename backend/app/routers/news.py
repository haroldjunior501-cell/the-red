from typing import List
from fastapi import APIRouter, HTTPException, status
from app.integrations.news import news_adapter
from app.schemas import NewsResponse

router = APIRouter(prefix="/news", tags=["United News"])


@router.get("", response_model=List[NewsResponse])
async def list_news():
    news_items = await news_adapter.get_news_feed()
    return news_items


@router.get("/{id}", response_model=NewsResponse)
async def get_news_item(id: int):
    item = await news_adapter.get_news_detail(id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"News article with ID {id} not found"
        )
    return item
