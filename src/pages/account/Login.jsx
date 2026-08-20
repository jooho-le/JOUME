import { useState } from 'react';
import { useApp } from '../../state/AppState';

export const routeId = 'login';

export default function Login({ navigate }) {
  const [mode, setMode] = useState('login');
  const { login } = useApp();

  const submit = (e) => {
    e.preventDefault();
    login();
    navigate('product-registration');
  };

  return (
    <main className="jm-page">
      <div className="jm-auth">
        <h1 className="jm-h1" style={{ fontSize: 26 }}>{mode === 'login' ? 'MCM 계정으로 로그인' : '회원가입'}</h1>
        <p className="jm-lede">제품과 Story를 연결하려면 MCM 계정이 필요합니다.</p>

        <form onSubmit={submit}>
          {mode === 'signup' && (
            <label className="jm-field"><span>NAME</span><input required placeholder="이름" /></label>
          )}
          <label className="jm-field"><span>EMAIL</span><input type="email" required placeholder="you@email.com" /></label>
          <label className="jm-field"><span>PASSWORD</span><input type="password" required placeholder="••••••••" /></label>
          <button className="jm-btn primary" type="submit" style={{ width: '100%', justifyContent: 'center' }}>Continue</button>
        </form>

        <div className="jm-social">
          <button type="button">Kakao로 계속하기</button>
          <button type="button">Naver로 계속하기</button>
        </div>

        <div className="jm-auth-switch">
          {mode === 'login' ? (
            <>계정이 없으신가요? <button className="jm-btn ghost" onClick={() => setMode('signup')}>회원가입</button></>
          ) : (
            <>이미 계정이 있으신가요? <button className="jm-btn ghost" onClick={() => setMode('login')}>로그인</button></>
          )}
        </div>
      </div>
    </main>
  );
}
