from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import User, Profile
from app.schemas import UserMeResponse, ProfileUpdateRequest, ProfileResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserMeResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=ProfileResponse)
def update_my_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        profile = Profile(user_id=current_user.id, display_name="Red Devil")
        db.add(profile)
    
    if req.display_name is not None:
        profile.display_name = req.display_name
    if req.avatar_url is not None:
        profile.avatar_url = req.avatar_url
    if req.bio is not None:
        profile.bio = req.bio
        
    profile.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(profile)
    return profile
