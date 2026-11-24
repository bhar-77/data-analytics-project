import React from 'react';
import { 
  LayoutDashboard, Plane, Hotel, Train, Bus, Cpu, 
  BarChart2, Bot, Database, Terminal, FileText, Settings, 
  Compass, ArrowLeft, LogOut 
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'trains', label: 'Trains', icon: Train },
  { id: 'buses', label: 'Buses', icon: Bus },
  { id: 'predict', label: 'Price Prediction', icon: Cpu, badge: 'ML' },
  { id: 'analytics', label: 'Data Analytics', icon: BarChart2 },
  { id: 'assistant', label: 'AI Assistant', icon: Bot, badge: 'Gemini' },
  { id: 'datasets', label: 'Dataset Management', icon: Database },
  { id: 'sql_explorer', label: 'SQL Explorer', icon: Terminal, badge: 'SQL' },
  { id: 'reports', label: 'Reports & Power BI', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onSelectTab, onBackToGlobe }) {
  return (
    <aside className="w-64 min-w-[16rem] h-screen bg-midnight-950/70 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between py-5 px-3 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-3 pb-5 mb-4 border-b border-white/5">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('overview')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-electric-cyan to-electric-blue p-[1px] shadow-neon-cyan">
              <div className="w-full h-full bg-midnight-900 rounded-[11px] flex items-center justify-center">
                <Compass className="w-4 h-4 text-electric-cyan" />
              </div>
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">TravelLens</span>
              <span className="ml-1.5 text-[10px] font-semibold text-electric-cyan uppercase">AI</span>
            </div>
          </div>

          <button
            onClick={onBackToGlobe}
            title="Return to 3D Earth Globe"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-electric-cyan/20 to-electric-blue/10 text-white border border-electric-cyan/40 shadow-neon-cyan/50 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-electric-cyan' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    isActive ? 'bg-electric-cyan text-midnight-950' : 'bg-white/10 text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile / DB Status */}
      <div className="pt-4 border-t border-white/5 px-2">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-electric-blue to-electric-purple flex items-center justify-center text-xs font-bold text-white">
              TL
            </div>
            <div>
              <div className="text-xs font-semibold text-white">TravelLens Pro</div>
              <div className="text-[10px] text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>MySQL 8.0 Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
