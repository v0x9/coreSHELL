import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';
import ProtectedRoutes from './components/ProtectedRoutes';
import { useAuthStore } from './stores/authStore';
import { useEffect } from 'react';
function App() {
  const {checkAuth , isAuthenticated , loading} = useAuthStore();

  useEffect(()=>{
    checkAuth()
  } , [checkAuth]);
  if (loading) {

    return <div>Loading...</div>;

  }
  return (
    
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated?"/dashboard":"/auth"} replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoutes><DashboardPage /></ProtectedRoutes>} />
    </Routes>
  );
}

export default App;
