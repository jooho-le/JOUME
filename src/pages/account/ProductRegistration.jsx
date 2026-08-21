import { useApp } from '../../state/AppState';
import { getProduct, DISCOVERY_PRODUCT_ID } from '../../data/dummy';

export const routeId = 'product-registration';

export default function ProductRegistration({ navigate }) {
  const { user, registerProduct } = useApp();
  const product = getProduct(DISCOVERY_PRODUCT_ID);

  const confirm = () => {
    registerProduct(product.id, { source: 'official' });
    navigate('start-story');
  };

  return (
    <main className="jm-page">
      <h1 className="jm-h1" style={{ fontSize: 32 }}>확인된 제품을<br />내 계정에 등록합니다.</h1>

      <div className="jm-register-card">
        <img src={product.image} alt={product.name} />
        <div>
          <span className="jm-badge solid">✓ 정품 확인 완료</span>
          <div style={{ fontSize: 17, fontWeight: 600, margin: '10px 0 4px' }}>{product.name}</div>
          <div style={{ font: "10px 'IBM Plex Mono'", color: '#999' }}>{product.sku}</div>
        </div>
      </div>

      <div className="jm-check-row"><i>✓</i><span>제품 정품 확인이 완료되었습니다.</span></div>
      <div className="jm-check-row"><i>✓</i><span>{user.name} 님의 MCM 계정에 연결됩니다. ({user.email})</span></div>
      <div className="jm-check-row"><i>✓</i><span>현재 소유 제품으로 등록되어 Story Home에 표시됩니다.</span></div>

      <div className="jm-actions">
        <button className="jm-btn primary" onClick={confirm}>Register Product →</button>
      </div>
    </main>
  );
}
