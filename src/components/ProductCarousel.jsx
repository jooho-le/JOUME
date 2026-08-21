import { useRef } from 'react';
import { useApp } from '../state/AppState';

export default function ProductCarousel({ onSelect, navigate, centered }) {
  const { userProducts, currentUserProductId, selectProduct } = useApp();
  const trackRef = useRef(null);

  const scroll = (dir) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  const handlePick = (id) => {
    selectProduct(id);
    onSelect?.(id);
  };

  return (
    <div className="jm-carousel">
      <button className="jm-carousel-nav prev" onClick={() => scroll(-1)} aria-label="이전 제품">‹</button>
      <div className={`jm-carousel-track${centered ? ' centered' : ''}`} ref={trackRef}>
        {userProducts.map((up) => (
          <article
            key={up.id}
            className={`jm-carousel-card${up.id === currentUserProductId ? ' active' : ''}`}
            onClick={() => handlePick(up.id)}
          >
            <div className="jm-carousel-img"><img src={up.product.image} alt={up.product.name} /></div>
            <span>{up.source === 'official' ? 'OFFICIAL' : 'RESALE'}</span>
            <b>{up.product.name}</b>
            <small>{up.product.collection} · {up.product.color}</small>
            {up.id === currentUserProductId && <i className="jm-carousel-badge">선택됨</i>}
          </article>
        ))}
        {navigate && (
          <article className="jm-carousel-card add" onClick={() => navigate('product-discovery')}>
            <div className="jm-carousel-img jm-carousel-add"><span>＋</span></div>
            <b>새 제품 등록</b>
            <small>NFC / QR 스캔으로 연결</small>
          </article>
        )}
      </div>
      <button className="jm-carousel-nav next" onClick={() => scroll(1)} aria-label="다음 제품">›</button>
    </div>
  );
}
