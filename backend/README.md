# MCM Archive API

## 실행

```bash
cd backend
python3 -m venv .venv                      # Python 3.9 이상
.venv/bin/pip install -r requirements.txt
cp .env.example .env                       # OPENAI_API_KEY 를 채운다
.venv/bin/uvicorn app.main:app --reload
```

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- SQLite: `backend/mcm_archive.db` (최초 실행 시 자동 생성)
- 데모 계정: `demo@mcm.com` / `mcm1234`

## 주요 기능

- 회원가입·로그인 및 30일 세션
- 제품 조회·정품 Passport·보유 제품 등록 및 전환
- Journey 생성·수정·삭제·타임라인·지도 데이터
- 기록 기반 Story 생성·저장·공개
- 다음 Story와 제품 추천·저장
- Product Care 신청·완료·이력
- 공개 Journey 커뮤니티 조회
- Journey 이미지 업로드

## AI Story 생성

Story 본문은 OpenAI(`gpt-4o-mini`)가 생성한다. 프롬프트와 호출은 `app/ai/` 에 있고,
`compose_journey_story()` 하나를 두 경로에서 함께 쓴다.

- `POST /api/v1/ai/journey-story` — 클라이언트가 보관 중인 기록을 그대로 받아 생성한다.
  DB·인증에 의존하지 않으므로 프론트가 localStorage 로 동작하는 동안 쓰는 경로다.
- `POST /api/v1/stories/generate/{user_product_id}` — DB 의 Journey 를 읽어 생성하고 저장한다.

응답은 Structured Outputs 로 `{title, content}` 스키마를 강제한다
(`chat.completions.parse(response_format=StoryDraft)`).

`OPENAI_API_KEY` 가 없거나 호출이 실패하면 규칙 기반 요약으로 자동 대체되고
응답의 `source` 가 `fallback` 이 된다. `GET /health` 의 `ai` 필드로 키 로드 여부를 확인할 수 있다.

설정은 `backend/.env` 에서 바꾼다 — `OPENAI_MODEL`, `AI_MAX_TOKENS`, `AI_TEMPERATURE`.
다음 Story·제품 추천은 아직 규칙 기반이며, 같은 방식으로 교체할 수 있다.

> `/api/v1/ai/journey-story` 는 현재 인증이 없다. 프론트에 로그인을 붙이는 시점에
> `user: User = Depends(current_user)` 를 추가해야 한다.
