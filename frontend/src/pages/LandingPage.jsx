import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Compass, ShieldCheck, Database, 
  Cpu, BarChart3, PlaneTakeoff, ChevronRight, Globe2 
} from 'lucide-react';
import EarthGlobe from '../components/EarthGlobe';

export default function LandingPage({ onExplore }) {
  const [isZooming, setIsZooming] = useState(false);

  const handleLaunch = () => {
    setIsZooming(true);
    setTimeout(() => {
      onExplore();
    }, 900);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-midnight-950 text-slate-100 flex flex-col justify-between selection:bg-electric-cyan/20 selection:text-electric-cyan">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-cyan/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[32rem] h-[32rem] bg-electric-purple/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Glass Navigation Bar */}
      <header className="relative z-20 w-full px-6 lg:px-12 py-5 flex items-center justify-between backdrop-blur-md bg-midnight-950/40 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-electric-cyan via-electric-blue to-electric-purple p-[1px] shadow-neon-cyan">
            <div className="w-full h-full bg-midnight-900 rounded-[11px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-electric-cyan animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white">TravelLens</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider bg-electric-cyan/15 text-electric-cyan border border-electric-cyan/30">
                AI 2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Intelligent Travel Search & Price Analytics</p>
          </div>
        </div>

        {/* Live Database Pill & Launch Button */}
        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            <span>MySQL 8.x Connected</span>
            <span className="text-slate-500">•</span>
            <span className="text-electric-cyan font-mono">8,200+ Records</span>
          </div>

          <button
            onClick={handleLaunch}
            className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-lg shadow-glass transition-all duration-300 hover:border-electric-cyan/50 hover:shadow-neon-cyan"
          >
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4 text-electric-cyan" />
          </button>
        </div>
      </header>

      {/* Main 3D Earth Hero Area */}
      <main className="relative flex-1 w-full flex items-center justify-center">
        {/* Full-Screen 3D Interactive Canvas */}
        <div className="absolute inset-0 z-0">
          <EarthGlobe isZooming={isZooming} />
        </div>

        {/* Hero Content Overlay */}
        <AnimatePresence>
          {!isZooming && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(8px)' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative z-10 max-w-4xl mx-auto px-6 text-center pointer-events-none mt-4 lg:mt-0"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-midnight-900/80 border border-electric-cyan/30 backdrop-blur-xl mb-6 shadow-neon-cyan"
              >
                <Sparkles className="w-4 h-4 text-electric-cyan animate-spin" style={{ animationDuration: '6s' }} />
                <span className="text-xs font-medium text-slate-200">
                  Powered by Random Forest ML & Google Gemini AI
                </span>
              </motion.div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
                Travel Smarter.{' '}
                <span className="bg-gradient-to-r from-electric-cyan via-electric-blue to-electric-purple bg-clip-text text-transparent">
                  Spend Less.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
                AI-powered travel intelligence, predictive analytics and smarter journeys across Indian flights, hotels, trains, and buses.
              </p>

              {/* Primary Call to Action Button */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLaunch}
                  className="group relative px-8 py-4 rounded-2xl text-base font-semibold text-midnight-950 bg-gradient-to-r from-electric-cyan via-[#38bdf8] to-electric-blue shadow-neon-cyan hover:shadow-neon-blue transition-all duration-300 flex items-center space-x-3"
                >
                  <span className="font-bold tracking-wide">Explore Travel Intelligence</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.button>
              </div>

              {/* Floating Feature Micro-Pills */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pointer-events-auto">
                {[
                  { icon: Cpu, label: 'Random Forest ML', sub: '98.27% Accuracy' },
                  { icon: Database, label: 'MySQL 8.x Engine', sub: '3NF Normalized' },
                  { icon: BarChart3, label: 'SQL Analytics', sub: 'CTEs & Window Funcs' },
                  { icon: PlaneTakeoff, label: 'Multi-Modal Search', sub: 'Air • Rail • Road' },
                ].map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -3, borderColor: 'rgba(0, 240, 255, 0.4)' }}
                      className="px-4 py-3 rounded-xl bg-midnight-900/70 backdrop-blur-xl border border-white/10 shadow-glass text-left transition-all"
                    >
                      <Icon className="w-4 h-4 text-electric-cyan mb-1.5" />
                      <div className="text-xs font-semibold text-white">{feat.label}</div>
                      <div className="text-[10px] text-slate-400">{feat.sub}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Status Ticker */}
      <footer className="relative z-20 w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 backdrop-blur-md bg-midnight-950/40 border-t border-white/5">
        <div className="flex items-center space-x-4 mb-2 sm:mb-0">
          <span className="flex items-center space-x-1.5">
            <Globe2 className="w-3.5 h-3.5 text-electric-cyan" />
            <span>Bengaluru • Delhi • Mumbai • Chennai • Hyderabad • Kolkata • Pune • Goa</span>
          </span>
        </div>
        <div className="flex items-center space-x-6 text-[11px]">
          <span>FastAPI Backend Active</span>
          <span>•</span>
          <span>Power BI Compatible</span>
          <span>•</span>
          <span className="text-slate-300">© 2026 TravelLens AI</span>
        </div>
      </footer>
    </div>
  );
}
