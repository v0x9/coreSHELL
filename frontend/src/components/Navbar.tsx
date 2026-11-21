import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../stores/themeStore';
import type { ThemeName } from '../stores/themeStore';
import { useTerminalState } from '../stores/terminalStore';
import { useAuthStore } from '../stores/authStore';
import { 
  Terminal, HelpCircle, 
  LogOut, Download, Copy, RotateCcw, 
  Trash2, ExternalLink, Check
} from 'lucide-react';
import { CommandReferenceModal, ArchitectureModal } from './HelpModals';

type MenuId = 'terminal' | 'file' | 'edit' | 'view' | 'help' | null;

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const { history, clearHistory, disconnect, startTerminal, connect } = useTerminalState();
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const [activeMenu, setActiveMenu] = useState<MenuId>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isCommandModalOpen, setIsCommandModalOpen] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const getThemeStyles = () => {
    switch (theme) {
      case 'matrix':
        return {
          navBg: 'rgba(2, 15, 5, 0.75)',
          navBorder: 'rgba(0, 255, 65, 0.25)',
          brandColor: '#00ff41',
          itemColor: '#00ff41',
          hoverBg: 'rgba(0, 255, 65, 0.15)',
          activeBg: 'rgba(0, 255, 65, 0.25)',
          dropdownBg: 'rgba(2, 15, 5, 0.96)',
          dropdownBorder: 'rgba(0, 255, 65, 0.35)',
          dropdownItemColor: '#00ff41',
          accentColor: '#00ff41',
          clockColor: 'rgba(0, 255, 65, 0.75)',
        };
      case 'vaporwave':
        return {
          navBg: 'rgba(20, 10, 30, 0.75)',
          navBorder: 'rgba(0, 255, 255, 0.25)',
          brandColor: '#ff71ce',
          itemColor: '#01cdfe',
          hoverBg: 'rgba(255, 113, 206, 0.18)',
          activeBg: 'rgba(0, 255, 255, 0.22)',
          dropdownBg: 'rgba(18, 8, 28, 0.96)',
          dropdownBorder: 'rgba(0, 255, 255, 0.35)',
          dropdownItemColor: '#ffb3ba',
          accentColor: '#01cdfe',
          clockColor: 'rgba(1, 205, 254, 0.75)',
        };
      case 'cartoon':
        return {
          navBg: '#f5b5c3',
          navBorder: '#000000',
          brandColor: '#ea1266',
          itemColor: '#000000',
          hoverBg: 'rgba(234, 18, 102, 0.15)',
          activeBg: 'rgba(234, 18, 102, 0.25)',
          dropdownBg: '#fad2dc',
          dropdownBorder: '#000000',
          dropdownItemColor: '#000000',
          accentColor: '#ea1266',
          clockColor: 'rgba(0, 0, 0, 0.75)',
        };
      case 'light':
        return {
          navBg: 'rgba(255, 255, 255, 0.75)',
          navBorder: 'rgba(0, 0, 0, 0.1)',
          brandColor: '#ff00ff',
          itemColor: '#333333',
          hoverBg: 'rgba(0, 0, 0, 0.07)',
          activeBg: 'rgba(0, 0, 0, 0.12)',
          dropdownBg: 'rgba(255, 255, 255, 0.96)',
          dropdownBorder: 'rgba(0, 0, 0, 0.15)',
          dropdownItemColor: '#1f2937',
          accentColor: '#ff00ff',
          clockColor: 'rgba(50, 50, 50, 0.75)',
        };
      case 'dark':
      default:
        return {
          navBg: 'rgba(15, 15, 19, 0.65)',
          navBorder: 'rgba(255, 255, 255, 0.08)',
          brandColor: '#ffffff',
          itemColor: 'rgba(255, 255, 255, 0.9)',
          hoverBg: 'rgba(255, 255, 255, 0.1)',
          activeBg: 'rgba(255, 255, 255, 0.15)',
          dropdownBg: 'rgba(18, 18, 24, 0.96)',
          dropdownBorder: 'rgba(255, 255, 255, 0.12)',
          dropdownItemColor: '#e5e7eb',
          accentColor: '#00ffff',
          clockColor: 'rgba(255, 255, 255, 0.7)',
        };
    }
  };

  const tStyles = getThemeStyles();

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

  const menuItemStyle: React.CSSProperties = {
    padding: '8px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    color: tStyles.dropdownItemColor,
    transition: 'background 0.15s ease',
    borderRadius: '6px',
    userSelect: 'none',
  };

  const menuContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '32px',
    background: tStyles.dropdownBg,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${tStyles.dropdownBorder}`,
    borderRadius: '8px',
    boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
    padding: '6px',
    minWidth: '200px',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  };

  const navItemBtnStyle = (menuId: MenuId): React.CSSProperties => ({
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    background: activeMenu === menuId ? tStyles.activeBg : 'transparent',
    color: tStyles.itemColor,
    fontWeight: activeMenu === menuId ? 600 : 400,
    transition: 'all 0.15s ease',
  });

  return (
    <>
      <div ref={navRef} style={{
        height: '32px',
        width: '100vw',
        background: tStyles.navBg,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${tStyles.navBorder}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        color: tStyles.itemColor,
        fontSize: '13px',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 50,
        userSelect: 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease'
      }}>
        {/* Left Side: Brand and Menus */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <div style={{
            fontWeight: 800,
            color: tStyles.brandColor,
            letterSpacing: '0.5px',
            padding: '4px 10px',
            marginRight: '6px',
            transition: 'color 0.3s ease'
          }}>
            coreSHell
          </div>

          {/* Terminal Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'terminal' ? null : 'terminal')}
              style={navItemBtnStyle('terminal')}
              onMouseEnter={(e) => {
                if (activeMenu !== 'terminal') e.currentTarget.style.background = tStyles.hoverBg;
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== 'terminal') e.currentTarget.style.background = 'transparent';
              }}
            >
              Terminal
            </div>
            {activeMenu === 'terminal' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleRestartSession}
                >
                  <RotateCcw size={15} color={tStyles.accentColor} />
                  <span>Restart Session</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { clearHistory(); setActiveMenu(null); showToast('Terminal cleared'); }}
                >
                  <Trash2 size={15} color={tStyles.accentColor} />
                  <span>Clear Screen</span>
                </div>
                {isAuthenticated && (
                  <div
                    style={{ ...menuItemStyle, borderTop: `1px solid ${tStyles.dropdownBorder}`, marginTop: '4px', paddingTop: '6px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={handleLogout}
                  >
                    <LogOut size={15} color="#ff6b6b" />
                    <span>Log Out</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* File Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              style={navItemBtnStyle('file')}
              onMouseEnter={(e) => {
                if (activeMenu !== 'file') e.currentTarget.style.background = tStyles.hoverBg;
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== 'file') e.currentTarget.style.background = 'transparent';
              }}
            >
              File
            </div>
            {activeMenu === 'file' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleExportLog}
                >
                  <Download size={15} color={tStyles.accentColor} />
                  <span>Export Session Log (.log)</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleCopyTranscript}
                >
                  <Copy size={15} color={tStyles.accentColor} />
                  <span>Copy Full Transcript</span>
                </div>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              style={navItemBtnStyle('edit')}
              onMouseEnter={(e) => {
                if (activeMenu !== 'edit') e.currentTarget.style.background = tStyles.hoverBg;
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== 'edit') e.currentTarget.style.background = 'transparent';
              }}
            >
              Edit
            </div>
            {activeMenu === 'edit' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={handleCopyLastOutput}
                >
                  <Copy size={15} color={tStyles.accentColor} />
                  <span>Copy Last Output</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { clearHistory(); setActiveMenu(null); showToast('Buffer cleared'); }}
                >
                  <Trash2 size={15} color={tStyles.accentColor} />
                  <span>Reset Buffer</span>
                </div>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
              style={navItemBtnStyle('view')}
              onMouseEnter={(e) => {
                if (activeMenu !== 'view') e.currentTarget.style.background = tStyles.hoverBg;
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== 'view') e.currentTarget.style.background = 'transparent';
              }}
            >
              View
            </div>
            {activeMenu === 'view' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div style={{ padding: '6px 14px', fontSize: '11px', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                    onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => {
                      setTheme(t.id);
                      setActiveMenu(null);
                      showToast(`Switched theme to ${t.name}`);
                    }}
                  >
                    <span>{t.name}</span>
                    {theme === t.id && <Check size={14} color={tStyles.accentColor} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Menu */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setActiveMenu(activeMenu === 'help' ? null : 'help')}
              style={navItemBtnStyle('help')}
              onMouseEnter={(e) => {
                if (activeMenu !== 'help') e.currentTarget.style.background = tStyles.hoverBg;
              }}
              onMouseLeave={(e) => {
                if (activeMenu !== 'help') e.currentTarget.style.background = 'transparent';
              }}
            >
              Help
            </div>
            {activeMenu === 'help' && (
              <div style={{ ...menuContainerStyle, left: 0 }}>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { setActiveMenu(null); setIsCommandModalOpen(true); }}
                >
                  <Terminal size={15} color={tStyles.accentColor} />
                  <span>Command Reference</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { setActiveMenu(null); setIsArchModalOpen(true); }}
                >
                  <HelpCircle size={15} color={tStyles.accentColor} />
                  <span>Architecture Overview</span>
                </div>
                <div
                  style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.background = tStyles.hoverBg)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => {
                    setActiveMenu(null);
                    window.open('https://github.com/v0x9/coreSHELL', '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink size={15} color={tStyles.accentColor} />
                  <span>GitHub Repository</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center / Spacer */}
        <div style={{ flex: 1 }}></div>

        {/* Right Side: Clean Clock & Logout */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: tStyles.clockColor, fontSize: '12px' }}>
            <span>{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              title="Log out"
              style={{
                background: 'none',
                border: 'none',
                color: tStyles.itemColor,
                opacity: 0.75,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '4px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.color = '#ff6b6b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.75';
                e.currentTarget.style.color = tStyles.itemColor;
              }}
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Floating Toast Feedback */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '44px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: tStyles.dropdownBg,
          color: tStyles.dropdownItemColor,
          border: `1px solid ${tStyles.dropdownBorder}`,
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
          <Check size={14} color={tStyles.accentColor} />
          <span>{toast}</span>
        </div>
      )}

      {/* Modals */}
      <CommandReferenceModal isOpen={isCommandModalOpen} onClose={() => setIsCommandModalOpen(false)} />
      <ArchitectureModal isOpen={isArchModalOpen} onClose={() => setIsArchModalOpen(false)} />
    </>
  );
};
