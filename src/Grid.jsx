import React, { useRef, useEffect } from 'react';
import { LayoutGrid, CheckSquare, RefreshCw, FileJson, Download, Upload, Save, Loader2, Layers, Check, Trash2, X, Image as ImageIcon, BoxSelect, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FineTuneModal } from './Fine-tuning';

// --- Shared Utility & UI Components for Grid ---

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Label = ({ children, className }) => (
  <label className={cn("text-xs font-semibold uppercase tracking-wider text-gray-400", className)}>
    {children}
  </label>
);

const Button = ({ className, variant = "default", size = "default", ...props }) => {
  const variants = {
    default: "bg-red-700 text-white hover:bg-red-600 shadow-lg shadow-red-900/20",
    outline: "border border-gray-600 bg-transparent hover:bg-gray-700 text-gray-300",
    ghost: "hover:bg-gray-700 text-gray-300 hover:text-white",
    secondary: "bg-gray-700 text-gray-200 hover:bg-gray-600",
    destructive: "bg-red-900/50 text-red-200 hover:bg-red-900 border border-red-800",
  };
  const sizes = {
    default: "h-8 px-3 py-1 text-sm",
    sm: "h-7 rounded-md px-2 text-xs",
    icon: "h-8 w-8",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

const Switch = ({ checked, onCheckedChange, className, disabled }) => {
  const isChecked = !!checked;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        onCheckedChange?.(!isChecked);
      }}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full border border-gray-600 bg-gray-900 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:opacity-50",
        isChecked && "bg-red-700 border-red-700",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          isChecked ? "translate-x-4" : "translate-x-1"
        )}
      />
    </button>
  );
};

// --- Main Grid Component ---

const Grid = ({ manager, customModels, onGlobalSave }) => {
  const {
      config, rows, merges, hiddenCells, cellData,
      isSelecting, isMultiSelect, setIsMultiSelect, selectedCells, setSelectedCells,
      serverVersion, setServerVersion, designModel, setDesignModel,
      handleMouseDown, handleMouseEnter, handleMouseUp, handleContextMenu, handleCellClick,
      handleRegenerateClick, handleExportJson, handleImportJson, handleFileUpload,
      triggerCellUpload, handleDirectFileUpload, clearCell, clearMerge, mergeCells, getBounds,
      regenModalOpen, setRegenModalOpen, regenConfig, setRegenConfig, confirmRegeneration,
      reviewModalOpen, setReviewModalOpen, currentReviewCell, selectVariation,
      fileInputRef, contextMenu, setContextMenu, getCellId,
      isSelected, setFineTuneModalOpen, fineTuneModalOpen, selection, setSelection,
      dualMode, setDualMode, swapCells,
      marketVersions, activeComparison, setActiveComparison, MARKET_OPTIONS
  } = manager;

  const bounds = getBounds();
  const scrollRefs = useRef([]);

  // Sync scroll implementation
  const handleScroll = (e, index) => {
    if (!dualMode) return;
    const target = e.currentTarget;
    scrollRefs.current.forEach((ref, idx) => {
      if (idx !== index && ref) {
        ref.scrollTop = target.scrollTop;
        ref.scrollLeft = target.scrollLeft;
      }
    });
  };

  // Drag and Drop Handlers
  const onDragStart = (e, cellId, pageIndex) => {
    if (dualMode) return; 
    e.dataTransfer.setData('sourceCellId', cellId);
    e.dataTransfer.setData('sourcePageIndex', pageIndex.toString());
    e.currentTarget.classList.add('opacity-50');
  };

  const onDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDrop = (e, targetCellId, targetPageIndex) => {
    e.preventDefault();
    const sourceCellId = e.dataTransfer.getData('sourceCellId');
    const sourcePageIndex = parseInt(e.dataTransfer.getData('sourcePageIndex'));
    
    if (sourcePageIndex === targetPageIndex && sourceCellId !== targetCellId) {
      swapCells(sourceCellId, targetCellId);
    }
  };

  const hiddenOwners = React.useMemo(() => {
    const owners = {};
    if (!merges) return owners;
    for (const [rootId, mergeData] of Object.entries(merges)) {
      const [startR, startC] = rootId.split('_').map(Number);
      const rowSpan = mergeData?.rowSpan || 1;
      const colSpan = mergeData?.colSpan || 1;
      for (let r = startR; r < startR + rowSpan; r++) {
        for (let c = startC; c < startC + colSpan; c++) {
          const id = `${r}_${c}`;
          if (id !== rootId) owners[id] = rootId;
        }
      }
    }
    return owners;
  }, [merges]);

  const renderCanvas = (pageIndex) => {
    const activeMarket = dualMode ? activeComparison[pageIndex] : null;
    const currentData = (dualMode && activeMarket) ? (marketVersions[activeMarket] || {}) : cellData;

    return (
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {dualMode && (
          <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 justify-between shrink-0">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">View {pageIndex + 1}</span>
               {marketVersions[activeMarket] && <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
            </div>
            <select 
              value={activeComparison[pageIndex]} 
              onChange={(e) => {
                const newComp = [...activeComparison];
                newComp[pageIndex] = e.target.value;
                setActiveComparison(newComp);
              }}
              className="h-7 bg-gray-900 border border-gray-600 rounded px-2 text-[11px] text-gray-200 outline-none focus:ring-1 focus:ring-red-500 min-w-[120px]"
            >
              {MARKET_OPTIONS.map(opt => (
                <option key={opt} value={opt}>
                  {opt} Market {marketVersions[opt] ? '•' : '(Empty)'}
                </option>
              ))}
            </select>
          </div>
        )}
        <div 
            ref={el => scrollRefs.current[pageIndex] = el}
            onScroll={(e) => handleScroll(e, pageIndex)}
            className={cn(
                "flex-1 overflow-auto p-8 flex justify-center items-start bg-gray-900 relative custom-scrollbar",
                dualMode && pageIndex === 0 && "border-r border-gray-700"
            )} 
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    setContextMenu(null); 
                    setSelection(null);
                }
            }}
        >
             <div className="relative shadow-2xl transition-all duration-300 origin-top flex flex-col shrink-0" style={{ width: config.pageWidth, height: config.pageHeight, backgroundColor: config.borderColor, padding: `${config.cellPadding}px`, boxSizing: 'border-box', overflow: 'hidden' }}>
                 
                 {!isSelecting && !dualMode && bounds && (bounds.minR !== bounds.maxR || bounds.minC !== bounds.maxC) && (
                    <div className="absolute inset-0 z-[50] pointer-events-none flex items-center justify-center">
                        <div className="flex items-center gap-1 bg-gray-800 border border-blue-500 p-1 rounded-lg shadow-2xl pointer-events-auto animate-in fade-in zoom-in duration-200">
                            <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-500 text-[10px] gap-1 px-2" onClick={(e) => { e.stopPropagation(); mergeCells(); }}>
                                <BoxSelect className="h-3 w-3" /> Merge Selection
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={(e) => { e.stopPropagation(); setSelection(null); }}>
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                 )}

                 {rows.map((row, rIndex) => (
                    <div key={rIndex} className="flex w-full" style={{ height: row.height, marginBottom: (rIndex < rows.length - 1) ? `${config.gap}px` : 0 }}>
                        {Array.from({ length: row.type === 'banner' ? 1 : row.cols }).map((_, cIndex) => {
                            const cellId = getCellId(rIndex, cIndex);

                            if (row.type !== 'banner' && hiddenCells.has(cellId)) {
                              const owner = hiddenOwners[cellId];
                              if (owner) {
                                const [ownerR] = owner.split('_').map(Number);
                                if (ownerR < rIndex) {
                                  const totalColsInRow = row.cols;
                                  const slotWidthPercent = (1 / totalColsInRow) * 100;
                                  return (
                                    <div
                                      key={cellId}
                                      style={{
                                        width: `${slotWidthPercent}%`,
                                        height: `${row.height}px`,
                                        paddingRight: (cIndex < row.cols - 1) ? `${config.gap}px` : 0,
                                        pointerEvents: 'none'
                                      }}
                                    />
                                  );
                                }
                              }
                              return null;
                            }
                            
                            const mergeData = merges[cellId];
                            const activeColSpan = row.type === 'banner' ? 1 : (mergeData?.colSpan || 1);
                            const activeRowSpan = row.type === 'banner' ? 1 : (mergeData?.rowSpan || 1);
                            
                            let totalHeight = row.height;
                            if (activeRowSpan > 1) {
                                for(let i=1; i<activeRowSpan; i++) {
                                    totalHeight += (rows[rIndex + i]?.height || 0) + config.gap;
                                }
                            }

                            const totalColsInRow = row.type === 'banner' ? 1 : row.cols;
                            const cellWidthPercent = (activeColSpan / totalColsInRow) * 100;
                            const content = currentData[cellId] || {};
                            const isMultiSelected = selectedCells.has(cellId);
                            const hasVariations = content.variations && content.variations.length > 0;
                            const isBanner = row.type === 'banner';

                            return (
                                <div key={cellId} 
                                    draggable={!isSelecting && !isMultiSelect && !dualMode}
                                    onDragStart={(e) => onDragStart(e, cellId, pageIndex)}
                                    onDragEnd={onDragEnd}
                                    onDragOver={onDragOver}
                                    onDrop={(e) => onDrop(e, cellId, pageIndex)}
                                    onMouseDown={(e) => { e.stopPropagation(); if(!dualMode) handleMouseDown(rIndex, cIndex, e); }} 
                                    onMouseEnter={(e) => { e.stopPropagation(); if(!dualMode) handleMouseEnter(rIndex, cIndex); }} 
                                    onContextMenu={(e) => { e.stopPropagation(); if(!dualMode) handleContextMenu(e, cellId); }} 
                                    onClick={(e) => { e.stopPropagation(); if(!dualMode) handleCellClick(cellId); }}
                                    style={{ 
                                        width: `${cellWidthPercent}%`, 
                                        height: `${totalHeight}px`, 
                                        paddingRight: (cIndex < (row.type === 'banner' ? 0 : row.cols - 1)) ? `${config.gap}px` : 0,
                                        zIndex: activeRowSpan > 1 ? 10 : 1
                                    }}
                                    className={cn("relative select-none group", !dualMode && "cursor-grab active:cursor-grabbing")}>
                                    
                                    <div className="w-full h-full relative overflow-hidden" style={{ backgroundColor: config.borderColor, padding: `${config.cellPadding}px` }}>
                                        
                                        {!dualMode && !isSelecting && !isMultiSelect && content.image && (
                                          <div className="absolute bottom-1 left-1 z-30 opacity-0 group-hover:opacity-40 transition-opacity">
                                            <GripVertical className="h-3 w-3 text-gray-900" />
                                          </div>
                                        )}

                                        <div className="w-full h-full relative overflow-hidden bg-gray-900" style={{ backgroundColor: config.backgroundColor }}>
                                                                                
                                            {content.image ? (
                                              <img 
                                                src={content.image} 
                                                alt="Cell Content" 
                                                className={cn(
                                                  "absolute inset-0 block w-full h-full object-contain object-center transition-all duration-500 bg-white",
                                                  content.loading && "blur-[2px]"
                                                )} 
                                              />
                                            ) : (
                                              <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-gray-500/50 text-center">
                                                {isBanner ? (
                                                  <>
                                                    <ImageIcon className="h-6 w-6 mb-1 opacity-50" />
                                                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-50">Banner</span>
                                                    {!dualMode && (
                                                      <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="mt-1 h-6 text-[10px] px-2 border-gray-400/30 text-gray-500 hover:text-gray-700"
                                                        onClick={(e) => { e.stopPropagation(); triggerCellUpload(cellId); }}
                                                      >
                                                        Upload
                                                      </Button>
                                                    )}
                                                  </>
                                                ) : (
                                                  <>
                                                    <span className="text-[10px] opacity-30 font-mono">Empty</span>
                                                    {mergeData && (
                                                      <span className="text-[8px] opacity-30 font-bold block mt-1 uppercase">
                                                        {mergeData.colSpan}x{mergeData.rowSpan} Merge
                                                      </span>
                                                    )}
                                                  </>
                                                )}
                                                {content.error && <span className="text-red-500 block text-[10px] mt-1 font-bold">Error</span>}
                                              </div>
                                            )}
                                            {content.loading && (<div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20 backdrop-blur-sm"><Loader2 className="h-8 w-8 animate-spin text-white" /></div>)}
                                        </div>

                                        {!dualMode && hasVariations && !content.loading && !isMultiSelect && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500 text-white shadow-lg cursor-pointer hover:bg-amber-400 z-30 transition-transform hover:scale-105" onClick={(e) => { e.stopPropagation(); handleCellClick(cellId); }}>
                                            <Layers className="h-3 w-3" />
                                            <span className="text-[10px] font-bold">Vars</span>
                                        </div>
                                        )}
                                        {!dualMode && isMultiSelect && (<div className={cn("absolute inset-0 bg-black/10 flex items-start justify-end p-2 transition-opacity pointer-events-none", isMultiSelected ? "opacity-100 bg-blue-900/30" : "opacity-0 group-hover:opacity-100")}><div className={cn("h-5 w-5 rounded border flex items-center justify-center transition-colors shadow-sm", isMultiSelected ? "border-blue-500 bg-blue-600 text-white" : "border-gray-400 bg-gray-800 text-transparent")}><Check className="h-3 w-3" /></div></div>)}
                                        {!dualMode && isSelected(rIndex, cIndex) && <div className="absolute inset-0 border-2 border-blue-500 z-30 pointer-events-none bg-blue-500/10" />}
                                        {!dualMode && isMultiSelected && <div className="absolute inset-0 border-2 border-blue-500 z-10 pointer-events-none" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                 ))}
             </div>
        </div>
      </div>
    );
  };

  return (
    <div 
        className="flex-1 flex flex-col min-w-0 min-h-0 bg-gray-900 text-white" 
        onMouseUp={handleMouseUp}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleDirectFileUpload} />

      {/* Global Toolbar - Never Duplicated */}
      <div className="h-14 border-b border-gray-700 flex items-center justify-between px-6 bg-gray-800 shadow-sm z-20">
          <div className="flex items-center gap-4">
             <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4 text-gray-400" />
                 Edit Canvas
             </h2>
             <div className="h-5 w-px bg-gray-600"></div>
             
             <div className="flex items-center gap-2">
                <select value={designModel} onChange={(e) => setDesignModel(e.target.value)} className="h-8 rounded-md border border-gray-600 bg-gray-900 px-3 text-xs font-medium text-gray-200 focus:ring-1 focus:ring-red-500 focus:outline-none min-w-[140px]">
                    <optgroup label="Default Models" className="bg-gray-800">
                        <option value="metro">Metro Retail</option>
                        <option value="foodbasics">Food Basics</option>
                    </optgroup>
                    {customModels && customModels.length > 0 && (
                        <optgroup label="My Custom Models" className="bg-gray-800">
                            {customModels.map((m, i) => (<option key={i} value={m.name}>{m.name}</option>))}
                        </optgroup>
                    )}
                </select>
             </div>

             <div className="flex items-center gap-2">
                 <select value={serverVersion} onChange={(e) => setServerVersion(e.target.value)} className="h-8 rounded-md border border-gray-600 bg-gray-900 px-3 text-xs font-medium text-gray-200 focus:ring-1 focus:ring-red-500 focus:outline-none">
                    <option value="v1">V1 &gt; GPT Image1</option>
                    <option value="v2">V2 &gt; Nano Banana</option>
                 </select>
             </div>

             <div className="flex items-center gap-2">
                <Label className="!text-[10px]">Dual View</Label>
                <Switch checked={dualMode} onCheckedChange={setDualMode} />
             </div>
          </div>

          <div className="flex items-center gap-2">
             <Button variant={isMultiSelect ? "secondary" : "ghost"} size="sm" onClick={(e) => { e.stopPropagation(); setIsMultiSelect(!isMultiSelect); setSelectedCells(new Set()); setSelection(null); }} className={cn(isMultiSelect && "bg-blue-900/50 text-blue-200 ring-1 ring-blue-700")} title="Multi-Select">
                <CheckSquare className="h-4 w-4" />
             </Button>
             <Button variant="ghost" size="sm" disabled={!isMultiSelect || selectedCells.size === 0} onClick={handleRegenerateClick} title="Regenerate">
                <RefreshCw className="h-4 w-4" />
             </Button>
             <div className="h-5 w-px bg-gray-600 mx-1"></div>
             
             <label className="cursor-pointer inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white transition-colors" title="Import JSON">
                <FileJson className="h-4 w-4" />
                <input type="file" accept=".json" className="hidden" onChange={handleImportJson} />
             </label>
             <Button variant="ghost" size="sm" className="w-8 px-0" onClick={handleExportJson} title="Export JSON">
                <Download className="h-4 w-4" />
             </Button>
             
             <div className="h-5 w-px bg-gray-600 mx-1"></div>
             
             <label className="cursor-pointer inline-flex items-center justify-center h-8 px-4 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-500 shadow gap-2 transition-colors">
                <Upload className="h-3 w-3" /> Fill CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
             </label>
             <Button size="sm" className="h-8 px-4 gap-2 bg-red-700 hover:bg-red-600" onClick={handleExportJson}><Save className="h-3 w-3" /> Save</Button>
          </div>
      </div>

      {/* Main Canvas Area - Handles Dual Side-by-Side Logic */}
      <div className={cn("flex-1 flex min-h-0", dualMode ? "flex-row" : "flex-col")}>
         {renderCanvas(0)}
         {dualMode && renderCanvas(1)}
      </div>
      
      {/* Modals and Context Menus */}
      {contextMenu && (
          <div className="fixed z-[9999] bg-gray-800 border border-gray-700 shadow-xl rounded-md w-44 py-1 overflow-hidden" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => triggerCellUpload(contextMenu.cellId)} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"><Upload className="h-3 w-3" /> Upload Image</button>
              {merges[contextMenu.cellId] && (
                <button onClick={() => { clearMerge(contextMenu.cellId); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-xs text-blue-400 hover:bg-blue-900/30 flex items-center gap-2"><BoxSelect className="h-3 w-3" /> Unmerge Cells</button>
              )}
              <div className="h-px bg-gray-700 my-1"></div>
              <button onClick={() => clearCell(contextMenu.cellId)} className="w-full text-left px-4 py-2 text-xs hover:bg-red-900/30 text-red-400 hover:text-red-300 flex items-center gap-2"><Trash2 className="h-3 w-3" /> Clear Cell</button>
          </div>
      )}

      {regenModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setRegenModalOpen(false)}>
            <div className="w-[350px] bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-5 space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center text-white"><h2 className="text-sm font-bold">Regenerate Selection</h2><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRegenModalOpen(false)}><X className="h-4 w-4" /></Button></div>
                <div className="space-y-4">
                   <div className="space-y-1"><Label>Variations</Label><select className="w-full h-8 rounded-md border border-gray-600 bg-gray-900 text-white px-2 text-xs" value={regenConfig.n} onChange={e => setRegenConfig({...regenConfig, n: parseInt(e.target.value)})}>{[1,2,3].map(n => <option key={n} value={n}>{n} Variation{n>1?'s':''}</option>)}</select></div>
                  <div className="space-y-1">
                    <Label>Model Override</Label>
                    <select
                      className="w-full h-8 rounded-md border border-gray-600 bg-gray-900 text-white px-2 text-xs"
                      value={regenConfig.model}
                      onChange={e => setRegenConfig({ ...regenConfig, model: e.target.value })}
                    >
                      <option value="metro">Metro</option>
                      <option value="foodbasics">Food Basics</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2"><Button variant="outline" size="sm" onClick={() => setRegenModalOpen(false)}>Cancel</Button><Button size="sm" onClick={confirmRegeneration}>Regenerate</Button></div>
            </div>
          </div>
      )}

      {reviewModalOpen && currentReviewCell && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setReviewModalOpen(false)}>
            <div className="w-[850px] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center text-white">
                  <div>
                    <h2 className="text-lg font-bold">Review Variations</h2>
                    <p className="text-xs text-gray-400">Select an option to apply it to the grid.</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setReviewModalOpen(false)}><X className="h-5 w-5" /></Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {currentReviewCell.image && (
                      <div className="relative group border border-gray-600 rounded-lg p-2 bg-gray-800/50 cursor-pointer transition-all" onClick={() => setReviewModalOpen(false)}>
                          <span className="absolute top-3 left-3 bg-gray-700/90 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow z-10 border border-gray-500 uppercase">Current</span>
                          <div className="w-full flex items-center justify-center rounded bg-white overflow-hidden">
                            <img 
                              src={currentReviewCell.image} 
                              alt="Current" 
                              className="max-w-full h-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity" 
                            />
                          </div>
                      </div>
                  )}
                  {currentReviewCell.variations.map((img, idx) => (
                      <div key={idx} className="relative group border-2 border-amber-900/30 bg-gray-800/50 rounded-lg p-2 hover:border-amber-500 hover:bg-amber-900/10 cursor-pointer transition-all hover:scale-[1.02]" onClick={() => selectVariation(img)}>
                          <span className="absolute top-3 left-3 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow z-10 uppercase">Option {idx + 1}</span>
                          <div className="w-full flex items-center justify-center rounded bg-white overflow-hidden">
                             <img 
                               src={img} 
                               alt={`Var ${idx}`} 
                               className="max-w-full h-auto object-contain" 
                             />
                          </div>
                      </div>
                  ))}
               </div>
            </div>
          </div>
      )}

      <FineTuneModal isOpen={fineTuneModalOpen} onClose={() => setFineTuneModalOpen(false)} onSaveModel={(name, prompt) => { onGlobalSave(name, prompt); setDesignModel(name); }} />
    </div>
  );
};

export default Grid;