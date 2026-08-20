# Joume (MCM Second Journey) 프론트 페이지 명세

> 이 문서는 실제 구현 상태를 따라갑니다. 화면 옆의 `✅ 구현됨` / `⬜ 스켈레톤`으로 지금 실제 코드가 있는지, 아직 `createIAPage(routeId)` 자리표시자인지 구분합니다.

## 서비스 핵심 흐름

```text
Landing (비로그인)
→ Product Discovery / External Entry
→ Digital Product Passport 확인
→ 로그인 (계정 연결)
→ 제품 등록
→ Story 설정
→ Story Home (로그인 상태 기본 화면)
→ Journey 기록
→ AI Story 생성
→ Next Story(여행지 + 제품) 선택
→ MCM 제품·케어·매장 연결
```

### 진입 라우팅

- 비로그인 상태로 아무 해시 없이 접속하면 `#/landing`으로 이동합니다.
- 로그인 완료(`login()` 호출) 후에는 다음 접속부터 곧바로 `#/story-home`으로 이동합니다.
- 로그인 여부는 `localStorage`에 앱 상태와 함께 저장되며(`isLoggedIn`), 이 필드가 없던 이전 버전 데이터는 보유 제품이 있으면 로그인된 것으로 간주해 자동 이관합니다.
- 구현: `src/App.jsx`(`defaultRoute`), `src/state/AppState.jsx`(`isLoggedIn`, `login()`, `readIsLoggedIn()`)

## 공통 영역

### Header

두 가지 모드로 나뉩니다 (`src/components/AppShell.jsx`).

- **Public 모드** (`landing`, `login`): 로고 + `Login` 버튼만 노출. `data/ia.js`의 `PUBLIC_PAGES`로 판별합니다.
- **App 모드** (로그인 후 나머지 전체): 로고 + 5개 Global Navigation. 900px 이하에서는 하단 고정 탭바로 전환되고, 각 탭에 아이콘(홈/핀/화살표/하트/프로필)이 함께 표시됩니다.

### Global Navigation

| 메뉴 | 이동 화면 | 역할 |
|---|---|---|
| STORY | `#/story-home` | 현재 제품의 Story 홈 |
| MAP | `#/journey-map` | 기록한 Journey 지도 |
| NEXT | `#/next-story` | AI가 제안한 다음 여행지 + 제품 |
| CARE | `#/care-home` | 현재 제품의 관리 상태 |
| MY | `#/my-products` | 보유 제품과 계정 관리 (허브) |

### Product Bar & Switcher

페이지 상단에 현재 선택된 제품을 보여주는 얇은 인라인 바입니다 (`src/components/ProductBar.jsx`).

- 이미지 + 제품명만 한 줄로 표시 (박스形 배경 없음)
- 보유 제품이 2개 이상이면 `제품 변경 →`이 노출되고, 클릭하면 **같은 화면 안에서** 세로 목록형 드롭다운 팝오버가 뜹니다 (페이지 이동 없음)
- 제품을 고르면 팝오버가 닫히고 현재 화면이 그 제품 기준 데이터로 즉시 갱신됩니다
- Product Care Home에서는 팝오버 대신 `src/components/ProductCarousel.jsx`(사진 카드 캐러셀)를 페이지 안에 직접 노출합니다 — "어떤 제품을 관리할지" 먼저 고르는 화면이라 더 큰 선택 UI가 필요하기 때문입니다.

---

## 00. Landing ✅ 구현됨

- 파일: `src/pages/landing/Landing.jsx`
- URL: `#/landing`
- 목적: 로그인 전 방문자에게 서비스 철학을 전달하고 가입을 유도합니다.
- 주요 내용: 히어로(헤드라인 + 제품 이미지), 3개 기능 섹션(좌우 번갈아 배치: 지도·타임라인 기록 / AI 내러티브 / 다음 순간 추천), 하단 CTA 밴드
- 주요 이동: `JOIN ME` / `내 제품 등록하고 여정 시작하기` → Login

---

## 01. Entry / Product Discovery ✅ 구현됨

이 섹션은 아직 제품을 등록하지 않은 방문자가 새 제품(`DISCOVERY_PRODUCT_ID`, 현재는 VISETOS SLING BAG)을 만나는 흐름입니다. 이미 보유 중인 제품(Story/Journey/Care가 쌓인 제품)과는 별개입니다.

### 01-1. Product Discovery

- 파일: `src/pages/entry/ProductDiscovery.jsx` · URL: `#/product-discovery`
- 주요 내용: 제품 히어로 이미지, Product Story 인용구, MCM Heritage / Journey Preview / Product Care 3단 요약
- 주요 이동: `Explore the Story` → Digital Passport, `View Product` → Product Detail

### 01-2. Product Detail

- 파일: `src/pages/entry/ProductDetail.jsx` · URL: `#/product-detail`
- 주요 내용: 제품 이미지, 컬러 스와치 선택, 가격, 소재/제조 정보 표
- 주요 이동: `Purchase` → Login, `Product Passport` → Digital Passport

### 01-3. External Product Entry

- 파일: `src/pages/entry/ExternalProductEntry.jsx` · URL: `#/external-entry`
- 주요 내용: NFC/QR 스캔 애니메이션(펄스 링), 공식 DPP 연결 안내
- 주의: 구매 경로를 강조하지 않습니다.
- 주요 이동: `Scan Product` → Digital Passport

---

## 02. Product Passport ✅ 구현됨

### 02-1. Digital Product Passport

- 파일: `src/pages/passport/DigitalProductPassport.jsx` · URL: `#/digital-passport`
- 주요 내용: 정품 뱃지, Product Identity 표, MCM Heritage/Craftsmanship 다크 패널
- 미등록 사용자 CTA: `Register Your Product` → Login
- 등록 사용자 CTA: `View My Story` → Story Home

---

## 03. Account / Product Connection ✅ 구현됨

### 03-1. Login / Sign Up

- 파일: `src/pages/account/Login.jsx` · URL: `#/login`
- 주요 내용: 이메일/비밀번호 폼만 (로그인·회원가입 탭 전환, 여행 관련 필드 없음)
- 제출 시 `useApp().login()`으로 로그인 상태를 저장하고 Product Registration으로 이동합니다.

### 03-2. Product Registration

- 파일: `src/pages/account/ProductRegistration.jsx` · URL: `#/product-registration`
- 주요 내용: 정품 확인 카드, 계정 연결 체크리스트
- 주요 이동: `Register Product` → Start Your Story (`registerProduct()`로 보유 제품 목록에 추가)

### 03-3. Start Your Story

- 파일: `src/pages/account/StartStory.jsx` · URL: `#/start-story`
- 주요 내용: Experience Type 5개 칩(Travel/Work/Everyday/Celebration/New Beginning), 관심 도시 선택
- 주요 이동: `Start My Story` → Story Home

---

## 04. Story Home ✅ 구현됨

### 04-1. My Story Home

- 파일: `src/pages/story/StoryHome.jsx` · URL: `#/story-home`
- 주요 내용 (위→아래 순서):
  1. Product Bar + 인사말(`안녕하세요, {이름}님`) + 제품 Story 헤드라인 + 보유 제품 수 칩
  2. 통계 밴드 (DAYS TOGETHER / JOURNEYS / CITIES) — 코냑 단색, 첫 칸만 강조 색
  3. **Story Summary / Next Chapter** 2단 패널 — 왼쪽은 지금까지 기록 요약 + AI Story 링크, 오른쪽은 코냑 다이아몬드 텍스처의 다음 추천 티저(Next Story 1순위)
  4. Journey Map 섹션 — 실제 Leaflet 미니맵(`src/components/MiniMap.jsx`, 전체 폭 와이드) + 하단 Product Care 요약 카드(별도 가로 카드, 지도 옆이 아님)
  5. Recent Journey 그리드(4개) + 인라인 "＋" 추가 카드
- 빈 상태(Journey 0개): 통계는 0으로 시작, 카드 대신 `EmptyState`(아웃라인 버튼 1개만, 중복 CTA 없음)

---

## 05. My Journey ✅ 구현됨

### 05-1. Add Journey

- 파일: `src/pages/journey/AddJourney.jsx` · URL: `#/add-journey`
- 입력: 사진 업로드, 도시/국가/장소, 날짜, Experience Type 칩, 짧은 메모
- 주요 이동: `Add to My Story` → Journey Complete

### 05-2. Journey Complete

- 파일: `src/pages/journey/JourneyComplete.jsx` · URL: `#/journey-complete`
- 방금 추가한 Journey(`selectedJourney`) 요약과 확인 문구
- 주요 이동: Story Home 또는 Add Journey 반복

### 05-3. Journey Map

- 파일: `src/pages/journey/JourneyMap.jsx` · URL: `#/journey-map`
- **상단 히어로**: 실제 Leaflet + OpenStreetMap 지도(최대 68vh, 화면 폭 전체). 지역 필터 칩(전체/아시아/유럽/북미/기타), 상단 우측 `+ 여정 추가하기`
- **하단 카드 그리드**: 방문 도시를 01, 02… 번호 카드로 나열(사진+날짜+기록 수)
- **카드-지도 연동**: 카드에 hover/focus하면 지도가 해당 도시로 `flyTo` 하고 마커가 확대·강조됩니다. 클릭하면 Journey Detail로 이동합니다.
- 모바일: 지도 46vh로 축소, 카드 그리드는 가로 스크롤
- 좌표 매핑: `data/dummy.js`의 `CITY_COORDS`/`CITY_REGION`. 목록에 없는 도시명을 자유 입력하면 지도에는 안 찍히고 카드 목록에만 남습니다.

### 05-4. Journey Timeline

- 파일: `src/pages/journey/JourneyTimeline.jsx` · URL: `#/journey-timeline`
- Journey + Care 기록을 날짜 역순으로 합쳐서 표시
- 주요 이동: Journey Detail, AI Journey Story

### 05-5. Journey Detail

- 파일: `src/pages/journey/JourneyDetail.jsx` · URL: `#/journey-detail`
- `selectedJourney` 하나의 전체 정보(이미지, 장소, 날짜, Experience, 메모, 사용 제품)

### 05-6. Journey Archive

- 파일: `src/pages/journey/JourneyArchive.jsx` · URL: `#/journey-archive`
- 연도/도시/Experience Type 필터가 있는 전체 Journey 그리드

---

## 06. AI Story ✅ 구현됨

### 06-1. AI Journey Story

- 파일: `src/pages/ai-story/AIJourneyStory.jsx` · URL: `#/ai-journey-story`
- Journey가 없으면 EmptyState, 있으면 진입 시 `generateStory()`로 요약 텍스트를 자동 생성
- 주요 내용: 다크 히어로(AI Summary + 도시/Experience/기록 수), Journey Timeline, **이 Story와 어울리는 제품 추천**(카드 인라인)
- 참고: 제품 추천은 별도 페이지로 분리하지 않습니다 — Story를 보다가 맥락을 잃지 않도록 이 화면 안에서 바로 보여줍니다. (반면 07번 Next Story의 제품 추천은 전용 상세 페이지가 따로 있습니다 — 아래 참고)
- 주요 이동: Save Story, Share Story(→ Story Card), Discover Next Story

### 06-2. Journey Story Card

- 파일: `src/pages/ai-story/JourneyStoryCard.jsx` · URL: `#/story-card`
- 공유 카드 미리보기 + 공개 범위 라디오(공개/일부 공개/비공개)

---

## 07. AI Next Story ✅ 구현됨

Next Story는 **여행지 추천과 제품 추천을 분리**해서 보여줍니다 — 하나의 화면에 제품 카드만 두 개 있던 이전 구성을 대체했습니다.

### 07-1. Next Story

- 파일: `src/pages/next/NextStory.jsx` · URL: `#/next-story`
- 주요 내용: 짧은 Customer Context 한 줄 + 카드 2장(왼쪽 아래로 오프셋 없는 기준, 오른쪽 카드가 64px 아래로 어긋난 비대칭 배치)
  - **다음 여행지 카드**: 실제 도시 사진(Unsplash) 풀블리드 배경 + 그라데이션, 테마 태그, 도시명, 추천 이유
  - **어울리는 제품 카드**: 제품 사진 + 제품 추천 이유
- 주요 이동: 여행지 카드 → Next Story Detail / 제품 카드 → Next Product Detail

### 07-2. Next Story Detail (여행지)

- 파일: `src/pages/next/NextStoryDetail.jsx` · URL: `#/next-story-detail`
- 도시 사진 풀블리드 히어로 + 추천 이유 / 기존 Story와 연결점 / 만들 수 있는 Story 3단 + 관련 브랜드 콘텐츠 카드(있으면 매칭)
- 주요 이동: `Make This My Next Story`(저장 후 My MCM으로 이동), `다른 추천 보기`

### 07-3. Next Product Detail (제품) — 신규

- 파일: `src/pages/next/NextProductDetail.jsx` · URL: `#/next-product-detail`
- 목적: Next Story의 제품 카드를 클릭했을 때 바로 Store Detail로 넘기지 않고, 왜 이 제품인지 먼저 설명합니다.
- 주요 내용: 제품 사진, 가격, 현재 보유 제품과의 연결점, 추천 이유, Product Story
- 주요 이동: `Store에서 보기` → Store Detail

### 07-4. Saved Next Story ⬜ 스켈레톤

- 파일: `src/pages/next/SavedNextStory.jsx` · URL: `#/saved-next-story`
- 현재는 `saveNextStory()`로 저장한 뒤 My MCM 허브(10-1)의 "저장된 Next Story" 목록으로 안내하고 있어 이 화면은 아직 별도로 쓰이지 않습니다.

---

## 08. MCM Experience ⬜ 스켈레톤 (미구현)

08-1 Experience Recommendation, 08-2 Brand Content Detail, 08-3 Store Detail 모두 아직 `createIAPage` 자리표시자입니다. `next-story-detail`, `next-product-detail`, `ai-journey-story`의 제품 추천 카드가 이미 `store-detail`/`brand-content`/`experience-recommendation`으로 연결되도록 라우팅은 걸어뒀습니다.

---

## 09. Product Care ✅ 구현됨

### 09-1. Product Care Home

- 파일: `src/pages/care/ProductCareHome.jsx` · URL: `#/care-home`
- 상단: 타이틀 옆 `Request Care` 버튼(우측 정렬), 그 아래 `ProductCarousel`로 보유 제품 중 관리할 제품을 먼저 선택
- 하단: 3분할 카드(제품 상태 / 관리 가이드 / 최근 Care 기록), 가운데 정렬, 제품 전환 시 실시간 반응

### 09-2. Care Guide

- 파일: `src/pages/care/CareGuide.jsx` · URL: `#/care-guide`
- 소재(캔버스/가죽) 기준 관리 팁 3가지

### 09-3. Repair / Care History

- 파일: `src/pages/care/CareHistory.jsx` · URL: `#/care-history`
- 현재 제품의 Care 기록 타임라인 (없으면 EmptyState)

### 09-4. Request Care

- 파일: `src/pages/care/RequestCare.jsx` · URL: `#/care-request`
- 입력: 케어 유형 칩, 매장 선택, 사진, 메모 → 제출 시 실제로 기록 생성

### 09-5. Care Complete

- 파일: `src/pages/care/CareComplete.jsx` · URL: `#/care-complete`
- 진입 시 자동으로 완료 처리(`completeCare()`) 후 확인 화면 표시

---

## 10. My MCM

### 10-1. My Products (허브) ✅ 구현됨

- 파일: `src/pages/my/MyProducts.jsx` · URL: `#/my-products`
- 원래 계획이던 5개 분리 페이지 대신 **2단 레이아웃 허브 하나**로 구현했습니다.
  - 좌측: 보유 제품 목록(도시·기록 수 요약, 클릭 시 해당 제품으로 전환 후 Story Home), 내 여정(Journey Map 바로가기), 저장된 Next Story 목록
  - 우측: 계정 설정 토글 4개(여정 공개, Next Story 알림, Care 알림, 마케팅 수신) — 실제 on/off 동작
- 10-2/10-3/10-4/10-5(아래)는 이 허브로 기능이 흡수되어 현재 링크되지 않습니다.

### 10-2~10-5 ⬜ 스켈레톤 (10-1로 대체됨)

- My Story Archive(`my-story-archive`), Saved Next Stories(`saved-stories`), Care History(`my-care-history`), Account(`account`) — 아직 자리표시자이며, My Products 허브가 이 역할을 대신하고 있습니다. 추후 필요해지면 허브에서 각 화면으로 드릴다운하는 형태로 되살릴 수 있습니다.

---

## 11. Community / Content · P2 ⬜ 스켈레톤 (미구현)

11-1 Global Journey Map, 11-2 City Story, 11-3 #MyMCMJourney 모두 아직 손대지 않았습니다. 우선순위가 가장 낮은 섹션입니다.

---

## 코드에서 알아야 할 이름

| 이름 | 파일 | 의미 |
|---|---|---|
| `routeId` | 각 `pages/**/*.jsx` | 페이지의 고유 URL ID |
| `PAGE_SPECS` / `PAGE_MAP` | `data/ia.js` | 라우팅 메타데이터(스켈레톤 페이지에서만 문구·CTA로 사용) |
| `GLOBAL_NAV` / `PUBLIC_PAGES` | `data/ia.js` | 상단 내비 항목 / 비로그인 전용 페이지 목록 |
| `navigate(id)` / `pageId` | `App.jsx` | 라우팅 이동 / 현재 페이지 ID |
| `defaultRoute()` | `App.jsx` | 로그인 여부에 따른 첫 진입 화면 결정 |
| `useApp()` | `state/AppState.jsx` | 전역 상태 훅 — 더미 데이터, 액션, 파생 값 전부 여기서 나옵니다 |
| `currentUserProductId` / `selectProduct()` | `state/AppState.jsx` | 지금 보고 있는 제품과 전환 액션 |
| `selectedJourneyId` / `selectedCareId` / `selectedNextId` | `state/AppState.jsx` | 목록→상세 페이지로 "지금 클릭한 항목"을 넘기는 공통 패턴 |
| `isLoggedIn` / `login()` | `state/AppState.jsx` | 로그인 상태와 진입 라우팅 결정에 사용 |
| `CITY_COORDS` / `CITY_REGION` / `CITY_PHOTOS` | `data/dummy.js` | Journey Map·Next Story에 쓰는 도시 좌표/지역/대표 사진 |
| `DISCOVERY_PRODUCT_ID` | `data/dummy.js` | 01~03(미등록 방문자) 흐름에서 보여주는 제품 |
| `ProductBar` / `ProductCarousel` / `MiniMap` / `EmptyState` | `components/` | 여러 페이지가 공유하는 컴포넌트 |
| `createIAPage(routeId)` | `components/IAPage.jsx` | 아직 미구현인 화면이 쓰는 자리표시자 (08, 10-2~10-5, 11) |

## 수정 기준

- 더미 데이터(제품/유저/좌표 등) 변경: `src/data/dummy.js`
- 전역 상태·액션 추가: `src/state/AppState.jsx`
- 아직 미구현인 화면의 임시 문구·CTA: `src/data/ia.js` (`PAGE_SPECS`)
- 공통 헤더·내비게이션: `src/components/AppShell.jsx`
- 특정 화면 로직/마크업: 해당 `src/pages/**/페이지.jsx` (구현된 화면은 전부 독립 컴포넌트입니다)
- 색상·간격·반응형: `src/styles.css` (`jm-` 접두사 클래스 체계)

`createIAPage(routeId)`는 08, 10-2~10-5, 11 섹션에만 남아있습니다. 해당 화면 개발을 시작하면 다른 구현된 페이지들처럼 독립 JSX 컴포넌트로 교체하면 됩니다.
