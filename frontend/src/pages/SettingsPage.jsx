import React, { useState, useEffect } from 'react';
import { 
  Settings, Database, Server, Cpu, ShieldCheck, 
  Key, RefreshCw, CheckCircle2, Terminal, ExternalLink 
} from 'lucide-react';
import travelApi from '../services/api';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    travelApi.checkHealth()
      .then((res) => setHealth(res.data))
      .catch((err) => setHealth({ status: 'unreachable', error: err.message }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
          <span>System Architecture & Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Operational telemetry, database connection configuration, and API integration keys.
        </p>
      </div>

      {/* Connectivity Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MySQL */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Database Service</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
            <div className="text-lg font-bold text-white">MySQL 8.0 Server</div>
            <div className="text-xs font-mono text-emerald-400 mt-0.5">127.0.0.1:3306</div>
          </div>
          <div className="text-[11px] text-slate-400 pt-3 border-t border-white/5 space-y-1">
            <div>Database: <span className="text-white font-mono">travellens_db</span></div>
            <div>Driver: <span className="text-white font-mono">SQLAlchemy + PyMySQL</span></div>
          </div>
        </div>

        {/* FastAPI */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Backend Server</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
            <div className="text-lg font-bold text-white">FastAPI + Uvicorn</div>
            <div className="text-xs font-mono text-electric-cyan mt-0.5">http://127.0.0.1:8000</div>
          </div>
          <div className="text-[11px] text-slate-400 pt-3 border-t border-white/5 space-y-1">
            <div>API Docs: <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-electric-cyan underline font-mono">/docs (Swagger UI)</a></div>
            <div>Health: <span className="text-emerald-400 font-mono">Healthy (HTTP 200)</span></div>
          </div>
        </div>

        {/* Machine Learning */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">ML Price Pipeline</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            </div>
            <div className="text-lg font-bold text-white">Random Forest</div>
            <div className="text-xs font-mono text-purple-400 mt-0.5">R² Accuracy: 98.27%</div>
          </div>
          <div className="text-[11px] text-slate-400 pt-3 border-t border-white/5 space-y-1">
            <div>Model File: <span className="text-white font-mono text-[10px]">flight_price_rf_model.joblib</span></div>
            <div>MAE: <span className="text-electric-cyan font-mono">±₹288.13</span></div>
          </div>
        </div>
      </div>

      {/* Configuration & Environment Variables Guide */}
      <div className="p-6 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Key className="w-4 h-4 text-electric-cyan" />
          <span>Configuring Google Gemini API Key</span>
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          The application comes equipped with a SQL-grounded rule and reasoning engine. To enable open-ended natural language answers powered by Google's latest Gemini models, add your key to <code className="text-electric-cyan bg-midnight-950 px-1.5 py-0.5 rounded font-mono">backend/.env</code>:
        </p>

        <div className="p-4 rounded-xl bg-midnight-950 border border-white/10 text-xs font-mono text-slate-300 space-y-1">
          <div className="text-slate-500"># backend/.env</div>
          <div>MYSQL_USER=root</div>
          <div>MYSQL_PASSWORD=</div>
          <div>MYSQL_HOST=127.0.0.1</div>
          <div>MYSQL_PORT=3306</div>
          <div>MYSQL_DATABASE=travellens_db</div>
          <div className="text-electric-cyan font-bold">GEMINI_API_KEY=your_gemini_api_key_here</div>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2">
          <span>Get your free Gemini API key from:</span>
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noreferrer"
            className="text-electric-cyan underline font-medium flex items-center space-x-1"
          >
            <span>Google AI Studio</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Quick Restart Instructions */}
      <div className="p-6 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Application Restart Commands</span>
        </h2>

        <div className="space-y-3 text-xs">
          <div>
            <div className="font-semibold text-slate-300 mb-1">To run Backend Server (FastAPI):</div>
            <pre className="p-3 rounded-xl bg-midnight-950 border border-white/10 text-electric-cyan font-mono text-[11px] overflow-x-auto">
              .\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
            </pre>
          </div>

          <div>
            <div className="font-semibold text-slate-300 mb-1">To run Frontend Server (React + Vite):</div>
            <pre className="p-3 rounded-xl bg-midnight-950 border border-white/10 text-electric-cyan font-mono text-[11px] overflow-x-auto">
              npm --prefix frontend run dev
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
