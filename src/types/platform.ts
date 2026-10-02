export type MaturityRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';

export type PlanTier = 'basic' | 'standard' | 'premium';

export interface PlanConfig {
  id: PlanTier;
  name: string;
  priceMonthly: number;
  maxScreens: number;
  maxResolution: 'HD (720p)' | 'Full HD (1080p)' | '4K Ultra HD + HDR';
  audioQuality: 'Stereo' | '5.1 Surround' | 'Dolby Atmos Spatial Audio';
  offlineDownloads: boolean;
  features: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  pin?: string; // 4-digit PIN for parental lock
  maxRating: MaturityRating;
  watchlist: string[]; // MediaItem IDs
  history: {
    mediaId: string;
    progressPercent: number;
    lastWatchedAt: string;
  }[];
  languagePreference: string;
}

export interface AudioTrackOption {
  id: string;
  label: string;
  language: string;
  isDolbyAtmos?: boolean;
}

export interface SubtitleTrackOption {
  id: string;
  label: string;
  language: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  description: string;
  durationMinutes: number;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface MediaItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  type: 'movie' | 'series';
  genre: string[];
  maturityRating: MaturityRating;
  releaseYear: number;
  durationMinutes: number;
  matchScore: number; // e.g. 98% Match
  trendingRank?: number;
  director: string;
  cast: string[];
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  introEndSeconds: number; // For "Skip Intro" button
  resolutionsAvailable: ('4K' | '1080p' | '720p' | '480p')[];
  audioTracks: AudioTrackOption[];
  subtitles: SubtitleTrackOption[];
  drmType: 'Widevine L1' | 'FairPlay' | 'PlayReady';
  seasonsCount?: number;
  episodes?: Episode[];
  isFeatured?: boolean;
  isOriginal?: boolean;
}

export interface ActiveSession {
  id: string;
  profileId: string;
  deviceName: string;
  deviceType: 'smart_tv' | 'mobile_ios' | 'mobile_android' | 'web_browser';
  currentMediaTitle: string;
  resolution: string;
  ipAddress: string;
  startedAt: string;
  isCurrentDevice?: boolean;
}

export interface IngestJob {
  id: string;
  title: string;
  rawSizeGb: number;
  status: 'QUEUED' | 'ANALYZING' | 'ENCODING' | 'PACKAGING' | 'CDN_DISTRIBUTED';
  progressPercent: number;
  codecs: ('AV1' | 'H.265 (HEVC)' | 'H.264')[];
  ladder: string[];
  drmProvisioned: boolean;
  edgeNodesPushed: number;
  timestamp: string;
}

export type ViewportMode = 'desktop' | 'ios' | 'android';

export interface OfflineDownloadItem {
  id: string;
  mediaId: string;
  title: string;
  posterUrl: string;
  quality: '720p' | '1080p';
  sizeMb: number;
  status: 'DOWNLOADING' | 'COMPLETED' | 'PAUSED';
  progress: number;
  downloadedAt: string;
  expiresInDays: number;
}
