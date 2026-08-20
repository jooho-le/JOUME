from __future__ import annotations

from functools import lru_cache

import openai

from ..config import OPENAI_API_KEY


@lru_cache(maxsize=1)
def get_client() -> openai.OpenAI:
    """키가 없으면 여기서 끊고, 호출부가 규칙 기반 폴백으로 넘긴다."""
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")
    # 페이지 로드 경로라 오래 매달리면 안 된다. 최악 12s x 2회.
    return openai.OpenAI(api_key=OPENAI_API_KEY, timeout=12.0, max_retries=1)
