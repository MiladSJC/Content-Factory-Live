import React, { useState, useRef } from 'react';
import UniversalPreview from './UniversalPreview';

// Organized Asset Sets for the cycling logic (Car Dealerships folder)
const ASSET_SETS = {
  1: {
    inputs: ['1_1.png', '1_2.png', '1_3.png'],
    results: [
      '/Car Dealerships/Result Images/1_1.png',
      '/Car Dealerships/Result Images/1_2.png',
      '/Car Dealerships/Result Images/1_3.png',
      '/Car Dealerships/Result Images/1_4.png'
    ],
    diverseResults: [
      '/Car Dealerships/Result Images/1_5.png',
      '/Car Dealerships/Result Images/1_6.png',
      '/Car Dealerships/Result Images/1_7.png',
      '/Car Dealerships/Result Images/1_8.png',
      '/Car Dealerships/Result Images/1_9.png'
    ]
  },
  2: {
    inputs: ['2_1.png', '2_2.png', '2_3.png'],
    results: [
      '/Car Dealerships/Result Images/2_1.png',
      '/Car Dealerships/Result Images/2_2.png',
      '/Car Dealerships/Result Images/2_3.png',
      '/Car Dealerships/Result Images/2_4.png'
    ],
    diverseResults: [
      '/Car Dealerships/Result Images/2_5.png',
      '/Car Dealerships/Result Images/2_6.png',
      '/Car Dealerships/Result Images/2_7.png',
      '/Car Dealerships/Result Images/2_8.png',
      '/Car Dealerships/Result Images/2_9.png'
    ]
  },
  3: {
    inputs: ['3_1.png', '3_2.png', '3_3.png'],
    results: [
      '/Car Dealerships/Result Images/3_1.png',
      '/Car Dealerships/Result Images/3_2.png',
      '/Car Dealerships/Result Images/3_3.png',
      '/Car Dealerships/Result Images/3_4.png'
    ],
    diverseResults: [
      '/Car Dealerships/Result Images/3_5.png',
      '/Car Dealerships/Result Images/3_6.png',
      '/Car Dealerships/Result Images/3_7.png',
      '/Car Dealerships/Result Images/3_8.png',
      '/Car Dealerships/Result Images/3_9.png'
    ]
  },
  4: {
    inputs: ['4_1.png', '4_2.png', '4_3.png'],
    results: [
      '/Car Dealerships/Result Images/4_1.png',
      '/Car Dealerships/Result Images/4_2.png',
      '/Car Dealerships/Result Images/4_3.png',
      '/Car Dealerships/Result Images/4_4.png'
    ],
    diverseResults: [
      '/Car Dealerships/Result Images/4_5.png',
      '/Car Dealerships/Result Images/4_6.png',
      '/Car Dealerships/Result Images/4_7.png',
      '/Car Dealerships/Result Images/4_8.png',
      '/Car Dealerships/Result Images/4_9.png'
    ]
  },
  5: {
    inputs: ['5_1.png', '5_2.png', '5_3.png'],
    results: [
      '/Car Dealerships/Result Images/5_1.png',
      '/Car Dealerships/Result Images/5_2.png',
      '/Car Dealerships/Result Images/5_3.png',
      '/Car Dealerships/Result Images/5_4.png'
    ],
    diverseResults: [
      '/Car Dealerships/Result Images/5_5.png',
      '/Car Dealerships/Result Images/5_6.png',
      '/Car Dealerships/Result Images/5_7.png',
      '/Car Dealerships/Result Images/5_8.png',
      '/Car Dealerships/Result Images/5_9.png'
    ]
  }
};

const UploadIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

// Car Icon for color visualization - Increased to w-6 h-6
const CarColorIcon = ({ color }) => (
  <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill={color}>
    <path d="M18.92 11.01C18.72 10.42 18.16 10 17.5 10H6.5C5.84 10 5.29 10.42 5.08 11.01L3 17V24C3 24.55 3.45 25 4 25H5C5.55 25 6 24.55 6 24V22H18V24C18 24.55 18.45 25 19 25H20C20.55 25 21 24.55 21 24V17L18.92 11.01ZM6.5 12H17.5L18.85 16H5.15L6.5 12ZM5 20C4.45 20 4 19.55 4 19C4 18.45 4.45 18 5 18C5.55 18 6 18.45 6 19C6 19.55 5.55 20 5 20ZM19 20C18.45 20 18 19.55 18 19C18 18.45 18.45 18 19 18C19.55 18 20 18.45 20 19C20 19.55 19.45 20 19 20Z" transform="translate(0, -5) scale(0.9)"/>
  </svg>
);

function CarDealerships({ onPushToDAM }) {
  const [inputImages, setInputImages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImages, setResultImages] = useState([]);

  // Dealership Selector
  const [selectedDealership, setSelectedDealership] = useState('');
  const dealerships = [
    { id: 'premier-motors', name: 'Premier Motors', location: 'Downtown Hub' },
    { id: 'elite-autos', name: 'Elite Autos', location: 'North District' },
    { id: 'toronto-hyundai', name: 'Toronto Hyundai', location: 'Toronto' }
  ];
  const currentDealerInfo = dealerships.find(d => d.id === selectedDealership);

  const dealershipInfoImgUrl = currentDealerInfo
    ? `/Car Dealerships/Dealership Info/${currentDealerInfo.name}.png`
    : null;

  const resultImgRefs = useRef([]);
  const [resultImgWidths, setResultImgWidths] = useState(Array(9).fill(null));

  const updateResultImgWidth = (index) => {
    const el = resultImgRefs.current[index];
    const w = el ? el.clientWidth : null;
    setResultImgWidths(prev => {
      const next = [...prev];
      next[index] = w;
      return next;
    });
  };

  const [refineModal, setRefineModal] = useState({ isOpen: false, prompt: '' });
  const [boxesRefining, setBoxesRefining] = useState([false, false, false, false, false, false, false, false, false]);

  const [nextSetToLoad, setNextSetToLoad] = useState(1);
  const [activeLoadedSet, setActiveLoadedSet] = useState(1);
  const [previewState, setPreviewState] = useState({ isOpen: false, asset: null });

  // Car Color State
  const CAR_COLORS = [
    { name: 'Crystal White', hex: '#F9F9F9', code: 'PWP' },
    { name: 'Phantom Black', hex: '#121212', code: 'NB9' },
    { name: 'Titanium Silver', hex: '#8E9196', code: 'IM' },
    { name: 'Racing Red', hex: '#C62828', code: 'M8' },
    { name: 'Deep Ocean Blue', hex: '#0D47A1', code: 'UU1' },
    { name: 'Gravity Gray', hex: '#455A64', code: 'K4G' },
    { name: 'Sage Green', hex: '#4E5B52', code: 'SKG' },
    { name: 'Sunset Orange', hex: '#E65100', code: 'R2P' }
  ];
  const [selectedColor, setSelectedColor] = useState(CAR_COLORS[0]);
  const [isColorOpen, setIsColorOpen] = useState(false);

  const [settings, setSettings] = useState({
    model: 'v2',
    aspectRatio: '9:16',
    resolution: '1K',
    safety_level: 'allow_all'
  });

  const fileInputRef = useRef(null);

  const handleAutoLoad = async () => {
    try {
      const currentSet = ASSET_SETS[nextSetToLoad];
      const loaded = await Promise.all(currentSet.inputs.map(async (name) => {
        const url = `/Car Dealerships/Input Images/${name}`;
        return { id: Math.random(), url, name };
      }));
      setInputImages(loaded);
      setActiveLoadedSet(nextSetToLoad);
      setNextSetToLoad(prev => (prev >= 5 ? 1 : prev + 1));
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

  const handleGenerate = async () => {
    if (inputImages.length === 0) return alert("Please add images first.");
    setIsProcessing(true);
    setResultImages([]);
    setBoxesRefining([false, false, false, false, false, false, false, false, false]);
    setResultImgWidths(Array(9).fill(null));

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

        const targetRatios = Array(9).fill(settings.aspectRatio);
        const responses = await Promise.all(targetRatios.map(ratio =>
          fetch('http://localhost:5001/generate-eblast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              images: base64Images,
              prompt: `${prompt}. Car Color: ${selectedColor.name}`,
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
        const merged = [...(currentSet.results || []), ...(currentSet.diverseResults || [])].slice(0, 9);
        setResultImages(merged);
        setBoxesRefining(Array(merged.length).fill(false));
        setIsProcessing(false);
      }, 3500);
      return;
    }
    setIsProcessing(false);
  };

  const handleRefineAll = async () => {
    if (resultImages.length === 0) return;
    setRefineModal({ ...refineModal, isOpen: false });
    setBoxesRefining(Array(resultImages.length).fill(true));

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
          setTimeout(() => updateResultImgWidth(idx), 0);
        });
        await Promise.all(refinePromises);
      } catch (e) {
        alert("Live Refinement Failed");
        setBoxesRefining(Array(resultImages.length).fill(false));
      }
    } else {
      resultImages.forEach((url, idx) => {
        const randomDelay = 1000 + Math.random() * 2000;
        setTimeout(() => {
          const parts = url.split('.');
          const ext = parts.pop();
          const base = parts.join('.');
          const refinedUrl = `${base}_X.${ext}`;
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
          setTimeout(() => updateResultImgWidth(idx), 0);
        }, randomDelay);
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn text-white relative">
      <div className="lg:col-span-1 bg-gray-800 rounded-lg p-5 overflow-y-auto space-y-5 border border-gray-700 shadow-xl custom-scrollbar">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><span>🚗</span> Studio</h2>
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
          <label className="block text-sm font-semibold text-gray-400">Dealership Prompt</label>
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

        {/* --- ASPECT RATIO & CAR ICON ROW --- */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Aspect Ratio</label>
            <select 
              value={settings.aspectRatio} 
              onChange={(e) => setSettings({ ...settings, aspectRatio: e.target.value })} 
              className="w-full bg-gray-900 border border-gray-700 rounded py-2 px-3 text-xs font-bold text-white outline-none focus:border-red-500"
            >
              {["1:1", "3:2", "2:3", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Car Color</label>
            <button
              type="button"
              onClick={() => setIsColorOpen(!isColorOpen)}
              className="w-full bg-gray-900 border border-gray-700 rounded py-2 px-3 flex items-center justify-between text-xs font-bold text-white outline-none hover:border-gray-500 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CarColorIcon color={selectedColor.hex} />
                <span className="truncate">{selectedColor.name}</span>
              </div>
              <span className="text-gray-500 shrink-0">▼</span>
            </button>
            
            {isColorOpen && (
              <div className="absolute z-50 bottom-full left-0 w-full bg-gray-900 border border-gray-700 rounded mb-1 shadow-2xl p-1">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {CAR_COLORS.map(color => (
                    <button
                      key={color.code}
                      onClick={() => { setSelectedColor(color); setIsColorOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-800 transition-colors text-left ${selectedColor.code === color.code ? 'bg-gray-800' : ''}`}
                    >
                      <CarColorIcon color={color.hex} />
                      <span className="text-[11px] font-bold text-white truncate">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-gray-700">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Select Dealership</label>
            <select
              value={selectedDealership}
              onChange={(e) => setSelectedDealership(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded py-2 px-3 text-sm font-bold text-white outline-none focus:border-red-500"
            >
              <option value="">-- Choose Dealership --</option>
              {dealerships.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleGenerate} disabled={isProcessing} className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${isProcessing ? 'bg-gray-700' : 'bg-gradient-to-r from-red-700 to-red-600 shadow-lg shadow-red-900/40'}`}>
          {isProcessing ? 'Generating 9 Layouts...' : '✨ Generate'}
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
          {!isProcessing && resultImages.length === 0 && currentDealerInfo && (
            <div className="grid grid-cols-3 gap-4 w-full h-full animate-fadeIn">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center">
                  <div className="relative bg-gray-900/40 border border-gray-700 rounded-lg overflow-hidden shadow-2xl transition-transform duration-300">
                    <div className="py-20 text-center opacity-40 select-none pointer-events-none">
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-[10px] font-black tracking-wider uppercase">Preview {i + 1}</p>
                    </div>
                    {dealershipInfoImgUrl && <img src={dealershipInfoImgUrl} className="absolute bottom-0 left-0 w-full h-auto block pointer-events-none z-20" alt="" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isProcessing && resultImages.length === 0 && !currentDealerInfo && (
            <div className="text-center opacity-30 select-none pointer-events-none">
              <div className="text-8xl mb-4">🚗</div>
              <p className="text-2xl font-bold tracking-wider uppercase">Ready for Layout</p>
            </div>
          )}

          {isProcessing && (
            <div className="grid grid-cols-3 gap-4 w-full h-full animate-fadeIn">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="flex flex-col items-center justify-center">
                  <div className="relative bg-gray-900/50 border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
                    <div className="relative py-20 px-4 flex flex-col items-center gap-2">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent skeleton-shimmer" />
                      <div className="w-12 h-12 border-t-2 border-red-500 rounded-full animate-spin mb-2" />
                      <p className="text-[10px] font-black text-red-400 uppercase tracking-widest animate-pulse">Computing V{i + 1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {resultImages.length > 0 && !isProcessing && (
            <div className="grid grid-cols-3 gap-4 w-full h-full animate-fadeIn">
              {resultImages.map((imgUrl, index) => (
                <div key={index} className="flex flex-col items-center justify-center">
                  <div 
                    className="group relative flex flex-col shadow-2xl transition-transform duration-300 hover:scale-[1.02] border border-gray-700/30 rounded overflow-hidden"
                    style={{ width: resultImgWidths[index] ? `${resultImgWidths[index]}px` : 'auto', maxWidth: '100%' }}
                  >
                    <div className={`relative bg-white transition-all duration-500 ${boxesRefining[index] ? 'blur-md grayscale' : ''}`}>
                      <img
                        src={imgUrl}
                        className="w-full h-auto block"
                        alt={`Result ${index + 1}`}
                        ref={(el) => { resultImgRefs.current[index] = el; }}
                        onLoad={() => updateResultImgWidth(index)}
                      />
                      {dealershipInfoImgUrl && <img src={dealershipInfoImgUrl} className="absolute bottom-0 left-0 w-full h-auto block pointer-events-none z-20" alt="" />}
                      {boxesRefining[index] && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/40">
                          <div className="w-10 h-10 border-t-2 border-red-500 rounded-full animate-spin" />
                          <p className="text-[9px] font-black text-white uppercase mt-3 animate-pulse tracking-[0.2em]">AI Synthesis</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-40 flex items-end p-2 gap-2">
                        <button onClick={() => onPushToDAM({ path: imgUrl, name: `AI_v${index + 1}.png`, type: "image/png", thumbnail: imgUrl, created_at: new Date() })} className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-1.5 rounded shadow-lg transition-all">🚀 Push</button>
                        <button onClick={() => setPreviewState({ isOpen: true, asset: { url: imgUrl, type: 'image', overlayUrl: dealershipInfoImgUrl } })} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-bold py-1.5 rounded shadow-lg transition-all">👁️ Preview</button>
                      </div>
                    </div>
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
            <textarea value={refineModal.prompt} onChange={(e) => setRefineModal({ ...refineModal, prompt: e.target.value })} placeholder="e.g. Adjust lighting to be warmer..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white h-32 outline-none focus:border-red-500 transition-colors mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRefineModal({ ...refineModal, isOpen: false })} className="px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-700">Cancel</button>
              <button onClick={handleRefineAll} className="px-4 py-2 rounded text-sm bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-lg">🚀 Run Refinement</button>
            </div>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileUpload} />
      <UniversalPreview isOpen={previewState.isOpen} onClose={() => setPreviewState({ ...previewState, isOpen: false })} asset={previewState.asset} />
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

export default CarDealerships;