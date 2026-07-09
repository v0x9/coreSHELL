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
      
      <TerminalWindow>
        <TerminalContent />
      </TerminalWindow>
      
      <ThemeSelector />
    </div>
  );
}

export default App;
