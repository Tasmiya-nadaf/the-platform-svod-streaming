import React, { useState } from 'react';
import {
  UploadCloud,
  Cpu,
  Layers,
  Globe2,
  CheckCircle2,
  Clock,
  Play,
  Calendar,
  Sparkles,
  ShieldCheck,
  Server,
  ArrowRight,
  Database,
  Film,
} from 'lucide-react';
import { IngestJob } from '../types/platform';
import { platformStore } from '../services/platformStore';

interface CmsPipelineViewProps {
  ingestJobs: IngestJob[];
  onBackToViewer: () => void;
}

export const CmsPipelineView: React.FC<CmsPipelineViewProps> = ({
  ingestJobs,
  onBackToViewer,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [fileSizeGb, setFileSizeGb] = useState('110');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [isIngesting, setIsIngesting] = useState(false);

  const handleStartIngest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    platformStore.triggerIngestJob(newTitle.trim(), parseFloat(fileSizeGb) || 95);
    setNewTitle('');
    setIsIngesting(true);
    setTimeout(() => setIsIngesting(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/20 to-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
              SRS Section 6 Architecture
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              CMS & Media Encoding Pipeline Portal
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Internal content operations portal for raw ProRes/DNxHR mezzanine file ingest, multi-codec transcoding (AV1, HEVC, H.264), and global CDN distribution.
          </p>
        </div>

        <button
          onClick={onBackToViewer}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-950 hover:bg-slate-200 transition-all shrink-0"
        >
          ← Return to Viewer Experience
        </button>
      </div>

      {/* Grid: Ingest Form + Architecture Lifecycle Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Ingest New Media Mezzanine */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Ingest Video Mezzanine</h3>
              <p className="text-xs text-slate-400">Raw ProRes 422 HQ / IMF Ingestion</p>
            </div>
          </div>

          <form onSubmit={handleStartIngest} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Movie / Episode Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Apex Horizon: Extended 4K Cut"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Raw Size (GB)
                </label>
                <input
                  type="number"
                  value={fileSizeGb}
                  onChange={(e) => setFileSizeGb(e.target.value)}
                  placeholder="120"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Scheduled Release
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-[11px] text-slate-400">
              <span className="font-bold text-white block">Auto-Encoding Targets:</span>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">
                  AV1
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">
                  H.265 (HEVC)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                  H.264
                </span>
              </div>
              <p>Bitrate ladder: 4K 25Mbps, 1080p 8Mbps, 720p 4Mbps, 480p 1.5Mbps.</p>
            </div>

            <button
              type="submit"
              disabled={isIngesting}
              className="w-full py-2.5 rounded-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4" />
              <span>{isIngesting ? 'Initiating Pipeline...' : 'Queue Transcode Pipeline'}</span>
            </button>
          </form>
        </div>

        {/* Pipeline Architecture Diagram */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-white text-sm">Media Ingestion & CDN Lifecycle</h3>
                <p className="text-xs text-slate-400">End-to-end automated streaming delivery flow</p>
              </div>
              <span className="font-mono text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Worker Clusters Active
              </span>
            </div>

            {/* Visual Steps Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-black">
                  1
                </div>
                <h4 className="font-bold text-white">S3 / GCS Ingest</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Mezzanine video intake with checksum validation & audio normalization.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-black">
                  2
                </div>
                <h4 className="font-bold text-white">Transcoding</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Chunked parallel encoding into AV1, HEVC & H.264 across 4 resolutions.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-black">
                  3
                </div>
                <h4 className="font-bold text-white">DRM & Packager</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  CENC Common Encryption with Widevine, FairPlay & PlayReady key injection.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                  4
                </div>
                <h4 className="font-bold text-white">Global Edge CDN</h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Warm edge-caching pushed to 240+ global points of presence (PoP).
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Transcode Job Queue */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Live Ingest & Transcode Queue ({ingestJobs.length})
            </h4>

            <div className="space-y-2.5">
              {ingestJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{job.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        job.status === 'CDN_DISTRIBUTED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${job.progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>
                      {job.codecs.join(' • ')} ({job.rawSizeGb} GB)
                    </span>
                    <span>{job.progressPercent}% Processed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
