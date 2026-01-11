import React, { useState, useRef } from 'react';

// Configuration for Video Assets
const VIDEO_ASSETS = {
  Metro: [
    '/Animation/Metro Animation/Metro1.mp4',
    '/Animation/Metro Animation/Metro2.mp4',
    '/Animation/Metro Animation/Metro3.mp4',
    '/Animation/Metro Animation/Metro4.mp4',
    '/Animation/Metro Animation/Metro5.mp4',
    '/Animation/Metro Animation/Metro6.mp4',
  ],
  'Food Basics': [
    '/Animation/Food Basic Animation/Food Basic1.mp4',
    '/Animation/Food Basic Animation/Food Basic2.mp4',
    '/Animation/Food Basic Animation/Food Basic3.mp4',
    '/Animation/Food Basic Animation/Food Basic4.mp4',
    '/Animation/Food Basic Animation/Food Basic5.mp4',
    '/Animation/Food Basic Animation/Food Basic6.mp4',
  ]
};

const UploadIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

function Animation({ onPushToDAM, sharedState, setSharedState }) {
  // --- UI & Filter State ---
  const [isLiveMode, setIsLiveMode] = useState(false);
  const { inputImages, banner, template, ratioMode, selectedRatios, uniformRatio, prompt, visibleVideos, hasGenerated } = sharedState;
  
  const setInputImages = (val) => setSharedState(prev => ({ ...prev, inputImages: typeof val === 'function' ? val(prev.inputImages) : val }));
  const setTemplate = (val) => setSharedState(prev => ({ ...prev, template: val }));
  const setRatioMode = (val) => setSharedState(prev => ({ ...prev, ratioMode: val }));
  const setUniformRatio = (val) => setSharedState(prev => ({ ...prev, uniformRatio: val }));
  const setSelectedRatios = (val) => setSharedState(prev => ({ ...prev, selectedRatios: typeof val === 'function' ? val(prev.selectedRatios) : val }));
  const setBanner = (val) => setSharedState(prev => ({ ...prev, banner: val }));
  const setPrompt = (val) => setSharedState(prev => ({ ...prev, prompt: val }));
  const setVisibleVideos = (val) => setSharedState(prev => ({ ...prev, visibleVideos: typeof val === 'function' ? val(prev.visibleVideos) : val }));
  const setHasGenerated = (val) => setSharedState(prev => ({ ...prev, hasGenerated: val }));

  const [client, setClient] = useState('Metro Inc.');
  const getTemplateOptions = () => {
    if (banner === 'Metro') return ['Metro Animation 1', 'Metro Animation 2', 'Metro Animation 3'];
    if (banner === 'Food Basics') return ['Food Basics 1', 'Crazy 8', 'Food Basics 3'];
    return [];
  };

  const toggleRatio = (r) => {
    if (ratioMode === 'Uniform') {
      setUniformRatio(r);
    } else {
      setSelectedRatios(prev => {
        if (prev.includes(r)) return prev.filter(item => item !== r);
        if (prev.length >= 4) return prev;
        return [...prev, r];
      });
    }
  };
  const [campaign, setCampaign] = useState('Campaign 1');
  
  // --- Generation State ---
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Modal/Refine State ---
  const [selectedVideo, setSelectedVideo] = useState(null); 
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [refineModel, setRefineModel] = useState('Stable Video Diffusion 1.1');
  const [refinePrompt, setRefinePrompt] = useState('');

  const fileInputRef = useRef(null);

  // --- Handlers ---
  const handleAutoLoadImages = () => {
    // Mapping the provided absolute paths to public folder relative paths for web access
    const hardcodedImages = [
        { id: 1, url: "/Animation/1_1.png", name: "1_1.png" },
        { id: 2, url: "/Animation/1_2.png", name: "1_2.png" },
        { id: 3, url: "/Animation/1_3.png", name: "1_3.png" }
    ];
    setInputImages(hardcodedImages);
  };

  const handleLocalUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        name: file.name
    }));
    setInputImages(prev => [...prev, ...newImages]);
  };

  const handleGenerateAssets = () => {
    setIsGenerating(true);
    setHasGenerated(true);
    setVisibleVideos([]);

    const allAssets = VIDEO_ASSETS[banner];
    
    allAssets.forEach((videoSrc, index) => {
      setTimeout(() => {
        setVisibleVideos((prev) => [...prev, videoSrc]);
        if (index === allAssets.length - 1) {
          setIsGenerating(false);
        }
      }, (index + 1) * 1200); 
    });
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
    setShowRefineModal(false);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 text-white animate-fadeIn">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleLocalUpload} />
      
      {/* --- Left Column: Controls (Refined Sidebar) --- */}
      <div className="w-1/3 min-w-[360px] bg-gray-800 rounded-lg p-5 overflow-y-auto space-y-5 border border-gray-700 shadow-xl custom-scrollbar">
        {/* Header & Toggle */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
             <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🎨</span> Animation</h2>
             <div className="flex items-center gap-3 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                <span className={`text-[10px] font-bold uppercase ${isLiveMode ? 'text-green-500' : 'text-gray-500'}`}>
                    {isLiveMode ? 'Live' : 'Present'}
                </span>
                <button 
                    onClick={() => setIsLiveMode(!isLiveMode)} 
                    className={`w-8 h-4 rounded-full relative transition-colors ${isLiveMode ? 'bg-green-600' : 'bg-gray-700'}`}
                >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isLiveMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
             </div>
        </div>

        {/* Source Images Section */}
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-gray-400">Source Images</label>
                <div className="flex gap-1">
                    <button 
                        onClick={handleAutoLoadImages} 
                        className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white"
                    >
                        + Add Images
                    </button>
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-white flex items-center justify-center transition-colors"
                    >
                        <UploadIcon />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 min-h-[80px] bg-gray-900 rounded-lg p-2 border border-gray-700">
                {inputImages.map(img => (
                    <div key={img.id} className="relative group aspect-square bg-black rounded overflow-hidden border border-gray-700">
                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                        <button 
                            onClick={() => setInputImages(p => p.filter(i => i.id !== img.id))} 
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* Modification Prompt */}
        <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-400">Modification Prompt</label>
            <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="Describe movement or changes..." 
                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white focus:border-red-500 outline-none h-24 resize-none" 
            />
        </div>

        {/* Banner Selection */}
        <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Banner</label>
            <div className="grid grid-cols-2 gap-2">
                {['Metro', 'Food Basics'].map(option => (
                    <button
                        key={option}
                        onClick={() => {
                            setBanner(option);
                            setTemplate(option === 'Metro' ? 'Metro Animation 1' : 'Food Basics 1');
                            setHasGenerated(false);
                            setVisibleVideos([]);
                        }}
                        className={`py-2 text-xs font-bold rounded border transition-all ${
                            banner === option 
                            ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20' 
                            : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>

        {/* Template Selection */}
        <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Template</label>
            <select 
                value={template} 
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded py-2 px-3 text-xs font-bold text-white outline-none focus:border-red-500"
            >
                {getTemplateOptions().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>

        {/* Ratio Controls (Ported from Compositor) */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Dimensions</label>
                <div className="grid grid-cols-2 gap-2">
                    {['Uniform', 'Diverse'].map(opt => (
                        <button
                            key={opt}
                            onClick={() => setRatioMode(opt)}
                            className={`py-1.5 text-[10px] font-bold rounded border transition-all ${ratioMode === opt ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    {ratioMode === 'Uniform' ? 'Aspect Ratio' : `Ratios (${selectedRatios?.length || 0}/4)`}
                </label>
                <div className="relative group">
                    <div className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white flex flex-wrap gap-1 min-h-[31px] cursor-pointer">
                        {ratioMode === 'Uniform' ? (
                            <span>{uniformRatio || '9:16'}</span>
                        ) : (
                            (selectedRatios || []).map(r => <span key={r} className="bg-red-600 px-2 rounded text-[9px]">{r}</span>)
                        )}
                        {ratioMode === 'Diverse' && (!selectedRatios || selectedRatios.length === 0) && <span className="text-gray-600">Select...</span>}
                    </div>
                    <div className="absolute z-30 bottom-full left-0 w-full bg-gray-900 border border-gray-700 rounded mb-1 hidden group-hover:grid grid-cols-2 p-2 gap-1 shadow-2xl">
                        {["1:1", "3:2", "2:3", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"].map(r => (
                            <button 
                                key={r} 
                                onClick={() => toggleRatio(r)}
                                className={`text-[10px] p-1 rounded transition-colors ${
                                    (ratioMode === 'Uniform' ? uniformRatio === r : selectedRatios?.includes(r)) 
                                    ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-400'
                                }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Generate Button */}
        <div className="pt-4 border-t border-gray-700">
            <button
                onClick={handleGenerateAssets}
                disabled={isGenerating}
                className={`w-full py-4 rounded-lg font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                    isGenerating 
                    ? 'bg-gray-600 cursor-not-allowed opacity-75' 
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 hover:shadow-red-900/50 transform active:scale-95'
                }`}
            >
                {isGenerating ? "Generating..." : "⚡ Generate Assets"}
            </button>
        </div>
      </div>

      {/* --- Right Column: Video Grid (Intact) --- */}
      <div className="flex-1 bg-gray-900 rounded-lg p-6 border border-gray-700 overflow-y-auto relative custom-scrollbar">
        <div className="flex justify-between items-end mb-6 border-b border-gray-700 pb-4">
            <div>
                <h3 className="text-xl font-semibold text-gray-200">Generated Results</h3>
                <p className="text-sm text-gray-500 mt-1">{client} / {banner}</p>
            </div>
            {hasGenerated && (
                <div className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded-full border border-green-800 animate-pulse">
                    {isGenerating ? "Generation in Progress..." : "Generation Complete"}
                </div>
            )}
        </div>
        
        {!hasGenerated && (
            <div className="h-2/3 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-700 rounded-xl m-4">
                <span className="text-6xl mb-4 opacity-20">🎬</span>
                <p className="text-lg font-medium">Ready to Generate</p>
                <p className="text-sm">Select your parameters on the left and click Generate.</p>
            </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {visibleVideos.map((videoSrc, index) => (
                <div 
                    key={index}
                    onClick={() => setSelectedVideo(videoSrc)}
                    className="group relative aspect-square bg-black rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-red-500 transition-all hover:scale-[1.02] flex items-center justify-center"
                >
                    <video 
                        src={videoSrc}
                        className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100"
                        muted loop
                        onMouseOver={e => e.target.play()}
                        onMouseOut={e => e.target.pause()}
                    />
                    <div className="absolute top-2 left-2 z-10">
                         <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider border border-white/10">
                            Var {index + 1}
                         </span>
                    </div>
                </div>
            ))}
            {isGenerating && visibleVideos.length < VIDEO_ASSETS[banner].length && (
                <div className="aspect-square bg-gray-800 rounded-lg animate-pulse flex flex-col items-center justify-center border border-gray-700">
                    <div className="w-12 h-12 bg-red-600/20 border border-red-500 rounded flex items-center justify-center animate-spin">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* --- Modals (Keep Existing Logic) --- */}
      {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-8">
               {/* Modal Content... (Same as your original code) */}
               <div className="bg-gray-800 rounded-xl border border-gray-600 shadow-2xl max-w-5xl w-full flex flex-col overflow-hidden relative">
                    <button onClick={closeVideoModal} className="absolute top-4 right-4 z-10 text-white text-2xl">×</button>
                    <div className="flex-1 bg-black flex items-center justify-center p-4">
                        <video src={selectedVideo} controls autoPlay className="max-h-[60vh] rounded-lg" />
                    </div>
                    <div className="p-6 bg-gray-900 border-t border-gray-700 flex justify-end gap-4">
                        <button onClick={() => {
                            onPushToDAM({ 
                                path: selectedVideo, 
                                name: `AI_Animation_${selectedVideo.split('/').pop()}`, 
                                type: "video/mp4", 
                                thumbnail: selectedVideo.replace('.mp4', '.jpg') 
                            });
                        }} className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold">
                            🚀 Push to DAM
                        </button>
                    </div>
               </div>
          </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: #111827; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
      `}</style>
    </div>
  );
}

export default Animation;