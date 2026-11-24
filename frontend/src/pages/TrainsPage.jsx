import React, { useState, useEffect } from 'react';
import { Train, Clock, MapPin, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import travelApi from '../services/api';

export default function TrainsPage() {
  const [trains, setTrains] = useState([]);
  const [meta, setMeta] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    travelApi.getMeta().then((res) => setMeta(res.data)).catch(console.error);
  }, []);

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const res = await travelApi.searchTrains({
        source: source || undefined,
        destination: destination || undefined,
        travel_class: selectedClass || undefined,
      });
      setTrains(res.data);
    } catch (err) {
      console.error('Error fetching trains:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, [source, destination, selectedClass]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Indian Railways (IRCTC) Schedules & Fares</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-mono border border-purple-500/30">
              Vande Bharat & Rajdhani
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authentic timetables and class-wise fares for premier semi-high speed trains and express corridors.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Source: <strong className="text-white">Indian Railways Timetable</strong></span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="text-slate-400 font-semibold mb-1 block">Origin Station</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
          >
            <option value="">All Origin Stations</option>
            {meta?.cities?.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-400 font-semibold mb-1 block">Destination Station</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
          >
            <option value="">All Destination Stations</option>
            {meta?.cities?.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-400 font-semibold mb-1 block">Travel Class</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
          >
            <option value="">All Classes (1A, 2A, 3A, CC, EC, SL)</option>
            <option value="EC">Executive Chair Car (EC)</option>
            <option value="CC">AC Chair Car (CC)</option>
            <option value="1A">AC First Class (1A)</option>
            <option value="2A">AC 2 Tier (2A)</option>
            <option value="3A">AC 3 Tier (3A)</option>
            <option value="SL">Sleeper (SL)</option>
          </select>
        </div>
      </div>

      {/* Train Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-electric-cyan mx-auto mb-2" />
            <p className="text-xs">Fetching train fares from MySQL...</p>
          </div>
        ) : (
          trains.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 min-w-[240px]">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <Train className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">{t.train_name}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    #{t.train_number} • <span className="text-purple-300 font-semibold">{t.runs_on_days}</span>
                  </div>
                </div>
              </div>

              {/* Station Route & Timing */}
              <div className="flex items-center space-x-6 text-center flex-1 max-w-sm">
                <div>
                  <div className="text-sm font-bold text-white font-mono">{t.departure_time.slice(0, 5)}</div>
                  <div className="text-xs text-slate-400">{t.source_city}</div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="text-[11px] text-slate-400 font-mono">{t.duration_hours} hrs</div>
                  <div className="w-full h-[2px] bg-gradient-to-r from-purple-500/40 to-pink-500/40 my-1" />
                  <div className="text-[10px] text-slate-500">Express Corridor</div>
                </div>

                <div>
                  <div className="text-sm font-bold text-white font-mono">{t.arrival_time.slice(0, 5)}</div>
                  <div className="text-xs text-slate-400">{t.destination_city}</div>
                </div>
              </div>

              {/* Class & Fare */}
              <div className="flex items-center space-x-6 min-w-[200px] justify-between md:justify-end w-full md:w-auto">
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                    Class {t.travel_class}
                  </span>
                  <div className="text-xl font-black text-white font-mono mt-1">
                    ₹{t.fare?.toLocaleString()}
                  </div>
                </div>

                <button className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white font-bold text-xs border border-purple-500/30 transition-colors">
                  View Route
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
