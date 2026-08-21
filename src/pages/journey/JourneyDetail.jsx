import { useApp } from '../../state/AppState';
import { formatDate } from '../../utils/format';

export const routeId = 'journey-detail';

export default function JourneyDetail({ navigate }) {
  const { selectedJourney, currentProduct } = useApp();
  if (!selectedJourney) {
    navigate('journey-timeline');
    return null;
  }
  const j = selectedJourney;

  return (
    <main className="jm-page">
      <div className="jm-jdetail">
        <img src={j.image} alt={j.city} />
        <div>
          <h1 className="jm-h1" style={{ fontSize: 32 }}>{j.city}{j.place ? ` · ${j.place}` : ''}</h1>
          <div className="jm-table">
            <div><span>DATE</span><span>{formatDate(j.date)}</span></div>
            <div><span>EXPERIENCE</span><span>{j.experienceType}</span></div>
            <div><span>PRODUCT</span><span>{currentProduct?.name}</span></div>
          </div>
          {j.note && <p className="jm-jdetail-note">"{j.note}"</p>}
          <div className="jm-actions">
            <button className="jm-btn primary" onClick={() => navigate('ai-journey-story')}>연결된 AI Story 보기</button>
            <button className="jm-btn secondary" onClick={() => navigate('journey-timeline')}>Back to Timeline</button>
          </div>
        </div>
      </div>
    </main>
  );
}
