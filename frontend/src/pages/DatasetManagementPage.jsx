import React, { useState, useEffect } from 'react';
import { 
  Database, Upload, Download, CheckCircle2, AlertCircle, 
  FileText, RefreshCw, Layers, ShieldCheck, ArrowDownToLine 
} from 'lucide-react';
import travelApi from '../services/api';

export default function DatasetManagementPage() {
  const [summary, setSummary] = useState(null);
  const [previewTab, setPreviewTab] = useState('cleaned');
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await travelApi.getDatasetSummary();
      setSummary(res.data);
    } catch (err) {
      console.error('Error fetching dataset summary:', err);
    }
  };

  const fetchPreview = async (tab) => {
    setLoadingPreview(true);
    try {
      const res = tab === 'raw' 
        ? await travelApi.getRawPreview(30)
        : await travelApi.getCleanedPreview(30);
      setPreviewData(res.data);
    } catch (err) {
      console.error('Error fetching preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchPreview(previewTab);
  }, [previewTab]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadStatus(null);
    try {
      const res = await travelApi.uploadDataset(formData);
      setUploadStatus({ type: 'success', message: res.data.message });
      fetchSummary();
      fetchPreview(previewTab);
    } catch (err) {
      setUploadStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'Upload failed' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2">
            <span>ETL Pipeline & Dataset Management Repository</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono border border-emerald-500/30">
              Pandas & NumPy ETL
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of Extract, Transform, Load operations with data validation and deduplication.
          </p>
        </div>

        {/* Download CSVs */}
        <div className="flex items-center space-x-2">
          <a
            href="http://127.0.0.1:8000/api/datasets/download/raw"
            download
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 text-xs font-medium flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Raw CSV</span>
          </a>
          <a
            href="http://127.0.0.1:8000/api/datasets/download/cleaned"
            download
            className="px-3 py-1.5 rounded-xl bg-electric-cyan/15 hover:bg-electric-cyan/25 text-electric-cyan border border-electric-cyan/30 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Cleaned CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Cards: ETL Quality Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Raw Ingested Records</div>
          <div className="text-xl font-mono font-black text-white mt-1">
            {summary?.raw_records_count?.toLocaleString() || '8,170'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Prior to transformation</div>
        </div>

        <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Duplicates Removed</div>
          <div className="text-xl font-mono font-black text-amber-400 mt-1">
            {summary?.duplicate_records_removed?.toLocaleString() || '18'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Identical schedule rows</div>
        </div>

        <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Missing Values Imputed</div>
          <div className="text-xl font-mono font-black text-electric-cyan mt-1">
            {summary?.missing_values_imputed?.toLocaleString() || '122'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Route baseline fallback</div>
        </div>

        <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Outliers Flagged (IQR)</div>
          <div className="text-xl font-mono font-black text-purple-400 mt-1">
            {summary?.outliers_flagged?.toLocaleString() || '657'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Luxury business fares</div>
        </div>

        <div className="p-4 rounded-xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl col-span-2 lg:col-span-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">Final Cleaned Records</div>
          <div className="text-xl font-mono font-black text-emerald-400 mt-1">
            {summary?.cleaned_records_count?.toLocaleString() || '8,152'}
          </div>
          <div className="text-[10px] text-emerald-500 mt-0.5">Loaded into MySQL (3NF)</div>
        </div>
      </div>

      {/* Cleaning Narrative Audit */}
      <div className="p-4 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl text-xs space-y-1.5">
        <div className="flex items-center space-x-2 text-slate-300 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Automated ETL Audit Summary:</span>
        </div>
        <p className="text-slate-300 leading-relaxed pl-6">
          {summary?.cleaning_summary}
        </p>
      </div>

      {/* CSV Dataset Upload Modal Box */}
      <div className="p-5 rounded-2xl bg-midnight-900/70 border border-dashed border-electric-cyan/40 backdrop-blur-xl shadow-glass flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Upload className="w-4 h-4 text-electric-cyan" />
            <span>Upload Custom Travel Dataset (CSV)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Upload any compatible travel schedule CSV. The ETL pipeline will automatically detect nulls, deduplicate rows, and store verified data in MySQL.
          </p>
        </div>

        <div>
          <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-gradient-to-r from-electric-cyan to-electric-blue text-midnight-950 font-bold text-xs shadow-neon-cyan hover:shadow-neon-blue transition-all inline-flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Processing ETL...' : 'Select CSV File'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadStatus && (
        <div className={`p-4 rounded-xl text-xs flex items-center space-x-2 ${
          uploadStatus.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border border-red-500/30 text-red-300'
        }`}>
          {uploadStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Dataset Preview Tabs */}
      <div className="p-5 rounded-2xl bg-midnight-900/60 border border-white/10 backdrop-blur-xl shadow-glass space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewTab('cleaned')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                previewTab === 'cleaned'
                  ? 'bg-electric-cyan text-midnight-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cleaned Dataset Preview ({summary?.cleaned_records_count?.toLocaleString()} rows)
            </button>
            <button
              onClick={() => setPreviewTab('raw')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                previewTab === 'raw'
                  ? 'bg-electric-cyan text-midnight-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw Dataset Preview ({summary?.raw_records_count?.toLocaleString()} rows)
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Showing first 30 records
          </span>
        </div>

        {loadingPreview ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-electric-cyan mx-auto mb-2" />
            <p className="text-xs">Loading dataset preview...</p>
          </div>
        ) : previewData?.preview && (
          <div className="overflow-x-auto max-h-[420px] custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 bg-midnight-950/40 sticky top-0">
                  {previewData.columns.map((col, idx) => (
                    <th key={idx} className="p-2.5 font-mono font-semibold">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewData.preview.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                    {previewData.columns.map((col, cIdx) => (
                      <td key={cIdx} className="p-2.5 font-mono text-slate-200 whitespace-nowrap">
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
