import React from 'react';
import {
  Play,
  Plus,
  Check,
  Info,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  Tv,
} from 'lucide-react';
import { MediaItem } from '../types/platform';

interface HeroBannerProps {
  media: MediaItem;
  isInWatchlist: boolean;
  onPlay: (media: MediaItem) => void;
  onToggleWatchlist: (mediaId: string) => void;
  onOpenDetails: (media: MediaItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  media,
  isInWatchlist,
  onPlay,
  onToggleWatchlist,
  onOpenDetails,
}) => {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[750px] overflow-hidden select-none">
      {/* Background Image with Cinematic Gradients */}
      <img
        src={media.backdropUrl}
        alt={media.title}
        className="absolute inset-0 w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
      />

      {/* Radial and Linear Dark Overlays for Netflix-style Contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40 z-10" />

      {/* Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-end pb-16 px-4 sm:px-8 lg:px-12">
        <div className="max-w-2xl space-y-4">
          {/* Badges Strip */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {media.isOriginal && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-red-600 text-white shadow-md shadow-red-600/40">
                PLATFORM ORIGINAL
              </span>
            )}
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> {media.matchScore}% Match
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold border border-slate-600 text-slate-300">
              {media.maturityRating}
            </span>
            <span className="text-slate-300 text-xs font-semibold">{media.releaseYear}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              4K ULTRA HD
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/30">
              DOLBY VISION
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
              ATMOS
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {media.title}
          </h1>

          {/* Tagline */}
          <p className="text-sm sm:text-base font-medium text-cyan-300 italic drop-shadow">
            "{media.tagline}"
          </p>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 max-w-xl drop-shadow">
            {media.description}
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={() => onPlay(media)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-black text-sm transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-white/10"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Play Now</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(media.id)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-sm backdrop-blur-md border border-slate-700 transition-all"
            >
              {isInWatchlist ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>In Watchlist</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Add to List</span>
                </>
              )}
            </button>

            <button
              onClick={() => onOpenDetails(media)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white font-semibold text-sm backdrop-blur-md border border-slate-700/60 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
