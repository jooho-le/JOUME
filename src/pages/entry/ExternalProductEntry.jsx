export const routeId = 'external-entry';

export default function ExternalProductEntry({ navigate }) {
  return (
    <main className="jm-page">
      <h1 className="jm-h1">공식몰 밖에서 만났어도,<br />여정은 같습니다.</h1>
      <p className="jm-lede">제품에 부착된 NFC 태그를 스캔하거나 QR코드를 인식하면 공식 MCM 경험으로 바로 연결됩니다.</p>

      <div className="jm-scan" style={{ marginTop: 36 }}>
        <div className="jm-scan-ring"><span>◇</span></div>
        <h2>Scan to Connect</h2>
        <p>제품 안쪽 태그에 스마트폰을 가까이 대거나, 카메라로 QR코드를 인식하세요.</p>
        <div className="jm-actions" style={{ justifyContent: 'center' }}>
          <button className="jm-btn primary" onClick={() => navigate('digital-passport')}>Scan Product</button>
        </div>
      </div>

      <div className="jm-discovery-strip" style={{ marginTop: 28 }}>
        <div>
          <b>공식 DPP 연결</b>
          <p>어디서 구매했든 Digital Product Passport로 정품 정보를 확인합니다.</p>
        </div>
        <div>
          <b>정품 확인</b>
          <p>시리얼과 제조 정보를 대조해 정품 여부를 안내합니다.</p>
        </div>
      </div>
    </main>
  );
}
