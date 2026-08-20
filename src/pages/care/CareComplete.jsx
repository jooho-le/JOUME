import { useEffect } from 'react';
import { useApp } from '../../state/AppState';
import { formatDate } from '../../utils/format';

export const routeId = 'care-complete';

export default function CareComplete({ navigate }) {
  const { selectedCare, completeCare } = useApp();

  useEffect(() => {
    if (selectedCare && selectedCare.status !== 'completed') {
      completeCare(selectedCare.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCare?.id]);

  if (!selectedCare) {
    navigate('care-home');
    return null;
  }

  return (
    <main className="jm-page">
      <div className="jm-complete">
        <div className="check">✓</div>
        <h2>{selectedCare.careType} 요청이 접수됐습니다.</h2>
        <p>{selectedCare.storeName}</p>
        <p>{formatDate(selectedCare.completedAt || selectedCare.requestedAt)}</p>
        <div className="jm-actions">
          <button className="jm-btn primary" onClick={() => navigate('care-history')}>Care History 보기</button>
          <button className="jm-btn secondary" onClick={() => navigate('journey-timeline')}>Add to Journey Timeline</button>
        </div>
      </div>
    </main>
  );
}
