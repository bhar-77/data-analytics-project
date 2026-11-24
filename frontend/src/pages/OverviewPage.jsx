import React, { useState, useEffect } from 'react';
import { 
  Plane, Hotel, Train, Bus, TrendingDown, MapPin, 
  ArrowUpRight, Sparkles, Filter, RefreshCw, Clock, ArrowRight 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area 
} from 'recharts';
import travelApi from '../services/api';

export default function OverviewPage({ onNavigateTab }) {
  const [stats, setStats] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [airlineData, setAirlineData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRoute, setSelectedRoute] = useState('blr_delhi');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes, airlineRes, catRes] = await Promise.all([
        travelApi.getDashboardStats(),
        travelApi.getHistoricalTrends(),
        travelApi.getAirlineComparison(),
        travelApi.getCategoryComparison(),
      ]);

      setStats(statsRes.data);
      setHistoryData(historyRes.data);
      setAirlineData(airlineRes.data);
      setCategoryData(catRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-3">
          <RefreshCw className="w-8 h-8 text-electric-cyan animate-spin" />
          <p className="text-sm text-slate-400">Loading authentic MySQL analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Banner & Quick Route Bargain */}
      <div className="relative rounded-2xl p-6 bg-gradient-to-r from-midnight-900/90 via-midnight-850/80 to-midnight-900/90 border border-electric-cyan/20 backdrop-blur-xl shadow-glass overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/30 text-[11px] font-semibold text-electric-cyan mb-1">
            <Sparkles className="w-3 h-3" />
            <span>AI Price Benchmark Engine Online</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Comprehensive Indian Travel Intelligence
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Live analytics derived from <span className="text-electric-cyan font-semibold">{stats?.total_records_analysed?.toLocaleString()} authentic records</span> across Flights, IRCTC Trains, Luxury Buses, and Metro Hotels.
          </p>
        </div>

        {/* Quick Bargain Card */}
        {stats?.cheapest_route && (
          <div className="flex items-center space-x-4 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-lg">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Lowest Available Route</div>
              <div className="text-sm font-bold text-white flex items-center space-x-1">
                <span>{stats.cheapest_route.route}</span>
                <span className="text-slate-500">({stats.cheapest_route.airline})</span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-400">
                ₹{stats.cheapest_route.price?.toLocaleString()}
                <span className="text-[10px] font-normal text-slate-400 ml-1.5">• {stats.cheapest_route.duration} hrs</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Numerical Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Average Flight Price',
            val: `₹${stats?.average_flight_price?.toLocaleString()}`,
            sub: `${stats?.flight_records?.toLocaleString()} Flights Analysed`,
            icon: Plane,
            color: 'from-cyan-500 to-blue-500',
            textColor: 'text-electric-cyan',
            tab: 'flights'
          },
          {
            title: 'Average Hotel Tariff',
            val: `₹${stats?.average_hotel_price?.toLocaleString()}`,
            sub: 'Per Night (5-Star & 4-Star)',
            icon: Hotel,
            color: 'from-blue-500 to-indigo-500',
            textColor: 'text-blue-400',
            tab: 'hotels'
          },
          {
            title: 'Average Train Fare',
            val: `₹${stats?.average_train_fare?.toLocaleString()}`,
            sub: 'Vande Bharat / Rajdhani',
            icon: Train,
            color: 'from-purple-500 to-pink-500',
            textColor: 'text-purple-400',
            tab: 'trains'
          },
          {
            title: 'Average Bus Fare',
            val: `₹${stats?.average_bus_fare?.toLocaleString()}`,
            sub: 'AC Sleeper & Multi-Axle',
            icon: Bus,
            color: 'from-pink-500 to-rose-500',
            textColor: 'text-pink-400',
            tab: 'buses'
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigateTab(kpi.tab)}
              className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 hover:border-electric-cyan/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group shadow-glass"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 font-medium">{kpi.title}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${kpi.color} p-[1px]`}>
                  <div className="w-full h-full bg-midnight-900 rounded-[7px] flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${kpi.textColor}`} />
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-black ${kpi.textColor} font-mono tracking-tight`}>
                {kpi.val}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>{kpi.sub}</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Price Trends Line Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Historical Price Trends & Seasonality</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-electric-cyan/15 text-electric-cyan font-mono">
                  12 Months
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Multi-month price trajectories across key Indian trunk routes</p>
            </div>

            {/* Route Selector */}
            <div className="flex items-center space-x-1 p-1 bg-white/[0.04] rounded-lg border border-white/5 text-xs">
              {[
                { id: 'blr_delhi', label: 'BLR-DEL' },
                { id: 'bom_delhi', label: 'BOM-DEL' },
                { id: 'blr_mumbai', label: 'BLR-BOM' },
                { id: 'bom_goa', label: 'BOM-GOA' },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRoute(r.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    selectedRoute === r.id
                      ? 'bg-electric-cyan text-midnight-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  formatter={(value) => [`₹${value}`, 'Fare']}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedRoute} 
                  stroke="#00f0ff" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#trendGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Travel Category Cost Distribution Donut (1 Col) */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Travel Mode Cost Share</h3>
            <p className="text-[11px] text-slate-400 mb-4">Average expenditure per booking category</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="avg_cost"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`₹${val}`, 'Average Cost']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/5">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center space-x-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.category}</span>
                </span>
                <span className="font-mono font-bold text-white">₹{c.avg_cost?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Airline Comparison Bar Chart & Search Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Airline Comparison (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Domestic Airline Price Competitiveness</h3>
              <p className="text-[11px] text-slate-400">Average vs Minimum fares across domestic operators</p>
            </div>
            <button
              onClick={() => onNavigateTab('predict')}
              className="text-xs text-electric-cyan hover:underline flex items-center space-x-1 font-medium"
            >
              <span>Test ML Predictor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={airlineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="airline" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val, name) => [`₹${val}`, name === 'avg_price' ? 'Average Price' : 'Lowest Price']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="avg_price" fill="#3b82f6" name="Average Fare" radius={[4, 4, 0, 0]} />
                <Bar dataKey="min_price" fill="#00f0ff" name="Lowest Fare" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Database Quick Stats & Most Frequent Destination */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Travel Hub Insights</h3>
            <p className="text-[11px] text-slate-400">Destination density & database telemetry</p>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-electric-purple/10 border border-electric-purple/30 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-electric-purple" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Top Inbound Hub</div>
                <div className="text-base font-extrabold text-white">{stats?.most_frequent_destination?.city}</div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {stats?.most_frequent_destination?.flights_count} incoming scheduled flights
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Relational Database</span>
              <span className="font-mono text-white">MySQL 8.x Community</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Normalization</span>
              <span className="text-electric-cyan font-semibold">Third Normal Form (3NF)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">ML Model</span>
              <span className="text-emerald-400 font-mono">RandomForest (R² 0.9827)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Active Metros</span>
              <span className="text-slate-300">8 Indian Capitals</span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('sql_explorer')}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-electric-blue/20 to-electric-cyan/20 border border-electric-cyan/30 text-white text-xs font-semibold hover:border-electric-cyan transition-colors"
          >
            Launch SQL Query Explorer →
          </button>
        </div>
      </div>
    </div>
  );
}
