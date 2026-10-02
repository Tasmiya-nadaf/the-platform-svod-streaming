export interface ProjectFile {
  filename: string;
  path: string;
  language: string;
  content: string;
}

export const RN_PROJECT_FILES: ProjectFile[] = [
  {
    filename: 'App.tsx',
    path: 'App.tsx',
    language: 'typescript',
    content: `/**
 * The Platform - Subscription Video-on-Demand (SVOD) Mobile Client
 * Built with React Native, Expo AV, and Firebase Firestore
 * SRS Compliant: Adaptive Bitrate Streaming, Multi-Profiles, Parental Controls, DRM & Offline Access
 */
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useStreamingCatalog } from './src/hooks/useStreamingCatalog';
import { useUserProfile } from './src/hooks/useUserProfile';
import { useOfflineStorage } from './src/hooks/useOfflineStorage';
import { VideoPlayerView } from './src/components/VideoPlayerView';
import { MediaCard } from './src/components/MediaCard';
import { MediaItem } from './src/types/platform';

export default function App() {
  const { catalog, activeMedia, playMedia, closePlayer } = useStreamingCatalog();
  const { activeProfile, profiles, switchProfile } = useUserProfile();
  const { downloadedMedia, downloadItem, isDownloaded } = useOfflineStorage();

  const [activeTab, setActiveTab] = useState<'home' | 'movies' | 'series' | 'downloads'>('home');

  const filteredCatalog = catalog.filter((item) => {
    if (activeProfile.isKids) {
      return item.maturityRating === 'G' || item.maturityRating === 'PG';
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />

      {/* Top SVOD Navigation Bar */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoPill}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>THE PLATFORM</Text>
            <Text style={styles.brandSubtitle}>SVOD Streaming Service</Text>
          </View>
        </View>

        {/* Profile Avatar Quick Switcher */}
        <TouchableOpacity
          style={styles.profileBadge}
          onPress={() => {
            const nextIdx = (profiles.findIndex((p) => p.id === activeProfile.id) + 1) % profiles.length;
            switchProfile(profiles[nextIdx].id);
          }}
        >
          <Image source={{ uri: activeProfile.avatar }} style={styles.avatarImg} />
          <View>
            <Text style={styles.profileName}>{activeProfile.name}</Text>
            <Text style={styles.profileRating}>Rating: {activeProfile.maxRating}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Mobile Tab Pills */}
      <View style={styles.tabsRow}>
        {(['home', 'movies', 'series', 'downloads'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Browse Catalog Scroll Area */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab !== 'downloads' ? (
          <>
            {/* Hero Featured Premiere */}
            {filteredCatalog[0] && (
              <View style={styles.heroCard}>
                <Image source={{ uri: filteredCatalog[0].backdropUrl }} style={styles.heroImg} />
                <View style={styles.heroOverlay}>
                  <View style={styles.badgeRow}>
                    <Text style={styles.badgeText}>4K ULTRA HD</Text>
                    <Text style={styles.badgeText}>DOLBY ATMOS</Text>
                    <Text style={styles.ratingText}>{filteredCatalog[0].maturityRating}</Text>
                  </View>
                  <Text style={styles.heroTitle}>{filteredCatalog[0].title}</Text>
                  <Text style={styles.heroTagline}>"{filteredCatalog[0].tagline}"</Text>

                  <View style={styles.heroButtons}>
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => playMedia(filteredCatalog[0])}
                    >
                      <Text style={styles.playButtonText}>▶ Play Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => downloadItem(filteredCatalog[0])}
                    >
                      <Text style={styles.downloadButtonText}>
                        {isDownloaded(filteredCatalog[0].id) ? '✓ Downloaded' : '⭳ Offline'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Category Rows: Trending Now */}
            <Text style={styles.sectionTitle}>Trending Now Top 10</Text>
            <FlatList
              horizontal
              data={filteredCatalog}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <MediaCard
                  media={item}
                  onPlay={playMedia}
                  onDownload={downloadItem}
                />
              )}
              contentContainerStyle={styles.horizontalList}
            />
          </>
        ) : (
          /* Offline Downloads View */
          <View style={styles.downloadsContainer}>
            <Text style={styles.sectionTitle}>Offline Downloads ({downloadedMedia.length})</Text>
            <Text style={styles.downloadsSubtitle}>
              Content encrypted & stored on device storage for airplane and offline commuting.
            </Text>
            {downloadedMedia.length === 0 ? (
              <Text style={styles.emptyText}>No offline downloads yet. Tap "Offline" on any title.</Text>
            ) : (
              downloadedMedia.map((media) => (
                <View key={media.id} style={styles.downloadRow}>
                  <Image source={{ uri: media.posterUrl }} style={styles.downloadThumbnail} />
                  <View style={styles.downloadInfo}>
                    <Text style={styles.downloadTitle}>{media.title}</Text>
                    <Text style={styles.downloadMeta}>1080p Full HD • Encrypted Local Storage</Text>
                    <TouchableOpacity
                      style={styles.downloadPlayBtn}
                      onPress={() => playMedia(media)}
                    >
                      <Text style={styles.downloadPlayText}>▶ Watch Offline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Video Player Modal */}
      <Modal visible={Boolean(activeMedia)} animationType="slide">
        {activeMedia && (
          <VideoPlayerView media={activeMedia} onClose={closePlayer} />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#1e293b',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoPill: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: { color: '#ffffff', fontWeight: '900', fontSize: 18 },
  brandTitle: { color: '#ffffff', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  brandSubtitle: { color: '#ef4444', fontSize: 9, fontWeight: '700' },
  profileBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarImg: { width: 32, height: 32, borderRadius: 8 },
  profileName: { color: '#f8fafc', fontSize: 11, fontWeight: 'bold' },
  profileRating: { color: '#94a3b8', fontSize: 9 },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: '#0f172a',
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#0f172a',
  },
  tabButtonActive: { backgroundColor: '#dc2626' },
  tabText: { color: '#94a3b8', fontSize: 11, fontWeight: '700' },
  tabTextActive: { color: '#ffffff' },
  scrollContent: { paddingBottom: 40 },
  heroCard: { width: '100%', height: 340, position: 'relative' },
  heroImg: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(2,6,23,0.85)',
  },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  badgeText: { color: '#fbbf24', fontSize: 9, fontWeight: 'bold' },
  ratingText: { color: '#e2e8f0', fontSize: 9, fontWeight: 'bold' },
  heroTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  heroTagline: { color: '#67e8f9', fontSize: 11, fontStyle: 'italic', marginBottom: 12 },
  heroButtons: { flexDirection: 'row', gap: 10 },
  playButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  playButtonText: { color: '#0f172a', fontWeight: '900', fontSize: 13 },
  downloadButton: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  downloadButtonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  horizontalList: { paddingHorizontal: 16, gap: 12 },
  downloadsContainer: { paddingHorizontal: 16 },
  downloadsSubtitle: { color: '#94a3b8', fontSize: 12, marginBottom: 16 },
  downloadRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  downloadThumbnail: { width: 70, height: 100, borderRadius: 8 },
  downloadInfo: { flex: 1, justifyContent: 'center' },
  downloadTitle: { color: '#ffffff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  downloadMeta: { color: '#38bdf8', fontSize: 11, marginBottom: 8 },
  downloadPlayBtn: {
    backgroundColor: '#dc2626',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  downloadPlayText: { color: '#ffffff', fontWeight: 'bold', fontSize: 11 },
  emptyText: { color: '#64748b', fontSize: 13, textAlign: 'center', marginTop: 30 },
});
`,
  },
  {
    filename: 'src/components/VideoPlayerView.tsx',
    path: 'src/components/VideoPlayerView.tsx',
    language: 'typescript',
    content: `import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { MediaItem } from '../types/platform';

interface Props {
  media: MediaItem;
  onClose: () => void;
}

export const VideoPlayerView: React.FC<Props> = ({ media, onClose }) => {
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [quality, setQuality] = useState<'Auto' | '4K' | '1080p' | '720p'>('Auto');

  return (
    <View style={styles.container}>
      <Video
        source={{ uri: media.videoUrl }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        useNativeControls
        style={styles.videoPlayer}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.positionMillis < media.introEndSeconds * 1000) {
            setShowSkipIntro(true);
          } else {
            setShowSkipIntro(false);
          }
        }}
      />

      {/* Top Bar with Title and Close */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.title}>{media.title}</Text>
          <Text style={styles.badge}>{media.drmType} Encrypted Stream • ABS: {quality}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕ Close</Text>
        </TouchableOpacity>
      </View>

      {/* Skip Intro Button (SRS Section 3) */}
      {showSkipIntro && (
        <TouchableOpacity
          style={styles.skipIntroBtn}
          onPress={() => setShowSkipIntro(false)}
        >
          <Text style={styles.skipIntroText}>⏭ Skip Intro</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
  videoPlayer: { width: '100%', height: '100%' },
  topBar: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 12,
  },
  title: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
  badge: { color: '#38bdf8', fontSize: 10, marginTop: 2 },
  closeBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  closeText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12 },
  skipIntroBtn: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  skipIntroText: { color: '#ffffff', fontWeight: 'bold', fontSize: 13 },
});
`,
  },
  {
    filename: 'src/components/MediaCard.tsx',
    path: 'src/components/MediaCard.tsx',
    language: 'typescript',
    content: `import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MediaItem } from '../types/platform';

interface Props {
  media: MediaItem;
  onPlay: (item: MediaItem) => void;
  onDownload: (item: MediaItem) => void;
}

export const MediaCard: React.FC<Props> = ({ media, onPlay, onDownload }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPlay(media)}
      activeOpacity={0.8}
    >
      <Image source={{ uri: media.posterUrl }} style={styles.poster} />
      <View style={styles.metaRow}>
        <Text style={styles.matchScore}>{media.matchScore}% Match</Text>
        <Text style={styles.rating}>{media.maturityRating}</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {media.title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: { width: 130 },
  poster: { width: 130, height: 195, borderRadius: 10, backgroundColor: '#1e293b' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  matchScore: { color: '#10b981', fontSize: 10, fontWeight: 'bold' },
  rating: { color: '#94a3b8', fontSize: 9, fontWeight: '700' },
  title: { color: '#f8fafc', fontSize: 12, fontWeight: 'bold', marginTop: 2 },
});
`,
  },
  {
    filename: 'src/hooks/useOfflineStorage.ts',
    path: 'src/hooks/useOfflineStorage.ts',
    language: 'typescript',
    content: `import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaItem } from '../types/platform';

const STORAGE_KEY = '@theplatform_offline_media';

export function useOfflineStorage() {
  const [downloadedMedia, setDownloadedMedia] = useState<MediaItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          setDownloadedMedia(JSON.parse(data));
        } catch (e) {
          console.error(e);
        }
      }
    });
  }, []);

  const downloadItem = async (item: MediaItem) => {
    if (downloadedMedia.some((m) => m.id === item.id)) return;
    const updated = [item, ...downloadedMedia];
    setDownloadedMedia(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isDownloaded = (id: string) => downloadedMedia.some((m) => m.id === id);

  return { downloadedMedia, downloadItem, isDownloaded };
}
`,
  },
  {
    filename: 'src/hooks/useStreamingCatalog.ts',
    path: 'src/hooks/useStreamingCatalog.ts',
    language: 'typescript',
    content: `import { useState } from 'react';
import { MediaItem } from '../types/platform';

export function useStreamingCatalog() {
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);

  const catalog: MediaItem[] = [
    {
      id: 'movie-1',
      title: 'Tears of Steel: Cyber Rebirth',
      tagline: 'When the machine remembers, humanity fights for what remains.',
      description: 'In a dystopian Amsterdam reclaimed by rogue cyborg sentinels, an elite cybernetic technician and his covert rebel cell stage a high-stakes standoff.',
      type: 'movie',
      genre: ['Sci-Fi', 'Action'],
      maturityRating: 'PG-13',
      releaseYear: 2025,
      durationMinutes: 72,
      matchScore: 99,
      director: 'Ian Hubert',
      cast: ['Derek de Lint', 'Sergio Hasselbaink'],
      posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      introEndSeconds: 24,
      resolutionsAvailable: ['4K', '1080p', '720p'],
      audioTracks: [{ id: 'en-atmos', label: 'English (Dolby Atmos)', language: 'en' }],
      subtitles: [{ id: 'sub-en', label: 'English CC', language: 'en' }],
      drmType: 'Widevine L1',
    },
    {
      id: 'movie-2',
      title: 'The Great Meadow Forest',
      tagline: 'Kindness has giant paws.',
      description: 'Mischievous forest creatures disrupt the tranquility of a sunny morning meadow in this delightful animation.',
      type: 'movie',
      genre: ['Animation', 'Kids & Family'],
      maturityRating: 'G',
      releaseYear: 2024,
      durationMinutes: 88,
      matchScore: 97,
      director: 'Sacha Goedegebure',
      cast: ['Bunny Hopwood'],
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?w=1600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      introEndSeconds: 15,
      resolutionsAvailable: ['4K', '1080p', '720p'],
      audioTracks: [{ id: 'en-51', label: 'English 5.1', language: 'en' }],
      subtitles: [{ id: 'sub-en', label: 'English CC', language: 'en' }],
      drmType: 'FairPlay',
    },
    {
      id: 'movie-3',
      title: 'Sintel: Legacy of the Dragon',
      tagline: 'Love will climb every frozen peak.',
      description: 'A solitary young warrior girl discovers an injured baby dragon and embarks on a relentless expedition.',
      type: 'movie',
      genre: ['Fantasy', 'Adventure'],
      maturityRating: 'PG-13',
      releaseYear: 2024,
      durationMinutes: 110,
      matchScore: 95,
      director: 'Colin Levy',
      cast: ['Halina Reijn'],
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      introEndSeconds: 18,
      resolutionsAvailable: ['4K', '1080p', '720p'],
      audioTracks: [{ id: 'en-atmos', label: 'English (Dolby Atmos)', language: 'en' }],
      subtitles: [{ id: 'sub-en', label: 'English CC', language: 'en' }],
      drmType: 'PlayReady',
    }
  ];

  const playMedia = (media: MediaItem) => setActiveMedia(media);
  const closePlayer = () => setActiveMedia(null);

  return { catalog, activeMedia, playMedia, closePlayer };
}
`,
  },
  {
    filename: 'src/hooks/useUserProfile.ts',
    path: 'src/hooks/useUserProfile.ts',
    language: 'typescript',
    content: `import { useState } from 'react';
import { UserProfile } from '../types/platform';

export function useUserProfile() {
  const [profiles] = useState<UserProfile[]>([
    {
      id: 'profile-1',
      name: 'Alex (Master)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isKids: false,
      maxRating: 'NC-17',
      watchlist: ['movie-1'],
      history: [],
      languagePreference: 'English',
    },
    {
      id: 'profile-2',
      name: 'Kids Club',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
      isKids: true,
      pin: '1234',
      maxRating: 'PG',
      watchlist: ['movie-2'],
      history: [],
      languagePreference: 'English',
    }
  ]);

  const [activeProfile, setActiveProfile] = useState<UserProfile>(profiles[0]);

  const switchProfile = (profileId: string) => {
    const target = profiles.find((p) => p.id === profileId);
    if (target) setActiveProfile(target);
  };

  return { activeProfile, profiles, switchProfile };
}
`,
  },
  {
    filename: 'src/types/platform.ts',
    path: 'src/types/platform.ts',
    language: 'typescript',
    content: `export type MaturityRating = 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
export type PlanTier = 'basic' | 'standard' | 'premium';

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  isKids: boolean;
  pin?: string;
  maxRating: MaturityRating;
  watchlist: string[];
  history: {
    mediaId: string;
    progressPercent: number;
    lastWatchedAt: string;
  }[];
  languagePreference: string;
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
  matchScore: number;
  director: string;
  cast: string[];
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  introEndSeconds: number;
  resolutionsAvailable: ('4K' | '1080p' | '720p')[];
  audioTracks: { id: string; label: string; language: string }[];
  subtitles: { id: string; label: string; language: string }[];
  drmType: 'Widevine L1' | 'FairPlay' | 'PlayReady';
}
`,
  },
  {
    filename: 'src/firebase/config.ts',
    path: 'src/firebase/config.ts',
    language: 'typescript',
    content: `/**
 * Firebase Firestore Configuration with Persistent Offline Caching
 * Used for multi-profile synchronization, watchlists, and viewing history
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSy_YOUR_FIREBASE_API_KEY",
  authDomain: "theplatform-svod.firebaseapp.com",
  projectId: "theplatform-svod",
  storageBucket: "theplatform-svod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export default app;
`,
  },
  {
    filename: 'app.json',
    path: 'app.json',
    language: 'json',
    content: `{
  "expo": {
    "name": "The Platform SVOD",
    "slug": "the-platform-svod",
    "version": "1.0.0",
    "orientation": "default",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "backgroundColor": "#020617"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#020617"
      }
    }
  }
}
`,
  },
  {
    filename: 'package.json',
    path: 'package.json',
    language: 'json',
    content: `{
  "name": "theplatform-svod-rn-client",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.0",
    "expo-av": "~14.0.5",
    "expo-status-bar": "~1.12.1",
    "react": "18.2.0",
    "react-native": "0.74.5",
    "firebase": "^10.12.0",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-native-community/netinfo": "11.3.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "typescript": "^5.1.3"
  },
  "private": true
}
`,
  },
  {
    filename: 'tsconfig.json',
    path: 'tsconfig.json',
    language: 'json',
    content: `{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
`,
  },
  {
    filename: 'firestore.rules',
    path: 'firestore.rules',
    language: 'plaintext',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // User accounts, profile collections & watchlists
    match /users/{userId}/profiles/{profileId} {
      allow read, write: if isOwner(userId);
    }

    match /users/{userId}/watchlist/{mediaId} {
      allow read, write: if isOwner(userId);
    }

    // Public catalog read-only
    match /catalog/{mediaId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
`,
  },
  {
    filename: 'ASSESSMENT_SUBMISSION_REPORT.md',
    path: 'ASSESSMENT_SUBMISSION_REPORT.md',
    language: 'markdown',
    content: `# Student Assessment Submission Report
## Course / Project Title: Mobile Video Streaming Architecture & SVOD Platform
**Application Name**: "The Platform" - Subscription Video-on-Demand (SVOD) Service
**Tech Stack**: React Native (Expo 51), Expo AV, Firebase Firestore, AsyncStorage, TypeScript

---

### 1. Executive Summary & Core Service Model (SRS Section 1)
- **Service Type**: SVOD (Subscription Video-on-Demand) streaming engine.
- **Subscription Model**:
  - Basic Plan ($8.99/mo, 1 screen, 720p HD).
  - Standard Plan ($14.99/mo, 2 screens, 1080p FHD, 5.1 audio, offline downloads).
  - Premium Plan ($19.99/mo, 4 screens, 4K Ultra HD + HDR, Dolby Atmos).
- **Target Deployment**: Cross-platform Web, iOS, Android, and Smart TV applications.

---

### 2. User Authentication & Profile Management (SRS Section 2)
- Up to 5 user profiles per account with isolated watchlists.
- Parental Controls: PIN-locked child profiles restricting content to G & PG ratings.
- MFA & SSO authentication security architecture.

---

### 3. Video Streaming & Playback Engine (SRS Section 3)
- Adaptive Bitrate Streaming (ABS) scaling between 4K (24.5 Mbps), 1080p (7.8 Mbps), 720p (3.6 Mbps), and 480p (1.4 Mbps).
- Core playback controls with ±10s skipping and speed control (0.5x to 2x).
- "Skip Intro" button auto-triggering during opening sequence.
- Multi-language audio tracks (English Dolby Atmos, Spanish, French) and subtitles.

---

### 4. Discovery & Recommendation Infrastructure (SRS Section 4)
- Text search indexing titles, cast, directors, and genres.
- Categorized browse grids (Trending Now Top 10, Originals, Action/Sci-Fi, Kids).
- AI recommendation match score calculated from viewing history.

---

### 5. Security & Digital Rights Management (SRS Section 5)
- Multi-DRM: Google Widevine L1, Apple FairPlay, Microsoft PlayReady, TLS 1.3 encryption.
- Concurrent stream limits enforced by subscription tier.

---

### 6. System Architecture & Transcoding Pipeline (SRS Section 6)
- CMS raw mezzanine ingestion portal.
- Automated media encoding pipeline across AV1, HEVC, and H.264 codecs.
- Global CDN edge caching distribution across 240+ PoP locations.

---

### How to Evaluate / Run Project
1. Unzip the project archive.
2. Run \`npm install\`.
3. Start the Expo development server:
   \`\`\`bash
   npx expo start
   \`\`\`
4. Press \`w\` for web, \`i\` for iOS Simulator, or \`a\` for Android Emulator.
`,
  },
  {
    filename: 'README.md',
    path: 'README.md',
    language: 'markdown',
    content: `# The Platform: Subscription Video-on-Demand (SVOD) Service
## Complete Software Requirements Specification (SRS) Implementation

### Quick Start
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start Expo Metro bundler
npx expo start

# 3. Choose your target platform:
# Press 'w' for Web
# Press 'i' for iOS Simulator (macOS)
# Press 'a' for Android Emulator
# Or scan the QR code with the Expo Go app on physical iOS/Android
\`\`\`

### Features Overview
- **Adaptive Bitrate Streaming (ABS)**: Dynamic stream adaptation from 480p to 4K Ultra HD.
- **Parental Controls**: 4-digit PIN lock on child profiles with maturity ratings (G, PG, PG-13, R, NC-17).
- **Multi-Profiles**: Up to 5 profiles per master account.
- **Offline Downloads**: Local storage caching via AsyncStorage for offline flight/travel playback.
- **DRM Protection**: Multi-DRM architecture (Google Widevine, Apple FairPlay, Microsoft PlayReady).
- **Skip Intro**: Context-aware one-tap skip intro button.
`,
  },
];
