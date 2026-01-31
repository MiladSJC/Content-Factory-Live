import { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';

function DataPreparation({
  csvData,
  setCsvData,
  allGeneratedRows,
  setAllGeneratedRows,
  csvUploaded,
  setCsvUploaded,
  filters,
  setFilters,
  onLoadCarousel
}) {
  // --- Local State for Data Prep View ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  // AI Modal State
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const csvInputRef = useRef(null);

  // --- Memos ---

  // MEMOIZED: Unique Values for Dropdowns
  const uniqueValues = useMemo(() => {
    if (csvData.length === 0) {
      return { brands: [], products: [], assetTypes: [], sizes: [], formats: [] };
    }

    const brands = [...new Set(csvData.map(row => row.Brand).filter(Boolean))];

    const brandFilteredData = csvData.filter(row =>
      filters.brand === 'all' || row.Brand === filters.brand
    );
    const products = [...new Set(brandFilteredData.map(row => row.Product).filter(Boolean))];

    const productFilteredData = brandFilteredData.filter(row =>
      filters.product === 'all' || row.Product === filters.product
    );
    const assetTypes = [...new Set(productFilteredData.map(row => row['Asset Type']).filter(Boolean))];

    const assetTypeFilteredData = productFilteredData.filter(row =>
      filters.assetType === 'all' || row['Asset Type'] === filters.assetType
    );
    const sizes = [...new Set(assetTypeFilteredData.map(row => row.Size).filter(Boolean))];

    const sizeFilteredData = assetTypeFilteredData.filter(row =>
      filters.size === 'all' || row.Size === filters.size
    );
    const formats = [...new Set(sizeFilteredData.map(row => row.Format).filter(Boolean))];

    return { brands, products, assetTypes, sizes, formats };

  }, [csvData, filters]);

  // MEMOIZED: Available Languages for AI
  const availableLanguages = useMemo(() => {
    const allLangs = [...new Set(csvData.map(row => row.language).filter(Boolean))];
    return allLangs.filter(lang => lang !== 'EN');
  }, [csvData]);

  // MEMOIZED: Filtered Rows for Table
  const filteredGeneratedRows = useMemo(() => {
    return allGeneratedRows.filter(row => {
      return (filters.brand === 'all' || row.Brand === filters.brand) &&
        (filters.product === 'all' || row.Product === filters.product) &&
        (filters.assetType === 'all' || row['Asset Type'] === filters.assetType) &&
        (filters.size === 'all' || row.Size === filters.size) &&
        (filters.format === 'all' || row.Format === filters.format);
    });
  }, [allGeneratedRows, filters]);

  // --- Handlers ---

  const handleCsvUpload = () => {
    // Automatically fetching the local file path as requested
    const filePath = "/Hyundai Data.csv";
    
    Papa.parse(filePath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const initialData = results.data.map((row, index) => ({
          ...row,
          id: Date.now() + index,
        }));

        setCsvData(initialData);
        setCsvUploaded(true);

        const enRows = initialData.filter(row => row.language === 'EN');
        setAllGeneratedRows(enRows);

        setFilters({
          brand: 'all',
          product: 'all',
          assetType: 'all',
          size: 'all',
          format: 'all'
        });
      },
      error: (err) => {
        console.error("Error loading CSV:", err);
        alert("Failed to load local CSV from public folder.");
      }
    });
  };

  const handleCellEdit = (id, key, value) => {
    setAllGeneratedRows(prevRows =>
      prevRows.map(row =>
        row.id === id ? { ...row, [key]: value } : row
      )
    );
  };

  const openTemplate = async (templatePath) => {
    if (!templatePath) {
      alert('Error: No template path specified for this row.');
      return;
    }
    try {
      const resp = await fetch('http://localhost:5001/open-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: templatePath })
      });
      const result = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const msg = result?.error || `Server returned ${resp.status}`;
        alert(`Error opening template:\n${msg}`);
      } else {
        console.log(result.message || 'Opening template...');
      }
    } catch (e) {
      alert(`Failed to connect to the backend.\nError: ${e.message}`);
    }
  };

  const handleExportCsv = () => {
    if (filteredGeneratedRows.length === 0) {
      alert("No data to export. Please check your filters.");
      return;
    }

    const exportData = filteredGeneratedRows.map(row => {
      const { id, ...rest } = row;
      return rest;
    });

    const csv = Papa.unparse(exportData);
    const BOM = "\uFEFF";
    const csvWithBOM = BOM + csv;

    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated_content_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("CSV exported successfully!");
  };

  // --- AI Logic ---

  const handleLangCheckbox = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedLangs(prev => [...prev, value]);
    } else {
      setSelectedLangs(prev => prev.filter(lang => lang !== value));
    }
  };

  const handleLanguageGeneration = async () => {
    setIsLangModalOpen(false);
    setIsGenerating(true);

    const sourceRows = csvData.filter(row => {
      if (!selectedLangs.includes(row.language)) {
        return false;
      }
      return (filters.brand === 'all' || row.Brand === filters.brand) &&
        (filters.product === 'all' || row.Product === filters.product) &&
        (filters.assetType === 'all' || row['Asset Type'] === filters.assetType) &&
        (filters.size === 'all' || row.Size === filters.size) &&
        (filters.format === 'all' || row.Format === filters.format);
    });

    const existingIds = new Set(allGeneratedRows.map(r => r.id));
    const newRows = sourceRows.filter(r => !existingIds.has(r.id));

    if (newRows.length === 0) {
      setIsGenerating(false);
      setSelectedLangs([]);
      return;
    }

    setGenerationProgress({ current: 0, total: newRows.length });

    for (let i = 0; i < newRows.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150));

      setAllGeneratedRows(prev => [...prev, newRows[i]]);
      setGenerationProgress({ current: i + 1, total: newRows.length });
    }

    setIsGenerating(false);
    setGenerationProgress({ current: 0, total: 0 });
    setSelectedLangs([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      {/* Sidebar: Condensed following Flyer Production insights */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-2xl p-4 space-y-5 sticky top-6 self-start shadow-xl border border-gray-700">
          <div className="pb-2 border-b border-gray-700">
            <button
              onClick={handleCsvUpload}
              className={`w-full py-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all border ${csvUploaded
                ? 'bg-green-600/10 border-green-500/50 text-green-500'
                : 'bg-red-600 border-red-500 text-white shadow-lg'
                }`}
            >
              {csvUploaded ? '● Database Connected' : '📤 Upload CSV'}
            </button>
          </div>

          {csvUploaded && (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Asset Filters</h3>
                  <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value, product: 'all', assetType: 'all', size: 'all', format: 'all' })}
                    className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none appearance-none"
                  >
                    <option value="all">All Brands</option>
                    {uniqueValues.brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Product</label>
                  <select
                    value={filters.product}
                    onChange={(e) => setFilters({ ...filters, product: e.target.value, assetType: 'all', size: 'all', format: 'all' })}
                    className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none appearance-none disabled:opacity-50"
                    disabled={uniqueValues.products.length === 0 && filters.brand !== 'all'}
                  >
                    <option value="all">All Products</option>
                    {uniqueValues.products.map(product => (
                      <option key={product} value={product}>{product}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Asset Type</label>
                  <select
                    value={filters.assetType}
                    onChange={(e) => setFilters({ ...filters, assetType: e.target.value, size: 'all', format: 'all' })}
                    className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-xs font-bold text-white focus:border-red-500 outline-none appearance-none disabled:opacity-50"
                    disabled={uniqueValues.assetTypes.length === 0 && (filters.brand !== 'all' || filters.product !== 'all')}
                  >
                    <option value="all">All Asset Types</option>
                    {uniqueValues.assetTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Size</label>
                    <select
                      value={filters.size}
                      onChange={(e) => setFilters({ ...filters, size: e.target.value, format: 'all' })}
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-[10px] font-bold text-white focus:border-red-500 outline-none appearance-none disabled:opacity-50"
                      disabled={uniqueValues.sizes.length === 0 && (filters.brand !== 'all' || filters.product !== 'all' || filters.assetType !== 'all')}
                    >
                      <option value="all">Size</option>
                      {uniqueValues.sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 ml-1">Format</label>
                    <select
                      value={filters.format}
                      onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                      className="w-full bg-gray-900 border border-gray-700 p-2.5 rounded-xl text-[10px] font-bold text-white focus:border-red-500 outline-none appearance-none disabled:opacity-50"
                      disabled={uniqueValues.formats.length === 0 && (filters.brand !== 'all' || filters.product !== 'all' || filters.assetType !== 'all' || filters.size !== 'all')}
                    >
                      <option value="all">Format</option>
                      {uniqueValues.formats.map(format => (
                        <option key={format} value={format}>{format}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={() => setIsLangModalOpen(true)}
                  disabled={isGenerating}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-white transition-all shadow-lg active:scale-95"
                >
                  {isGenerating ? '🤖 Processing...' : '🤖 AI Generation'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="lg:col-span-8 flex flex-col">
        {!csvUploaded ? (
          <div className="bg-gray-800 rounded-2xl p-12 text-center border border-gray-700 shadow-xl">
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Awaiting Database Connection</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-2xl border border-gray-700/50">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">
                  Active Workspace: <span className="text-white">{filteredGeneratedRows.length} Assets</span>
                </span>
                <button
                  onClick={handleExportCsv}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all text-white shadow-lg"
                  disabled={filteredGeneratedRows.length === 0}
                >
                  💾 Export Final CSV
                </button>
            </div>

            {/* Container with sticky horizontal scrollbar logic */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 relative flex flex-col overflow-hidden shadow-2xl">
              <div className="overflow-auto max-h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <table className="w-full text-base table-fixed border-collapse">
                  <thead className="bg-gray-900 sticky top-0 z-30">
                    <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-700">
                      <th className="px-3 py-4 text-left w-[120px] bg-gray-900">Language</th>
                      <th className="px-3 py-4 text-left w-[150px] bg-gray-900">Asset Type</th>
                      <th className="px-3 py-4 text-left w-[120px] bg-gray-900">Size</th>
                      <th className="px-3 py-4 text-left w-[120px] bg-gray-900">Format</th>
                      
                      {/* Wider Text Columns */}
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-900">Headline 1</th>
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-900">Headline 2</th>
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-900">Headline 3</th>
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-900">Headline 4</th>
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-900">Headline 5</th>
                      <th className="px-3 py-4 text-left w-[500px] bg-gray-900">ENG Finance</th>

                      {/* Sticky Right Columns */}
                      <th className="px-3 py-4 text-left w-[150px] sticky right-[130px] bg-gray-900 z-40 shadow-[-4px_0_10px_rgba(0,0,0,0.3)]">Social</th>
                      <th className="px-3 py-4 text-left w-[130px] sticky right-0 bg-gray-900 z-40">Layout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGeneratedRows.length === 0 && !isGenerating ? (
                      <tr>
                        <td colSpan="12" className="p-12 text-center text-gray-500 uppercase font-black tracking-widest text-xs italic">
                          No matching assets found in library.
                        </td>
                      </tr>
                    ) : (
                      filteredGeneratedRows.map((row) => (
                        <tr key={row.id} className="border-t border-gray-700/50 hover:bg-red-600/5 transition-colors group">
                          {['language', 'Asset Type', 'Size', 'Format'].map(key => (
                            <td key={key} className="px-3 py-3">
                              <input
                                type="text"
                                value={row[key] || ''}
                                onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                className="bg-gray-900/50 p-2 rounded-lg w-full border border-gray-700 text-xs font-bold text-gray-300 focus:border-red-500 outline-none"
                              />
                            </td>
                          ))}

                          {['Headline1', 'Headline2', 'Headline3', 'Headline4', 'Headline5'].map(key => (
                            <td key={key} className="px-3 py-3">
                              <textarea
                                rows="3"
                                value={row[key] || ''}
                                onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                className="bg-gray-900/50 p-3 rounded-lg w-full text-lg font-medium text-white resize-none border border-gray-700 focus:border-red-500 outline-none min-h-[84px]"
                              />
                            </td>
                          ))}

                          <td className="px-3 py-3">
                            <textarea
                              rows="4"
                              value={row['ENG Finance'] || ''}
                              onChange={(e) => handleCellEdit(row.id, 'ENG Finance', e.target.value)}
                              className="bg-gray-900/50 p-3 rounded-lg w-full text-sm font-medium text-gray-400 resize-none border border-gray-700 focus:border-red-500 outline-none min-h-[112px]"
                            />
                          </td>

                          {/* Sticky Action Cells */}
                          <td className="px-3 py-3 sticky right-[130px] bg-gray-800/95 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.3)] group-hover:bg-gray-700/50 transition-colors">
                            <button
                              onClick={() => onLoadCarousel(row)}
                              disabled={row.language !== 'EN'}
                              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 px-2 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-tighter"
                            >
                              Load Carousel
                            </button>
                          </td>

                          <td className="px-3 py-3 sticky right-0 bg-gray-800/95 z-20 group-hover:bg-gray-700/50 transition-colors">
                            <button
                              onClick={() => openTemplate(row.Template)}
                              className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600 hover:text-white px-2 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all"
                            >
                              InDesign
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {isGenerating && (
                <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
                  <p className="text-white text-xs font-black uppercase tracking-[0.3em]">Processing Logic: {generationProgress.current} / {generationProgress.total}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-4xl w-full shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <h2 className="text-2xl font-black mb-8 text-white flex items-center gap-4 uppercase tracking-widest">
              <span className="p-2 bg-red-600 rounded-xl text-2xl">🤖</span> AI Generation Engine
            </h2>

            <div className="mb-8">
              <label className="block text-[10px] text-gray-500 mb-3 font-black uppercase tracking-[0.2em]">Contextual Constraints</label>
              <textarea
                rows="4"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter specific translation or tone instructions..."
                className="w-full bg-gray-900 border border-gray-700 p-4 rounded-2xl text-lg text-white focus:border-red-500 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <label className="block text-[10px] text-gray-500 mb-3 font-black uppercase tracking-[0.2em]">Processing Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-4 rounded-2xl text-sm font-bold text-white focus:border-red-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="gpt-4o">GPT-4o (Production)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 mb-3 font-black uppercase tracking-[0.2em]">Target Locales</label>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-2xl max-h-48 overflow-y-auto space-y-2 custom-scrollbar shadow-inner">
                  {availableLanguages.length > 0 ? (
                    availableLanguages.map(lang => (
                      <label key={lang} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800/50 cursor-pointer transition-colors group">
                        <input
                          type="checkbox"
                          value={lang}
                          onChange={handleLangCheckbox}
                          checked={selectedLangs.includes(lang)}
                          className="h-5 w-5 rounded border-gray-700 text-red-600 bg-gray-800 focus:ring-offset-gray-900 focus:ring-red-600"
                        />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">{lang}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest py-2 text-center">Scanning system for languages...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => {
                  setIsLangModalOpen(false);
                  setSelectedLangs([]);
                }}
                className="py-4 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-all"
              >
                Abort
              </button>
              <button
                onClick={handleLanguageGeneration}
                disabled={selectedLangs.length === 0 || isGenerating}
                className="py-4 px-10 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white shadow-xl active:scale-95 transition-all"
              >
                {isGenerating ? 'Initializing...' : 'Run Asset Generation'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
    </div>
  );
}

export default DataPreparation;