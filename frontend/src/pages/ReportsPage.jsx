import React from 'react';
import { 
  FileText, Download, BarChart2, Database, ExternalLink, 
  Layers, CheckCircle2, ArrowRight, ShieldCheck, Sparkles 
} from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>Power BI & Business Intelligence Integration</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono border border-amber-500/30">
              Microsoft Power BI
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pre-formatted data models, direct MySQL connection strings, and automated CSV export pipelines.
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-[11px] text-slate-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Format: <strong className="text-white">Star Schema & Power BI CSV</strong></span>
        </div>
      </div>

      {/* Direct CSV Export Downloads for Power BI Desktop */}
      <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Download className="w-4 h-4 text-electric-cyan" />
            <span>Power BI Ready Dataset Exports</span>
          </h2>
          <p className="text-xs text-slate-400">
            Download cleaned datasets formatted with proper PascalCase column names, numeric types, and date serials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {[
            {
              title: 'Flights Master Dataset',
              desc: '8,150+ records with FlightNumber, Airline, Route, DepartureTime, Stops, and CurrentPriceINR.',
              dataset: 'flights',
              color: 'border-cyan-500/30 text-electric-cyan'
            },
            {
              title: 'Monthly Price Trends Index',
              desc: 'Multi-month aggregated category averages, minimums, maximums, and record sample sizes.',
              dataset: 'monthly_trends',
              color: 'border-blue-500/30 text-blue-400'
            },
            {
              title: 'Airline Performance Dimension',
              desc: 'Carrier fleet size, flight frequencies, mean duration, and fare extremes.',
              dataset: 'airlines',
              color: 'border-purple-500/30 text-purple-400'
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-midnight-950/60 border border-white/10 flex flex-col justify-between space-y-3"
            >
              <div>
                <h4 className="text-xs font-bold text-white">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>

              <a
                href={`http://127.0.0.1:8000/api/reports/export/powerbi-csv?dataset=${item.dataset}`}
                download
                className="w-full py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-electric-cyan" />
                <span>Download .CSV</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Step-by-Step Power BI Creation Guide */}
      <div className="p-6 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass space-y-5">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-amber-400" />
            <span>Power BI Dashboard Setup Blueprint</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Follow these instructions to connect Power BI Desktop directly to MySQL or import the exported CSVs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-300">
          {/* Method A */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <span className="text-xs font-bold text-electric-cyan uppercase tracking-wider block">
              Method A: Direct MySQL Database Connection
            </span>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              <li>Open <strong>Microsoft Power BI Desktop</strong>.</li>
              <li>Click <strong>Get Data</strong> → select <strong>MySQL Database</strong>.</li>
              <li>Server: <code className="text-electric-cyan font-mono bg-midnight-950 px-1 py-0.5 rounded">127.0.0.1:3306</code></li>
              <li>Database: <code className="text-electric-cyan font-mono bg-midnight-950 px-1 py-0.5 rounded">travellens_db</code></li>
              <li>Authentication: User <code className="text-white font-mono">root</code> (Default password blank or configured password).</li>
              <li>Select views: <code className="text-purple-300 font-mono">v_airline_performance</code>, <code className="text-purple-300 font-mono">v_route_price_summary</code>, and <code className="text-purple-300 font-mono">v_monthly_category_trends</code>.</li>
            </ol>
          </div>

          {/* Method B */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Method B: Fast CSV Import
            </span>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
              <li>Click the <strong>Download .CSV</strong> buttons above to save datasets locally.</li>
              <li>In Power BI, click <strong>Get Data</strong> → select <strong>Text/CSV</strong>.</li>
              <li>Load <code className="text-white font-mono">PowerBI_TravelLens_Flights.csv</code>.</li>
              <li>Verify that <code className="text-electric-cyan font-mono">CurrentPriceINR</code> is recognized as a Decimal number.</li>
              <li>Create relationships using <code className="text-white font-mono">Route</code> or <code className="text-white font-mono">Airline</code> keys.</li>
            </ol>
          </div>
        </div>

        {/* Recommended Dashboard Visuals Checklist */}
        <div className="pt-4 border-t border-white/5">
          <h3 className="text-xs font-bold text-white mb-3">Recommended Power BI Visuals to Include:</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
            {[
              'Card Visual: Total Travel Records Analysed (8,211)',
              'Card Visual: Average Flight Ticket Price (₹5,288)',
              'Bar Chart: Airline Price Comparison (IndiGo vs Air India vs Vistara)',
              'Line Chart: 12-Month Monthly Seasonal Fare Trends',
              'Donut Chart: Travel Mode Expenditure Distribution',
              'Matrix / Table: Cheapest Routes with Minimum Fares',
              'Slicer / Filter: Source City & Destination City dropdowns',
              'Slicer / Filter: Travel Class (Economy vs Business)',
              'Scatter Plot: Travel Duration (hrs) vs Ticket Price (INR)',
            ].map((v, i) => (
              <div key={i} className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
