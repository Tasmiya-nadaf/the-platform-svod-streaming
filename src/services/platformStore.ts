import {
  MediaItem,
  PlanTier,
  UserProfile,
  ActiveSession,
  IngestJob,
  OfflineDownloadItem,
  MaturityRating,
} from '../types/platform';
import {
  MEDIA_CATALOG,
  INITIAL_PROFILES,
  SUBSCRIPTION_PLANS,
  INITIAL_SESSIONS,
  INITIAL_INGEST_JOBS,
} from '../data/mockCatalog';

const PROFILES_STORAGE_KEY = 'theplatform_profiles_v1';
const PLAN_STORAGE_KEY = 'theplatform_plan_v1';
const SESSIONS_STORAGE_KEY = 'theplatform_sessions_v1';
const INGEST_STORAGE_KEY = 'theplatform_ingest_v1';
const DOWNLOADS_STORAGE_KEY = 'theplatform_downloads_v1';

class PlatformStore {
  private profiles: UserProfile[] = INITIAL_PROFILES;
  private activeProfileId: string = INITIAL_PROFILES[0].id;
  private currentPlan: PlanTier = 'premium';
  private activeSessions: ActiveSession[] = INITIAL_SESSIONS;
  private ingestJobs: IngestJob[] = INITIAL_INGEST_JOBS;
  private downloads: OfflineDownloadItem[] = [];
  private simulatedBandwidthMbps: number = 45; // Default high-speed 4K streaming
  private isMfaEnabled: boolean = true;
  private isTrialActive: boolean = true;

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    if (typeof window === 'undefined') return;

    try {
      const p = localStorage.getItem(PROFILES_STORAGE_KEY);
      if (p) this.profiles = JSON.parse(p);

      const pl = localStorage.getItem(PLAN_STORAGE_KEY);
      if (pl && (pl === 'basic' || pl === 'standard' || pl === 'premium')) {
        this.currentPlan = pl;
      }

      const s = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (s) this.activeSessions = JSON.parse(s);

      const j = localStorage.getItem(INGEST_STORAGE_KEY);
      if (j) this.ingestJobs = JSON.parse(j);

      const d = localStorage.getItem(DOWNLOADS_STORAGE_KEY);
      if (d) this.downloads = JSON.parse(d);
    } catch (e) {
      console.warn('Storage hydration error', e);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(this.profiles));
      localStorage.setItem(PLAN_STORAGE_KEY, this.currentPlan);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(this.activeSessions));
      localStorage.setItem(INGEST_STORAGE_KEY, JSON.stringify(this.ingestJobs));
      localStorage.setItem(DOWNLOADS_STORAGE_KEY, JSON.stringify(this.downloads));
    } catch (e) {
      console.warn('Storage persist error', e);
    }
    this.notify();
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  // --- Profiles API (SRS Section 2: User Profiles & Parental Controls) ---
  public getProfiles(): UserProfile[] {
    return this.profiles;
  }

  public getActiveProfile(): UserProfile {
    const found = this.profiles.find((p) => p.id === this.activeProfileId);
    return found || this.profiles[0];
  }

  public switchProfile(profileId: string): boolean {
    const profile = this.profiles.find((p) => p.id === profileId);
    if (!profile) return false;
    this.activeProfileId = profileId;
    this.notify();
    return true;
  }

  public addProfile(name: string, isKids: boolean, pin?: string, maxRating: MaturityRating = 'R'): boolean {
    if (this.profiles.length >= 5) {
      return false; // SRS: Max 5 profiles per master account
    }

    const avatars = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
    ];
    const avatar = isKids
      ? 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80'
      : avatars[this.profiles.length % avatars.length];

    const newProfile: UserProfile = {
      id: 'profile-' + Date.now(),
      name: name.trim() || 'New Viewer',
      avatar,
      isKids,
      pin: isKids ? (pin || '1234') : pin,
      maxRating: isKids ? 'PG' : maxRating,
      watchlist: [],
      history: [],
      languagePreference: 'English',
    };

    this.profiles.push(newProfile);
    this.persist();
    return true;
  }

  public updateProfile(id: string, partial: Partial<UserProfile>) {
    this.profiles = this.profiles.map((p) => (p.id === id ? { ...p, ...partial } : p));
    this.persist();
  }

  public deleteProfile(id: string): boolean {
    if (this.profiles.length <= 1) return false; // Must keep at least 1 master profile
    this.profiles = this.profiles.filter((p) => p.id !== id);
    if (this.activeProfileId === id) {
      this.activeProfileId = this.profiles[0].id;
    }
    this.persist();
    return true;
  }

  // --- Watchlist & History API ---
  public toggleWatchlist(mediaId: string): boolean {
    const profile = this.getActiveProfile();
    const exists = profile.watchlist.includes(mediaId);
    const updatedWatchlist = exists
      ? profile.watchlist.filter((id) => id !== mediaId)
      : [...profile.watchlist, mediaId];

    this.updateProfile(profile.id, { watchlist: updatedWatchlist });
    return !exists;
  }

  public isInWatchlist(mediaId: string): boolean {
    return this.getActiveProfile().watchlist.includes(mediaId);
  }

  public recordWatchProgress(mediaId: string, progressPercent: number) {
    const profile = this.getActiveProfile();
    const existingIdx = profile.history.findIndex((h) => h.mediaId === mediaId);
    let newHistory = [...profile.history];

    if (existingIdx >= 0) {
      newHistory[existingIdx] = {
        mediaId,
        progressPercent,
        lastWatchedAt: new Date().toISOString(),
      };
    } else {
      newHistory.unshift({
        mediaId,
        progressPercent,
        lastWatchedAt: new Date().toISOString(),
      });
    }

    // Keep recent 20
    newHistory = newHistory.slice(0, 20);
    this.updateProfile(profile.id, { history: newHistory });
  }

  // --- Subscription & Plan Management (SRS Section 1: Executive Summary & SVOD) ---
  public getPlanTier(): PlanTier {
    return this.currentPlan;
  }

  public setPlanTier(tier: PlanTier) {
    this.currentPlan = tier;
    this.persist();
  }

  public getPlanConfig() {
    return SUBSCRIPTION_PLANS[this.currentPlan];
  }

  public isFreeTrialActive() {
    return this.isTrialActive;
  }

  public toggleFreeTrial() {
    this.isTrialActive = !this.isTrialActive;
    this.notify();
  }

  // --- Session Management & Concurrent Screen Enforcement (SRS Section 5) ---
  public getActiveSessions(): ActiveSession[] {
    return this.activeSessions;
  }

  public canStartStream(): { allowed: boolean; maxAllowed: number; currentCount: number } {
    const maxAllowed = SUBSCRIPTION_PLANS[this.currentPlan].maxScreens;
    const currentCount = this.activeSessions.length;
    return {
      allowed: currentCount < maxAllowed,
      maxAllowed,
      currentCount,
    };
  }

  public addActiveSession(deviceName: string, mediaTitle: string): boolean {
    const check = this.canStartStream();
    if (!check.allowed) return false;

    const newSession: ActiveSession = {
      id: 'sess-' + Date.now(),
      profileId: this.activeProfileId,
      deviceName,
      deviceType: 'mobile_android',
      currentMediaTitle: mediaTitle,
      resolution: this.currentPlan === 'premium' ? '4K Ultra HD' : this.currentPlan === 'standard' ? '1080p FHD' : '720p HD',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 200) + 10}`,
      startedAt: 'Just now',
      isCurrentDevice: false,
    };

    this.activeSessions.push(newSession);
    this.persist();
    return true;
  }

  public terminateSession(sessionId: string) {
    this.activeSessions = this.activeSessions.filter((s) => s.id !== sessionId);
    this.persist();
  }

  // --- Adaptive Bitrate Streaming (ABS) & Bandwidth Simulator (SRS Section 3) ---
  public getSimulatedBandwidthMbps(): number {
    return this.simulatedBandwidthMbps;
  }

  public setSimulatedBandwidthMbps(mbps: number) {
    this.simulatedBandwidthMbps = mbps;
    this.notify();
  }

  public calculateAdaptiveResolution(mbps: number): '4K' | '1080p' | '720p' | '480p' {
    const plan = this.getPlanConfig();
    if (mbps >= 25 && plan.maxResolution.includes('4K')) return '4K';
    if (mbps >= 8 && (plan.maxResolution.includes('Full HD') || plan.maxResolution.includes('4K'))) return '1080p';
    if (mbps >= 3.5) return '720p';
    return '480p';
  }

  // --- CMS & Media Encoding Pipeline (SRS Section 6) ---
  public getIngestJobs(): IngestJob[] {
    return this.ingestJobs;
  }

  public triggerIngestJob(title: string, rawSizeGb: number = 95.5) {
    const newJob: IngestJob = {
      id: 'job-' + Date.now(),
      title,
      rawSizeGb,
      status: 'QUEUED',
      progressPercent: 5,
      codecs: ['AV1', 'H.265 (HEVC)', 'H.264'],
      ladder: ['4K 25Mbps', '1080p 8Mbps', '720p 4Mbps'],
      drmProvisioned: true,
      edgeNodesPushed: 0,
      timestamp: 'Just now',
    };

    this.ingestJobs = [newJob, ...this.ingestJobs];
    this.persist();

    // Simulate pipeline progression
    let currentProgress = 5;
    const interval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        clearInterval(interval);
        this.updateIngestJob(newJob.id, {
          status: 'CDN_DISTRIBUTED',
          progressPercent: 100,
          edgeNodesPushed: 180,
        });
      } else if (currentProgress >= 70) {
        this.updateIngestJob(newJob.id, {
          status: 'PACKAGING',
          progressPercent: currentProgress,
        });
      } else if (currentProgress >= 30) {
        this.updateIngestJob(newJob.id, {
          status: 'ENCODING',
          progressPercent: currentProgress,
        });
      }
    }, 1200);
  }

  private updateIngestJob(id: string, partial: Partial<IngestJob>) {
    this.ingestJobs = this.ingestJobs.map((j) => (j.id === id ? { ...j, ...partial } : j));
    this.persist();
  }

  // --- Offline Downloads (SRS Section 5 & Offline Access) ---
  public getDownloads(): OfflineDownloadItem[] {
    return this.downloads;
  }

  public startDownload(media: MediaItem, quality: '720p' | '1080p' = '1080p') {
    if (this.downloads.some((d) => d.mediaId === media.id)) return;

    const sizeMb = quality === '1080p' ? 1420 : 760;
    const item: OfflineDownloadItem = {
      id: 'dl-' + Date.now(),
      mediaId: media.id,
      title: media.title,
      posterUrl: media.posterUrl,
      quality,
      sizeMb,
      status: 'DOWNLOADING',
      progress: 15,
      downloadedAt: new Date().toLocaleDateString(),
      expiresInDays: 30,
    };

    this.downloads.push(item);
    this.persist();

    // Simulate download progress
    let p = 15;
    const interval = setInterval(() => {
      p += 25;
      if (p >= 100) {
        clearInterval(interval);
        this.downloads = this.downloads.map((d) =>
          d.id === item.id ? { ...d, progress: 100, status: 'COMPLETED' } : d
        );
        this.persist();
      } else {
        this.downloads = this.downloads.map((d) =>
          d.id === item.id ? { ...d, progress: p } : d
        );
        this.persist();
      }
    }, 800);
  }

  public removeDownload(downloadId: string) {
    this.downloads = this.downloads.filter((d) => d.id !== downloadId);
    this.persist();
  }

  public isMfaActive() {
    return this.isMfaEnabled;
  }

  public toggleMfa() {
    this.isMfaEnabled = !this.isMfaEnabled;
    this.notify();
  }
}

export const platformStore = new PlatformStore();
