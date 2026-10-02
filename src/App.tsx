import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Plus,
  Check,
  Info,
  Sparkles,
  Flame,
  ShieldCheck,
  TrendingUp,
  Film,
  Tv,
  Layers,
  Search,
  Download,
  Baby,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import {
  MediaItem,
  UserProfile,
  PlanTier,
  ViewportMode,
  MaturityRating,
} from './types/platform';
import { platformStore } from './services/platformStore';
import { MEDIA_CATALOG } from './data/mockCatalog';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ContentCard } from './components/ContentCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ContentDetailsModal } from './components/ContentDetailsModal';
import { ProfileModal } from './components/ProfileModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DRMSessionDrawer } from './components/DRMSessionDrawer';
import { CmsPipelineView } from './components/CmsPipelineView';
import { OfflineDownloadsView } from './components/OfflineDownloadsView';
import { ExportModal } from './components/ExportModal';
import { DeviceSimulator } from './components/DeviceSimulator';

export default function App() {
  // Store reactive state
  const [profiles, setProfiles] = useState<UserProfile[]>(platformStore.getProfiles());
  const [activeProfile, setActiveProfile] = useState<UserProfile>(platformStore.getActiveProfile());
  const [currentPlan, setCurrentPlan] = useState<PlanTier>(platformStore.getPlanTier());
  const [activeSessions, setActiveSessions] = useState(platformStore.getActiveSessions());
  const [ingestJobs, setIngestJobs] = useState(platformStore.getIngestJobs());
  const [downloads, setDownloads] = useState(platformStore.getDownloads());

  // UI state
  const [activeTab, setActiveTab] = useState<
    'browse' | 'movies' | 'series' | 'mylist' | 'downloads' | 'cms'
  >('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');

  // Active modals
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const [selectedMediaDetails, setSelectedMediaDetails] = useState<MediaItem | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isDrmDrawerOpen, setIsDrmDrawerOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Subscribe to platform store changes
  useEffect(() => {
    const unsub = platformStore.subscribe(() => {
      setProfiles([...platformStore.getProfiles()]);
      setActiveProfile({ ...platformStore.getActiveProfile() });
      setCurrentPlan(platformStore.getPlanTier());
      setActiveSessions([...platformStore.getActiveSessions()]);
      setIngestJobs([...platformStore.getIngestJobs()]);
      setDownloads([...platformStore.getDownloads()]);
    });
    return () => {
      unsub();
    };
  }, []);

  // Parental Control Filter (SRS Section 2)
  // Rating Hierarchy: G < PG < PG-13 < R < NC-17
  const ratingWeights: Record<MaturityRating | string, number> = {
    G: 1,
    PG: 2,
    'PG-13': 3,
    'TV-MA': 4,
    R: 4,
    'NC-17': 5,
  };

  const allowedCatalog = useMemo(() => {
    const userMaxWeight = ratingWeights[activeProfile.maxRating] || 5;
    return MEDIA_CATALOG.filter((item) => {
      const itemWeight = ratingWeights[item.maturityRating] || 3;
      return itemWeight <= userMaxWeight;
    });
  }, [activeProfile]);

  // Filtered by Search or Category
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allowedCatalog.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.genre.some((g) => g.toLowerCase().includes(q)) ||
        item.director.toLowerCase().includes(q) ||
        item.cast.some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [allowedCatalog, searchQuery]);

  // Featured Hero Item
  const heroMedia = allowedCatalog.find((m) => m.isFeatured) || allowedCatalog[0];

  // Curated Content Rows
  const trendingNow = useMemo(() => {
    return [...allowedCatalog].sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));
  }, [allowedCatalog]);

  const recommendedForYou = useMemo(() => {
    return [...allowedCatalog].sort((a, b) => b.matchScore - a.matchScore);
  }, [allowedCatalog]);

  const actionAndSciFi = useMemo(() => {
    return allowedCatalog.filter((m) =>
      m.genre.some((g) => ['Sci-Fi', 'Action', 'Cyberpunk', 'Speed'].includes(g))
    );
  }, [allowedCatalog]);

  const familyAndKids = useMemo(() => {
    return allowedCatalog.filter(
      (m) =>
        m.maturityRating === 'G' ||
        m.maturityRating === 'PG' ||
        m.genre.includes('Kids & Family') ||
        m.genre.includes('Animation')
    );
  }, [allowedCatalog]);

  const platformOriginals = useMemo(() => {
    return allowedCatalog.filter((m) => m.isOriginal);
  }, [allowedCatalog]);

  const myWatchlistItems = useMemo(() => {
    return allowedCatalog.filter((m) => activeProfile.watchlist.includes(m.id));
  }, [allowedCatalog, activeProfile]);

  // Handlers
  const handlePlayMedia = (media: MediaItem) => {
    // Check concurrent screen limit
    const screenCheck = platformStore.canStartStream();
    if (!screenCheck.allowed) {
      setIsDrmDrawerOpen(true);
      return;
    }
    setPlayingMedia(media);
  };

  const handleToggleWatchlist = (mediaId: string) => {
    platformStore.toggleWatchlist(mediaId);
  };

  const handleOpenDetails = (media: MediaItem) => {
    setSelectedMediaDetails(media);
  };

  // Main Feed / Body Renderer
  const renderFeedContent = () => {
    // 1. Search Results Override
    if (searchQuery.trim()) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-red-500" />
              <span>Search Results for "{searchQuery}"</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {searchResults.length} title(s) found
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <p className="text-slate-300 font-bold">No movies or series match your search</p>
              <p className="text-xs text-slate-500">
                Try searching for "Sci-Fi", "Animation", "Action", or actor names.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {searchResults.map((item) => (
                <ContentCard
                  key={item.id}
                  media={item}
                  isInWatchlist={activeProfile.watchlist.includes(item.id)}
                  onPlay={handlePlayMedia}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // 2. CMS & Media Encoding Pipeline View
    if (activeTab === 'cms') {
      return (
        <CmsPipelineView
          ingestJobs={ingestJobs}
          onBackToViewer={() => setActiveTab('browse')}
        />
      );
    }

    // 3. Offline Downloads View
    if (activeTab === 'downloads') {
      return (
        <OfflineDownloadsView
          downloads={downloads}
          onPlayMedia={handlePlayMedia}
          onBrowseCatalog={() => setActiveTab('browse')}
        />
      );
    }

    // 4. "My List" Tab
    if (activeTab === 'mylist') {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <span>{activeProfile.name}’s Watchlist</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                {myWatchlistItems.length}
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Personalized saved movies and television series for offline travel or later viewing.
            </p>
          </div>

          {myWatchlistItems.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <h3 className="text-lg font-bold text-white">Your Watchlist is Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Explore the catalog and tap "+ Add to List" to save movies and shows directly to your profile.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {myWatchlistItems.map((item) => (
                <ContentCard
                  key={item.id}
                  media={item}
                  isInWatchlist={true}
                  onPlay={handlePlayMedia}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // 5. Filtered to "Movies" only
    if (activeTab === 'movies') {
      const moviesOnly = allowedCatalog.filter((m) => m.type === 'movie');
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
          <h1 className="text-2xl font-black text-white">Feature Films & Movies</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {moviesOnly.map((item) => (
              <ContentCard
                key={item.id}
                media={item}
                isInWatchlist={activeProfile.watchlist.includes(item.id)}
                onPlay={handlePlayMedia}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        </div>
      );
    }

    // 6. Filtered to "Series" only
    if (activeTab === 'series') {
      const seriesOnly = allowedCatalog.filter((m) => m.type === 'series');
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
          <h1 className="text-2xl font-black text-white">Original Television & Miniseries</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {seriesOnly.map((item) => (
              <ContentCard
                key={item.id}
                media={item}
                isInWatchlist={activeProfile.watchlist.includes(item.id)}
                onPlay={handlePlayMedia}
                onToggleWatchlist={handleToggleWatchlist}
                onOpenDetails={handleOpenDetails}
              />
            ))}
          </div>
        </div>
      );
    }

    // 7. Default Full Home Browse Feed (Hero Banner + Categorized Grids)
    return (
      <div className="space-y-10 pb-16">
        {/* Cinematic Hero Banner */}
        {heroMedia && (
          <HeroBanner
            media={heroMedia}
            isInWatchlist={activeProfile.watchlist.includes(heroMedia.id)}
            onPlay={handlePlayMedia}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenDetails={handleOpenDetails}
          />
        )}

        {/* Content Rows */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Row 1: Trending Top 10 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <span>Trending Now Top 10</span>
              </h2>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:none]">
              {trendingNow.map((item, idx) => (
                <ContentCard
                  key={item.id}
                  media={item}
                  isInWatchlist={activeProfile.watchlist.includes(item.id)}
                  onPlay={handlePlayMedia}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenDetails={handleOpenDetails}
                  rankBadge={idx + 1}
                />
              ))}
            </div>
          </div>

          {/* Row 2: Top Picked for You (AI Recommendation Engine) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>Top Picked for {activeProfile.name}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  AI-driven recommendation score based on your viewing history
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:none]">
              {recommendedForYou.map((item) => (
                <ContentCard
                  key={item.id}
                  media={item}
                  isInWatchlist={activeProfile.watchlist.includes(item.id)}
                  onPlay={handlePlayMedia}
                  onToggleWatchlist={handleToggleWatchlist}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          </div>

          {/* Row 3: The Platform Originals */}
          {platformOriginals.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>The Platform Originals (4K Ultra HD)</span>
              </h2>

              <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:none]">
                {platformOriginals.map((item) => (
                  <ContentCard
                    key={item.id}
                    media={item}
                    isInWatchlist={activeProfile.watchlist.includes(item.id)}
                    onPlay={handlePlayMedia}
                    onToggleWatchlist={handleToggleWatchlist}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row 4: Action & Sci-Fi */}
          {actionAndSciFi.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-cyan-400" />
                <span>Action & Futuristic Sci-Fi</span>
              </h2>

              <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:none]">
                {actionAndSciFi.map((item) => (
                  <ContentCard
                    key={item.id}
                    media={item}
                    isInWatchlist={activeProfile.watchlist.includes(item.id)}
                    onPlay={handlePlayMedia}
                    onToggleWatchlist={handleToggleWatchlist}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Row 5: Animation, Family & Kids */}
          {familyAndKids.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Baby className="w-5 h-5 text-amber-400" />
                <span>Animation & Family Favorites</span>
              </h2>

              <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 [scrollbar-width:none]">
                {familyAndKids.map((item) => (
                  <ContentCard
                    key={item.id}
                    media={item}
                    isInWatchlist={activeProfile.watchlist.includes(item.id)}
                    onPlay={handlePlayMedia}
                    onToggleWatchlist={handleToggleWatchlist}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </div>
            </div>
          )}

          {/* SRS Project Submission CTA Footer Strip */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-950 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600/20 text-red-400 border border-red-500/30">
                  SRS Ready for Submission
                </span>
                <h3 className="text-lg font-black text-white">
                  "The Platform" SVOD Mobile & Web Project Bundle
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Complete React Native + Firebase code bundle satisfying all SRS sections: Adaptive Bitrate Streaming (ABS), Multi-Profiles & Parental Locks, Multi-DRM Content Protection, Concurrent Session limits, and CMS Transcoding Pipeline.
              </p>
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/30 transition-all shrink-0"
            >
              Export Project (.ZIP) & SRS Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Top SVOD Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeProfile={activeProfile}
        onOpenProfiles={() => setIsProfileModalOpen(true)}
        onOpenSubscription={() => setIsSubscriptionModalOpen(true)}
        onOpenDrmSessions={() => setIsDrmDrawerOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        viewportMode={viewportMode}
        onSelectViewport={setViewportMode}
        activeScreensCount={activeSessions.length}
      />

      {/* Main Viewport Content */}
      {viewportMode === 'desktop' ? (
        <main className="flex-1 w-full">{renderFeedContent()}</main>
      ) : (
        <DeviceSimulator
          mode={viewportMode}
          onExit={() => setViewportMode('desktop')}
          isOnline={true}
        >
          {renderFeedContent()}
        </DeviceSimulator>
      )}

      {/* Interactive Video Player Modal (ABS + Skip Intro + Speed + Multi-audio) */}
      <VideoPlayerModal
        media={playingMedia}
        isOpen={Boolean(playingMedia)}
        onClose={() => setPlayingMedia(null)}
        onSelectNextMedia={(next) => setPlayingMedia(next)}
      />

      {/* Media Details Modal */}
      <ContentDetailsModal
        media={selectedMediaDetails}
        isOpen={Boolean(selectedMediaDetails)}
        onClose={() => setSelectedMediaDetails(null)}
        onPlay={handlePlayMedia}
        isInWatchlist={
          selectedMediaDetails
            ? activeProfile.watchlist.includes(selectedMediaDetails.id)
            : false
        }
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Multi-Profile & Parental Controls Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={profiles}
        activeProfile={activeProfile}
      />

      {/* Subscription & Plan Tiers Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlan={currentPlan}
      />

      {/* DRM & Concurrent Session Management Drawer */}
      <DRMSessionDrawer
        isOpen={isDrmDrawerOpen}
        onClose={() => setIsDrmDrawerOpen(false)}
        sessions={activeSessions}
        currentPlan={currentPlan}
      />

      {/* Project Exporter & SRS Submission Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
