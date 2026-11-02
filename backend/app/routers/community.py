from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models import Post, Comment, Reaction, User
from app.schemas import (
    PostResponse, PostCreateRequest,
    CommentResponse, CommentCreateRequest,
    ReactionResponse, ReactionCreateRequest
)

router = APIRouter(prefix="/community", tags=["Fan Community"])


@router.get("/posts", response_model=List[PostResponse])
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(50).all()
    results = []
    for p in posts:
        author_name = p.author.profile.display_name if p.author and p.author.profile else "Supporter"
        results.append(PostResponse(
            id=p.id,
            user_id=p.user_id,
            author_name=author_name,
            content=p.content,
            match_id=p.match_id,
            created_at=p.created_at,
            comments_count=len(p.comments),
            reactions_count=len(p.reactions)
        ))
    return results


@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    req: PostCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = Post(
        user_id=current_user.id,
        content=req.content,
        match_id=req.match_id
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    author_name = current_user.profile.display_name if current_user.profile else "Supporter"
    return PostResponse(
        id=post.id,
        user_id=post.user_id,
        author_name=author_name,
        content=post.content,
        match_id=post.match_id,
        created_at=post.created_at,
        comments_count=0,
        reactions_count=0
    )


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: int,
    req: CommentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=req.content
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    author_name = current_user.profile.display_name if current_user.profile else "Supporter"
    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        author_name=author_name,
        content=comment.content,
        created_at=comment.created_at
    )


@router.post("/posts/{post_id}/reactions", response_model=ReactionResponse, status_code=status.HTTP_200_OK)
def react_to_post(
    post_id: int,
    req: ReactionCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found")
        
    # Check if reaction already exists
    existing = db.query(Reaction).filter(
        Reaction.post_id == post_id,
        Reaction.user_id == current_user.id
    ).first()
    
    if existing:
        existing.type = req.type
        db.commit()
        db.refresh(existing)
        return existing
        
    reaction = Reaction(
        post_id=post_id,
        user_id=current_user.id,
        type=req.type
    )
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    return reaction
