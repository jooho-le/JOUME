import { useState } from 'react';
import { useApp } from '../state/AppState';

export default function ProductBar() {
  const { currentProduct, currentUserProductId, userProducts, selectProduct } = useApp();
  const [open, setOpen] = useState(false);
  if (!currentProduct) return null;

  const pick = (id) => { selectProduct(id); setOpen(false); };

  return (
    <div className="jm-productbar">
      <img src={currentProduct.image} alt={currentProduct.name} />
      <b>{currentProduct.name}</b>
      {userProducts.length > 1 && (
        <button onClick={() => setOpen((v) => !v)}>{open ? '닫기 ✕' : '제품 변경 →'}</button>
      )}
      {open && (
        <div className="jm-productbar-popover">
          {userProducts.map((up) => (
            <button
              key={up.id}
              className={`jm-product-listrow${up.id === currentUserProductId ? ' selected' : ''}`}
              onClick={() => pick(up.id)}
            >
              <img src={up.product.image} alt={up.product.name} />
              <span>
                <b>{up.product.name}</b>
                <small>{up.product.collection} · {up.product.color}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
