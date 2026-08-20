from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

# backend/.env 를 읽는다. 파일이 없으면 조용히 넘어가므로 클론 직후에도 기동된다.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
AI_MAX_TOKENS = int(os.getenv("AI_MAX_TOKENS", "800"))
AI_TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.8"))
AI_ENABLED = bool(OPENAI_API_KEY)
