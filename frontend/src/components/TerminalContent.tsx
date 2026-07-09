import React, { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

export const TerminalContent: React.FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'output', text: 'Welcome to coreSHell v2.0' },
    { type: 'output', text: 'Type "help" for a list of commands.' }
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const getTextColor = () => {
    switch (theme) {
      case 'matrix': return '#00ff41';
      case 'cyberpunk': return '#ff00ff';
      case 'vaporwave': return '#00ffff';
      case 'dark':
      default: return '#e0e0e0';
    }
  };

  const textColor = getTextColor();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!input.trim()) return;
      
      const newHistory = [...history, { type: 'input', text: `> ${input}` }];
      
      // Simple mock commands
      if (input === 'help') {
        newHistory.push({ type: 'output', text: 'Available commands: help, clear, echo, date' });
      } else if (input === 'clear') {
        setHistory([]);
        setInput('');
        return;
      } else if (input === 'date') {
        newHistory.push({ type: 'output', text: new Date().toString() });
      } else if (input.startsWith('echo ')) {
        newHistory.push({ type: 'output', text: input.substring(5) });
      } else {
        newHistory.push({ type: 'output', text: `Command not found: ${input}` });
      }
      
      setHistory(newHistory);
      setInput('');
    }
  };

  const containerStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    color: textColor,
    fontSize: '15px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    textShadow: theme !== 'dark' ? `0 0 5px ${textColor}` : 'none',
  };

  const inputRowStyle: React.CSSProperties = {
    display: 'flex',
    marginTop: '8px',
  };

  const inputStyle: React.CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: textColor,
    fontFamily: 'monospace',
    fontSize: '15px',
    outline: 'none',
    flex: 1,
    marginLeft: '8px',
    textShadow: theme !== 'dark' ? `0 0 5px ${textColor}` : 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
        {history.map((line, i) => (
          <div key={i} style={{ marginBottom: '4px', opacity: line.type === 'input' ? 0.7 : 1 }}>
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
