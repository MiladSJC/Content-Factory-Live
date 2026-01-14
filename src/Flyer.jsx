import React, { useState, useMemo, useRef, useEffect } from 'react';
import Papa from 'papaparse';

// --- Icons (Standardized with AI module) ---
const FlyerIcons = {
  Folder: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Grid: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
};

// --- Sub-Components ---
const AssetGridItem = ({ row, onOpenFile, onOpenFolder, prodEnv }) => {
  const getLogo = () => {
    if (prodEnv === "Figma") return "/Figma.png";
    if (prodEnv === "SJC Platform") return "/SJC_logo.jpg";
    return "/InDesign.png";
  };

  const handleOpenClick = () => {
    if (prodEnv === "SJC Platform") {
      const targetUrl = row['SJC URL'];
      if (targetUrl && targetUrl !== "undefined") {
        window.open(targetUrl, "_blank");
      } else {
        alert("No SJC URL found for this asset in the database.");
      }
    } else {
      onOpenFile(row['File Path']);
    }
  };

  return (
    <div className="group relative">
      <div className="relative aspect-square bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden flex flex-col shadow-lg group-hover:border-red-600 transition-all duration-300">
        <div className="flex-1 w-full h-full relative overflow-hidden bg-white/5 flex items-center justify-center">
          {row.Thumbnail ? (
            <img src={row.Thumbnail} alt={row.Campaign} className="w-full h-full object-cover" />
          ) : (
            <img
              src={getLogo()}
              alt={prodEnv}
              className="w-24 h-24 object-contain opacity-40 group-hover:scale-110 transition-transform"
            />
          )}
          <div className="absolute top-3 left-3 bg-black/70 text-white text-[9px] font-black px-2 py-1 rounded-md backdrop-blur-md border border-white/10 uppercase">
            {row.Year}
          </div>
          <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded-md border border-white/10 uppercase shadow-lg">
            {row['Asset Type']}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/95 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-1/2 min-w-0">
              <p className="text-[10px] text-gray-100 font-bold leading-tight line-clamp-1 uppercase">{row.Campaign}</p>
              <p className="text-[9px] text-gray-400 font-medium truncate">{row['File Name']}</p>
            </div>
            <div className="w-1/2">
              <button
                onClick={handleOpenClick}
                disabled={prodEnv === "Figma"}
                className={`w-full text-[10px] font-black uppercase py-2 rounded-lg transition-all shadow-lg border ${prodEnv === "Figma"
                  ? "bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-50"
                  : "bg-blue-1000 hover:bg-blue-900 text-white border-blue-400/20"
                  }`}
              >
                {prodEnv === "Figma" ? "Locked" : prodEnv === "SJC Platform" ? "Open Platform" : "Open File"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Flyer = () => {
  const [csvData, setCsvData] = useState([]);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [prodEnv, setProdEnv] = useState("InDesign");
  const fileInputRef = useRef(null);

  const SJC_URL = "https://demo.flyer-platform.sjcisdev.com/projects/ad-plans?id=2&customer_id=demo";

  const [filters, setFilters] = useState({
    Banner: '',
    year: '',
    campaign: '',
    channel: '',
    assetType: ''
  });

  const ci = (obj, key) => {
    if (!obj) return "";
    const keys = Object.keys(obj);
    const found = keys.find(k => k.toLowerCase() === String(key).toLowerCase());
    return found ? (obj[found] ?? "") : "";
  };

  const uniq = (arr) => [...new Set((arr || []).filter(Boolean))].sort();

  const processParsedData = (results) => {
    const parsed = (results.data || []).map((row, index) => ({
      Banner: String(ci(row, 'Banner')).trim(),
      Year: String(ci(row, 'Year')).trim(),
      Campaign: String(ci(row, 'Campaign')).trim(),
      Channel: String(ci(row, 'Channel')).trim(),
      'Asset Type': String(ci(row, 'Asset Type')).trim(),
      'Folder Path': String(ci(row, 'Folder Path')).trim(),
      'File Name': String(ci(row, 'File Name') || ci(row, 'File name')).trim(),
      'File Path': String(ci(row, 'File Path')).trim(),
      'SJC URL': String(ci(row, 'SJC URL')).trim(),
      Thumbnail: String(ci(row, 'Thumbnail')).trim(),
      id: index
    })).filter(r => r.Banner || r.Campaign || (r['File Name'] || r['File Path']));
    setCsvData(parsed);
    setIsDbConnected(true);
    if (parsed.length > 0) setFilters({ Banner: '', year: '', campaign: '', channel: '', assetType: '' });
  };

  const loadDefaultCsv = () => {
    Papa.parse("/Metro UI Production.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: processParsedData,
      error: () => alert("Failed to load database.")
    });
  };

  useEffect(() => { loadDefaultCsv(); }, []);

  const handleReloadClick = () => { loadDefaultCsv(); };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) Papa.parse(file, { header: true, skipEmptyLines: true, complete: processParsedData });
  };

  const filteredData = useMemo(() => {
    return csvData.filter(item => {
      return (!filters.Banner || item.Banner === filters.Banner) &&
        (!filters.year || item.Year === filters.year) &&
        (!filters.campaign || item.Campaign === filters.campaign) &&
        (!filters.channel || item.Channel === filters.channel) &&
        (!filters.assetType || item['Asset Type'] === filters.assetType);
    });
  }, [csvData, filters]);

  const BannerOptions = useMemo(() => uniq(csvData.map(i => i.Banner)), [csvData]);
  const yearOptions = useMemo(() => uniq((filters.Banner ? csvData.filter(i => i.Banner === filters.Banner) : csvData).map(i => i.Year)), [csvData, filters.Banner]);
  const campaignOptions = useMemo(() => {
    let data = csvData;
    if (filters.Banner) data = data.filter(i => i.Banner === filters.Banner);
    if (filters.year) data = data.filter(i => i.Year === filters.year);
    return uniq(data.map(i => i.Campaign));
  }, [csvData, filters.Banner, filters.year]);

  const channelOptions = useMemo(() => {
    let data = csvData;
    if (filters.Banner) data = data.filter(i => i.Banner === filters.Banner);
    if (filters.year) data = data.filter(i => i.Year === filters.year);
    if (filters.campaign) data = data.filter(i => i.Campaign === filters.campaign);
    return uniq(data.map(i => i.Channel));
  }, [csvData, filters.Banner, filters.year, filters.campaign]);

  const assetOptions = useMemo(() => {
    let data = csvData;
    if (filters.Banner) data = data.filter(i => i.Banner === filters.Banner);
    if (filters.year) data = data.filter(i => i.Year === filters.year);
    if (filters.campaign) data = data.filter(i => i.Campaign === filters.campaign);
    if (filters.channel) data = data.filter(i => i.Channel === filters.channel);
    return uniq(data.map(i => i['Asset Type']));
  }, [csvData, filters]);

  // --- API Handlers ---
  const openFile = async (path) => {
    if (!path || prodEnv !== "InDesign") return;
    try {
      const res = await fetch('http://localhost:5001/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); }
    } catch (e) { alert("Server error"); }
  };

  const openFolder = async (path) => {
    if (!path || prodEnv !== "InDesign") return;
    try {
      const res = await fetch('http://localhost:5001/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path })
      });
      if (!res.ok) { const d = await res.json(); alert(d.error); }
    } catch (e) { alert("Server error"); }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 text-white animate-fadeIn font-sans">

      {/* --- Left Column: Controls --- */}
      <div className="w-[21.5%] min-w-[250px] bg-gray-800 rounded-2xl p-4 overflow-y-auto space-y-6 border border-gray-700 shadow-xl custom-scrollbar">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="p-1.5 bg-red-600 rounded-lg"><FlyerIcons.Folder /></span>
            Flyer Manager
          </h2>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">System Status</label>
          <button onClick={handleReloadClick} className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border ${isDbConnected ? 'bg-green-600/10 border-green-500/50 text-green-500' : 'bg-blue-600/10 border-blue-500/50 text-blue-500'}`}>
            {isDbConnected ? '● Database Active' : '○ Loading...'}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Banner</label>
          <select value={filters.Banner} onChange={e => setFilters(prev => ({ ...prev, Banner: e.target.value, year: '', campaign: '', channel: '', assetType: '' }))} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-sm font-bold text-white focus:border-red-500 outline-none appearance-none">
            <option value="">All Banners</option>
            {BannerOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Year</label>
            <select value={filters.year} onChange={e => setFilters(prev => ({ ...prev, year: e.target.value, campaign: '', channel: '', assetType: '' }))} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none appearance-none disabled:opacity-50" disabled={!filters.Banner && !yearOptions.length}>
              <option value="">Year</option>
              {yearOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Type</label>
            <select value={filters.assetType} onChange={e => setFilters(prev => ({ ...prev, assetType: e.target.value }))} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none appearance-none disabled:opacity-50" disabled={!filters.channel && !assetOptions.length}>
              <option value="">Type</option>
              {assetOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Campaign</label>
          <select value={filters.campaign} onChange={e => setFilters(prev => ({ ...prev, campaign: e.target.value, channel: '', assetType: '' }))} className="w-full bg-gray-900 border border-gray-700 p-3 rounded-xl text-sm font-bold text-white focus:border-red-500 outline-none appearance-none disabled:opacity-50" disabled={!filters.year && !campaignOptions.length}>
            <option value="">All Campaigns</option>
            {campaignOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Channel</label>
          <div className="flex flex-col gap-2">
            {channelOptions.length > 0 ? channelOptions.map(ch => (
              <button key={ch} onClick={() => setFilters(prev => ({ ...prev, channel: ch, assetType: '' }))} className={`flex items-center justify-between px-4 py-3 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all ${filters.channel === ch ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}>
                {ch}
                <div className={`w-2 h-2 rounded-full ${filters.channel === ch ? 'bg-white animate-pulse' : 'bg-gray-700'}`} />
              </button>
            )) : <div className="text-[10px] text-gray-600 italic p-4 bg-gray-900/50 rounded-xl border border-dashed border-gray-700 text-center">Select campaign to view channels</div>}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button onClick={() => setFilters({ Banner: '', year: '', campaign: '', channel: '', assetType: '' })} className="w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white transition-all">Clear All Filters</button>
        </div>
      </div>

      {/* --- Right Column: Main Display --- */}
      <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden relative flex flex-col shadow-2xl">
        <div className="absolute inset-0 flex flex-col p-6 min-h-0 gap-4">

          {/* --- Production Environment Selector --- */}
          <div className="flex-none flex items-center justify-between bg-gray-800 p-2 rounded-2xl border border-gray-700">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3">Production Environment</span>
            <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800 w-[70%]">
              {["InDesign", "Figma", "SJC Platform"].map((env) => (
                <button
                  key={env}
                  onClick={() => setProdEnv(env)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${prodEnv === env ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
                    }`}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 bg-gray-950 border border-gray-800 rounded-3xl shadow-inner relative">
            <div className="z-[20] flex-none px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/30 rounded-t-3xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Library</p>
                <p className="text-sm font-black text-white">{filteredData.length} records found</p>
              </div>
              <div className="flex items-center gap-2">
                <input type="file" accept=".csv" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-700 transition-all">Manual Import</button>
                <div className="flex bg-gray-900 rounded-xl p-1 border border-gray-800 ml-2">
                  <button onClick={() => setViewMode("table")} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}><FlyerIcons.List /> Table</button>
                  <button onClick={() => setViewMode("grid")} className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400'}`}><FlyerIcons.Grid /> Grid</button>
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative z-[10]">
              {viewMode === "grid" ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredData.length > 0 ? filteredData.map((row) => (
                    <AssetGridItem key={row.id} row={row} onOpenFile={openFile} onOpenFolder={openFolder} prodEnv={prodEnv} />
                  )) : <div className="col-span-full py-20 text-center text-gray-500 uppercase font-black tracking-widest text-xs">No assets match filters</div>}
                </div>
              ) : (
                <div className="p-4 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-900 text-gray-500 uppercase tracking-widest font-black text-[10px] border-b border-gray-800">
                        <th className="p-4">Asset</th><th className="p-4">Details</th><th className="p-4">File Name</th><th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(row => (
                        <tr key={row.id} className="border-b border-gray-800/50 hover:bg-red-600/5 transition-colors group">
                          <td className="p-4 w-16">
                            <img
                              src={row.Thumbnail || (prodEnv === "Figma" ? "/Figma.png" : prodEnv === "SJC Platform" ? "/SJC_logo.jpg" : "/InDesign.png")}
                              className="w-10 h-10 rounded border border-gray-700 object-contain bg-white/5"
                              alt=""
                            />
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white uppercase">{row.Campaign}</p>
                            <p className="text-[10px] text-gray-500">{row['Asset Type']} • {row.Channel}</p>
                          </td>
                          <td className="p-4 font-mono text-sm font-bold text-gray-100 truncate max-w-[450px]">{row['File Name']}</td>
                          <td className="p-4 text-right space-x-2">
                            <button
                              disabled={prodEnv === "Figma"}
                              onClick={() => {
                                if (prodEnv === "SJC Platform") {
                                  const targetUrl = row['SJC URL'];
                                  if (targetUrl && targetUrl !== "undefined") {
                                    window.open(targetUrl, "_blank");
                                  } else {
                                    alert("No SJC URL found for this asset.");
                                  }
                                } else {
                                  openFile(row['File Path']);
                                }
                              }}
                              className={`px-3 py-1 border rounded-md text-[9px] font-black uppercase transition-all ${prodEnv === "Figma"
                                ? "bg-gray-800/50 text-gray-600 border-gray-700 cursor-not-allowed"
                                : "bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600 hover:text-white"
                                }`}
                            >
                              {prodEnv === "Figma" ? "Locked" : "Open"}
                            </button>
                            <button
                              disabled={prodEnv !== "InDesign"}
                              onClick={() => openFolder(row['Folder Path'])}
                              className={`px-3 py-1 border rounded-md text-[9px] font-black uppercase transition-all ${prodEnv !== "InDesign"
                                ? "bg-gray-800/50 text-gray-600 border-gray-700 cursor-not-allowed"
                                : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white"
                                }`}
                            >
                              Folder
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
    </div>
  );
};

export default Flyer;