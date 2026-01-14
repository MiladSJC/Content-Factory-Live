import React, { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Search, Share2, Users, Download, Edit3, Trash2, Eye, Filter, Grid, List, Clock, Tag, Folder, ChevronRight, ChevronDown, Star, MessageSquare, Link2, RefreshCw, CheckSquare, Square, MoreVertical, X, Plus, UserPlus, Bell, Settings, BarChart3, Zap, Globe, MapPin } from "lucide-react";

const niceDate = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d);
    const now = new Date();
    const diff = now - dt;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
};

// Enhanced Asset Card with Collaboration Features
const AssetCard = ({ asset, checked, onToggle, onOpen, onEdit, onDelete, onShare, onComment, viewMode, isShared, annotationCount = 0 }) => {
  const [showActions, setShowActions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  if (showHistory && asset.history?.length > 0) {
    return (
      <div className="col-span-full bg-gray-900/90 border-2 border-blue-500/30 rounded-3xl p-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <RefreshCw size={20} className="text-blue-500" /> Version History: {asset.name}
          </h3>
          <button
            onClick={() => setShowHistory(false)}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-xs font-bold transition-all"
          >
            Back to Library
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Latest Version (Current)</p>
            <div className="w-full h-64 bg-black rounded-2xl overflow-hidden border border-blue-500/50 shadow-2xl flex items-center justify-center p-2">
              <img src={asset.thumbnail || asset.path} alt="Current" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <p className="text-sm font-bold text-white">{asset.name}</p>
              <p className="text-xs text-gray-400">{niceDate(asset.created_at)}</p>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Previous Version</p>
            <div className="w-full h-64 bg-black rounded-2xl overflow-hidden border border-gray-700 flex items-center justify-center p-2">
              <img src={asset.history[0].thumbnail || asset.history[0].path} alt="Previous" className="max-w-full max-h-full object-contain opacity-60" />
            </div>
            <div className="p-4 bg-gray-800/50 rounded-xl opacity-60">
              <p className="text-sm font-bold text-white">{asset.history[0].name}</p>
              <p className="text-xs text-gray-400">{niceDate(asset.history[0].created_at)}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4 hover:border-red-500/50 transition-all duration-300 flex items-center gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(asset)}
          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
        />
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800 relative">
          {asset.thumbnail ? (
            <img src={asset.thumbnail} alt={asset.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">📄</div>
          )}
          {isShared && <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full" />}

          {annotationCount > 0 && (
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-red-600/90 rounded-md flex items-center gap-1 border border-white/10">
              <MapPin size={12} className="text-white" />
              <span className="text-[10px] font-black text-white">{annotationCount}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-white truncate">{asset.name}</h4>
          <p className="text-xs text-gray-400">{asset.type || "unknown"} • {asset.size || "0 KB"}</p>
        </div>
        <div className="flex items-center gap-2">
          {asset.tags?.slice(0, 2).map((t, i) => (
            <span key={i} className="px-2 py-1 bg-red-600/10 text-red-400 rounded-md text-[10px] font-bold">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onOpen(asset)} className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-all" title="View Asset">
            <Eye size={16} />
          </button>
          <button onClick={() => onShare(asset)} className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-all">
            <Share2 size={16} />
          </button>
          <button onClick={() => onComment(asset)} className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400 transition-all">
            <MessageSquare size={16} />
          </button>
          <button onClick={() => onEdit(asset)} className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg text-yellow-400 transition-all">
            <Edit3 size={16} />
          </button>
          <button onClick={() => onDelete(asset)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-1">
      <div className="relative h-64 flex items-center justify-center bg-white p-2">
        {asset.thumbnail ? (
          <img src={asset.thumbnail} alt={asset.name} onClick={() => onOpen(asset)} className="max-w-full max-h-full object-contain cursor-pointer transition-transform group-hover:scale-[1.02]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">📄</div>
        )}

        <div className="absolute top-3 left-3 flex gap-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onToggle(asset)}
            className="w-5 h-5 rounded-md border-gray-600 bg-gray-900/80 backdrop-blur-md text-red-600 focus:ring-red-500 cursor-pointer"
          />
          {isShared && (
            <div className="px-2 py-1 bg-blue-500/90 backdrop-blur-md rounded-md flex items-center gap-1">
              <Users size={12} className="text-white" />
              <span className="text-[10px] font-bold text-white">SHARED</span>
              {annotationCount > 0 && (
                <div className="px-2 py-1 bg-red-600/90 backdrop-blur-md rounded-md flex items-center gap-1 border border-white/10">
                  <MapPin size={12} className="text-white" />
                  <span className="text-[10px] font-bold text-white">{annotationCount}</span>
                </div>
              )}
            </div>
          )}
          {annotationCount > 0 && (
            <div className="px-2 py-1 bg-red-600/90 backdrop-blur-md rounded-md flex items-center gap-1 border border-white/10">
              <MapPin size={12} className="text-white" />
              <span className="text-[10px] font-bold text-white">{annotationCount}</span>
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setShowActions(!showActions)} className="p-2 bg-gray-900/80 backdrop-blur-md rounded-full hover:bg-gray-800 transition-all">
            <MoreVertical size={16} className="text-white" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-10">
              <button onClick={() => { onOpen(asset); setShowActions(false); }} className="w-full px-4 py-3 text-left text-xs hover:bg-gray-800 flex items-center gap-3 text-white transition-colors">
                <Eye size={14} /> Open Asset
              </button>
              <button onClick={() => { onShare(asset); setShowActions(false); }} className="w-full px-4 py-3 text-left text-xs hover:bg-gray-800 flex items-center gap-3 text-blue-400 transition-colors">
                <Share2 size={14} /> Share
              </button>
              <button onClick={() => { onComment(asset); setShowActions(false); }} className="w-full px-4 py-3 text-left text-xs hover:bg-gray-800 flex items-center gap-3 text-purple-400 transition-colors">
                <MessageSquare size={14} /> Comments
              </button>
              <button onClick={() => { onEdit(asset); setShowActions(false); }} className="w-full px-4 py-3 text-left text-xs hover:bg-gray-800 flex items-center gap-3 text-yellow-400 transition-colors">
                <Edit3 size={14} /> Edit Metadata
              </button>
              <div className="border-t border-gray-800"></div>
              <button onClick={() => { onDelete(asset); setShowActions(false); }} className="w-full px-4 py-3 text-left text-xs hover:bg-gray-800 flex items-center gap-3 text-red-400 transition-colors">
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <button onClick={() => onOpen(asset)} className="flex-1 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-bold transition-all flex items-center justify-center gap-2">
            <Eye size={14} /> View
          </button>
          <button onClick={() => onShare(asset)} className="p-2 bg-blue-500/80 hover:bg-blue-500 backdrop-blur-md rounded-lg text-white transition-all">
            <Share2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h4 className="font-bold text-white truncate text-sm group-hover:text-red-400 transition-colors">{asset.name}</h4>
          <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
            <span>{asset.type || "unknown"}</span>
            <span>•</span>
            <span>{asset.size || "0 KB"}</span>
          </p>
        </div>

        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {asset.tags.slice(0, 3).map((t, i) => (
              <span key={i} className="px-2 py-1 bg-red-600/10 text-red-400 rounded-md text-[10px] font-bold border border-red-600/20">
                {t}
              </span>
            ))}
            {asset.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-700/50 text-gray-400 rounded-md text-[10px] font-bold">
                +{asset.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <Clock size={10} /> {niceDate(asset.created_at)}
          </span>
          <div className="flex items-center gap-3">
            {asset.history?.length > 0 && (
              <button
                onClick={() => setShowHistory(true)}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-black transition-colors"
                title="View previous versions"
              >
                <RefreshCw size={10} /> VERSION HISTORY
              </button>
            )}
            {asset.comments?.length > 0 && (
              <span className="text-[10px] text-purple-400 flex items-center gap-1">
                <MessageSquare size={10} /> {asset.comments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Collapsible Tree Node Component
const TreeNode = ({ node, level = 0, selectedCategory, onSelect, defaultCollapsed = true }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setCollapsed(!collapsed);
          onSelect(node.name);
        }}
        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${selectedCategory === node.name
            ? 'bg-red-600/20 text-red-500 border border-red-600/30'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
      >
        {hasChildren && (
          <span className="text-gray-500">
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </span>
        )}
        {!hasChildren && <span className="w-3.5"></span>}
        <Folder size={14} />
        <span className="flex-1">{node.name}</span>
        {node.count && <span className="text-[10px] text-gray-500">{node.count}</span>}
      </button>
      {hasChildren && !collapsed && (
        <div>
          {node.children.map((child, idx) => (
            <TreeNode
              key={idx}
              node={typeof child === 'string' ? { name: child } : child}
              level={level + 1}
              selectedCategory={selectedCategory}
              onSelect={onSelect}
              defaultCollapsed={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function DAM({ externalSharedAssets = [] }) {
  const [assets, setAssets] = useState([]);
  const [sharedAssets, setSharedAssets] = useState(externalSharedAssets);
  const [loading, setLoading] = useState(false);

  // Update shared assets if new items arrive from App state
  useEffect(() => {
    setSharedAssets(prev => {
      // Prevent duplicates by checking path
      const existingPaths = new Set(prev.map(a => a.path));
      const newItems = externalSharedAssets.filter(a => !existingPaths.has(a.path));
      return [...newItems, ...prev];
    });
  }, [externalSharedAssets]);


  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All Assets");
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(1);
  const [perPage] = useState(24);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(null);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [tags, setTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('my-assets');
  const fileInputRef = useRef(null);

  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [commentText, setCommentText] = useState("");

  // --- Annotations (Draw-to-Comment) + Pending Workflow (Session Only) ---
  const [annotationsByAsset, setAnnotationsByAsset] = useState({}); // { [assetPath]: [{id,x,y,text,rect,resolved}] }
  const [drawRect, setDrawRect] = useState(null); // { assetPath, x1,y1,x2,y2 } normalized
  const [draftAnnotation, setDraftAnnotation] = useState(null); // { assetPath, rect:{x1,y1,x2,y2}, cx, cy }
  const [draftText, setDraftText] = useState("");
  const [selectedAnnotationId, setSelectedAnnotationId] = useState(null);
  const [isModifying, setIsModifying] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState(new Set());
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const previewMediaRef = useRef(null);

  const getTargetDimensions = (naturalWidth, naturalHeight) => {
    const supportedRatios = {
      '1:1': 1.0, '3:2': 1.5, '2:3': 0.66, '3:4': 0.75, '4:3': 1.33,
      '4:5': 0.8, '5:4': 1.25, '9:16': 0.56, '16:9': 1.77, '21:9': 2.33
    };
    const dimensionMap = {
      '1:1': { w: 1024, h: 1024 }, '3:2': { w: 1248, h: 832 }, '2:3': { w: 832, h: 1248 },
      '3:4': { w: 896, h: 1152 }, '4:3': { w: 1152, h: 896 }, '4:5': { w: 896, h: 1088 },
      '5:4': { w: 1088, h: 896 }, '9:16': { w: 720, h: 1280 }, '16:9': { w: 1280, h: 720 },
      '21:9': { w: 1536, h: 640 }
    };

    const targetRatio = naturalWidth / naturalHeight;
    const closestRatio = Object.keys(supportedRatios).reduce((prev, curr) =>
      Math.abs(supportedRatios[curr] - targetRatio) < Math.abs(supportedRatios[prev] - targetRatio) ? curr : prev
    );

    return dimensionMap[closestRatio];
  };

  // Draft AI iterations (kept in Pending preview until user promotes)
  const [draftByOriginalPath, setDraftByOriginalPath] = useState({}); // { [originalPath]: refinedAsset }
  // Pending compare behavior: preview original vs refined, and only promote refined on "complete"
  const [activePreviewVariant, setActivePreviewVariant] = useState("original"); // "original" | "refined"
  const [promoteDraftOnComplete, setPromoteDraftOnComplete] = useState(false);

  const handleAIProcess = async () => {
    if (!currentAsset) return;

    setIsAIProcessing(true);
    setIsModifying(false);
    setSelectedAnnotationId(null);

    if (isLiveMode) {
      try {
        // Step 1: Detect Natural Dimensions
        const img = new Image();
        img.src = currentAsset.path;
        await new Promise(resolve => { img.onload = resolve; });
        const { w, h } = getTargetDimensions(img.naturalWidth, img.naturalHeight);

        // Step 2: Prepare Prompt
        const notesList = (annotationsByAsset[currentAsset.path] || [])
          .filter(n => selectedNotes.has(n.id))
          .map((n, i) => `${i + 1}- ${n.text}`)
          .join('\n');

        const livePrompt = `Keep everything intact, and do not touch and thing just apply the following changes \n${notesList}`;

        // Step 3: Send Correct Dimensions & Ratio
        const response = await fetch("/api/generate-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_path: currentAsset.path,
            product_name: currentAsset.name,
            server_version: "v2",
            custom_prompt: livePrompt,
            n: 1,
            width: w,
            height: h,
            resolution: "1K"
          }),
        });

        if (!response.ok) throw new Error("API Refinement Failed");
        const data = await response.json();
        const resultImage = data.images[0]; // Base64 result from Gemini

        const modifiedAsset = {
          ...currentAsset,
          id: `ai_live_${Date.now()}`,
          name: currentAsset.name.replace(/\.[^/.]+$/, "") + "_R.png",
          path: resultImage,
          thumbnail: resultImage,
          created_at: new Date(),
          tags: [...(currentAsset.tags || []), "AI-Live", "Gemini-Refined"],
          category: "AI-Generated",
          comments: [],
        };

        setDraftByOriginalPath((prev) => ({ ...prev, [currentAsset.path]: modifiedAsset }));
      } catch (err) {
        alert("Live AI Error: " + err.message);
      } finally {
        setIsAIProcessing(false);
        setSelectedNotes(new Set());
      }
      return;
    }

    // Simulated 3-second delay for Neural Synthesis processing UI
    setTimeout(() => {
      const originalPath = currentAsset.path || "";
      const dotIndex = originalPath.lastIndexOf(".");

      // Apply transformation naming convention: [filename]_R.[extension]
      const basePath = dotIndex !== -1 ? originalPath.substring(0, dotIndex) : originalPath;
      const extension = dotIndex !== -1 ? originalPath.substring(dotIndex) : "";

      const resultPath = basePath.endsWith("_R")
        ? `${basePath}${extension}`
        : `${basePath}_R${extension}`;

      // Build a robust refined name (don’t assume name extension matches path extension)
      const originalName = currentAsset.name || "";
      const nameDotIndex = originalName.lastIndexOf(".");
      const nameBase = nameDotIndex !== -1 ? originalName.substring(0, nameDotIndex) : originalName;
      const nameExt = nameDotIndex !== -1 ? originalName.substring(nameDotIndex) : extension;

      const resultName = nameBase.endsWith("_R")
        ? `${nameBase}${nameExt}`
        : `${nameBase}_R${nameExt}`;

      // Construct Iterated Asset Object
      const modifiedAsset = {
        ...currentAsset, // Inherit existing metadata
        id: `ai_iter_${Date.now()}`,
        name: resultName,
        path: resultPath,
        thumbnail: resultPath, // Point to pre-existing local refined asset in /public
        created_at: new Date(),
        tags: [...(currentAsset.tags || []), "AI-Modified", "Iterated"],
        category: "AI-Generated",
        comments: [], // Reset discussion for new version iteration
        sharedBy: null, // New asset starts as a local personal copy
        sharedDate: null,
      };

      // Store the refined version as a draft tied to the ORIGINAL pending asset (stay in preview)
      setDraftByOriginalPath((prev) => ({
        ...prev,
        [currentAsset.path]: modifiedAsset,
      }));

      setIsAIProcessing(false);
      setSelectedNotes(new Set());
    }, 3000);
  };

  const getActiveAnnotationCount = (assetPath) =>
    (annotationsByAsset[assetPath] || []).filter((n) => !n.resolved).length;

  const promoteDraftToShared = (originalPath) => {
    const draft = draftByOriginalPath[originalPath];
    if (!draft) return;

    setSharedAssets((prev) => {
      // Locate the original asset and capture its existing history
      const originalAsset = prev.find(a => a.path === originalPath);
      // Remove the original from the top-level list to prevent side-by-side duplicates
      const filtered = prev.filter(a => a.path !== originalPath);

      return [
        {
          ...draft,
          sharedBy: draft.sharedBy || "AI System",
          sharedDate: draft.sharedDate || new Date(),
          history: originalAsset ? [originalAsset, ...(originalAsset.history || [])] : []
        },
        ...filtered,
      ];
    });

    setDraftByOriginalPath((prev) => {
      if (!prev[originalPath]) return prev;
      const next = { ...prev };
      delete next[originalPath];
      return next;
    });
  };

  const draftRefinedAsset = currentAsset ? draftByOriginalPath[currentAsset.path] : null;

  const metroHierarchy = [
    {
      name: "Grocery",
      children: ["Dry Goods", "Dairy", "Frozen", "Beverages"],
      count: 142
    },
    {
      name: "Fresh",
      children: ["Produce", "Meat", "Bakery", "Deli", "Seafood"],
      count: 98
    },
    {
      name: "Private Label",
      children: ["Selection", "Irresistibles", "Life Smart"],
      count: 76
    },
    {
      name: "Seasonal",
      children: ["Holidays", "Summer BBQ", "Back to School", "Valentine's"],
      count: 54
    },
    {
      name: "Marketing",
      children: ["Flyer Assets", "In-Store Signage", "Social Media", "Email Campaigns"],
      count: 89
    },
    {
      name: "Brand Assets",
      children: ["Logos", "Typography", "Color Palettes", "Guidelines"],
      count: 32
    }
  ];

  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = () => {
    setLoading(true);

    // Simulate demo assets
    const demoAssets = [
      {
        path: "/assets/img1.jpg",
        name: "Metro Fresh Produce Banner.jpg",
        type: "image/jpeg",
        size: "2.4 MB",
        thumbnail: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
        tags: ["Produce", "Banner", "Fresh"],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        category: "Fresh",
        comments: [{ user: "Sarah M.", text: "Great composition!", date: new Date() }]
      },
      {
        path: "/assets/vid1.mp4",
        name: "Summer BBQ Campaign 30s.mp4",
        type: "video/mp4",
        size: "45.8 MB",
        thumbnail: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
        tags: ["Video", "Seasonal", "BBQ"],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        category: "Seasonal"
      },
      {
        path: "/assets/logo.png",
        name: "Metro Logo - Primary Red.png",
        type: "image/png",
        size: "856 KB",
        thumbnail: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=300&fit=crop",
        tags: ["Logo", "Brand", "Red"],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        category: "Brand Assets"
      },
      {
        path: "/assets/flyer.pdf",
        name: "Weekly Flyer - Week 42.pdf",
        type: "application/pdf",
        size: "8.2 MB",
        thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
        tags: ["Flyer", "Marketing", "Print"],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24),
        category: "Marketing"
      },
      {
        path: "/assets/dairy.jpg",
        name: "Irresistibles Cheese Selection.jpg",
        type: "image/jpeg",
        size: "3.1 MB",
        thumbnail: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop",
        tags: ["Dairy", "Private Label", "Cheese"],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
        category: "Grocery"
      },
      {
        path: "/assets/bakery.jpg",
        name: "Artisan Bread Display.jpg",
        type: "image/jpeg",
        size: "4.7 MB",
        thumbnail: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
        tags: ["Bakery", "Fresh", "Artisan"],
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        category: "Fresh"
      }
    ];

    const demoShared = [];

    setTimeout(() => {
      setAssets(demoAssets);
      // Merge demo data with any externally pushed assets
      setSharedAssets(prev => [...prev, ...demoShared]);
      const allTags = new Set();
      demoAssets.forEach((a) => (a.tags || []).forEach((t) => allTags.add(t)));
      setTags(Array.from(allTags).sort());
      setLoading(false);
    }, 800);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    setLoading(true);

    // Simulate upload
    setTimeout(() => {
      const newAssets = files.map((f, idx) => ({
        path: `/assets/${f.name}`,
        name: f.name,
        type: f.type,
        size: `${(f.size / 1024 / 1024).toFixed(2)} MB`,
        thumbnail: null,
        tags: [],
        created_at: new Date(),
        category: selectedCategory !== "All Assets" ? selectedCategory : "Uncategorized"
      }));
      setAssets([...newAssets, ...assets]);
      setLoading(false);
    }, 1000);
  };

  const toggleSelect = (asset) => {
    const next = new Set(selected);
    if (next.has(asset.path)) next.delete(asset.path);
    else next.add(asset.path);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === currentPageAssets.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(currentPageAssets.map(a => a.path)));
    }
  };
  const handleOpen = (asset) => {
    setCurrentAsset(asset);
    setActivePreviewVariant("original");
    setPromoteDraftOnComplete(false);
    setShowPreview(true);
  };

  const handleDelete = (asset) => {
    if (!window.confirm(`Delete ${asset.name}?`)) return;
    setAssets(assets.filter(a => a.path !== asset.path));
    setSharedAssets(sharedAssets.filter(a => a.path !== asset.path));

    // Keep session-only annotations consistent
    setAnnotationsByAsset(prev => {
      if (!prev[asset.path]) return prev;
      const next = { ...prev };
      delete next[asset.path];
      return next;
    });

    if (currentAsset?.path === asset.path) {
      setShowPreview(false);
      setCurrentAsset(null);
      setDrawRect(null);
      setDraftAnnotation(null);
      setDraftText("");
      setSelectedAnnotationId(null);
    }
  };

  const handleShare = (asset) => {
    setCurrentAsset(asset);
    setShowShare(true);
  };

  const handleComment = (asset) => {
    setCurrentAsset(asset);
    setShowComments(true);
  };

  const sendShare = () => {
    if (!shareEmail) return alert("Enter email address");
    alert(`Shared ${currentAsset.name} with ${shareEmail}`);
    setShowShare(false);
    setShareEmail("");
    setShareMessage("");
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const updatedAssets = assets.map(a => {
      if (a.path === currentAsset.path) {
        return {
          ...a,
          comments: [...(a.comments || []), { user: "You", text: commentText, date: new Date() }]
        };
      }
      return a;
    });
    setAssets(updatedAssets);
    setCommentText("");
  };


  const closePreview = () => {
    setShowPreview(false);
    setIsAnnotating(false);
    setDrawRect(null);
    setDraftAnnotation(null);
    setDraftText("");
    setSelectedAnnotationId(null);
    setActivePreviewVariant("original");
    setPromoteDraftOnComplete(false);
  };

  const toNormPoint = (e) => {
    const el = previewMediaRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const cx = Math.max(0, Math.min(1, x));
    const cy = Math.max(0, Math.min(1, y));
    return { x: cx, y: cy };
  };

  const handlePreviewMouseDown = (e) => {
    if (e.button !== 0) return;
    if (!isAnnotating || !currentAsset?.type?.includes("image")) return;

    const pt = toNormPoint(e);
    if (!pt) return;

    setSelectedAnnotationId(null);
    setDraftAnnotation(null);
    setDraftText("");

    setDrawRect({
      assetPath: currentAsset.path,
      x1: pt.x,
      y1: pt.y,
      x2: pt.x,
      y2: pt.y,
    });
  };

  const handlePreviewMouseMove = (e) => {
    if (!drawRect) return;
    if (drawRect.assetPath !== currentAsset?.path) return;

    const pt = toNormPoint(e);
    if (!pt) return;

    setDrawRect((r) => (r ? { ...r, x2: pt.x, y2: pt.y } : r));
  };

  const handlePreviewMouseUp = (e) => {
    if (!drawRect) return;
    if (drawRect.assetPath !== currentAsset?.path) return;

    const x1 = Math.min(drawRect.x1, drawRect.x2);
    const y1 = Math.min(drawRect.y1, drawRect.y2);
    const x2 = Math.max(drawRect.x1, drawRect.x2);
    const y2 = Math.max(drawRect.y1, drawRect.y2);

    const w = x2 - x1;
    const h = y2 - y1;

    // If the drag is extremely small, treat as no-op
    if (w < 0.004 && h < 0.004) {
      setDrawRect(null);
      return;
    }

    const cx = x1 + w / 2;
    const cy = y1 + h / 2;

    setDraftAnnotation({
      assetPath: currentAsset.path,
      rect: { x1, y1, x2, y2 },
      cx,
      cy,
    });
    setDrawRect(null);
  };

  const saveDraftAnnotation = () => {
    if (!draftAnnotation?.assetPath) return;
    if (!draftText.trim()) return alert("Enter a comment");

    const assetPath = draftAnnotation.assetPath;

    const note = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
      x: draftAnnotation.cx,
      y: draftAnnotation.cy,
      rect: draftAnnotation.rect,
      text: draftText.trim(),
      resolved: false,
    };

    setAnnotationsByAsset((prev) => {
      const nextNotes = [...(prev[assetPath] || []), note];
      return { ...prev, [assetPath]: nextNotes };
    });

    setDraftAnnotation(null);
    setDraftText("");
  };

  const resolveAnnotation = (assetPath, noteId) => {
    setAnnotationsByAsset((prev) => {
      const existing = prev[assetPath] || [];
      const nextNotes = existing.map((n) => (n.id === noteId ? { ...n, resolved: true } : n));
      return { ...prev, [assetPath]: nextNotes };
    });
    if (selectedAnnotationId === noteId) setSelectedAnnotationId(null);
  };

  const resolveAllAnnotations = (assetPath) => {
    setAnnotationsByAsset((prev) => {
      const existing = prev[assetPath] || [];
      const nextNotes = existing.map((n) => ({ ...n, resolved: true }));
      return { ...prev, [assetPath]: nextNotes };
    });
    closePreview();
  };

  const handleBulkDownload = () => {
    if (selected.size === 0) return alert("Select assets first");
    alert(`Downloading ${selected.size} assets...`);
  };

  const openMetadataEditor = (asset) => {
    setEditing({
      ...asset,
      tagsInput: (asset.tags || []).join(", "),
      description: asset.description || ""
    });
    setShowMetadata(true);
  };

  const saveMetadata = () => {
    if (!editing) return;
    const updatedAssets = assets.map(a => {
      if (a.path === editing.path) {
        return {
          ...a,
          tags: (editing.tagsInput || "").split(",").map(t => t.trim()).filter(Boolean),
          description: editing.description
        };
      }
      return a;
    });
    setAssets(updatedAssets);
    setShowMetadata(false);
  };

  const pendingAssets = useMemo(() => {
    const merged = [...assets, ...sharedAssets];
    const byPath = new Map();
    merged.forEach((a) => {
      if (getActiveAnnotationCount(a.path) > 0) byPath.set(a.path, a);
    });
    return Array.from(byPath.values());
  }, [assets, sharedAssets, annotationsByAsset]);

  const allAssets =
    activeTab === 'shared' ? sharedAssets.filter(a => getActiveAnnotationCount(a.path) === 0) :
      activeTab === 'pending' ? pendingAssets :
        assets;

  const filtered = useMemo(() => {
    return allAssets.filter((a) => {
      const q = (search || "").toLowerCase();
      const matchesSearch = !q || (a.name || "").toLowerCase().includes(q);
      const matchesTag = !tagFilter || (a.tags || []).includes(tagFilter);
      const matchesType = typeFilter === "all" || (a.type || "").toLowerCase().includes(typeFilter);
      const matchesCategory = selectedCategory === "All Assets" ||
        (a.category === selectedCategory) ||
        (a.tags && a.tags.includes(selectedCategory));
      return matchesSearch && matchesTag && matchesType && matchesCategory;
    }).sort((x, y) => new Date(y.created_at || 0) - new Date(x.created_at || 0));
  }, [allAssets, search, tagFilter, typeFilter, selectedCategory]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPageAssets = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      {/* ENHANCED SIDEBAR */}
      <div className="w-72 border-r border-gray-800 bg-gray-900/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
            <Zap size={24} className="text-red-500" />
            METRO DAM
          </h1>
          <p className="text-xs text-gray-400 mt-1">Content Studio Pro</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Actions */}
          <div>
            <button
              onClick={handleUploadClick}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-red-500/50 transition-all"
            >
              <Upload size={16} />
              UPLOAD ASSETS
            </button>
          </div>

          {/* Main Navigation */}
          <div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-wider">Workspaces</h3>
            <div className="space-y-1">
              <button
                onClick={() => { setActiveTab('my-assets'); setSelectedCategory("All Assets"); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${activeTab === 'my-assets' ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Folder size={16} />
                <span className="flex-1">My Assets</span>
                <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded-full">{assets.length}</span>
              </button>
              <button
                onClick={() => { setActiveTab('shared'); setSelectedCategory("All Assets"); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${activeTab === 'shared' ? 'bg-blue-600/20 text-blue-500 border border-blue-600/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Share2 size={16} />
                <span className="flex-1">Shared With Me</span>
                <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full">{sharedAssets.length}</span>
              </button>
              <button
                onClick={() => { setActiveTab('pending'); setSelectedCategory("All Assets"); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-3 ${activeTab === 'pending' ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Clock size={16} />
                <span className="flex-1">Pending Assets</span>
                <span className="text-[10px] bg-red-600 px-2 py-0.5 rounded-full">{pendingAssets.length}</span>
              </button>
            </div>
          </div>

          {/* Hierarchy Tree */}
          {activeTab === 'my-assets' && (
            <div>
              <h3 className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-wider flex items-center gap-2">
                <BarChart3 size={12} />
                Content Hierarchy
              </h3>
              <button
                onClick={() => { setSelectedCategory("All Assets"); setPage(1); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all mb-2 flex items-center gap-2 ${selectedCategory === "All Assets" ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Globe size={14} />
                All Assets
                <span className="ml-auto text-[10px] text-gray-500">{assets.length}</span>
              </button>
              <div className="space-y-1">
                {metroHierarchy.map((cat, idx) => (
                  <TreeNode
                    key={idx}
                    node={cat}
                    selectedCategory={selectedCategory}
                    onSelect={(name) => { setSelectedCategory(name); setPage(1); }}
                    defaultCollapsed={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div>
            <h3 className="text-[10px] font-black text-gray-500 uppercase mb-3 tracking-wider flex items-center gap-2">
              <Filter size={12} />
              Asset Types
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'All', value: 'all', icon: '📁' },
                { label: 'Images', value: 'image', icon: '🖼️' },
                { label: 'Video', value: 'video', icon: '🎬' },
                { label: 'PDF', value: 'pdf', icon: '📄' }
              ].map(type => (
                <button
                  key={type.value}
                  onClick={() => setTypeFilter(type.value)}
                  className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1 ${typeFilter === type.value
                      ? 'bg-red-600/10 border-red-600/50 text-red-400'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white'
                    }`}
                >
                  <span>{type.icon}</span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3 flex items-center gap-2">
              <Settings size={12} />
              System Status
            </h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-400">Storage</span>
                  <span className="text-green-400 font-bold">65%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-400">Bandwidth</span>
                  <span className="text-blue-400 font-bold">42%</span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="border-b border-gray-800 bg-gray-900/30 backdrop-blur-xl">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-3">
                  {activeTab === 'pending' ? 'Pending Assets' : selectedCategory}
                  {activeTab === 'shared' && (
                    <span className="text-sm font-normal text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      Shared Workspace
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-400 mt-1">Metro Canada Content Studio</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all">
                  <Bell size={18} className="text-gray-400" />
                </button>
                <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all">
                  <Settings size={18} className="text-gray-400" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center font-bold text-sm">
                  MC
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex-1 min-w-[300px] relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search assets by name, SKU, or tags..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List size={16} />
                </button>
              </div>

              {selected.size > 0 && (
                <button
                  onClick={handleBulkDownload}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
                >
                  <Download size={16} />
                  Export ({selected.size})
                </button>
              )}

              <button
                onClick={handleUploadClick}
                className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:shadow-red-500/30 rounded-xl font-bold text-xs flex items-center gap-2 transition-all"
              >
                <Upload size={16} />
                UPLOAD
              </button>
            </div>

            {selected.size > 0 && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
                <span className="text-sm font-bold text-blue-400 flex items-center gap-2">
                  <CheckSquare size={16} />
                  {selected.size} asset{selected.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert('Bulk edit coming soon!')}
                    className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-xs font-bold transition-all"
                  >
                    Bulk Edit
                  </button>
                  <button
                    onClick={() => setSelected(new Set())}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-bold transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ASSET GRID/LIST */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-400 font-bold">Syncing Metro Library...</p>
            </div>
          ) : currentPageAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4 opacity-50">📦</div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No assets found</h3>
              <p className="text-gray-500 mb-6">Upload your first asset to get started</p>
              <button
                onClick={handleUploadClick}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold flex items-center gap-2"
              >
                <Upload size={18} />
                Upload Assets
              </button>
            </div>
          ) : (
            <>
              <div className={`mb-6 flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    {selected.size === currentPageAssets.length ? (
                      <CheckSquare size={16} className="text-red-500" />
                    ) : (
                      <Square size={16} />
                    )}
                    {selected.size === currentPageAssets.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-xs text-gray-500">
                    Showing {currentPageAssets.length} of {filtered.length} assets
                  </span>
                </div>
                <button
                  onClick={loadDemoData}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              </div>

              <div className={viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-3"
              }>
                {currentPageAssets.map((asset) => (
                  <AssetCard
                    key={asset.path}
                    asset={asset}
                    checked={selected.has(asset.path)}
                    onToggle={toggleSelect}
                    onOpen={handleOpen}
                    onEdit={openMetadataEditor}
                    onDelete={handleDelete}
                    onShare={handleShare}
                    onComment={handleComment}
                    viewMode={viewMode}
                    isShared={activeTab === 'shared'}
                    annotationCount={getActiveAnnotationCount(asset.path)}
                  />
                ))}
              </div>

              {pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 pb-8">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                  >
                    ← Previous
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${page === p
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(p => p + 1)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* METADATA MODAL */}
      {showMetadata && editing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 w-full max-w-2xl shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Edit3 size={20} className="text-red-500" />
                  Asset Intelligence
                </h3>
                <p className="text-xs text-gray-400 mt-1">{editing.name}</p>
              </div>
              <button
                onClick={() => setShowMetadata(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Tags</label>
                <input
                  type="text"
                  value={editing.tagsInput}
                  onChange={(e) => setEditing(s => ({ ...s, tagsInput: e.target.value }))}
                  placeholder="Comma-separated tags"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Description</label>
                <textarea
                  rows={4}
                  value={editing.description}
                  onChange={(e) => setEditing(s => ({ ...s, description: e.target.value }))}
                  placeholder="Describe this asset..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowMetadata(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveMetadata}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:shadow-red-500/30 rounded-xl font-bold text-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShare && currentAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Share2 size={20} className="text-blue-500" />
                  Share Asset
                </h3>
                <p className="text-xs text-gray-400 mt-1">{currentAsset.name}</p>
              </div>
              <button
                onClick={() => setShowShare(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="colleague@metrocanada.com"
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Message (Optional)</label>
                <textarea
                  rows={3}
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  placeholder="Add a message..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                />
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <p className="text-xs text-blue-400 flex items-center gap-2">
                  <Link2 size={14} />
                  Recipients will get view and download access
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowShare(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={sendShare}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/30 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={16} />
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {showComments && currentAsset && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <MessageSquare size={20} className="text-purple-500" />
                  Comments
                </h3>
                <p className="text-xs text-gray-400 mt-1">{currentAsset.name}</p>
              </div>
              <button
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentAsset.comments && currentAsset.comments.length > 0 ? (
                currentAsset.comments.map((comment, idx) => (
                  <div key={idx} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                        {comment.user[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-white">{comment.user}</p>
                        <p className="text-xs text-gray-400">{niceDate(comment.date)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{comment.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare size={48} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400">No comments yet. Start the conversation!</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-700">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                <button
                  onClick={addComment}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:shadow-lg hover:shadow-purple-500/30 rounded-xl font-bold text-sm transition-all"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ASSET PREVIEW MODAL (DAM Style) */}
      {showPreview && currentAsset && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[9999] p-2 lg:p-6 animate-fadeIn">
          {/* Constrained to 820px max height to prevent clipping at 75% zoom on 14" screens */}
          <div className="bg-gray-900 border border-gray-700 w-full max-w-[1440px] h-[92%] max-h-[820px] rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl relative">
            {/* LEFT SIDE: Media Player/Viewer (70%) */}
            <div className="flex-1 bg-black flex flex-col border-r border-gray-800">
              {/* Modal Control Toolbar */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                <button
                  onClick={closePreview}
                  className="p-2 hover:bg-red-600 rounded-lg text-white transition-all border border-white/5"
                >
                  <X size={20} />
                </button>

                <div className="flex gap-3">
                  {activeTab === 'pending' ? (
                    <button
                      onClick={() => {
                        const originalPath = currentAsset.path;
                        resolveAllAnnotations(originalPath);

                        // If user selected the refined (_R) version, promote it only upon completion
                        if (promoteDraftOnComplete && draftByOriginalPath[originalPath]) {
                          promoteDraftToShared(originalPath);
                        }
                      }}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-black text-[11px] flex items-center gap-2 transition-all shadow-lg border border-green-500/50"
                    >
                      <CheckSquare size={16} /> SEND RESOLUTION & COMPLETE
                    </button>
                  ) : (
                    <>
                      {!isAnnotating ? (
                        <button
                          onClick={() => setIsAnnotating(true)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl font-black text-[11px] flex items-center gap-2 transition-all shadow-lg border border-red-500/50"
                        >
                          <Plus size={16} /> ADD ANNOTATION
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsAnnotating(false);
                            if (getActiveAnnotationCount(currentAsset.path) > 0) {
                              closePreview();
                            }
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-black text-[11px] flex items-center gap-2 transition-all shadow-lg border border-emerald-500/50"
                        >
                          <CheckSquare size={16} /> SUBMIT ANNOTATION(S)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Asset Container Box - Added overflow-hidden to prevent container expansion */}
              <div className="flex-1 relative p-4 flex items-center justify-center overflow-hidden">
                <div className="relative max-w-full max-h-full bg-gray-800/20 rounded-2xl p-2 border border-white/5 shadow-inner flex items-center justify-center">
                  {currentAsset.type?.includes('video') ? (
                    <video
                      src={currentAsset.path}
                      controls
                      autoPlay
                      className="max-w-full max-h-full rounded-lg shadow-2xl"
                    />
                  ) : (
                    <div className={draftRefinedAsset && activeTab === 'pending' ? "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start" : ""}>
                      <div className="relative z-10 overflow-visible">
                        <div
                          ref={previewMediaRef}
                          className="relative inline-block max-w-full max-h-full overflow-visible"
                          onMouseDown={handlePreviewMouseDown}
                          onMouseMove={handlePreviewMouseMove}
                          onMouseUp={handlePreviewMouseUp}
                          title="Hold left mouse button and drag to draw a note box"
                        >
                          <img
                            src={
                              activePreviewVariant === "refined" && draftRefinedAsset
                                ? (draftRefinedAsset.thumbnail || draftRefinedAsset.path)
                                : (currentAsset.thumbnail || currentAsset.path)
                            }
                            alt={
                              activePreviewVariant === "refined" && draftRefinedAsset
                                ? draftRefinedAsset.name
                                : currentAsset.name
                            }
                            className="max-w-full rounded-lg shadow-2xl select-none"
                            style={{ maxHeight: 'calc(820px - 220px)' }}
                            draggable={false}
                          />

                          {/* Drawing rectangle (live) */}
                          {drawRect && drawRect.assetPath === currentAsset.path && (
                            (() => {
                              const x1 = Math.min(drawRect.x1, drawRect.x2);
                              const y1 = Math.min(drawRect.y1, drawRect.y2);
                              const x2 = Math.max(drawRect.x1, drawRect.x2);
                              const y2 = Math.max(drawRect.y1, drawRect.y2);
                              return (
                                <div
                                  className="absolute border-2 border-red-500/90 bg-red-500/10 rounded-md pointer-events-none"
                                  style={{
                                    left: `${x1 * 100}%`,
                                    top: `${y1 * 100}%`,
                                    width: `${(x2 - x1) * 100}%`,
                                    height: `${(y2 - y1) * 100}%`,
                                  }}
                                />
                              );
                            })()
                          )}

                          {/* Existing pins (numbered) */}
                          {(annotationsByAsset[currentAsset.path] || []).map((note, idx) => {
                            const isResolved = !!note.resolved;
                            const isSelected = selectedAnnotationId === note.id;

                            return (
                              <div
                                key={note.id}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 ${isSelected ? 'z-[100]' : 'z-[50]'}`}
                                style={{ left: `${note.x * 100}%`, top: `${note.y * 100}%` }}
                                onMouseDown={(ev) => ev.stopPropagation()}
                                onMouseUp={(ev) => ev.stopPropagation()}
                                onClick={(ev) => { ev.stopPropagation(); setSelectedAnnotationId(note.id); }}
                              >
                                <button
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black shadow-lg transition-all relative
                              ${isResolved ? 'bg-gray-700/80 border-gray-500 text-gray-200' : 'bg-red-600 border-red-300 text-white'}
                              ${isSelected ? 'ring-2 ring-white/70 scale-105 z-10' : 'hover:scale-105 z-20'}
                            `}
                                  title={isResolved ? "Resolved note" : "Open note"}
                                >
                                  {idx + 1}
                                </button>

                                {/* Popover (in-place) */}
                                {isSelected && (
                                  <div
                                    className={`absolute w-80 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl z-[130] flex flex-col overflow-visible
                                ${note.y < 0.25 ? 'top-12' : 'bottom-12'} 
                                ${note.x > 0.75 ? 'right-0' : note.x < 0.25 ? 'left-0' : 'left-1/2 -translate-x-1/2'}`}
                                  >
                                    {/* Header Meta */}
                                    <div className="px-4 py-3 bg-gray-800/50 border-b border-gray-700 flex items-center justify-between rounded-t-2xl">
                                      <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                                          ANNOTATION #{idx + 1}
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold">
                                          {niceDate(new Date())} • Milad Moradi
                                        </span>
                                      </div>
                                      <button
                                        onClick={(ev) => { ev.stopPropagation(); setSelectedAnnotationId(null); }}
                                        className="text-gray-500 hover:text-white transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                      <p className={`text-sm leading-relaxed ${isResolved ? 'text-gray-500 line-through' : 'text-gray-200'} break-words font-medium`}>
                                        {note.text}
                                      </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="px-4 pb-4 flex gap-2">
                                      <button
                                        onClick={(ev) => { ev.stopPropagation(); setSelectedAnnotationId(null); }}
                                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-[10px] text-gray-300 transition-all border border-gray-700"
                                      >
                                        CLOSE
                                      </button>
                                      {!isResolved && (
                                        <>
                                          <button
                                            onClick={(ev) => {
                                              ev.stopPropagation();
                                              setSelectedNotes(new Set([note.id]));
                                              setIsModifying(true);
                                            }}
                                            className="flex-1 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl font-black text-[10px] transition-all border border-red-500/20 flex items-center justify-center gap-2 shadow-sm"
                                          >
                                            <Zap size={12} /> AI MODIFICATION
                                          </button>
                                          <button
                                            onClick={(ev) => { ev.stopPropagation(); resolveAnnotation(currentAsset.path, note.id); }}
                                            className="w-10 flex items-center justify-center bg-green-600/10 hover:bg-green-600/20 text-green-500 rounded-xl transition-all border border-green-500/20"
                                            title="Resolve"
                                          >
                                            <CheckSquare size={16} />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}


                          {/* AI Modification Selection Box */}
                          {isModifying && (
                            <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                              <div className="bg-gray-900 border border-red-500/50 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-4 border-b border-gray-800 bg-red-600/10 flex justify-between items-center">
                                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                                    <Zap size={16} className="text-red-500" /> APPLY AI MODIFICATIONS
                                  </h4>
                                  <button onClick={() => setIsModifying(false)}><X size={18} /></button>
                                </div>
                                <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                  <div className="flex justify-between items-center">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Select comments to include:</p>
                                    <div className="flex items-center gap-3 bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-800">
                                      <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isLiveMode ? 'text-blue-500' : 'text-gray-500'}`}>
                                        {isLiveMode ? 'Live' : 'Present'}
                                      </span>
                                      <button
                                        onClick={() => setIsLiveMode(!isLiveMode)}
                                        className={`w-9 h-5 rounded-full relative transition-all duration-300 ${isLiveMode ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-gray-700'}`}
                                      >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300 ${isLiveMode ? 'translate-x-5' : 'translate-x-1'}`} />
                                      </button>
                                    </div>
                                  </div>
                                  {(annotationsByAsset[currentAsset.path] || []).filter(n => !n.resolved).map((n, idx) => (
                                    <div
                                      key={n.id}
                                      onClick={() => {
                                        const next = new Set(selectedNotes);
                                        if (next.has(n.id)) next.delete(n.id); else next.add(n.id);
                                        setSelectedNotes(next);
                                      }}
                                      className={`p-3 rounded-xl border transition-all cursor-pointer flex gap-3 items-start ${selectedNotes.has(n.id) ? 'bg-red-600/10 border-red-500/50' : 'bg-gray-800/50 border-gray-700'}`}
                                    >
                                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedNotes.has(n.id) ? 'bg-red-600 border-red-500' : 'border-gray-500'}`}>
                                        {selectedNotes.has(n.id) && <CheckSquare size={12} className="text-white" />}
                                      </div>
                                      <div>
                                        <span className="text-[10px] font-black text-red-500">NOTE #{idx + 1}</span>
                                        <p className="text-xs text-gray-200 mt-1 line-clamp-2">{n.text}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="p-4 bg-gray-950 border-t border-gray-800 flex gap-3">
                                  <button onClick={() => setIsModifying(false)} className="flex-1 py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
                                  <button
                                    onClick={handleAIProcess}
                                    disabled={selectedNotes.size === 0}
                                    className={`flex-[2] py-3 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${isLiveMode
                                        ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/40'
                                        : 'bg-red-600 hover:bg-red-500 shadow-red-900/40'
                                      }`}
                                  >
                                    <Zap size={14} /> {isLiveMode ? 'GENERATE LIVE (GEMINI)' : 'GENERATE MODIFICATION'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* AI Processing Overlay */}
                          {isAIProcessing && (
                            <div className="absolute inset-0 z-[110] bg-gray-900/90 backdrop-blur-md flex flex-col items-center justify-center">
                              <div className="w-24 h-24 relative mb-6">
                                <div className="absolute inset-0 border-4 border-red-500/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-red-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Zap size={32} className="text-red-500 animate-pulse" />
                                </div>
                              </div>
                              <h3 className="text-xl font-black text-white tracking-widest uppercase">AI Processing</h3>
                              <p className="text-sm text-gray-400 mt-2 font-medium">Re-rendering assets with requested modifications...</p>
                              <div className="mt-8 flex gap-1">
                                {[0, 1, 2].map(i => (
                                  <div key={i} className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Draft comment box (after rectangle release) */}
                          {draftAnnotation?.assetPath === currentAsset.path && (
                            <div
                              className="absolute w-[320px] max-w-[90vw] bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl z-[120]"
                              style={{
                                left: `${draftAnnotation.cx * 100}%`,
                                top: `${draftAnnotation.cy * 100}%`,
                                transform: `translate(${draftAnnotation.cx > 0.7 ? '-100%' : draftAnnotation.cx < 0.3 ? '0%' : '-50%'}, ${draftAnnotation.cy > 0.7 ? '-100%' : draftAnnotation.cy < 0.3 ? '0%' : '-50%'})`
                              }}
                              onMouseDown={(ev) => ev.stopPropagation()}
                              onMouseUp={(ev) => ev.stopPropagation()}
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-red-600/20 text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                  New Annotation
                                </span>
                                <span className="text-[10px] text-gray-500 font-bold">OK will collapse to a pin</span>
                              </div>

                              <textarea
                                rows={3}
                                value={draftText}
                                onChange={(ev) => setDraftText(ev.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none transition-all"
                              />

                              <div className="flex gap-3 mt-3">
                                <button
                                  onClick={() => { setDraftAnnotation(null); setDraftText(''); }}
                                  className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm transition-all"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={saveDraftAnnotation}
                                  className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg hover:shadow-red-500/30 rounded-xl font-black text-sm transition-all"
                                >
                                  OK
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {draftRefinedAsset && activeTab === 'pending' && (
                        activePreviewVariant === "refined" ? (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePreviewVariant("original");
                              setPromoteDraftOnComplete(false);
                            }}
                            className="relative w-full h-full bg-gray-800/20 rounded-2xl p-2 border border-white/5 shadow-inner flex items-center justify-center hover:border-white/20 transition-all"
                            title="Click to switch back to Original preview"
                          >
                            <img
                              src={currentAsset.thumbnail || currentAsset.path}
                              alt={currentAsset.name}
                              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                              draggable={false}
                            />
                            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/60 rounded-xl text-[10px] font-black text-white border border-white/10">
                              ORIGINAL • CLICK TO VIEW
                            </div>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setActivePreviewVariant("refined");
                              setPromoteDraftOnComplete(true);
                            }}
                            className="relative w-full h-full bg-gray-800/20 rounded-2xl p-2 border border-white/5 shadow-inner flex items-center justify-center hover:border-blue-500/40 transition-all"
                            title="Click to preview refined (_R). It will be saved to Shared With Me when you complete."
                          >
                            <img
                              src={draftRefinedAsset.thumbnail || draftRefinedAsset.path}
                              alt={draftRefinedAsset.name}
                              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                              draggable={false}
                            />
                            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-blue-600/70 rounded-xl text-[10px] font-black text-white border border-white/10">
                              REFINED (_R) • CLICK TO PREVIEW
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* RIGHT SIDE: Information & Metadata (30%) */}
            <div className="w-full lg:w-[380px] bg-gray-900 flex flex-col h-full border-l border-gray-800 shrink-0">
              <div className="p-8 border-b border-gray-800">
                <h3 className="text-xl font-black text-white leading-tight mb-2">{currentAsset.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-red-600/20 text-red-500 rounded text-[10px] font-black uppercase tracking-widest">
                    {currentAsset.type?.split('/')[1] || 'Asset'}
                  </span>
                  <span className="text-xs text-gray-500 font-bold">{currentAsset.size}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Meta Section */}
                <section className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Tag size={12} /> Metadata Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Created</p>
                      <p className="text-xs text-white font-medium">{niceDate(currentAsset.created_at)}</p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/50">
                      <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">DPI/Resolution</p>
                      <p className="text-xs text-white font-medium">300 DPI (Print Ready)</p>
                    </div>
                  </div>
                </section>

                {/* Shared Information */}
                {(currentAsset.sharedBy || activeTab === 'shared') && (
                  <section className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Users size={12} /> Collaboration
                    </h4>
                    <div className="bg-blue-600/5 border border-blue-500/20 p-4 rounded-xl">
                      <p className="text-xs text-gray-300">
                        Shared by <span className="text-blue-400 font-bold">{currentAsset.sharedBy || "System Admin"}</span>
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 italic">Permissions: View & Export</p>
                    </div>
                  </section>
                )}

                {/* Tags Section */}
                <section className="space-y-3">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Active Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentAsset.tags?.map((tag, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-xs font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              {/* Bottom Actions */}
              <div className="p-8 border-t border-gray-800 bg-gray-900/50 space-y-3">
                <button
                  onClick={() => { closePreview(); handleShare(currentAsset); }}
                  className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 size={16} /> Share Asset
                </button>
                <button
                  onClick={() => { alert('Downloading high-res original...'); }}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
                >
                  <Download size={18} /> DOWNLOAD ORIGINAL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}