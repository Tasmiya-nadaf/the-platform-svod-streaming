import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sliders,
  Radio,
  Subtitles,
  AudioLines,
  Gauge,
  FastForward,
  ShieldCheck,
  Check,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { MediaItem } from '../types/platform';
import { platformStore } from '../services/platformStore';

interface VideoPlayerModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectNextMedia?: (next: MediaItem) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media,
  isOpen,
  onClose,
  onSelectNextMedia,
}) => {
  if (!isOpen || !media) return null;

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Adaptive Bitrate Streaming (ABS) & Quality
  const [qualityMode, setQualityMode] = useState<'auto' | '4K' | '1080p' | '720p' | '480p'>('auto');
  const [simulatedBandwidth, setSimulatedBandwidth] = useState(platformStore.getSimulatedBandwidthMbps());
  const [activeAudioTrack, setActiveAudioTrack] = useState(media.audioTracks[0]?.id || 'en');
  const [activeSubtitle, setActiveSubtitle] = useState<string>('sub-en'); // Default English CC

  // UI menus & Intro skip
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showAudioSubMenu, setShowAudioSubMenu] = useState(false);
  const [showBandwidthSim, setShowBandwidthSim] = useState(false);
  const [showDrmBadge, setShowDrmBadge] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate current ABS resolution based on bandwidth simulation
  const effectiveResolution =
    qualityMode === 'auto'
      ? platformStore.calculateAdaptiveResolution(simulatedBandwidth)
      : qualityMode;

  const getBitrateEstimate = (res: string) => {
    switch (res) {
      case '4K': return '24.5 Mbps (HEVC/AV1)';
      case '1080p': return '7.8 Mbps (H.264/HEVC)';
      case '720p': return '3.6 Mbps (H.264)';
      default: return '1.4 Mbps (H.264 SD)';
    }
  };

  // Activity timer to hide controls after inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      // Track viewing progress in store
      if (duration > 0) {
        const percent = Math.round((cur / duration) * 100);
        platformStore.recordWatchProgress(media.id, percent);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  const handleSkipSeconds = (delta: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    }
  };

  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = media.introEndSeconds;
      setCurrentTime(media.introEndSeconds);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const handleBandwidthChange = (newMbps: number) => {
    setSimulatedBandwidth(newMbps);
    platformStore.setSimulatedBandwidthMbps(newMbps);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Determine if Skip Intro button should be visible (e.g. before introEndSeconds)
  const isIntroWindow = currentTime > 3 && currentTime < media.introEndSeconds;

  return (
    <div
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center select-none overflow-hidden"
    >
      {/* HTML5 Native Video Stream */}
      <video
        ref={videoRef}
        src={media.videoUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        playsInline
        autoPlay
      />

      {/* "Skip Intro" Button (SRS Section 3: Playback Controls) */}
      {isIntroWindow && (
        <button
          onClick={handleSkipIntro}
          className="absolute bottom-28 right-8 z-40 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm border-2 border-white/80 shadow-2xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <FastForward className="w-4 h-4 text-cyan-400" />
          <span>Skip Intro</span>
        </button>
      )}

      {/* Subtitles Overlay Preview */}
      {activeSubtitle !== 'off' && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center max-w-xl px-4">
          <span className="bg-black/75 px-3 py-1 rounded text-white text-sm sm:text-base font-medium shadow-md">
            [Dialogue & Sound Effects • {media.title}]
          </span>
        </div>
      )}

      {/* Top Header Bar (Media Title, Back button, DRM badge) */}
      <div
        className={`absolute top-0 inset-x-0 p-6 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/40 to-transparent transition-opacity duration-300 z-40 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700 transition-colors"
            title="Exit Player"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <h2 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
              <span>{media.title}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {media.maturityRating}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Playing on The Platform • {media.releaseYear} • {media.genre.join(', ')}
            </p>
          </div>
        </div>

        {/* Live ABS Status & DRM Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* DRM Status Indicator */}
          <button
            onClick={() => setShowDrmBadge(!showDrmBadge)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 shadow-sm"
            title="Digital Rights Management (DRM) Status"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{media.drmType} Encrypted</span>
          </button>

          {/* Adaptive Bitrate Streaming (ABS) Dynamic Badge */}
          <button
            onClick={() => setShowBandwidthSim(!showBandwidthSim)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900/90 transition-colors"
            title="Click to adjust simulated bandwidth (ABS engine test)"
          >
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>ABS: {effectiveResolution}</span>
            <span className="text-[10px] text-cyan-400 font-mono hidden md:inline">
              ({simulatedBandwidth} Mbps)
            </span>
          </button>
        </div>
      </div>

      {/* Bandwidth Simulator Drawer/Popup */}
      {showBandwidthSim && (
        <div className="absolute top-20 right-6 z-50 w-72 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-xs text-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-cyan-400" />
              ABS Bandwidth Simulator
            </span>
            <button
              onClick={() => setShowBandwidthSim(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Slide network bandwidth to test real-time dynamic Adaptive Bitrate Streaming resolution switching.
          </p>

          <div className="space-y-2">
            <div className="flex justify-between font-mono font-bold text-cyan-300">
              <span>Bandwidth:</span>
              <span>{simulatedBandwidth} Mbps</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              step="1"
              value={simulatedBandwidth}
              onChange={(e) => handleBandwidthChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>1 Mbps (SD)</span>
              <span>10 Mbps (FHD)</span>
              <span>50 Mbps (4K)</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800 font-mono text-[11px] space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Stream Codec:</span>
              <span className="text-white font-bold">AV1 / HEVC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Profile:</span>
              <span className="text-emerald-400 font-bold">{effectiveResolution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Bitrate:</span>
              <span className="text-slate-300">{getBitrateEstimate(effectiveResolution)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 z-40 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber / Timeline Slider */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-mono text-slate-300 w-12 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 group">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600 hover:h-2.5 transition-all"
            />
          </div>

          <span className="text-xs font-mono text-slate-400 w-12">
            {formatTime(duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Controls: Play, Skip 10s, Volume */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={togglePlay}
              className="p-2.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 shadow-md transition-transform transform active:scale-90"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              )}
            </button>

            <button
              onClick={() => handleSkipSeconds(-10)}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Rewind 10 Seconds"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleSkipSeconds(10)}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              title="Fast Forward 10 Seconds"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-2 group">
              <button
                onClick={toggleMute}
                className="text-slate-300 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-red-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 accent-red-600 cursor-pointer h-1.5 bg-slate-700 rounded"
              />
            </div>
          </div>

          {/* Right Controls: Audio/Subtitles, Speed, Quality, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs relative">
            {/* Audio & Subtitles Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowAudioSubMenu(!showAudioSubMenu);
                  setShowQualityMenu(false);
                  setShowSpeedMenu(false);
                }}
                className="flex items-center gap-1.5 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Audio Tracks & Subtitles"
              >
                <Subtitles className="w-4 h-4" />
                <span className="hidden sm:inline">Audio & Subs</span>
              </button>

              {showAudioSubMenu && (
                <div className="absolute bottom-12 right-0 w-64 bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl z-50 text-xs">
                  <div className="font-bold text-white mb-2 flex items-center gap-1.5">
                    <AudioLines className="w-3.5 h-3.5 text-cyan-400" /> Audio Track
                  </div>
                  <div className="space-y-1 mb-3">
                    {media.audioTracks.map((trk) => (
                      <button
                        key={trk.id}
                        onClick={() => {
                          setActiveAudioTrack(trk.id);
                          setShowAudioSubMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                          activeAudioTrack === trk.id
                            ? 'bg-red-600/20 text-red-400 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{trk.label}</span>
                        {activeAudioTrack === trk.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>

                  <div className="font-bold text-white mb-2 flex items-center gap-1.5 pt-2 border-t border-slate-800">
                    <Subtitles className="w-3.5 h-3.5 text-amber-400" /> Subtitles
                  </div>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setActiveSubtitle('off');
                        setShowAudioSubMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                        activeSubtitle === 'off'
                          ? 'bg-red-600/20 text-red-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>Off</span>
                      {activeSubtitle === 'off' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {media.subtitles.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveSubtitle(sub.id);
                          setShowAudioSubMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left ${
                          activeSubtitle === sub.id
                            ? 'bg-red-600/20 text-red-400 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {activeSubtitle === sub.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Playback Speed Button & Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowQualityMenu(false);
                  setShowAudioSubMenu(false);
                }}
                className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-mono font-bold transition-colors"
                title="Playback Speed"
              >
                {playbackSpeed}x
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-12 right-0 w-32 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-50 text-xs">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedSelect(spd)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-mono ${
                        playbackSpeed === spd
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{spd}x</span>
                      {playbackSpeed === spd && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quality & Resolution Switcher (Auto ABS / 4K / 1080p / 720p / 480p) */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowQualityMenu(!showQualityMenu);
                  setShowSpeedMenu(false);
                  setShowAudioSubMenu(false);
                }}
                className="flex items-center gap-1 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-semibold transition-colors"
                title="Streaming Quality"
              >
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs">{qualityMode.toUpperCase()}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-12 right-0 w-44 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-50 text-xs">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Streaming Quality
                  </div>
                  {(['auto', '4K', '1080p', '720p', '480p'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setQualityMode(q);
                        setShowQualityMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-mono ${
                        qualityMode === q
                          ? 'bg-red-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span>{q === 'auto' ? `Auto (${effectiveResolution})` : q}</span>
                      {qualityMode === q && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
