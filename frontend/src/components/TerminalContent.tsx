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
      opacity: type === 'input' ? 0.9 : 1
    };
  };

  return (
    <div style={containerStyle}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
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
