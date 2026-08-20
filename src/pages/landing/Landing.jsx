import visetosBackpack from '../../assets/visetos-backpack.png';
import orangeCrossbody from '../../assets/orange-crossbody.png';
import millaTote from '../../assets/backpack.png';

export const routeId = 'landing';

const FEATURES = [
  {
    eyebrow: 'RECORD & VISUALIZE',
    title: '지도와 타임라인에 기록되는 순간들',
    body: '도시, 날짜, 사진 한 장까지. 당신의 여정은 지도와 타임라인 위에 차곡차곡 쌓입니다. 언제 어디서 MCM과 함께였는지, 언제든 다시 펼쳐볼 수 있습니다.',
    image: visetosBackpack,
  },
  {
    eyebrow: 'AI-CRAFTED NARRATIVE',
    title: '사진 한 장이 이야기가 되다',
    body: '흩어진 기록들을 AI가 하나의 문장, 하나의 이야기로 정리합니다. 당신이 남긴 도시와 순간들이 MCM과 함께한 온전한 서사가 됩니다.',
    image: orangeCrossbody,
  },
  {
    eyebrow: 'AI-CRAFTED FOR YOU',
    title: '당신의 다음 순간을 위한 MCM',
    body: '지금까지의 이야기를 바탕으로 AI가 다음 여정과 어울리는 제품을 제안합니다. 하나의 가방에서 시작된 이야기는 계속 이어집니다.',
    image: millaTote,
  },
];

export default function Landing({ navigate }) {
  return (
    <main className="jm-landing">
      <section className="jm-landing-hero">
        <h1>MCM과 내가<br />써내려가는 여정</h1>
        <p>가방은 단순히 머무는 물건이 아닙니다. 당신이 딛는 발걸음마다 함께 호흡하고 기록되는, 세상에 하나뿐인 나의 서사. 지금, 당신의 여정에 MCM을 초대하세요.</p>
        <button className="jm-btn primary" onClick={() => navigate('login')}>JOIN ME</button>
        <div className="jm-landing-hero-image">
          <img src={visetosBackpack} alt="STARK BACKPACK IN VISETOS" />
        </div>
      </section>

      {FEATURES.map((f, i) => (
        <section className={`jm-landing-feature${i % 2 ? ' reverse' : ''}`} key={f.title}>
          <div className="jm-landing-feature-copy">
            <span className="jm-eyebrow">{f.eyebrow}</span>
            <h2>{f.title}</h2>
            <p>{f.body}</p>
          </div>
          <div className="jm-landing-feature-image">
            <img src={f.image} alt={f.title} />
          </div>
        </section>
      ))}

      <section className="jm-landing-cta">
        <span className="jm-eyebrow">당신의 MCM을 지금 등록하세요</span>
        <h2>당신의 첫 번째<br />여정을 등록하세요</h2>
        <p>내 가방에 담긴 이야기를 세상에 꺼내놓을 시간입니다. 몇 분이면 충분합니다.</p>
        <button className="jm-btn primary" onClick={() => navigate('login')}>내 제품 등록하고 여정 시작하기</button>
      </section>
    </main>
  );
}
