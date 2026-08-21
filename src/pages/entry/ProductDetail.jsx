import { useState } from 'react';
import { getProduct, DISCOVERY_PRODUCT_ID } from '../../data/dummy';

export const routeId = 'product-detail';

export default function ProductDetail({ navigate }) {
  const product = getProduct(DISCOVERY_PRODUCT_ID);
  const [colorIdx, setColorIdx] = useState(0);

  return (
    <main className="jm-page">
      <div className="jm-detail">
        <div className="jm-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div>
          <span className="jm-eyebrow">{product.collection.toUpperCase()}</span>
          <h1 className="jm-h1" style={{ fontSize: 34 }}>{product.name}</h1>
          <div className="jm-price">₩{product.price.toLocaleString()}</div>

          <div className="jm-field">
            <span>COLOR — {product.priceOptions[colorIdx].color}</span>
            <div className="jm-swatches">
              {product.priceOptions.map((opt, i) => (
                <button key={opt.color} className={`jm-swatch${i === colorIdx ? ' active' : ''}`} onClick={() => setColorIdx(i)} aria-label={opt.color}>
                  <i style={{ background: opt.hex }} />
                </button>
              ))}
            </div>
          </div>

          <p className="jm-lede">{product.story}</p>

          <div className="jm-table">
            <div><span>MATERIAL</span><span>{product.material}</span></div>
            <div><span>MADE IN</span><span>{product.manufactureCountry}</span></div>
            <div><span>SKU</span><span>{product.sku}</span></div>
          </div>

          <div className="jm-actions">
            <button className="jm-btn primary" onClick={() => navigate('login')}>Purchase</button>
            <button className="jm-btn secondary" onClick={() => navigate('digital-passport')}>Product Passport</button>
          </div>
        </div>
      </div>
    </main>
  );
}
