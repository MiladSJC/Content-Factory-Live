import React, { useState, useRef, useEffect } from 'react';

// Assets for cycling logic (Demo data)
const ASSET_SETS = {
    1: {
        inputs: ['1_1.png', '1_2.png', '1_3.png'],
        results: ['/Eblast/Result Images/1_1.png', '/Eblast/Result Images/1_2.png', '/Eblast/Result Images/1_3.png', '/Eblast/Result Images/1_4.png'],
    },
    2: {
        inputs: ['2_1.png', '2_2.png', '2_3.png'],
        results: ['/Eblast/Result Images/2_1.png', '/Eblast/Result Images/2_2.png', '/Eblast/Result Images/2_3.png', '/Eblast/Result Images/2_4.png'],
    }
};

const UploadIcon = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

function Advertorial({ onPushToDAM }) {
    // Core States
    const [inputImages, setInputImages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [articleHeader, setArticleHeader] = useState('');
    const [articleBody, setArticleBody] = useState('');
    const [isLiveMode, setIsLiveMode] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImages, setResultImages] = useState([]);

    // Refine Modal & Processing States
    const [refineModal, setRefineModal] = useState({ isOpen: false, prompt: '' });
    const [boxesRefining, setBoxesRefining] = useState([false, false, false, false]);
    const [nextSetToLoad, setNextSetToLoad] = useState(1);
    const [activeLoadedSet, setActiveLoadedSet] = useState(1);
    const [processingStep, setProcessingStep] = useState(0); // 0: Analyzing, 1: Designing, 2: Rendering

    // Advertorial-Specific Controls
    const [layoutPreset, setLayoutPreset] = useState('Editorial');
    const [pageSize, setPageSize] = useState('Full Page');
    const [textDensity, setTextDensity] = useState(0.6);
    const [brandIntegration, setBrandIntegration] = useState(0.8);
    const [columnGrid, setColumnGrid] = useState('2-Column');

    const [settings, setSettings] = useState({
        model: 'v2',
        resolution: '300 DPI',
    });

    const fileInputRef = useRef(null);

    // --- ACTION HANDLERS ---
    const handleAutoLoad = async () => {
        const currentSet = ASSET_SETS[nextSetToLoad];
        const loaded = await Promise.all(currentSet.inputs.map(async (name) => ({
            id: Math.random(),
            url: `/Eblast/Input Images/${name}`,
            name
        })));
        setInputImages(loaded);
        setActiveLoadedSet(nextSetToLoad);
        setNextSetToLoad(prev => (prev === 1 ? 2 : 1));
    };

    const handleGenerate = async () => {
        if (inputImages.length === 0) return alert("Please add images first.");
        setIsProcessing(true);
        setResultImages([]);
        setProcessingStep(0);

        // Simulate AI processing steps
        setTimeout(() => setProcessingStep(1), 1200);
        setTimeout(() => setProcessingStep(2), 2400);
        setTimeout(() => {
            const currentSet = ASSET_SETS[activeLoadedSet];
            setResultImages(currentSet.results);
            setIsProcessing(false);
            setProcessingStep(0);
        }, 3500);
    };

    const handleRefineAll = async () => {
        if (resultImages.length === 0) return;
        setRefineModal({ ...refineModal, isOpen: false });
        setBoxesRefining([true, true, true, true]);

        resultImages.forEach((url, idx) => {
            const randomDelay = 1000 + Math.random() * 2000;
            setTimeout(() => {
                const parts = url.split('.');
                const ext = parts.pop();
                const refinedUrl = `${parts.join('.')}_X.${ext}`;

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
            }, randomDelay);
        });
    };

    // --- HELPERS & COMPUTED VALUES ---
    const columnCount = columnGrid === '3-Column' ? 3 : (columnGrid === '2-Column' ? 2 : 1);

    const getPageSpec = () => {
        switch (pageSize) {
            case 'Half Page Horizontal':
                return { mode: 'single', pageAspect: '11 / 5.5', stageMaxW: '900px' };
            case 'Half Page Vertical':
                return { mode: 'single', pageAspect: '4.25 / 11', stageMaxW: '400px' };
            case 'Quarter Page':
                return { mode: 'single', pageAspect: '4.25 / 5.5', stageMaxW: '520px' };
            case 'Third Page Vertical':
                return { mode: 'single', pageAspect: '2.83 / 11', stageMaxW: '320px' };
            case 'Full Page':
            default:
                return { mode: 'single', pageAspect: '8.5 / 11', stageMaxW: '680px' };
        }
    };

    const getBrandTone = () => {
        const alpha = Math.min(0.95, 0.18 + brandIntegration * 0.6);
        const border = Math.min(0.9, 0.2 + brandIntegration * 0.55);
        return {
            bandAlpha: alpha,
            borderAlpha: border,
            badgeScale: 0.85 + (brandIntegration * 0.25),
        };
    };

    const buildHeadline = () => {
        const cleaned = (prompt || '').trim();
        if (!cleaned) return 'Discover The Art of Modern Living';
        const sentences = cleaned.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
        const first = sentences[0].replace(/^[\s"']+|[\s"']+$/g, '');
        const words = first.split(' ').filter(Boolean);
        const cut = words.slice(0, Math.min(words.length, 10)).join(' ');
        return cut.length < 16 ? first : cut + (words.length > 10 ? '…' : '');
    };

    const buildSubheadline = () => {
        const cleaned = (prompt || '').trim();
        if (!cleaned) return 'Where Innovation Meets Timeless Elegance';
        const sentences = cleaned.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
        if (sentences.length <= 1) return 'A clean, magazine-style advertorial layout designed for credibility and conversion.';
        const second = sentences[1];
        return second.length > 140 ? second.slice(0, 140).trim() + '…' : second;
    };

    const buildBody = () => {
        const base = (prompt || '').trim();
        const seed = base.length ? base : 'This advertorial blends editorial storytelling with product-forward clarity, designed to feel native to the publication while remaining unmistakably actionable.';

        const filler = [
            'In a crowded category, the strongest stories start with what readers actually care about—time saved, problems solved, and better outcomes.',
            'We grounded the narrative in real-world context and paired it with crisp visuals that carry the eye through a natural reading path.',
            'Every section is built to scan: short subheads, confident pull quotes, and image placements that reinforce key messages.',
            'To keep the experience premium, the layout uses generous margins, balanced whitespace, and a typographic hierarchy that feels like print.',
            'The result is a modern sponsored feature that earns attention before it asks for action.'
        ].join(' ');

        const targetChars = Math.round(520 + (textDensity * 1450));
        const combined = `${seed} ${filler} ${seed}`.replace(/\s+/g, ' ');
        return combined.slice(0, Math.min(combined.length, targetChars)).trim();
    };

    const pageSpec = getPageSpec();
    const brandTone = getBrandTone();
    // Use user-edited articleHeader/articleBody if set, otherwise fallback to auto-generated
    const headline = articleHeader.trim() || buildHeadline();
    const subheadline = buildSubheadline();
    const body = articleBody.trim() || buildBody();

    // Use uploaded inputImages for preview layout; fallback to resultImages if available
    const previewImages = inputImages.length > 0 ? inputImages.map(img => img.url) : resultImages;
    const heroImage = previewImages[0] || null;
    const secondaryImage = previewImages[1] || null;
    const tertiaryImage = previewImages[2] || null;

    // --- MAGAZINE PAGE COMPONENT ---
    const MagazinePage = ({ pageIndex = 0 }) => {
        const isMinimal = layoutPreset === 'Minimal';
        const showImages = !!heroImage;

        const bodyFontSize = columnCount === 3 ? 10 : (columnCount === 2 ? 11 : 12);
        const columnGap = columnCount === 3 ? 18 : (columnCount === 2 ? 22 : 0);
        const marginPad = pageSize === 'Quarter Page' ? 16 : (pageSize.includes('Half') ? 20 : 24);
        const topBandHeight = isMinimal ? 40 : 52;



        const ImageFrame = ({ src, label, tall = false }) => (
            <div className="relative overflow-hidden rounded-lg group" style={{
                border: `1px solid rgba(0,0,0,${0.12 + brandTone.borderAlpha * 0.12})`,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))',
            }}>
                <div className={tall ? 'aspect-[5/6]' : 'aspect-[16/9]'}>
                    {src ? (
                        <img src={src} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-[9px] font-black uppercase tracking-[0.26em]" style={{ color: 'rgba(0,0,0,0.42)' }}>
                                    {label}
                                </div>
                                <div className="mt-2 text-[10px]" style={{ color: 'rgba(0,0,0,0.5)' }}>
                                    AI-generated layouts appear here
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="absolute left-2 top-2 rounded px-1.5 py-0.5" style={{
                    background: `rgba(255,255,255,${0.72 + brandTone.bandAlpha * 0.2})`,
                    border: `1px solid rgba(0,0,0,${0.06 + brandTone.borderAlpha * 0.08})`,
                    transform: `scale(${0.95 + brandTone.badgeScale * 0.05})`,
                    transformOrigin: 'left top',
                }}>
                    <div className="text-[8px] font-black uppercase tracking-[0.22em]" style={{ color: 'rgba(0,0,0,0.72)' }}>
                        {label}
                    </div>
                </div>
            </div>
        );

        return (
            <div
                className="mag-page relative rounded-xl overflow-hidden"
                style={{
                    aspectRatio: pageSpec.pageAspect,
                    width: '100%',
                    maxWidth: pageSpec.mode === 'spread' ? '100%' : pageSpec.stageMaxW,
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.55)',
                    background: 'radial-gradient(1200px 900px at 20% 10%, rgba(255,255,255,0.98), rgba(250,250,250,0.95))',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {/* Paper grain texture */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
                    backgroundSize: '8px 8px',
                    opacity: 0.45,
                    mixBlendMode: 'multiply'
                }} />

                {/* Page fold effect */}
                <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-300/30 to-transparent pointer-events-none z-10" />

                {/* Top brand masthead */}
                <div className="absolute left-0 right-0 top-0" style={{
                    height: topBandHeight,
                    background: `linear-gradient(90deg, rgba(220,38,38,${brandTone.bandAlpha}), rgba(220,38,38,${Math.max(0.25, brandTone.bandAlpha - 0.25)}) 55%, rgba(0,0,0,0) 110%)`,
                    borderBottom: `1px solid rgba(0,0,0,${0.08 + brandTone.borderAlpha * 0.12})`,
                }}>
                    <div className="h-full flex items-center justify-between px-5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg" style={{
                                background: 'rgba(255,255,255,0.92)',
                                border: '1px solid rgba(0,0,0,0.08)'
                            }} />
                            <div className="leading-tight">
                                <div className="text-[8px] font-black uppercase tracking-[0.32em]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                                    Sponsored Content
                                </div>
                                <div className="text-[10px] font-black" style={{ color: 'rgba(255,255,255,0.95)' }}>
                                    Modern Living Magazine
                                </div>
                            </div>
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.25em]" style={{ color: 'rgba(255,255,255,0.92)' }}>
                            {pageSize}{pageSpec.mode === 'spread' ? ` • Page ${pageIndex + 1}` : ''}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="absolute inset-0" style={{ padding: marginPad, paddingTop: topBandHeight + 14 }}>
                    {/* Headline Section */}
                    <div className="grid" style={{ gridTemplateColumns: showImages && !isMinimal ? '1.1fr 0.9fr' : '1fr', gap: 18, alignItems: 'start' }}>
                        <div>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(0,0,0,0.55)' }}>
                                Feature
                            </div>
                            <div className="mt-1.5" style={{
                                fontSize: isMinimal ? 22 : 26,
                                lineHeight: 1.05,
                                letterSpacing: -0.5,
                                color: 'rgba(0,0,0,0.9)',
                                fontWeight: 900
                            }}>
                                {headline}
                            </div>
                            <div className="mt-2" style={{
                                fontSize: 12,
                                lineHeight: 1.35,
                                color: 'rgba(0,0,0,0.64)',
                                maxWidth: 520,
                                fontStyle: 'italic'
                            }}>
                                {subheadline}
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full" style={{ background: 'rgba(0,0,0,0.08)' }} />
                                <div className="leading-tight">
                                    <div className="text-[10px] font-bold" style={{ color: 'rgba(0,0,0,0.72)' }}>
                                        Editorial Studio
                                    </div>
                                    <div className="text-[9px]" style={{ color: 'rgba(0,0,0,0.48)' }}>
                                        Updated just now • 4 min read
                                    </div>
                                </div>
                            </div>
                        </div>

                        {showImages && !isMinimal && (
                            <div className="space-y-2">
                                <ImageFrame src={heroImage} label="Hero" />
                                {secondaryImage ? <ImageFrame src={secondaryImage} label="Inset" /> : <ImageFrame src={null} label="Inset" />}
                            </div>
                        )}
                    </div>

                    <div className="my-3 h-px" style={{ background: `rgba(0,0,0,${0.08 + brandTone.borderAlpha * 0.08})` }} />

                    {/* Body Content with Columns - Full Width */}
                    <div>
                        <div
                            className="mag-body"
                            style={{
                                columnCount,
                                columnGap,
                                columnRule: columnCount > 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                                fontSize: bodyFontSize,
                                lineHeight: 1.55,
                                color: 'rgba(0,0,0,0.74)',
                                textAlign: 'justify'
                            }}
                        >
                            {/* Drop cap */}
                            <span style={{
                                float: 'left',
                                fontSize: 42,
                                lineHeight: 0.85,
                                paddingRight: 8,
                                paddingTop: 2,
                                fontWeight: 900,
                                color: 'rgba(0,0,0,0.88)'
                            }}>
                                {(body[0] || 'A').toUpperCase()}
                            </span>
                            {body.slice(1)}
                        </div>

                        {/* Secondary images for multi-column layouts */}
                        {columnCount >= 2 && (
                            <div className="mt-4 grid" style={{ gridTemplateColumns: columnCount === 3 ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10 }}>
                                <ImageFrame src={secondaryImage} label="Detail" tall={columnCount === 3} />
                                <ImageFrame src={tertiaryImage} label="Texture" tall={columnCount === 3} />
                                {columnCount === 3 && <ImageFrame src={resultImages[3] || null} label="Alt" tall />}
                            </div>
                        )}
                    </div>

                    {/* Bottom Signature Bar */}
                    <div className="absolute left-0 right-0" style={{
                        bottom: 0,
                        padding: '12px 22px',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.92) 40%, rgba(255,255,255,0.96) 100%)',
                        borderTop: `1px solid rgba(0,0,0,${0.06 + brandTone.borderAlpha * 0.08})`
                    }}>
                        <div className="flex items-center justify-between">
                            <div className="text-[9px] font-black uppercase tracking-[0.32em]" style={{ color: 'rgba(0,0,0,0.52)' }}>
                                Sponsored by Brand Partner
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: 'rgba(0,0,0,0.48)' }}>
                                    {columnGrid} • {layoutPreset}
                                </div>
                                <div className="text-[9px] font-medium" style={{ color: 'rgba(0,0,0,0.4)' }}>
                                    — 42 —
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hover grid overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-0 mag-grid" />
            </div>
        );
    };

    // --- PROCESSING SKELETON ---
    const ProcessingSkeleton = () => {
        const steps = ['Analyzing', 'Designing', 'Rendering'];

        return (
            <div className="flex items-center justify-center p-6 w-full h-full">
                <div
                    className="magazine-page bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl relative overflow-hidden"
                    style={{
                        width: pageSpec.stageMaxW,
                        aspectRatio: pageSpec.pageAspect,
                        maxHeight: '90%',
                        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.4)'
                    }}
                >
                    {/* Processing Overlay */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-red-500/30 rounded-full" />
                            <div className="absolute inset-0 w-20 h-20 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="mt-6 text-white text-sm font-bold tracking-wider uppercase animate-pulse">
                            Composing Layout
                        </p>
                        <p className="mt-2 text-gray-400 text-xs">
                            AI is crafting your advertorial...
                        </p>

                        {/* Progress Steps */}
                        <div className="mt-6 flex gap-4">
                            {steps.map((step, i) => (
                                <div key={step} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${i < processingStep ? 'bg-green-500' :
                                        i === processingStep ? 'bg-red-500 animate-pulse' :
                                            'bg-gray-600'
                                        }`} />
                                    <span className={`text-[9px] font-medium ${i === processingStep ? 'text-white' : 'text-gray-500'
                                        }`}>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Background Shimmer */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN MAGAZINE PREVIEW ---
    const MagazinePreview = () => {

        return (
            <div
                className="w-full h-full flex items-center justify-center p-4"
                style={{
                    background: 'radial-gradient(1200px 800px at 30% 0%, rgba(220,38,38,0.12), rgba(0,0,0,0) 60%), radial-gradient(900px 700px at 90% 100%, rgba(99,102,241,0.10), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(0,0,0,0.92), rgba(0,0,0,0.96))'
                }}
            >
                <div className="w-full max-w-5xl">
                    {/* Preview Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full" style={{ background: isLiveMode ? 'rgba(34,197,94,0.85)' : 'rgba(148,163,184,0.6)' }} />
                            <div className="text-[10px] font-black uppercase tracking-[0.32em] text-white/70">
                                Magazine Preview • {columnGrid}
                            </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.26em] text-white/50">
                            {isLiveMode ? 'Live Feel' : 'Present Mode'}
                        </div>
                    </div>

                    {/* Page Container */}
                    <div className="relative">
                        {/* Desk shadow */}
                        <div className="absolute -inset-8 rounded-2xl" style={{
                            background: 'radial-gradient(600px 380px at 50% 70%, rgba(0,0,0,0.65), rgba(0,0,0,0))',
                            filter: 'blur(18px)',
                            opacity: 0.65
                        }} />

                        <div>
                            <div className="relative group">
                                <MagazinePage pageIndex={0} />
                            </div>
                        </div>

                        {/* Filmstrip variant gallery */}
                        {resultImages.length > 0 && !isProcessing && !boxesRefining.some(b => b) && (
                            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-[10px] font-black uppercase tracking-[0.28em] text-white/70">Variants</div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Hover to inspect • Push to DAM</div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {resultImages.map((imgUrl, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden border border-white/10 bg-black/40">
                                            <div className="aspect-[16/10] overflow-hidden">
                                                <img
                                                    src={imgUrl}
                                                    className={`w-full h-full object-cover transition-all duration-500 ${boxesRefining[index] ? 'blur-lg opacity-50' : 'blur-0 opacity-90 group-hover:opacity-100 group-hover:scale-105'}`}
                                                    alt={`Variant ${index + 1}`}
                                                />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[8px] font-bold text-white uppercase tracking-wide">Layout V{index + 1}</span>
                                                    <span className="text-[7px] text-gray-400">{columnGrid}</span>
                                                </div>
                                                <button
                                                    onClick={() => onPushToDAM({ path: imgUrl, name: `AI_Advertorial_v${index + 1}.png`, type: "image/png", thumbnail: imgUrl, created_at: new Date() })}
                                                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-[9px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-all shadow-lg"
                                                >
                                                    🚀 Push to DAM
                                                </button>
                                            </div>
                                            {/* Selection Indicator */}
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-green-500 hover:text-white">
                                                <span className="text-[10px]">✓</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn text-white relative">
            {/* LEFT SIDEBAR - Controls */}
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-5 overflow-y-auto space-y-5 border border-gray-700 shadow-xl custom-scrollbar">
                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><span>📰</span> Advertorial Studio</h2>
                    <div className="flex items-center gap-3 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                        <span className={`text-[10px] font-bold uppercase ${isLiveMode ? 'text-green-500' : 'text-gray-500'}`}>
                            {isLiveMode ? 'Live' : 'Present'}
                        </span>
                        <button onClick={() => setIsLiveMode(!isLiveMode)} className={`w-8 h-4 rounded-full relative transition-colors ${isLiveMode ? 'bg-green-600' : 'bg-gray-700'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isLiveMode ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                {/* Layout Assets */}
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-gray-400">Layout Assets</label>
                        <div className="flex gap-1">
                            <button onClick={handleAutoLoad} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">+ Add Images</button>
                            <button onClick={() => fileInputRef.current?.click()} className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-white flex items-center justify-center"><UploadIcon /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 min-h-[80px] bg-gray-900 rounded-lg p-2 border border-gray-700">
                        {inputImages.map(img => (
                            <div key={img.id} className="relative group aspect-square bg-black rounded overflow-hidden border border-gray-700">
                                <img src={img.url} className="w-full h-full object-cover" alt="" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Creative Brief */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-400">Creative Brief</label>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the advertorial concept, brand message, or campaign direction..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white focus:border-red-500 outline-none h-20" />
                </div>

                {/* Article Header & Body - Editable by user, populated by LLM */}
                <div className="space-y-3 bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Article Content</label>
                        <span className="text-[9px] text-gray-600">Editable • Auto-populated</span>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Article Header</label>
                        <input
                            type="text"
                            value={articleHeader}
                            onChange={e => setArticleHeader(e.target.value)}
                            placeholder="Headline will appear here..."
                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Article Body</label>
                        <textarea
                            value={articleBody}
                            onChange={e => setArticleBody(e.target.value)}
                            placeholder="Article body text will appear here..."
                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none h-28 resize-none"
                        />
                    </div>
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Engine</label>
                        <select className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none">
                            <option>V2 (Print)</option>
                            <option>V1 (Legacy)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Resolution</label>
                        <select className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none">
                            <option>300 DPI</option>
                            <option>600 DPI</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Page Size</label>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none"
                        >
                            <option value="Full Page">Full Page</option>
                            <option value="Half Page Horizontal">Half Page (H)</option>
                            <option value="Half Page Vertical">Half Page (V)</option>
                            <option value="Quarter Page">Quarter Page</option>
                            <option value="Third Page Vertical">1/3 Page (V)</option>
                        </select>
                    </div>
                </div>

                {/* Layout Controls */}
                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Layout Preset</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Editorial', 'Minimal'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => setLayoutPreset(opt)}
                                        className={`py-1.5 text-[10px] font-bold rounded border transition-all ${layoutPreset === opt ? 'bg-red-600 border-red-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Column Grid</label>
                            <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-1.5 rounded border border-gray-700 mb-1">
                                <div className={`w-2 h-2 rounded-full transition-colors ${columnGrid === 'Single Column' ? 'bg-red-500' : 'bg-gray-600'}`} />
                                <div className={`w-2 h-2 rounded-full transition-colors ${columnGrid === '2-Column' ? 'bg-red-500' : 'bg-gray-600'}`} />
                                <div className={`w-2 h-2 rounded-full transition-colors ${columnGrid === '3-Column' ? 'bg-red-500' : 'bg-gray-600'}`} />
                            </div>
                            <select
                                value={columnGrid}
                                onChange={(e) => setColumnGrid(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none"
                            >
                                <option>Single Column</option>
                                <option>2-Column</option>
                                <option>3-Column</option>
                            </select>
                        </div>
                    </div>

                    {/* Density Sliders */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Text Density</label>
                                <span className="text-[10px] font-mono text-red-400">{Math.round(textDensity * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={textDensity}
                                onChange={(e) => setTextDensity(parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Brand Prominence</label>
                                <span className="text-[10px] font-mono text-red-400">{Math.round(brandIntegration * 100)}%</span>
                            </div>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={brandIntegration}
                                onChange={(e) => setBrandIntegration(parseFloat(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Generate Button */}
                <button onClick={handleGenerate} disabled={isProcessing} className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${isProcessing ? 'bg-gray-700' : 'bg-gradient-to-r from-red-700 to-red-600 shadow-lg shadow-red-900/40'}`}>
                    {isProcessing ? 'Synthesizing...' : '✨ Generate Advertorial'}
                </button>
            </div>

            {/* RIGHT PANEL - Magazine Preview */}
            <div className="lg:col-span-2 flex flex-col h-full bg-gray-800 rounded-lg p-4 shadow-2xl overflow-hidden border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-3">
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Magazine Simulation</h3>
                        <div className="flex gap-2">
                            <div className={`w-2 h-2 rounded-full transition-colors ${!isProcessing && resultImages.length === 0 ? 'bg-red-500' : 'bg-gray-700'}`} />
                            <div className={`w-2 h-2 rounded-full transition-colors ${isProcessing ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`} />
                            <div className={`w-2 h-2 rounded-full transition-colors ${resultImages.length > 0 && !isProcessing ? 'bg-green-500' : 'bg-gray-700'}`} />
                        </div>
                    </div>
                    {resultImages.length > 0 && !isProcessing && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => setRefineModal({ ...refineModal, isOpen: true })}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-[10px] font-black uppercase py-2 px-4 rounded border border-gray-600 transition-all flex items-center gap-1"
                            >
                                ⚡ Refine
                            </button>
                            <button
                                onClick={() => onPushToDAM({ path: resultImages[0], name: `Advertorial_Final.png`, type: "image/png", thumbnail: resultImages[0], created_at: new Date() })}
                                className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase py-2 px-4 rounded shadow-lg transition-all flex items-center gap-1"
                            >
                                🚀 Publish to DAM
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 rounded-lg relative overflow-hidden custom-scrollbar bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px]" style={{ background: '#0a0a0a' }}>
                    {/* Empty State */}
                    {!isProcessing && resultImages.length === 0 && (
                        <div className="absolute inset-0">
                            <MagazinePreview />
                        </div>
                    )}

                    {/* Processing State */}
                    {(isProcessing || boxesRefining.some(b => b)) && (
                        <div className="absolute inset-0">
                            <ProcessingSkeleton />
                        </div>
                    )}

                    {/* Results State */}
                    {resultImages.length > 0 && !isProcessing && !boxesRefining.some(b => b) && (
                        <div className="absolute inset-0">
                            <MagazinePreview />
                        </div>
                    )}
                </div>
            </div>

            {/* Refinement Modal */}
            {refineModal.isOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 flex justify-between items-center text-white">✨ Refine Layouts<button onClick={() => setRefineModal({ ...refineModal, isOpen: false })} className="text-gray-400 hover:text-white">✕</button></h3>
                        <div className="mb-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Refinement Prompt</label>
                            <textarea value={refineModal.prompt} onChange={(e) => setRefineModal({ ...refineModal, prompt: e.target.value })} placeholder="e.g. Adjust lighting, make colors warmer, more minimal style..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white h-32 outline-none focus:border-red-500 transition-colors" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setRefineModal({ ...refineModal, isOpen: false })} className="px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-700">Cancel</button>
                            <button onClick={handleRefineAll} className="px-4 py-2 rounded text-sm bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg">🚀 Run Refinement</button>
                        </div>
                    </div>
                </div>
            )}

            <input ref={fileInputRef} type="file" multiple className="hidden" />

            <style>{`
                .skeleton-shimmer { animation: shimmer 1.5s infinite; }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
                
                /* Magazine hover affordance: show a subtle layout grid */
                .mag-page:hover .mag-grid { opacity: 1; }
                .mag-grid {
                    transition: opacity .2s ease;
                    background-image:
                        linear-gradient(0deg, rgba(0,0,0,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    mix-blend-mode: multiply;
                }
                
                .magazine-page {
                    transform-style: preserve-3d;
                    perspective: 1000px;
                }
            `}</style>
        </div>
    );
}

export default Advertorial;
