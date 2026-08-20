import { useApp } from '../../state/AppState';
import ProductBar from '../../components/ProductBar';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/format';

export const routeId = 'care-history';

export default function CareHistory({ navigate }) {
  const { currentCareRecords } = useApp();

  return (
    <main className="jm-page">
      <ProductBar navigate={navigate} />
      <h1 className="jm-h1">공식 수선도<br />Journey의 일부입니다.</h1>

      {currentCareRecords.length === 0 ? (
        <EmptyState title="아직 Care 기록이 없어요" body="공식 Care를 요청하면 이곳에 이력이 쌓입니다." actionLabel="Request Care" onAction={() => navigate('care-request')} />
      ) : (
        <>
          <div className="jm-timeline">
            {currentCareRecords.map((c) => (
              <div className="jm-timeline-item" key={c.id} style={{ gridTemplateColumns: '120px 1fr', cursor: 'default' }}>
                <time>{formatDate(c.completedAt || c.requestedAt)}</time>
                <div>
                  <h4>{c.careType}</h4>
                  <p>{c.storeName}{c.note ? ` · ${c.note}` : ''}</p>
                  <span className="jm-tag" style={c.status !== 'completed' ? { borderColor: '#999', color: '#777' } : undefined}>
                    {c.status === 'completed' ? '완료' : '진행중'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="jm-actions">
            <button className="jm-btn secondary" onClick={() => navigate('journey-timeline')}>View Journey Timeline</button>
          </div>
        </>
      )}
    </main>
  );
}
