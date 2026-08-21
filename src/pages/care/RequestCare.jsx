import { useState } from 'react';
import { useApp } from '../../state/AppState';
import ProductBar from '../../components/ProductBar';
import { CARE_TYPES, STORES } from '../../data/dummy';

export const routeId = 'care-request';

export default function RequestCare({ navigate }) {
  const { currentProduct, requestCare, setSelectedCareId } = useApp();
  const [careType, setCareType] = useState(CARE_TYPES[0]);
  const [storeId, setStoreId] = useState(STORES[0].id);
  const [photo, setPhoto] = useState(null);
  const [note, setNote] = useState('');

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const submit = (e) => {
    e.preventDefault();
    const store = STORES.find((s) => s.id === storeId);
    const id = requestCare({ careType, storeName: store.name, note, image: photo });
    setSelectedCareId(id);
    navigate('care-complete');
  };

  if (!currentProduct) return null;

  return (
    <main className="jm-page">
      <ProductBar navigate={navigate} />
      <h1 className="jm-h1">제품 케어를<br />요청하세요.</h1>

      <form onSubmit={submit} className="jm-journeyform">
        <label className="jm-upload">
          {photo ? <img src={photo} alt="preview" /> : <span>제품 상태 사진을 업로드하세요<br />(선택)</span>}
          <input type="file" accept="image/*" onChange={onPhoto} />
        </label>

        <div>
          <div className="jm-field">
            <span>REQUEST TYPE</span>
            <div className="jm-chip-row">
              {CARE_TYPES.map((t) => (
                <button type="button" key={t} className={`jm-chip${careType === t ? ' active' : ''}`} onClick={() => setCareType(t)}>{t}</button>
              ))}
            </div>
          </div>

          <label className="jm-field">
            <span>가까운 매장</span>
            <select value={storeId} onChange={(e) => setStoreId(Number(e.target.value))}>
              {STORES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>

          <label className="jm-field"><span>NOTE</span><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="상태나 요청사항을 적어주세요." /></label>

          <div className="jm-actions">
            <button className="jm-btn primary" type="submit">Request →</button>
          </div>
        </div>
      </form>
    </main>
  );
}
