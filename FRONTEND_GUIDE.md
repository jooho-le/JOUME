# MCM Archive 프론트 페이지 명세

## 서비스 핵심 흐름

```text
제품 발견
→ Product Passport 확인
→ 로그인 및 제품 등록
→ Story 설정
→ Journey 기록
→ AI Story 생성
→ Next Story 선택
→ MCM 제품·케어·매장 연결
```

## 공통 영역

### Global Navigation

| 메뉴 | 이동 화면 | 역할 |
|---|---|---|
| STORY | `#/story-home` | 현재 제품의 Story 홈 |
| MAP | `#/journey-map` | 기록한 Journey 지도 |
| NEXT | `#/next-story` | AI가 제안한 다음 Story |
| CARE | `#/care-home` | 현재 제품의 관리 상태 |
| MY | `#/my-products` | 보유 제품과 계정 관리 |

### Global Product Selector

현재 보고 있는 MCM 제품을 변경하는 공통 선택기입니다.

- 현재 선택 제품 표시
- 보유 제품 변경
- 현재 제품의 Product Passport 이동
- 제품을 변경하면 Story, Map, Care 내용도 해당 제품 기준으로 변경

구현 파일: `src/components/AppShell.jsx`

---

## 01. Entry / Product Discovery

### 01-1. Product Discovery

- 파일: `src/pages/entry/ProductDiscovery.jsx`
- URL: `#/product-discovery`
- 목적: 제품 구매 전 고객에게 제품의 기능보다 Story와 Heritage를 먼저 전달합니다.
- 주요 내용: 제품 이미지, 제품명, 컬렉션, 기본 정보, Product Story 미리보기, MCM Heritage, Journey 미리보기, Care 미리보기
- 주요 이동: `Explore the Story` → Product Passport, `View Product` → Product Detail

### 01-2. Product Detail

- 파일: `src/pages/entry/ProductDetail.jsx`
- URL: `#/product-detail`
- 목적: 제품 정보 확인과 실제 구매 전환을 담당합니다.
- 주요 내용: 제품 이미지, 제품명, 가격, 컬러, 옵션, 설명, Product Story, Journey Preview
- 주요 이동: `Purchase` → 로그인 또는 구매 단계, `Product Passport` → Product Passport

### 01-3. External Product Entry

- 파일: `src/pages/entry/ExternalProductEntry.jsx`
- URL: `#/external-entry`
- 목적: 공식몰 외부에서 제품을 획득한 사용자도 공식 MCM 경험으로 연결합니다.
- 주요 내용: NFC·QR 스캔 안내, 공식 DPP 연결, 정품 확인
- 주의: 구매 경로는 화면에서 계속 강조하지 않습니다.
- 주요 이동: `Scan Product` → Product Passport

---

## 02. Product Passport

### 02-1. Digital Product Passport

- 파일: `src/pages/passport/DigitalProductPassport.jsx`
- URL: `#/digital-passport`
- 목적: 제품의 공식 정보와 브랜드가 만든 첫 번째 Story를 제공합니다.
- 주요 내용: 제품 Hero, Product Identity, 정품 정보, 소재, 제조 정보, Heritage, Craftsmanship, Care Preview, Journey Preview
- 미등록 사용자 CTA: `Register Your Product`
- 등록 사용자 CTA: `View My Story`

---

## 03. Account / Product Connection

### 03-1. Login / Sign Up

- 파일: `src/pages/account/Login.jsx`
- URL: `#/login`
- 목적: 제품 등록 과정에서 MCM 계정과 사용자를 연결합니다.
- 주요 내용: 로그인, 회원가입, 소셜 로그인
- 완료 후: 사용자가 진입했던 제품 등록 Flow로 복귀

### 03-2. Product Registration

- 파일: `src/pages/account/ProductRegistration.jsx`
- URL: `#/product-registration`
- 목적: 확인된 제품을 현재 사용자의 보유 제품으로 등록합니다.
- 주요 내용: 제품 이미지, 제품명, 제품 확인 상태, 계정 연결 상태, 현재 소유 등록
- 주요 이동: `Register Product` → Start Your Story

### 03-3. Start Your Story

- 파일: `src/pages/account/StartStory.jsx`
- URL: `#/start-story`
- 목적: 이후 개인화에 사용할 최소한의 초기 Context를 받습니다.
- 주요 내용: 관심 Experience, 관심 도시, 제품 사용 목적
- Experience: Travel, Work, Everyday, Celebration, New Beginning
- 주요 이동: `Start My Story` → Story Home

---

## 04. Story Home

### 04-1. My Story Home

- 파일: `src/pages/story/StoryHome.jsx`
- URL: `#/story-home`
- 목적: 선택된 제품의 전체 Story 상태를 한 화면에서 요약합니다.
- 주요 내용:
  - 현재 제품과 함께한 기간
  - 누적 Journey 수
  - AI Story 한 줄 Summary
  - 최근 Journey 3개
  - Journey Map 미리보기
  - Next Story 2개
  - Product Care 상태
- 빈 상태: Journey가 없으면 기존 기록 대신 `첫 Journey 추가` 안내 표시
- 핵심 CTA: `Add New Journey`
- 보조 이동: Journey Timeline, Next Story

---

## 05. My Journey

### 05-1. Add Journey

- 파일: `src/pages/journey/AddJourney.jsx`
- URL: `#/add-journey`
- 목적: 제품과 함께한 하나의 경험을 기록합니다.
- 입력: 사진, 도시·장소, 날짜, Experience Type, 짧은 메모
- Experience Type: Travel, Work, Everyday, Celebration, New Beginning
- 주요 이동: `Add to My Story` → Journey Complete

### 05-2. Journey Complete

- 파일: `src/pages/journey/JourneyComplete.jsx`
- URL: `#/journey-complete`
- 목적: Journey 저장 완료를 확인하고 다음 행동을 선택하게 합니다.
- 주요 내용: 등록 이미지, 장소, 날짜, Story 한 줄, 저장 완료 문구
- 주요 이동: Story Home 또는 Journey 추가

### 05-3. Journey Map

- 파일: `src/pages/journey/JourneyMap.jsx`
- URL: `#/journey-map`
- 목적: 선택 제품과 함께한 장소를 공간 기준으로 보여줍니다.
- 주요 내용: 세계·지역 지도, 방문 도시 Pin, Journey Route, 최근 Journey, Product Care Pin
- 동작: 국가 선택 시 해당 지역으로 확대하고 도시 Story 표시

### 05-4. Journey Timeline

- 파일: `src/pages/journey/JourneyTimeline.jsx`
- URL: `#/journey-timeline`
- 목적: 모든 경험과 제품 관리 기록을 시간순으로 보여줍니다.
- 주요 내용: Journey 이미지, 날짜, 장소, Experience Type, Product Care, 공식 수선 기록
- 주요 이동: Journey Detail, AI Journey Story

### 05-5. Journey Detail

- 파일: `src/pages/journey/JourneyDetail.jsx`
- URL: `#/journey-detail`
- 목적: Journey 하나의 전체 정보를 확인합니다.
- 주요 내용: 대표 이미지, 장소, 날짜, Experience Type, 사용자 메모, 사용 제품, 연결된 AI Story

### 05-6. Journey Archive

- 파일: `src/pages/journey/JourneyArchive.jsx`
- URL: `#/journey-archive`
- 목적: 누적된 Journey를 검색하고 분류합니다.
- 주요 내용: 전체 Journey 목록
- 필터: 연도, 도시, Experience Type

---

## 06. AI Story

### 06-1. AI Journey Story

- 파일: `src/pages/ai-story/AIJourneyStory.jsx`
- URL: `#/ai-journey-story`
- 목적: 흩어진 Journey를 하나의 제품 Story로 정리합니다.
- AI 입력: 제품 정보, 사진, 장소, 날짜, 메모, Experience Type
- 주요 내용: AI 한 줄 Summary, 전체 Story, 주요 도시, 주요 Experience, Timeline, Product Story와 Customer Story 연결
- 주요 이동: Story 저장, Story 공유, Next Story 탐색

### 06-2. Journey Story Card

- 파일: `src/pages/ai-story/JourneyStoryCard.jsx`
- URL: `#/story-card`
- 목적: 생성된 AI Story를 공유 가능한 카드로 만듭니다.
- 주요 내용: 대표 이미지, 제품 이미지, Story 문장, 도시, Route, `#MyMCMJourney`
- 설정: 공개, 일부 공개, 비공개

---

## 07. AI Next Story

### 07-1. Next Story

- 파일: `src/pages/next/NextStory.jsx`
- URL: `#/next-story`
- 목적: 기존 Journey를 기반으로 다음에 만들 Story를 두 개만 제안합니다.
- 사용 Context: 기존 Journey, 관심사, 제품 사용 방식
- 각 추천 내용: Story Theme, 장소, 이미지, 추천 이유 한 줄

### 07-2. Next Story Detail

- 파일: `src/pages/next/NextStoryDetail.jsx`
- URL: `#/next-story-detail`
- 목적: 추천이 나온 이유와 실제 만들 수 있는 경험을 설명합니다.
- 주요 내용: 추천 장소, 기존 Story와 연결점, 만들 수 있는 Story, 문화, 디자인·건축, 관련 활동
- 주요 이동: `Make This My Next Story` → Saved Next Story

### 07-3. Saved Next Story

- 파일: `src/pages/next/SavedNextStory.jsx`
- URL: `#/saved-next-story`
- 목적: 사용자가 선택한 다음 Story를 실행 전까지 보관합니다.
- 주요 내용: 예정 장소, Experience, 관련 MCM Experience
- 주요 이동: Journey 추가, MCM Experience 추천

---

## 08. MCM Experience

### 08-1. MCM Experience Recommendation

- 파일: `src/pages/experience/ExperienceRecommendation.jsx`
- URL: `#/experience-recommendation`
- 목적: 선택한 Next Story를 실제 MCM 행동으로 연결합니다.
- 추천 순서: Story → Experience → Product
- 주요 내용: Product Care, 매장, Brand Content, 관련 제품 2개, 추천 이유

### 08-2. Product Recommendation Detail

- 파일: `src/pages/experience/ProductRecommendationDetail.jsx`
- URL: `#/recommendation-detail`
- 목적: 추천 제품이 현재 제품과 Next Story에 왜 필요한지 설명합니다.
- 주요 내용: 제품 이미지, 제품명, 현재 보유 제품과 연결점, Story 추천 이유, Product Story
- 주요 이동: 공식 제품 상세, 공식 매장

### 08-3. Brand Content Detail

- 파일: `src/pages/experience/BrandContentDetail.jsx`
- URL: `#/brand-content`
- 목적: Journey와 연결되는 MCM 문화·디자인 콘텐츠를 제공합니다.
- 주요 내용: MCM Travel Story, 문화·디자인 콘텐츠, 전시·프로그램, 추천 이유

### 08-4. Store Detail

- 파일: `src/pages/experience/StoreDetail.jsx`
- URL: `#/store-detail`
- 목적: 추천된 경험을 오프라인 매장 행동으로 연결합니다.
- 주요 내용: 가까운 매장, 주소, 운영 정보, 제공 서비스, Product Care 가능 여부, 관련 제품
- 주요 이동: 방문 예약 또는 Care 요청

---

## 09. Product Care

### 09-1. Product Care Home

- 파일: `src/pages/care/ProductCareHome.jsx`
- URL: `#/care-home`
- 목적: 선택 제품의 현재 상태와 필요한 관리 행동을 요약합니다.
- 주요 내용: 제품 상태, 관리 가이드, 권장사항, 최근 Care 기록
- 주요 이동: Care Guide, Request Care

### 09-2. Care Guide

- 파일: `src/pages/care/CareGuide.jsx`
- URL: `#/care-guide`
- 목적: 제품 소재에 맞는 관리 방법을 안내합니다.
- 주요 내용: 제품별 관리, 소재별 관리, 보관 방법

### 09-3. Repair / Care History

- 파일: `src/pages/care/CareHistory.jsx`
- URL: `#/care-history`
- 목적: 공식 수선과 관리 이력을 제품 Story로 보존합니다.
- 주요 내용: 수선 날짜, 수선 내용, 상태, Journey Timeline 연결

### 09-4. Request Care

- 파일: `src/pages/care/RequestCare.jsx`
- URL: `#/care-request`
- 목적: 현재 제품의 공식 Care를 요청합니다.
- 입력: 제품, 요청 유형, 상태 사진, 가까운 매장
- 주요 이동: `Request` → Care Complete

### 09-5. Care Complete

- 파일: `src/pages/care/CareComplete.jsx`
- URL: `#/care-complete`
- 목적: 완료된 Care를 확인하고 Journey Timeline에 추가합니다.
- 주요 내용: 완료 날짜, 처리 내용, Care Story

---

## 10. My MCM

### 10-1. My Products

- 파일: `src/pages/my/MyProducts.jsx`
- URL: `#/my-products`
- 목적: 사용자가 보유한 모든 MCM 제품을 관리합니다.
- 제품별 정보: 이미지, Journey 수, AI Story Summary, Care 상태
- 주요 이동: Product Passport, 제품별 Story

### 10-2. My Story Archive

- 파일: `src/pages/my/MyStoryArchive.jsx`
- URL: `#/my-story-archive`
- 목적: 저장한 AI Story와 공유 카드를 관리합니다.
- 주요 내용: AI Journey Story, Journey Story Card, 공개 상태

### 10-3. Saved Next Stories

- 파일: `src/pages/my/SavedNextStories.jsx`
- URL: `#/saved-stories`
- 목적: 선택한 다음 Story를 모아 관리합니다.
- 주요 내용: 목적지, Experience, 관련 MCM Experience

### 10-4. Care History

- 파일: `src/pages/my/MyCareHistory.jsx`
- URL: `#/my-care-history`
- 목적: 보유 제품 전체의 Care와 수선 이력을 확인합니다.

### 10-5. Account

- 파일: `src/pages/my/Account.jsx`
- URL: `#/account`
- 목적: 회원 정보와 데이터 사용 범위를 관리합니다.
- 설정: 알림, Story 공개 범위, 데이터, 개인정보

---

## 11. Community / Content · P2

### 11-1. Global Journey Map

- 파일: `src/pages/community/GlobalJourneyMap.jsx`
- URL: `#/global-map`
- 목적: 공개에 동의한 사용자의 Journey를 국가와 도시 기준으로 탐색합니다.
- 주요 내용: 공개 Story Pin, 도시별 Story, 연결된 MCM 제품

### 11-2. City Story

- 파일: `src/pages/community/CityStory.jsx`
- URL: `#/city-story`
- 목적: 하나의 도시를 고객 Story와 MCM Travel Story로 보여줍니다.
- 주요 내용: 도시 이미지, 고객 Journey, 브랜드 콘텐츠, 관련 제품

### 11-3. #MyMCMJourney

- 파일: `src/pages/community/MyMCMJourney.jsx`
- URL: `#/community-feed`
- 목적: 공개 Story Card를 새로운 제품 발견 접점으로 사용합니다.
- 주요 내용: 고객 Story, 제품, 도시, Experience, Product Discovery 연결

---

## 코드에서 알아야 할 이름

| 이름 | 파일 | 의미 |
|---|---|---|
| `routeId` | 각 `pages/**/*.jsx` | 페이지의 고유 URL ID |
| `PAGE_SPECS` | `data/ia.js` | 페이지 문구, 기능, CTA, 순서 |
| `PAGE_MAP` | `data/ia.js` | `routeId`로 페이지 정보 조회 |
| `GLOBAL_NAV` | `data/ia.js` | 공통 상단·모바일 메뉴 |
| `navigate(id)` | `App.jsx` | 다른 페이지로 이동 |
| `pageId` | `App.jsx` | 현재 페이지 ID |
| `layout` | `data/ia.js` | 페이지가 사용할 공통 UI 유형 |
| `features` | `data/ia.js` | 해당 페이지의 주요 콘텐츠 |
| `ctas` | `data/ia.js` | 버튼 문구와 이동 목적지 |
| `selector` | `AppShell.jsx` | 제품 선택기 열림 상태 |

## 수정 기준

- 페이지 문구·기능·CTA 변경: `src/data/ia.js`
- 공통 내비게이션·제품 선택기 변경: `src/components/AppShell.jsx`
- 같은 유형 페이지의 레이아웃 변경: `src/components/IAPage.jsx`
- 특정 페이지만 별도로 변경: 해당 `src/pages/**/페이지.jsx`
- 컬러·간격·반응형 변경: `src/styles.css`

현재 각 페이지 파일은 `createIAPage(routeId)`로 공통 레이아웃을 사용합니다. 특정 페이지 개발이 시작되면 해당 파일을 독립 JSX 컴포넌트로 교체하면 됩니다.
