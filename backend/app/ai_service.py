from __future__ import annotations

import base64
import json
import mimetypes
import os
from pathlib import Path
from typing import Any, Optional

import httpx
from dotenv import load_dotenv

PROJECT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(PROJECT_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env", override=False)

API_URL = "https://api.openai.com/v1/responses"


class AIConfigurationError(RuntimeError):
    pass


class AIProviderError(RuntimeError):
    pass


def api_key() -> str:
    key = os.getenv("OPENAI_API_KEY") or os.getenv("GPTAI_KEY") or os.getenv("GPT_API_KEY")
    if not key:
        raise AIConfigurationError("OPENAI_API_KEY, GPTAI_KEY 또는 GPT_API_KEY가 필요합니다.")
    return key


def image_data_url(image_url: Optional[str]) -> Optional[str]:
    if not image_url:
        return None
    if image_url.startswith("data:image/") or image_url.startswith("https://"):
        return image_url
    relative = image_url.removeprefix("/")
    path = BACKEND_DIR / relative
    if not path.is_file() or path.stat().st_size > 10 * 1024 * 1024:
        return None
    mime = mimetypes.guess_type(path.name)[0] or "image/jpeg"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


def structured_response(name: str, schema: dict[str, Any], instructions: str, payload: dict[str, Any], images: list[str] | None = None) -> dict[str, Any]:
    content: list[dict[str, Any]] = [{"type": "input_text", "text": json.dumps(payload, ensure_ascii=False)}]
    for image in images or []:
        data_url = image_data_url(image)
        if data_url:
            content.append({"type": "input_image", "image_url": data_url, "detail": "low"})
    body = {
        "model": os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
        "instructions": instructions,
        "input": [{"role": "user", "content": content}],
        "text": {"format": {"type": "json_schema", "name": name, "strict": True, "schema": schema}},
    }
    try:
        with httpx.Client(timeout=60) as client:
            response = client.post(API_URL, headers={"Authorization": f"Bearer {api_key()}", "Content-Type": "application/json"}, json=body)
        response.raise_for_status()
        result = response.json()
        output_text = result.get("output_text")
        if not output_text:
            for item in result.get("output", []):
                for part in item.get("content", []):
                    if part.get("type") == "output_text":
                        output_text = part.get("text")
                        break
        if not output_text:
            raise AIProviderError("AI 응답에 구조화된 결과가 없습니다.")
        return {"data": json.loads(output_text), "response_id": result.get("id", ""), "model": result.get("model", body["model"])}
    except httpx.HTTPStatusError as exc:
        detail = exc.response.text[:500]
        raise AIProviderError(f"OpenAI API 오류 ({exc.response.status_code}): {detail}") from exc
    except (httpx.HTTPError, json.JSONDecodeError) as exc:
        raise AIProviderError(f"AI 응답 처리 오류: {exc}") from exc


PIPELINE_SCHEMA = {
    "type": "object",
    "properties": {
        "context": {
            "type": "object",
            "properties": {
                "interests": {"type": "array", "items": {"type": "string"}},
                "usage_purposes": {"type": "array", "items": {"type": "string"}},
                "behavior_patterns": {"type": "array", "items": {"type": "string"}},
                "photo_insights": {"type": "array", "items": {"type": "string"}},
                "summary": {"type": "string"},
            },
            "required": ["interests", "usage_purposes", "behavior_patterns", "photo_insights", "summary"],
            "additionalProperties": False,
        },
        "journey_story": {
            "type": "object",
            "properties": {"title": {"type": "string"}, "content": {"type": "string"}, "summary": {"type": "string"}},
            "required": ["title", "content", "summary"],
            "additionalProperties": False,
        },
        "next_stories": {
            "type": "array", "minItems": 2, "maxItems": 2,
            "items": {
                "type": "object",
                "properties": {"theme": {"type": "string"}, "city": {"type": "string"}, "activity": {"type": "string"}, "reason": {"type": "string"}},
                "required": ["theme", "city", "activity", "reason"], "additionalProperties": False,
            },
        },
    },
    "required": ["context", "journey_story", "next_stories"],
    "additionalProperties": False,
}


EXPERIENCE_SCHEMA = {
    "type": "object",
    "properties": {
        "recommendations": {
            "type": "array", "minItems": 1, "maxItems": 4,
            "items": {
                "type": "object",
                "properties": {"experience_id": {"type": "integer"}, "reason": {"type": "string"}},
                "required": ["experience_id", "reason"], "additionalProperties": False,
            },
        }
    },
    "required": ["recommendations"], "additionalProperties": False,
}


PIPELINE_INSTRUCTIONS = """당신은 JOUME의 개인화 Story 편집자다.
입력에는 MCM의 공식 제품 정보, 고객 Journey, 고객 행동이 있다.
1) 브랜드 사실은 official_product에 있는 정보만 사용한다. 없는 Heritage, 제작 기법, 성능을 만들지 않는다.
2) 사진은 보이는 장면만 묘사하고 인물의 민감 특성이나 확정적 감정을 추론하지 않는다.
3) Journey Story는 고객이 제공한 장소, 날짜, 메모, 행동을 시간과 맥락에 따라 한국어로 재구성한다.
4) Next Story는 정확히 2개만 제안하며 제품을 추천하거나 구매를 유도하지 않는다.
5) 데이터가 부족한 추론은 단정하지 말고 가능성으로 표현한다.
6) 입력에 없는 실제 매장, 행사, 운영시간을 생성하지 않는다."""


EXPERIENCE_INSTRUCTIONS = """선택된 Next Story를 실제 행동으로 연결하는 JOUME 추천기다.
반드시 experience_catalog에 존재하는 ID만 사용한다. Story와 Customer Context에 맞춰 최대 4개를 고른다.
관련 제품(kind=product)은 최대 2개이며, Store/Care/Brand Content보다 앞세우지 않는다.
가격, 재고, 운영시간처럼 입력에 없는 사실은 만들지 않는다."""
