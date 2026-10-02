import React, { useState } from 'react';
import {
  X,
  Play,
  Plus,
  Check,
  Download,
  Sparkles,
  ShieldCheck,
  Clock,
  Calendar,
  Film,
  Award,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { MediaItem } from '../types/platform';
import { platformStore } from '../services/platformStore';

interface ContentDetailsModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPlay: (media: MediaItem) => void;
  isInWatchlist: boolean;
  onToggleWatchlist: (mediaId: string) => void;
}

export const ContentDetailsModal: React.FC<ContentDetailsModalProps> = ({
  media,
  isOpen,
  onClose,
  onPlay,
  isInWatchlist,
  onToggleWatchlist,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !media) return null;

  const handleDownload = () => {
    platformStore.startDownload(media, '1080p');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Backdrop Header with Close Button */}
        <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full overflow-hidden bg-slate-950 shrink-0">
          <img
            src={media.backdropUrl}
            alt={media.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white backdrop-blur-md border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Action Row on Backdrop */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onPlay(media);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-black text-sm shadow-xl transition-transform transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Play</span>
              </button>

              <button
                onClick={() => onToggleWatchlist(media.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs backdrop-blur-md border border-slate-700 transition-colors"
              >
                {isInWatchlist ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span>In My List</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to My List</span>
                  </>
                )}
              </button>

              {/* Download for Offline Travel (SRS Section 5) */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-bold text-xs backdrop-blur-md border border-slate-700 transition-colors"
                title="Download to Local Storage for Offline Flight & Travel Playback"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300">Queued for Download!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>Download Offline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs sm:text-sm">
          {/* Metadata badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-emerald-400 font-bold text-sm flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> {media.matchScore}% Match for you
            </span>
            <span className="text-slate-400">{media.releaseYear}</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold border border-slate-600 text-slate-300">
              {media.maturityRating}
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {media.durationMinutes} minutes
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              4K Ultra HD
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              Dolby Atmos 5.1
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> {media.drmType}
            </span>
          </div>

          {/* Title & Tagline */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{media.title}</h2>
            <p className="text-sm font-medium text-cyan-300 italic mt-1">"{media.tagline}"</p>
          </div>

          {/* Description & Crew Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Synopsis & Plot
              </h4>
              <p className="text-slate-300 leading-relaxed text-sm">
                {media.description}
              </p>
            </div>

            <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block">Director:</span>
                <span className="text-white font-semibold">{media.director}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Starring:</span>
                <span className="text-slate-300">{media.cast.join(', ')}</span>
              </div>

              <div>
                <span className="text-slate-500 block">Genres:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {media.genre.map((g) => (
                    <span
                      key={g}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block">Audio & Subtitles:</span>
                <span className="text-slate-400">
                  {media.audioTracks.map((t) => t.label).join(' • ')}
                </span>
              </div>
            </div>
          </div>

          {/* Series Episode Selector (if applicable) */}
          {media.episodes && media.episodes.length > 0 && (
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Season 1 Episodes ({media.episodes.length})
                </h3>
              </div>

              <div className="space-y-3">
                {media.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      onClose();
                      onPlay(media);
                    }}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
                  >
                    <div className="relative aspect-video w-full sm:w-40 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                      <img
                        src={ep.thumbnailUrl}
                        alt={ep.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent flex items-center justify-center transition-colors">
                        <Play className="w-6 h-6 text-white fill-white opacity-80 group-hover:opacity-100" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                          {ep.title}
                        </h4>
                        <span className="text-xs text-slate-400 font-mono">
                          {ep.durationMinutes}m
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {ep.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
