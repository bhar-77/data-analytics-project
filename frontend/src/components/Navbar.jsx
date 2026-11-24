import React from 'react';
import { Globe, Bell, Sparkles, Database, Search } from 'lucide-react';

export default function Navbar({ activeTab, onBackToGlobe, onOpenSearch }) {
  const titles = {
    overview: 'Executive Travel Intelligence Overview',
    flights: 'Flight Search, Comparison & Trend Analytics',
    hotels: 'Premium Hotel Listings & Amenities',
    trains: 'Indian Railways (IRCTC) Schedules & Fares',
    buses: 'Intercity Luxury Coach & Sleeper Bus Routes',
    predict: 'Random Forest Machine Learning Price Predictor',
    analytics: 'Statistical Analytics & Fare Variance Engine',
    assistant: 'Google Gemini AI Travel Intelligence Assistant',
    datasets: 'ETL Pipeline & Travel Dataset Repository',
    sql_explorer: 'Interactive SQL Query Explorer & Analytics Studio',
    reports: 'Business Intelligence & Microsoft Power BI Hub',
    settings: 'System Architecture & Database Configuration',
  };

  return (
    <header className="h-16 px-6 bg-midnight-950/60 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-20">
      {/* Title & Path */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center space-x-2">
          <span>{titles[activeTab] || 'Dashboard'}</span>
        </h2>
        <p className="text-[11px] text-slate-400">Live MySQL 8.x • travellens_db • Authenticated</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* 3D Earth Toggle Button */}
        <button
          onClick={onBackToGlobe}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 border border-white/10 transition-all hover:border-electric-cyan/40"
        >
          <Globe className="w-3.5 h-3.5 text-electric-cyan" />
          <span className="hidden sm:inline">3D Earth View</span>
        </button>

        {/* Live DB Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-mono">
          <Database className="w-3 h-3" />
          <span>MySQL 3306</span>
        </div>

        {/* AI Badge */}
        <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-electric-purple/10 border border-electric-purple/20 text-[11px] text-electric-purple font-mono">
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">Gemini AI</span>
        </div>
      </div>
    </header>
  );
}
