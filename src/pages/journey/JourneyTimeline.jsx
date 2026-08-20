import { useApp } from '../../state/AppState';
import ProductBar from '../../components/ProductBar';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/format';

export const routeId = 'journey-timeline';

export default function JourneyTimeline({ navigate }) {
  const { currentJourneys, currentCareRecords, setSelectedJourneyId } = useApp();

  const items = [
    ...currentJourneys.map((j) => ({ type: 'journey', date: j.date, data: j })),
    ...currentCareRecords.map((c) => ({ type: 'care', date: c.completedAt || c.requestedAt, data: c })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const openJourney = (id) => { setSelectedJourneyId(id); navigate('journey-detail'); };

  return (
    <main className="jm-page">
      <ProductBar navigate={navigate} />
      <h1 className="jm-h1">모든 경험이<br />시간순 Story가 됩니다.</h1>

      {items.length === 0 ? (
        <EmptyState title="기록이 없어요" body="첫 Journey를 추가하면 시간순으로 이곳에 쌓입니다." actionLabel="Add New Journey" onAction={() => navigate('add-journey')} />
      ) : (
        <>
          <div className="jm-timeline">
            {items.map((item) => item.type === 'journey' ? (
              <div className="jm-timeline-item" key={`j${item.data.id}`} onClick={() => openJourney(item.data.id)}>
                <time>{formatDate(item.date)}</time>
                <img src={item.data.image} alt={item.data.city} />
                <div>
                  <h4>{item.data.city}, {item.data.country}</h4>
                  <p>{item.data.place}</p>
                  <span className="jm-tag">{item.data.experienceType}</span>
                </div>
              </div>
            ) : (
              <div className="jm-timeline-item" key={`c${item.data.id}`} onClick={() => navigate('care-history')}>
                <time>{formatDate(item.date)}</time>
                <div />
                <div>
                  <h4>공식 Product Care · {item.data.careType}</h4>
                  <p>{item.data.storeName}</p>
                  <span className="jm-tag" style={{ borderColor: '#999', color: '#777' }}>{item.data.status === 'completed' ? '완료' : '진행중'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="jm-actions">
            <button className="jm-btn primary" onClick={() => navigate('ai-journey-story')}>Create AI Story →</button>
            <button className="jm-btn secondary" onClick={() => navigate('journey-archive')}>Journey Archive</button>
          </div>
        </>
      )}
    </main>
  );
}
