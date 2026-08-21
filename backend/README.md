# JOUME API

## 실행

```bash
cd backend
python3 -m venv .venv                      # Python 3.9 이상
.venv/bin/pip install -r requirements.txt
cp .env.example .env                       # OPENAI_API_KEY 를 채운다
.venv/bin/uvicorn app.main:app --reload
```

프로젝트 루트의 `.env`에 다음 값을 설정합니다.

```env
OPENAI_API_KEY=발급받은_API_KEY
OPENAI_MODEL=gpt-4.1-mini
```

`GPTAI_KEY` 또는 `GPT_API_KEY`라는 이름도 지원합니다. 키는 백엔드에서만 읽으며 `.env`는 Git에서 제외됩니다.

- API: `http://127.0.0.1:8000`
- Swagger: `http://127.0.0.1:8000/docs`
- SQLite: `backend/mcm_archive.db` (최초 실행 시 자동 생성)
- 데모 계정: `demo@mcm.com` / `mcm1234`

## 주요 기능

- 회원가입·로그인 및 30일 세션
- 제품 조회·정품 Passport·보유 제품 등록 및 전환
- Journey 생성·수정·삭제·타임라인·지도 데이터
- 기록 기반 Story 생성·저장·공개
- Customer Context 저장
- 제품 없는 Next Story Theme 2개 생성·선택
- Story 선택 이후 Experience·Store·Care·관련 제품 추천
- Product Care 신청·완료·이력
- 공개 Journey 커뮤니티 조회
- Journey 이미지 업로드
- 사진·장소·날짜·메모·제품·행동 기반 Customer Context AI 분석
- 공식 제품 정보와 고객 입력만 사용하는 AI Journey Story 생성
- 제품을 포함하지 않는 AI Next Story 2개 생성
- Story 선택 이후 등록된 MCM Experience만 AI가 순위화

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
통합 AI 파이프라인은 Customer Context 분석, Story 생성, Next Story 2개 생성까지 처리한다.

> `/api/v1/ai/journey-story` 는 현재 인증이 없다. 프론트에 로그인을 붙이는 시점에
> `user: User = Depends(current_user)` 를 추가해야 한다.

## AI 통합 파이프라인

AI 통합 실행 API는 `POST /api/v1/ai/pipeline/{user_product_id}`입니다. 반환값에 분석된 Context, Journey Story, Next Story 2개가 포함됩니다. 사용자가 Story를 고른 다음 `PATCH /api/v1/ai/story-proposals/{proposal_id}/select`를 호출하면 등록된 Experience 안에서만 개인화 추천을 생성합니다. 전체 순서는 `Record → Context → Story → Next Story → Experience → Product → Record`입니다.
