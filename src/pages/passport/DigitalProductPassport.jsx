import { useApp } from '../../state/AppState';
import { getProduct, DISCOVERY_PRODUCT_ID } from '../../data/dummy';

export const routeId = 'digital-passport';

export default function DigitalProductPassport({ navigate }) {
  const { userProducts } = useApp();
  const product = getProduct(DISCOVERY_PRODUCT_ID);
  const alreadyOwned = userProducts.some((up) => up.productId === product.id);

  return (
    <main className="jm-page">
      <div className="jm-passport-head">
        <div>
          <h1 className="jm-h1" style={{ fontSize: 36, marginBottom: 6 }}>{product.name}</h1>
          <span className="jm-badge solid">✓ AUTHENTIC MCM PRODUCT</span>
        </div>
      </div>

      <div className="jm-passport-grid">
        <img src={product.image} alt={product.name} />
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, letterSpacing: '.06em', color: '#888', fontFamily: "'IBM Plex Mono'" }}>PRODUCT IDENTITY</h3>
          <div className="jm-table">
            <div><span>SKU</span><span>{product.sku}</span></div>
            <div><span>COLLECTION</span><span>{product.collection}</span></div>
            <div><span>MATERIAL</span><span>{product.material}</span></div>
            <div><span>MADE IN</span><span>{product.manufactureCountry}</span></div>
          </div>

          <h3 style={{ margin: '30px 0 14px', fontSize: 15, letterSpacing: '.06em', color: '#888', fontFamily: "'IBM Plex Mono'" }}>PRODUCT CARE</h3>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>{product.careSummary}</p>

          <div className="jm-actions">
            {alreadyOwned ? (
              <button className="jm-btn primary" onClick={() => navigate('story-home')}>View My Story →</button>
            ) : (
              <button className="jm-btn primary" onClick={() => navigate('login')}>Register Your Product →</button>
            )}
          </div>
        </div>
      </div>

      <div className="jm-heritage">
        <span>MCM HERITAGE · CRAFTSMANSHIP</span>
        <p>{product.craftsmanship}</p>
      </div>
    </main>
  );
}
