import { useState } from 'react';
import LandingPage from './components/LandingPage';
import TalentForm from './components/TalentForm';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import './App.css';

// Akses admin via URL: tambahkan ?admin=senja di address bar
const isAdminRoute = () => window.location.search.includes('admin=senja');

function App() {
  const [page, setPage] = useState(() => isAdminRoute() ? 'admin-login' : 'landing');

  const goToForm = () => setPage('form');
  const goToLanding = () => setPage('landing');
  const goToAdmin = () => setPage('admin');
  const goToAdminLogin = () => setPage('admin-login');

  return (
    <div className="app-wrapper">
      {page === 'landing' && <LandingPage onStart={goToForm} />}
      {page === 'form' && <TalentForm onBack={goToLanding} />}
      {page === 'admin-login' && <AdminLogin onSuccess={goToAdmin} />}
      {page === 'admin' && <AdminPanel onLogout={goToAdminLogin} />}
    </div>
  );
}

export default App;
