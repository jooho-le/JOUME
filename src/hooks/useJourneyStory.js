import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

// 서버 스키마 상한: 기록 30건, note 500자. 넘으면 422가 나므로 여기서 맞춰 보낸다.
const MAX_JOURNEYS = 30;
const MAX_NOTE = 500;
// 백엔드가 최악 24초(12s x 2회)까지 매달릴 수 있어 그보다 넉넉히 잡는다.
const TIMEOUT_MS = 30000;

// 같은 (제품, 기록 집합)에 대해서는 한 번만 호출한다. 기록이 늘어나면 다시 생성한다.
export function useJourneyStory({ product, journeys, enabled = true }) {
  const [state, setState] = useState({ status: 'idle', story: null, error: null });
  const requested = useRef(null);

  const key = product && journeys.length
    ? `${product.id}:${journeys.map((j) => j.id).join(',')}`
    : null;

  useEffect(() => {
    if (!enabled || !key || requested.current === key) return;
    requested.current = key;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    setState({ status: 'loading', story: null, error: null });

    api.aiJourneyStory({
      product_name: product.name,
      product_collection: product.collection ?? '',
      journeys: [...journeys]
        .sort((a, b) => (a.date < b.date ? -1 : 1)) // 오래된 순으로 보낸다
        .slice(-MAX_JOURNEYS) // 30건을 넘으면 최근 기록을 남긴다
        .map((j) => ({
          city: j.city,
          country: j.country ?? '',
          place: j.place ?? '',
          date: j.date,
          experience_type: j.experienceType ?? '',
          note: (j.note ?? '').slice(0, MAX_NOTE),
        })),
    }, controller.signal)
      .then((story) => {
        clearTimeout(timer);
        // 요청이 다른 키로 교체됐으면 버린다. (cancelled 플래그를 쓰면
        // 재실행이 requested 가드에 막혀 loading 에 갇히므로 키로 비교한다.)
        if (requested.current !== key) return;
        if (story?.source !== 'llm') {
          console.warn('[AI Story] LLM 실패 — 규칙 기반으로 대체됨. 백엔드 터미널 로그를 확인하세요.');
        }
        setState({ status: 'ready', story, error: null });
      })
      .catch((error) => {
        clearTimeout(timer);
        if (requested.current !== key) return;
        requested.current = null; // 실패한 키는 풀어서 재시도 가능하게 둔다
        const message = error.name === 'AbortError'
          ? `${TIMEOUT_MS / 1000}초 안에 응답이 없어 중단했습니다.`
          : error.message;
        console.warn('[AI Story] 호출 실패:', message);
        setState({ status: 'error', story: null, error: message });
      });

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  return state;
}
