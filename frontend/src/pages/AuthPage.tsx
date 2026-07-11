import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Lock, User, ArrowRight, Code } from 'lucide-react';
import { Background } from '../components/Background';
import { Navbar } from '../components/Navbar';
import './AuthPage.css';
import { useAuthStore } from '../stores/authStore';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { user, token, isAuthenticated, loading, login, register, logout, checkAuth } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    // Navigate to dashboard for now since we're just designing the UI
    try{
      if (!isLogin) {
        const success = await register(username, email, password);
        if (success) {
          navigate('/dashboard');
        }
      } else {
        const success = await login(email, password);
        if (success) {
          navigate('/dashboard');
        }
      }
      

    }catch(err){
      console.error(err);
    }
    
    
  };

  return (
    <div className="app-container">
      <Background isAuth={true} />
      <Navbar />
      
      <div className="auth-wrapper">
        <div className="auth-card glass-panel">
          <div className="auth-header">
            <div className="auth-icon-container">
              <Terminal size={32} color="#ffffff" />
            </div>
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="auth-subtitle">
              {isLogin ? 'Enter your credentials to access the terminal' : 'Sign up for a new coreSHell instance'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <div className="input-icon">
                  <User size={18} />
                </div>
                <input type="text" placeholder="Username" required className="glass-input" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
            )}
            
            <div className="input-group">
              <div className="input-icon">
                <User size={18} />
              </div>
              <input type="text" placeholder="Email " required className="glass-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <Lock size={18} />
              </div>
              <input type="password" placeholder="Password" required className="glass-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              <span>
                {loading
                  ? (isLogin ? "Initializing..." : "Creating...")
                  : (isLogin ? "Initialize Session" : "Create Instance")}
              </span>

              {!loading && <ArrowRight size={18} className="btn-icon" />}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="github-btn" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
            <Code size={18} />
            <span>Continue with Google (Coming Soon)</span>
          </button>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="auth-link" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Sign up' : 'Log in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
