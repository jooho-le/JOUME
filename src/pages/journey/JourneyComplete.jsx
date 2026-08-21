import { useApp } from '../../state/AppState';
import { formatDate } from '../../utils/format';

export const routeId = 'journey-complete';

export default function JourneyComplete({ navigate }) {
  const { selectedJourney } = useApp();
  if (!selectedJourney) {
    navigate('story-home');
    return null;
  }

  return (
    <main className="jm-page">
      <div className="jm-complete">
        <div className="check">✓</div>
        <img src={selectedJourney.image} alt={selectedJourney.city} />
        <h2>{selectedJourney.city}이(가) Story에 추가되었습니다.</h2>
        <p>{selectedJourney.place ? `${selectedJourney.place} · ` : ''}{formatDate(selectedJourney.date)}</p>
        <p>{selectedJourney.experienceType}</p>
        <div className="jm-actions">
          <button className="jm-btn primary" onClick={() => navigate('story-home')}>View My Story</button>
          <button className="jm-btn secondary" onClick={() => navigate('add-journey')}>Add Another Journey</button>
        </div>
      </div>
    </main>
  );
}
