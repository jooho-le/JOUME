import { useState } from 'react';
import { useApp } from '../../state/AppState';
import { EXPERIENCE_TYPES } from '../../data/dummy';

export const routeId = 'add-journey';

const today = () => new Date().toISOString().slice(0, 10);

export default function AddJourney({ navigate }) {
  const { currentProduct, addJourney, setSelectedJourneyId } = useApp();
  const [photo, setPhoto] = useState(null);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [place, setPlace] = useState('');
  const [date, setDate] = useState(today());
  const [experience, setExperience] = useState('Everyday');
  const [note, setNote] = useState('');

  const onPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!city) return;
    const id = addJourney({
      city, country, place, date, experienceType: experience, note,
      image: photo || currentProduct.image,
    });
    setSelectedJourneyId(id);
    navigate('journey-complete');
  };

  return (
    <main className="jm-page">
      <h1 className="jm-h1">{currentProduct?.name}과 함께한<br />순간을 기록하세요.</h1>

      <form onSubmit={submit} className="jm-journeyform">
        <label className="jm-upload">
          {photo ? <img src={photo} alt="preview" /> : <span>사진을 업로드하세요<br />(선택하지 않으면 제품 이미지로 대체됩니다)</span>}
          <input type="file" accept="image/*" onChange={onPhoto} />
        </label>

        <div>
          <label className="jm-field"><span>CITY</span><input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="예) Tokyo" /></label>
          <label className="jm-field"><span>COUNTRY</span><input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="예) Japan" /></label>
          <label className="jm-field"><span>PLACE</span><input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="장소 (선택)" /></label>
          <label className="jm-field"><span>DATE</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>

          <div className="jm-field">
            <span>EXPERIENCE TYPE</span>
            <div className="jm-chip-row">
              {EXPERIENCE_TYPES.map((x) => (
                <button type="button" key={x} className={`jm-chip${experience === x ? ' active' : ''}`} onClick={() => setExperience(x)}>{x}</button>
              ))}
            </div>
          </div>

          <label className="jm-field"><span>SHORT NOTE</span><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="이야기를 짧게 기록하세요." /></label>

          <div className="jm-actions">
            <button className="jm-btn primary" type="submit">Add to My Story →</button>
          </div>
        </div>
      </form>
    </main>
  );
}
