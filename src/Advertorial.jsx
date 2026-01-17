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

    // Split into lines first to preserve newlines
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

function ProcessingSkeleton({ pageSpec, processingStep }) {
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
    index,
    brandTone,
    onDragOver,
    onDropAt,
    onSwapDragStart,
    onNudgeTransform,
    transform,
    onBeginPan,
    onPanMove,
    onEndPan,
    panState,
}) {
    const isPanning = panState && panState.isPanning && panState.src === src;

    return (
        <div
            className="relative overflow-hidden rounded-lg group"
            onDragOver={onDragOver}
            onDrop={(e) => onDropAt(e, index)}
            style={{
                border: `1px solid rgba(0,0,0,${0.12 + brandTone.borderAlpha * 0.12})`,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))',
            }}
        >
            <div className={tall ? 'aspect-[5/6]' : 'aspect-[16/9]'}>
                {src ? (
                    <div
                        className="w-full h-full cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => onBeginPan(e, src)}
                        onPointerMove={onPanMove}
                        onPointerUp={onEndPan}
                        onPointerCancel={onEndPan}
                        onPointerLeave={onEndPan}
                        style={{ touchAction: 'none' }}
                    >
                        <img
                            src={src}
                            alt=""
                            draggable={false}
                            className="w-full h-full object-cover select-none"
                            style={{
                                transformOrigin: 'center',
                                transform: `translate(${(transform && transform.x) || 0}px, ${(transform && transform.y) || 0}px) scale(${(transform && transform.scale) || 1})`,
                                transition: isPanning ? 'none' : 'transform 120ms ease-out',
                                willChange: 'transform',
                            }}
                        />
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="text-[9px] font-black uppercase tracking-[0.26em]" style={{ color: 'rgba(0,0,0,0.42)' }}>
                                {label}
                            </div>
                            <div className="mt-2 text-[10px]" style={{ color: 'rgba(0,0,0,0.5)' }}>
                                Drop an image here
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

            {/* Swap handle */}
            <div
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                draggable
                onDragStart={(e) => onSwapDragStart(e, index)}
                title="Drag to swap"
                style={{
                    background: 'rgba(255,255,255,0.82)',
                    border: '1px solid rgba(0,0,0,0.10)',
                    borderRadius: 8,
                    padding: '4px 6px',
                    cursor: 'grab',
                    userSelect: 'none',
                }}
            >
                <div className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(0,0,0,0.75)' }}>↔</div>
            </div>

            {/* Pan/zoom controls */}
            {src && (
                <div className="absolute left-2 bottom-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={() => onNudgeTransform(src, { scale: ((transform && transform.scale) || 1) + 0.08 })}
                        className="text-[10px] font-black px-2 py-1 rounded"
                        style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(0,0,0,0.10)', color: 'rgba(0,0,0,0.75)' }}
                        title="Zoom in"
                    >
                        ＋
                    </button>
                    <button
                        type="button"
                        onClick={() => onNudgeTransform(src, { scale: Math.max(0.6, ((transform && transform.scale) || 1) - 0.08) })}
                        className="text-[10px] font-black px-2 py-1 rounded"
                        style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(0,0,0,0.10)', color: 'rgba(0,0,0,0.75)' }}
                        title="Zoom out"
                    >
                        －
                    </button>
                    <button
                        type="button"
                        onClick={() => onNudgeTransform(src, { x: 0, y: 0, scale: 1 })}
                        className="text-[10px] font-black px-2 py-1 rounded"
                        style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(0,0,0,0.10)', color: 'rgba(0,0,0,0.75)' }}
                        title="Reset"
                    >
                        ⟲
                    </button>
                </div>
            )}
        </div>
    );
}

function MagazinePage({
    pageSpec,
    brandTone,
    layoutPreset,
    pageSize,
    columnCount,
    headline,
    subheadline,
    body,
    heroImage,
    secondaryImage,
    tertiaryImage,
    orderedImages,
    onDragOver,
    onDropAt,
    onSwapDragStart,
    imageTransforms,
    onNudgeTransform,
    onBeginPan,
    onPanMove,
    onEndPan,
    panState,
}) {
    const isMinimal = layoutPreset === 'Minimal';
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
                            <ImageFrame
                                src={heroImage}
                                label="Hero"
                                index={0}
                                brandTone={brandTone}
                                onDragOver={onDragOver}
                                onDropAt={onDropAt}
                                onSwapDragStart={onSwapDragStart}
                                onNudgeTransform={onNudgeTransform}
                                transform={imageTransforms[heroImage] || { x: 0, y: 0, scale: 1 }}
                                onBeginPan={onBeginPan}
                                onPanMove={onPanMove}
                                onEndPan={onEndPan}
                                panState={panState}
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
                                index={1}
                                brandTone={brandTone}
                                onDragOver={onDragOver}
                                onDropAt={onDropAt}
                                onSwapDragStart={onSwapDragStart}
                                onNudgeTransform={onNudgeTransform}
                                transform={secondaryImage ? (imageTransforms[secondaryImage] || { x: 0, y: 0, scale: 1 }) : { x: 0, y: 0, scale: 1 }}
                                onBeginPan={onBeginPan}
                                onPanMove={onPanMove}
                                onEndPan={onEndPan}
                                panState={panState}
                            />
                            {columnCount >= 2 && (
                                <ImageFrame
                                    src={tertiaryImage}
                                    label="Texture"
                                    tall={columnCount === 3}
                                    index={2}
                                    brandTone={brandTone}
                                    onDragOver={onDragOver}
                                    onDropAt={onDropAt}
                                    onSwapDragStart={onSwapDragStart}
                                    onNudgeTransform={onNudgeTransform}
                                    transform={tertiaryImage ? (imageTransforms[tertiaryImage] || { x: 0, y: 0, scale: 1 }) : { x: 0, y: 0, scale: 1 }}
                                    onBeginPan={onBeginPan}
                                    onPanMove={onPanMove}
                                    onEndPan={onEndPan}
                                    panState={panState}
                                />
                            )}
                            {columnCount === 3 && (
                                <ImageFrame
                                    src={orderedImages[3]}
                                    label="Alt"
                                    tall
                                    index={3}
                                    brandTone={brandTone}
                                    onDragOver={onDragOver}
                                    onDropAt={onDropAt}
                                    onSwapDragStart={onSwapDragStart}
                                    onNudgeTransform={onNudgeTransform}
                                    transform={orderedImages[3] ? (imageTransforms[orderedImages[3]] || { x: 0, y: 0, scale: 1 }) : { x: 0, y: 0, scale: 1 }}
                                    onBeginPan={onBeginPan}
                                    onPanMove={onPanMove}
                                    onEndPan={onEndPan}
                                    panState={panState}
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
    layoutPreset,
    pageSize,
    columnCount,
    headline,
    subheadline,
    body,
    heroImage,
    secondaryImage,
    tertiaryImage,
    orderedImages,
    onDragOver,
    onDropAt,
    onSwapDragStart,
    imageTransforms,
    onNudgeTransform,
    onBeginPan,
    onPanMove,
    onEndPan,
    panState,
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

            // Kill the annoying micro "zoom-out" when typing causes tiny layout shifts
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
                                    layoutPreset={layoutPreset}
                                    pageSize={pageSize}
                                    columnCount={columnCount}
                                    headline={headline}
                                    subheadline={subheadline}
                                    body={body}
                                    heroImage={heroImage}
                                    secondaryImage={secondaryImage}
                                    tertiaryImage={tertiaryImage}
                                    orderedImages={orderedImages}
                                    onDragOver={onDragOver}
                                    onDropAt={onDropAt}
                                    onSwapDragStart={onSwapDragStart}
                                    imageTransforms={imageTransforms}
                                    onNudgeTransform={onNudgeTransform}
                                    onBeginPan={onBeginPan}
                                    onPanMove={onPanMove}
                                    onEndPan={onEndPan}
                                    panState={panState}
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
    const [pageSize] = useState('Full Page');
    const [columnGrid, setColumnGrid] = useState('2-Column');

    // Interactive Layout State
    const [orderedImages, setOrderedImages] = useState([]);
    const [draggedIndex, setDraggedIndex] = useState(null);

    // Dynamic per-image transforms (pan/zoom)
    const [imageTransforms, setImageTransforms] = useState({});
    const panRef = useRef({ isPanning: false, src: null, startX: 0, startY: 0, baseX: 0, baseY: 0, pointerId: null });
    const [panState, setPanState] = useState({ isPanning: false, src: null });

    const [settings, setSettings] = useState({
        model: 'v2',
        resolution: '300 DPI',
    });

    const fileInputRef = useRef(null);
    const lastBaseRef = useRef([]);

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

    // Keep order stable across updates (do not hard-reset on every state change)
    useEffect(() => {
        const base = inputImages.length > 0 ? inputImages.map(img => img.url) : resultImages;
        const prevBase = lastBaseRef.current;

        const same = prevBase.length === base.length && prevBase.every((u, i) => u === base[i]);
        if (same) return;

        lastBaseRef.current = base;

        setOrderedImages((prev) => {
            const prevSet = new Set(prev);
            const baseSet = new Set(base);

            const kept = prev.filter(u => baseSet.has(u));
            const add = base.filter(u => !prevSet.has(u));
            const next = [...kept, ...add];
            return next.length ? next : base;
        });

        setImageTransforms((prev) => {
            const next = { ...prev };
            base.forEach((u) => {
                if (u && !next[u]) next[u] = { x: 0, y: 0, scale: 1 };
            });
            Object.keys(next).forEach((k) => {
                if (!base.includes(k)) delete next[k];
            });
            return next;
        });
    }, [inputImages, resultImages]);

    const handleDragOver = (e) => {
        e.preventDefault();
        try { e.dataTransfer.dropEffect = 'move'; } catch { }
    };

    // Swap drag start (from handle)
    const handleSwapDragStart = (e, index) => {
        setDraggedIndex(index);
        try {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('application/x-advertorial-index', String(index));
        } catch { }
    };

    // Thumbnail drag start (from asset tile)
    const handleThumbDragStart = (e, url) => {
        try {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('application/x-advertorial-url', url);
            e.dataTransfer.setData('text/plain', url);
        } catch { }
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();

        // Prefer swap if present
        let idxStr = '';
        try { idxStr = e.dataTransfer.getData('application/x-advertorial-index') || ''; } catch { }
        const idx = idxStr !== '' ? Number(idxStr) : draggedIndex;

        if (idx !== null && idx !== undefined && !Number.isNaN(idx) && idx !== dropIndex) {
            setOrderedImages((prev) => {
                const next = [...prev];
                while (next.length <= Math.max(idx, dropIndex)) next.push(null);
                const tmp = next[idx];
                next[idx] = next[dropIndex];
                next[dropIndex] = tmp;
                return next;
            });
            setDraggedIndex(null);
            return;
        }

        // Otherwise place a dropped url into the slot
        let url = '';
        try {
            url = e.dataTransfer.getData('application/x-advertorial-url') || e.dataTransfer.getData('text/plain') || '';
        } catch { }
        if (!url) return;

        setOrderedImages((prev) => {
            const next = [...prev];
            while (next.length <= dropIndex) next.push(null);

            const existingIndex = next.findIndex((u) => u === url);
            if (existingIndex >= 0 && existingIndex !== dropIndex) {
                const tmp = next[dropIndex];
                next[dropIndex] = url;
                next[existingIndex] = tmp;
                return next;
            }

            next[dropIndex] = url;
            return next;
        });

        setImageTransforms((prev) => {
            if (prev[url]) return prev;
            return { ...prev, [url]: { x: 0, y: 0, scale: 1 } };
        });
    };

    const handleNudgeTransform = (src, patch) => {
        if (!src) return;
        setImageTransforms((prev) => {
            const cur = prev[src] || { x: 0, y: 0, scale: 1 };
            const next = {
                ...prev,
                [src]: {
                    x: patch && patch.x !== undefined ? patch.x : cur.x,
                    y: patch && patch.y !== undefined ? patch.y : cur.y,
                    scale: patch && patch.scale !== undefined ? patch.scale : cur.scale,
                }
            };
            return next;
        });
    };

    const handleBeginPan = (e, src) => {
        if (!src) return;
        try { e.currentTarget.setPointerCapture(e.pointerId); } catch { }

        const cur = imageTransforms[src] || { x: 0, y: 0, scale: 1 };
        panRef.current = {
            isPanning: true,
            src,
            startX: e.clientX,
            startY: e.clientY,
            baseX: cur.x || 0,
            baseY: cur.y || 0,
            pointerId: e.pointerId,
        };
        setPanState({ isPanning: true, src });
    };

    const handlePanMove = (e) => {
        if (!panRef.current.isPanning) return;
        if (panRef.current.pointerId !== e.pointerId) return;

        const dx = e.clientX - panRef.current.startX;
        const dy = e.clientY - panRef.current.startY;
        const src = panRef.current.src;

        setImageTransforms((prev) => {
            const cur = prev[src] || { x: 0, y: 0, scale: 1 };
            return {
                ...prev,
                [src]: {
                    ...cur,
                    x: panRef.current.baseX + dx,
                    y: panRef.current.baseY + dy,
                }
            };
        });
    };

    const handleEndPan = () => {
        if (!panRef.current.isPanning) return;
        panRef.current.isPanning = false;
        panRef.current.src = null;
        panRef.current.pointerId = null;
        setPanState({ isPanning: false, src: null });
    };

    const handleGenerate = async () => {
        if (inputImages.length === 0) return alert("Please add images first.");
        setIsProcessing(true);
        setResultImages([]);
        setProcessingStep(0);

        try {
            setProcessingStep(0);
            const contentResponse = await fetch('http://localhost:5001/generate-advertorial', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brief: prompt,
                    layout_preset: layoutPreset,
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
            setProcessingStep(0);
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

                // carry transform forward to refined URL
                setImageTransforms((prev) => {
                    const next = { ...prev };
                    if (prev[url] && !next[refinedUrl]) next[refinedUrl] = prev[url];
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

    // --- HELPERS & COMPUTED VALUES ---
    const columnCount = columnGrid === '3-Column' ? 3 : (columnGrid === '2-Column' ? 2 : 1);

    const getPageSpec = () => {
        // Full Page only
        return { mode: 'single', pageAspect: '8.5 / 11', stageMaxW: '680px' };
    };

    const getBrandTone = () => {
        return {
            bandAlpha: 0.66,
            borderAlpha: 0.64,
            badgeScale: 1.05,
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

        const targetChars = Math.round(520 + (0.6 * 1450));
        const combined = `${seed} ${filler} ${seed}`.replace(/\s+/g, ' ');
        return combined.slice(0, Math.min(combined.length, targetChars)).trim();
    };

    const pageSpec = getPageSpec();
    const brandTone = getBrandTone();

    const headline = articleHeader.trim() || buildHeadline();
    const subheadline = buildSubheadline();
    const body = articleBody.trim() || buildBody();

    const heroImage = orderedImages[0] || null;
    const secondaryImage = orderedImages[1] || null;
    const tertiaryImage = orderedImages[2] || null;

    // --- MAIN RENDER ---
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] animate-fadeIn text-white relative">
            {/* LEFT SIDEBAR */}
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
                            <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="bg-gray-700 hover:bg-gray-600 p-1 rounded text-white flex items-center justify-center"><UploadIcon /></button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 min-h-[80px] bg-gray-900 rounded-lg p-2 border border-gray-700">
                        {inputImages.map(img => (
                            <div
                                key={img.id}
                                className="relative group aspect-square bg-black rounded overflow-hidden border border-gray-700"
                                draggable
                                onDragStart={(e) => handleThumbDragStart(e, img.url)}
                                title="Drag into layout to place"
                            >
                                <img src={img.url} className="w-full h-full object-cover" alt="" draggable={false} />
                                <button
                                    onClick={() => setInputImages(p => p.filter(i => i.id !== img.id))}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Creative Brief */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-400">Creative Brief</label>
                    <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the advertorial concept, brand message, or campaign direction..." className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm text-white focus:border-red-500 outline-none h-20" />
                </div>

                {/* Article Header & Body */}
                <div className="space-y-3 bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Article Content</label>
                        <span className="text-[9px] text-gray-600">Supports **bold**</span>
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
                            placeholder="Use **bold** anywhere in here..."
                            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-red-500 outline-none h-28 resize-none"
                        />
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

                    <div className="text-[10px] text-gray-500 leading-snug bg-gray-900/40 border border-gray-700 rounded p-3">
                        <div className="font-black uppercase tracking-widest text-gray-600 mb-1">Dynamic Interaction</div>
                        <div>• Drag thumbnails into frames</div>
                        <div>• Drag ↔ handle to swap</div>
                        <div>• Drag on image to pan</div>
                        <div>• Use ＋/－/⟲ to zoom & reset</div>
                    </div>
                </div>

                {/* Generate Button */}
                <button onClick={handleGenerate} disabled={isProcessing} className={`w-full py-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${isProcessing ? 'bg-gray-700' : 'bg-gradient-to-r from-red-700 to-red-600 shadow-lg shadow-red-900/40'}`}>
                    {isProcessing ? 'Synthesizing...' : '✨ Generate Advertorial'}
                </button>
            </div>

            {/* RIGHT PANEL */}
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
                                onClick={() => onPushToDAM && onPushToDAM({ path: orderedImages[0] || resultImages[0], name: `Advertorial_Final.png`, type: "image/png", thumbnail: orderedImages[0] || resultImages[0], created_at: new Date() })}
                                className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase py-2 px-4 rounded shadow-lg transition-all flex items-center gap-1"
                            >
                                🚀 Publish to DAM
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 rounded-lg relative overflow-hidden custom-scrollbar bg-[radial-gradient(#222_1px,transparent_1px)] [background-size:20px_20px]" style={{ background: '#0a0a0a' }}>
                    {!isProcessing && resultImages.length === 0 && (
                        <div className="absolute inset-0">
                            <MagazinePreview
                                pageSpec={pageSpec}
                                brandTone={brandTone}
                                layoutPreset={layoutPreset}
                                pageSize={pageSize}
                                columnCount={columnCount}
                                headline={headline}
                                subheadline={subheadline}
                                body={body}
                                heroImage={heroImage}
                                secondaryImage={secondaryImage}
                                tertiaryImage={tertiaryImage}
                                orderedImages={orderedImages}
                                onDragOver={handleDragOver}
                                onDropAt={handleDrop}
                                onSwapDragStart={handleSwapDragStart}
                                imageTransforms={imageTransforms}
                                onNudgeTransform={handleNudgeTransform}
                                onBeginPan={handleBeginPan}
                                onPanMove={handlePanMove}
                                onEndPan={handleEndPan}
                                panState={panState}
                            />
                        </div>
                    )}

                    {(isProcessing || boxesRefining.some(b => b)) && (
                        <div className="absolute inset-0">
                            <ProcessingSkeleton pageSpec={pageSpec} processingStep={processingStep} />
                        </div>
                    )}

                    {resultImages.length > 0 && !isProcessing && !boxesRefining.some(b => b) && (
                        <div className="absolute inset-0">
                            <MagazinePreview
                                pageSpec={pageSpec}
                                brandTone={brandTone}
                                layoutPreset={layoutPreset}
                                pageSize={pageSize}
                                columnCount={columnCount}
                                headline={headline}
                                subheadline={subheadline}
                                body={body}
                                heroImage={heroImage}
                                secondaryImage={secondaryImage}
                                tertiaryImage={tertiaryImage}
                                orderedImages={orderedImages}
                                onDragOver={handleDragOver}
                                onDropAt={handleDrop}
                                onSwapDragStart={handleSwapDragStart}
                                imageTransforms={imageTransforms}
                                onNudgeTransform={handleNudgeTransform}
                                onBeginPan={handleBeginPan}
                                onPanMove={handlePanMove}
                                onEndPan={handleEndPan}
                                panState={panState}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Refinement Modal */}
            {refineModal.isOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-gray-800 rounded-lg border border-gray-600 shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4 flex justify-between items-center text-white">
                            ✨ Refine Layouts
                            <button onClick={() => setRefineModal({ ...refineModal, isOpen: false })} className="text-gray-400 hover:text-white">✕</button>
                        </h3>
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

            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleLocalUpload} />

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
