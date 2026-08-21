import { useApp } from '../../state/AppState';
import { BRAND_CONTENT, CITY_PHOTOS } from '../../data/dummy';

export const routeId = 'next-story-detail';

export default function NextStoryDetail({ navigate }) {
  const { selectedNext, currentJourneys, saveNextStory } = useApp();

  if (!selectedNext) {
    navigate('next-story');
    return null;
  }

  const content = BRAND_CONTENT.find((c) => c.city === selectedNext.city || c.city.startsWith(selectedNext.city));
  const relatedCities = [...new Set(currentJourneys.map((j) => j.city))];
  const photo = CITY_PHOTOS[selectedNext.city];

  const save = () => {
    saveNextStory(selectedNext.id, true);
    navigate('my-products');
  };

  return (
    <main className="jm-page">
      <div className="jm-next-hero" style={photo ? { backgroundImage: `url(${photo})` } : undefined}>
        <div className="shade" />
        <span className="jm-tag">{selectedNext.theme}</span>
        <h1>{selectedNext.city}</h1>
      </div>

      <div className="jm-next-detail-grid">
        <div className="jm-reason-list">
          <div className="r">
            <span className="jm-eyebrow">추천 이유</span>
            <p>{selectedNext.reason}</p>
          </div>
          <div className="r">
            <span className="jm-eyebrow">기존 Story와 연결점</span>
            <p>지금까지 {relatedCities.join(', ')}을(를) 기록해왔어요. 이 흐름이 {selectedNext.city}로 자연스럽게 이어질 수 있습니다.</p>
          </div>
          <div className="r">
            <span className="jm-eyebrow">만들 수 있는 Story</span>
            <p>{selectedNext.theme} 테마로 {selectedNext.city}에서의 첫 순간을 기록하면, AI가 지금까지의 여정과 이어 하나의 새로운 챕터로 정리해드립니다.</p>
          </div>
        </div>

        <div className="jm-next-detail-side">
          {content ? (
            <>
              <span className="jm-eyebrow">관련 콘텐츠</span>
              <b>{content.title}</b>
              <p>{content.body}</p>
              <small>{content.program}</small>
              <button className="jm-btn ghost" onClick={() => navigate('brand-content')}>콘텐츠 자세히 보기 →</button>
            </>
          ) : (
            <>
              <span className="jm-eyebrow">관련 활동</span>
              <b>MCM Experience 살펴보기</b>
              <p>{selectedNext.city}에서 방문할 수 있는 매장과 브랜드 콘텐츠를 확인해보세요.</p>
              <button className="jm-btn ghost" onClick={() => navigate('experience-recommendation')}>MCM Experience 보기 →</button>
            </>
          )}
        </div>
      </div>

      <div className="jm-actions">
        <button className="jm-btn primary" onClick={save}>Make This My Next Story</button>
        <button className="jm-btn secondary" onClick={() => navigate('next-story')}>다른 추천 보기</button>
      </div>
    </main>
  );
}
