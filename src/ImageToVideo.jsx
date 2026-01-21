import { useState, useRef, useEffect } from 'react';
import UniversalPreview from './UniversalPreview';

// --- CONFIGURATION ---
const KNOWN_VIDEO_FILES = [
  '1.mp4', '1_1.mp4', '1_2.mp4',
  '2.mp4', '2_1.mp4',
  '3.mp4', '3_1.mp4'
];

const KNOWN_IMAGE_FILES = [
  '1.jpg',
  '2.jpg',
  '3.jpg'
];

// NEW: Upload Icon for local files
const UploadIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

function ImageToVideo({ onPushToDAM, incomingAssets, onClearIncoming }) {
  // --- State ---
  const [inputImages, setInputImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [pendingQueue, setPendingQueue] = useState([]);

  // NEW: Live Mode State
  const [isLiveMode, setIsLiveMode] = useState(false);

  const [settings, setSettings] = useState({
    task: 'Image-to-video',
    model: 'Google Veo 3.1',
    aspectRatio: '16:9',
    videoLength: '6 seconds',
    resolution: '1080p',
    variations: '1',
    generateAudio: false,
    seed: -1
  });
  const [liveVideos, setLiveVideos] = useState({}); // Stores { imgId_version: videoUrl }

  const [videoPool, setVideoPool] = useState([]);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewState, setPreviewState] = useState({ isOpen: false, asset: null });
  const [refiningIds, setRefiningIds] = useState(new Set());
  const [imageVersions, setImageVersions] = useState({});
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [refineModal, setRefineModal] = useState({
    isOpen: false,
    isGlobal: false,
    targetImageId: null,
    targetImageName: '',
    refineInput: ''
  });

  // --- Refs ---
  const imageInputRef = useRef(null);
  const configInputRef = useRef(null);

  // --- External Transfer Logic (Sequential Set Loading) ---
  useEffect(() => {
    if (incomingAssets && incomingAssets.length > 0) {
      const [firstSet, ...remainingSets] = incomingAssets;

      const firstSetMapped = firstSet.map(asset => ({
        id: Date.now() + Math.random(),
        url: asset.url,
        name: asset.name,
        file: null
      }));

      setInputImages(firstSetMapped);
      setPendingQueue(remainingSets);

      // Reset state for new set to prevent data leakage
      setIsGenerated(false);
      setLiveVideos({});
      const newVersions = {};
      firstSetMapped.forEach(img => newVersions[img.id] = 0);
      setImageVersions(newVersions);
      onClearIncoming();
    }
  }, [incomingAssets]);

  // --- Helpers ---
  const getBaseName = (filename) => {
    return filename.split('.').slice(0, -1).join('.').toLowerCase();
  };

  const findMatchingVideo = (imgId, imageName, versionIndex) => {
    // 1. Check Live store first
    const liveKey = `${imgId}_${versionIndex}`;
    if (liveVideos[liveKey]) return { url: liveVideos[liveKey], name: `Live_V${versionIndex}` };

    // 2. Fallback to static pool
    const baseName = getBaseName(imageName);
    const targetName = versionIndex === 0
      ? baseName
      : `${baseName}_${versionIndex}`;

    return videoPool.find(v => getBaseName(v.name) === targetName);
  };

  // --- Handlers ---
  const handleAutoLoadAndUpload = async () => {
    if (pendingQueue.length > 0) {
      const [nextSet, ...rest] = pendingQueue;
      const mappedNext = nextSet.map(asset => ({
        id: Date.now() + Math.random(),
        url: asset.url,
        name: asset.name,
        file: null
      }));

      // LOOP LOGIC: Prepare the current set to be moved to the back of the queue
      const currentAsQueueItem = inputImages.map(img => ({
        url: img.url,
        name: img.name
      }));

      // SWAP & ROTATE: Replace workspace and push previous set to end of queue
      setInputImages(mappedNext);
      setPendingQueue([...rest, currentAsQueueItem]);

      setIsGenerated(false);
      setLiveVideos({});
      setImageVersions(() => {
        const upd = {};
        mappedNext.forEach(img => upd[img.id] = 0);
        return upd;
      });
      return;
    }

    if (videoPool.length < KNOWN_VIDEO_FILES.length) {
      const autoLoadedVideos = KNOWN_VIDEO_FILES.map(filename => ({
        id: Date.now() + Math.random(),
        name: filename,
        url: `/Video/${filename}`
      }));

      setVideoPool(prev => {
        const existingNames = new Set(prev.map(v => v.name));
        const uniqueNew = autoLoadedVideos.filter(v => !existingNames.has(v.name));
        return [...prev, ...uniqueNew];
      });
    }

    if (inputImages.length === 0) {
      try {
        const loadedImages = await Promise.all(KNOWN_IMAGE_FILES.map(async (fileName) => {
          const response = await fetch(`/Video/${fileName}`);
          if (!response.ok) throw new Error(`File not found: ${fileName}`);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: 'image/jpeg' });

          return {
            id: Date.now() + Math.random(),
            url: URL.createObjectURL(blob),
            name: fileName,
            file: file
          };
        }));

        setInputImages(prev => [...prev, ...loadedImages]);
        const newVersions = {};
        loadedImages.forEach(img => newVersions[img.id] = 0);
        setImageVersions(prev => ({ ...prev, ...newVersions }));
      } catch (error) {
        console.error("Error auto-loading:", error);
      }
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length) {
      const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        name: file.name,
        file: file
      }));
      setInputImages(prev => [...prev, ...newImages]);
      const newVersions = {};
      newImages.forEach(img => newVersions[img.id] = 0);
      setImageVersions(prev => ({ ...prev, ...newVersions }));
    }
    if (imageInputRef.current) imageInputRef.current.value = null;
  };

  const removeImage = (id) => {
    setInputImages(prev => prev.filter(img => img.id !== id));
    const newVersions = { ...imageVersions };
    delete newVersions[id];
    setImageVersions(newVersions);
  };

  // Manual mock video upload removed for production

  const handleGenerate = async () => {
    if (inputImages.length === 0) {
      alert("Please click '+ Add Images' first.");
      return;
    }
    setIsProcessing(true);
    setIsGenerated(false);

    // If Live Mode is active, prepare and send data to the server
    if (isLiveMode) {
      try {
        for (const img of inputImages) {
          let imageSource = img.url;

          // Convert local Blob URLs to Base64 for server processing
          if (img.url.startsWith('blob:')) {
            const blob = await fetch(img.url).then(r => r.blob());
            imageSource = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
          }

          const response = await fetch('http://localhost:5001/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_path: imageSource,
              prompt: prompt || "Cinematic motion",
              aspect_ratio: settings.aspectRatio,
              resolution: settings.resolution,
              duration: parseInt(settings.videoLength),
              generate_audio: settings.generateAudio,
              model: "veo-3.1-generate-001"
            })
          });

          if (!response.ok) throw new Error("API Failed");
          const data = await response.json();
          if (data.video) {
            setLiveVideos(prev => ({ ...prev, [`${img.id}_0`]: data.video }));
          }
        }
      } catch (err) {
        console.error("Live Generation failed:", err);
        alert("Live generation failed. Please check server logs.");
      }
    }

    const delay = isLiveMode ? 5000 : 3500;
    setTimeout(() => {
      setIsProcessing(false);
      setIsGenerated(true);
    }, delay);
  };

  const openRefineModal = (imageId, imageName) => {
    setRefineModal({ isOpen: true, isGlobal: false, targetImageId: imageId, targetImageName: imageName, refineInput: '' });
  };

  const openGlobalRefineModal = () => {
    if (inputImages.length === 0 || !isGenerated) {
      alert("Please generate videos first before refining.");
      return;
    }
    setRefineModal({ isOpen: true, isGlobal: true, targetImageId: null, targetImageName: 'All Images', refineInput: '' });
  };

  const handleSendRefinement = async () => {
    const { isGlobal, targetImageId } = refineModal;
    setRefineModal(prev => ({ ...prev, isOpen: false }));

    // Local helper to resolve blob data for refinements
    const resolveSource = async (imgUrl) => {
      if (imgUrl.startsWith('blob:')) {
        const blob = await fetch(imgUrl).then(r => r.blob());
        return await new Promise(res => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      return imgUrl;
    };
    if (isGlobal) {
      const allIds = inputImages.map(img => img.id);
      setRefiningIds(prev => {
        const next = new Set(prev);
        allIds.forEach(id => next.add(id));
        return next;
      });

      setTimeout(() => {
        setImageVersions(prev => {
          const nextVersions = { ...prev };
          allIds.forEach(id => { nextVersions[id] = (nextVersions[id] || 0) + 1; });
          return nextVersions;
        });
        setRefiningIds(prev => {
          const next = new Set(prev);
          allIds.forEach(id => next.delete(id));
          return next;
        });
      }, 4000);
    } else {
      if (!targetImageId) return;
      setRefiningIds(prev => new Set(prev).add(targetImageId));
      setTimeout(() => {
        setImageVersions(prev => ({ ...prev, [targetImageId]: (prev[targetImageId] || 0) + 1 }));
        setRefiningIds(prev => {
          const next = new Set(prev);
          next.delete(targetImageId);
          return next;
        });
      }, 4000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn relative text-white">
      <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />

      {/* --- Left Column: Controls --- */}
      <div className="lg:col-span-1 bg-gray-800 rounded-lg p-5 overflow-y-auto space-y-5 custom-scrollbar border border-gray-700 shadow-xl">

        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🪄</span> Video Studio
          </h2>
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

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <label className="text-sm font-semibold text-gray-400">Input Images</label>
            <div className="flex gap-1">
              <button onClick={handleAutoLoadAndUpload} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white transition-colors">+ Add Images</button>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-white flex items-center justify-center transition-colors"
                title="Upload from computer"
              >
                <UploadIcon />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 min-h-[80px] bg-gray-900 rounded-lg p-2 border border-gray-700">
            {inputImages.length === 0 && <div className="col-span-3 flex items-center justify-center text-gray-600 text-xs italic h-20">Upload images...</div>}
            {inputImages.map(img => (
              <div key={img.id} className="relative group aspect-square bg-black rounded overflow-hidden border border-gray-700">
                <img src={img.url} alt="Input" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white p-1 truncate">{img.name}</div>
                <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-1">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the motion..."
              className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm focus:border-red-500 outline-none resize-none h-24 text-gray-200"
            />
          </div>
        </div>

        <hr className="border-gray-700" />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Task</label>
              <select
                value={settings.task}
                onChange={(e) => setSettings({ ...settings, task: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none"
              >
                <option>Text-to-video</option>
                <option>Image-to-video</option>
                <option>Reference-to-video</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">Generative Model</label>
              <select
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm text-white focus:border-red-500 outline-none"
              >
                <option>Google Veo 3.1</option>
                <option>GPT Sora</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase truncate">Video length</label>
              <select
                value={settings.videoLength}
                onChange={(e) => setSettings({ ...settings, videoLength: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white outline-none"
              >
                <option>4 seconds</option>
                <option>6 seconds</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase truncate">Resolution</label>
              <select
                value={settings.resolution}
                onChange={(e) => setSettings({ ...settings, resolution: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white outline-none"
              >
                <option>1080p</option>
                <option>720p</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase truncate">Aspect ratio</label>
              <select
                value={settings.aspectRatio}
                onChange={(e) => setSettings({ ...settings, aspectRatio: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white outline-none"
              >
                <option value="16:9">▭ 16:9</option>
                <option value="9:16">▯ 9:16</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1 uppercase truncate">Variations</label>
              <select
                value={settings.variations}
                onChange={(e) => setSettings({ ...settings, variations: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-xs text-white outline-none"
              >
                <option>1</option>
                <option>2</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
            <span className="text-sm font-semibold text-gray-400">Generate Audio</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.generateAudio}
                onChange={(e) => setSettings({ ...settings, generateAudio: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 transition-colors"></div>
            </label>
          </div>
        </div>

        <div className="pt-2 space-y-4">
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className={`w-full py-4 rounded-lg font-bold text-base transition-all flex justify-center items-center gap-2 transform active:scale-95 ${isProcessing ? 'bg-gray-700 cursor-wait text-gray-300' : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-lg shadow-red-900/40'
              }`}
          >
            {isProcessing ? (<><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Generating...</>) : ('✨ Generate Videos')}
          </button>
        </div>
      </div>

      {/* --- Right Column: Preview --- */}
      <div className="lg:col-span-2 flex flex-col h-full bg-gray-800 rounded-lg p-4 shadow-2xl overflow-hidden">
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
              <button onClick={openGlobalRefineModal} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded shadow-lg flex items-center gap-2 transition-all transform active:scale-95">✨ Refine / Edit All</button>
            </div>
          )}
        </div>

        <div className="flex-1 bg-black rounded-lg relative overflow-y-auto custom-scrollbar border border-gray-700">
          {!isGenerated && !isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-30 select-none pointer-events-none">
              <div className="text-8xl mb-6">🎬</div>
              <p className="text-2xl font-bold tracking-wider">Ready to Generate</p>
              <p className="text-sm mt-2 font-mono">Add Images & Prompt | Select Quality | Generate</p>
            </div>
          )}

          {/* --- INDIVIDUAL VIDEO AI MOTION LOADER --- */}
          {isProcessing && !isGenerated && (
            <div className="p-4 space-y-4 animate-fadeIn">
              {inputImages.map((img) => (
                <div key={img.id} className="bg-gray-900/80 rounded-lg p-4 border border-red-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent animate-pulse" />
                  <div className="grid grid-cols-3 gap-4 h-64 relative z-10">
                    <div className="col-span-1 bg-gray-800/50 rounded border border-gray-700 overflow-hidden">
                      <img src={img.url} className="w-full h-full object-contain" alt="" />
                    </div>
                    <div className="col-span-2 bg-black/40 rounded border border-gray-700 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent skeleton-shimmer" />
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-24 h-24 border border-red-500/20 rounded-full animate-ping" />
                        <div className="absolute w-20 h-20 border-t-2 border-red-500 rounded-full animate-spin" />
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-3xl animate-bounce">🎬</div>
                          <div className="text-center">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-[0.3em] animate-pulse">Synthesizing Motion</p>
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

          {isGenerated && (
            <div className="p-4 space-y-4">
              {inputImages.map((img, index) => {
                const version = imageVersions[img.id] || 0;
                const matchedVideo = findMatchingVideo(img.id, img.name, version);
                const isRefining = refiningIds.has(img.id);

                return (
                  <div key={img.id} className="bg-gray-900 rounded-lg p-4 border border-gray-700 shadow-md animate-fadeIn relative overflow-hidden" style={{ animationDelay: `${index * 0.1}s` }}>
                    {isRefining && (
                      <div className="absolute inset-0 bg-black/80 z-30 flex flex-col items-center justify-center backdrop-blur-sm">
                        <div className="w-12 h-12 bg-blue-600/20 border border-blue-500 rounded flex items-center justify-center animate-spin">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        </div>
                        <span className="text-[10px] text-blue-400 font-mono mt-4 uppercase tracking-widest animate-pulse">Refining Matrix...</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-300">📄 {img.name} <span className={`text-xs font-normal px-2 py-0.5 rounded ${version > 0 ? 'bg-blue-900 text-blue-200' : 'text-gray-500'}`}>Version: {version === 0 ? 'Original' : `V${version}`}</span></h3>
                    </div>
                    <div className="grid grid-cols-3 gap-4 h-64">
                      <div className="col-span-1 bg-black rounded border border-gray-700 overflow-hidden relative"><img src={img.url} alt="Source" className="w-full h-full object-contain" /></div>
                      <div className="col-span-2 bg-black rounded border border-gray-700 overflow-hidden relative flex items-center justify-center">
                        {matchedVideo ? <video key={matchedVideo.url} src={matchedVideo.url} controls autoPlay loop muted className="w-full h-full object-contain" /> : <div className="text-center p-4"><div className="text-3xl mb-2">❓</div><p className="text-xs text-gray-500">Video {getBaseName(img.name)}{version > 0 ? `_${version}` : ''}.mp4 not found</p></div>}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          if (!matchedVideo) return alert("No video found to push.");
                          onPushToDAM({
                            path: matchedVideo.url,
                            name: `AI_Video_${img.name.split('.')[0]}_V${version}.mp4`,
                            type: "video/mp4",
                            size: "AI Generated",
                            thumbnail: img.url,
                            tags: ["AI Video", "Motion"],
                            created_at: new Date(),
                            sharedBy: "Video AI Studio",
                            sharedDate: new Date()
                          });
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 px-4 rounded transition-all shadow-lg hover:shadow-red-500/20"
                      >
                        🚀 Push to DAM
                      </button>
                      <button onClick={() => setPreviewState({ isOpen: true, asset: { url: matchedVideo.url, type: 'video' } })} className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 px-4 rounded shadow-lg border border-gray-600">👁️ Preview</button>
                      <button onClick={() => openRefineModal(img.id, img.name)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition-colors">✨ Refine Result</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {refineModal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 flex justify-between items-center text-white">{refineModal.isGlobal ? '✨ Refine All' : 'Refine Video Result'}<button onClick={() => setRefineModal(prev => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-white">✕</button></h3>
            <p className="text-sm text-gray-400 mb-4 font-mono">{refineModal.targetImageName}</p>
            <div className="mb-4">
              <textarea
                value={refineModal.refineInput}
                onChange={(e) => setRefineModal(prev => ({ ...prev, refineInput: e.target.value }))}
                placeholder="e.g. Add cinematic lighting..."
                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-gray-200 h-32 outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRefineModal(prev => ({ ...prev, isOpen: false }))} className="px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-700">Cancel</button>
              <button onClick={handleSendRefinement} className="px-4 py-2 rounded text-sm bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors">Apply</button>
            </div>
          </div>
        </div>
      )}

      <UniversalPreview 
        isOpen={previewState.isOpen} 
        onClose={() => setPreviewState({ ...previewState, isOpen: false })} 
        asset={previewState.asset} 
      />

      {/* --- Video Version Review Modal --- */}
      {showReviewModal && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
          <div className="bg-gray-800 rounded-xl border border-gray-600 w-[95%] max-h-[90%] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎬</span> Motion Version History
                </h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">Reviewing all video iterations for current workspace</p>
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

            <div className="flex-1 overflow-y-auto p-6 space-y-12 custom-scrollbar bg-gray-900/30">
              {inputImages.map(img => {
                const versions = [];
                const maxV = imageVersions[img.id] || 0;
                // Collect all videos generated in the current session
                for (let i = 0; i <= maxV; i++) {
                  const res = findMatchingVideo(img.id, img.name, i);
                  if (res) versions.push({ v: i, url: res.url });
                }

                return (
                  <div key={img.id} className="space-y-4">
                    <div className="flex items-center gap-3 border-l-2 border-red-500 pl-4">
                      <span className="text-sm font-bold text-white">{img.name}</span>
                      <span className="text-[10px] font-black uppercase text-gray-500 bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                        {versions.length} Motion Clips
                      </span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar-horizontal">
                      {/* Show Original first for context */}
                      <div className="flex-shrink-0 w-80 space-y-2">
                        <div className="aspect-video bg-black rounded-lg border border-gray-700 overflow-hidden relative group">
                          <div className="absolute top-2 left-2 z-10 bg-gray-900/90 px-2 py-1 rounded text-[10px] font-black text-gray-400 border border-gray-700">
                            STATIC SOURCE
                          </div>
                          <img src={img.url} className="w-full h-full object-contain" alt="Original" />
                        </div>
                      </div>

                      {/* Map through all generated video versions */}
                      {versions.map(ver => (
                        <div key={ver.v} className="flex-shrink-0 w-80 space-y-2">
                          <div className="aspect-video bg-black rounded-lg border border-red-900/50 overflow-hidden relative group shadow-xl">
                            <div className="absolute top-2 left-2 z-10 bg-red-600 px-2 py-1 rounded text-[10px] font-black text-white shadow-lg">
                              VERSION {ver.v}
                            </div>
                            <video
                              src={ver.url}
                              className="w-full h-full object-contain"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
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
                className="px-8 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-bold text-sm transition-colors border border-gray-600"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar-horizontal::-webkit-scrollbar { height: 10px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-track { background: #0b0f1a; border-radius: 10px; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; border: 3px solid #0b0f1a; }
        .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover { background: #ef4444; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111827; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 4px; }
        .fixed-loading { position: absolute; } 

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}

export default ImageToVideo;