import React from 'react';
import { useThemeStore } from '../stores/themeStore';

export const Navbar: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);

  const getThemeColor = () => {
    switch (theme) {
      case 'matrix': return '#00ff41';
      case 'cyberpunk': return '#ff00ff';
      case 'vaporwave': return '#00ffff';
      case 'dark':
      default: return '#ffffff';
    }
  };

  return (
    <div style={{
      height: '32px',
      width: '100vw',
      background: 'rgba(15, 15, 19, 0.4)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      color: 'white',
      fontSize: '13px',
      fontFamily: 'Inter, sans-serif',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: 50,
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', color: getThemeColor(), textShadow: `0 0 10px ${getThemeColor()}` }}>
          OCS
        </div>
        <div style={{ opacity: 0.8, cursor: 'pointer' }}>Terminal</div>
        <div style={{ opacity: 0.8, cursor: 'pointer' }}>File</div>
        <div style={{ opacity: 0.8, cursor: 'pointer' }}>Edit</div>
        <div style={{ opacity: 0.8, cursor: 'pointer' }}>View</div>
        <div style={{ opacity: 0.8, cursor: 'pointer' }}>Help</div>
      </div>
      <div style={{ flex: 1 }}></div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', opacity: 0.8 }}>
        <span>{new Date().toLocaleDateString()}</span>
        <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};
