from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models import User, Profile
from app.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists"
        )
    
    # Create user
    user = User(
        email=req.email.lower(),
        password_hash=hash_password(req.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create associated profile
    profile = Profile(
        user_id=user.id,
        display_name=req.display_name,
        avatar_url=None,
        bio=None
    )
    db.add(profile)
    db.commit()
    
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, token_type="bearer")


@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = create_access_token(subject=user.id)
    return TokenResponse(access_token=token, token_type="bearer")
