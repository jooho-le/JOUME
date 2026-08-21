import { useMemo, useState } from 'react';
import { useApp } from '../../state/AppState';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/format';

export const routeId = 'journey-archive';

export default function JourneyArchive({ navigate }) {
  const { currentJourneys, setSelectedJourneyId } = useApp();
  const [year, setYear] = useState('all');
  const [city, setCity] = useState('all');
  const [type, setType] = useState('all');

  const years = useMemo(() => [...new Set(currentJourneys.map((j) => j.date.slice(0, 4)))], [currentJourneys]);
  const cities = useMemo(() => [...new Set(currentJourneys.map((j) => j.city))], [currentJourneys]);
  const types = useMemo(() => [...new Set(currentJourneys.map((j) => j.experienceType))], [currentJourneys]);

  const filtered = currentJourneys.filter((j) =>
    (year === 'all' || j.date.startsWith(year)) &&
    (city === 'all' || j.city === city) &&
    (type === 'all' || j.experienceType === type)
  );

  const open = (id) => { setSelectedJourneyId(id); navigate('journey-detail'); };

  return (
    <main className="jm-page">
      <h1 className="jm-h1">모든 Journey를<br />한곳에서.</h1>

      {currentJourneys.length === 0 ? (
        <EmptyState title="아직 보관할 기록이 없어요" actionLabel="Add New Journey" onAction={() => navigate('add-journey')} />
      ) : (
        <>
          <div className="jm-filters">
            <div className="jm-filter-group"><span>YEAR</span>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="all">전체</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="jm-filter-group"><span>CITY</span>
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="all">전체</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="jm-filter-group"><span>TYPE</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="all">전체</option>
                {types.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="jm-archive-grid">
            {filtered.map((j) => (
              <div className="jm-journey-card" key={j.id} onClick={() => open(j.id)}>
                <img src={j.image} alt={j.city} />
                <div className="body">
                  <b>{j.city}</b>
                  <small>{formatDate(j.date)} · {j.experienceType}</small>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p style={{ color: '#999', fontSize: 13, marginTop: 20 }}>조건에 맞는 기록이 없습니다.</p>}
        </>
      )}
    </main>
  );
}
