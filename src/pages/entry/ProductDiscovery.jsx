import { getProduct, DISCOVERY_PRODUCT_ID } from '../../data/dummy';

export const routeId = 'product-discovery';

export default function ProductDiscovery({ navigate }) {
  const product = getProduct(DISCOVERY_PRODUCT_ID);
  return (
    <main className="jm-page">
      <h1 className="jm-h1">제품의 첫 번째 Story를<br />먼저 만나보세요.</h1>

      <div className="jm-discovery-hero">
        <figure><img src={product.image} alt={product.name} /></figure>
        <div className="jm-copy">
          <span className="jm-eyebrow">{product.collection.toUpperCase()}</span>
          <h2 style={{ fontSize: 26, margin: '0 0 6px' }}>{product.name}</h2>
          <p style={{ font: "10px 'IBM Plex Mono'", color: '#999' }}>{product.material} · {product.color}</p>
          <blockquote>"{product.story}"</blockquote>
          <div className="jm-actions">
            <button className="jm-btn primary" onClick={() => navigate('digital-passport')}>Explore the Story →</button>
            <button className="jm-btn secondary" onClick={() => navigate('product-detail')}>View Product</button>
          </div>
        </div>
      </div>

      <div className="jm-discovery-strip">
        <div>
          <b>MCM HERITAGE</b>
          <p>{product.craftsmanship}</p>
        </div>
        <div>
          <b>JOURNEY PREVIEW</b>
          <p>이 제품과 함께한 고객들의 기록이 AI Story로 정리되어 다음 여정을 제안합니다.</p>
        </div>
        <div>
          <b>PRODUCT CARE</b>
          <p>{product.careSummary}</p>
        </div>
      </div>
    </main>
  );
}
