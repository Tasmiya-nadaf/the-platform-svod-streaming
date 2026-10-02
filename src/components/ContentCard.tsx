import React from 'react';
import { Play, Plus, Check, Info, Sparkles } from 'lucide-react';
import { MediaItem } from '../types/platform';

interface ContentCardProps {
  media: MediaItem;
  isInWatchlist: boolean;
  onPlay: (media: MediaItem) => void;
  onToggleWatchlist: (mediaId: string) => void;
  onOpenDetails: (media: MediaItem) => void;
  rankBadge?: number;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  media,
  isInWatchlist,
  onPlay,
  onToggleWatchlist,
  onOpenDetails,
  rankBadge,
}) => {
  return (
    <div className="relative group shrink-0 w-44 sm:w-56 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:z-30">
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 group-hover:border-slate-600 shadow-lg">
        <img
          src={media.posterUrl}
          alt={media.title}
          className="w-full h-full object-cover object-center group-hover:brightness-110 transition-all duration-300"
          loading="lazy"
        />

        {/* Rank Overlay Number for "Trending Top 10" */}
        {typeof rankBadge === 'number' && (
          <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-red-600/90 text-white font-black text-xs flex items-center justify-center shadow-lg border border-red-400">
            #{rankBadge}
          </div>
        )}

        {/* Quality Pill */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/40">
          4K HDR
        </div>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(media);
              }}
              className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-950 flex items-center justify-center shadow-lg transition-transform transform active:scale-90"
              title="Play Now"
            >
              <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(media.id);
              }}
              className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 transition-colors"
              title={isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {isInWatchlist ? (
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(media);
              }}
              className="w-8 h-8 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white flex items-center justify-center border border-slate-700 ml-auto"
              title="More Info"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <span className="text-emerald-400 font-bold">{media.matchScore}% Match</span>
            <span>•</span>
            <span className="border border-slate-600 px-1 rounded text-[9px]">
              {media.maturityRating}
            </span>
            <span>•</span>
            <span>{media.durationMinutes}m</span>
          </div>

          <div className="flex items-center gap-1 mt-1 overflow-hidden">
            {media.genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[9px] text-slate-400 bg-slate-900/90 px-1.5 py-0.5 rounded truncate"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Title under poster */}
      <h3 className="mt-2 text-xs font-bold text-slate-200 group-hover:text-white truncate">
        {media.title}
      </h3>
    </div>
  );
};
