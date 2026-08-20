import { useEffect } from 'react';
import { useApp } from '../../state/AppState';
import { useJourneyStory } from '../../hooks/useJourneyStory';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/format';
import { getProduct } from '../../data/dummy';

export const routeId = 'ai-journey-story';

function buildSummary(product, journeys) {
  const cities = [...new Set(journeys.map((j) => j.city))];
  const types = [...new Set(journeys.map((j) => j.experienceType))];
  const cityList = cities.join(', ');
  const typeList = types.join(' · ');
  return {
    title: `${cities[0]} to ${cities[cities.length - 1]}`,
    content: `${cityList}을(를) 지나며 ${product.name}은(는) 당신의 ${typeList} 순간을 가장 가까이에서 지켜봤습니다. ${journeys.length}번의 기록이 쌓이는 동안, 하나의 물건은 여러 도시의 공기를 담은 하나의 Story가 되었습니다.`,
  };
}

export default function AIJourneyStory({ navigate }) {
  const { currentProduct, currentJourneys, currentStory, generateStory, saveStory, currentUserProductId, currentNextStories } = useApp();

  // 저장된 Story가 없을 때만 AI를 부른다.
  const needsStory = !currentStory && currentJourneys.length > 0 && !!currentProduct;
  const { status, story } = useJourneyStory({
    product: currentProduct,
    journeys: currentJourneys,
    enabled: needsStory,
  });

  useEffect(() => {
    if (!needsStory) return;
    if (story) {
      generateStory(currentUserProductId, story.content, story.title);
    } else if (status === 'error') {
      // API가 죽어도 화면은 채운다.
      const { title, content } = buildSummary(currentProduct, currentJourneys);
      generateStory(currentUserProductId, content, title);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story, status, needsStory, currentUserProductId]);

  if (currentJourneys.length === 0) {
    return (
      <main className="jm-page">
        <h1 className="jm-h1">Your Story with MCM.</h1>
        <EmptyState title="아직 정리할 Journey가 없어요" body="Journey를 먼저 기록하면 AI가 하나의 Story로 정리해드립니다." actionLabel="Add New Journey" onAction={() => navigate('add-journey')} />
      </main>
    );
  }

  const cities = [...new Set(currentJourneys.map((j) => j.city))];
  const types = [...new Set(currentJourneys.map((j) => j.experienceType))];
  const isWriting = needsStory && (status === 'loading' || status === 'idle');

  return (
    <main className="jm-page">
      <div className="jm-ai-hero">
        <span>{isWriting ? 'AI IS WRITING' : 'AI SUMMARY'}</span>
        {isWriting ? (
          <>
            <div className="jm-ai-skeleton title" />
            <div className="jm-ai-skeleton line" />
            <div className="jm-ai-skeleton line short" />
          </>
        ) : (
          <>
            <h2>{currentStory?.title}</h2>
            <p>{currentStory?.content}</p>
          </>
        )}
        <div className="jm-ai-meta">
          <div>CITIES<b>{cities.join(', ')}</b></div>
          <div>EXPERIENCE<b>{types.join(' · ')}</b></div>
          <div>ENTRIES<b>{currentJourneys.length}</b></div>
        </div>
      </div>

      <div className="jm-timeline">
        {currentJourneys.map((j) => (
          <div className="jm-timeline-item" key={j.id} style={{ cursor: 'default' }}>
            <time>{formatDate(j.date)}</time>
            <img src={j.image} alt={j.city} />
            <div>
              <h4>{j.city}, {j.country}</h4>
              <p>{j.note}</p>
            </div>
          </div>
        ))}
      </div>

      {currentNextStories.length > 0 && (
        <>
          <div className="jm-section-head">
            <h3>이 Story와 어울리는 제품</h3>
          </div>
          <div className="jm-fit-products">
            {currentNextStories.slice(0, 2).map((n) => {
              const product = getProduct(n.productId);
              return (
                <div className="jm-fit-card" key={n.id}>
                  <img src={product.image} alt={product.name} />
                  <div>
                    <span className="jm-tag">{n.city}</span>
                    <b>{product.name}</b>
                    <p>"{n.productReason || n.reason}"</p>
                    <button className="jm-btn secondary" onClick={() => navigate('store-detail')}>Store에서 보기 →</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="jm-actions">
        <button className="jm-btn primary" disabled={isWriting} onClick={() => { saveStory(currentStory.id, { isSaved: true }); navigate('my-story-archive'); }}>Save Story</button>
        <button className="jm-btn secondary" disabled={isWriting} onClick={() => navigate('story-card')}>Share Story</button>
        <button className="jm-btn secondary" onClick={() => navigate('next-story')}>Discover Next Story</button>
      </div>
    </main>
  );
}
