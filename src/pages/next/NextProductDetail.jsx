import { useApp } from '../../state/AppState';
import { getProduct } from '../../data/dummy';

export const routeId = 'next-product-detail';

export default function NextProductDetail({ navigate }) {
  const { selectedNext, currentProduct } = useApp();

  if (!selectedNext) {
    navigate('next-story');
    return null;
  }

  const product = getProduct(selectedNext.productId);

  return (
    <main className="jm-page">
      <span className="jm-eyebrow">{selectedNext.city} · {selectedNext.theme}을 위한 제안</span>
      <div className="jm-detail">
        <div className="jm-detail-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div>
          <span className="jm-eyebrow">{product.collection.toUpperCase()}</span>
          <h1 className="jm-h1" style={{ fontSize: 32 }}>{product.name}</h1>
          <div className="jm-price">₩{product.price.toLocaleString()}</div>

          <div className="jm-reason-list" style={{ margin: '24px 0' }}>
            {currentProduct && (
              <div className="r">
                <span className="jm-eyebrow">현재 보유 제품과의 연결점</span>
                <p>지금 함께하고 있는 {currentProduct.name}과 어울리는 조합으로, {selectedNext.city} 여정에 함께할 다음 제품입니다.</p>
              </div>
            )}
            <div className="r">
              <span className="jm-eyebrow">추천 이유</span>
              <p>{selectedNext.productReason || selectedNext.reason}</p>
            </div>
            <div className="r">
              <span className="jm-eyebrow">Product Story</span>
              <p>{product.story}</p>
            </div>
          </div>

          <div className="jm-actions">
            <button className="jm-btn primary" onClick={() => navigate('store-detail')}>Store에서 보기 →</button>
            <button className="jm-btn secondary" onClick={() => navigate('next-story')}>다른 추천 보기</button>
          </div>
        </div>
      </div>
    </main>
  );
}
