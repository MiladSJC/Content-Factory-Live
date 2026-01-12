import React, { useEffect, useMemo, useState, useRef } from "react";
import * as XLSX from "xlsx";

const AI_Icons = {
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  LayoutGrid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  RotateCcw: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
};

const EXCEL_PUBLIC_URL = encodeURI("/Metro All Data.xlsx");
const BANNERS = ['Metro', 'Food Basics'];

const normalize = (v) => String(v ?? "").trim().toLowerCase();
const getDigits = (s) => (String(s ?? "").match(/\d+/g) || []).join("");

const openInNewTab = (url) => {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const getAIInsights = (row) => {
  const seed = String(row?.Copy || "").length;
  const revenue = (seed * 450 + 12000).toLocaleString();
  const roi = (4 + (seed % 5) + Math.random()).toFixed(1);
  const marginLift = (2 + (seed % 8)).toFixed(1);
  const affinity = 75 + (seed % 20);
  const stock = 150 + (seed * 2);
  
  const regions = ["Ontario (GTA)", "British Columbia", "Quebec", "Alberta"];
  const reasons = [
    "High historical affinity in regional GTA flyers.",
    "Strong price elasticity compared to Amazon baseline.",
    "Inventory velocity exceeds category average by 14%.",
    "Social sentiment peaks for this SKU in mid-week browsing.",
    "Predictive model suggests high cross-sell conversion."
  ];
  
  return {
    revenue: `$${revenue}`,
    roi: `${roi}x`,
    marginLift: `+${marginLift}%`,
    affinity: `${affinity}%`,
    stock: stock,
    topRegion: regions[seed % regions.length],
    sentiment: `${70 + (seed % 25)}%`,
    reason: reasons[seed % reasons.length]
  };
};

const DataTable = ({ rows }) => {
  const columns = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    const set = new Set();
    rows.slice(0, 50).forEach((r) => Object.keys(r || {}).forEach((k) => set.add(k)));
    return Array.from(set);
  }, [rows]);

  return (
    <div className="overflow-x-auto overflow-y-auto h-full w-full custom-scrollbar">
      <table className="w-max min-w-full text-left text-[11px] border-separate border-spacing-0">
        <thead className="sticky top-0 z-10 bg-gray-900 shadow-[0_1px_0_0_rgba(31,41,55,1)]">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 whitespace-nowrap border-b border-gray-800">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-800/60 hover:bg-red-600/5 transition-colors">
              {columns.map((col) => (
                <td key={col} className="px-4 py-3 text-gray-200 whitespace-nowrap border-b border-gray-800/40">
                  {String(row?.[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const GridItem = ({ 
  row, index, allRows, onReplace, onSwap, startValidation, hasScanned, 
  isManualMode, isSelected, onToggleSelect 
}) => {
  const [localIsScanning, setLocalIsScanning] = useState(false);
  const [localShowContent, setLocalShowContent] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const hoverTimer = useRef(null);
  const [side, setSide] = useState("right");

  const scanComplexity = useMemo(() => {
    return (Math.random() * (3.0 - 1.0) + 1.0).toFixed(1);
  }, []);

  const scanDurationPerCycle = 1200;

  useEffect(() => {
    if (hasScanned || isManualMode) {
        setLocalIsScanning(false);
        setLocalShowContent(true);
        return;
    }

    if (startValidation) {
        setLocalIsScanning(true);
        setLocalShowContent(false);
        const totalDuration = parseFloat(scanComplexity) * scanDurationPerCycle;
        const timer = setTimeout(() => {
            setLocalIsScanning(false);
            setLocalShowContent(true);
        }, totalDuration);
        return () => clearTimeout(timer);
    } else {
        setLocalIsScanning(false);
        setLocalShowContent(false);
    }
  }, [startValidation, scanComplexity, hasScanned, isManualMode]);

  const insights = useMemo(() => getAIInsights(row), [row]);
  
  const alternatives = useMemo(() => {
    return [...allRows]
      .filter(r => r.Copy !== row.Copy && String(r.page) !== String(row.page))
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
  }, [allRows, row]);

  const handleMouseEnter = (e) => {
    if (!localShowContent || isManualMode) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    setSide(rect.right + 500 > windowWidth ? "left" : "right");
    hoverTimer.current = setTimeout(() => {
      setShowOverlay(true);
    }, 700);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowOverlay(false);
  };

  const imagePath = row?.["Img1 Relative Path"] || "";
  const apiImageUrl = imagePath ? imagePath : null;

  const handleDragStart = (e) => {
    if (!localShowContent || isManualMode) return;
    e.dataTransfer.setData("draggedIndex", index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIdx = e.dataTransfer.getData("draggedIndex");
    if (draggedIdx !== "" && parseInt(draggedIdx) !== index) {
      onSwap(parseInt(draggedIdx), index);
    }
  };

  return (
    <div 
      className={`group relative ${localShowContent ? (isManualMode ? 'cursor-default' : 'cursor-grab active:cursor-grabbing') : 'cursor-wait'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      draggable={localShowContent && !isManualMode}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => isManualMode && onToggleSelect?.()}
    >
      <div className={`relative aspect-square bg-gray-900 rounded-2xl border transition-all duration-700 ${localShowContent ? 'border-gray-800 group-hover:border-red-600 shadow-lg' : 'border-purple-500/10 bg-gray-950 shadow-inner'} ${isSelected ? 'ring-2 ring-red-500 border-red-500 shadow-red-900/40' : ''}`}>
        
        {isManualMode && localShowContent && (
          <div className="absolute top-3 right-3 z-[45]">
             <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-red-600 border-red-600 shadow-lg' : 'bg-black/40 border-white/40'}`}>
                {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
             </div>
          </div>
        )}

        {localIsScanning && (
          <div className="absolute inset-0 z-[40] pointer-events-none overflow-hidden rounded-2xl">
             <div 
               className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_20px_rgba(168,85,247,1)] animate-scan-infinite" 
               style={{ animationDuration: `${scanDurationPerCycle}ms` }}
             />
             <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent animate-pulse" />
             <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full border border-purple-500/20 backdrop-blur-md">
                <p className="text-[8px] font-black text-purple-400 uppercase tracking-[0.2em] whitespace-nowrap">
                  Neural Variance: {scanComplexity}
                </p>
             </div>
          </div>
        )}

        <div className={`flex-1 w-full h-full flex flex-col transition-all duration-1000 ease-out ${localShowContent ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-90 rotate-1'}`}>
            <div className="flex-1 w-full h-full relative overflow-hidden bg-white">
            {apiImageUrl ? (
                <img 
                src={apiImageUrl} 
                alt={row?.Copy} 
                className="w-full h-full object-contain block"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-black uppercase">No Preview</div>
            )}
            
            {row?.page && (
                <div className="absolute top-3 left-3 bg-black/70 text-white text-[9px] font-black px-2 py-1 rounded-md backdrop-blur-md border border-white/10 uppercase">
                PG {row.page}
                </div>
            )}

            {row?.adblock && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md border border-white/10 uppercase shadow-lg z-20">
                POS: {row.adblock}
                </div>
            )}
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-end gap-2">
            <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-100 font-bold leading-tight line-clamp-2 uppercase">
                {row?.Copy || "No Copy"}
                </p>
            </div>
            <div className="flex-none text-right">
                <p className="text-3xl font-black text-blue-400 tracking-tighter">
                {row?.Price || "N/A"}
                </p>
            </div>
            </div>
        </div>

        {!localShowContent && !localIsScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-10 h-10 border border-gray-800 rounded-full flex items-center justify-center opacity-30">
                    <div className="w-2 h-2 bg-gray-700 rounded-full animate-ping" />
                 </div>
            </div>
        )}
      </div>

      {showOverlay && localShowContent && !isManualMode && (
        <div 
          className={`absolute z-[500] top-1/2 -translate-y-1/2 ${side === 'right' ? 'left-[100%] pl-4' : 'right-[100%] pr-4'} pointer-events-auto animate-in fade-in zoom-in duration-200`}
        >
          <div className="w-[460px] bg-gray-950/95 backdrop-blur-xl border border-purple-500/50 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-5">
            <div className="absolute top-5 right-5 px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-full">
              <p className="text-[9px] font-black text-green-400 uppercase tracking-[0.15em]">Confidence: 94%</p>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-1.5 bg-purple-600 rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                <AI_Icons.Sparkles />
              </div>
              <div>
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">AI Selection Insight</p>
                <p className="text-xs font-bold text-white uppercase">Performance Prediction</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">Est. Revenue</p>
                <p className="text-lg font-black text-green-400">{insights.revenue}</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">ROI Multiplier</p>
                <div className="flex items-center gap-1">
                  <p className="text-lg font-black text-blue-400">{insights.roi}</p>
                  <AI_Icons.TrendingUp />
                </div>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">Margin Lift</p>
                <p className="text-lg font-black text-purple-400">{insights.marginLift}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5 px-1">
               <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">Regional Affinity</span>
                    <span className="text-white">{insights.affinity}</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: insights.affinity }} />
                  </div>
               </div>
               <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                    <span className="text-gray-500">Inventory Status</span>
                    <span className="text-white">{insights.stock} Units</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: '70%' }} />
                  </div>
               </div>
            </div>

            <div className="mb-5">
              <p className="text-[9px] text-gray-500 font-black uppercase mb-2">Strategic Reasoning</p>
              <p className="text-[11px] text-gray-200 font-medium leading-relaxed italic border-l-2 border-purple-500 pl-3">
                "{insights.reason}"
              </p>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[9px] text-gray-500 font-black uppercase">Suggested Alternatives (Other Pages)</p>
                <p className="text-[8px] text-purple-400 font-black uppercase animate-pulse">Click to Swap</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {alternatives.map((alt, i) => (
                  <button 
                    key={i} 
                    onClick={() => onReplace(index, alt)}
                    className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all text-left group/alt"
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex-none overflow-hidden shadow-sm">
                       {alt?.["Img1 Relative Path"] ? <img src={alt["Img1 Relative Path"]} className="w-full h-full object-contain block" alt="" /> : <div className="bg-gray-300 w-full h-full"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white truncate uppercase mb-0.5">{alt.Copy || "Generic Item"}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-blue-400 font-black">{alt.Price || "$0.00"}</p>
                        <p className="text-[8px] text-gray-500 font-black">PG {alt.page}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataGrid = ({ 
  rows, onReplace, onSwap, startValidation, hasScanned, 
  isManualMode, selectedIds, onToggleItem 
}) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {rows.map((row, idx) => {
          const prevRow = idx > 0 ? rows[idx - 1] : null;
          
          const isNewPage = idx === 0 || row?.page !== prevRow?.page;
          const isNewSet = idx > 0 && row?._assetSetLabel !== prevRow?._assetSetLabel;

          return (
            <React.Fragment key={`${idx}-${row?.Copy}`}>
              {(isNewPage || isNewSet) && (
                <div className="col-span-full mb-2 flex items-center gap-4">
                  <div className={`flex-none text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] ${isNewSet ? 'bg-indigo-600' : 'bg-red-600'}`}>
                    {isNewSet ? row?._assetSetLabel : `Page ${row?.page || "Unknown"}`}
                  </div>
                  <div className="flex-1 h-px bg-gray-800"></div>
                </div>
              )}
              <GridItem 
                row={row} 
                index={idx}
                allRows={rows} 
                onReplace={onReplace} 
                onSwap={onSwap}
                startValidation={startValidation}
                hasScanned={hasScanned}
                isManualMode={isManualMode}
                isSelected={selectedIds?.has(row.id || `${row.Copy}-${idx}`)}
                onToggleSelect={() => onToggleItem?.(row.id || `${row.Copy}-${idx}`)}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const AI_Item_Selection = ({ onNavigateToFlyer }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState("Metro");
  const [selectedCampaignName, setSelectedCampaignName] = useState("");
  const [activeChannel, setActiveChannel] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [excelRows, setExcelRows] = useState([]);
  const [excelLoading, setExcelLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [startValidation, setStartValidation] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultRows, setResultRows] = useState([]);
  const [originalRows, setOriginalRows] = useState([]);
  const [analysisStatus, setAnalysisStatus] = useState("");
  
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualSelectedIds, setManualSelectedIds] = useState(new Set());
  const [assetSets, setAssetSets] = useState([]); 
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [targetChannelForSet, setTargetChannelForSet] = useState("");
  const [manualView, setManualView] = useState("flyer"); // 'flyer' or 'sets'

  const [hasScanned, setHasScanned] = useState(false);

  const STATUS_MESSAGES = [
    "Initializing Neural Weights...",
    "Scanning Historical SKU Performance...",
    "Analyzing Regional Price Elasticity...",
    "Predicting Multi-Channel Conversion...",
    "Synthesizing Strategic Placements...",
    "Finalizing Performance Matrix..."
  ];

  useEffect(() => {
    let cancelled = false;
    const fetchCampaigns = () => {
      try {
        const localData = localStorage.getItem('sjc_campaign_storage');
        if (localData) {
          const fresh = JSON.parse(localData);
          if (cancelled) return;
          setCampaigns(fresh);
        } else {
          fetchFromPublic();
        }
      } catch (e) { console.error(e); }
    };

    const fetchFromPublic = async () => {
      const LIST = ["Moi Campaign.json", "Super C Demo56.json", "Food Basics.json", "112233 Metro Demo.json"];
      try {
        const loaded = await Promise.all(
          LIST.map(file => fetch(`/Campaigns/${file}`).then(res => res.json()))
        );
        const valid = loaded.filter(c => c && c.name);
        if (cancelled) return;
        setCampaigns(valid);
        localStorage.setItem('sjc_campaign_storage', JSON.stringify(valid));
      } catch (e) { console.error(e); }
    };
    fetchCampaigns();
    const onCampaignsUpdated = () => fetchCampaigns();
    window.addEventListener("campaigns:updated", onCampaignsUpdated);
    return () => {
      cancelled = true;
      window.removeEventListener("campaigns:updated", onCampaignsUpdated);
    };
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => c.banner === selectedBanner);
  }, [campaigns, selectedBanner]);

  useEffect(() => {
    if (filteredCampaigns.length > 0) {
      const exists = filteredCampaigns.some(c => c.name === selectedCampaignName);
      if (!exists) {
        const firstProject = filteredCampaigns[0].name;
        setSelectedCampaignName(firstProject);
        localStorage.setItem('sjc_active_project_name', firstProject);
      }
    } else {
      setSelectedCampaignName("");
      localStorage.removeItem('sjc_active_project_name');
    }
    window.dispatchEvent(new Event("activeProject:updated"));
  }, [filteredCampaigns, selectedBanner, selectedCampaignName]);

  useEffect(() => {
    const loadExcel = async () => {
      setExcelLoading(true);
      try {
        const res = await fetch(EXCEL_PUBLIC_URL);
        const ab = await res.arrayBuffer();
        const wb = XLSX.read(ab, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        setExcelRows(json);
      } catch (err) { console.error(err); } finally { setExcelLoading(false); }
    };
    loadExcel();
  }, []);

  const selectedCampaign = useMemo(() => campaigns.find((c) => c.name === selectedCampaignName), [campaigns, selectedCampaignName]);

  useEffect(() => {
    if (selectedCampaign?.channels?.length > 0) setActiveChannel(selectedCampaign.channels[0]);
    else setActiveChannel("");
    setShowResults(false);
    setHasScanned(false);
    setManualSelectedIds(new Set());
    setAssetSets([]);
    setManualView("flyer");
  }, [selectedCampaign]);

  useEffect(() => {
    if (showResults && !hasScanned) {
      const timer = setTimeout(() => {
        setHasScanned(true);
      }, 4000); 
      return () => clearTimeout(timer);
    }
  }, [showResults, hasScanned]);

  useEffect(() => {
    if (isManualMode && selectedCampaignName) {
        const raw = String(selectedCampaignName || "").trim();
        const digits = getDigits(raw);
        let base = excelRows.filter((r) => normalize(r?.docket) === normalize(raw));
        if (!base.length && digits) base = excelRows.filter((r) => getDigits(r?.docket) === digits);
        
        setResultRows(base);
        setOriginalRows(base);
        setShowResults(true);
        setStartValidation(true);
    } else if (!isManualMode) {
        setShowResults(false);
        setResultRows([]);
    }
  }, [isManualMode, selectedCampaignName, excelRows]);

  const rowsForDocketAndChannel = useMemo(() => {
    if (!excelRows.length) return [];
    const raw = String(selectedCampaignName || "").trim();
    const digits = getDigits(raw);
    let base = excelRows.filter((r) => normalize(r?.docket) === normalize(raw));
    if (!base.length && digits) base = excelRows.filter((r) => getDigits(r?.docket) === digits);
    if (!activeChannel) return base;
    return base.filter((r) => normalize(r?.["Marketing Channels"]) === normalize(activeChannel));
  }, [excelRows, selectedCampaignName, activeChannel]);

  const runAISelection = () => {
    setIsAnalyzing(true);
    setShowResults(false);
    setStartValidation(false);
    setHasScanned(false);
    
    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < STATUS_MESSAGES.length) {
        setAnalysisStatus(STATUS_MESSAGES[currentStep]);
        currentStep++;
      }
    }, 450);

    setTimeout(() => {
      clearInterval(interval);
      setResultRows(rowsForDocketAndChannel);
      setOriginalRows(rowsForDocketAndChannel);
      setIsAnalyzing(false);
      setShowResults(true); 
      setStartValidation(true);
    }, 3200); 
  };

  const handleResetLayout = () => {
    if (isManualMode) {
        setAssetSets([]);
        setManualSelectedIds(new Set());
        setManualView("flyer");
    } else {
        setResultRows([...originalRows]);
    }
  };

  const handleReplaceItem = (index, newRow) => {
    setResultRows(prev => {
      const updated = [...prev];
      const targetItem = updated[index];
      const existingIdx = updated.findIndex(r => r.Copy === newRow.Copy && r.docket === newRow.docket);
      
      if (existingIdx !== -1 && existingIdx !== index) {
        const sourceItem = { ...updated[existingIdx] };
        updated[existingIdx] = { ...targetItem, page: sourceItem.page, adblock: sourceItem.adblock };
        updated[index] = { ...sourceItem, page: targetItem.page, adblock: targetItem.adblock };
      } else {
        updated[index] = { ...newRow, page: targetItem.page, adblock: targetItem.adblock };
      }
      return updated;
    });
  };

  const handleSwapItems = (sourceIdx, targetIdx) => {
    setResultRows(prev => {
      const updated = [...prev];
      const sourceItem = { ...updated[sourceIdx] };
      const targetItem = { ...updated[targetIdx] };
      const sourceMetadata = { page: sourceItem.page, adblock: sourceItem.adblock };
      const targetMetadata = { page: targetItem.page, adblock: targetItem.adblock };
      updated[sourceIdx] = { ...targetItem, ...sourceMetadata };
      updated[targetIdx] = { ...sourceItem, ...targetMetadata };
      return updated;
    });
  };

  const handleToggleManualItem = (id) => {
    setManualSelectedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
  };

  const handleSaveAssetSet = () => {
    const selectedItems = resultRows.filter((r, idx) => manualSelectedIds.has(r.id || `${r.Copy}-${idx}`));
    if (!selectedItems.length) return;

    const channelName = targetChannelForSet || activeChannel;
    
    // Calculate set number for this specific channel
    const existingSetsForChannel = assetSets.filter(item => item._targetChannel === channelName);
    const existingSetLabels = new Set(existingSetsForChannel.map(i => i._assetSetLabel));
    const nextSetNumber = existingSetLabels.size + 1;

    const itemsWithSetLabel = selectedItems.map(item => ({
        ...item,
        _assetSetLabel: `Asset Set ${nextSetNumber} (${channelName})`,
        _targetChannel: channelName
    }));

    setAssetSets(prev => [...prev, ...itemsWithSetLabel]);
    setManualSelectedIds(new Set());
    setManualView("sets"); // Automatically switch to view the sets
  };

  const displayRows = useMemo(() => {
    if (isManualMode && manualView === "sets") return assetSets;
    return resultRows;
  }, [isManualMode, manualView, assetSets, resultRows]);

  const canRun = !!selectedCampaign && !!activeChannel && !excelLoading && !isAnalyzing;

  const WorkflowNavigation = () => {
    const fallbackOffer = "https://demo.flyer-platform.sjcisdev.com/offers?project_id=4&customer_id=demo&offer_id=1096";
    const fallbackLayout = "https://uat.flyer-platform.sjcisdev.com/layouts?new=true&customer_id=walmart";
    const fallbackPreview = "https://demo.flyer-platform.sjcisdev.com/projects/ad-plans?id=2&customer_id=demo";

    const offerUrl = selectedCampaign?.offerDataUrl || fallbackOffer;
    const layoutUrl = selectedCampaign?.layoutUrl || fallbackLayout;
    const previewUrl = selectedCampaign?.PreviewUrl || fallbackPreview;

    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openInNewTab(offerUrl)}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-gray-700 transition-colors"
        >
          <span>📦</span> Data
        </button>
        <button
          onClick={() => openInNewTab(layoutUrl)}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-gray-700 transition-colors"
        >
          <span>🎨</span> Layout
        </button>
        <button
          onClick={() => openInNewTab(previewUrl)}
          className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-gray-700 transition-colors"
        >
          <span>👁️</span> Preview
        </button>
        <button
          onClick={onNavigateToFlyer}
          className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-red-600/20 transition-all"
        >
          <span>🚀</span> Production
        </button>
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 text-white animate-fadeIn font-sans">
      
      <div className="w-[21.5%] min-w-[250px] bg-gray-800 rounded-2xl p-4 overflow-y-auto space-y-6 border border-gray-700 shadow-xl custom-scrollbar">
        
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="p-1.5 bg-purple-600 rounded-lg"><AI_Icons.Sparkles /></span> 
                Item Selection
             </h2>
             <div className="flex items-center gap-3 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                <span className={`text-[10px] font-bold uppercase transition-colors ${isManualMode ? 'text-gray-500' : 'text-purple-500'}`}>
                    AI
                </span>
                <button 
                    onClick={() => setIsManualMode(!isManualMode)} 
                    className={`w-8 h-4 rounded-full relative transition-colors ${isManualMode ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isManualMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
                <span className={`text-[10px] font-bold uppercase transition-colors ${isManualMode ? 'text-indigo-400' : 'text-gray-500'}`}>
                    Manual
                </span>
             </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Retail Banner</label>
            <div className="grid grid-cols-2 gap-2">
              {BANNERS.map(b => (
                <button
                  key={b}
                  onClick={() => setSelectedBanner(b)}
                  className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                    selectedBanner === b 
                    ? 'bg-white text-black border-white' 
                    : 'bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Active Project</label>
            <select
                value={selectedCampaignName}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCampaignName(val);
                  localStorage.setItem('sjc_active_project_name', val);
                  window.dispatchEvent(new Event("activeProject:updated"));
                }}
                className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-sm font-bold text-white focus:border-red-500 outline-none appearance-none"
            >
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)
                ) : (
                  <option disabled>No projects found</option>
                )}
            </select>
        </div>

        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Marketing Channels</label>
            <div className="flex flex-col gap-2">
                {selectedCampaign?.channels?.length > 0 ? (
                    selectedCampaign.channels.map(ch => (
                        <button
                            key={ch}
                            onClick={() => setActiveChannel(ch)}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${
                                activeChannel === ch 
                                ? 'bg-red-600 border-red-500 text-white shadow-lg' 
                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'
                            }`}
                        >
                            {ch}
                            <div className={`w-2 h-2 rounded-full ${activeChannel === ch ? 'bg-white animate-pulse' : 'bg-gray-700'}`} />
                        </button>
                    ))
                ) : (
                    <div className="text-[10px] text-gray-600 italic p-4 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
                        No channels available for this docket
                    </div>
                )}
            </div>
        </div>

        <div className="pt-4 border-t border-gray-700 space-y-3">
            {!isManualMode ? (
              <button
                disabled={!canRun}
                onClick={runAISelection}
                className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-lg ${
                    canRun 
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 active:scale-95" 
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                {isAnalyzing ? "Processing..." : <>AI Item Picker <AI_Icons.Sparkles /></>}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowChannelModal(true)}
                  className="w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg active:scale-95"
                >
                  Channel asset picker
                </button>
                <button
                  disabled={manualSelectedIds.size === 0}
                  onClick={handleSaveAssetSet}
                  className={`w-full py-4 rounded-xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
                    manualSelectedIds.size > 0 
                    ? "bg-green-600 hover:bg-green-500 text-white active:scale-95" 
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Save Asset Set
                </button>
              </>
            )}
        </div>
      </div>

      <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden relative flex flex-col shadow-2xl">
        {!selectedCampaign ? (
          <div className="h-full flex items-center justify-center text-gray-700 font-black uppercase tracking-widest">Select Project</div>
        ) : isAnalyzing ? (
          <div className="h-full flex flex-col items-center justify-center relative overflow-hidden bg-gray-950/40">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent skeleton-shimmer z-0" />
            
            <div className="relative z-10 flex flex-col items-center">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border border-purple-500/20 rounded-full animate-ping" />
                    <div className="absolute inset-2 border-t-2 border-purple-500 rounded-full animate-spin" />
                    <div className="absolute inset-4 border-r-2 border-blue-500 rounded-full animate-spin [animation-duration:3s]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-3 bg-purple-600 rounded-xl shadow-[0_0_30px_rgba(147,51,234,0.4)] animate-bounce">
                            <AI_Icons.Sparkles />
                        </div>
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 animate-pulse">
                        Neural Synthesizing
                    </p>
                    <div className="h-4 flex items-center justify-center">
                        <p className="text-xs text-gray-500 font-mono italic animate-fadeIn">
                            {analysisStatus || "Initializing Intelligence Engines..."}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        ) : !showResults ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
             <div className="text-5xl opacity-20 mb-4 animate-bounce">🤔</div>
             <h2 className="text-xl font-black text-white uppercase tracking-tighter">AI Models Loaded</h2>
             <p className="text-gray-500 text-xs mt-2 font-medium">Click AI Item Picker to analyze and filter your docket.</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col p-6 min-h-0">
            <div className="flex-1 flex flex-col min-h-0 bg-gray-950 border border-gray-800 rounded-3xl shadow-inner relative">
              <div className="z-[20] flex-none px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/30 rounded-t-3xl">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {isManualMode ? (manualView === 'sets' ? "Saved Asset Sets" : "Flyer Inventory (Manual)") : "Filtered Intelligence"}
                    </p>
                    <p className="text-sm font-black text-white">{displayRows.length.toLocaleString()} items</p>
                  </div>
                  <button 
                    onClick={handleResetLayout}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-gray-700"
                  >
                    <AI_Icons.RotateCcw /> Reset Layout
                  </button>

                  {isManualMode && (
                      <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800">
                        <button 
                            onClick={() => setManualView("flyer")} 
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${manualView === 'flyer' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Flyer Pick
                        </button>
                        <button 
                            onClick={() => setManualView("sets")} 
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${manualView === 'sets' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            View Sets ({new Set(assetSets.map(s => s._assetSetLabel)).size})
                        </button>
                      </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <WorkflowNavigation />
                  <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800 ml-2">
                    <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}><AI_Icons.List /> Table</button>
                    <button onClick={() => setViewMode("grid")} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}><AI_Icons.LayoutGrid /> Grid</button>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative z-[10]">
                {viewMode === "table" ? (
                  <DataTable rows={displayRows} />
                ) : (
                  <DataGrid 
                    rows={displayRows} 
                    onReplace={handleReplaceItem} 
                    onSwap={handleSwapItems}
                    startValidation={startValidation}
                    hasScanned={hasScanned}
                    isManualMode={isManualMode}
                    selectedIds={manualSelectedIds}
                    onToggleItem={handleToggleManualItem}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {showChannelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
              <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 w-[450px] shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">Target Channel</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Pick items for specific output</p>
                      </div>
                      <button onClick={() => setShowChannelModal(false)} className="text-gray-500 hover:text-white transition-colors bg-gray-900 w-8 h-8 rounded-full flex items-center justify-center border border-gray-700">✕</button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                      {selectedCampaign?.channels?.map(ch => (
                          <button
                            key={ch}
                            onClick={() => {
                                setTargetChannelForSet(ch);
                                setManualView("flyer"); // Ensure we are looking at flyer to pick
                                setShowChannelModal(false);
                            }}
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm uppercase text-left flex items-center justify-between transition-all border group ${
                                targetChannelForSet === ch 
                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' 
                                : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-indigo-500/50'
                            }`}
                          >
                            {ch}
                            <div className={`w-2 h-2 rounded-full ${targetChannelForSet === ch ? 'bg-white' : 'bg-gray-800 group-hover:bg-indigo-400'}`} />
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          animation: shimmer 1.5s infinite;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }

        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-scan-infinite {
          animation: scan 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default AI_Item_Selection;