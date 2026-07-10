import React from 'react';
import { Background } from '../components/Background';
import { TerminalWindow } from '../components/TerminalWindow';
import { TerminalContent } from '../components/TerminalContent';
import { Navbar } from '../components/Navbar';
import { ThemeSelector } from '../components/ThemeSelector';

export const DashboardPage: React.FC = () => {
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
};
