import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Wand2, Monitor, LayoutGrid } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getPrompt } from './prompts';
import Grid from './Grid';

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- CSV Helper ---
const parseCSV = (text) => {
  const lines = text.split('\n').filter(l => l.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
      else { current += char; }
    }
    values.push(current.trim());
    const entry = {};
    headers.forEach((h, i) => entry[h] = values[i]);
    return entry;
  });
};

// --- Dark Mode Components (Shared) ---

const Label = ({ children, className }) => (
  <label className={cn("text-xs font-semibold uppercase tracking-wider text-gray-400", className)}>
    {children}
  </label>
);

const Input = ({ className, ...props }) => (
  <input
    className={cn(
      "flex h-8 w-full rounded-md border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-gray-200 shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
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

const Switch = ({ checked, onCheckedChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={(e) => { e.stopPropagation(); onCheckedChange(!checked); }}
    className={cn(
      "peer inline-flex h-[18px] w-[32px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-red-600" : "bg-gray-600"
    )}
  >
    <span
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-0 transition-transform",
        checked ? "translate-x-3.5" : "translate-x-0"
      )}
    />
  </button>
);

const StepperInput = ({ label, value, onChange, min = 0, suffix, disabled }) => (
  <div className="space-y-1 w-full">
    {label && <Label>{label}</Label>}
    <div className={cn("flex h-8 items-center rounded-md border border-gray-600 bg-gray-900 shadow-sm overflow-hidden", disabled && "opacity-50")}>
      <input
        type="number"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="flex-1 w-full min-w-0 bg-transparent px-2 py-1 text-xs outline-none text-center tabular-nums text-gray-200 disabled:cursor-not-allowed"
      />
      {suffix && <span className="text-[10px] text-gray-500 mr-1">{suffix}</span>}
      <div className="flex flex-col h-full border-l border-gray-600 w-4 shrink-0 bg-gray-800">
        <button
          disabled={disabled}
          onClick={() => onChange(value + 1)}
          className="h-1/2 flex items-center justify-center hover:bg-gray-700 text-gray-400 active:bg-gray-600 border-b border-gray-600 disabled:cursor-not-allowed"
        >
          <Plus className="h-2 w-2" />
        </button>
        <button
          disabled={disabled}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="h-1/2 flex items-center justify-center hover:bg-gray-700 text-gray-400 active:bg-gray-600 disabled:cursor-not-allowed"
        >
          <Minus className="h-2 w-2" />
        </button>
      </div>
    </div>
  </div>
);

// --- Defaults & Logic ---

const DEFAULTS = {
  pageWidth: 555,
  pageHeight: 728,
  numRows: 6,
  borderColor: '#ffffff',
  backgroundColor: '#bfdbfe',
  cellPadding: 0,
  gap: 2,
};

const INITIAL_ROW = { cols: 3, auto: true, scale: 1, height: 133, type: 'offer' };
const IMPORT_DELAY_MS = 100;
const MAX_CONCURRENT_REQUESTS = 4;

function useLayoutManager(initialDefaults = DEFAULTS, externalCustomModels = []) {
  const [config, setConfig] = useState(initialDefaults);
  const [rows, setRows] = useState([]);
  const [designModel, setDesignModel] = useState('metro');
  const [serverVersion, setServerVersion] = useState('v2'); 
  const [merges, setMerges] = useState({});
  const [hiddenCells, setHiddenCells] = useState(new Set());
  const [cellData, setCellData] = useState({});
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState(null);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [selectedCells, setSelectedCells] = useState(new Set()); 
  const [contextMenu, setContextMenu] = useState(null);
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [regenConfig, setRegenConfig] = useState({ n: 1, model: 'walmart' });
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [currentReviewCell, setCurrentReviewCell] = useState(null);
  const [fineTuneModalOpen, setFineTuneModalOpen] = useState(false);

  const fileInputRef = useRef(null);
  const activeUploadCellId = useRef(null);
  const importTimers = useRef([]);

  useEffect(() => {
    setRows(prev => {
      const target = config.numRows;
      if (prev.length === target) return prev;
      if (prev.length < target) {
        const toAdd = Array.from({ length: target - prev.length }, (_, i) => ({
          ...INITIAL_ROW,
          cols: 3, 
          type: 'offer',
          height: 180 
        }));
        return [...prev, ...toAdd];
      }
      return prev.slice(0, target);
    });
  }, [config.numRows]);

  useEffect(() => {
    let newBgColor = '#bfdbfe';
    if (designModel === 'metro') newBgColor = '#fecaca';
    else if (designModel === 'staples') newBgColor = '#ffffff';
    else if (designModel === 'sobeys') newBgColor = '#dcfce7';
    else if (designModel === 'foodbasics') newBgColor = '#008542';
    
    if (['walmart', 'metro', 'staples', 'sobeys', 'foodbasics'].includes(designModel)) {
        setConfig(prev => ({...prev, backgroundColor: newBgColor}));
    }
  }, [designModel]);

  const updateRow = (idx, field, val) => {
    const newRows = [...rows];
    if (field === 'type') {
       const newType = val ? 'banner' : 'offer';
       newRows[idx] = { ...newRows[idx], type: newType };
    } else {
       newRows[idx] = { ...newRows[idx], [field]: val };
    }
    setRows(newRows);
    if (field === 'cols') {
      const newMerges = { ...merges };
      Object.keys(newMerges).forEach(k => {
          if (k.startsWith(`${idx}_`)) delete newMerges[k];
      });
      setMerges(newMerges); 
      const newHidden = new Set(hiddenCells);
      Array.from(newHidden).forEach(k => {
          if (k.startsWith(`${idx}_`)) newHidden.delete(k);
      });
      setHiddenCells(newHidden);
    }
  };

  const getCellId = (r, c) => `${r}_${c}`;

  const getBounds = () => {
    if (!selection) return null;
    return {
      minR: Math.min(selection.start.r, selection.end.r), maxR: Math.max(selection.start.r, selection.end.r),
      minC: Math.min(selection.start.c, selection.end.c), maxC: Math.max(selection.start.c, selection.end.c)
    };
  };

  const isSelected = (r, c) => {
    if (isMultiSelect) return false;
    const b = getBounds();
    return b && r >= b.minR && r <= b.maxR && c >= b.minC && c <= b.maxC;
  };

  const mergeCells = () => {
    const b = getBounds();
    if (!b) return;
    
    const key = getCellId(b.minR, b.minC);
    const newMerges = { ...merges, [key]: { rowSpan: b.maxR - b.minR + 1, colSpan: b.maxC - b.minC + 1 } };
    const newHidden = new Set(hiddenCells);
    
    for (let r = b.minR; r <= b.maxR; r++) {
      for (let c = b.minC; c <= b.maxC; c++) {
          if (r === b.minR && c === b.minC) continue;
          newHidden.add(getCellId(r, c));
      }
    }
    
    setMerges(newMerges); 
    setHiddenCells(newHidden); 
    setSelection(null);
  };

  const clearMerge = (cellId) => {
    const merge = merges[cellId];
    if (!merge) return;
    
    const [startR, startC] = cellId.split('_').map(Number);
    const newHidden = new Set(hiddenCells);
    
    for (let r = startR; r < startR + (merge.rowSpan || 1); r++) {
      for (let c = startC; c < startC + (merge.colSpan || 1); c++) {
        newHidden.delete(getCellId(r, c));
      }
    }
    
    const newMerges = { ...merges };
    delete newMerges[cellId];
    setMerges(newMerges);
    setHiddenCells(newHidden);
  };

  const toggleCellSelection = (id) => {
    const newSet = new Set(selectedCells);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCells(newSet);
  };

  const handleMouseDown = (r, c, e) => { 
    if (e.button === 2) return; 
    if (isMultiSelect) return; 
    setIsSelecting(true); setSelection({ start: { r, c }, end: { r, c } }); 
  };
  
  const handleMouseEnter = (r, c) => { 
    if (isMultiSelect) return;
    if (isSelecting && selection) {
        setSelection(prev => ({ ...prev, end: { r, c } })); 
    }
  };
  
  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const handleContextMenu = (e, cellId) => {
      e.preventDefault(); e.stopPropagation(); 
      setContextMenu({ x: e.clientX, y: e.clientY, cellId: cellId });
  };

  const triggerCellUpload = (cellId) => {
      activeUploadCellId.current = cellId;
      fileInputRef.current?.click();
  };

  const handleDirectFileUpload = (e) => {
      const file = e.target.files[0];
      const cellId = activeUploadCellId.current;
      if (file && cellId) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setCellData(prev => ({
                  ...prev,
                  [cellId]: {
                      loading: false,
                      image: reader.result,
                      error: false,
                      productData: { name: "Custom Banner" }, 
                      variations: []
                  }
              }));
          };
          reader.readAsDataURL(file);
      }
      e.target.value = null;
      activeUploadCellId.current = null;
      setContextMenu(null);
  };

  const generateAsset = async (cellId, itemData, model, n = 1) => {
      // Determine target cell dimensions for aspect ratio calculation
      const [rIdx, cIdx] = cellId.split('_').map(Number);
      const row = rows[rIdx];
      const mergeData = merges[cellId];
      
      const colSpan = (row.type === 'banner' ? 1 : (mergeData?.colSpan || 1));
      const rowSpan = (row.type === 'banner' ? 1 : (mergeData?.rowSpan || 1));
      
      // Calculate Width: (PageWidth / TotalCols) * ColSpan
      const totalCols = row.type === 'banner' ? 1 : row.cols;
      const targetWidth = (config.pageWidth / totalCols) * colSpan;
      
      // Calculate Height: Sum of heights of all rows spanned + gaps
      let targetHeight = row.height;
      if (rowSpan > 1) {
          for(let i = 1; i < rowSpan; i++) {
              targetHeight += (rows[rIdx + i]?.height || 0) + config.gap;
          }
      }

      setCellData(prev => ({ ...prev, [cellId]: { ...prev[cellId], loading: true, error: false, productData: itemData } }));
      const promptModelKey = model; 
      const generatedPrompt = getPrompt('v2', promptModelKey, itemData, externalCustomModels);

      try {
        const response = await fetch('http://localhost:5001/generate-card', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_path: itemData['Product Image'],
            product_name: itemData['Product Name'],
            description: itemData['Description'],
            price: itemData['Price'],
            sku: itemData['SKU'],
            unit: itemData['Unit'],
            model: model,
            n: n,
            server_version: serverVersion,
            custom_prompt: generatedPrompt,
            // Pass dimensions for Nano Banana aspect ratio mapping
            width: Math.round(targetWidth),
            height: Math.round(targetHeight)
          })
        });
      const result = await response.json();
      if (response.ok && result.images && result.images.length > 0) {
        setCellData(prev => {
          const existingCell = prev[cellId] || {};
          const currentImage = existingCell.image;
          const newVariations = result.images;
          if (currentImage) { 
             const uniqueVars = newVariations.filter(img => img !== currentImage);
             return { ...prev, [cellId]: { ...existingCell, loading: false, variations: uniqueVars, error: false } };
          } else {
             return { ...prev, [cellId]: { ...existingCell, loading: false, image: result.images[0], variations: [], error: false } };
          }
        });
      } else { throw new Error(result.detail || "No images returned"); }
    } catch (err) {
        console.error("Asset Generation Error:", err);
        setCellData(prev => ({ ...prev, [cellId]: { ...prev[cellId], loading: false, error: true } }));
    }
  };

  const processQueue = async (items, availableSlots, model) => {
     let currentIndex = 0;
     let activeRequests = 0;
     const totalItems = items.length;
     const next = () => {
         if (currentIndex >= totalItems && activeRequests === 0) return;
         while (activeRequests < MAX_CONCURRENT_REQUESTS && currentIndex < totalItems) {
             const index = currentIndex;
             const item = items[index];
             const cellId = availableSlots[index];
             currentIndex++;
             activeRequests++;
             generateAsset(cellId, item, model, 1).finally(() => { activeRequests--; next(); });
         }
     };
     next();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importTimers.current.forEach(t => clearTimeout(t));
    importTimers.current = [];
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const csvText = evt.target.result;
      const data = parseCSV(csvText);
      const availableSlots = [];
      const bannerCells = new Set(); 

      rows.forEach((row, rIndex) => {
        if (row.type !== 'banner') {
            for (let cIndex = 0; cIndex < row.cols; cIndex++) {
              const id = getCellId(rIndex, cIndex);
              if (!hiddenCells.has(id)) availableSlots.push(id);
            }
        } else {
            bannerCells.add(getCellId(rIndex, 0));
        }
      });
      
      const itemsToProcess = data.slice(0, availableSlots.length);
      const initialLoadState = {};
      itemsToProcess.forEach((item, i) => {
        initialLoadState[availableSlots[i]] = { loading: true, image: null, error: false, productData: item, variations: [] };
      });

      setCellData(prev => {
          const nextData = {};
          Object.keys(prev).forEach(key => { if (bannerCells.has(key)) nextData[key] = prev[key]; });
          return { ...nextData, ...initialLoadState };
      }); 
      processQueue(itemsToProcess, availableSlots, designModel);
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleRegenerateClick = () => {
    if (selectedCells.size === 0) return alert("Please select cells first.");
    setRegenConfig({ n: 2, model: designModel }); 
    setRegenModalOpen(true);
  };

  const confirmRegeneration = async () => {
    setRegenModalOpen(false);
    const cellsToRegen = Array.from(selectedCells);
    let validCount = 0;
    const validCells = [];
    for (const cellId of cellsToRegen) {
        const cell = cellData[cellId];
        if (cell && cell.productData && cell.productData['Product Image']) {
            validCount++;
            validCells.push({ id: cellId, data: cell.productData });
        }
    }
    if (validCount === 0) return alert("No valid server-generated cells to regenerate.");
    setSelectedCells(new Set()); 
    setIsMultiSelect(false); 
    let currentIndex = 0;
    let activeRequests = 0;
    const next = () => {
        if (currentIndex >= validCells.length && activeRequests === 0) return;
        while (activeRequests < MAX_CONCURRENT_REQUESTS && currentIndex < validCells.length) {
            const item = validCells[currentIndex];
            currentIndex++;
            activeRequests++;
            generateAsset(item.id, item.data, regenConfig.model, regenConfig.n).finally(() => { activeRequests--; next(); });
        }
    };
    next();
  };

  const handleExportJson = async () => {
    const dataToSave = {
      config, rows, merges, hiddenCells: Array.from(hiddenCells), cellData, designModel, serverVersion, customModels: externalCustomModels
    };

    try {
        const response = await fetch('http://localhost:5001/save-project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSave)
        });

        if (response.ok) {
            const result = await response.json();
            alert(`Project saved successfully!\nSaved to: ${result.path}`);
        } else {
            const err = await response.json();
            alert(`Failed to save project: ${err.detail}`);
        }
    } catch (err) {
        console.error("Export Error:", err);
        alert("Failed to connect to server for saving.");
    }
  };
  
  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    importTimers.current.forEach(t => clearTimeout(t));
    setSelectedCells(new Set()); 
    setIsMultiSelect(false);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        if (data.config) setConfig(data.config);
        if (data.rows) setRows(data.rows);
        if (data.merges) setMerges(data.merges);
        if (data.hiddenCells) setHiddenCells(new Set(data.hiddenCells));
        if (data.designModel) setDesignModel(data.designModel);
        if (data.serverVersion) setServerVersion(data.serverVersion);
        
        setCellData({});
        if (data.cellData) {
          const keys = Object.keys(data.cellData);
          const loadedCellData = {};

          keys.forEach((key) => {
              const cell = data.cellData[key];
              if (cell.image && !cell.image.startsWith('data:')) {
                  cell.image = `http://localhost:5001/get-local-image?path=${encodeURIComponent(cell.image)}`;
              }
              if (cell.variations && cell.variations.length > 0) {
                  cell.variations = cell.variations.map(v => {
                      if (!v.startsWith('data:')) {
                           return `http://localhost:5001/get-local-image?path=${encodeURIComponent(v)}`;
                      }
                      return v;
                  });
              }
              loadedCellData[key] = cell;
          });

          keys.forEach((key, index) => {
            const t = setTimeout(() => {
              setCellData(prev => ({ ...prev, [key]: loadedCellData[key] }));
            }, index * IMPORT_DELAY_MS);
            importTimers.current.push(t);
          });
        }
      } catch (err) { alert("Failed to parse JSON."); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  return {
    config, setConfig,
    rows, setRows, updateRow,
    designModel, setDesignModel,
    serverVersion, setServerVersion,
    merges, hiddenCells, cellData, setCellData,
    isSelecting, isMultiSelect, setIsMultiSelect, selectedCells, setSelectedCells,
    selection, setSelection,
    contextMenu, setContextMenu,
    regenModalOpen, setRegenModalOpen, regenConfig, setRegenConfig,
    reviewModalOpen, setReviewModalOpen, currentReviewCell, setCurrentReviewCell,
    fineTuneModalOpen, setFineTuneModalOpen,
    handleMouseDown, handleMouseEnter, handleMouseUp, handleContextMenu,
    handleCellClick: (cellId) => {
        const data = cellData[cellId];
        if (isMultiSelect) { toggleCellSelection(cellId); return; }
        if (data && data.variations && data.variations.length > 0) {
            setCurrentReviewCell({ id: cellId, ...data });
            setReviewModalOpen(true);
        }
    },
    mergeCells, clearMerge, getBounds, isSelected,
    triggerCellUpload, handleDirectFileUpload,
    handleFileUpload, handleExportJson, handleImportJson,
    handleRegenerateClick, confirmRegeneration,
    selectVariation: (img) => {
        if (!currentReviewCell) return;
        const id = currentReviewCell.id;
        setCellData(prev => ({ ...prev, [id]: { ...prev[id], image: img, variations: [] } }));
        setReviewModalOpen(false);
        setCurrentReviewCell(null);
    },
    clearCell: (cellId) => { setCellData(prev => { const next = { ...prev }; delete next[cellId]; return next; }); setContextMenu(null); },
    fileInputRef, getCellId
  };
}

const Sidebar = ({ manager }) => {
  const { config, setConfig, rows, updateRow, setFineTuneModalOpen } = manager;
  return (
    <div className="lg:col-span-1 bg-gray-800 rounded-lg p-5 overflow-y-auto space-y-5 border border-gray-700 shadow-xl custom-scrollbar flex flex-col h-full">
      <div className="flex justify-between items-center border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2"><span>🧬</span> Studio</h2>
        <div className="px-2 py-1 rounded border border-gray-700 bg-gray-900">
          <span className="text-[10px] font-bold uppercase text-gray-500">Grid Engine</span>
        </div>
      </div>

      <div className="space-y-5 flex-1">
        <section className="space-y-3">
            <div className="flex items-center gap-2">
                <div className="p-1 bg-gray-700 rounded text-amber-500"><Wand2 className="h-4 w-4" /></div>
                <h3 className="text-sm font-semibold text-gray-400">AI Fine-Tuning</h3>
            </div>
            <Button onClick={() => setFineTuneModalOpen(true)} className="w-full bg-gradient-to-r from-red-700 to-red-600 hover:to-red-500 text-white shadow-md border-0">
                Fine tune a Model
            </Button>
        </section>

        <div className="border-t border-gray-700" />

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-gray-700 rounded text-gray-300"><Monitor className="h-4 w-4" /></div>
            <h3 className="text-sm font-semibold text-gray-400">Config</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
             <StepperInput label="Width" value={config.pageWidth} onChange={v => setConfig({...config, pageWidth: v})} suffix="px" />
             <StepperInput label="Height" value={config.pageHeight} onChange={v => setConfig({...config, pageHeight: v})} suffix="px" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StepperInput label="Rows" value={config.numRows} onChange={v => setConfig({...config, numRows: v})} min={1} />
            <StepperInput label="Gap" value={config.gap} onChange={v => setConfig({...config, gap: v})} suffix="px" />
          </div>
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                 <Label>Border Col</Label>
                 <input type="color" value={config.borderColor} onChange={e => setConfig({...config, borderColor: e.target.value})} className="h-5 w-5 p-0 border-0 rounded cursor-pointer bg-transparent" />
             </div>
             <div className="flex items-center justify-between">
                 <Label>Cell Bg</Label>
                 <input type="color" value={config.backgroundColor} onChange={e => setConfig({...config, backgroundColor: e.target.value})} className="h-5 w-5 p-0 border-0 rounded cursor-pointer bg-transparent" />
             </div>
          </div>
          <StepperInput label="Internal Cell Padding" value={config.cellPadding} onChange={v => setConfig({...config, cellPadding: v})} suffix="px" />
        </section>

        <div className="border-t border-gray-700" />

        <section className="space-y-3">
           <div className="flex items-center gap-2">
             <div className="p-1 bg-gray-700 rounded text-gray-300"><LayoutGrid className="h-4 w-4" /></div>
             <h3 className="text-sm font-semibold text-gray-400">Row Controls</h3>
           </div>
           <div className="flex gap-1 px-1 text-[9px] font-bold text-gray-500 uppercase tracking-wider text-center">
             <span className="flex-1 basis-0 min-w-[20px]">Row #</span>
             <span className="flex-1 basis-0 min-w-[28px]">Banner</span>
             <span className="flex-1 basis-0 min-w-[34px]">Column #</span>
             <span className="flex-1 basis-0 min-w-[28px]">Fit</span>
             <span className="flex-1 basis-0 min-w-[34px]">Scale</span>
             <span className="flex-1 basis-0 min-w-[50px]">Height</span>
           </div>
           <div className="space-y-1.5">
             {rows.map((row, idx) => (
               <div key={idx} className={cn("flex items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900 p-1.5", row.type === 'banner' && "bg-amber-900/20 border-amber-800/50")}>
                  <span className="flex-1 basis-0 min-w-[20px] text-[10px] text-gray-500 font-mono text-center">{idx + 1}</span>
                  <div className="flex-1 basis-0 min-w-[28px] flex justify-center"><Switch checked={row.type === 'banner'} onCheckedChange={(v) => updateRow(idx, 'type', v)} /></div>
                  <div className="flex-1 basis-0 min-w-[34px]"><StepperInput value={row.cols} disabled={row.type === 'banner'} onChange={v => updateRow(idx, 'cols', Math.max(1, Math.min(12, v)))} /></div>
                  <div className="flex-1 basis-0 min-w-[28px] flex justify-center"><Switch checked={row.auto} onCheckedChange={v => updateRow(idx, 'auto', v)} /></div>
                  <div className="flex-1 basis-0 min-w-[34px]"><StepperInput value={row.scale} onChange={v => updateRow(idx, 'scale', v)} /></div>
                  <div className="flex-1 basis-0 min-w-[50px]"><Input className="h-8 text-center tabular-nums bg-gray-800 border-gray-700" value={row.height} onChange={e => updateRow(idx, 'height', parseInt(e.target.value))} /></div>
               </div>
             ))}
           </div>
        </section>
      </div>
    </div>
  );
};

export default function All_AI() {
  const [globalCustomModels, setGlobalCustomModels] = useState([]);
  const handleGlobalSaveCustomModel = (name, prompt) => { setGlobalCustomModels(prev => [...prev, { name, prompt }]); };
  const manager = useLayoutManager(DEFAULTS, globalCustomModels);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn relative text-white">
        <Sidebar manager={manager} />
        <div className="lg:col-span-2 flex flex-col h-full bg-gray-800 rounded-lg p-4 shadow-2xl overflow-hidden border border-gray-700">
            <Grid manager={manager} customModels={globalCustomModels} onGlobalSave={handleGlobalSaveCustomModel}/>
        </div>
        
        <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111827; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
    </div>
  );
}