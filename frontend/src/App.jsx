import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import OverviewPage from './pages/OverviewPage';
import FlightsPage from './pages/FlightsPage';
import HotelsPage from './pages/HotelsPage';
import TrainsPage from './pages/TrainsPage';
import BusesPage from './pages/BusesPage';
import PricePredictionPage from './pages/PricePredictionPage';
import DataAnalyticsPage from './pages/DataAnalyticsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import DatasetManagementPage from './pages/DatasetManagementPage';
import SqlExplorerPage from './pages/SqlExplorerPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'dashboard'
  const [activeTab, setActiveTab] = useState('overview');
  const [predictionRoute, setPredictionRoute] = useState(null);

  const handlePredictRoute = (source, destination) => {
    setPredictionRoute({ source, destination });
    setActiveTab('predict');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-midnight-950 text-slate-100 flex flex-col font-sans select-none">
      {view === 'landing' ? (
        <LandingPage onExplore={() => setView('dashboard')} />
      ) : (
        <div className="w-full h-full flex overflow-hidden">
          {/* Frosted Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => {
              setActiveTab(tab);
            }}
            onBackToGlobe={() => setView('landing')}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-midnight-950">
            <Navbar
              activeTab={activeTab}
              onBackToGlobe={() => setView('landing')}
            />

            <main className="flex-1 overflow-y-auto bg-gradient-to-b from-midnight-950 to-midnight-900 custom-scrollbar">
              {activeTab === 'overview' && (
                <OverviewPage onNavigateTab={(tab) => setActiveTab(tab)} />
              )}
              {activeTab === 'flights' && (
                <FlightsPage onPredictRoute={handlePredictRoute} />
              )}
              {activeTab === 'hotels' && <HotelsPage />}
              {activeTab === 'trains' && <TrainsPage />}
              {activeTab === 'buses' && <BusesPage />}
              {activeTab === 'predict' && (
                <PricePredictionPage initialRoute={predictionRoute} />
              )}
              {activeTab === 'analytics' && <DataAnalyticsPage />}
              {activeTab === 'assistant' && <AiAssistantPage />}
              {activeTab === 'datasets' && <DatasetManagementPage />}
              {activeTab === 'sql_explorer' && <SqlExplorerPage />}
              {activeTab === 'reports' && <ReportsPage />}
              {activeTab === 'settings' && <SettingsPage />}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
