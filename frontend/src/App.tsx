import React from 'react';
import './App.css';
import { Background } from './components/Background';
import { TerminalWindow } from './components/TerminalWindow';
import { TerminalContent } from './components/TerminalContent';
import { Navbar } from './components/Navbar';
import { ThemeSelector } from './components/ThemeSelector';

function App() {
  return (
    <div className="app-container">
      <Background />
      <Navbar />
      
      {/* We add a small offset here so the terminal doesn't overlap the navbar by default */}
      <div style={{ paddingTop: '50px', height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto', width: '100%', height: '100%' }}>
          <TerminalWindow>
            <TerminalContent />
          </TerminalWindow>
        </div>
      </div>
      
      <ThemeSelector />
    </div>
  );
}

export default App;
