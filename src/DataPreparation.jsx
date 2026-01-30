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

  /**
   * REFACTORED: handleLanguageGeneration
   * Removes backend reliance and processing loops to prevent UI crashes.
   * Processes all row logic locally in the frontend state.
   */
  const handleLanguageGeneration = async () => {
    setIsLangModalOpen(false);
    setIsGenerating(true);

    // Determine which source rows match selected filters and languages
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

    // Filter out rows that already exist
    const existingIds = new Set(allGeneratedRows.map(r => r.id));
    const newRows = sourceRows.filter(r => !existingIds.has(r.id));

    if (newRows.length === 0) {
      setIsGenerating(false);
      setSelectedLangs([]);
      return;
    }

    // Set progress tracking
    setGenerationProgress({ current: 0, total: newRows.length });

    // Add rows one by one with delay
    for (let i = 0; i < newRows.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 150)); // 150ms delay between each row

      setAllGeneratedRows(prev => [...prev, newRows[i]]);
      setGenerationProgress({ current: i + 1, total: newRows.length });
    }

    setIsGenerating(false);
    setGenerationProgress({ current: 0, total: 0 });
    setSelectedLangs([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-8 gap-6">
      {/* Sidebar / Filters */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4 self-start lg:col-span-1">
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
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors text-lg ${csvUploaded
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
              }`}
          >
            {csvUploaded ? '✓ Connected' : '📤 Upload CSV'}
          </button>
        </div>

        {csvUploaded && (
          <>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-300">Filters</h3>

              <div>
                <label className="block text-lg text-gray-400 mb-1">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value, product: 'all', assetType: 'all', size: 'all', format: 'all' })}
                  className="w-full bg-gray-700 px-3 py-2 rounded text-lg"
                >
                  <option value="all">All Brands</option>
                  {uniqueValues.brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg text-gray-400 mb-1">Product</label>
                <select
                  value={filters.product}
                  onChange={(e) => setFilters({ ...filters, product: e.target.value, assetType: 'all', size: 'all', format: 'all' })}
                  className="w-full bg-gray-700 px-3 py-2 rounded text-lg"
                  disabled={uniqueValues.products.length === 0 && filters.brand !== 'all'}
                >
                  <option value="all">All Products</option>
                  {uniqueValues.products.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg text-gray-400 mb-1">Asset Type</label>
                <select
                  value={filters.assetType}
                  onChange={(e) => setFilters({ ...filters, assetType: e.target.value, size: 'all', format: 'all' })}
                  className="w-full bg-gray-700 px-3 py-2 rounded text-lg"
                  disabled={uniqueValues.assetTypes.length === 0 && (filters.brand !== 'all' || filters.product !== 'all')}
                >
                  <option value="all">All Asset Types</option>
                  {uniqueValues.assetTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg text-gray-400 mb-1">Size</label>
                <select
                  value={filters.size}
                  onChange={(e) => setFilters({ ...filters, size: e.target.value, format: 'all' })}
                  className="w-full bg-gray-700 px-3 py-2 rounded text-lg"
                  disabled={uniqueValues.sizes.length === 0 && (filters.brand !== 'all' || filters.product !== 'all' || filters.assetType !== 'all')}
                >
                  <option value="all">All Sizes</option>
                  {uniqueValues.sizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-lg text-gray-400 mb-1">Format</label>
                <select
                  value={filters.format}
                  onChange={(e) => setFilters({ ...filters, format: e.target.value })}
                  className="w-full bg-gray-700 px-3 py-2 rounded text-lg"
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
              className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold text-lg"
            >
              {isGenerating ? '🤖 Generating...' : '🤖 AI Text Generation'}
            </button>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-7">
        {!csvUploaded ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-400">Upload a CSV file to get started</p>
          </div>
        ) : filteredGeneratedRows.length === 0 && !isGenerating ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-xl text-gray-400">
              {allGeneratedRows.length > 0 ? "No rows match your current filters." : "Table is empty."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleExportCsv}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-2 px-4 rounded-lg font-semibold"
              disabled={filteredGeneratedRows.length === 0}
            >
              💾 Export Edited CSV ({filteredGeneratedRows.length} rows)
            </button>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-3 py-3 text-left">Language</th>
                      <th className="px-3 py-3 text-left">Asset Type</th>
                      <th className="px-3 py-3 text-left">Size</th>
                      <th className="px-3 py-3 text-left">Format</th>
                      <th className="px-3 py-3 text-left">Headline 1</th>
                      <th className="px-3 py-3 text-left">Headline 2</th>
                      <th className="px-3 py-3 text-left">Headline 3</th>
                      <th className="px-3 py-3 text-left">Headline 4</th>
                      <th className="px-3 py-3 text-left">Headline 5</th>
                      <th className="px-3 py-3 text-left">ENG Finance</th>
                      <th className="px-3 py-3 text-left">Social Carousel</th>
                      <th className="px-3 py-3 text-left">Template</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGeneratedRows.map((row) => (
                      <tr key={row.id} className="border-t border-gray-700 hover:bg-gray-700 animate-fadeIn">
                        {['language', 'Asset Type', 'Size', 'Format'].map(key => (
                          <td key={key} className="px-3 py-6">
                            <input
                              type="text"
                              value={row[key] || ''}
                              onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                              className="bg-gray-700 p-3 rounded w-full text-2xl min-w-[70px] h-12"
                            />
                          </td>
                        ))}

                        {['Headline1', 'Headline2', 'Headline3', 'Headline4', 'Headline5'].map(key => (
                          <td key={key} className="px-3 py-6">
                            <textarea
                              rows="3"
                              value={row[key] || ''}
                              onChange={(e) => handleCellEdit(row.id, key, e.target.value)}
                              onFocus={(e) => {
                                e.target.rows = 1;
                                e.target.style.height = 'auto';
                              }}
                              onBlur={(e) => {
                                e.target.rows = 3;
                              }}
                              className="bg-gray-700 p-3 rounded w-full text-2xl min-w-[120px] resize-none"
                            />
                          </td>
                        ))}

                        <td className="px-3 py-6">
                          <textarea
                            rows="4"
                            value={row['ENG Finance'] || ''}
                            onChange={(e) => handleCellEdit(row.id, 'ENG Finance', e.target.value)}
                            className="bg-gray-700 p-3 rounded w-full text-2xl resize-none min-h-[160px]"
                          />
                        </td>

                        <td className="px-3 py-6">
                          <button
                            onClick={() => onLoadCarousel(row)}
                            disabled={row.language !== 'EN'}
                            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-3 py-2 rounded text-xs font-semibold whitespace-nowrap"
                          >
                            Load 5 Slides
                          </button>
                        </td>

                        <td className="px-3 py-6">
                          <button
                            onClick={() => openTemplate(row.Template)}
                            className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-xs font-semibold whitespace-nowrap"
                          >
                            Open InDesign
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isGenerating && (
                <div className="p-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                  <p className="text-gray-400 mt-2">Processing rows...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Modal */}
      {isLangModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-7xl w-full">
            <h2 className="text-2xl font-bold mb-6">AI Generation Settings</h2>

            <div className="mb-6">
              <label className="block text-lg text-gray-400 mb-2">Prompt</label>
              <textarea
                rows="4"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter your AI prompt here (optional)..."
                className="w-full bg-gray-700 p-3 rounded text-base resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-lg text-gray-400 mb-2">AI Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-gray-700 px-3 py-3 rounded text-lg"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-lg text-gray-400 mb-2">Select Languages</label>
                <div className="space-y-3 max-h-40 overflow-y-auto bg-gray-900 p-3 rounded-lg">
                  {availableLanguages.length > 0 ? (
                    availableLanguages.map(lang => (
                      <label key={lang} className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700">
                        <input
                          type="checkbox"
                          value={lang}
                          onChange={handleLangCheckbox}
                          checked={selectedLangs.includes(lang)}
                          className="h-5 w-5 rounded text-red-500 bg-gray-900 border-gray-600 focus:ring-red-600"
                        />
                        <span className="text-lg">{lang}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-400 p-2">No other languages in CSV.</p>
                  )}
                  {['Spanish', 'Persian'].map(lang => (
                    !availableLanguages.includes(lang) && (
                      <label key={lang} className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-700 opacity-50">
                        <input
                          type="checkbox"
                          value={lang}
                          onChange={handleLangCheckbox}
                          checked={selectedLangs.includes(lang)}
                          className="h-5 w-5 rounded text-red-500 bg-gray-900 border-gray-600 focus:ring-red-600"
                        />
                        <span className="text-lg">{lang}</span>
                      </label>
                    )
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setIsLangModalOpen(false);
                  setSelectedLangs([]);
                }}
                className="py-2 px-5 rounded-lg font-semibold bg-gray-600 hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLanguageGeneration}
                disabled={selectedLangs.length === 0 || isGenerating}
                className="py-2 px-5 rounded-lg font-semibold bg-red-600 hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Generate Selected'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataPreparation;