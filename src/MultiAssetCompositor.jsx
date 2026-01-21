import React, { useState, useRef, useEffect } from 'react';
import UniversalPreview from './UniversalPreview';

// Organized Asset Sets for the cycling logic
const ASSET_SETS = {
  1: {
    inputs: ['1_1.png', '1_2.png', '1_3.png'],
    results: [
      '/Eblast/Result Images/1_1.png',
      '/Eblast/Result Images/1_2.png',
      '/Eblast/Result Images/1_3.png',
      '/Eblast/Result Images/1_4.png'
    ],
    diverseResults: [
      '/Eblast/Result Images/1_5.png',
      '/Eblast/Result Images/1_6.png',
      '/Eblast/Result Images/1_7.png',
      '/Eblast/Result Images/1_8.png'
    ]
  },
  2: {
    inputs: ['2_1.png', '2_2.png', '2_3.png'],
    results: [
      '/Eblast/Result Images/2_1.png',
      '/Eblast/Result Images/2_2.png',
      '/Eblast/Result Images/2_3.png',
      '/Eblast/Result Images/2_4.png'
    ],
    diverseResults: [
      '/Eblast/Result Images/2_5.png',
      '/Eblast/Result Images/2_6.png',
      '/Eblast/Result Images/2_7.png',
      '/Eblast/Result Images/2_8.png'
    ]
  }
};

const UploadIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

function EblastAutomation({ onPushToDAM }) {
  const [inputImages, setInputImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImages, setResultImages] = useState([]);

  // Refinement State
  const [refineModal, setRefineModal] = useState({ isOpen: false, prompt: '' });
  const [boxesRefining, setBoxesRefining] = useState([false, false, false, false]);

  const [nextSetToLoad, setNextSetToLoad] = useState(1);
  const [activeLoadedSet, setActiveLoadedSet] = useState(1);
  const [previewState, setPreviewState] = useState({ isOpen: false, asset: null });

  const [dimensionMode, setDimensionMode] = useState('Uniform');
  const [selectedRatios, setSelectedRatios] = useState(['9:16']);

  const [settings, setSettings] = useState({
    model: 'v2',
    aspectRatio: '9:16',
    resolution: '1K',
    temperature: 1.0,
    top_p: 0.95,
    safety_level: 'allow_all'
  });

  const fileInputRef = useRef(null);

  const handleAutoLoad = async () => {
    try {
      const currentSet = ASSET_SETS[nextSetToLoad];
      const loaded = await Promise.all(currentSet.inputs.map(async (name) => {
        const url = `/Eblast/Input Images/${name}`;
        return { id: Math.random(), url, name };
      }));

      setInputImages(loaded);
      setActiveLoadedSet(nextSetToLoad);
      setNextSetToLoad(prev => (prev === 1 ? 2 : 1));
    } catch (e) {
      console.error("Autoload failed", e);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImgs = files.map(f => ({
      id: Math.random(),
      url: URL.createObjectURL(f),
      name: f.name,
      isLocalFile: true
    }));
    setInputImages(prev => [...prev, ...newImgs]);
  };

  const toggleRatio = (ratio) => {
    if (dimensionMode === 'Uniform') {
      setSettings({ ...settings, aspectRatio: ratio });
    } else {
      setSelectedRatios(prev => {
        if (prev.includes(ratio)) return prev.filter(r => r !== ratio);
        if (prev.length >= 4) return prev;
        return [...prev, ratio];
      });
    }
  };

  const handleGenerate = async () => {
    if (inputImages.length === 0) return alert("Please add images first.");
    setIsProcessing(true);
    setResultImages([]);

    if (isLiveMode) {
      try {
        const base64Images = await Promise.all(inputImages.map(async (img) => {
          if (img.url.startsWith('data:image')) return img.url;
          const resp = await fetch(img.url);
          const blob = await resp.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }));

        const targetRatios = dimensionMode === 'Uniform'
          ? Array(4).fill(settings.aspectRatio)
          : [...selectedRatios, ...Array(4 - selectedRatios.length).fill(selectedRatios[0])].slice(0, 4);

        const responses = await Promise.all(targetRatios.map(ratio =>
          fetch('http://localhost:5001/generate-eblast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              images: base64Images,
              prompt,
              settings: { ...settings, aspectRatio: ratio },
              is_live: true
            })
          }).then(res => res.json())
        ));
        setResultImages(responses.map(r => r.image));
      } catch (e) {
        alert("Live Generation Failed");
      }
    } else {
      setTimeout(() => {
        const currentSet = ASSET_SETS[activeLoadedSet];
        setResultImages(dimensionMode === 'Diverse' ? currentSet.diverseResults : currentSet.results);
        setIsProcessing(false);
      }, 3500);
      return;
    }
    setIsProcessing(false);
  };

  const handleRefineAll = async () => {
    if (resultImages.length === 0) return;
    setRefineModal({ ...refineModal, isOpen: false });

    // Set all boxes to refining state (Blur + AI Motion)
    setBoxesRefining([true, true, true, true]);

    if (isLiveMode) {
      try {
        const refinePromises = resultImages.map(async (imgUrl, idx) => {
          const resp = await fetch('http://localhost:5001/generate-eblast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              images: [imgUrl],
              prompt: refineModal.prompt,
              settings: { ...settings },
              is_live: true
            })
          });
          const data = await resp.json();

          // Random delay before reveal (1-3s)
          await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));

          setResultImages(prev => {
            const next = [...prev];
            next[idx] = data.image;
            return next;
          });
          setBoxesRefining(prev => {
            const next = [...prev];
            next[idx] = false;
            return next;
          });
        });
        await Promise.all(refinePromises);
      } catch (e) {
        alert("Live Refinement Failed");
        setBoxesRefining([false, false, false, false]);
      }
    } else {
      // Present Mode: Map filenames to include "_X" suffix with staggered reveals
      resultImages.forEach((url, idx) => {
        const randomDelay = 1000 + Math.random() * 2000;

        setTimeout(() => {
          const parts = url.split('.');
          const ext = parts.pop();
          const refinedUrl = `${parts.join('.')}_X.${ext}`;

          setResultImages(prev => {
            const next = [...prev];
            next[idx] = refinedUrl;
            return next;
          });
          setBoxesRefining(prev => {
            const next = [...prev];
            next[idx] = false;
            return next;
          });
        }, randomDelay);
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn text-white relative">
      <div className="lg:col-span-1 bg-gray-800 rounded-lg p-5 overflow-y-auto space-y-5 border border-gray-700 shadow-xl custom-scrollbar">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>📧</span> Studio</h2>
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
            <label className="text-sm font-semibold text-gray-400">Input Assets</label>
            <div className="flex gap-1">
              <button onClick={handleAutoLoad} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white transition-colors">+ Add Images</button>
              <button onClick={() => fileInputRef.current?.click()} className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-white flex items-center justify-center transition-colors"><UploadIcon /></button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 min-h-[80px] bg-gray-900 rounded-lg p-2 border border-gray-700">
            {inputImages.length === 0 && <div className="col-span-3 flex items-center justify-center text-gray-600 text-xs italic h-20">No images...</div>}
            {inputImages.map(img => (
              <div key={img.id} className="relative group aspect-square bg-black rounded overflow-hidden border border-gray-700">
                <img src={img.url} className="w-full h-full object-cover" alt="" />
                <button onClick={() => setInputImages(prev => prev.filter(i => i.id !== img.id))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-400">Eblast Prompt</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the promotion..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white focus:border-red-500 outline-none h-24" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Model</label>
            <select value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none">
              <option value="v1">v1 (Azure)</option>
              <option value="v2">V2 (Nano Banana)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Resolution</label>
            <select value={settings.resolution} onChange={(e) => setSettings({ ...settings, resolution: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none">
              <option value="1K">1K</option>
              <option value="2K">2K</option>
              <option value="4K">4K</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Person Gen</label>
            <select value={settings.safety_level} onChange={(e) => setSettings({ ...settings, safety_level: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none">
              <option value="allow_all">Allow All</option>
              <option value="allow_adults">Adults Only</option>
              <option value="block_all">Block All</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Dimensions</label>
              <div className="grid grid-cols-2 gap-2">
                {['Uniform', 'Diverse'].map(opt => (
                  <button key={opt} onClick={() => setDimensionMode(opt)} className={`py-1.5 text-[10px] font-bold rounded border transition-all ${dimensionMode === opt ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}>{opt}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">{dimensionMode === 'Uniform' ? 'Aspect Ratio' : `Ratios (${selectedRatios.length}/4)`}</label>
              <div className="relative group">
                <div className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white flex flex-wrap gap-1 min-h-[31px] cursor-pointer">
                  {dimensionMode === 'Uniform' ? (<span>{settings.aspectRatio}</span>) : (selectedRatios.map(r => <span key={r} className="bg-red-600 px-3 rounded text-[9px]">{r}</span>))}
                  {dimensionMode === 'Diverse' && selectedRatios.length === 0 && <span className="text-gray-600">Select...</span>}
                </div>
                <div className="absolute z-30 bottom-full left-0 w-full bg-gray-900 border border-gray-700 rounded mb-1 hidden group-hover:grid grid-cols-2 p-2 gap-1 shadow-2xl">
                  {["1:1", "3:2", "2:3", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"].map(r => (
                    <button key={r} onClick={() => toggleRatio(r)} className={`text-[10px] p-1 rounded transition-colors ${(dimensionMode === 'Uniform' ? settings.aspectRatio === r : selectedRatios.includes(r)) ? 'bg-red-600 text-white' : 'hover:bg-gray-700 text-gray-400'}`}>{r}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Temperature</label><span className="text-[10px] font-mono text-red-400">{settings.temperature}</span></div>
              <input type="range" min="0" max="2" step="0.1" value={settings.temperature} onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Top-P</label><span className="text-[10px] font-mono text-red-400">{settings.top_p}</span></div>
              <input type="range" min="0.01" max="1" step="0.01" value={settings.top_p} onChange={(e) => setSettings({ ...settings, top_p: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
            </div>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={isProcessing} className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${isProcessing ? 'bg-gray-700' : 'bg-gradient-to-r from-red-700 to-red-600 shadow-lg shadow-red-900/40'}`}>
          {isProcessing ? 'Generating 4 Layouts...' : '✨ Generate'}
        </button>
      </div>

      <div className="lg:col-span-2 flex flex-col h-full bg-gray-800 rounded-lg p-4 shadow-2xl overflow-hidden border border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Compositing Preview</h3>
          {resultImages.length > 0 && !isProcessing && (
            <button onClick={() => setRefineModal({ ...refineModal, isOpen: true })} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 px-4 rounded shadow-lg transition-all transform active:scale-95 flex items-center gap-2">✨ Refine / Edit All</button>
          )}
        </div>
        <div className="flex-1 bg-black rounded-lg relative overflow-y-auto custom-scrollbar flex items-center justify-center p-4">
          {!isProcessing && resultImages.length === 0 && (
            <div className="text-center opacity-30 select-none pointer-events-none">
              <div className="text-8xl mb-4">📧</div>
              <p className="text-2xl font-bold tracking-wider uppercase">Ready for Layout</p>
            </div>
          )}

          {isProcessing && (
            <div className="grid grid-cols-2 gap-4 w-full h-full animate-fadeIn">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-700 rounded flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent skeleton-shimmer" />
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-12 h-12 border-t-2 border-red-500 rounded-full animate-spin mb-2" />
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest animate-pulse">Computing V{i + 1}</p>
                    <p className="text-[8px] text-gray-500 font-mono">Neural Layout {i + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resultImages.length > 0 && !isProcessing && (
            <div className="grid grid-cols-2 gap-4 w-full h-full animate-fadeIn">
              {resultImages.map((imgUrl, index) => (
                <div key={index} className="relative group bg-white shadow-2xl border border-gray-700 rounded overflow-hidden flex flex-col">
                  <div className={`flex-1 flex items-center justify-center overflow-hidden bg-black relative transition-all duration-500 ${boxesRefining[index] ? 'blur-md grayscale' : ''}`}>
                    <img src={imgUrl} className="max-w-full max-h-full object-contain" alt={`Eblast Variant ${index + 1}`} />
                  </div>

                  {/* AI Motion Overlay during individual box refinement */}
                  {boxesRefining[index] && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40">
                      <div className="relative flex items-center justify-center">
                        <div className="absolute w-12 h-12 border border-red-500/20 rounded-full animate-ping" />
                        <div className="w-10 h-10 border-t-2 border-red-500 rounded-full animate-spin" />
                      </div>
                      <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] mt-3 animate-pulse">AI Synthesis</p>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                    <button onClick={() => onPushToDAM({ path: imgUrl, name: `AI_Eblast_v${index + 1}.png`, type: "image/png", thumbnail: imgUrl, created_at: new Date() })} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-1.5 rounded shadow-lg transition-all flex items-center justify-center gap-1">🚀 Push to DAM</button>
                    <button onClick={() => setPreviewState({ isOpen: true, asset: { url: imgUrl, type: 'image' } })} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-bold py-1.5 rounded shadow-lg transition-all flex items-center justify-center gap-1">👁️ Preview</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {refineModal.isOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 flex justify-between items-center text-white">✨ Refine All Images<button onClick={() => setRefineModal({ ...refineModal, isOpen: false })} className="text-gray-400 hover:text-white">✕</button></h3>
            <div className="mb-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Refinement Model</label>
              <select value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded py-2 px-3 text-sm text-white outline-none mb-4">
                <option value="v1">v1 (Azure)</option>
                <option value="v2">V2 (Nano Banana)</option>
              </select>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Refinement Prompt</label>
              <textarea value={refineModal.prompt} onChange={(e) => setRefineModal({ ...refineModal, prompt: e.target.value })} placeholder="e.g. Adjust lighting to be warmer..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white h-32 outline-none focus:border-red-500 transition-colors" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRefineModal({ ...refineModal, isOpen: false })} className="px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-700">Cancel</button>
              <button onClick={handleRefineAll} className="px-4 py-2 rounded text-sm bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg">🚀 Run Refinement</button>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />

      <UniversalPreview 
        isOpen={previewState.isOpen} 
        onClose={() => setPreviewState({ ...previewState, isOpen: false })} 
        asset={previewState.asset} 
      />

      <style>{`
        .skeleton-shimmer { animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }
      `}</style>
    </div>
  );
}

export default EblastAutomation;