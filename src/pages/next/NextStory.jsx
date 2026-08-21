import { useApp } from '../../state/AppState';
import EmptyState from '../../components/EmptyState';
import { getProduct, CITY_PHOTOS } from '../../data/dummy';

export const routeId = 'next-story';

export default function NextStory({ navigate }) {
  const { currentProduct, currentJourneys, currentNextStories, setSelectedNextId } = useApp();
  if (!currentProduct) return null;

  if (currentJourneys.length === 0) {
    return (
      <main className="jm-page">
        <h1 className="jm-h1">Where will your MCM<br />take you next?</h1>
        <EmptyState title="아직 분석할 Journey가 없어요" body="Journey를 먼저 기록하면 다음 여정을 제안해드립니다." actionLabel="Add New Journey" onAction={() => navigate('add-journey')} />
      </main>
    );
  }

  const types = [...new Set(currentJourneys.map((j) => j.experienceType))];

  const destination = currentNextStories[0];
  const productRec = currentNextStories[1] || currentNextStories[0];
  const product = productRec ? getProduct(productRec.productId) : null;

  const openDestination = () => { setSelectedNextId(destination.id); navigate('next-story-detail'); };
  const openProduct = () => { setSelectedNextId(productRec.id); navigate('next-product-detail'); };

  return (
    <main className="jm-page">
      <h1 className="jm-h1">Where will your MCM<br />take you next?</h1>

      <div className="jm-context">
        <span>CUSTOMER CONTEXT</span>
        <b>{types.slice(0, 3).join(' · ')}</b>
        <p>지금까지의 기록을 바탕으로 두 가지를 제안합니다.</p>
      </div>

      {(!destination) ? (
        <EmptyState title="아직 준비된 추천이 없어요" body="Journey를 조금 더 기록하면 추천이 열립니다." />
      ) : (
        <div className="jm-next-grid">
          <div
            className="jm-next-card destination"
            style={CITY_PHOTOS[destination.city] ? { backgroundImage: `url(${CITY_PHOTOS[destination.city]})` } : undefined}
            onClick={openDestination}
          >
            <div className="shade" />
            <span className="jm-tag">{destination.theme}</span>
            <h3>{destination.city}</h3>
            <p>{destination.reason}</p>
            <button className="jm-btn ghost">추천 이유 더보기 →</button>
          </div>

          {product && (
            <div className="jm-next-card product" onClick={openProduct}>
              <div className="jm-next-card-img"><img src={product.image} alt={product.name} /></div>
              <div className="body">
                <span className="jm-eyebrow">어울리는 제품</span>
                <h3>{product.name}</h3>
                <p>{productRec.productReason || productRec.reason}</p>
                <button className="jm-btn ghost">제품 추천 이유 보기 →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
