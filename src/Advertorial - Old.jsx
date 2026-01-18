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

/**
 * Safe rich-text parser:
 * - Supports **bold**
 * - Supports <b>..</b> and <strong>..</strong> (converted to **..**)
 * - Preserves newlines as <br/>
 * - No HTML injection
 */
function renderRichText(text) {
    const safe = (text || '')
        .replace(/<\s*b\s*>/gi, '**')
        .replace(/<\s*\/\s*b\s*>/gi, '**')
        .replace(/<\s*strong\s*>/gi, '**')
        .replace(/<\s*\/\s*strong\s*>/gi, '**');

    const lines = safe.split('\n');

    const renderLine = (line, lineKey) => {
        const parts = [];
        const re = /\*\*(.+?)\*\*/g;
        let last = 0;
        let m;
        let k = 0;

        while ((m = re.exec(line)) !== null) {
            const start = m.index;
            const end = re.lastIndex;

            if (start > last) {
                parts.push(<React.Fragment key={`t-${lineKey}-${k++}`}>{line.slice(last, start)}</React.Fragment>);
            }

            parts.push(<strong key={`b-${lineKey}-${k++}`}>{m[1]}</strong>);
            last = end;
        }

        if (last < line.length) {
            parts.push(<React.Fragment key={`t-${lineKey}-${k++}`}>{line.slice(last)}</React.Fragment>);
        }

        return parts.length ? parts : [<React.Fragment key={`e-${lineKey}`}></React.Fragment>];
    };

    const out = [];
    for (let i = 0; i < lines.length; i++) {
        out.push(...renderLine(lines[i], i));
        if (i < lines.length - 1) out.push(<br key={`br-${i}`} />);
    }
    return out;
}

function ProcessingSkeleton({ pageSpec, processingStep, layoutMode = 'automation' }) {
    const steps = ['Analyzing', 'Designing', 'Rendering'];

    if (layoutMode === 'ai') {
        return (
            <div className="grid grid-cols-2 gap-4 w-full h-full animate-fadeIn p-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-900/50 border border-gray-700 rounded flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent skeleton-shimmer" />
                        <div className="relative flex flex-col items-center gap-2">
                            <div className="w-12 h-12 border-t-2 border-red-500 rounded-full animate-spin mb-2" />
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest animate-pulse">AI Synthesis V{i + 1}</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

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

                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
                </div>
            </div>
        </div>
    );
}

function ImageFrame({
    src,
    label,
    tall = false,
    brandTone
}) {
    return (
        <div
            className="relative overflow-hidden rounded-lg group"
            style={{
                border: `1px solid rgba(0,0,0,${0.12 + brandTone.borderAlpha * 0.12})`,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))',
            }}
        >
            <div className={tall ? 'aspect-[5/6]' : 'aspect-[16/9]'}>
                {src ? (
                    <div className="w-full h-full">
                        <img
                            src={src}
                            alt=""
                            className="w-full h-full object-cover select-none"
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-[9px] font-black uppercase tracking-[0.26em]" style={{ color: 'rgba(0,0,0,0.42)' }}>
                                {label}
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
}

function MagazinePage({
    pageSpec,
    brandTone,
    pageSize,
    columnCount,
    headline,
    subheadline,
    body,
    heroImage,
    secondaryImage,
    tertiaryImage,
    orderedImages
}) {
    const showImages = !!heroImage;
    const bodyFontSize = columnCount === 3 ? 10 : (columnCount === 2 ? 11 : 12);
    const columnGap = columnCount === 3 ? 18 : (columnCount === 2 ? 22 : 0);
    const marginPad = pageSize === 'Quarter Page' ? 16 : (pageSize.includes('Half') ? 20 : 24);

    const dropCap = (body && body[0]) ? body[0].toUpperCase() : 'A';
    const rest = (body || '').slice(1);

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
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)',
                backgroundSize: '8px 8px',
                opacity: 0.45,
                mixBlendMode: 'multiply'
            }} />

            <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-300/30 to-transparent pointer-events-none z-10" />

            <div className="absolute inset-0" style={{ padding: marginPad }}>
                <div className="grid" style={{ gridTemplateColumns: showImages ? '1.1fr 0.9fr' : '1fr', gap: 18, alignItems: 'start' }}>
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(0,0,0,0.55)' }}>
                            Feature
                        </div>
                        <div className="mt-1.5" style={{
                            fontSize: 26,
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

                    {showImages && (
                        <div className="space-y-2">
                            <ImageFrame
                                src={heroImage}
                                label="Hero"
                                brandTone={brandTone}
                            />
                        </div>
                    )}
                </div>

                <div className="my-3 h-px" style={{ background: `rgba(0,0,0,${0.08 + brandTone.borderAlpha * 0.08})` }} />

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
                        <span style={{
                            float: 'left',
                            fontSize: 42,
                            lineHeight: 0.85,
                            paddingRight: 8,
                            paddingTop: 2,
                            fontWeight: 900,
                            color: 'rgba(0,0,0,0.88)'
                        }}>
                            {dropCap}
                        </span>

                        {renderRichText(rest)}
                    </div>

                    {columnCount >= 1 && (
                        <div className="mt-4 grid" style={{ gridTemplateColumns: columnCount === 3 ? '1fr 1fr 1fr' : (columnCount === 2 ? '1fr 1fr' : '1fr'), gap: 10 }}>
                            <ImageFrame
                                src={secondaryImage}
                                label="Detail"
                                tall={columnCount === 3}
                                brandTone={brandTone}
                            />
                            {columnCount >= 2 && (
                                <ImageFrame
                                    src={tertiaryImage}
                                    label="Texture"
                                    tall={columnCount === 3}
                                    brandTone={brandTone}
                                />
                            )}
                            {columnCount === 3 && (
                                <ImageFrame
                                    src={orderedImages[3]}
                                    label="Alt"
                                    tall
                                    brandTone={brandTone}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute inset-0 pointer-events-none opacity-0 mag-grid" />
        </div>
    );
}

function MagazinePreview({
    pageSpec,
    brandTone,
    pageSize,
    columnCount,
    headline,
    subheadline,
    body,
    heroImage,
    secondaryImage,
    tertiaryImage,
    orderedImages
}) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);
    const lastScaleRef = useRef(1);

    useEffect(() => {
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver((entries) => {
            if (!entries[0]) return;
            const { width, height } = entries[0].contentRect;

            const targetW = 750;
            const targetH = 950;

            const scaleW = width / targetW;
            const scaleH = height / targetH;
            const next = Math.min(scaleW, scaleH, 1) * 0.95;

            if (Math.abs(next - lastScaleRef.current) < 0.02) return;

            lastScaleRef.current = next;
            setScale(next);
        }) : null;

        if (ro && containerRef.current) ro.observe(containerRef.current);
        return () => { if (ro) ro.disconnect(); };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center p-4 overflow-hidden"
            style={{
                background: 'radial-gradient(1200px 800px at 30% 0%, rgba(220,38,38,0.12), rgba(0,0,0,0) 60%), radial-gradient(900px 700px at 90% 100%, rgba(99,102,241,0.10), rgba(0,0,0,0) 55%), linear-gradient(180deg, rgba(0,0,0,0.92), rgba(0,0,0,0.96))'
            }}
        >
            <div
                className="origin-center transition-transform duration-300 ease-out"
                style={{
                    transform: `scale(${scale})`,
                    width: '680px'
                }}
            >
                <div className="w-full">
                    <div className="relative">
                        <div className="absolute -inset-8 rounded-2xl" style={{
                            background: 'radial-gradient(600px 380px at 50% 70%, rgba(0,0,0,0.65), rgba(0,0,0,0))',
                            filter: 'blur(18px)',
                            opacity: 0.65
                        }} />

                        <div>
                            <div className="relative group">
                                <MagazinePage
                                    pageSpec={pageSpec}
                                    brandTone={brandTone}
                                    pageSize={pageSize}
                                    columnCount={columnCount}
                                    headline={headline}
                                    subheadline={subheadline}
                                    body={body}
                                    heroImage={heroImage}
                                    secondaryImage={secondaryImage}
                                    tertiaryImage={tertiaryImage}
                                    orderedImages={orderedImages}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Advertorial({ onPushToDAM }) {
    // Core States
    const [inputImages, setInputImages] = useState([]);
    const [prompt, setPrompt] = useState('');
    const [articleHeader, setArticleHeader] = useState('');
    const [articleBody, setArticleBody] = useState('');
    const [layoutMode, setLayoutMode] = useState('automation'); 
    const [isProcessing, setIsProcessing] = useState(false);
    const [resultImages, setResultImages] = useState([]);

    // Refine Modal & Processing States
    const [refineModal, setRefineModal] = useState({ isOpen: false, prompt: '' });
    const [boxesRefining, setBoxesRefining] = useState([false, false, false, false]);
    const [nextSetToLoad, setNextSetToLoad] = useState(1);
    const [activeLoadedSet, setActiveLoadedSet] = useState(1);
    const [processingStep, setProcessingStep] = useState(0); 

    // Advertorial-Specific Controls
    const [pageSize] = useState('Full Page');
    const [columnGrid, setColumnGrid] = useState('2-Column');
    const [dimensionMode] = useState('Uniform');

    const [orderedImages, setOrderedImages] = useState([]);

    const [settings, setSettings] = useState({
        model: 'v2',
        resolution: '1K',
        aspectRatio: '2:3',
        safety_level: 'allow_all',
        temperature: 1.0,
        top_p: 0.95
    });

    const fileInputRef = useRef(null);
    const lastBaseRef = useRef([]);

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

    useEffect(() => {
        const base = inputImages.length > 0 ? inputImages.map(img => img.url) : resultImages;
        const prevBase = lastBaseRef.current;
        const same = prevBase.length === base.length && prevBase.every((u, i) => u === base[i]);
        if (same) return;
        lastBaseRef.current = base;
        setOrderedImages(base);
    }, [inputImages, resultImages]);

    const handleGenerate = async () => {
        if (inputImages.length === 0) return alert("Please add images first.");

        if (layoutMode === 'ai') {
            if (!articleHeader.trim() && !articleBody.trim()) {
                setIsProcessing(true);
                setProcessingStep(0);
                try {
                    const contentResponse = await fetch('http://localhost:5001/generate-advertorial', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            brief: prompt,
                            layout_preset: 'Editorial',
                            column_grid: columnGrid
                        })
                    });

                    if (contentResponse.ok) {
                        const contentData = await contentResponse.json();
                        if (contentData.header) setArticleHeader(contentData.header);
                        if (contentData.body) setArticleBody(contentData.body);
                    }
                    setIsProcessing(false);
                    return;
                } catch (err) {
                    console.error('Article content generation failed:', err);
                    alert('Failed to generate article content.');
                    setIsProcessing(false);
                    return;
                }
            }

            setIsProcessing(true);
            setResultImages([]);
            setProcessingStep(0);

            try {
                const base64Images = await Promise.all(inputImages.map(async (img) => {
                    if (img.url.startsWith('data:image')) return img.url;
                    const resp = await fetch(img.url);
                    const blob = await resp.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(blob);
                    });
                }));

                setTimeout(() => setProcessingStep(1), 800);

                const aiPrompt = `Create a professional magazine advertorial page in Editorial style with ${columnGrid} layout.
Article Header: ${articleHeader}
Article Content: ${articleBody}
Design a sophisticated magazine page with high-quality visual hierarchy and premium typography.`;

                setTimeout(() => setProcessingStep(2), 1600);

                // For AI Layout Mode, generate 4 variants to match the grid preview requirement
                const responses = await Promise.all([1, 2, 3, 4].map(() => 
                    fetch('http://localhost:5001/generate-eblast', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            images: base64Images,
                            prompt: aiPrompt,
                            settings: settings,
                            is_live: true
                        })
                    }).then(res => res.json())
                ));

                setResultImages(responses.map(r => r.image));
                setIsProcessing(false);
            } catch (err) {
                alert('AI page generation failed.');
                setIsProcessing(false);
            }
            return;
        }

        // Automation Mode (Preserved)
        setIsProcessing(true);
        setResultImages([]);
        setProcessingStep(0);

        try {
            const contentResponse = await fetch('http://localhost:5001/generate-advertorial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brief: prompt,
                    layout_preset: 'Editorial',
                    column_grid: columnGrid
                })
            });

            if (contentResponse.ok) {
                const contentData = await contentResponse.json();
                if (contentData.header) setArticleHeader(contentData.header);
                if (contentData.body) setArticleBody(contentData.body);
            }
        } catch (err) {
            console.error('LLM content generation failed:', err);
        }

        setTimeout(() => setProcessingStep(1), 800);
        setTimeout(() => setProcessingStep(2), 1600);
        setTimeout(() => {
            const currentSet = ASSET_SETS[activeLoadedSet];
            setResultImages(currentSet.results);
            setIsProcessing(false);
        }, 2400);
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

    const handleLocalUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        const newImages = files.map(file => ({
            id: Date.now() + Math.random(),
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setInputImages(prev => [...prev, ...newImages]);
        e.target.value = "";
    };

    const columnCount = columnGrid === '3-Column' ? 3 : (columnGrid === '2-Column' ? 2 : 1);
    const pageSpec = { mode: 'single', pageAspect: '8.5 / 11', stageMaxW: '680px' };
    const brandTone = { bandAlpha: 0.66, borderAlpha: 0.64, badgeScale: 1.05 };

    const buildHeadline = () => {
        const cleaned = (prompt || '').trim();
        if (!cleaned) return 'Discover The Art of Modern Living';
        const words = cleaned.split(' ').filter(Boolean);
        return words.slice(0, 10).join(' ') + (words.length > 10 ? '...' : '');
    };

    const buildSubheadline = () => {
        return 'A clean, magazine-style advertorial layout designed for credibility and conversion.';
    };

    const buildBody = () => {
        const base = (prompt || '').trim();
        return (base.length ? base : 'This advertorial blends editorial storytelling with product-forward clarity.').slice(0, 600);
    };

    const headline = articleHeader.trim() || buildHeadline();
    const subheadline = buildSubheadline();
    const body = articleBody.trim() || buildBody();

    const heroImage = orderedImages[0] || null;
    const secondaryImage = orderedImages[1] || null;
    const tertiaryImage = orderedImages[2] || null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn text-white relative">
            <div className="lg:col-span-1 bg-gray-800 rounded-lg p-5 overflow-y-auto space-y-5 border border-gray-700 shadow-xl custom-scrollbar">
                <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2"><span>📰</span> Advertorial Studio</h2>
                    <div className="flex items-center gap-3 bg-gray-900 px-2 py-1 rounded border border-gray-700">
                        <span className={`text-[10px] font-bold uppercase ${layoutMode === 'ai' ? 'text-purple-500' : 'text-gray-500'}`}>
                            {layoutMode === 'ai' ? 'AI Layout' : 'Automation'}
                        </span>
                        <button onClick={() => setLayoutMode(layoutMode === 'ai' ? 'automation' : 'ai')} className={`w-8 h-4 rounded-full relative transition-colors ${layoutMode === 'ai' ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-700'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${layoutMode === 'ai' ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-gray-400">Layout Assets</label>
                        <div className="flex gap-1">
                            <button onClick={handleAutoLoad} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">+ Add Images</button>
                            <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-white flex items-center justify-center"><UploadIcon /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 min-h-[80px] bg-gray-900 rounded-lg p-2 border border-gray-700">
                        {inputImages.map(img => (
                            <div key={img.id} className="relative group aspect-square bg-black rounded overflow-hidden border border-gray-700">
                                <img src={img.url} className="w-full h-full object-cover" alt="" />
                                <button onClick={() => setInputImages(p => p.filter(i => i.id !== img.id))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-400">Creative Brief</label>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the advertorial concept..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white focus:border-red-500 outline-none h-20" />
                </div>

                {layoutMode === 'ai' && (
                    <div className="grid grid-cols-3 gap-2 border-b border-gray-700 pb-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Model</label>
                            <select value={settings.model} onChange={(e) => setSettings({ ...settings, model: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none">
                                <option value="v1">v1 (Azure)</option>
                                <option value="v2">V2 (Nano Banana)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Resolution</label>
                            <select value={settings.resolution} onChange={(e) => setSettings({ ...settings, resolution: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none">
                                <option value="1K">1K</option>
                                <option value="2K">2K</option>
                                <option value="4K">4K</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Person Gen</label>
                            <select value={settings.safety_level} onChange={(e) => setSettings({ ...settings, safety_level: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none">
                                <option value="allow_all">Allow All</option>
                                <option value="allow_adults">Adults Only</option>
                                <option value="block_all">Block All</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="space-y-3 bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Article Content</label>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Article Header</label>
                        <input type="text" value={articleHeader} onChange={e => setArticleHeader(e.target.value)} placeholder="Headline..." className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Article Body</label>
                        <textarea value={articleBody} onChange={e => setArticleBody(e.target.value)} placeholder="Use **bold**..." className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none h-28 resize-none" />
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Column Grid</label>
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
                        {layoutMode === 'ai' && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Aspect Ratio</label>
                                <select 
                                    value={settings.aspectRatio} 
                                    onChange={(e) => setSettings({...settings, aspectRatio: e.target.value})}
                                    className="w-full bg-gray-900 border border-gray-700 rounded py-1.5 px-2 text-[10px] font-bold text-white outline-none"
                                >
                                    {["1:1", "3:2", "2:3", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9"].map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {layoutMode === 'ai' && (
                        <div className="space-y-3">
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Temp</label><span className="text-[10px] font-mono text-red-400">{settings.temperature}</span></div>
                                    <input type="range" min="0" max="2" step="0.1" value={settings.temperature} onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center"><label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Top-P</label><span className="text-[10px] font-mono text-red-400">{settings.top_p}</span></div>
                                    <input type="range" min="0.01" max="1" step="0.01" value={settings.top_p} onChange={(e) => setSettings({ ...settings, top_p: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={handleGenerate} disabled={isProcessing} className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${isProcessing ? 'bg-gray-700' : 'bg-gradient-to-r from-red-700 to-red-600 shadow-lg shadow-red-900/40'}`}>
                    {isProcessing ? 'Synthesizing...' : (layoutMode === 'ai' && !articleHeader.trim() ? '📝 Generate Article Content' : '✨ Generate Advertorial')}
                </button>
            </div>

            <div className="lg:col-span-2 flex flex-col h-full bg-gray-800 rounded-lg p-4 shadow-2xl overflow-hidden border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">
                        {layoutMode === 'ai' ? 'AI Layout Simulation' : 'Magazine Simulation'}
                    </h3>
                    {resultImages.length > 0 && !isProcessing && (
                        <div className="flex gap-2">
                            <button onClick={() => setRefineModal({ ...refineModal, isOpen: true })} className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-[10px] font-black uppercase py-2 px-4 rounded border border-gray-600 transition-all">⚡ Refine</button>
                            <button onClick={() => onPushToDAM && onPushToDAM({ path: orderedImages[0] || resultImages[0], name: `Advertorial_Final.png`, type: "image/png", thumbnail: orderedImages[0] || resultImages[0], created_at: new Date() })} className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase py-2 px-4 rounded shadow-lg transition-all">🚀 Publish to DAM</button>
                        </div>
                    )}
                </div>

                <div className="flex-1 rounded-lg relative overflow-hidden custom-scrollbar bg-[#0a0a0a]">
                    {(isProcessing || boxesRefining.some(b => b)) ? (
                        <ProcessingSkeleton pageSpec={pageSpec} processingStep={processingStep} layoutMode={layoutMode} />
                    ) : (
                        <>
                            {layoutMode === 'ai' && resultImages.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4 w-full h-full animate-fadeIn p-4 overflow-y-auto">
                                    {resultImages.map((imgUrl, index) => (
                                        <div key={index} className="relative group bg-white shadow-2xl border border-gray-700 rounded overflow-hidden flex flex-col aspect-[8.5/11]">
                                            <div className="flex-1 flex items-center justify-center overflow-hidden bg-black relative">
                                                <img src={imgUrl} className="max-w-full max-h-full object-contain" alt={`AI Variant ${index + 1}`} />
                                            </div>
                                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                <button onClick={() => onPushToDAM({ path: imgUrl, name: `AI_Advertorial_v${index + 1}.png`, type: "image/png", thumbnail: imgUrl, created_at: new Date() })} className="w-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold py-1.5 rounded shadow-lg transition-all flex items-center justify-center gap-1">🚀 Push to DAM</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <MagazinePreview
                                    pageSpec={pageSpec}
                                    brandTone={brandTone}
                                    pageSize={pageSize}
                                    columnCount={columnCount}
                                    headline={headline}
                                    subheadline={subheadline}
                                    body={body}
                                    heroImage={heroImage}
                                    secondaryImage={secondaryImage}
                                    tertiaryImage={tertiaryImage}
                                    orderedImages={orderedImages}
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {refineModal.isOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 flex justify-between items-center text-white">
                            ✨ Refine Layouts
                            <button onClick={() => setRefineModal({ ...refineModal, isOpen: false })} className="text-gray-400 hover:text-white">✕</button>
                        </h3>
                        <div className="mb-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Refinement Prompt</label>
                            <textarea value={refineModal.prompt} onChange={(e) => setRefineModal({ ...refineModal, prompt: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white h-32 outline-none focus:border-red-500" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setRefineModal({ ...refineModal, isOpen: false })} className="px-4 py-2 rounded text-sm text-gray-400 hover:bg-gray-700">Cancel</button>
                            <button onClick={handleRefineAll} className="px-4 py-2 rounded text-sm bg-red-600 hover:bg-red-500 text-white font-bold">🚀 Run Refinement</button>
                        </div>
                    </div>
                </div>
            )}

            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleLocalUpload} />

            <style>{`
                .skeleton-shimmer { animation: shimmer 1.5s infinite; }
                @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
            `}</style>
        </div>
    );
}

export default Advertorial;