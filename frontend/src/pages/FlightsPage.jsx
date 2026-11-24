import React, { useState, useEffect } from 'react';
import { 
  Plane, Search, Calendar, Filter, ArrowRight, Clock, 
  Tag, ShieldCheck, Sparkles, AlertCircle, RefreshCw, ChevronDown 
} from 'lucide-react';
import travelApi from '../services/api';

export default function FlightsPage({ onPredictRoute }) {
  const [flights, setFlights] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [source, setSource] = useState('Bengaluru');
  const [destination, setDestination] = useState('Delhi');
  const [selectedAirline, setSelectedAirline] = useState('');
  const [travelClass, setTravelClass] = useState('Economy');
  const [stops, setStops] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');

  // Load Metadata
  useEffect(() => {
    travelApi.getMeta().then((res) => {
      setMeta(res.data);
    }).catch(console.error);
  }, []);

  // Fetch Flights
  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {
        source: source || undefined,
        destination: destination || undefined,
        airline: selectedAirline || undefined,
        travel_class: travelClass || undefined,
        stops: stops !== '' ? parseInt(stops) : undefined,
        sort_by: sortBy
      };
      const res = await travelApi.searchFlights(params);
      setFlights(res.data);
    } catch (err) {
      console.error('Error fetching flights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [source, destination, selectedAirline, travelClass, stops, sortBy]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header & Data Provenance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Domestic Flight Search & Price Comparison</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-electric-cyan/15 text-electric-cyan font-mono border border-electric-cyan/30">
              Authentic Domestic Dataset
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comparing live schedules across IndiGo, Air India, Vistara, SpiceJet, and Akasa Air.
          </p>
        </div>

        {/* Data Source Transparency Banner */}
        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Source: <strong className="text-white">Authentic Airline Schedules</strong></span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Updated: Nov 2026</span>
        </div>
      </div>

      {/* Interactive Search Bar Panel */}
      <div className="p-5 rounded-2xl bg-midnight-900/70 border border-white/10 backdrop-blur-xl shadow-glass space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Source City */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Source City</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-800/80 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-cyan transition-colors"
            >
              {meta?.cities?.map((c) => (
                <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          {/* Destination City */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Destination City</label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-800/80 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-cyan transition-colors"
            >
              {meta?.cities?.map((c) => (
                <option key={c.id} value={c.name}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>

          {/* Airline Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Airline</label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-800/80 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-cyan transition-colors"
            >
              <option value="">All Airlines</option>
              {meta?.airlines?.map((a) => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Travel Class */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Travel Class</label>
            <select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-800/80 border border-white/10 text-white text-xs focus:outline-none focus:border-electric-cyan transition-colors"
            >
              <option value="Economy">Economy</option>
              <option value="Business">Business</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-electric-cyan" />
              <span>Stops:</span>
            </span>
            <div className="flex items-center space-x-1">
              {[
                { label: 'All', val: '' },
                { label: 'Non-Stop (0)', val: '0' },
                { label: '1 Stop', val: '1' },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setStops(s.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    stops === s.val
                      ? 'bg-electric-cyan/20 text-electric-cyan border border-electric-cyan/40 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-midnight-800 border border-white/10 text-white text-xs focus:outline-none"
            >
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="duration_asc">Shortest Duration</option>
            </select>

            <button
              onClick={() => onPredictRoute?.(source, destination)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-electric-purple/20 to-electric-blue/20 border border-electric-purple/40 text-electric-purple text-xs font-semibold hover:border-electric-purple transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Forecast with ML</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flight Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-electric-cyan mx-auto mb-2" />
            <p className="text-xs">Querying flight tables in MySQL...</p>
          </div>
        ) : flights.length === 0 ? (
          <div className="py-16 text-center text-slate-400 rounded-2xl bg-midnight-900/40 border border-white/5">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-white">No Flights Found</p>
            <p className="text-xs text-slate-400 mt-1">Try broadening your route or stops filter.</p>
          </div>
        ) : (
          flights.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 hover:border-electric-cyan/40 backdrop-blur-xl transition-all duration-200 shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              {/* Airline & Number */}
              <div className="flex items-center space-x-4 min-w-[200px]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 flex items-center justify-center font-black text-electric-cyan text-base">
                  {f.airline_code}
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-electric-cyan transition-colors">
                    {f.airline}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {f.flight_number} • <span className="text-slate-300">{f.travel_class}</span>
                  </div>
                </div>
              </div>

              {/* Schedule & Duration */}
              <div className="flex items-center space-x-8 text-center flex-1 max-w-md">
                <div>
                  <div className="text-base font-bold text-white font-mono">{f.departure_time.slice(0, 5)}</div>
                  <div className="text-xs text-slate-400">{f.source_city}</div>
                </div>

                <div className="flex-1 flex flex-col items-center">
                  <div className="text-[11px] text-slate-400 font-mono mb-1">{f.duration_hours} hrs</div>
                  <div className="w-full flex items-center space-x-1">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-electric-cyan/40 to-electric-blue/40" />
                    <Plane className="w-3.5 h-3.5 text-electric-cyan rotate-90" />
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-electric-blue/40 to-electric-purple/40" />
                  </div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-medium">
                    {f.stops === 0 ? 'Non-Stop' : `${f.stops} Stop`}
                  </div>
                </div>

                <div>
                  <div className="text-base font-bold text-white font-mono">{f.arrival_time.slice(0, 5)}</div>
                  <div className="text-xs text-slate-400">{f.destination_city}</div>
                </div>
              </div>

              {/* Pricing & Booking */}
              <div className="flex items-center space-x-6 min-w-[220px] justify-between md:justify-end w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
                <div className="text-right">
                  <div className="text-2xl font-black text-white font-mono tracking-tight">
                    ₹{f.current_price?.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-end space-x-1">
                    <span className="text-slate-500 line-through">₹{f.base_price?.toLocaleString()}</span>
                    <span>• {f.seats_available} seats left</span>
                  </div>
                </div>

                <button 
                  onClick={() => onPredictRoute?.(f.source_city, f.destination_city)}
                  className="px-4 py-2.5 rounded-xl bg-electric-cyan/10 hover:bg-electric-cyan text-electric-cyan hover:text-midnight-950 font-bold text-xs border border-electric-cyan/30 hover:border-transparent transition-all shadow-neon-cyan"
                >
                  Price Insights
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
