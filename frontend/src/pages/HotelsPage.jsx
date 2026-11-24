import React, { useState, useEffect } from 'react';
import { 
  Hotel, Star, MapPin, Sparkles, ShieldCheck, 
  Wifi, Coffee, Waves, Dumbbell, RefreshCw, CheckCircle2 
} from 'lucide-react';
import travelApi from '../services/api';

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [meta, setMeta] = useState(null);
  const [selectedCity, setSelectedCity] = useState('');
  const [minStar, setMinStar] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    travelApi.getMeta().then((res) => setMeta(res.data)).catch(console.error);
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await travelApi.searchHotels({
        city: selectedCity || undefined,
        min_star: minStar ? parseFloat(minStar) : undefined,
      });
      setHotels(res.data);
    } catch (err) {
      console.error('Error fetching hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [selectedCity, minStar]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Luxury & Business Hotel Listings</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono border border-blue-500/30">
              Verified Properties
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Top rated 5-star & boutique hotels across major Indian metro cities with verified tariffs and amenities.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Source: <strong className="text-white">Travel Portal Aggregation</strong></span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass flex flex-wrap items-center gap-4 text-xs">
        <div className="flex-1 min-w-[200px]">
          <label className="text-slate-400 font-semibold mb-1 block">Filter by Destination</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
          >
            <option value="">All Destinations (8 Metros)</option>
            {meta?.cities?.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="w-48">
          <label className="text-slate-400 font-semibold mb-1 block">Star Rating</label>
          <select
            value={minStar}
            onChange={(e) => setMinStar(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-midnight-800 border border-white/10 text-white focus:outline-none focus:border-electric-cyan"
          >
            <option value="">All Star Ratings</option>
            <option value="5">5 Star Luxury</option>
            <option value="4">4 Star & Above</option>
            <option value="3">3 Star & Above</option>
          </select>
        </div>
      </div>

      {/* Hotels Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-electric-cyan mx-auto mb-2" />
          <p className="text-xs">Fetching hotel records from MySQL...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {hotels.map((h) => (
            <div
              key={h.id}
              className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 hover:border-blue-500/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-glass flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-400 font-bold text-xs">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{h.star_rating} Stars</span>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-slate-400">
                    Rating: <strong className="text-white">{h.user_rating} / 5</strong>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5 leading-snug">{h.name}</h3>
                
                <div className="flex items-center space-x-1 text-slate-400 text-xs mb-3">
                  <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{h.address}</span>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {h.amenities?.map((amen, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-slate-300 border border-white/5"
                    >
                      {amen}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price & Book */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Per Night + Taxes</div>
                  <div className="text-xl font-black text-white font-mono">
                    ₹{h.price_per_night?.toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-emerald-400 font-medium block">
                    {h.available_rooms} rooms available
                  </span>
                  <button className="mt-1 px-3 py-1.5 rounded-lg bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white font-semibold text-xs border border-blue-500/30 transition-colors">
                    Check Rates
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
