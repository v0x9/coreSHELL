import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { useTerminalState } from '../stores/terminalStore';

export const TerminalContent: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const terminalStore = useTerminalState();
  const [input, setInput] = useState('');
  const history = useTerminalState((state) => state.history);
  const pushHistory = useTerminalState((state) => state.pushHistory);
  // const clearHistory = useTerminalState((state) => state.clearHistory);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize backend connection
  useEffect(() => {
    let checkSession: ReturnType<typeof setTimeout>;

    const setupTerminal = async () => {
      try {
        if (!terminalStore.connected) {
          await terminalStore.connect();
        }
        if (!terminalStore.sessionId) {
          await terminalStore.startTerminal();
        }

        checkSession = setInterval(() => {
          if (useTerminalState.getState().sessionId) {
            clearInterval(checkSession);
            useTerminalState.getState().attach((output) => {
              // Append incoming output from backend to our custom UI
              pushHistory({ type: 'output', text: output });
            });
            // Only add "Connected successfully" if we didn't just restore a long session
            const currentHistory = useTerminalState.getState().history;
            if (currentHistory.length <= 2) {
              pushHistory({ type: 'output', text: 'Connected successfully.' });
            }
          }
        }, 100);
      } catch (err) {
        pushHistory({ type: 'output', text: `Connection error: ${err}` });
      }
    };

    setupTerminal();

    return () => {
      if (checkSession) clearInterval(checkSession);
      // We don't disconnect the socket on unmount here to avoid React Strict Mode 
      // instantly killing the connection on its test mount/unmount cycle.
    };
  }, []); // Run once on mount

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const getOutputColor = () => {
    switch (theme) {
      case 'matrix': return '#00ff41';
      case 'light': return '#ff00ff';
      case 'vaporwave': return '#00ffff';
      case 'cartoon': return '#ea1266';
      case 'dark':
      default: return '#e0e0e0';
    }
  };

  const getInputColor = () => {
    switch (theme) {
      case 'matrix': return '#ffffff';
      case 'light': return '#333333';
      case 'vaporwave': return '#ffb3ba';
      case 'cartoon': return '#ffffff';
      case 'dark':
      default: return '#ffffff';
    }
  };

  const outputColor = getOutputColor();
  const inputColor = getInputColor();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!input.trim()) return;

      // Add user input to local history visually (it will render in inputColor)
      pushHistory({ type: 'input', text: `> ${input}` });

      // Send it to the backend via sockets
      terminalStore.sendInput(input + '\n');

      setInput('');
    }
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: '15px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    marginTop: '8px',
    color: inputColor,
  };

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: inputColor,
    fontFamily: 'monospace',
    fontSize: '15px',
    outline: 'none',
    flex: 1,
    marginLeft: '8px',
  };

  const getLineStyle = (type: string): React.CSSProperties => {
    const color = type === 'input' ? inputColor : outputColor;
    return {
      marginBottom: '4px',
      color: color,
      opacity: type === 'input' ? 0.9 : 1,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-all'
    };
  };

  return (
    <div style={containerStyle}>
      <div className={`terminal-scroll-container theme-${theme}`} style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {history.map((line, i) => (
          <div key={i} style={getLineStyle(line.type)}>
            {line.text}
          </div>
        ))}
        <div style={inputRowStyle}>
          <span>&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            autoFocus
            spellCheck={false}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
