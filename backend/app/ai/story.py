from __future__ import annotations

import logging
from typing import Sequence, Tuple

import openai
from pydantic import BaseModel, Field

from ..config import AI_MAX_TOKENS, AI_TEMPERATURE, OPENAI_MODEL
from .client import get_client
from .prompts import SYSTEM_PROMPT, build_user_message

log = logging.getLogger(__name__)


class StoryDraft(BaseModel):
    """LLM 응답을 이 스키마로 강제한다 (Structured Outputs)."""

    title: str = Field(min_length=1, max_length=80)
    content: str = Field(min_length=1, max_length=800)


def rule_based_story(product_name: str, journeys: Sequence) -> StoryDraft:
    """AI가 없거나 실패해도 화면이 비지 않도록 하는 규칙 기반 요약."""
    cities = list(dict.fromkeys(journey.city for journey in journeys))
    types = list(dict.fromkeys(j.experience_type for j in journeys if j.experience_type))
    return StoryDraft(
        title=f"{cities[0]} to {cities[-1]}",
        content=(
            f"{', '.join(cities)}을(를) 지나며 {product_name}은(는) 당신의 "
            f"{' · '.join(types)} 순간을 가장 가까이에서 지켜봤습니다. "
            f"{len(journeys)}번의 기록이 쌓이는 동안, 하나의 물건은 여러 도시의 공기를 담은 "
            "하나의 Story가 되었습니다."
        ),
    )


def compose_journey_story(
    product_name: str, collection: str, journeys: Sequence
) -> Tuple[StoryDraft, str]:
    """(초안, 생성 방식) 반환. 방식은 'llm' 또는 'fallback'.

    journeys 는 오래된 순으로 정렬된, city/country/place/date/experience_type/note 를
    가진 객체들의 시퀀스다.
    """
    if not journeys:
        raise ValueError("스토리를 만들 기록이 없습니다.")

    try:
        completion = get_client().chat.completions.parse(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": build_user_message(product_name, collection, journeys),
                },
            ],
            response_format=StoryDraft,
            max_completion_tokens=AI_MAX_TOKENS,
            temperature=AI_TEMPERATURE,
        )
    except RuntimeError as exc:  # 키 미설정
        log.info("AI 비활성, 규칙 기반으로 생성: %s", exc)
        return rule_based_story(product_name, journeys), "fallback"
    except openai.RateLimitError as exc:  # 429 (쿼터 초과 포함)
        log.warning("AI 레이트리밋: %s", exc)
        return rule_based_story(product_name, journeys), "fallback"
    except openai.APIStatusError as exc:  # 그 외 4xx/5xx
        log.warning("AI 응답 오류 %s: %s", exc.status_code, exc)
        return rule_based_story(product_name, journeys), "fallback"
    except openai.APIConnectionError as exc:  # 네트워크·타임아웃
        log.warning("AI 연결 실패: %s", exc)
        return rule_based_story(product_name, journeys), "fallback"

    message = completion.choices[0].message
    if message.refusal or message.parsed is None:
        log.warning(
            "AI 생성 미완료 (finish_reason=%s, refusal=%s)",
            completion.choices[0].finish_reason,
            message.refusal,
        )
        return rule_based_story(product_name, journeys), "fallback"

    return message.parsed, "llm"
