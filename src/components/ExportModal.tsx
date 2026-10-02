import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  FolderArchive,
  BookOpen,
  Code2,
  FileText,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import { RN_PROJECT_FILES, ProjectFile } from '../data/rnProjectFiles';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'report'>('report');
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(RN_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      // Add each file into the zip archive
      RN_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'the-platform-svod-react-native-firebase-submission.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating zip', e);
    } finally {
      setDownloadingZip(false);
    }
  };

  const projectReport = `# Software Requirements Specification (SRS) Implementation Document
## "The Platform" - Subscription Video-on-Demand (SVOD) Service
**Submission Ready Technical Architecture & Code Delivery**

---

### 1. Executive Summary & Core Service Model
- **Platform**: "The Platform" is a full-featured SVOD streaming service engineered to deliver secure, broadcast-quality video streams globally.
- **Subscription Architecture**:
  - **Basic Plan**: $8.99/mo | 1 concurrent screen | SD / 720p HD.
  - **Standard Plan**: $14.99/mo | 2 concurrent screens | Full HD 1080p | 5.1 Surround Sound | Offline downloads.
  - **Premium Plan**: $19.99/mo | 4 concurrent screens | 4K Ultra HD + Dolby Vision HDR | Dolby Atmos Spatial Audio | Offline downloads.
- **Promotional Model**: Automated recurring billing lifecycle with optional 30-day promotional free trial periods.
- **Target Platforms**: Web Browsers (Chrome, Safari, Edge), Native Mobile (React Native + Expo AV for iOS and Android), and Smart TV applications.

---

### 2. User Authentication & Profile Management
- **Multi-Factor Authentication (MFA) & SSO**: Token-based authentication verifying devices and safeguarding payment credentials.
- **Multi-Profile Architecture**: Master accounts support up to 5 distinct user profiles with isolated watchlists, viewing history tracking, and language preferences.
- **Parental Controls & Content Filtering**:
  - PIN-protected child profiles.
  - Granular maturity rating ceiling enforcement (G, PG, PG-13, R, NC-17). Content rated higher than the active profile limit is automatically filtered from discovery grids.

---

### 3. Video Streaming & Playback Engine
- **Adaptive Bitrate Streaming (ABS)**: Dynamic stream ladder adaptation between 4K (24.5 Mbps), Full HD 1080p (7.8 Mbps), HD 720p (3.6 Mbps), and SD 480p (1.4 Mbps) based on measured client network bandwidth.
- **Full Playback Controls**:
  - Core navigation: Play, Pause, Scrubbing seek bar with timestamp counters, volume control with mute.
  - Speed adjustments: 0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x.
  - Multi-language audio tracks (English Dolby Atmos 5.1, Spanish, French, Director's Commentary).
  - Closed Captions & Subtitles (English [CC], Spanish, French, German).
  - **"Skip Intro" Button**: Context-aware button displaying during opening sequences (e.g. 0-24s), allowing one-tap skipping into the main feature.
  - **Auto-Play Next**: Automated countdown and recommendations upon stream conclusion.

---

### 4. Discovery & Recommendation Infrastructure
- **Search Engine**: Full text-based indexing across movie titles, tags, cast members, directors, and genres.
- **Categorized Browse Grids**: "Trending Top 10", "Originals", "Sci-Fi & Cyberpunk", "Family & Kids", and "My List".
- **AI Recommendation Engine**: Percentage match scores (e.g., 99% Match) calculated from viewing history and category affinity.

---

### 5. Security, DRM & Session Management
- **Multi-DRM Content Protection**:
  - Google Widevine Modular L1 (Android, Chrome, Smart TV hardware).
  - Apple FairPlay Streaming (iOS, iPadOS, Safari, Apple TV).
  - Microsoft PlayReady SL3000 (Windows, Xbox).
  - TLS 1.3 / AES-128 stream segment encryption preventing unauthorized extraction.
- **Active Session Management**: Server-enforced concurrent stream guards monitoring active screen sessions (1 for Basic, 2 for Standard, 4 for Premium) with remote device termination capabilities.

---

### 6. System Architecture, CMS & Encoding Pipeline
- **Content Management System (CMS)**: Ingestion portal for raw ProRes/DNxHR master video mezzanines, metadata management, and scheduled release dates.
- **Media Encoding Pipeline**: Parallel transcode worker pool producing multi-bitrate HLS/DASH manifests across AV1, H.265 (HEVC), and H.264 codecs.
- **Global CDN Edge Caching**: Edge origin distribution over 240+ global points of presence (PoP) ensuring sub-second initial buffer latency.

---

### 7. Codebase Files Included in Export
- \`App.tsx\`: React Native SVOD mobile application client with Expo AV.
- \`src/firebase/config.ts\`: Firebase v10 initialization with offline persistent caching.
- \`src/hooks/useStreamingCatalog.ts\`: Catalog fetch and streaming state management.
- \`src/hooks/useUserProfile.ts\`: Profile switcher and parental PIN verification.
- \`package.json\`: Expo SDK 51 dependencies and scripts.
- \`firestore.rules\`: Attribute-Based Access Control (ABAC) rules.
- \`README.md\`: Local development and deployment instructions.
`;

  const handleCopyReport = async () => {
    try {
      await navigator.clipboard.writeText(projectReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                "The Platform" SVOD Project Exporter & SRS Submission
              </h3>
              <p className="text-xs text-slate-400">
                Full React Native + Firebase code bundle & Software Requirements Specification (SRS) report
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-600/30 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingZip ? 'Packaging ZIP...' : 'Download Code (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'report'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>SRS Specification & Compliance Report</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'code'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>React Native & Firebase Source Files ({RN_PROJECT_FILES.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        {activeTab === 'code' ? (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Sidebar File Explorer */}
            <div className="w-full md:w-64 border-r border-slate-800 bg-slate-950/40 p-3 overflow-y-auto flex md:flex-col gap-1.5 shrink-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 hidden md:block">
                Project Codebase
              </div>
              {RN_PROJECT_FILES.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-left transition-all w-full truncate ${
                    selectedFile.path === file.path
                      ? 'bg-red-600/20 text-red-300 border border-red-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span className="truncate">{file.filename}</span>
                </button>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <span className="font-mono text-xs text-slate-300 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  {selectedFile.path}
                </span>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-300 leading-relaxed">
                <pre className="select-text whitespace-pre">{selectedFile.content}</pre>
              </div>
            </div>
          </div>
        ) : (
          /* Submission Report Tab */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden">
            <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-xs text-slate-400">
                Full SRS Compliance Document ready for submission
              </span>
              <button
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Document!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full SRS Report</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-300 font-mono leading-relaxed space-y-4">
              <pre className="select-text whitespace-pre-wrap">{projectReport}</pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>SRS The Platform • SVOD Streaming Platform • React Native & Firebase</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
