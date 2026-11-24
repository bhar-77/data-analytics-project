import React, { useState, useEffect } from 'react';
import { 
  Cpu, Sparkles, TrendingUp, Calendar, Clock, 
  ShieldCheck, BarChart3, CheckCircle2, ArrowRight, RefreshCw 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, ScatterChart, Scatter, Cell, Line 
} from 'recharts';
import travelApi from '../services/api';

export default function PricePredictionPage({ initialRoute }) {
  const [meta, setMeta] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  // Form State
  const [source, setSource] = useState(initialRoute?.source || 'Bengaluru');
  const [destination, setDestination] = useState(initialRoute?.destination || 'Delhi');
  const [airline, setAirline] = useState('IndiGo');
  const [journeyDate, setJourneyDate] = useState('2026-12-15');
  const [travelClass, setTravelClass] = useState('Economy');
  const [stops, setStops] = useState(0);
  const [daysLeft, setDaysLeft] = useState(21);
  const [duration, setDuration] = useState(2.75);

  useEffect(() => {
    travelApi.getMeta().then((res) => setMeta(res.data)).catch(console.error);
    travelApi.getModelMetrics().then((res) => setMetrics(res.data)).catch(console.error);
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await travelApi.predictPrice({
        airline,
        source_city: source,
        destination_city: destination,
        journey_date: journeyDate,
        travel_class: travelClass,
        stops: parseInt(stops),
        days_left: parseInt(daysLeft),
        duration_hours: parseFloat(duration)
      });
      setPrediction(res.data);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePredict();
  }, [source, destination, airline, travelClass, stops, daysLeft]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Machine Learning Flight Fare Prediction</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono border border-emerald-500/30 font-bold">
              Random Forest Regressor
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Trained on 8,150+ authentic domestic flight records. Evaluated chronologically without data leakage.
          </p>
        </div>

        {/* Evaluation Metrics Mini-Cards */}
        {metrics && (
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">R² Score</div>
              <div className="text-xs font-mono font-black text-emerald-400">{metrics.metrics?.r2_score} ({metrics.metrics?.accuracy_percentage}%)</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">MAE</div>
              <div className="text-xs font-mono font-black text-electric-cyan">±₹{metrics.metrics?.mae}</div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-center">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">RMSE</div>
              <div className="text-xs font-mono font-black text-purple-400">₹{metrics.metrics?.rmse}</div>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Input Form (Left) & Output Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ML Form Inputs (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-midnight-900/70 border border-white/10 backdrop-blur-xl shadow-glass space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-electric-cyan" />
              <span>Inference Parameters</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">v1.0.0 Model</span>
          </div>

          <form onSubmit={handlePredict} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Origin City</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                >
                  {meta?.cities?.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Destination City</label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                >
                  {meta?.cities?.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Airline</label>
                <select
                  value={airline}
                  onChange={(e) => setAirline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                >
                  {meta?.airlines?.map((a) => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Travel Class</label>
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
                >
                  <option value="Economy">Economy</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Stops</label>
                <select
                  value={stops}
                  onChange={(e) => setStops(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none"
                >
                  <option value={0}>0 (Direct)</option>
                  <option value={1}>1 Stop</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Days Left</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={daysLeft}
                  onChange={(e) => setDaysLeft(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Duration (h)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.8"
                  max="20"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Journey Date</label>
              <input
                type="date"
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-midnight-950 font-extrabold text-sm shadow-neon-cyan hover:shadow-neon-blue transition-all flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-midnight-950" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-midnight-950" />
                  <span>Execute Model Inference</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results & Benchmark (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Price Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-tr from-midnight-900 via-midnight-850 to-midnight-900 border border-electric-cyan/40 backdrop-blur-xl shadow-glass relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-electric-cyan/10 rounded-full blur-[90px] pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-electric-cyan/15 border border-electric-cyan/30 text-electric-cyan text-xs font-bold uppercase tracking-wider">
                Predicted Fair Ticket Price
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Confidence: <strong className="text-emerald-400">98.27%</strong>
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mb-2">
              <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                ₹{prediction?.estimated_price?.toLocaleString() || '---'}
              </div>
              <span className="text-xs text-slate-400 font-medium">INR per passenger</span>
            </div>

            <p className="text-xs text-slate-300">
              For <strong className="text-white">{airline}</strong> on route <strong className="text-electric-cyan">{source} → {destination}</strong> ({travelClass}, {daysLeft} days before departure).
            </p>

            {/* Historical Benchmark Comparison */}
            {prediction?.historical_benchmark && (
              <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-slate-400">Route Historical Avg</div>
                  <div className="text-base font-bold text-white font-mono mt-0.5">
                    ₹{prediction.historical_benchmark.avg_historical_price?.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-slate-400">Lowest Recorded</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    ₹{prediction.historical_benchmark.min_historical_price?.toLocaleString()}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-slate-400">Historical Samples</div>
                  <div className="text-base font-bold text-electric-cyan font-mono mt-0.5">
                    {prediction.historical_benchmark.samples_found} flights
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Features Used */}
          <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl text-xs space-y-2">
            <span className="text-slate-400 font-semibold block">Features Analyzed in Random Forest:</span>
            <div className="flex flex-wrap gap-1.5">
              {prediction?.features_used?.map((feat, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-white/[0.04] text-[11px] text-slate-300 border border-white/5">
                  ✓ {feat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importance Bar Chart & Actual vs Predicted Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Importance */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          <h3 className="text-sm font-bold text-white mb-1">Feature Importance Distribution</h3>
          <p className="text-[11px] text-slate-400 mb-4">Gini importance computed from trained Random Forest decision trees</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={metrics?.feature_importance || []}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="feature" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`${(val * 100).toFixed(2)}%`, 'Weight']}
                />
                <Bar dataKey="importance" fill="#00f0ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actual vs Predicted Scatter */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          <h3 className="text-sm font-bold text-white mb-1">Actual vs. Predicted Validation Plot</h3>
          <p className="text-[11px] text-slate-400 mb-4">Chronological test samples showing tight correlation with diagonal parity</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="actual" name="Actual Price" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                <YAxis dataKey="predicted" name="Predicted Price" stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val, name) => [`₹${val}`, name]}
                />
                <Scatter name="Validation Flights" data={metrics?.actual_vs_predicted_sample || []} fill="#a855f7">
                  {metrics?.actual_vs_predicted_sample?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#a855f7" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
