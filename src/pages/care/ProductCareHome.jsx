import { useApp } from '../../state/AppState';
import ProductCarousel from '../../components/ProductCarousel';

export const routeId = 'care-home';

function getCondition(stats, careRecords) {
  const lastCompleted = careRecords.find((c) => c.status === 'completed');
  if (lastCompleted) {
    const daysSince = Math.max(0, Math.round((Date.now() - new Date(lastCompleted.completedAt)) / 86400000));
    if (daysSince < 120) return { label: '양호', detail: `${lastCompleted.careType} 케어 후 ${daysSince}일 경과했습니다.` };
  }
  if (stats.days > 200) return { label: '정기 점검 권장', detail: `등록 후 ${stats.days}일째, 전체 컨디션 점검을 추천합니다.` };
  return { label: '양호', detail: '특별한 관리가 필요하지 않은 상태입니다.' };
}

export default function ProductCareHome({ navigate }) {
  const { currentProduct, currentCareRecords, stats } = useApp();
  if (!currentProduct) return null;

  const condition = getCondition(stats, currentCareRecords);
  const latestCare = currentCareRecords[0];

  return (
    <main className="jm-page">
      <div className="jm-page-head-row">
        <div>
          <h1 className="jm-h1">오래 함께하기 위한 관리.</h1>
          <p className="jm-lede" style={{ maxWidth: 'none' }}>어떤 제품을 관리하시겠습니까? 제품을 선택하면 아래 정보가 해당 제품 기준으로 바뀝니다.</p>
        </div>
        <button className="jm-btn primary" onClick={() => navigate('care-request')}>Request Care</button>
      </div>

      <ProductCarousel centered />

      <div className="jm-care-grid">
        <div className="jm-card jm-care-card">
          <span className="jm-eyebrow">제품 상태</span>
          <b className="jm-care-card-value">{condition.label}</b>
          <p>{condition.detail}</p>
        </div>

        <div className="jm-card jm-care-card">
          <span className="jm-eyebrow">관리 가이드</span>
          <p>{currentProduct.careSummary}</p>
          <button className="jm-btn ghost" onClick={() => navigate('care-guide')}>Care Guide 보기 →</button>
        </div>

        <div className="jm-card jm-care-card">
          <span className="jm-eyebrow">최근 Care 기록</span>
          {latestCare ? (
            <>
              <b className="jm-care-card-value" style={{ fontSize: 16 }}>{latestCare.careType}</b>
              <p>{latestCare.storeName} · {latestCare.status === 'completed' ? '완료' : '진행중'}</p>
            </>
          ) : (
            <p>아직 Care 기록이 없습니다.</p>
          )}
          <button className="jm-btn ghost" onClick={() => navigate('care-history')}>전체 기록 보기 →</button>
        </div>
      </div>
    </main>
  );
}
