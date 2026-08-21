import { useState } from 'react';
import { EXPERIENCE_TYPES, CITIES } from '../../data/dummy';

export const routeId = 'start-story';

export default function StartStory({ navigate }) {
  const [experience, setExperience] = useState('Everyday');
  const [city, setCity] = useState(CITIES[0]);

  return (
    <main className="jm-page">
      <h1 className="jm-h1">이 제품과 어떤<br />이야기를 시작할까요?</h1>

      <div className="jm-onboard-section">
        <h3>주로 어떤 경험에 사용하나요?</h3>
        <div className="jm-chip-row">
          {EXPERIENCE_TYPES.map((x) => (
            <button key={x} className={`jm-chip${experience === x ? ' active' : ''}`} onClick={() => setExperience(x)}>{x}</button>
          ))}
        </div>
      </div>

      <div className="jm-onboard-section">
        <h3>관심 있는 도시</h3>
        <label className="jm-field" style={{ maxWidth: 320 }}>
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
      </div>

      <div className="jm-actions">
        <button className="jm-btn primary" onClick={() => navigate('story-home')}>Start My Story →</button>
      </div>
    </main>
  );
}
