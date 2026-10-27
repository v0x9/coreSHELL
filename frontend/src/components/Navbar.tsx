import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';
import type { ThemeName } from '../stores/themeStore';
import { useTerminalState } from '../stores/terminalStore';
import { useAuthStore } from '../stores/authStore';
import { 
  Terminal, HelpCircle, 
  LogOut, User, Download, Copy, RotateCcw, 
  Trash2, ExternalLink, Check
} from 'lucide-react';
import { CommandReferenceModal, ArchitectureModal } from './HelpModals';

type MenuId = 'terminal' | 'file' | 'edit' | 'view' | 'help' | null;

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { history, clearHistory, disconnect, startTerminal, connect } = useTerminalState();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState<MenuId>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const isLight = theme === 'light';

  const getThemeColor = () => {
    switch (theme) {
      case 'matrix': return '#00ff41';
      case 'light': return '#ff00ff';
      case 'cartoon': return '#ea1266';
      case 'vaporwave': return '#00ffff';
      case 'dark':
      default: return '#ffffff';
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRestartSession = async () => {
    setActiveMenu(null);
    sessionStorage.removeItem('terminal-storage');
    disconnect();
    clearHistory();
    try {
      await connect();
      await startTerminal();
      showToast('New sandbox terminal session started');
    } catch (e) {
      showToast('Failed to start session');
    }
  };

  const handleExportLog = () => {
    setActiveMenu(null);
    const logContent = history
      .map((item) => `${item.type === 'input' ? '$ ' : ''}${item.text}`)
      .join('\n');
    
    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `coreshell-session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Session log exported');
  };

  const handleCopyTranscript = () => {
    setActiveMenu(null);
    const text = history.map((item) => item.text).join('\n');
    navigator.clipboard.writeText(text);
    showToast('Transcript copied to clipboard');
  };

  const handleCopyLastOutput = () => {
    setActiveMenu(null);
    const lastOutput = [...history].reverse().find(item => item.type === 'output');
    if (lastOutput) {
      navigator.clipboard.writeText(lastOutput.text);
      showToast('Last output line copied');
    } else {
      showToast('No output to copy');
    }
  };

  const handleLogout = () => {
    setActiveMenu(null);
    disconnect();
    sessionStorage.clear();
    logout();
    navigate('/auth');
  };

  const themes: { id: ThemeName; name: string }[] = [
    { id: 'dark', name: 'Dark Mode' },
    { id: 'matrix', name: 'Matrix Green' },
    { id: 'light', name: 'Light Mode' },
    { id: 'vaporwave', name: 'Pink / Cyan' },
    { id: 'cartoon', name: 'White / Magenta' },
  ];

  const dropdownBg = isLight ? 'rgba(255, 255, 255, 0.95)' : 'rgba(18, 18, 24, 0.95)';
  const dropdownBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)';
  const itemHoverBg = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';

  const menuItemStyle: React.CSSProperties = {
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: isLight ? '#1f2937' : '#e5e7eb',
    transition: 'background 0.15s ease',
    borderRadius: '6px',
    userSelect: 'none',
  };

  const menuContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '32px',
    background: dropdownBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${dropdownBorder}`,
    borderRadius: '8px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
    padding: '6px',
    minWidth: '200px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  return (
    <>
      <div ref={navRef} style={{
        height: '32px',
        width: '100vw',
        background: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(15, 15, 19, 0.55)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        color: isLight ? '#333333' : 'white',
        fontSize: '13px',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 50,
        userSelect: 'none'
      }}>
        {/* Left Side: Brand and Menus */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{
            fontWeight: 800,
            color: getThemeColor(),
            letterSpacing: '0.5px',
            padding: '4px 10px',
            marginRight: '6px'
          }}>
            coreSHell
          </div>

          {/* Terminal Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'terminal' ? null : 'terminal')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                background: activeMenu === 'terminal' ? itemHoverBg : 'transparent',
                fontWeight: activeMenu === 'terminal' ? 600 : 400
              }}
            >
              Terminal
            </div>
            {activeMenu === 'terminal' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleRestartSession}
                >
                  <RotateCcw size={15} color="#00ffff" />
                  <span>Restart Session</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { clearHistory(); setActiveMenu(null); showToast('Terminal cleared'); }}
                >
                  <Trash2 size={15} color="#ffb3ba" />
                  <span>Clear Screen</span>
                </div>
              </div>
            )}
          </div>

          {/* File Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                background: activeMenu === 'file' ? itemHoverBg : 'transparent',
                fontWeight: activeMenu === 'file' ? 600 : 400
              }}
            >
              File
            </div>
            {activeMenu === 'file' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleExportLog}
                >
                  <Download size={15} color="#00ff41" />
                  <span>Export Session Log (.log)</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleCopyTranscript}
                >
                  <Copy size={15} color="#00ffff" />
                  <span>Copy Full Transcript</span>
                </div>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                background: activeMenu === 'edit' ? itemHoverBg : 'transparent',
                fontWeight: activeMenu === 'edit' ? 600 : 400
              }}
            >
              Edit
            </div>
            {activeMenu === 'edit' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleCopyLastOutput}
                >
                  <Copy size={15} color="#ffb3ba" />
                  <span>Copy Last Output</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { clearHistory(); setActiveMenu(null); showToast('Buffer cleared'); }}
                >
                  <Trash2 size={15} color="#ea1266" />
                  <span>Reset Buffer</span>
                </div>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                background: activeMenu === 'view' ? itemHoverBg : 'transparent',
                fontWeight: activeMenu === 'view' ? 600 : 400
              }}
            >
              View
            </div>
            {activeMenu === 'view' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div style={{ padding: '6px 14px', fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Select Theme
                </div>
                {themes.map((t) => (
                  <div
                    key={t.id}
                    style={{
                      ...menuItemStyle,
                      justifyContent: 'space-between',
                      fontWeight: theme === t.id ? 600 : 400
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => {
                      setTheme(t.id);
                      setActiveMenu(null);
                      showToast(`Switched theme to ${t.name}`);
                    }}
                  >
                    <span>{t.name}</span>
                    {theme === t.id && <Check size={14} color="#00ffff" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                background: activeMenu === 'help' ? itemHoverBg : 'transparent',
                fontWeight: activeMenu === 'help' ? 600 : 400
              }}
            >
              Help
            </div>
            {activeMenu === 'help' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { setActiveMenu(null); setIsCommandModalOpen(true); }}
                >
                  <Terminal size={15} color="#00ffff" />
                  <span>Command Reference</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { setActiveMenu(null); setIsArchModalOpen(true); }}
                >
                  <HelpCircle size={15} color="#ea1266" />
                  <span>Architecture Overview</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = itemHoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => {
                    setActiveMenu(null);
                    window.open('https://github.com/v0x9/coreSHELL', '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink size={15} color="#00ff41" />
                  <span>GitHub Repository</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center / Spacer */}
        <div style={{ flex: 1 }}></div>

        {/* Right Side: User Profile & Actions */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                <User size={13} color="#00ffff" />
                <span style={{ fontWeight: 500 }}>{user?.username || 'recruiter_demo'}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Log out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: isLight ? '#4b5563' : '#9ca3af',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ff6b6b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isLight ? '#4b5563' : '#9ca3af')}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', opacity: 0.7, fontSize: '12px' }}>
            <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Floating Toast Feedback */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '44px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.85)',
          color: '#ffffff',
          border: '1px solid rgba(0, 255, 255, 0.4)',
          borderRadius: '8px',
          padding: '6px 16px',
          fontSize: '13px',
          zIndex: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease forwards'
        }}>
          <Check size={14} color="#00ffff" />
          <span>{toast}</span>
        </div>
      )}

      {/* Modals */}
      <CommandReferenceModal isOpen={isCommandModalOpen} onClose={() => setIsCommandModalOpen(false)} />
      <ArchitectureModal isOpen={isArchModalOpen} onClose={() => setIsArchModalOpen(false)} />
    </>
  );
};
