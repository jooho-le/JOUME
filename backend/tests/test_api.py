import os
import sys
from pathlib import Path

os.environ["DATABASE_URL"] = "sqlite:///./test_mcm.db"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.main import app
from app import api as api_module


def test_core_flow(monkeypatch):
    def fake_ai(name, schema, instructions, payload, images=None):
        if name == "joume_journey_pipeline":
            return {"model": "test-model", "response_id": "resp_test", "data": {
                "context": {"interests": ["design"], "usage_purposes": ["work"], "behavior_patterns": ["city movement"], "photo_insights": ["urban scene"], "summary": "도시 이동 중심"},
                "journey_story": {"title": "도시와 함께한 기록", "content": "공식 제품 정보와 고객 Journey로 만든 이야기", "summary": "도시의 장면"},
                "next_stories": [
                    {"theme": "새로운 시선", "city": "서울", "activity": "디자인 산책", "reason": "기존 기록 확장"},
                    {"theme": "느린 이동", "city": "부산", "activity": "해변 산책", "reason": "다른 리듬 제안"},
                ],
            }}
        return {"model": "test-model", "response_id": "resp_exp", "data": {"recommendations": [{"experience_id": 1, "reason": "선택한 Story와 연결"}]}}
    monkeypatch.setattr(api_module, "structured_response", fake_ai)
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
        context = client.put(f"/api/v1/me/products/{item_id}/context", headers=headers, json={
            "interests": ["design", "architecture"],
            "preferred_cities": ["서울", "부산"],
            "usage_purposes": ["주말 산책"],
        })
        assert context.status_code == 200
        proposals = client.post(f"/api/v1/story-proposals/generate/{item_id}", headers=headers)
        assert proposals.status_code == 200
        assert len(proposals.json()) == 2
        assert "product" not in proposals.json()[0]
        proposal_id = proposals.json()[0]["id"]
        selected = client.patch(f"/api/v1/story-proposals/{proposal_id}/select", headers=headers)
        assert selected.json()["status"] == "selected"
        experiences = client.get(f"/api/v1/story-proposals/{proposal_id}/experiences", headers=headers)
        assert experiences.status_code == 200
        assert len(experiences.json()) >= 1
        pipeline = client.post(f"/api/v1/ai/pipeline/{item_id}", headers=headers)
        assert pipeline.status_code == 200
        assert len(pipeline.json()["next_stories"]) == 2
        ai_proposal_id = pipeline.json()["next_stories"][0]["id"]
        ai_experiences = client.patch(f"/api/v1/ai/story-proposals/{ai_proposal_id}/select", headers=headers)
        assert ai_experiences.status_code == 200
        assert ai_experiences.json()["model"] == "test-model"
