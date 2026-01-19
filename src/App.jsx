import { useState, useRef } from 'react';
import CarouselTab from './CarouselTab.jsx';
import VideoEditor from './VideoEditor.jsx';
import Animation from './Animation.jsx';
import Analytics from './Analytics.jsx';
import Flyer from './Flyer.jsx';
import ImageToVideo from './ImageToVideo.jsx';
import ImageModification from './ImageModification.jsx';
import AI_Item_Selection from './AI_Item_Selection.jsx';
import BrandDNA from './BrandDNA.jsx';
import ProjectTimeline from './ProjectTimeline.jsx';
import All_AI from './All_AI.jsx';
import CampaignManager from './CampaignManager.jsx';
import DAM from './DAM.jsx';
import BOT from './BOT.jsx'; // Integrated
import EblastAutomation from './MultiAssetCompositor.jsx';
import Advertorial from './Advertorial.jsx';
import Distribution from './Distribution.jsx';

import sjcLogo from './sjc.jpg';
import Login from './Login.jsx';
import staplesLogo from './Staples.png';

// --- Icons (Simple SVG Components for Production Reliability) ---
const Icons = {
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Fingerprint: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  ),
  Briefcase: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  File: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Layers: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Video: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Film: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  ),
  Play: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 12.728L12 12m0-7a7 7 0 100 14 7 7 0 000-14z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('campaign-manager');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --- SESSION DAM STORAGE ---
  const [sharedDAMAssets, setSharedDAMAssets] = useState([]);

  // --- CROSS-MODULE PRODUCTION TRANSFER ---
  const [transferImageMod, setTransferImageMod] = useState(null);
  const [transferVideo, setTransferVideo] = useState(null);

  const handlePushToDAM = (newAsset) => {
    setSharedDAMAssets(prev => [newAsset, ...prev]);
    alert(`Asset "${newAsset.name}" pushed to DAM Shared Workspace!`);
  };

  // --- Video Editor shared state (preserved) ---
  const [videoAssets, setVideoAssets] = useState({ file: null, url: null });
  const [textOverlays, setTextOverlays] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const configInputRef = useRef(null);

  // --- Carousel State (preserved) ---
  const [carouselData, setCarouselData] = useState(null);
  const [transferData, setTransferData] = useState(null);
  const [activeVideoLanguage, setActiveVideoLanguage] = useState('EN');
  // --- Animation State (preserved) ---
  const [animationResults, setAnimationResults] = useState({
    inputImages: [],
    banner: 'Metro',
    template: 'Metro Animation 1',
    ratioMode: 'Diverse',
    uniformRatio: '9:16',
    selectedRatios: ['9:16', '1:1', '21:9'],
    prompt: '',
    visibleVideos: [],
    hasGenerated: false
  });
  const navPrimary = [
    { id: 'brand-dna', label: 'Brand DNA', icon: Icons.Fingerprint },
    { id: 'campaign-manager', label: 'Campaign Manager', icon: Icons.Briefcase },
    { id: 'item-picker', label: 'AI Item Selection', icon: Icons.Grid },
  ];

  const navSecondary = [
    { id: 'flyer', label: 'Flyer Production', icon: Icons.File },
    { id: 'all-ai-flyer', label: 'All AI Flyer (Beta)', icon: Icons.Sparkles },
    { id: 'image-modification', label: 'AI Offer Builder', icon: Icons.Edit },
    { id: 'image-to-video', label: 'AI Image to Video', icon: Icons.Video },
    { id: 'eblast-automation', label: 'AI Multi-Asset Compositor', icon: Icons.Layers },
    { id: 'animation', label: 'Animation', icon: Icons.Play },
    //{ id: 'carousel', label: 'Carousel', icon: Icons.Layers },
    { id: 'advertorial', label: 'Advertorial', icon: Icons.File },
    { id: 'project-timeline', label: 'Project Timeline', icon: Icons.Clock },
    { id: 'dam', label: 'AI-Powered DAM', icon: Icons.File },
    { id: 'analytics', label: 'Analytics', icon: Icons.Chart },
    { id: 'distribution', label: 'Distribution', icon: Icons.Layers },
  ];

  const NavButton = (item) => (
    <button
      key={item.id}
      onClick={() => setActiveTab(item.id)}
      className={`w-full flex items-center gap-4 px-6 py-2.5 transition-colors relative group
        ${activeTab === item.id ? 'bg-red-600 text-white' : isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
        ${!isSidebarOpen ? 'justify-center' : ''}
      `}
      title={!isSidebarOpen ? item.label : ''}
    >
      <item.icon />
      <span
        className={`whitespace-nowrap font-medium transition-opacity duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 hidden'
          }`}
      >
        {item.label}
      </span>
    </button>
  );

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* --- Sidebar --- */}
      <aside
        className={`${isSidebarOpen ? 'w-72' : 'w-20'
          } flex flex-col transition-all duration-300 border-r relative z-20 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}
      >
        {/* Toggle Button / Brand Area */}
        <div className={`h-20 flex items-center justify-between px-6 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900/20' : 'border-gray-200 bg-gray-50'}`}>
          {isSidebarOpen ? (
            <div className="flex flex-col leading-tight">
              <span className={`font-black text-sm tracking-wider uppercase ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Campaign Studio</span>
              <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Production Manager</span>
            </div>
          ) : (
            <span className="mx-auto font-bold text-lg"></span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-white' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-900'}`}
          >
            {isSidebarOpen ? <Icons.ChevronLeft /> : <Icons.Menu />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-4 custom-scrollbar">
          <div className="space-y-1">
            {isSidebarOpen && (
              <div className="px-6 pt-1 pb-2 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
                Primary Workflow
              </div>
            )}
            {navPrimary.map(NavButton)}
          </div>

          <div className="px-6">
            <div className={`h-px ${isDarkMode ? 'bg-gray-700/70' : 'bg-gray-200'}`} />
          </div>

          <div className="space-y-1">
            {isSidebarOpen && (
              <div className="px-6 pt-1 pb-2 text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">
                Studio Tools
              </div>
            )}
            {navSecondary.map(NavButton)}
          </div>
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className={`h-20 border-b flex justify-between items-center px-8 shadow-md z-10 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <img src={staplesLogo} alt="Staples Logo" className="h-10 bg-white rounded p-1 shadow-sm border border-gray-100" />
            <div className="leading-tight">
              <h1 className="text-2xl font-black tracking-tight">Retail Content Studio</h1>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.25em]"></p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-all duration-300 flex items-center gap-2 px-4 text-sm font-bold uppercase tracking-wider ${isDarkMode
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                }`}
            >
              {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
              <span className="hidden md:inline">{isDarkMode ? 'Light' : 'Dark'} Mode</span>
            </button>
            <img src={sjcLogo} alt="SJC Logo" className="h-16 object-contain" />
          </div>
        </header>

        {/* Scrollable Tab Content */}
        <main className="flex-1 overflow-y-auto p-6 relative">
          {activeTab === 'campaign-manager' && (
            <div className="animate-fadeIn h-full">
              <CampaignManager
                onNavigateToAI={() => setActiveTab('item-picker')}
                onNavigateToFlyer={() => setActiveTab('flyer')}
              />
            </div>
          )}

          <div style={{ display: activeTab === 'item-picker' ? 'block' : 'none' }}>
            <AI_Item_Selection
              onNavigateToFlyer={() => setActiveTab('flyer')}
              setActiveTab={setActiveTab}
              onTransferImageMod={setTransferImageMod}
              onTransferVideo={setTransferVideo}
            />
          </div>

          <div style={{ display: activeTab === 'flyer' ? 'block' : 'none' }}>
            <Flyer />
          </div>

          {activeTab === 'brand-dna' && (
            <div className="animate-fadeIn h-full">
              <BrandDNA isDarkMode={isDarkMode} />
            </div>
          )}

          {activeTab === 'all-ai-flyer' && (
            <div
              className={`w-full rounded-lg overflow-hidden border animate-fadeIn ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
              style={{ height: 'calc(100vh - 130px)' }}
            >
              <All_AI />
            </div>
          )}

          <div style={{ display: activeTab === 'carousel' ? 'block' : 'none' }}>
            <CarouselTab carouselData={carouselData} setCarouselData={setCarouselData} />
          </div>

          <div style={{ display: activeTab === 'image-to-video' ? 'block' : 'none' }}>
            <ImageToVideo
              onPushToDAM={handlePushToDAM}
              incomingAssets={transferVideo}
              onClearIncoming={() => setTransferVideo(null)}
            />
          </div>
          <div style={{ display: activeTab === 'image-modification' ? 'block' : 'none' }}>
            <ImageModification
              onPushToDAM={handlePushToDAM}
              incomingAssets={transferImageMod}
              onClearIncoming={() => setTransferImageMod(null)}
            />
          </div>
          <div style={{ display: activeTab === 'eblast-automation' ? 'block' : 'none' }}>
            <EblastAutomation onPushToDAM={handlePushToDAM} />
          </div>

          {activeTab === 'video' && (
            <div className="animate-fadeIn">
              <VideoEditor
                videoAssets={videoAssets}
                setVideoAssets={setVideoAssets}
                textOverlays={textOverlays}
                setTextOverlays={setTextOverlays}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
                duration={duration}
                setDuration={setDuration}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                transferData={transferData}
                setTransferData={setTransferData}
                activeVideoLanguage={activeVideoLanguage}
                setActiveVideoLanguage={setActiveVideoLanguage}
                videoRef={videoRef}
                fileInputRef={fileInputRef}
                configInputRef={configInputRef}
              />
            </div>
          )}

          {activeTab === 'animation' && (
            <div className="animate-fadeIn">
              <Animation
                onPushToDAM={handlePushToDAM}
                sharedState={animationResults}
                setSharedState={setAnimationResults}
              />
            </div>
          )}

          {activeTab === 'advertorial' && (
            <div className="animate-fadeIn">
              <Advertorial onPushToDAM={handlePushToDAM} />
            </div>
          )}

          {activeTab === 'project-timeline' && (
            <div className="animate-fadeIn">
              <ProjectTimeline />
            </div>
          )}

          <div
            style={{ display: activeTab === 'dam' ? 'block' : 'none' }}
            className={activeTab === 'dam' ? 'animate-fadeIn' : ''}
          >
            <DAM externalSharedAssets={sharedDAMAssets} />
          </div>

          {activeTab === 'distribution' && (
            <div className="animate-fadeIn h-full">
              <Distribution />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fadeIn">
              <Analytics />
            </div>
          )}
        </main>
      </div>

      {/* --- Production Agent Integration (Bottom-Left) --- */}
      <div className="bot-container-override">
        <BOT activeTab={activeTab} onNavigate={(id) => setActiveTab(id)} />
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}; border-radius: 2px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}; }

        /* Override BOT.jsx default fixed position to Bottom-Left */
        .bot-container-override > div {
          left: auto !important;
          right: 1.5rem !important;
          align-items: flex-end !important;
        }
      `}</style>
    </div>
  );
}

export default App;