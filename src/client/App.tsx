// src/client/App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

const AppContent: React.FC = () => {
  return (
    <div>Fullstack Template</div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
