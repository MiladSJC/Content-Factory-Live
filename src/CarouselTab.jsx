import { useState, useRef, useEffect, useCallback } from 'react';

// --- CONFIGURATION ---
// Ensure this file exists in your 'public' folder (e.g., public/carousel-project.json)
const DEFAULT_PROJECT_FILE = '/Carousel Config.json';

const VERSIONS = ['V1', 'V2', 'V3', 'V4', 'V5'];

// Keys for LocalStorage
const STORAGE_KEYS = {
    V1: 'carouselSlidesV1',
    V2: 'carouselSlidesV2',
    V3: 'carouselSlidesV3',
    V4: 'carouselSlidesV4',
    V5: 'carouselSlidesV5',
};

// --- HELPER CONSTANTS & FUNCTIONS ---

// Defines the structure for a slide. 
const createSlide = (imageUrl = null, text = '', baseSlide = null) => ({
    id: Date.now() + Math.random(),
    image: imageUrl,
    text: text,
    // Inherit styles if a baseSlide exists, otherwise use defaults
    fontSize: baseSlide?.fontSize || 32,
    color: baseSlide?.color || '#ffffff',
    x: baseSlide?.x ?? 50,
    y: baseSlide?.y ?? 30,
    fontWeight: baseSlide?.fontWeight || 'bold',
    textAlign: baseSlide?.textAlign || 'center',
    entryTransition: baseSlide?.entryTransition || 'slideInBottom',
    exitTransition: baseSlide?.exitTransition || 'fadeOut',
    transitionDuration: baseSlide?.transitionDuration || 0.7,
    imageFileName: null
});

// Helper: Convert Blob URL to Base64 String
const blobToBase64 = async (blobUrl) => {
    if (!blobUrl || !blobUrl.startsWith('blob:')) return null;
    try {
        const response = await fetch(blobUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.error("Error converting blob to base64", e);
        return null;
    }
};

// Robust Initializer
const loadInitialSlides = (key) => {
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        } catch (e) {
            console.error(`Failed to parse slides for ${key}`, e);
        }
    }
    return [createSlide(null, 'Slide 1 Text')];
};

function CarouselTab({ carouselData, setCarouselData }) {
    // === STATE ===
    const [slidesV1, setSlidesV1] = useState(() => loadInitialSlides(STORAGE_KEYS.V1));
    const [slidesV2, setSlidesV2] = useState(() => loadInitialSlides(STORAGE_KEYS.V2));
    const [slidesV3, setSlidesV3] = useState(() => loadInitialSlides(STORAGE_KEYS.V3));
    const [slidesV4, setSlidesV4] = useState(() => loadInitialSlides(STORAGE_KEYS.V4));
    const [slidesV5, setSlidesV5] = useState(() => loadInitialSlides(STORAGE_KEYS.V5));

    // Language Cache (The Memory System)
    const [languageCache, setLanguageCache] = useState({});

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentLanguage, setCurrentLanguage] = useState('EN');
    const [currentVersion, setCurrentVersion] = useState('V1');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // New loading state for import

    // Refs
    const inputRefs = {
        V1: useRef(null),
        V2: useRef(null),
        V3: useRef(null),
        V4: useRef(null),
        V5: useRef(null),
    };

    // Kept for fallback if you ever want manual upload again
    const configInputRef = useRef(null);

    // --- DYNAMIC ACCESSORS ---
    const versionMap = {
        V1: { slides: slidesV1, setSlides: setSlidesV1 },
        V2: { slides: slidesV2, setSlides: setSlidesV2 },
        V3: { slides: slidesV3, setSlides: setSlidesV3 },
        V4: { slides: slidesV4, setSlides: setSlidesV4 },
        V5: { slides: slidesV5, setSlides: setSlidesV5 },
    };

    const activeSlides = versionMap[currentVersion].slides;
    const setActiveSlides = versionMap[currentVersion].setSlides;
    const currentSlide = activeSlides[currentIndex] || activeSlides[0];

    const hasImages = (version) => versionMap[version].slides.some(s => s.image !== null);
    const activeHasImages = hasImages(currentVersion);

    // Ensure we always have at least 5 placeholder slides if empty
    const ensureMinimumSlides = useCallback((currentSlides) => {
        const requiredSlides = 5;
        const isEmpty = currentSlides.length === 0 || (currentSlides.length === 1 && !currentSlides[0].image);

        if (isEmpty) {
            return Array.from({ length: requiredSlides }, (_, i) => createSlide(null, `Slide ${i + 1} Text`));
        } else if (currentSlides.length < requiredSlides) {
            const newSlides = [...currentSlides];
            for (let i = currentSlides.length; i < requiredSlides; i++) {
                newSlides.push(createSlide(null, `Slide ${i + 1} Text`, currentSlides[0]));
            }
            return newSlides;
        }
        return currentSlides;
    }, []);

    // Helper to process text (ONLY for CSV data)
    const processCsvText = useCallback((text) => {
        if (!text) return '';
        return text.replace(/\\n/g, '\n').replace(/\\r/g, '');
    }, []);

    // === EFFECTS ===

    // Persist to LocalStorage
    useEffect(() => {
        const save = (key, data) => {
            const storable = data.map(slide => ({
                ...slide,
                image: null // clear image for LS to save space
            }));
            localStorage.setItem(key, JSON.stringify(storable));
        };

        save(STORAGE_KEYS.V1, slidesV1);
        save(STORAGE_KEYS.V2, slidesV2);
        save(STORAGE_KEYS.V3, slidesV3);
        save(STORAGE_KEYS.V4, slidesV4);
        save(STORAGE_KEYS.V5, slidesV5);
    }, [slidesV1, slidesV2, slidesV3, slidesV4, slidesV5]);

    // Initial Load from CSV
    useEffect(() => {
        if (carouselData && carouselData.EN && Array.isArray(carouselData.EN)) {
            const shouldInit = (slides) => slides.length <= 1 && !slides[0].image;

            const createInitSlides = (textArray) => {
                const slides = Array.from({ length: 5 }, (_, i) => createSlide(null, processCsvText(textArray[i] || '')));
                return slides;
            };

            setSlidesV1(prev => shouldInit(prev) ? createInitSlides(carouselData.EN) : prev);
            setSlidesV2(prev => shouldInit(prev) ? createInitSlides(carouselData.EN) : prev);
            setSlidesV3(prev => shouldInit(prev) ? createInitSlides(carouselData.EN) : prev);
            setSlidesV4(prev => shouldInit(prev) ? createInitSlides(carouselData.EN) : prev);
            setSlidesV5(prev => shouldInit(prev) ? createInitSlides(carouselData.EN) : prev);

            setCurrentLanguage('EN');
        }
    }, [carouselData, processCsvText]);

    // --- LOGIC: SWITCH LANGUAGE ---
    const switchLanguage = (targetLang) => {
        if (!carouselData || !carouselData[targetLang]) {
            if (!languageCache[targetLang]) {
                alert(`No ${targetLang} headlines were found in CSV or memory.`);
                return;
            }
        }

        // Save Snapshot
        setLanguageCache(prevCache => ({
            ...prevCache,
            [currentLanguage]: {
                V1: slidesV1, V2: slidesV2, V3: slidesV3, V4: slidesV4, V5: slidesV5
            }
        }));

        // Restore or Load Fresh
        if (languageCache[targetLang]) {
            const cache = languageCache[targetLang];
            setSlidesV1(cache.V1);
            setSlidesV2(cache.V2);
            setSlidesV3(cache.V3);
            setSlidesV4(cache.V4);
            setSlidesV5(cache.V5);
        } else {
            const newTextContent = carouselData[targetLang];
            const createFreshSlides = (prevSlides) => {
                const slides = ensureMinimumSlides(prevSlides);
                return slides.map((slide, index) => {
                    if (index < 5) {
                        return {
                            ...slide,
                            text: processCsvText(newTextContent[index]),
                        };
                    }
                    return slide;
                });
            };

            setSlidesV1(createFreshSlides);
            setSlidesV2(createFreshSlides);
            setSlidesV3(createFreshSlides);
            setSlidesV4(createFreshSlides);
            setSlidesV5(createFreshSlides);
        }

        setCurrentLanguage(targetLang);
    };

    // --- HANDLERS ---

    const handleImageUpload = (e, version) => {
        const files = Array.from(e.target.files).filter(file =>
            file.type.startsWith('image/png') || file.type.startsWith('image/jpeg') || file.type.startsWith('image/jpg')
        );
        if (files.length === 0) return;

        const targetSetSlides = versionMap[version].setSlides;
        const targetCurrentSlides = versionMap[version].slides;

        // Cleanup old blobs
        targetCurrentSlides.forEach(slide => {
            if (slide.image && slide.image.startsWith('blob:')) {
                URL.revokeObjectURL(slide.image);
            }
        });

        const newSlides = files.map((file, index) => {
            const url = URL.createObjectURL(file);
            const existingSlide = targetCurrentSlides[index];
            const text = existingSlide?.text || '';

            return {
                ...createSlide(url, text, existingSlide),
                imageFileName: file.name
            };
        });

        targetSetSlides(prevSlides => {
            const baseSlides = ensureMinimumSlides(newSlides);
            const finalSlides = baseSlides.map((newSlide, index) => {
                const existingSlide = prevSlides[index];
                if (existingSlide) {
                    return {
                        ...newSlide,
                        text: existingSlide.text,
                        fontSize: existingSlide.fontSize,
                        color: existingSlide.color,
                        x: existingSlide.x,
                        y: existingSlide.y,
                        fontWeight: existingSlide.fontWeight,
                        textAlign: existingSlide.textAlign || 'center',
                        entryTransition: existingSlide.entryTransition,
                        exitTransition: existingSlide.exitTransition,
                        transitionDuration: existingSlide.transitionDuration,
                    };
                }
                return newSlide;
            });
            return finalSlides.slice(0, Math.max(newSlides.length, 5));
        });

        setCurrentVersion(version);
        setCurrentIndex(0);
        if (inputRefs[version].current) inputRefs[version].current.value = null;
    };

    const updateSlideProperty = (id, property, value) => {
        setActiveSlides(prevSlides =>
            prevSlides.map(slide =>
                slide.id === id ? { ...slide, [property]: value } : slide
            )
        );
    };

    const handleGeneratePost = () => {
        if (!activeHasImages) {
            alert('Please upload images before generating the post.');
            return;
        }
        alert(`Simulating post generation for ${currentLanguage} (${currentVersion}) with ${activeSlides.length} slides... Data logged to console.`);
        console.log("Generating Post:", activeSlides);
    };

    const handleClearText = () => {
        const clearText = (slide) => ({ ...slide, text: '' });
        const updateAll = (setter) => setter(prev => {
            const cleared = prev.map(clearText);
            return cleared.length > 0 ? cleared : [createSlide()];
        });

        updateAll(setSlidesV1);
        updateAll(setSlidesV2);
        updateAll(setSlidesV3);
        updateAll(setSlidesV4);
        updateAll(setSlidesV5);

        setLanguageCache(prev => ({
            ...prev,
            [currentLanguage]: undefined
        }));

        alert("Text content cleared for all slides.");
    };

    const handleExportConfig = async () => {
        setIsSaving(true);
        try {
            const currentSnapshot = {
                V1: slidesV1, V2: slidesV2, V3: slidesV3, V4: slidesV4, V5: slidesV5
            };
            const allLanguagesData = {
                ...languageCache,
                [currentLanguage]: currentSnapshot
            };

            const processSlides = async (slides) => {
                return await Promise.all(slides.map(async (slide) => {
                    let base64Image = slide.image;
                    if (slide.image && slide.image.startsWith('blob:')) {
                        base64Image = await blobToBase64(slide.image);
                    }
                    return { ...slide, image: base64Image };
                }));
            };

            const processLanguageVersions = async (versionsObj) => {
                const processed = {};
                for (const vKey of VERSIONS) {
                    const slides = versionsObj[vKey] || [];
                    processed[vKey] = await processSlides(slides);
                }
                return processed;
            };

            const finalLanguagesExport = {};
            for (const langKey of Object.keys(allLanguagesData)) {
                if (allLanguagesData[langKey]) {
                    finalLanguagesExport[langKey] = await processLanguageVersions(allLanguagesData[langKey]);
                }
            }

            const exportObject = {
                metadata: "Staples Carousel Config (Multi-Language)",
                date: new Date().toISOString(),
                activeLanguage: currentLanguage,
                languages: finalLanguagesExport,
            };

            const jsonString = JSON.stringify(exportObject, null, 2);
            const fileName = `carousel-project-MULTI-${new Date().toISOString().slice(0, 10)}.json`;

            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: fileName,
                        types: [{ description: 'JSON Configuration', accept: { 'application/json': ['.json'] } }],
                    });
                    const writable = await handle.createWritable();
                    await writable.write(jsonString);
                    await writable.close();
                    alert("Full Multi-Language Project saved successfully!");
                } catch (err) {
                    if (err.name !== 'AbortError') alert("Failed to save file.");
                }
            } else {
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                alert("Project downloaded.");
            }
        } catch (error) {
            console.error("Export Failed", error);
            alert(`Export failed: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- REUSABLE LOADER LOGIC ---
    const loadProjectFromData = (configData) => {
        try {
            const mapImportedToState = (importedSlides) => {
                return importedSlides.map(slide => ({
                    ...createSlide(slide.image),
                    ...slide,
                    text: slide.text,
                    id: Date.now() + Math.random(),
                }));
            };

            // CASE 1: NEW MULTI-LANGUAGE FORMAT
            if (configData.languages) {
                const importedLangs = configData.languages;
                const savedActiveLang = configData.activeLanguage;
                const targetLang = savedActiveLang && importedLangs[savedActiveLang]
                    ? savedActiveLang
                    : Object.keys(importedLangs)[0];

                if (!targetLang) throw new Error("No languages found in project file.");

                const activeLangData = importedLangs[targetLang];
                setSlidesV1(mapImportedToState(activeLangData.V1 || []));
                setSlidesV2(mapImportedToState(activeLangData.V2 || []));
                setSlidesV3(mapImportedToState(activeLangData.V3 || []));
                setSlidesV4(mapImportedToState(activeLangData.V4 || []));
                setSlidesV5(mapImportedToState(activeLangData.V5 || []));

                setCurrentLanguage(targetLang);

                const newCache = {};
                Object.keys(importedLangs).forEach(langKey => {
                    if (langKey !== targetLang) {
                        const lData = importedLangs[langKey];
                        newCache[langKey] = {
                            V1: mapImportedToState(lData.V1 || []),
                            V2: mapImportedToState(lData.V2 || []),
                            V3: mapImportedToState(lData.V3 || []),
                            V4: mapImportedToState(lData.V4 || []),
                            V5: mapImportedToState(lData.V5 || []),
                        };
                    }
                });
            }
            // CASE 2: LEGACY FORMAT
            else if (configData.versions) {
                setSlidesV1(mapImportedToState(configData.versions.V1 || []));
                setSlidesV2(mapImportedToState(configData.versions.V2 || []));
                setSlidesV3(mapImportedToState(configData.versions.V3 || []));
                setSlidesV4(mapImportedToState(configData.versions.V4 || []));
                setSlidesV5(mapImportedToState(configData.versions.V5 || []));

                const importedLang = configData.language || 'EN';
                setLanguageCache(prev => ({ ...prev, [importedLang]: undefined }));

                if (importedLang !== currentLanguage) setCurrentLanguage(importedLang);
                alert(`Legacy Project (${importedLang}) loaded!`);
            }
            else {
                throw new Error("Invalid structure.");
            }
            setCurrentIndex(0);
        } catch (error) {
            console.error(error);
            alert(`Error parsing project: ${error.message}`);
        }
    };

    // --- NEW: FETCH FROM PUBLIC FOLDER ---
    const handleOpenPublicProject = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(DEFAULT_PROJECT_FILE);
            if (!response.ok) throw new Error(`File not found at ${DEFAULT_PROJECT_FILE}`);
            const data = await response.json();
            loadProjectFromData(data);
        } catch (error) {
            console.error("Auto-load failed:", error);
            alert(`Failed to auto-load. Ensure "${DEFAULT_PROJECT_FILE}" exists in the public folder.`);
        } finally {
            setIsLoading(false);
        }
    };

    // --- KEPT FOR BACKUP: MANUAL IMPORT ---
    const handleImportConfig = (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.endsWith('json')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                loadProjectFromData(JSON.parse(event.target.result));
            } catch (error) { alert("Invalid JSON"); }
        };
        reader.readAsText(file);
        if (configInputRef.current) configInputRef.current.value = null;
    };

    if (!currentSlide) {
        return <div className="p-8 text-white">Error initializing slides. Refresh page.</div>;
    }

    const getTransitionClass = (slide) => `carousel-animate-${slide.entryTransition}`;

    // --- JSX ---
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hidden Inputs */}
            {VERSIONS.map(v => (
                <input
                    key={v}
                    ref={inputRefs[v]}
                    type="file"
                    accept="image/png, image/jpeg"
                    multiple
                    onChange={(e) => handleImageUpload(e, v)}
                    className="hidden"
                />
            ))}
            {/* Backup Manual Input */}
            <input
                ref={configInputRef}
                type="file"
                accept=".json"
                onChange={handleImportConfig}
                className="hidden"
            />

            {/* Sidebar (Left Side) */}
            <div className="bg-gray-800 rounded-lg p-4 space-y-4 lg:col-span-1 self-start">
                <h2 className="text-xl font-bold mb-4">Carousel Setup 🖼️</h2>

                {/* 1. Upload Buttons */}
                <div className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="font-bold text-xs uppercase mb-2 text-gray-400">Upload Images to Version</h3>
                    <div className="grid grid-cols-5 gap-1">
                        {VERSIONS.map(v => {
                            const isFilled = hasImages(v);
                            return (
                                <button
                                    key={v}
                                    onClick={() => inputRefs[v].current?.click()}
                                    className={`py-2 px-1 rounded text-xs font-bold transition-all border ${isFilled
                                        ? 'bg-green-700 hover:bg-green-600 border-green-500 text-white'
                                        : 'bg-gray-800 hover:bg-gray-600 border-gray-600 text-gray-400'
                                        }`}
                                >
                                    {isFilled ? `✓ ${v}` : `⬆ ${v}`}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Version Switcher */}
                <div className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="font-bold text-xs uppercase mb-2 text-gray-400">Active Version Editor</h3>
                    <div className="grid grid-cols-5 gap-1">
                        {VERSIONS.map(v => (
                            <button
                                key={v}
                                onClick={() => { setCurrentVersion(v); setCurrentIndex(0); }}
                                className={`py-2 px-1 rounded text-sm font-bold transition-colors ${currentVersion === v
                                    ? 'bg-red-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-800 hover:bg-gray-900 text-gray-300'
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Language Switcher */}
                <div className="bg-gray-700 p-3 rounded-lg">
                    <h3 className="font-bold text-xs uppercase mb-2 text-gray-400">Language</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {['EN', 'FR', 'CANTONESE'].map(lang => (
                            <button
                                key={lang}
                                onClick={() => switchLanguage(lang)}
                                disabled={!carouselData?.[lang] && !languageCache?.[lang]}
                                className={`py-1 px-2 rounded-lg font-semibold text-xs ${currentLanguage === lang
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-800 hover:bg-gray-900 disabled:bg-gray-900 disabled:text-gray-600'
                                    }`}
                            >
                                {lang}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4. Utility Buttons */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={handleOpenPublicProject}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700 py-2 px-2 rounded-lg font-semibold text-xs flex justify-center items-center gap-1"
                    >
                        {isLoading ? (
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : '📂 Open Project'}
                    </button>
                    <button
                        onClick={handleExportConfig}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 py-2 px-2 rounded-lg font-semibold text-xs flex justify-center items-center gap-1"
                    >
                        {isSaving ? (
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : '💾 Save Project'}
                    </button>
                    <button
                        onClick={handleClearText}
                        className="bg-red-800 hover:bg-red-900 py-2 px-2 rounded-lg font-semibold text-xs"
                    >
                        Clear Text
                    </button>
                </div>

                {/* 5. Editor Controls */}
                <div className="bg-gray-700 p-3 rounded-lg sticky top-0 z-10 border-l-4 border-red-600">
                    <h3 className="font-bold text-sm mb-2 text-white flex justify-between">
                        <span>Edit Slide {currentIndex + 1}</span>
                        <span className="text-gray-400 font-normal text-xs">{currentVersion} / {currentLanguage}</span>
                    </h3>

                    <div className="space-y-3">
                        {/* Text Content */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Text Overlay</label>
                            <textarea
                                rows="3"
                                value={currentSlide.text}
                                onChange={(e) => updateSlideProperty(currentSlide.id, 'text', e.target.value)}
                                className="w-full bg-gray-900 px-3 py-2 rounded text-sm resize-none border border-gray-600 focus:border-red-500 outline-none"
                                placeholder="Enter headline..."
                            />
                        </div>

                        {/* Alignment */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Alignment</label>
                            <div className="flex bg-gray-900 rounded p-1 gap-1">
                                {['left', 'center', 'right'].map(align => (
                                    <button
                                        key={align}
                                        onClick={() => updateSlideProperty(currentSlide.id, 'textAlign', align)}
                                        className={`flex-1 py-1 rounded text-xs uppercase ${currentSlide.textAlign === align
                                            ? 'bg-gray-600 text-white'
                                            : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                    >
                                        {align}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Styles Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                                <label className="block text-gray-500 mb-0.5">Size</label>
                                <input
                                    type="number"
                                    min="10" max="200"
                                    value={currentSlide.fontSize}
                                    onChange={(e) => updateSlideProperty(currentSlide.id, 'fontSize', parseInt(e.target.value))}
                                    className="w-full bg-gray-900 px-2 py-1 rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-500 mb-0.5">Color</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="color"
                                        value={currentSlide.color}
                                        onChange={(e) => updateSlideProperty(currentSlide.id, 'color', e.target.value)}
                                        className="h-6 w-6 rounded cursor-pointer border-none p-0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-500 mb-0.5">X Pos (%)</label>
                                <input
                                    type="range" min="0" max="100"
                                    value={currentSlide.x}
                                    onChange={(e) => updateSlideProperty(currentSlide.id, 'x', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-500 mb-0.5">Y Pos (%)</label>
                                <input
                                    type="range" min="0" max="100"
                                    value={currentSlide.y}
                                    onChange={(e) => updateSlideProperty(currentSlide.id, 'y', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-500 mb-0.5">Entry Anim</label>
                                <select
                                    value={currentSlide.entryTransition}
                                    onChange={(e) => updateSlideProperty(currentSlide.id, 'entryTransition', e.target.value)}
                                    className="w-full bg-gray-900 px-1 py-1 rounded text-[10px]"
                                >
                                    <option value="fadeIn">Fade In</option>
                                    <option value="slideInLeft">Slide Left</option>
                                    <option value="slideInRight">Slide Right</option>
                                    <option value="slideInBottom">Slide Up</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-500 mb-0.5">Speed</label>
                                <input
                                    type="number" step="0.1"
                                    value={currentSlide.transitionDuration}
                                    onChange={(e) => updateSlideProperty(currentSlide.id, 'transitionDuration', parseFloat(e.target.value))}
                                    className="w-full bg-gray-900 px-2 py-1 rounded"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thumbnails List */}
                <div className="space-y-1 max-h-[30vh] overflow-y-auto pr-1">
                    {activeSlides.map((slide, index) => (
                        <div key={slide.id}
                            className={`p-2 rounded flex items-center gap-2 cursor-pointer transition-colors ${currentIndex === index ? 'bg-red-900/50 border border-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            onClick={() => setCurrentIndex(index)}
                        >
                            <span className="text-xs font-bold w-4 text-gray-400">{index + 1}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs truncate text-white">{slide.text || '(No Text)'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={handleGeneratePost}
                    disabled={!activeHasImages}
                    className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold mt-4 text-sm"
                >
                    ✨ Generate Post
                </button>
            </div>

            {/* Preview Area (Right Side) */}
            <div className="lg:col-span-2 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-300">
                        {currentVersion} Preview <span className="text-sm font-normal text-gray-500 ml-2">({currentSlide?.imageFileName || 'No Image'})</span>
                    </h3>
                    <div className="space-x-2">
                        <button className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm">PNG</button>
                        <button className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm">MP4</button>
                    </div>
                </div>

                {!activeHasImages ? (
                    <div className="bg-gray-800 rounded-lg flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-600">
                        <div className="text-6xl mb-4">📸</div>
                        <p className="text-xl text-gray-400">No images in {currentVersion}</p>
                    </div>
                ) : (
                    <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center justify-start overflow-auto">
                        <div className="relative w-full max-w-2xl shadow-2xl bg-black">
                            {currentSlide.image ? (
                                <img
                                    src={currentSlide.image}
                                    alt={`Slide ${currentIndex + 1}`}
                                    className="w-full h-auto block"
                                />
                            ) : (
                                <div className="w-full h-96 flex items-center justify-center bg-gray-900 text-gray-500">Image Missing</div>
                            )}

                            {/* Overlay Text */}
                            <div
                                className={`absolute inset-0 flex items-center justify-center p-4 ${getTransitionClass(currentSlide)}`}
                                style={{
                                    left: `${currentSlide.x}%`,
                                    top: `${currentSlide.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'none',
                                    width: '100%',
                                    height: 'auto',
                                    animationDuration: `${currentSlide.transitionDuration}s`,
                                }}
                            >
                                <p
                                    className="whitespace-pre-wrap"
                                    style={{
                                        fontSize: `${currentSlide.fontSize}px`,
                                        color: currentSlide.color,
                                        fontWeight: currentSlide.fontWeight,
                                        textAlign: currentSlide.textAlign || 'center',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                        lineHeight: 1.2,
                                        width: '100%'
                                    }}
                                >
                                    {currentSlide.text}
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex space-x-2 mt-6">
                            {activeSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-red-500 w-4' : 'bg-gray-500 hover:bg-gray-400'}`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between w-full mt-4 max-w-md">
                            <button onClick={() => setCurrentIndex(i => (i - 1 + activeSlides.length) % activeSlides.length)} className="text-gray-400 hover:text-white">← Prev</button>
                            <span className="text-xs text-gray-500">{currentIndex + 1} / {activeSlides.length}</span>
                            <button onClick={() => setCurrentIndex(i => (i + 1) % activeSlides.length)} className="text-gray-400 hover:text-white">Next →</button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes carouselFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes carouselSlideInLeft { from { transform: translate(-150%, -50%); opacity: 0; } to { transform: translate(-50%, -50%); opacity: 1; } }
                @keyframes carouselSlideInRight { from { transform: translate(50%, -50%); opacity: 0; } to { transform: translate(-50%, -50%); opacity: 1; } }
                @keyframes carouselSlideInBottom { from { transform: translate(-50%, 50%); opacity: 0; } to { transform: translate(-50%, -50%); opacity: 1; } }
                
                .carousel-animate-fadeIn { animation-name: carouselFadeIn; animation-timing-function: ease-out; animation-fill-mode: forwards; }
                .carousel-animate-slideInLeft { animation-name: carouselSlideInLeft; animation-timing-function: ease-out; animation-fill-mode: forwards; }
                .carousel-animate-slideInRight { animation-name: carouselSlideInRight; animation-timing-function: ease-out; animation-fill-mode: forwards; }
                .carousel-animate-slideInBottom { animation-name: carouselSlideInBottom; animation-timing-function: ease-out; animation-fill-mode: forwards; }
            `}</style>
        </div>
    );
}

export default CarouselTab;