# JOUME API

## 실행

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
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

AI 통합 실행 API는 `POST /api/v1/ai/pipeline/{user_product_id}`입니다. 반환값에 분석된 Context, Journey Story, Next Story 2개가 포함됩니다. 사용자가 Story를 고른 다음 `PATCH /api/v1/ai/story-proposals/{proposal_id}/select`를 호출하면 등록된 Experience 안에서만 개인화 추천을 생성합니다. 전체 순서는 `Record → Context → Story → Next Story → Experience → Product → Record`입니다.
