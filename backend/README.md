# MCM Archive API

## 실행

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
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

현재 Story와 추천은 외부 AI 없이 동작하는 규칙 기반 MVP다. 이후 생성 함수만 AI API 호출로 교체할 수 있다.
