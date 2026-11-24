import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, PieChart as PieIcon, 
  Layers, MapPin, Activity, ArrowUpRight, ShieldCheck 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, 
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ScatterChart, Scatter 
} from 'recharts';
import travelApi from '../services/api';

export default function DataAnalyticsPage() {
  const [seasonalTrends, setSeasonalTrends] = useState([]);
  const [airlineData, setAirlineData] = useState([]);
  const [mapHubs, setMapHubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      travelApi.getMonthlySeasonalTrends(),
      travelApi.getAirlineComparison(),
      travelApi.getDestinationMapData()
    ]).then(([seasonRes, airlineRes, mapRes]) => {
      setSeasonalTrends(seasonRes.data);
      setAirlineData(airlineRes.data);
      setMapHubs(mapRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Statistical Data Analytics & Fare Distributions</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-electric-cyan/15 text-electric-cyan font-mono border border-electric-cyan/30">
              Relational View Engine
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep analytical breakdown of seasonal variance, airline duration-to-cost efficiency, and travel hub density.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Computed via <strong className="text-white">MySQL Analytical Views</strong></span>
        </div>
      </div>

      {/* Seasonal Trajectory Across Categories */}
      <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white">Monthly Seasonal Fare Trajectories (2025 - 2026)</h3>
          <p className="text-[11px] text-slate-400">Comparing average flight fares vs luxury hotel rates across 12 calendar months</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonalTrends} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="flightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="hotelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                formatter={(val, name) => [`₹${val}`, name === 'flight_avg' ? 'Flight Avg' : 'Hotel Night Avg']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="flight_avg" stroke="#00f0ff" strokeWidth={2.5} fill="url(#flightGrad)" name="Flights Average" />
              <Area type="monotone" dataKey="hotel_avg" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#hotelGrad)" name="Hotels Average" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Airline Flight Duration vs Price Spread */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          <h3 className="text-sm font-bold text-white mb-1">Airline Average Duration vs. Lowest Fare</h3>
          <p className="text-[11px] text-slate-400 mb-4">Direct correlation between average speed and budget accessibility</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={airlineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="code" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`₹${val}`, 'Lowest Fare']}
                />
                <Bar dataKey="min_price" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Lowest Available Fare" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metro Hub Flight Inbound Density */}
        <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass">
          <h3 className="text-sm font-bold text-white mb-1">Travel Hub Inbound Flight Density</h3>
          <p className="text-[11px] text-slate-400 mb-4">Number of inbound flights recorded in MySQL across Indian metro hubs</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mapHubs} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0b1120', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val) => [`${val} flights`, 'Inbound Records']}
                />
                <Bar dataKey="flights_count" fill="#a855f7" radius={[0, 4, 4, 0]} name="Inbound Flights" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
