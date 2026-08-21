import { useApp } from '../../state/AppState';
import EmptyState from '../../components/EmptyState';

export const routeId = 'story-card';

const LEVELS = [
  { id: 'public', label: '공개', desc: '#MyMCMJourney 피드에 노출됩니다.' },
  { id: 'partial', label: '일부 공개', desc: '도시와 제품만 노출, 개인 메모는 비공개.' },
  { id: 'private', label: '비공개', desc: 'My Story Archive에만 보관됩니다.' },
];

export default function JourneyStoryCard({ navigate }) {
  const { currentStory, currentProduct, currentJourneys, saveStory } = useApp();

  if (!currentStory) {
    return (
      <main className="jm-page">
        <h1 className="jm-h1">#MyMCMJourney</h1>
        <EmptyState title="아직 생성된 Story가 없어요" actionLabel="AI Story 만들기" onAction={() => navigate('ai-journey-story')} />
      </main>
    );
  }

  const cities = [...new Set(currentJourneys.map((j) => j.city))];
  const setVisibility = (level) => saveStory(currentStory.id, { visibility: level, isPublic: level === 'public' });

  return (
    <main className="jm-page">
      <h1 className="jm-h1">공유 가능한<br />Story Card.</h1>

      <div className="jm-sharecard">
        <div className="jm-share-visual">
          <img src={currentProduct.image} alt={currentProduct.name} />
          <span>#MyMCMJourney</span>
          <h3>{currentStory.title}</h3>
          <p style={{ fontSize: 12, color: '#ddd' }}>{cities.join(' · ')}</p>
        </div>
        <div>
          <p className="jm-lede">{currentStory.content}</p>
          <h3 style={{ fontSize: 13, letterSpacing: '.08em', color: '#888', margin: '28px 0 10px', fontFamily: "'IBM Plex Mono'" }}>공개 범위</h3>
          <div className="jm-visibility">
            {LEVELS.map((lv) => (
              <label key={lv.id} className={currentStory.visibility === lv.id ? 'active' : ''}>
                <input type="radio" name="visibility" checked={currentStory.visibility === lv.id} onChange={() => setVisibility(lv.id)} />
                <span><b>{lv.label}</b> — {lv.desc}</span>
              </label>
            ))}
          </div>
          <div className="jm-actions">
            <button className="jm-btn primary" onClick={() => navigate('community-feed')}>Share</button>
            <button className="jm-btn secondary" onClick={() => navigate('my-story-archive')}>My Story Archive</button>
          </div>
        </div>
      </div>
    </main>
  );
}
