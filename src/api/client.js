const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
const TOKEN_KEY = 'mcm_archive_token';

export const authToken = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  const token = authToken.get();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || '요청을 처리하지 못했습니다.');
  return data;
}

const json = (method, body) => ({ method, body: JSON.stringify(body) });

export const api = {
  signup: (data) => request('/auth/signup', json('POST', data)).then(saveLogin),
  login: (data) => request('/auth/login', json('POST', data)).then(saveLogin),
  me: () => request('/me'),
  updateMe: (data) => request('/me', json('PATCH', data)),
  products: () => request('/products'),
  passport: (sku) => request(`/products/passport/${encodeURIComponent(sku)}`),
  myProducts: () => request('/me/products'),
  registerProduct: (data) => request('/me/products', json('POST', data)),
  selectProduct: (id) => request(`/me/products/${id}/current`, { method: 'PATCH' }),
  journeys: (productId) => request(`/journeys${productId ? `?user_product_id=${productId}` : ''}`),
  journey: (id) => request(`/journeys/${id}`),
  createJourney: (data) => request('/journeys', json('POST', data)),
  updateJourney: (id, data) => request(`/journeys/${id}`, json('PATCH', data)),
  deleteJourney: (id) => request(`/journeys/${id}`, { method: 'DELETE' }),
  mapJourneys: () => request('/journeys/map'),
  generateStory: (productId) => request(`/stories/generate/${productId}`, { method: 'POST' }),
  stories: (savedOnly = false) => request(`/stories?saved_only=${savedOnly}`),
  updateStory: (id, data) => request(`/stories/${id}`, json('PATCH', data)),
  generateNextStory: (productId) => request(`/next-stories/generate/${productId}`, { method: 'POST' }),
  nextStories: (savedOnly = false) => request(`/next-stories?saved_only=${savedOnly}`),
  toggleNextStory: (id) => request(`/next-stories/${id}/save`, { method: 'PATCH' }),
  careHistory: (productId) => request(`/care${productId ? `?user_product_id=${productId}` : ''}`),
  requestCare: (data) => request('/care', json('POST', data)),
  completeCare: (id) => request(`/care/${id}/complete`, { method: 'PATCH' }),
  community: (city) => request(`/community/journeys${city ? `?city=${encodeURIComponent(city)}` : ''}`),
  upload: (file) => { const body = new FormData(); body.append('file', file); return request('/uploads', { method: 'POST', body }); },
};

function saveLogin(result) {
  authToken.set(result.access_token);
  return result;
}
