import { GLOBAL_NAV, PUBLIC_PAGES } from '../data/ia';

const ICONS = {
  'story-home': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 11 12 4l8 7" /><path d="M6 10v9h12v-9" /></svg>,
  'journey-map': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="10" r="3" /><path d="M12 21s7-6.5 7-11a7 7 0 1 0-14 0c0 4.5 7 11 7 11Z" /></svg>,
  'next-story': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 12l7-7 4 4 7-7M14 2h7v7" /></svg>,
  'care-home': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 21s-7-4.5-7-10a7 7 0 0 1 14 0c0 5.5-7 10-7 10Z" /></svg>,
  'my-products': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.5-4 4.2-6 7-6s5.5 2 7 6" /></svg>,
};

export default function AppShell({ pageId, navigate, children }) {
  const isPublic = PUBLIC_PAGES.includes(pageId);

  return (
    <div className="jm-site">
      <header className={`jm-header${isPublic ? ' public' : ''}`}>
        <button className="jm-logo" onClick={() => navigate(isPublic ? 'landing' : 'story-home')}>
          JOUME<small>WITH MCM</small>
        </button>
        {isPublic ? (
          <button className="jm-btn secondary jm-header-login" onClick={() => navigate('login')}>Login</button>
        ) : (
          <nav>
            {GLOBAL_NAV.map(([label, id]) => (
              <button key={id} className={pageId === id ? 'on' : ''} onClick={() => navigate(id)}>
                <i className="jm-nav-icon">{ICONS[id]}</i>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        )}
      </header>
      {children}
    </div>
  );
}
