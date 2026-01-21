import React, { useState, useEffect, useRef } from 'react';

const UniversalPreview = ({ isOpen, onClose, asset }) => {
  // Sophisticated Initial Scale set to 70% (0.7)
  const [scale, setScale] = useState(0.7);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Reset to 70% and center position when modal state changes
  useEffect(() => {
    if (isOpen) {
      setScale(0.7);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015; // Refined zoom sensitivity
    const newScale = Math.min(Math.max(0.2, scale + delta), 8); // Expanded range
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left-click drag
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/95 backdrop-blur-xl p-6 transition-all animate-fadeIn">
      {/* Top Navigation Bar - Glassmorphism UI */}
      <div className="absolute top-6 left-6 right-6 z-[110] flex justify-between items-center">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500">Master Preview</span>
          <span className="text-sm font-bold text-white truncate max-w-xs">{asset.name || 'AI Generated Asset'}</span>
        </div>

        <div className="flex gap-4 items-center bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Zoom</span>
             <input 
              type="range" min="0.2" max="5" step="0.1" 
              value={scale} 
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-32 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
             />
             <div className="w-12 text-right">
                <span className="text-sm font-mono font-bold text-white">{(scale * 100).toFixed(0)}%</span>
             </div>
          </div>
          
          <div className="w-px h-6 bg-gray-700 mx-2" />

          <button 
            onClick={() => { setScale(0.7); setPosition({ x: 0, y: 0 }); }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-black uppercase tracking-wider border border-gray-600 transition-all active:scale-95"
          >
            Reset (70%)
          </button>
          
          <button 
            onClick={onClose}
            className="group flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg transition-all active:scale-90"
          >
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">✕</span>
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDoubleClick={() => { setScale(0.7); setPosition({ x: 0, y: 0 }); }} // Sophisticated shortcut
      >
        <div 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.2, 0, 0.2, 1)'
          }}
          className="relative group flex items-center justify-center"
        >
          {/* Subtle Outer Glow */}
          <div className="absolute inset-[-20px] bg-red-500/10 blur-[100px] rounded-full opacity-50 pointer-events-none" />
          
          {asset.type === 'video' || (asset.url && asset.url.endsWith('.mp4')) ? (
            <video 
              src={asset.url} 
              controls 
              autoPlay 
              loop 
              className="max-w-[95vw] max-h-[95vh] rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5" 
            />
          ) : (
            <img 
              src={asset.url} 
              alt="Preview" 
              className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 pointer-events-none" 
            />
          )}
        </div>
      </div>

      {/* Bottom Tooltip */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/5 pointer-events-none">
        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">
          Scroll to Zoom • Drag to Pan • Double Click to Center
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default UniversalPreview;