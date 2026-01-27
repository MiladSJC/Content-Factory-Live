import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- ICONS ---
const ZoomInIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" /></svg>;
const ZoomOutIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" /></svg>;
const MaximizeIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
const GridIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M8 6v12m8-12v12" /></svg>;
const DownloadIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const InfoIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChevronLeftIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const ChevronRightIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const PlayIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>;
const RotateIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const FlipHIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 5h8m-8 5h8M12 3v18" /></svg>;

const UniversalPreview = ({ isOpen, onClose, asset, assets = [], initialIndex = 0 }) => {
  // Core State
  const [scale, setScale] = useState(0.7);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Multi-asset navigation
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const allAssets = assets.length > 0 ? assets : (asset ? [asset] : []);
  const currentAsset = allAssets[currentIndex] || null;

  // UI State
  const [showGrid, setShowGrid] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showFilmstrip, setShowFilmstrip] = useState(assets.length > 1);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [showCursor, setShowCursor] = useState(false);

  // Video State
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Refs
  const containerRef = useRef(null);
  const mediaRef = useRef(null);
  const videoRef = useRef(null);

  const isVideo = currentAsset?.type === 'video' || (currentAsset?.url && currentAsset.url.endsWith('.mp4'));

  // Zoom presets
  const ZOOM_PRESETS = [
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '70%', value: 0.7 },
    { label: '100%', value: 1 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2 },
    { label: 'Fit', value: 'fit' }
  ];

  // Reset state when modal opens or asset changes
  useEffect(() => {
    if (isOpen) {
      setScale(0.7);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setCurrentIndex(initialIndex);
      setIsLoading(true);
    }
  }, [isOpen, initialIndex]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape': onClose(); break;
        case 'ArrowLeft': navigatePrev(); break;
        case 'ArrowRight': navigateNext(); break;
        case '+': case '=': handleZoom(0.1); break;
        case '-': handleZoom(-0.1); break;
        case '0': resetView(); break;
        case 'r': setRotation(prev => (prev + 90) % 360); break;
        case 'g': setShowGrid(prev => !prev); break;
        case 'i': setShowInfo(prev => !prev); break;
        case ' ': if (isVideo && videoRef.current) { e.preventDefault(); togglePlayPause(); } break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, allAssets.length, isVideo]);

  const handleZoom = useCallback((delta) => {
    setScale(prev => Math.min(Math.max(0.1, prev + delta), 10));
  }, []);

  const resetView = useCallback(() => {
    setScale(0.7);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  }, []);

  const navigateNext = useCallback(() => {
    if (currentIndex < allAssets.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsLoading(true);
    }
  }, [currentIndex, allAssets.length]);

  const navigatePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsLoading(true);
    }
  }, [currentIndex]);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) { videoRef.current.play(); setIsPlaying(true); }
      else { videoRef.current.pause(); setIsPlaying(false); }
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setVideoCurrentTime(videoRef.current.currentTime);
      setVideoProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  const handleVideoSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) videoRef.current.currentTime = percent * videoRef.current.duration;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    handleZoom(delta);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleImageLoad = (e) => {
    setImageDimensions({ width: e.target.naturalWidth, height: e.target.naturalHeight });
    setIsLoading(false);
  };

  const handleDownload = async () => {
    if (!currentAsset?.url) return;
    try {
      const response = await fetch(currentAsset.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentAsset.name || `asset_${Date.now()}${isVideo ? '.mp4' : '.png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error('Download failed:', err); }
  };

  if (!isOpen || !currentAsset) return null;

  const transformStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0.2, 1)'
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-gray-950/98 backdrop-blur-2xl animate-fadeIn">
      {/* === TOP NAVIGATION BAR === */}
      <div className="flex-shrink-0 h-16 bg-gray-900/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-20">
        {/* Left: Asset Info */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-500">Master Preview</span>
            <span className="text-sm font-bold text-white truncate max-w-[200px]">{currentAsset.name || 'AI Asset'}</span>
          </div>
          {allAssets.length > 1 && (
            <div className="bg-gray-800/80 px-3 py-1 rounded-full border border-white/10">
              <span className="text-xs font-mono text-gray-400">{currentIndex + 1} / {allAssets.length}</span>
            </div>
          )}
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2 bg-gray-800/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <button onClick={() => handleZoom(-0.1)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><ZoomOutIcon /></button>
          <div className="flex gap-1">
            {ZOOM_PRESETS.slice(0, 4).map(preset => (
              <button
                key={preset.label}
                onClick={() => setScale(preset.value === 'fit' ? 0.7 : preset.value)}
                className={`px-2 py-1 text-[10px] font-bold rounded transition-all ${scale === preset.value ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/10'}`}
              >{preset.label}</button>
            ))}
          </div>
          <button onClick={() => handleZoom(0.1)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"><ZoomInIcon /></button>
          <div className="w-px h-5 bg-gray-700 mx-1" />
          <span className="text-xs font-mono font-bold text-white w-12 text-center">{(scale * 100).toFixed(0)}%</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setRotation(prev => (prev + 90) % 360)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Rotate (R)"><RotateIcon /></button>
          <button onClick={() => setFlipH(prev => !prev)} className={`p-2 rounded-lg transition-all ${flipH ? 'bg-red-600/20 text-red-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`} title="Flip Horizontal"><FlipHIcon /></button>
          <button onClick={() => setShowGrid(prev => !prev)} className={`p-2 rounded-lg transition-all ${showGrid ? 'bg-red-600/20 text-red-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`} title="Toggle Grid (G)"><GridIcon /></button>
          <button onClick={() => setShowInfo(prev => !prev)} className={`p-2 rounded-lg transition-all ${showInfo ? 'bg-red-600/20 text-red-400' : 'hover:bg-white/10 text-gray-400 hover:text-white'}`} title="Info (I)"><InfoIcon /></button>
          <button onClick={handleDownload} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Download"><DownloadIcon /></button>
          <button onClick={resetView} className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-black uppercase tracking-wider border border-gray-600 transition-all">Reset</button>
          <div className="w-px h-6 bg-gray-700 mx-2" />
          <button onClick={onClose} className="group flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all active:scale-90">
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">✕</span>
          </button>
        </div>
      </div>

      {/* === MAIN VIEWPORT === */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Navigation Arrows */}
        {allAssets.length > 1 && (
          <>
            <button onClick={navigatePrev} disabled={currentIndex === 0} className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all ${currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-800 hover:scale-110'}`}>
              <ChevronLeftIcon />
            </button>
            <button onClick={navigateNext} disabled={currentIndex === allAssets.length - 1} className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all ${currentIndex === allAssets.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-800 hover:scale-110'}`}>
              <ChevronRightIcon />
            </button>
          </>
        )}

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none relative"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseEnter={() => setShowCursor(true)}
          onDoubleClick={resetView}
        >
          {/* Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none z-10 opacity-20" style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-gray-950/50">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 animate-pulse">Loading Asset</span>
              </div>
            </div>
          )}

          {/* Media Content */}
          <div ref={mediaRef} style={transformStyle} className="relative group flex items-center justify-center">
            <div className="absolute inset-[-30px] bg-red-500/5 blur-[80px] rounded-full opacity-40 pointer-events-none" />

            <div className="relative inline-block">
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={currentAsset.url}
                  autoPlay
                  loop
                  onLoadedMetadata={(e) => { setVideoDuration(e.target.duration); setIsLoading(false); }}
                  onTimeUpdate={handleVideoTimeUpdate}
                  className="max-w-[90vw] max-h-[70vh] rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5"
                />
              ) : (
                <img
                  src={currentAsset.url}
                  alt="Preview"
                  onLoad={handleImageLoad}
                  className="max-w-[90vw] max-h-[70vh] object-contain rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 pointer-events-none"
                />
              )}

              {/* DEALERSHIP OVERLAY (only renders if provided in asset object) */}
              {currentAsset.overlayUrl && (
                <img 
                  src={currentAsset.overlayUrl}
                  className="absolute bottom-0 left-0 w-full h-auto block pointer-events-none z-20"
                  alt="Dealership Overlay"
                />
              )}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <div className="absolute right-4 top-4 w-64 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-white/10 p-4 z-10 animate-slideIn">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Asset Information</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="text-white font-mono truncate max-w-[120px]">{currentAsset.name || 'Unknown'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="text-white font-mono">{isVideo ? 'Video' : 'Image'}</span></div>
              {!isVideo && imageDimensions.width > 0 && (
                <div className="flex justify-between"><span className="text-gray-500">Dimensions</span><span className="text-white font-mono">{imageDimensions.width} × {imageDimensions.height}</span></div>
              )}
              {isVideo && videoDuration > 0 && (
                <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="text-white font-mono">{formatTime(videoDuration)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-gray-500">Zoom</span><span className="text-white font-mono">{(scale * 100).toFixed(0)}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Rotation</span><span className="text-white font-mono">{rotation}°</span></div>
              {currentAsset.overlayUrl && (
                <div className="flex justify-between"><span className="text-gray-500">Overlay</span><span className="text-green-500 font-mono font-bold">Active</span></div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-800">
              <p className="text-[9px] text-gray-600 uppercase tracking-wider">Keyboard Shortcuts</p>
              <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
                <span className="text-gray-500">←/→</span><span className="text-gray-400">Navigate</span>
                <span className="text-gray-500">+/-</span><span className="text-gray-400">Zoom</span>
                <span className="text-gray-500">R</span><span className="text-gray-400">Rotate</span>
                <span className="text-gray-500">G</span><span className="text-gray-400">Grid</span>
                <span className="text-gray-500">0</span><span className="text-gray-400">Reset</span>
                <span className="text-gray-500">Esc</span><span className="text-gray-400">Close</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* === VIDEO CONTROLS === */}
      {isVideo && (
        <div className="flex-shrink-0 h-16 bg-gray-900/80 backdrop-blur-xl border-t border-white/5 flex items-center gap-4 px-6">
          <button onClick={togglePlayPause} className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span className="text-xs font-mono text-gray-400 w-16">{formatTime(videoCurrentTime)}</span>
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full cursor-pointer relative group" onClick={handleVideoSeek}>
            <div className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all" style={{ width: `${videoProgress}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `${videoProgress}%`, transform: 'translate(-50%, -50%)' }} />
          </div>
          <span className="text-xs font-mono text-gray-400 w-16 text-right">{formatTime(videoDuration)}</span>
        </div>
      )}

      {/* === FILMSTRIP === */}
      {showFilmstrip && allAssets.length > 1 && (
        <div className="flex-shrink-0 h-24 bg-gray-900/80 backdrop-blur-xl border-t border-white/5 flex items-center gap-2 px-6 overflow-x-auto custom-scrollbar">
          {allAssets.map((a, idx) => (
            <button
              key={idx}
              onClick={() => { setCurrentIndex(idx); setIsLoading(true); }}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-red-500 ring-2 ring-red-500/30' : 'border-transparent hover:border-white/20'}`}
            >
              {a.type === 'video' || a.url?.endsWith('.mp4') ? (
                <video src={a.url} className="w-full h-full object-cover" muted />
              ) : (
                <img src={a.url} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* === BOTTOM TOOLTIP === (auto-hides when zoomed in) */}
      <div className={`absolute bottom-28 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5 pointer-events-none z-[5] transition-opacity duration-300 ${scale > 0.85 ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">
          Scroll to Zoom • Drag to Pan • Double Click to Reset • Press ESC to Close
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideIn { animation: slideIn 0.3s ease-out forwards; }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
      `}</style>
    </div>
  );
};

export default UniversalPreview;