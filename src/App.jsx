import { useState, useEffect } from 'react';
import { StoreProvider, useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import ApiKeyModal from './components/ApiKeyModal';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Ideas from './pages/Ideas';
import Scripts from './pages/Scripts';
import Analyzer from './pages/Analyzer';
import Social from './pages/Social';
import Posts from './pages/Posts';
import Constancy from './pages/Constancy';
import Upcoming from './pages/Upcoming';
import Trends from './pages/Trends';
import './App.css';

function MainLayout() {
  const { state } = useStore();
  const [showSettings, setShowSettings] = useState(!state.apiKey);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const renderPage = () => {
    switch (state.page) {
      case 'dashboard': return <Dashboard />;
      case 'calendar': return <Calendar />;
      case 'ideas': return <Ideas />;
      case 'scripts': return <Scripts />;
      case 'analyzer': return <Analyzer />;
      case 'social': return <Social />;
      case 'posts': return <Posts />;
      case 'constancy': return <Constancy />;
      case 'upcoming': return <Upcoming />;
      case 'trends': return <Trends />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar onSettings={() => setShowSettings(true)} />
      
      <main className="main-content">
        {renderPage()}
      </main>

      {showSettings && <ApiKeyModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
}

export default App;
