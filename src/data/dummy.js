import visetosBackpack from '../assets/visetos-backpack.png';
import orangeCrossbody from '../assets/orange-crossbody.png';
import millaTote from '../assets/backpack.png';

export const DEMO_USER = {
  id: 1,
  name: '멋쟁이',
  email: 'demo@mcm.com',
  storyPublic: false,
  notifications: true,
  careAlerts: true,
  marketingOptIn: false,
};

export const PRODUCTS = [
  {
    id: 1,
    sku: 'MMA-AVE1SC0001',
    name: 'STARK BACKPACK IN VISETOS',
    collection: 'Stark',
    color: 'Cognac',
    material: 'Visetos Coated Canvas',
    manufactureCountry: 'Korea',
    price: 1450000,
    image: visetosBackpack,
    story: '도시를 넘나드는 이동을 위해 탄생한 MCM의 대표 백팩입니다. 하루의 시작과 끝을 함께하는 구조는 처음 그대로, 다음 여정을 위한 여백을 남깁니다.',
    craftsmanship: '1976년 뮌헨에서 시작된 Visetos 패턴은 한 장의 캔버스에 코팅과 압인을 반복해 완성됩니다. 모서리 마감까지 전 공정이 숙련된 장인의 손을 거칩니다.',
    careSummary: '부드러운 마른 천으로 닦고 직사광선과 습기를 피해 보관하세요.',
    authentic: true,
    priceOptions: [
      { color: 'Cognac', hex: '#bd5729' },
      { color: 'Black', hex: '#1a1a1a' },
      { color: 'White', hex: '#efece6' },
    ],
  },
  {
    id: 2,
    sku: 'MWRA-ATRC01',
    name: 'AREN CROSSBODY',
    collection: 'Aren',
    color: 'Cognac',
    material: 'Visetos Canvas',
    manufactureCountry: 'Italy',
    price: 1050000,
    image: orangeCrossbody,
    story: '가벼운 이동과 일상의 기록을 위한 컴팩트 크로스바디입니다. 짧은 외출에도, 새로운 도시에서도 부담 없이 곁에 둘 수 있습니다.',
    craftsmanship: '이탈리아 장인이 손으로 재단한 가죽 트림과 견고한 하드웨어가 오랜 사용에도 형태를 지켜줍니다.',
    careSummary: '사용 후 더스트백에 보관하고 가죽 트림의 수분 접촉을 피하세요.',
    authentic: true,
    priceOptions: [
      { color: 'Cognac', hex: '#bd5729' },
      { color: 'Ivory', hex: '#efece6' },
    ],
  },
  {
    id: 3,
    sku: 'MWPA-MIL01',
    name: 'MILLA TOTE',
    collection: 'Milla',
    color: 'Orange',
    material: 'Spanish Leather',
    manufactureCountry: 'Italy',
    price: 1890000,
    image: millaTote,
    story: '선명한 컬러와 구조적인 실루엣으로 다음 장면을 완성합니다. 업무와 일상의 경계를 자유롭게 오갈 수 있는 넉넉한 수납이 특징입니다.',
    craftsmanship: '스페인산 풀그레인 레더를 한 장 통가죽으로 재단해 이음새를 최소화했습니다.',
    careSummary: '가죽 전용 클리너를 소량 사용하고 정기적인 전문 케어를 권장합니다.',
    authentic: true,
    priceOptions: [
      { color: 'Orange', hex: '#ed6a2c' },
      { color: 'Black', hex: '#1a1a1a' },
    ],
  },
  {
    id: 4,
    sku: 'MWSA-VSL01',
    name: 'VISETOS SLING BAG',
    collection: 'Visetos Original',
    color: 'Cognac',
    material: 'Visetos Coated Canvas',
    manufactureCountry: 'Korea',
    price: 780000,
    image: orangeCrossbody,
    story: '한 손으로도 충분한 크기, 그러나 하루의 모든 기록을 담을 수 있는 슬링백입니다. 처음 만나는 순간부터 당신의 다음 Story가 시작됩니다.',
    craftsmanship: '오리지널 Visetos 패턴을 그대로 재현한 초경량 소재로, 처음 공개된 이후 가장 많은 사랑을 받은 실루엣입니다.',
    careSummary: '방수 코팅 소재로 가벼운 오염은 물티슈로 바로 제거할 수 있습니다.',
    authentic: true,
    priceOptions: [
      { color: 'Cognac', hex: '#bd5729' },
      { color: 'Black', hex: '#1a1a1a' },
      { color: 'White', hex: '#efece6' },
    ],
  },
];

// Product a new (not-yet-owned) customer encounters via marketing / NFC — drives the 01–03 discovery→registration flow.
export const DISCOVERY_PRODUCT_ID = 4;

export const getProduct = (productId) => PRODUCTS.find((p) => p.id === productId);

export const EXPERIENCE_TYPES = ['Travel', 'Work', 'Everyday', 'Celebration', 'New Beginning'];

export const CITIES = [
  'Seoul, Korea', 'Tokyo, Japan', 'Osaka, Japan', 'Berlin, Germany',
  'Paris, France', 'Milan, Italy', 'New York, USA', 'Bangkok, Thailand',
];

// Real coordinates for the Journey Map — keyed by the short city name used on journey records.
export const CITY_COORDS = {
  Seoul: [37.5665, 126.9780],
  Tokyo: [35.6762, 139.6503],
  Osaka: [34.6937, 135.5023],
  Berlin: [52.5200, 13.4050],
  Paris: [48.8566, 2.3522],
  Milan: [45.4642, 9.1900],
  'New York': [40.7128, -74.0060],
  Bangkok: [13.7563, 100.5018],
};

export const CITY_REGION = {
  Seoul: '아시아', Tokyo: '아시아', Osaka: '아시아', Bangkok: '아시아',
  Berlin: '유럽', Paris: '유럽', Milan: '유럽',
  'New York': '북미',
};
export const REGIONS = ['전체', '아시아', '유럽', '북미', '기타'];

export const CARE_TYPES = ['가죽 클리닝', '지퍼 / 하드웨어 수선', '컬러 리터치', '전체 컨디션 점검'];

export const STORES = [
  { id: 1, name: 'MCM 청담 플래그십', address: '서울 강남구 압구정로 46길 8', hours: '11:00 – 20:00', services: ['Product Care', 'Repair', 'Personal Styling'] },
  { id: 2, name: '신세계백화점 강남점', address: '서울 서초구 신반포로 176', hours: '10:30 – 20:00', services: ['Product Care', 'Repair'] },
  { id: 3, name: '롯데백화점 잠실 에비뉴엘', address: '서울 송파구 올림픽로 240', hours: '10:30 – 20:00', services: ['Product Care'] },
];

export const BRAND_CONTENT = [
  { id: 1, city: 'Berlin, Germany', title: 'MCM Travel Story · Berlin', tag: 'Culture / Design', body: '분단과 통일을 지나온 도시의 레이어를 MCM의 헤리티지와 겹쳐 소개하는 트래블 스토리입니다.', program: '2026.09 — Berlin Museum Island 연계 전시' },
  { id: 2, city: 'Tokyo, Japan', title: 'MCM Travel Story · Tokyo', tag: 'Architecture', body: '전통과 미래가 공존하는 도쿄의 건축을 MCM Visetos 패턴의 반복과 대비해 풀어냅니다.', program: '2026.06 — Shibuya Sky 팝업' },
  { id: 3, city: 'Seoul, Korea', title: 'MCM Travel Story · Seoul', tag: 'Everyday', body: '성수동과 청담을 잇는 서울의 일상 속에서 MCM과 함께한 순간들을 기록합니다.', program: '상시 진행 · MCM 청담 플래그십' },
];

export const CITY_PHOTOS = {
  'Seoul, Korea': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=900&q=80',
  'Milan, Italy': 'https://images.unsplash.com/photo-1520440229-6469a149ac59?auto=format&fit=crop&w=900&q=80',
  'Berlin, Germany': 'https://images.unsplash.com/photo-1560930950-5cc20e80e392?auto=format&fit=crop&w=900&q=80',
  'Paris, France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80',
};

const NEXT_STORY_POOL = [
  {
    productId: 2, title: 'DAILY MOVE', city: 'Seoul, Korea', theme: 'Everyday',
    reason: '일상 속 익숙한 도시지만, 아직 기록하지 못한 골목들이 남아있어요. 출퇴근길 너머의 서울을 새롭게 기록해보세요.',
    productReason: '가벼운 하루 이동에 어울리는 컴팩트한 크로스바디가 다음 기록을 함께합니다.',
  },
  {
    productId: 3, title: 'WEEKEND STORY', city: 'Milan, Italy', theme: 'New Beginning',
    reason: '새로운 시작을 기록해온 흐름이 이어질 다음 도시입니다. 디자인과 패션의 도시에서 또 다른 챕터를 시작해보세요.',
    productReason: '선명한 컬러와 구조적인 실루엣의 토트백이 새로운 챕터에 어울립니다.',
  },
  {
    productId: 1, title: 'BERLIN LAYERS', city: 'Berlin, Germany', theme: 'Travel',
    reason: '이미 새로운 프로젝트를 시작했던 베를린, 이번엔 여행자의 시선으로 다시 걸어보는 건 어떨까요.',
    productReason: '도시를 오가는 이동에 강한 백팩이 다음 여정에도 함께합니다.',
  },
  {
    productId: 2, title: 'CELEBRATION EDIT', city: 'Paris, France', theme: 'Celebration',
    reason: '기념일마다 특별한 장면을 남겨온 당신에게, 파리는 다음 기념일의 배경이 되어줄 도시입니다.',
    productReason: '특별한 날의 스타일링을 완성하는 컴팩트 크로스바디를 추천합니다.',
  },
];

let uid = 1000;
export const nextId = () => uid++;

export function buildSeedState() {
  const today = new Date();
  const daysAgo = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };

  const userProducts = [
    { id: 1, productId: 1, source: 'official', nickname: null, isCurrent: true, registeredAt: daysAgo(290) },
    { id: 2, productId: 2, source: 'official', nickname: null, isCurrent: false, registeredAt: daysAgo(12) },
    { id: 3, productId: 3, source: 'resale', nickname: null, isCurrent: false, registeredAt: daysAgo(48) },
  ];

  const journeys = [
    { id: 1, userProductId: 1, city: 'Tokyo', country: 'Japan', place: 'Shibuya Crossing', date: daysAgo(272), experienceType: 'Travel', note: '출장길에 처음 함께한 날. 낯선 소음 속에서도 손에 익은 무게가 든든했다.', image: visetosBackpack, isPublic: true },
    { id: 2, userProductId: 1, city: 'Seoul', country: 'Korea', place: '성수동', date: daysAgo(205), experienceType: 'Everyday', note: '매일 아침 출근길 동반자가 되었다. 이제는 무게가 느껴지지 않는다.', image: visetosBackpack, isPublic: false },
    { id: 3, userProductId: 1, city: 'Berlin', country: 'Germany', place: 'Museum Island', date: daysAgo(158), experienceType: 'New Beginning', note: '낯선 도시에서 새로운 프로젝트를 시작한 날. 처음의 마음을 기록해둔다.', image: visetosBackpack, isPublic: true },
    { id: 4, userProductId: 1, city: 'Seoul', country: 'Korea', place: '청담동, 친구의 결혼식', date: daysAgo(108), experienceType: 'Celebration', note: '소중한 순간에 함께했다. 사진 속에서도 자연스럽게 어울렸다.', image: visetosBackpack, isPublic: false },
    { id: 5, userProductId: 1, city: 'Osaka', country: 'Japan', place: '출장', date: daysAgo(32), experienceType: 'Work', note: '반복되는 출장길, 그래도 매번 새로운 도시의 공기를 담아온다.', image: visetosBackpack, isPublic: false },
    { id: 6, userProductId: 3, city: 'Seoul', country: 'Korea', place: '한남동', date: daysAgo(20), experienceType: 'Everyday', note: '중고로 만났지만 이제부터는 나의 Story.', image: millaTote, isPublic: false },
  ];

  // Story 본문은 AI가 생성한다 (POST /api/v1/ai/journey-story). 시드는 비워둔다.
  const stories = [];

  const nextStories = [
    { id: 1, userProductId: 1, ...NEXT_STORY_POOL[0], isSaved: false },
    { id: 2, userProductId: 1, ...NEXT_STORY_POOL[1], isSaved: false },
    { id: 3, userProductId: 1, ...NEXT_STORY_POOL[2], isSaved: true },
  ];

  const careRecords = [
    { id: 1, userProductId: 1, careType: '가죽 클리닝', storeName: 'MCM 청담 플래그십', status: 'completed', note: '모서리 마감 부분 클리닝 요청', requestedAt: daysAgo(95), completedAt: daysAgo(88) },
  ];

  return { userProducts, journeys, stories, nextStories, careRecords, nextStoryPool: NEXT_STORY_POOL };
}
