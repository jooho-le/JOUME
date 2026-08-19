import os
import sys
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite:///./test_mcm.db"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.main import app


def test_core_flow():
    with TestClient(app) as client:
        login = client.post("/api/v1/auth/login", json={"email": "demo@mcm.com", "password": "mcm1234"})
        assert login.status_code == 200
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        products = client.get("/api/v1/me/products", headers=headers)
        assert products.status_code == 200
        item_id = products.json()[0]["id"]
        journey = client.post("/api/v1/journeys", headers=headers, json={
            "user_product_id": item_id, "city": "Paris", "country": "France",
            "place": "Le Marais", "journey_date": "2026-08-19",
            "experience_type": "travel", "note": "오래 기억할 오후",
            "latitude": 48.8566, "longitude": 2.3522,
        })
        assert journey.status_code == 201
        story = client.post(f"/api/v1/stories/generate/{item_id}", headers=headers)
        assert story.status_code == 200
        recommendation = client.post(f"/api/v1/next-stories/generate/{item_id}", headers=headers)
        assert recommendation.status_code == 200
