import { useState } from 'react';
import logo from '../assets/Untitled design.png';

// Password admin sederhana — bisa diganti sesuai kebutuhan
const ADMIN_PASSWORD = 'senja2025';

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onSuccess();
      } else {
        setError('Password salah. Silakan coba lagi.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <img src={logo} alt="Logo UKM Senja" className="login-logo" />
        <h2>Panel Admin</h2>
        <p className="login-subtitle">UKM Seni Jayanusa · Pemetaan Talent</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="field-group">
            <label className="field-label" htmlFor="password">Password Admin</label>
            <input
              id="password"
              type="password"
              className="field-input"
              placeholder="Masukkan password..."
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          {error && <div className="error-banner">⚠️ {error}</div>}
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading || !password}
          >
            {loading ? '⏳ Memeriksa...' : '🔓 Masuk Admin'}
          </button>
        </form>
        <p className="login-hint">
          Halaman ini hanya untuk pengurus UKM Senja.
        </p>
      </div>
    </div>
  );
}
