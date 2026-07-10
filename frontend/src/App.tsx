import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';
import ProtectedRoutes from './components/ProtectedRoutes';
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" replace />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/dashboard" element={<ProtectedRoutes><DashboardPage /></ProtectedRoutes>} />
    </Routes>
  );
}

export default App;
