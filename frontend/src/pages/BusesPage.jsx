import React, { useState, useEffect } from 'react';
import { Bus, Clock, Star, MapPin, ShieldCheck, RefreshCw } from 'lucide-react';
import travelApi from '../services/api';

export default function BusesPage() {
  const [buses, setBuses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    travelApi.getMeta().then((res) => setMeta(res.data)).catch(console.error);
  }, []);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await travelApi.searchBuses({
        source: source || undefined,
        destination: destination || undefined,
      });
      setBuses(res.data);
    } catch (err) {
      console.error('Error fetching buses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [source, destination]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Intercity Luxury Bus & Coach Services</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-400 font-mono border border-pink-500/30">
              Volvo & Scania AC
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overnight and express routes connecting major state capitals and tech corridors.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Source: <strong className="text-white">Bus Aggregator Portal</strong></span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="text-slate-400 font-semibold mb-1 block">Boarding City</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
          >
            <option value="">All Boarding Points</option>
            {meta?.cities?.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-slate-400 font-semibold mb-1 block">Drop-off City</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
          >
            <option value="">All Drop-off Points</option>
            {meta?.cities?.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Buses List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-electric-cyan mx-auto mb-2" />
            <p className="text-xs">Fetching bus schedules from MySQL...</p>
          </div>
        ) : (
          buses.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 hover:border-pink-500/40 backdrop-blur-xl transition-all shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4 min-w-[240px]">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Bus className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">{b.operator_name}</div>
                  <div className="text-xs text-pink-300 font-medium">{b.bus_type}</div>
                  <div className="flex items-center space-x-1 text-[11px] text-amber-400 mt-1 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{b.rating} / 5</span>
                  </div>
                </div>
              </div>

              {/* Station Route & Timing */}
              <div className="flex items-center space-x-6 text-center flex-1 max-w-sm">
                <div>
                  <div className="text-sm font-bold text-white font-mono">{b.departure_time.slice(0, 5)}</div>
                  <div className="text-xs text-slate-400">{b.source_city}</div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="text-[11px] text-slate-400 font-mono">{b.duration_hours} hrs</div>
                  <div className="w-full h-[2px] bg-gradient-to-r from-pink-500/40 to-rose-500/40 my-1" />
                  <div className="text-[10px] text-slate-500">Highway Route</div>
                </div>

                <div>
                  <div className="text-sm font-bold text-white font-mono">{b.arrival_time.slice(0, 5)}</div>
                  <div className="text-xs text-slate-400">{b.destination_city}</div>
                </div>
              </div>

              {/* Ticket Price */}
              <div className="flex items-center space-x-6 min-w-[180px] justify-between md:justify-end w-full md:w-auto">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Standard Seat</div>
                  <div className="text-2xl font-black text-white font-mono mt-0.5">
                    ₹{b.ticket_price?.toLocaleString()}
                  </div>
                </div>

                <button className="px-4 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500 text-pink-400 hover:text-white font-bold text-xs border border-pink-500/30 transition-colors">
                  Select Seats
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
