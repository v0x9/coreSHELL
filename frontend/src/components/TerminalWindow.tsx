import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Maximize2, Minus, X } from 'lucide-react';
import { useThemeStore } from '../stores/themeStore';

interface TerminalWindowProps {
  children?: React.ReactNode;
}

export const TerminalWindow: React.FC<TerminalWindowProps> = ({ children }) => {
  const theme = useThemeStore((state) => state.theme);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) return null;

  const getThemeStyles = () => {
    switch (theme) {
      case 'matrix': return { borderColor: '#00ff41', shadow: '0 0 20px rgba(0,255,65,0.2)' };
      case 'cyberpunk': return { borderColor: '#ff00ff', shadow: '0 0 20px rgba(255,0,255,0.2)' };
      case 'vaporwave': return { borderColor: '#00ffff', shadow: '0 0 20px rgba(0,255,255,0.2)' };
      case 'dark':
      default: return { borderColor: 'rgba(255,255,255,0.1)', shadow: '0 8px 32px 0 rgba(0,0,0,0.37)' };
    }
  };

  const themeStyles = getThemeStyles();

  const windowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(15, 15, 19, 0.7)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderRadius: isMaximized ? '0' : '12px',
    border: `1px solid ${themeStyles.borderColor}`,
    boxShadow: themeStyles.shadow,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    transition: 'border 0.3s ease, box-shadow 0.3s ease',
  };

  const headerStyle: React.CSSProperties = {
    height: '40px',
    background: 'rgba(255,255,255,0.05)',
    borderBottom: `1px solid ${themeStyles.borderColor}`,
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    cursor: 'move',
    userSelect: 'none',
  };

  const dotContainer: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
  };

  const dotStyle = (color: string): React.CSSProperties => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: color,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <Rnd
      default={{
        x: window.innerWidth / 2 - 400,
        y: window.innerHeight / 2 - 250,
        width: 800,
        height: 500,
      }}
      minWidth={400}
      minHeight={300}
      bounds="window"
      dragHandleClassName="drag-handle"
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      position={isMaximized ? { x: 0, y: 0 } : undefined}
      size={isMaximized ? { width: '100vw', height: '100vh' } : undefined}
      style={{ zIndex: 10 }}
    >
      <div style={windowStyle}>
        {/* Title Bar */}
        <div className="drag-handle" style={headerStyle}>
          <div style={dotContainer}>
            <div style={dotStyle('#ff5f56')} onClick={() => setIsClosed(true)}>
              <X size={8} color="black" style={{ opacity: 0 }} className="dot-icon" />
            </div>
            <div style={dotStyle('#ffbd2e')}>
              <Minus size={8} color="black" style={{ opacity: 0 }} className="dot-icon" />
            </div>
            <div style={dotStyle('#27c93f')} onClick={() => setIsMaximized(!isMaximized)}>
              <Maximize2 size={8} color="black" style={{ opacity: 0 }} className="dot-icon" />
            </div>
          </div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>
            coreSHell ~ user@local
          </div>
          <div style={{ width: '44px' }}></div> {/* Balancer for flex-center */}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </Rnd>
  );
};
