export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}.${m}.${d}`;
}

// Deterministic pseudo map position for a city name, kept stable across renders.
export function pinPosition(city) {
  let hash = 0;
  for (let i = 0; i < city.length; i++) hash = (hash * 31 + city.charCodeAt(i)) >>> 0;
  const left = 12 + (hash % 76);
  const top = 15 + ((hash >> 8) % 70);
  return { left: `${left}%`, top: `${top}%` };
}
