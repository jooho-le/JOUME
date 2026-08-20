import { useApp } from '../../state/AppState';

export const routeId = 'my-products';

function Toggle({ on, onClick }) {
  return (
    <button className={`jm-switch${on ? ' on' : ''}`} onClick={onClick} type="button">
      <span />
    </button>
  );
}

export default function MyProducts({ navigate }) {
  const { user, updateAccount, userProducts, journeys, nextStories, selectProduct } = useApp();
  const savedNextStories = nextStories.filter((n) => n.isSaved);

  const openProduct = (upId) => { selectProduct(upId); navigate('story-home'); };

  return (
    <main className="jm-page">
      <h1 className="jm-h1">{user.name}님의 MCM.</h1>

      <div className="jm-my-grid">
        <div className="jm-my-col">
          <span className="jm-eyebrow">보유 제품</span>
          {userProducts.map((up) => {
            const count = journeys.filter((j) => j.userProductId === up.id).length;
            const cityCount = new Set(journeys.filter((j) => j.userProductId === up.id).map((j) => j.city)).size;
            return (
              <div className="jm-my-row" key={up.id} onClick={() => openProduct(up.id)}>
                <img src={up.product.image} alt={up.product.name} />
                <div className="info">
                  <div className="name">{up.product.name}</div>
                  <div className="sum">{cityCount}개 도시 · {count}개 기록</div>
                </div>
                <span className="chev">→</span>
              </div>
            );
          })}

          <span className="jm-eyebrow" style={{ marginTop: 30 }}>내 여정</span>
          <div className="jm-my-row" onClick={() => navigate('journey-map')}>
            <div className="info">
              <div className="name">JOURNEY MAP 전체 보기</div>
              <div className="sum">보유 제품 전체의 여정 기록 관리</div>
            </div>
            <span className="chev">→</span>
          </div>

          <span className="jm-eyebrow" style={{ marginTop: 30 }}>저장된 Next Story</span>
          {savedNextStories.length === 0 ? (
            <p style={{ fontSize: 12, color: '#999' }}>아직 저장한 다음 이야기가 없어요.</p>
          ) : savedNextStories.map((n) => (
            <div className="jm-my-row" key={n.id} onClick={() => navigate('next-story')}>
              <div className="info">
                <div className="name">{n.city}</div>
                <div className="sum">저장한 목적지 · {n.theme}</div>
              </div>
              <span className="chev">→</span>
            </div>
          ))}
        </div>

        <div className="jm-my-col">
          <span className="jm-eyebrow">계정 설정</span>
          <div className="jm-toggle-row">
            <span>여정 공개 설정</span>
            <Toggle on={user.storyPublic} onClick={() => updateAccount({ storyPublic: !user.storyPublic })} />
          </div>
          <div className="jm-toggle-row">
            <span>Next Story 알림</span>
            <Toggle on={user.notifications} onClick={() => updateAccount({ notifications: !user.notifications })} />
          </div>
          <div className="jm-toggle-row">
            <span>제품 Care 알림</span>
            <Toggle on={user.careAlerts} onClick={() => updateAccount({ careAlerts: !user.careAlerts })} />
          </div>
          <div className="jm-toggle-row" style={{ borderBottom: 0 }}>
            <span>마케팅 정보 수신</span>
            <Toggle on={user.marketingOptIn} onClick={() => updateAccount({ marketingOptIn: !user.marketingOptIn })} />
          </div>
          <button className="jm-btn secondary" style={{ marginTop: 20 }} onClick={() => navigate('account')}>회원 정보 수정</button>
        </div>
      </div>
    </main>
  );
}
