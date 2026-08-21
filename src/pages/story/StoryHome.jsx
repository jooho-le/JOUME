import { useApp } from '../../state/AppState';
import ProductBar from '../../components/ProductBar';
import EmptyState from '../../components/EmptyState';
import MiniMap from '../../components/MiniMap';
import { formatDate } from '../../utils/format';

export const routeId = 'story-home';

function buildSummary(product, journeys) {
  const cities = [...new Set(journeys.map((j) => j.city))];
  return `${cities.join(' → ')}를 지나 지금 이곳까지, ${product.name}과 함께한 이야기가 이어지고 있어요.`;
}

export default function StoryHome({ navigate }) {
  const { user, currentProduct, currentJourneys, stats, currentNextStories, currentCareRecords, userProducts, setSelectedJourneyId } = useApp();
  if (!currentProduct) return null;

  const openJourney = (id) => { setSelectedJourneyId(id); navigate('journey-detail'); };
  const recent = currentJourneys.slice(0, 4);
  const latestCare = currentCareRecords[0];
  const topNext = currentNextStories.find((n) => !n.isSaved) || currentNextStories[0];

  return (
    <main className="jm-page">
      <ProductBar navigate={navigate} />

      <div className="jm-page-head-row">
        <div>
          <span className="jm-eyebrow">안녕하세요, {user.name}님</span>
          <h1 className="jm-h1">나와 {currentProduct.name}이<br />함께 만든 Story.</h1>
        </div>
        <div className="jm-own-chip"><span>보유 제품</span><b>{userProducts.length}</b></div>
      </div>

      <div className="jm-dash">
        <div><span>DAYS TOGETHER</span><strong>{stats.days}</strong></div>
        <div><span>JOURNEYS</span><strong>{String(stats.journeyCount).padStart(2, '0')}</strong></div>
        <div><span>CITIES</span><strong>{String(stats.cityCount).padStart(2, '0')}</strong></div>
      </div>

      {stats.journeyCount === 0 ? (
        <EmptyState
          eyebrow="아직 기록된 Journey가 없어요"
          title="첫 Journey를 추가해보세요"
          body={`${currentProduct.name}과 함께한 첫 순간을 기록하면, 이곳에서 Story로 이어집니다.`}
          actionLabel="Add New Journey"
          onAction={() => navigate('add-journey')}
        />
      ) : (
        <>
          <div className="jm-narrative-dash">
            <div className="panel">
              <span className="jm-eyebrow">STORY SUMMARY</span>
              <h3>지금까지 {stats.days}일 동안<br />{stats.journeyCount}개의 순간을 기록했어요.</h3>
              <p>{buildSummary(currentProduct, currentJourneys)}</p>
              <button className="jm-btn ghost" onClick={() => navigate('ai-journey-story')}>내 스토리 보기 →</button>
            </div>
            <div className="panel dark">
              <span className="jm-eyebrow" style={{ color: '#f3a178' }}>NEXT CHAPTER</span>
              {topNext ? (
                <>
                  <h3>{topNext.city}</h3>
                  <p>{topNext.reason}</p>
                </>
              ) : (
                <>
                  <h3>다음 이야기를 준비 중이에요</h3>
                  <p>기록이 쌓이면 AI가 다음 여정을 제안해드립니다.</p>
                </>
              )}
              <button className="jm-btn ghost" onClick={() => navigate('next-story')}>추천 상세 보기 →</button>
            </div>
          </div>

          <div className="jm-section-head">
            <h3>Journey Map</h3>
            <button className="jm-btn ghost" onClick={() => navigate('journey-map')}>전체 지도 보기 →</button>
          </div>
          <MiniMap journeys={currentJourneys} onSelectCity={openJourney} wide />

          <div className="jm-care-summary-card">
            <div>
              <span className="jm-eyebrow" style={{ marginBottom: 6 }}>PRODUCT CARE</span>
              <b>{latestCare ? latestCare.careType : '현재 관리 이력이 없습니다'}</b>
              <p>{latestCare ? `${latestCare.storeName} · ${latestCare.status === 'completed' ? '완료' : '진행중'}` : '상태를 점검하고 관리 가이드를 확인해보세요.'}</p>
            </div>
            <button className="jm-btn secondary" onClick={() => navigate('care-home')}>Product Care →</button>
          </div>

          <div className="jm-section-head">
            <h3>Recent Journey</h3>
            <button className="jm-btn ghost" onClick={() => navigate('journey-timeline')}>전체 보기 →</button>
          </div>
          <div className="jm-journey-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {recent.map((j) => (
              <div className="jm-journey-card" key={j.id} onClick={() => openJourney(j.id)}>
                <img src={j.image} alt={j.city} />
                <div className="body">
                  <b>{j.city}, {j.country}</b>
                  <small>{formatDate(j.date)} · {j.experienceType}</small>
                </div>
              </div>
            ))}
            <div className="jm-journey-card add" onClick={() => navigate('add-journey')}>＋</div>
          </div>
        </>
      )}
    </main>
  );
}
