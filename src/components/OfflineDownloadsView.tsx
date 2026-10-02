import React from 'react';
import {
  Download,
  Play,
  Trash2,
  HardDrive,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { OfflineDownloadItem, MediaItem } from '../types/platform';
import { MEDIA_CATALOG } from '../data/mockCatalog';
import { platformStore } from '../services/platformStore';

interface OfflineDownloadsViewProps {
  downloads: OfflineDownloadItem[];
  onPlayMedia: (media: MediaItem) => void;
  onBrowseCatalog: () => void;
}

export const OfflineDownloadsView: React.FC<OfflineDownloadsViewProps> = ({
  downloads,
  onPlayMedia,
  onBrowseCatalog,
}) => {
  const totalStorageMb = downloads.reduce((acc, d) => acc + d.sizeMb, 0);
  const totalStorageGb = (totalStorageMb / 1024).toFixed(2);

  const handlePlayDownloaded = (mediaId: string) => {
    const found = MEDIA_CATALOG.find((m) => m.id === mediaId);
    if (found) onPlayMedia(found);
  };

  const handleRemove = (id: string) => {
    platformStore.removeDownload(id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Storage Gauge */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Download className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Offline Access & Downloads
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Downloaded encrypted video content available for airplane and offline commuting playback.
          </p>
        </div>

        {/* Device Storage Meter */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 sm:w-72 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-bold">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" /> Device Storage
            </span>
            <span className="text-white font-mono font-bold">{totalStorageGb} GB used</span>
          </div>

          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              style={{ width: `${Math.min(100, (parseFloat(totalStorageGb) / 64) * 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>{downloads.length} title(s) downloaded</span>
            <span>64 GB device capacity</span>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      {downloads.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-cyan-400 mx-auto flex items-center justify-center border border-slate-700">
            <Download className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Offline Downloads Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Going offline on a flight or commute? Tap "Download Offline" on any movie or series to store encrypted offline video streams on your device.
          </p>
          <button
            onClick={onBrowseCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all"
          >
            <span>Browse Movies & Series</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex gap-4 transition-all group"
            >
              <div className="relative aspect-[2/3] w-24 rounded-xl overflow-hidden bg-slate-950 shrink-0">
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.status === 'COMPLETED' ? (
                  <button
                    onClick={() => handlePlayDownloaded(item.mediaId)}
                    className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-colors"
                  >
                    <Play className="w-6 h-6 text-white fill-white" />
                  </button>
                ) : (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-cyan-400 font-mono font-bold">
                    {item.progress}%
                  </div>
                )}
              </div>

              <div className="flex-1 flex flex-col justify-between py-1 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="font-mono text-cyan-300 font-semibold">{item.quality}</span>
                    <span>•</span>
                    <span>{item.sizeMb} MB</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ready for Offline Play</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-slate-500">
                      Expires in {item.expiresInDays} days
                    </span>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition-colors"
                      title="Delete Download"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
