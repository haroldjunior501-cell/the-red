\"\"\"initial the red schema

Revision ID: 001_initial
Revises: 
Create Date: 2026-10-27

\"\"\"
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # Profiles Table
    op.create_table(
        'profiles',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('avatar_url', sa.String(length=500), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_profiles_user_id'), 'profiles', ['user_id'], unique=True)

    # Matches Table
    op.create_table(
        'matches',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('external_id', sa.String(length=100), nullable=True, unique=True),
        sa.Column('opponent', sa.String(length=150), nullable=False),
        sa.Column('competition', sa.String(length=150), nullable=False),
        sa.Column('kickoff_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('home_score', sa.Integer(), nullable=True),
        sa.Column('away_score', sa.Integer(), nullable=True),
        sa.Column('is_home', sa.String(length=10), nullable=False)
    )
    op.create_index(op.f('ix_matches_kickoff_at'), 'matches', ['kickoff_at'], unique=False)

    # News Table
    op.create_table(
        'news',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('external_id', sa.String(length=100), nullable=True, unique=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('source', sa.String(length=100), nullable=False),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('url', sa.String(length=500), nullable=True),
        sa.Column('image_url', sa.String(length=500), nullable=True)
    )
    op.create_index(op.f('ix_news_published_at'), 'news', ['published_at'], unique=False)

    # Posts Table
    op.create_table(
        'posts',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('match_id', sa.Integer(), sa.ForeignKey('matches.id', ondelete='SET NULL'), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False)
    )
    op.create_index(op.f('ix_posts_created_at'), 'posts', ['created_at'], unique=False)

    # Comments Table
    op.create_table(
        'comments',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Reactions Table
    op.create_table(
        'reactions',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('post_id', sa.Integer(), sa.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False)
    )


def downgrade() -> None:
    op.drop_table('reactions')
    op.drop_table('comments')
    op.drop_table('posts')
    op.drop_table('news')
    op.drop_table('matches')
    op.drop_table('profiles')
    op.drop_table('users')
