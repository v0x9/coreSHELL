import React, { useState } from 'react';
import { useThemeStore } from '../stores/themeStore';
import type { ThemeName } from '../stores/themeStore';
import { Settings, X } from 'lucide-react';
import { Rnd } from 'react-rnd';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const themes: { id: ThemeName; name: string; color1: string; color2: string }[] = [
    { id: 'dark', name: 'Dark Mode', color1: '#ffffff', color2: '#e0e0e0' },
    { id: 'matrix', name: 'White / Green', color1: '#ffffff', color2: '#00ff41' },
    { id: 'light', name: 'Light Mode', color1: '#333333', color2: '#ff00ff' },
    { id: 'vaporwave', name: 'Pink / Cyan', color1: '#ffb3ba', color2: '#00ffff' },
    { id: 'cartoon', name: 'White / Magenta', color1: '#ffffff', color2: '#ea1266' },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(15, 15, 19, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          zIndex: 100,
        }}
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <Rnd
      default={{
        x: window.innerWidth - 320,
        y: window.innerHeight - 300,
        width: 300,
        height: 250,
      }}
      bounds="window"
      dragHandleClassName="settings-drag"
      style={{ zIndex: 100 }}
    >
      <div style={{
        background: 'rgba(15, 15, 19, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        color: 'white',
        overflow: 'hidden'
      }}>
        <div className="settings-drag" style={{
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'move',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>Appearance Settings</span>
          <X size={16} style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
        </div>
        
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          <div style={{ marginBottom: '8px', fontSize: '12px', opacity: 0.7 }}>Theme / Background</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {themes.map((t) => (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: `1px solid ${theme === t.id ? t.color2 : 'rgba(255,255,255,0.1)'}`,
                  background: 'rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${t.color1} 50%, ${t.color2} 50%)`,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}></div>
                <span style={{ fontSize: '14px' }}>{t.name}</span>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '24px', fontSize: '12px', opacity: 0.7 }}>
            User#: 40 Mr Greedy
          </div>
        </div>
      </div>
    </Rnd>
  );
};
