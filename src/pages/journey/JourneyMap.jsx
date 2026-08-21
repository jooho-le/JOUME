import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../../state/AppState';
import ProductBar from '../../components/ProductBar';
import EmptyState from '../../components/EmptyState';
import { CITY_COORDS, CITY_REGION, REGIONS } from '../../data/dummy';
import { formatDate } from '../../utils/format';

export const routeId = 'journey-map';

const pinIcon = L.divIcon({
  className: 'jm-leaflet-pin',
  html: '<span></span>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function JourneyMap({ navigate }) {
  const { currentJourneys, setSelectedJourneyId } = useApp();
  const [region, setRegion] = useState('전체');
  const mapEl = useRef(null);
  const map = useRef(null);
  const markersByCity = useRef({});

  const allCities = [...new Set(currentJourneys.map((j) => j.city))];
  const cities = region === '전체' ? allCities : allCities.filter((c) => (CITY_REGION[c] || '기타') === region);
  const plotted = cities.filter((c) => CITY_COORDS[c]);
  const plottedKey = plotted.join('|');

  const cityCards = cities.map((city, i) => {
    const entries = currentJourneys.filter((j) => j.city === city).sort((a, b) => (a.date < b.date ? 1 : -1));
    return { index: i + 1, city, latest: entries[0], count: entries.length };
  });

  const openCity = (city) => {
    const journey = currentJourneys.find((j) => j.city === city);
    if (journey) { setSelectedJourneyId(journey.id); navigate('journey-detail'); }
  };

  const focusCity = (city) => {
    const marker = markersByCity.current[city];
    if (!marker || !map.current) return;
    map.current.flyTo(CITY_COORDS[city], Math.max(map.current.getZoom(), 6), { duration: 0.6 });
    Object.values(markersByCity.current).forEach((m) => m.getElement()?.classList.remove('active'));
    marker.getElement()?.classList.add('active');
  };

  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);

  useEffect(() => {
    if (!mapEl.current || plotted.length === 0) return;

    if (!map.current) {
      map.current = L.map(mapEl.current, { zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map.current);
    }

    Object.values(markersByCity.current).forEach((m) => m.remove());
    markersByCity.current = {};
    plotted.forEach((city) => {
      const marker = L.marker(CITY_COORDS[city], { icon: pinIcon }).addTo(map.current);
      marker.bindTooltip(city, { direction: 'top', offset: [0, -6] });
      marker.on('click', () => openCity(city));
      markersByCity.current[city] = marker;
    });

    const bounds = L.latLngBounds(plotted.map((c) => CITY_COORDS[c]));
    if (plotted.length === 1) map.current.setView(bounds.getCenter(), 5);
    else map.current.fitBounds(bounds, { padding: [48, 48] });

    setTimeout(() => map.current?.invalidateSize(), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plottedKey]);

  return (
    <main className="jm-page">
      <ProductBar navigate={navigate} />

      <div className="jm-page-head-row">
        <h1 className="jm-h1">제품과 지나온 도시를<br />지도에서 확인하세요.</h1>
        {allCities.length > 0 && <button className="jm-btn primary" onClick={() => navigate('add-journey')}>＋ 여정 추가하기</button>}
      </div>

      {allCities.length === 0 ? (
        <EmptyState title="아직 지도에 표시할 기록이 없어요" body="Journey를 추가하면 방문한 도시가 지도에 표시됩니다." actionLabel="Add New Journey" onAction={() => navigate('add-journey')} />
      ) : (
        <>
          <div className="jm-chip-row" style={{ margin: '24px 0' }}>
            {REGIONS.map((r) => (
              <button key={r} className={`jm-chip${region === r ? ' active' : ''}`} onClick={() => setRegion(r)}>{r}</button>
            ))}
          </div>

          <div className="jm-map hero" ref={mapEl} />

          <div className="jm-city-grid">
            {cityCards.map(({ index, city, latest, count }) => (
              <div
                className="jm-city-card"
                key={city}
                onMouseEnter={() => focusCity(city)}
                onFocus={() => focusCity(city)}
                onClick={() => openCity(city)}
                tabIndex={0}
              >
                <span className="num">{String(index).padStart(2, '0')}</span>
                <img src={latest.image} alt={city} />
                <div className="info">
                  <div className="city">{city}</div>
                  <div className="sub">{formatDate(latest.date)} · {count}개 기록</div>
                </div>
              </div>
            ))}
          </div>

          <div className="jm-actions">
            <button className="jm-btn secondary" onClick={() => navigate('journey-timeline')}>Journey Timeline →</button>
          </div>
        </>
      )}
    </main>
  );
}
