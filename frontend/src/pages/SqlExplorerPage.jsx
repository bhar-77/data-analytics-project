import React, { useState, useEffect } from 'react';
import { 
  Terminal, Play, Clock, Database, ShieldCheck, 
  Table, BarChart2, CheckCircle2, AlertTriangle, Copy, Check 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import travelApi from '../services/api';

export default function SqlExplorerPage() {
  const [predefinedQueries, setPredefinedQueries] = useState([]);
  const [selectedQueryId, setSelectedQueryId] = useState('');
  const [sqlText, setSqlText] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    travelApi.getPredefinedQueries().then((res) => {
      setPredefinedQueries(res.data);
      if (res.data.length > 0) {
        setSelectedQueryId(res.data[0].id);
        setSqlText(res.data[0].sql);
        // Execute initial query
        execute(res.data[0].sql);
      }
    }).catch(console.error);
  }, []);

  const handleSelectPredefined = (id) => {
    setSelectedQueryId(id);
    const item = predefinedQueries.find((q) => q.id === id);
    if (item) {
      setSqlText(item.sql);
      execute(item.sql);
    }
  };

  const execute = async (queryToRun) => {
    const q = queryToRun || sqlText;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await travelApi.executeSql(q);
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Execution error');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(sqlText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find first string column and first number column for quick chart rendering
  const chartConfig = React.useMemo(() => {
    if (!results || !results.rows || results.rows.length === 0) return null;
    const firstRow = results.rows[0];
    let labelKey = null;
    let valueKey = null;

    for (const k of results.columns) {
      const val = firstRow[k];
      if (!labelKey && typeof val === 'string') {
        labelKey = k;
      }
      if (!valueKey && typeof val === 'number') {
        valueKey = k;
      }
    }
    return { labelKey: labelKey || results.columns[0], valueKey: valueKey || results.columns[1] };
  }, [results]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>SQL Analytics Studio & Query Explorer</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-cyan/15 text-electric-cyan font-mono border border-electric-cyan/30">
              MySQL 8.x
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Execute analytical SQL demonstrating CTEs, Window Functions (ROW_NUMBER, LAG), Views, and Subqueries.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Security: <strong className="text-white">Read-Only Enforced</strong></span>
        </div>
      </div>

      {/* Query Selector & Editor */}
      <div className="p-5 rounded-2xl bg-midnight-900/70 border border-white/10 backdrop-blur-xl shadow-glass space-y-4">
        {/* Predefined Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-electric-cyan" />
            <span className="text-xs font-bold text-white">Predefined Analytical Queries:</span>
          </div>

          <select
            value={selectedQueryId}
            onChange={(e) => handleSelectPredefined(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-midnight-800 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-cyan"
          >
            {predefinedQueries.map((q) => (
              <option key={q.id} value={q.id}>{q.title} ({q.category})</option>
            ))}
          </select>
        </div>

        {/* Selected Description */}
        {selectedQueryId && (
          <p className="text-xs text-slate-300 italic">
            {predefinedQueries.find((q) => q.id === selectedQueryId)?.description}
          </p>
        )}

        {/* SQL Textarea */}
        <div className="relative">
          <textarea
            value={sqlText}
            onChange={(e) => setSqlText(e.target.value)}
            rows={7}
            className="w-full p-4 rounded-xl bg-midnight-950 border border-white/10 text-electric-cyan font-mono text-xs focus:outline-none focus:border-electric-cyan leading-relaxed"
            placeholder="Type your SELECT or WITH query here..."
          />

          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <button
              onClick={copySql}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
              title="Copy SQL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-3 text-xs text-slate-400">
            {results && (
              <>
                <span className="flex items-center space-x-1 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{results.row_count} rows returned</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-electric-cyan" />
                  <span>{results.execution_time_ms} ms</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {results && results.rows?.length > 0 && (
              <div className="flex items-center space-x-1 p-1 bg-midnight-800 rounded-lg border border-white/10 text-xs">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 rounded-md flex items-center space-x-1 text-[11px] font-medium transition-colors ${
                    viewMode === 'table' ? 'bg-electric-cyan text-midnight-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Table className="w-3 h-3" />
                  <span>Table</span>
                </button>
                <button
                  onClick={() => setViewMode('chart')}
                  className={`px-2.5 py-1 rounded-md flex items-center space-x-1 text-[11px] font-medium transition-colors ${
                    viewMode === 'chart' ? 'bg-electric-cyan text-midnight-950 font-bold' : 'text-slate-400'
                  }`}
                >
                  <BarChart2 className="w-3 h-3" />
                  <span>Chart</span>
                </button>
              </div>
            )}

            <button
              onClick={() => execute()}
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-midnight-950 font-extrabold text-xs shadow-neon-cyan hover:shadow-neon-blue transition-all flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-midnight-950" />
              <span>{loading ? 'Executing...' : 'Run SQL'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="font-mono">{error}</div>
        </div>
      )}

      {/* Results Table or Chart */}
      {results && results.rows && (
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          {viewMode === 'table' ? (
            <div className="overflow-x-auto max-h-[420px] custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 bg-midnight-950/40 sticky top-0">
                    {results.columns.map((col, idx) => (
                      <th key={idx} className="p-3 font-semibold font-mono tracking-wider">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                      {results.columns.map((col, cIdx) => (
                        <td key={cIdx} className="p-3 font-mono text-slate-200">
                          {row[col] !== null ? String(row[col]) : <span className="text-slate-500">NULL</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results.rows.slice(0, 15)} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey={chartConfig?.labelKey} stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Bar dataKey={chartConfig?.valueKey} fill="#00f0ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
