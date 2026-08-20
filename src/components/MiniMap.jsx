import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CITY_COORDS } from '../data/dummy';

const pinIcon = L.divIcon({
  className: 'jm-leaflet-pin',
  html: '<span></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function MiniMap({ journeys, onSelectCity, wide }) {
  const el = useRef(null);
  const map = useRef(null);

  const cities = [...new Set(journeys.map((j) => j.city))];
  const plotted = cities.filter((c) => CITY_COORDS[c]);
  const plottedKey = plotted.join('|');

  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);

  useEffect(() => {
    if (!el.current || plotted.length === 0) return;

    if (!map.current) {
      map.current = L.map(el.current, {
        zoomControl: false, attributionControl: false, dragging: false,
        scrollWheelZoom: false, doubleClickZoom: false, touchZoom: false, boxZoom: false, keyboard: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map.current);
    }

    plotted.forEach((city) => {
      const marker = L.marker(CITY_COORDS[city], { icon: pinIcon }).addTo(map.current);
      marker.on('click', () => {
        const j = journeys.find((x) => x.city === city);
        if (j) onSelectCity?.(j.id);
      });
    });

    const bounds = L.latLngBounds(plotted.map((c) => CITY_COORDS[c]));
    if (plotted.length === 1) map.current.setView(bounds.getCenter(), 4);
    else map.current.fitBounds(bounds, { padding: [24, 24] });

    setTimeout(() => map.current?.invalidateSize(), 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plottedKey]);

  const cls = `jm-mini-map${wide ? ' wide' : ''}`;

  if (plotted.length === 0) {
    return <div className={`${cls} jm-mini-map-empty`}><span>지도에 표시할 좌표가 없어요</span></div>;
  }

  return <div className={cls} ref={el} />;
}
