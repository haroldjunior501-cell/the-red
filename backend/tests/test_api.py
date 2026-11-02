def test_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["project"] == "THE RED"
    assert data["club"] == "Manchester United"


def test_auth_and_profile_flow(client):
    # 1. Register new Red Devil supporter
    reg_payload = {
        "email": "cantona@reddevils.com",
        "password": "EricTheKing7!",
        "display_name": "Eric Cantona"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get profile
    profile_res = client.get("/api/v1/users/me", headers=headers)
    assert profile_res.status_code == 200
    data = profile_res.json()
    assert data["email"] == "cantona@reddevils.com"
    assert data["profile"]["display_name"] == "Eric Cantona"

    # 3. Update profile
    patch_res = client.patch(
        "/api/v1/users/me",
        json={"bio": "Au revoir seagulls.", "display_name": "The King"},
        headers=headers
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["bio"] == "Au revoir seagulls."
    assert patch_res.json()["display_name"] == "The King"


def test_matches_flow(client):
    res = client.get("/api/v1/matches")
    assert res.status_code == 200
    matches = res.json()
    assert len(matches) > 0
    first_match = matches[0]
    assert "opponent" in first_match
    assert "competition" in first_match

    # Match detail
    detail_res = client.get(f"/api/v1/matches/{first_match['id']}")
    assert detail_res.status_code == 200
    assert detail_res.json()["opponent"] == first_match["opponent"]


def test_news_flow(client):
    res = client.get("/api/v1/news")
    assert res.status_code == 200
    news = res.json()
    assert len(news) > 0
    assert "title" in news[0]

    detail_res = client.get(f"/api/v1/news/{news[0]['id']}")
    assert detail_res.status_code == 200
    assert detail_res.json()["title"] == news[0]["title"]


def test_community_flow(client):
    # Register author
    reg_res = client.post("/api/v1/auth/register", json={
        "email": "scholesy@reddevils.com",
        "password": "PaulScholes18!",
        "display_name": "Paul Scholes"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create post
    post_res = client.post(
        "/api/v1/community/posts",
        json={"content": "What a tactical masterclass today at Old Trafford!"},
        headers=headers
    )
    assert post_res.status_code == 201
    post_id = post_res.json()["id"]
    assert post_res.json()["author_name"] == "Paul Scholes"

    # Add comment
    comment_res = client.post(
        f"/api/v1/community/posts/{post_id}/comments",
        json={"content": "Totally agree Paul, midfield was dominant!"},
        headers=headers
    )
    assert comment_res.status_code == 201
    assert comment_res.json()["author_name"] == "Paul Scholes"

    # React
    react_res = client.post(
        f"/api/v1/community/posts/{post_id}/reactions",
        json={"type": "red"},
        headers=headers
    )
    assert react_res.status_code == 200
    assert react_res.json()["type"] == "red"

    # Check feed
    feed_res = client.get("/api/v1/community/posts")
    assert feed_res.status_code == 200
    feed = feed_res.json()
    assert len(feed) >= 1
    assert feed[0]["comments_count"] == 1
    assert feed[0]["reactions_count"] == 1
