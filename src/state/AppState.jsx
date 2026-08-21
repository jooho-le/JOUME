import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEMO_USER, PRODUCTS, buildSeedState, getProduct, nextId } from '../data/dummy';

export const STORAGE_KEY = 'joume-app-state-v1';
const AppStateContext = createContext(null);

// Snapshots saved before the login flag existed have no isLoggedIn field — treat anyone
// who already has owned products as logged in rather than bouncing them back to landing.
function deriveIsLoggedIn(snapshot) {
  if (snapshot.isLoggedIn !== undefined) return !!snapshot.isLoggedIn;
  return (snapshot.userProducts?.length ?? 0) > 0;
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.isLoggedIn = deriveIsLoggedIn(parsed);
      return parsed;
    }
  } catch {
    /* fall through to seed */
  }
  return buildSeedState();
}

// Read outside of React (before AppStateProvider mounts) so App.jsx can pick the first route.
export function readIsLoggedIn() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return deriveIsLoggedIn(JSON.parse(raw));
  } catch {
    /* fall through */
  }
  return false;
}

export function AppStateProvider({ children }) {
  const [user, setUser] = useState(DEMO_USER);
  const [seed] = useState(loadInitial);
  const [userProducts, setUserProducts] = useState(seed.userProducts);
  const [journeys, setJourneys] = useState(seed.journeys);
  const [stories, setStories] = useState(seed.stories);
  const [nextStories, setNextStories] = useState(seed.nextStories);
  const [careRecords, setCareRecords] = useState(seed.careRecords);
  const [currentUserProductId, setCurrentUserProductId] = useState(
    () => seed.userProducts.find((p) => p.isCurrent)?.id ?? seed.userProducts[0]?.id
  );
  const [selectedJourneyId, setSelectedJourneyId] = useState(null);
  const [selectedCareId, setSelectedCareId] = useState(null);
  const [selectedNextId, setSelectedNextId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => seed.isLoggedIn ?? false);

  useEffect(() => {
    const snapshot = { userProducts, journeys, stories, nextStories, careRecords, isLoggedIn };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  }, [userProducts, journeys, stories, nextStories, careRecords, isLoggedIn]);

  const login = useCallback(() => setIsLoggedIn(true), []);

  const selectProduct = useCallback((userProductId) => {
    setCurrentUserProductId(userProductId);
    setUserProducts((all) => all.map((p) => ({ ...p, isCurrent: p.id === userProductId })));
  }, []);

  const registerProduct = useCallback((productId, { source = 'official', nickname = null } = {}) => {
    const id = nextId();
    setUserProducts((all) => [
      ...all.map((p) => ({ ...p, isCurrent: false })),
      { id, productId, source, nickname, isCurrent: true, registeredAt: new Date().toISOString().slice(0, 10) },
    ]);
    setCurrentUserProductId(id);
    return id;
  }, []);

  const addJourney = useCallback((data) => {
    const id = nextId();
    setJourneys((all) => [
      ...all,
      { id, userProductId: currentUserProductId, isPublic: false, ...data },
    ]);
    return id;
  }, [currentUserProductId]);

  const generateStory = useCallback((upId, content, title) => {
    const id = nextId();
    const entry = {
      id,
      userProductId: upId,
      title,
      content,
      isSaved: false,
      isPublic: false,
      visibility: 'private',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setStories((all) => [...all.filter((s) => s.userProductId !== upId), entry]);
    return id;
  }, []);

  const saveStory = useCallback((id, patch = { isSaved: true }) => {
    setStories((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const addNextStories = useCallback((entries) => {
    setNextStories((all) => [...all, ...entries.map((e) => ({ id: nextId(), isSaved: false, ...e }))]);
  }, []);

  const saveNextStory = useCallback((id, saved = true) => {
    setNextStories((all) => all.map((n) => (n.id === id ? { ...n, isSaved: saved } : n)));
  }, []);

  const requestCare = useCallback((data) => {
    const id = nextId();
    setCareRecords((all) => [
      ...all,
      { id, userProductId: currentUserProductId, status: 'requested', requestedAt: new Date().toISOString().slice(0, 10), completedAt: null, ...data },
    ]);
    return id;
  }, [currentUserProductId]);

  const completeCare = useCallback((id) => {
    setCareRecords((all) => all.map((c) => (
      c.id === id && c.status !== 'completed'
        ? { ...c, status: 'completed', completedAt: new Date().toISOString().slice(0, 10) }
        : c
    )));
  }, []);

  const updateAccount = useCallback((patch) => {
    setUser((u) => ({ ...u, ...patch }));
  }, []);

  const currentUserProduct = useMemo(
    () => userProducts.find((p) => p.id === currentUserProductId) ?? null,
    [userProducts, currentUserProductId]
  );
  const currentProduct = currentUserProduct ? getProduct(currentUserProduct.productId) : null;

  const currentJourneys = useMemo(
    () => journeys
      .filter((j) => j.userProductId === currentUserProductId)
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [journeys, currentUserProductId]
  );

  const stats = useMemo(() => {
    const cities = new Set(currentJourneys.map((j) => j.city));
    const registeredAt = currentUserProduct?.registeredAt;
    const days = registeredAt ? Math.max(0, Math.round((Date.now() - new Date(registeredAt)) / 86400000)) : 0;
    return { journeyCount: currentJourneys.length, cityCount: cities.size, days };
  }, [currentJourneys, currentUserProduct]);

  const currentStory = useMemo(
    () => stories.find((s) => s.userProductId === currentUserProductId) ?? null,
    [stories, currentUserProductId]
  );

  const currentNextStories = useMemo(
    () => nextStories.filter((n) => n.userProductId === currentUserProductId),
    [nextStories, currentUserProductId]
  );

  const currentCareRecords = useMemo(
    () => careRecords
      .filter((c) => c.userProductId === currentUserProductId)
      .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1)),
    [careRecords, currentUserProductId]
  );

  const ownedProducts = useMemo(
    () => userProducts.map((up) => ({ ...up, product: getProduct(up.productId) })),
    [userProducts]
  );

  const selectedJourney = useMemo(
    () => journeys.find((j) => j.id === selectedJourneyId) ?? null,
    [journeys, selectedJourneyId]
  );

  const selectedCare = useMemo(
    () => careRecords.find((c) => c.id === selectedCareId) ?? null,
    [careRecords, selectedCareId]
  );

  const selectedNext = useMemo(
    () => nextStories.find((n) => n.id === selectedNextId) ?? null,
    [nextStories, selectedNextId]
  );

  const value = {
    user, updateAccount,
    isLoggedIn, login,
    catalog: PRODUCTS,
    userProducts: ownedProducts,
    currentUserProduct, currentProduct, currentUserProductId,
    selectProduct, registerProduct,
    journeys, currentJourneys, addJourney,
    selectedJourney, selectedJourneyId, setSelectedJourneyId,
    stories, currentStory, generateStory, saveStory,
    nextStories, currentNextStories, nextStoryPool: seed.nextStoryPool, addNextStories, saveNextStory,
    careRecords, currentCareRecords, requestCare, completeCare,
    selectedCare, selectedCareId, setSelectedCareId,
    selectedNext, selectedNextId, setSelectedNextId,
    stats,
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useApp must be used within AppStateProvider');
  return ctx;
}
