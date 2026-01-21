import { useState, useRef, useEffect } from 'react';
import UniversalPreview from './UniversalPreview';

// --- CONFIGURATION ---
const KNOWN_RESULT_FILES = [
  '1.png', '1_1.png', '1_2.png', '2.png', '2_1.png', '2_2.png', '3.png', '3_1.png', '3_2.png'
];

const KNOWN_SOURCE_FILES = [
  '1.jpg', '2.jpg', '3.jpg'
];

const SUPPORTED_RATIOS = [
  "1:1", "3:2", "2:3", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"
];

// Simple Sparkle Icon for the loader
const SparkleIcon = () => (
  <svg className="w-8 h-8 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// NEW: Upload Icon for local files
const UploadIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

function ImageModification({ onPushToDAM, incomingAssets, onClearIncoming }) {
  // --- State ---
  const [inputImages, setInputImages] = useState([]); 
  const [prompt, setPrompt] = useState('');
  const [pendingQueue, setPendingQueue] = useState([]);
  
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [settings, setSettings] = useState({
      model: 'v2',
      aspectRatio: '16:9',
      temperature: 1.0,
      topP: 0.95,
      resolution: '1K',
      personGeneration: 'allow_all',
      denoisingStrength: 0.75,
      guidanceScale: 7.0,
      seed: -1
    });
  
  const [resultPool, setResultPool] = useState([]); 
  const [liveResults, setLiveResults] = useState({}); 
  const [isGenerated, setIsGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
  const [previewState, setPreviewState] = useState({ isOpen: false, asset: null });
  const [refiningIds, setRefiningIds] = useState(new Set()); 
  const [imageVersions, setImageVersions] = useState({}); 
  const [showReviewModal, setShowReviewModal] = useState(false);

  // ENHANCED MODAL STATE
  const [refineModal, setRefineModal] = useState({
    isOpen: false,
    targetImageId: null,
    targetImageName: '',
    refineInput: '',
    model: 'v2',
    variations: 1,
    refineSource: 'original', // 'original' or 'previous'
    isGlobal: false
  });

  const imageInputRef = useRef(null);

  // --- External Transfer Logic (Sequential Set Loading) ---
  useEffect(() => {
    if (incomingAssets && incomingAssets.length > 0) {
        // incomingAssets is now an array of arrays (sets)
        const [firstSet, ...remainingSets] = incomingAssets;

        const firstSetMapped = firstSet.map(asset => ({
            id: Date.now() + Math.random(),
            url: asset.url,
            name: asset.name,
            localPath: asset.localPath || null
        }));

        setInputImages(firstSetMapped);
        setPendingQueue(remainingSets);
        
        // Reset state for new set to prevent data leakage from previous sets
        setIsGenerated(false);
        setLiveResults({});
        const newVersions = {};
        firstSetMapped.forEach(img => newVersions[img.id] = 0);
        setImageVersions(newVersions);
        onClearIncoming();
    }
  }, [incomingAssets]);

  // --- Helpers ---
  const getBaseName = (filename) => filename.split('.').slice(0, -1).join('.').toLowerCase();

  const getDimensions = (ratio) => {
    const map = {
      '1:1': { w: 1024, h: 1024 }, '3:2': { w: 1248, h: 832 }, '2:3': { w: 832, h: 1248 },
      '3:4': { w: 896, h: 1152 }, '4:3': { w: 1152, h: 896 }, '4:5': { w: 896, h: 1088 },
      '5:4': { w: 1088, h: 896 }, '9:16': { w: 720, h: 1280 }, '16:9': { w: 1280, h: 720 },
      '21:9': { w: 1536, h: 640 }
    };
    return map[ratio] || map['1:1'];
  };

  const findMatchingResult = (imgId, imageName, versionIndex) => {
    const liveKey = `${imgId}_${versionIndex}`;
    if (liveResults[liveKey]) return { url: liveResults[liveKey] };
    const baseName = getBaseName(imageName);
    const targetName = versionIndex === 0 ? baseName : `${baseName}_${versionIndex}`;
    return resultPool.find(r => getBaseName(r.name) === targetName);
  };

  const openGlobalRefineModal = () => {
      if (inputImages.length === 0 || !isGenerated) {
          alert("Please generate images first before refining.");
          return;
      }
      const representative = inputImages[0];
      setRefineModal({
          isOpen: true,
          isGlobal: true,
          targetImageId: representative.id, 
          targetImageName: 'All Images',
          refineInput: '',
          model: settings.model,
          variations: 1,
          refineSource: 'original'
      });
    };

  // --- Handlers ---
  const handleAutoLoadAndUpload = async () => {
    if (pendingQueue.length > 0) {
        const [nextSet, ...rest] = pendingQueue;
        const mappedNext = nextSet.map(asset => ({
            id: Date.now() + Math.random(),
            url: asset.url,
            name: asset.name,
            localPath: asset.localPath || null
        }));

        // LOOP LOGIC: Prepare the current set to be moved to the back of the queue
        const currentAsQueueItem = inputImages.map(img => ({
            url: img.url,
            name: img.name,
            localPath: img.localPath
        }));

        // SWAP & ROTATE: Replace workspace and push previous set to end of queue
        setInputImages(mappedNext);
        setPendingQueue([...rest, currentAsQueueItem]); 

        setIsGenerated(false);
        setLiveResults({});
        setImageVersions(() => {
            const upd = {};
            mappedNext.forEach(img => upd[img.id] = 0);
            return upd;
        });
        return;
    }

    if (resultPool.length < KNOWN_RESULT_FILES.length) {
        const autoLoadedResults = KNOWN_RESULT_FILES.map(filename => ({
            id: Date.now() + Math.random(),
            name: filename,
            url: `/Refined Image/${filename}` 
        }));
        setResultPool(prev => [...prev, ...autoLoadedResults]);
    }

    if (inputImages.length === 0) {
        try {
            const loadedImages = await Promise.all(KNOWN_SOURCE_FILES.map(async (fileName) => {
                const response = await fetch(`/Image/${fileName}`);
                const blob = await response.blob();
                return {
                    id: Date.now() + Math.random(),
                    url: URL.createObjectURL(blob),
                    name: fileName,
                    localPath: `public/Image/${fileName}` 
                };
            }));
            setInputImages(loadedImages);
            const newVersions = {};
            loadedImages.forEach(img => newVersions[img.id] = 0);
            setImageVersions(newVersions);
        } catch (error) { console.error("Auto-load failed:", error); }
    }
  };

  // NEW: Handle Local File Upload
  const handleLocalUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        name: file.name,
        localPath: null // Backend logic handles base64 if localPath is null
    }));

    setInputImages(prev => [...prev, ...newImages]);
    const newVersions = {};
    newImages.forEach(img => newVersions[img.id] = 0);
    setImageVersions(prev => ({ ...prev, ...newVersions }));
    
    // Reset input so the same file can be uploaded again if deleted
    e.target.value = "";
  };

  const callGenerationAPI = async (img, customPrompt, overrideModel, variations = 1, customPath = null) => {
    const { w, h } = getDimensions(settings.aspectRatio);
    
    // Resolve the correct source path or base64 data
    let targetPath = customPath || img.localPath || img.name;

    // If we have a blob URL (from local upload) and no override path, convert to Base64
    if (!customPath && img.url && img.url.startsWith('blob:')) {
        try {
            const blob = await fetch(img.url).then(r => r.blob());
            targetPath = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error("Failed to convert blob to base64", e);
        }
    } else if (!customPath) {
        // Fallback to URL for non-blob scenarios
        targetPath = img.url || targetPath;
    }

    const payload = {
          image_path: targetPath, 
          product_name: img.name,
          model: (overrideModel || settings.model) === 'v1' ? 'azure' : 'gemini',
          server_version: overrideModel || settings.model,
          custom_prompt: customPrompt || prompt,
          width: w,
          height: h,
          n: variations,
          temperature: settings.temperature,
          top_p: settings.topP,
          resolution: settings.resolution,
          safety_level: settings.personGeneration
        };

    try {
      const response = await fetch('http://localhost:5001/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Server Error");
      const result = await response.json();
      return result.images?.[0] || null;
    } catch (err) {
      alert(`API Error: ${err.message}`);
      return null;
    }
  };

  const handleGenerate = async () => {
    if (inputImages.length === 0) return alert("Please add images first.");
    setIsProcessing(true); 
    setIsGenerated(false);

    if (isLiveMode) {
      const results = {};
      for (const img of inputImages) {
        // Logic moved into callGenerationAPI to handle all entry points (Generate & Refine)
        const resultUrl = await callGenerationAPI(img, null, null, 1, null);
        if (resultUrl) results[`${img.id}_0`] = resultUrl;
      }
      setLiveResults(prev => ({ ...prev, ...results }));
      setIsProcessing(false);
      setIsGenerated(true);
    } else {
      setTimeout(() => { setIsProcessing(false); setIsGenerated(true); }, 3500); 
    }
  };

  const handleSendRefinement = async () => {
    const { isGlobal, targetImageId, refineInput, model, variations, refineSource } = refineModal;
    setRefineModal(prev => ({ ...prev, isOpen: false }));

    const targets = isGlobal ? inputImages : inputImages.filter(i => i.id === targetImageId);
    if (targets.length === 0) return;

    setRefiningIds(prev => {
        const next = new Set(prev);
        targets.forEach(t => next.add(t.id));
        return next;
    });

    for (const imgObj of targets) {
        const nextVersion = (imageVersions[imgObj.id] || 0) + 1;
        let sourcePath = null;

        if (refineSource === 'previous') {
            const currentVersion = imageVersions[imgObj.id] || 0;
            const currentResult = findMatchingResult(imgObj.id, imgObj.name, currentVersion);
            sourcePath = currentResult?.url;
            if (typeof sourcePath === 'string' && (sourcePath.startsWith('/') || sourcePath.startsWith('\\'))) {
                sourcePath = sourcePath.slice(1);
            }
        }

        if (isLiveMode) {
            const resultUrl = await callGenerationAPI(imgObj, refineInput, model, variations, sourcePath);
            if (resultUrl) {
                setLiveResults(prev => ({ ...prev, [`${imgObj.id}_${nextVersion}`]: resultUrl }));
            }
            setImageVersions(prev => ({ ...prev, [imgObj.id]: nextVersion }));
            setRefiningIds(prev => { const next = new Set(prev); next.delete(imgObj.id); return next; });
        } else {
            await new Promise(resolve => setTimeout(resolve, 2000));
            setImageVersions(prev => ({ ...prev, [imgObj.id]: nextVersion }));
            setRefiningIds(prev => { const next = new Set(prev); next.delete(imgObj.id); return next; });
        }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn relative">
      {/* Updated hidden input with onChange handler */}
      <input 
        ref={imageInputRef} 
        type="file" 
        accept="image/*" 
        multiple 
        className="hidden" 
        onChange={handleLocalUpload}
      />

      {/* --- Sidebar --- */}
      <div className="lg:col-span-1 bg-gray-800 rounded-lg p-5 overflow-y-auto space-y-5 border border-gray-700 shadow-xl custom-scrollbar">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
             <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🎨</span> Studio</h2>
             <div className="flex items-center gap-3 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                <span className={`text-[10px] font-bold uppercase ${isLiveMode ? 'text-green-500' : 'text-gray-500'}`}>{isLiveMode ? 'Live' : 'Present'}</span>
                <button onClick={() => setIsLiveMode(!isLiveMode)} className={`w-8 h-4 rounded-full relative transition-colors ${isLiveMode ? 'bg-green-600' : 'bg-gray-700'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isLiveMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
             </div>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <label className="text-sm font-semibold text-gray-400">Source Images</label>
                {/* Updated Button Area with Icon */}
                <div className="flex gap-1">
                    <button onClick={handleAutoLoadAndUpload} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">+ Add Images</button>
                    <button 
                        onClick={() => imageInputRef.current.click()} 
                        className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-white flex items-center justify-center transition-colors"
                        title="Upload from computer"
                    >
                        <UploadIcon />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 min-h-[80px] bg-gray-900 rounded-lg p-2 border border-gray-700">
                {inputImages.map(img => (
                    <div key={img.id} className="relative group aspect-square bg-black rounded overflow-hidden border border-gray-700">
                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                        <button onClick={() => setInputImages(p => p.filter(i => i.id !== img.id))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100">×</button>
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-400">Modification Prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Change background..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white focus:border-purple-500 outline-none h-24" />
        </div>

        <div className="grid grid-cols-3 gap-2">
            <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Model</label>
                <select value={settings.model} onChange={(e) => setSettings({...settings, model: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-[11px] text-white outline-none">
                    <option value="v1">v1 (Azure)</option>
                    <option value="v2">V2 (Nano Banana)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Ratio</label>
                <select value={settings.aspectRatio} onChange={(e) => setSettings({...settings, aspectRatio: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-[11px] text-white outline-none">
                    {SUPPORTED_RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">Resolution</label>
                <select value={settings.resolution} onChange={(e) => setSettings({...settings, resolution: e.target.value})} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-[11px] text-white outline-none">
                    <option value="1K">1K</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                </select>
            </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-700">
            <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Person Generation</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'allow_all', label: 'Allow All' },
                        { id: 'allow_adults', label: 'Adults Only' },
                        { id: 'block_all', label: 'Block All' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setSettings({...settings, personGeneration: opt.id})}
                            className={`py-1.5 text-[10px] font-bold rounded border transition-all ${settings.personGeneration === opt.id ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Temperature</label>
                        <span className="text-[10px] font-mono text-purple-400">{settings.temperature}</span>
                    </div>
                    <input 
                        type="range" min="0" max="2" step="0.1" 
                        value={settings.temperature} 
                        onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Top-P</label>
                        <span className="text-[10px] font-mono text-purple-400">{settings.topP}</span>
                    </div>
                    <input 
                        type="range" min="0.01" max="1" step="0.01" 
                        value={settings.topP} 
                        onChange={(e) => setSettings({...settings, topP: parseFloat(e.target.value)})}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>
            </div>
        </div>

        <button onClick={handleGenerate} disabled={isProcessing} className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${isProcessing ? 'bg-gray-700' : 'bg-gradient-to-r from-purple-700 to-purple-600 shadow-lg'}`}>
            {isProcessing ? 'Processing...' : '🎨 Generate'}
        </button>
      </div>

      {/* --- Preview Column --- */}
      <div className="lg:col-span-2 flex flex-col h-full bg-gray-800 rounded-lg p-4 shadow-2xl overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center mb-3">
             <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Results</h3>
             {isGenerated && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowReviewModal(true)} 
                        className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-4 rounded shadow-lg flex items-center gap-2 transition-all transform active:scale-95 border border-gray-600"
                    >
                        📚 Review all version
                    </button>
                    <button 
                        onClick={openGlobalRefineModal} 
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold py-2 px-4 rounded shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                    >
                        ✨ Refine / Edit All
                    </button>
                </div>
             )}
        </div>
        
        <div className="flex-1 bg-black rounded-lg relative overflow-y-auto custom-scrollbar">
            {/* --- INDIVIDUAL IMAGE AI MOTION LOADER --- */}
            {isProcessing && !isGenerated && (
              <div className="p-4 space-y-4 animate-fadeIn">
                {inputImages.map((img) => (
                  <div key={img.id} className="bg-gray-900/80 rounded-lg p-4 border border-purple-500/30 relative overflow-hidden group">
                    {/* Ambient Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent animate-pulse" />
                    
                    <div className="grid grid-cols-3 gap-4 h-64 relative z-10">
                      <div className="col-span-1 bg-gray-800/50 rounded border border-gray-700 overflow-hidden">
                        {/* Removed grayscale and opacity-50 here for real color */}
                        <img src={img.url} className="w-full h-full object-contain" alt="" />
                      </div>
                      <div className="col-span-2 bg-black/40 rounded border border-gray-700 flex items-center justify-center relative overflow-hidden">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent skeleton-shimmer" />
                        
                        {/* REMOVED: ai-scan-line div */}

                        {/* Neural Core Animation */}
                        <div className="relative flex items-center justify-center">
                            <div className="absolute w-24 h-24 border border-purple-500/20 rounded-full animate-ping" />
                            <div className="absolute w-20 h-20 border-t-2 border-purple-500 rounded-full animate-spin" />
                            <div className="flex flex-col items-center gap-3">
                               <div className="relative animate-bounce">
                                    <SparkleIcon />
                               </div>
                               <div className="text-center">
                                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] animate-pulse">Neural Synthesizing</p>
                                    <p className="text-[8px] text-gray-500 font-mono mt-1">Applying Model {settings.model.toUpperCase()}</p>
                               </div>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* --- ACTUAL RESULTS --- */}
            {isGenerated && (
                <div className="p-4 space-y-4">
                    {inputImages.map((img) => {
                        const version = imageVersions[img.id] || 0;
                        const result = findMatchingResult(img.id, img.name, version);
                        const isRefining = refiningIds.has(img.id);

                        return (
                            <div key={img.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 relative animate-fadeIn">
                                {/* INDIVIDUAL REFINE MOTION OVERLAY */}
                                {isRefining && (
                                    <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm overflow-hidden">
                                        {/* REMOVED: ai-scan-line div */}
                                        <div className="w-12 h-12 bg-purple-600/20 border border-purple-500 rounded flex items-center justify-center animate-spin">
                                            <div className="w-2 h-2 bg-purple-500 rounded-full" />
                                        </div>
                                        <span className="text-[10px] text-purple-400 font-mono mt-4 uppercase tracking-widest animate-pulse">Refining Matrix...</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-4 h-64">
                                    <div className="col-span-1 bg-black rounded border border-gray-700 overflow-hidden relative">
                                        <div className="absolute top-1 left-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-gray-300">Before</div>
                                        <img src={img.url} className="w-full h-full object-contain" alt="" />
                                    </div>
                                    <div className="col-span-2 bg-black rounded border border-gray-700 overflow-hidden relative flex items-center justify-center">
                                        <div className="absolute top-1 left-1 bg-purple-900/80 px-2 py-0.5 rounded text-[10px] text-white">After (V{version})</div>
                                        {result ? <img src={result.url} className="w-full h-full object-contain" alt="" /> : <p className="text-xs text-gray-600">No output</p>}
                                    </div>
                                </div>
                                <div className="mt-3 flex justify-end gap-2">
                                    <button onClick={() => {
                                        if (!result) return alert("No image to push.");
                                        onPushToDAM({ path: result.url, name: `AI_${img.name}`, type: "image/png", thumbnail: result.url, created_at: new Date() });
                                    }} className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-4 rounded shadow-lg">🚀 Push to DAM</button>
                                    <button onClick={() => setPreviewState({ isOpen: true, asset: { url: result.url, type: 'image' } })} className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-4 rounded shadow-lg border border-gray-600">👁️ Preview</button>
                                    <button onClick={() => setRefineModal({ ...refineModal, isOpen: true, targetImageId: img.id, targetImageName: img.name, isGlobal: false })} className="bg-gray-700 hover:bg-purple-600 text-white text-xs font-bold py-2 px-4 rounded">✨ Refine</button>
                                </div>                                
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>

      {/* --- Refine Modal --- */}
      {refineModal.isOpen && (() => {
        const targetImg = inputImages.find(i => i.id === refineModal.targetImageId);
        const currentVer = imageVersions[refineModal.targetImageId] || 0;
        const prevResult = targetImg ? findMatchingResult(refineModal.targetImageId, targetImg.name, currentVer) : null;

        return (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 w-full max-w-md shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-white flex justify-between">
                {refineModal.isGlobal ? '✨ Refine All Images' : 'Refine Modification'} 
                <button onClick={() => setRefineModal(p => ({ ...p, isOpen: false }))}>✕</button>
              </h3>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">
                    {refineModal.isGlobal ? 'Select Source for All Assets' : 'Select Reference Source'}
                </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRefineModal(p => ({ ...p, refineSource: 'original' }))}
                      className={`flex flex-col p-2 rounded-lg border-2 transition-all ${refineModal.refineSource === 'original' ? 'bg-purple-900/20 border-purple-500' : 'bg-gray-900 border-transparent hover:border-gray-600'}`}
                    >
                      <div className="aspect-video w-full bg-black rounded overflow-hidden mb-2">
                        <img src={targetImg?.url} className="w-full h-full object-cover" alt="Original" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${refineModal.refineSource === 'original' ? 'text-purple-400' : 'text-gray-500'}`}>Original Image</span>
                    </button>
                    <button
                      onClick={() => prevResult && setRefineModal(p => ({ ...p, refineSource: 'previous' }))}
                      disabled={!prevResult}
                      className={`flex flex-col p-2 rounded-lg border-2 transition-all ${!prevResult ? 'opacity-50 cursor-not-allowed' : ''} ${refineModal.refineSource === 'previous' ? 'bg-purple-900/20 border-purple-500' : 'bg-gray-900 border-transparent hover:border-gray-600'}`}
                    >
                      <div className="aspect-video w-full bg-black rounded overflow-hidden mb-2 flex items-center justify-center">
                        {prevResult ? (
                          <img src={prevResult.url} className="w-full h-full object-cover" alt="Previous" />
                        ) : (
                          <span className="text-[10px] text-gray-700 italic">No Previous Result</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${refineModal.refineSource === 'previous' ? 'text-purple-400' : 'text-gray-500'}`}>Previous (V{currentVer})</span>
                    </button>
                  </div>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Model</label>
                  <select value={refineModal.model} onChange={(e) => setRefineModal(p => ({ ...p, model: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white outline-none">
                    <option value="v1">v1 (Azure)</option>
                    <option value="v2">V2 (Nano Banana)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Variations</label>
                  <select value={refineModal.variations} onChange={(e) => setRefineModal(p => ({ ...p, variations: parseInt(e.target.value) }))} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white outline-none">
                    {[1, 2, 3, 4].map(n => <option key={n} value={n} >{n} Image{n > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>
              <textarea value={refineModal.refineInput} onChange={(e) => setRefineModal(p => ({ ...p, refineInput: e.target.value }))} placeholder="Refinement instructions..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm h-24 text-white focus:border-purple-500 outline-none resize-none" />
              <div className="flex justify-end gap-2 mt-4 pt-2 border-t border-gray-700">
                <button onClick={() => setRefineModal(p => ({ ...p, isOpen: false }))} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button onClick={handleSendRefinement} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded text-sm font-bold text-white shadow-lg transform active:scale-95 transition-all">
                  🚀 Run Refinement
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <UniversalPreview 
        isOpen={previewState.isOpen} 
        onClose={() => setPreviewState({ ...previewState, isOpen: false })} 
        asset={previewState.asset} 
      />

      {/* --- Version Review Modal --- */}
      {showReviewModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-gray-800 rounded-xl border border-gray-600 w-[95%] max-h-[90%] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📚</span> Session Version History
                </h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Reviewing all iterations for current workspace</p>
              </div>
              <button 
                onClick={() => setShowReviewModal(false)} 
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar bg-gray-900/30">
              {inputImages.map(img => {
                  const versions = [];
                  const maxV = imageVersions[img.id] || 0;
                  // Collect all versions available in the session pool
                  for(let i=0; i <= maxV; i++) {
                      const res = findMatchingResult(img.id, img.name, i);
                      if(res) versions.push({ v: i, url: res.url });
                  }

                  return (
                      <div key={img.id} className="space-y-4">
                          <div className="flex items-center gap-3 border-l-2 border-purple-500 pl-4">
                              <span className="text-sm font-bold text-white">{img.name}</span>
                              <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                                {versions.length} Iterations
                              </span>
                          </div>
                          
                          <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar-horizontal">
                              {/* Show Original first for context */}
                              <div className="flex-shrink-0 w-72 space-y-2">
                                  <div className="aspect-[4/3] bg-black rounded-lg border border-gray-700 overflow-hidden relative group">
                                      <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
                                      <div className="absolute top-2 left-2 z-10 bg-gray-900/90 px-2 py-1 rounded text-[10px] font-black text-gray-400 border border-gray-700">
                                          SOURCE
                                      </div>
                                      <img src={img.url} className="w-full h-full object-contain" alt="Original" />
                                  </div>
                              </div>

                              {/* Map through all generated versions */}
                              {versions.map(ver => (
                                  <div key={ver.v} className="flex-shrink-0 w-72 space-y-2">
                                      <div className="aspect-[4/3] bg-black rounded-lg border border-purple-900/50 overflow-hidden relative group shadow-xl">
                                          <div className="absolute top-2 left-2 z-10 bg-purple-600 px-2 py-1 rounded text-[10px] font-black text-white shadow-lg">
                                              V{ver.v}
                                          </div>
                                          <img src={ver.url} className="w-full h-full object-contain" alt={`Version ${ver.v}`} />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  );
              })}
            </div>
            
            <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end">
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold text-sm transition-colors border border-gray-600"
                >
                    Close Review
                </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar-horizontal::-webkit-scrollbar { height: 8px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track { background: #111827; border-radius: 10px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; border: 2px solid #111827; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: #111827; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          animation: shimmer 1.5s infinite;
        }
        
        /* Removed scan keyframes and .ai-scan-line class as requested */
      `}</style>
    </div>
  );
}

export default ImageModification;