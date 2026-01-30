import { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';

function DataPreparation({
  csvData,
  setCsvData,
  allGeneratedRows,
  setAllGeneratedRows,
  onLoadCarousel
}) {
  // --- Local State for Data Prep View ---
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  // Filtering State
  const [filters, setFilters] = useState({
    brand: 'all',
    product: 'all',
    assetType: 'all',
    size: 'all',
    format: 'all'
  });

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

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
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
        }
      });
    }
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
      {/* Sidebar: Sticky and Double Width */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-lg p-6 space-y-6 sticky top-6 self-start shadow-xl border border-gray-700">
          <div>
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <button
              onClick={() => csvInputRef.current?.click()}
              className={`w-full py-4 px-4 rounded-lg font-bold transition-colors text-xl ${csvUploaded
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
                }`}
            >
              {csvUploaded ? '✓ Connected' : '📤 Upload CSV'}
            </button>
          </div>

          {csvUploaded && (
            <>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-100 border-b border-gray-700 pb-2">Filters</h3>

                <div>
                  <label className="block text-lg text-gray-400 mb-1 font-medium">Brand</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value, product: 'all', assetType: 'all', size: 'all', format: 'all' })}
                    className="w-full bg-gray-700 px-4 py-3 rounded text-lg border border-gray-600 focus:border-red-500 outline-none"
                  >
                    <option value="all">All Brands</option>
                    {uniqueValues.brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg text-gray-400 mb-1 font-medium">Product</label>
                  <select
                    value={filters.product}
                    onChange={(e) => setFilters({ ...filters, product: e.target.value, assetType: 'all', size: 'all', format: 'all' })}
                    className="w-full bg-gray-700 px-4 py-3 rounded text-lg border border-gray-600 focus:border-red-500 outline-none"
                    disabled={uniqueValues.products.length === 0 && filters.brand !== 'all'}
                  >
                    <option value="all">All Products</option>
                    {uniqueValues.products.map(product => (
                      <option key={product} value={product}>{product}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg text-gray-400 mb-1 font-medium">Asset Type</label>
                  <select
                    value={filters.assetType}
                    onChange={(e) => setFilters({ ...filters, assetType: e.target.value, size: 'all', format: 'all' })}
                    className="w-full bg-gray-700 px-4 py-3 rounded text-lg border border-gray-600 focus:border-red-500 outline-none"
                    disabled={uniqueValues.assetTypes.length === 0 && (filters.brand !== 'all' || filters.product !== 'all')}
                  >
                    <option value="all">All Asset Types</option>
                    {uniqueValues.assetTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg text-gray-400 mb-1 font-medium">Size</label>
                  <select
                    value={filters.size}
                    onChange={(e) => setFilters({ ...filters, size: e.target.value, format: 'all' })}
                    className="w-full bg-gray-700 px-4 py-3 rounded text-lg border border-gray-600 focus:border-red-500 outline-none"
                    disabled={uniqueValues.sizes.length === 0 && (filters.brand !== 'all' || filters.product !== 'all' || filters.assetType !== 'all')}
                  >
                    <option value="all">All Sizes</option>
                    {uniqueValues.sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg text-gray-400 mb-1 font-medium">Format</label>
                  <select
                    value={filters.format}
                    onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                    className="w-full bg-gray-700 px-4 py-3 rounded text-lg border border-gray-600 focus:border-red-500 outline-none"
                    disabled={uniqueValues.formats.length === 0 && (filters.brand !== 'all' || filters.product !== 'all' || filters.assetType !== 'all' || filters.size !== 'all')}
                  >
                    <option value="all">All Formats</option>
                    {uniqueValues.formats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setIsLangModalOpen(true)}
                disabled={isGenerating}
                className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-600 py-4 rounded-lg font-bold text-xl transition-all shadow-lg active:scale-95"
              >
                {isGenerating ? '🤖 Generating...' : '🤖 AI Text Generation'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="lg:col-span-8 flex flex-col">
        {!csvUploaded ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-400">Upload a CSV file to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleExportCsv}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-3 px-6 rounded-lg font-bold text-lg transition-colors"
              disabled={filteredGeneratedRows.length === 0}
            >
              💾 Export Edited CSV ({filteredGeneratedRows.length} rows)
            </button>

            {/* Container with sticky horizontal scrollbar logic */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 relative flex flex-col overflow-hidden">
              <div className="overflow-auto max-h-[calc(100vh-180px)] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <table className="w-full text-base table-fixed border-collapse">
                  <thead className="bg-gray-700 sticky top-0 z-30">
                    <tr>
                      <th className="px-3 py-4 text-left w-[120px] bg-gray-700">Language</th>
                      <th className="px-3 py-4 text-left w-[150px] bg-gray-700">Asset Type</th>
                      <th className="px-3 py-4 text-left w-[120px] bg-gray-700">Size</th>
                      <th className="px-3 py-4 text-left w-[120px] bg-gray-700">Format</th>
                      
                      {/* Wider Text Columns */}
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-700">Headline 1</th>
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-700">Headline 2</th>
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-700">Headline 3</th>
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-700">Headline 4</th>
                      <th className="px-3 py-4 text-left w-[400px] bg-gray-700">Headline 5</th>
                      <th className="px-3 py-4 text-left w-[500px] bg-gray-700">ENG Finance</th>

                      {/* Sticky Right Columns */}
                      <th className="px-3 py-4 text-left w-[150px] sticky right-[130px] bg-gray-700 z-40 shadow-[-4px_0_10px_rgba(0,0,0,0.3)]">Social Carousel</th>
                      <th className="px-3 py-4 text-left w-[130px] sticky right-0 bg-gray-700 z-40">Template</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGeneratedRows.length === 0 && !isGenerating ? (
                      <tr>
                        <td colSpan="12" className="p-12 text-center text-gray-400 text-xl italic">
                          No matching data found.
                        </td>
                      </tr>
                    ) : (
                      filteredGeneratedRows.map((row) => (
                        <tr key={row.id} className="border-t border-gray-700 hover:bg-gray-700/40 transition-colors group">
                          {['language', 'Asset Type', 'Size', 'Format'].map(key => (
                            <td key={key} className="px-3 py-4">
                              <input
                                type="text"
                                value={row[key] || ''}
                                onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                className="bg-gray-900/50 p-2 rounded w-full border border-gray-700 focus:border-red-500 outline-none"
                              />
                            </td>
                          ))}

                          {['Headline1', 'Headline2', 'Headline3', 'Headline4', 'Headline5'].map(key => (
                            <td key={key} className="px-3 py-4">
                              <textarea
                                rows="3"
                                value={row[key] || ''}
                                onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                                className="bg-gray-900/50 p-3 rounded w-full text-xl resize-none border border-gray-700 focus:border-red-500 outline-none min-h-[120px]"
                              />
                            </td>
                          ))}

                          <td className="px-3 py-4">
                            <textarea
                              rows="4"
                              value={row['ENG Finance'] || ''}
                              onChange={(e) => handleCellEdit(row.id, 'ENG Finance', e.target.value)}
                              className="bg-gray-900/50 p-3 rounded w-full text-xl resize-none border border-gray-700 focus:border-red-500 outline-none min-h-[160px]"
                            />
                          </td>

                          {/* Sticky Action Cells */}
                          <td className="px-3 py-4 sticky right-[130px] bg-gray-800/95 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.3)] group-hover:bg-gray-700 transition-colors">
                            <button
                              onClick={() => onLoadCarousel(row)}
                              disabled={row.language !== 'EN'}
                              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-2 py-3 rounded text-[10px] font-bold uppercase"
                            >
                              Load 5 Slides
                            </button>
                          </td>

                          <td className="px-3 py-4 sticky right-0 bg-gray-800/95 z-20 group-hover:bg-gray-700 transition-colors">
                            <button
                              onClick={() => openTemplate(row.Template)}
                              className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-3 rounded text-[10px] font-bold uppercase"
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
                <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
                  <p className="text-white text-2xl font-bold">Generating Rows: {generationProgress.current} / {generationProgress.total}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-4xl w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
              <span className="text-4xl">🤖</span> AI Generation Engine
            </h2>

            <div className="mb-8">
              <label className="block text-lg text-gray-400 mb-3 font-semibold uppercase tracking-wider">Custom Prompting</label>
              <textarea
                rows="4"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter specific translation or tone instructions..."
                className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl text-lg focus:border-red-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <label className="block text-lg text-gray-400 mb-3 font-semibold uppercase tracking-wider">Intelligence Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 px-4 py-4 rounded-xl text-lg focus:border-red-500 outline-none appearance-none"
                >
                  <option value="gpt-4o">GPT-4o (Standard)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-lg text-gray-400 mb-3 font-semibold uppercase tracking-wider">Target Languages</label>
                <div className="bg-gray-900 border border-gray-700 p-4 rounded-xl max-h-48 overflow-y-auto space-y-3">
                  {availableLanguages.length > 0 ? (
                    availableLanguages.map(lang => (
                      <label key={lang} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-800 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          value={lang}
                          onChange={handleLangCheckbox}
                          checked={selectedLangs.includes(lang)}
                          className="h-6 w-6 rounded border-gray-700 text-red-600 bg-gray-800 focus:ring-offset-gray-900 focus:ring-red-600"
                        />
                        <span className="text-xl font-medium text-gray-200">{lang}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 italic py-2">Scanning for additional languages...</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-5">
              <button
                onClick={() => {
                  setIsLangModalOpen(false);
                  setSelectedLangs([]);
                }}
                className="py-4 px-10 rounded-xl font-bold text-lg bg-gray-700 hover:bg-gray-600 transition-all text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleLanguageGeneration}
                disabled={selectedLangs.length === 0 || isGenerating}
                className="py-4 px-10 rounded-xl font-bold text-lg bg-red-600 hover:bg-red-700 disabled:bg-gray-500 text-white shadow-lg active:scale-95 transition-all"
              >
                {isGenerating ? 'Initializing AI...' : 'Generate New Assets'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataPreparation;