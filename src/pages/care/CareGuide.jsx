import { useApp } from '../../state/AppState';
import ProductBar from '../../components/ProductBar';

export const routeId = 'care-guide';

function materialTips(material) {
  const isLeather = /leather/i.test(material);
  if (isLeather) {
    return [
      { title: '클리닝', body: '가죽 전용 클리너를 부드러운 천에 소량 묻혀 결 방향으로 닦아주세요.' },
      { title: '방수', body: '물에 젖었다면 즉시 마른 천으로 두드려 닦고 그늘에서 자연 건조하세요.' },
      { title: '전문 케어', body: '6개월에 한 번, MCM 공식 매장의 가죽 전문 케어를 받는 것을 권장합니다.' },
    ];
  }
  return [
    { title: '클리닝', body: '부드러운 마른 천 또는 살짝 젖은 천으로 표면을 가볍게 닦아주세요.' },
    { title: '방수', body: '코팅 캔버스 소재로 가벼운 오염은 물티슈로 바로 제거할 수 있습니다.' },
    { title: '보관', body: '직사광선과 고온 다습을 피해 통풍이 잘 되는 곳에 보관하세요.' },
  ];
}

export default function CareGuide({ navigate }) {
  const { currentProduct } = useApp();
  if (!currentProduct) return null;
  const tips = materialTips(currentProduct.material);

  return (
    <main className="jm-page">
      <ProductBar navigate={navigate} />
      <h1 className="jm-h1">소재에 맞는<br />공식 관리 방법.</h1>
      <p className="jm-lede">{currentProduct.name}의 소재는 <b>{currentProduct.material}</b>입니다. {currentProduct.careSummary}</p>

      <div className="jm-timeline" style={{ marginTop: 32 }}>
        {tips.map((tip, i) => (
          <div className="jm-timeline-item" key={tip.title} style={{ gridTemplateColumns: '90px 1fr', cursor: 'default' }}>
            <time>0{i + 1}</time>
            <div>
              <h4>{tip.title}</h4>
              <p>{tip.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="jm-actions">
        <button className="jm-btn primary" onClick={() => navigate('care-request')}>Request Care</button>
      </div>
    </main>
  );
}
