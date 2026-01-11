import React, { useEffect, useMemo, useState } from 'react';

const CM_Icons = {
  Plus: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Folder: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  Grid: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Tree: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  ChevronRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Check: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  Link: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656 0 4 4 0 010-5.656l1.414-1.414M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 0 4 4 0 010 5.656l-1.414 1.414" /></svg>,
};

const BANNERS = ['Metro', 'Food Basics'];
const STATUSES = ['Planning', 'In Progress', 'Done', 'Archive'];
const MARKETING_CHANNELS = ['Flyer', 'Web Banner', 'Animation', 'Video', 'Social Ad', 'Email', 'In-Store Display'];
const STRATEGIC_YEARS = ['2026', '2027', '2028'];
const WEEKS = Array.from({ length: 52 }, (_, i) => String(i + 1));

const safeInt = (v, fallback = 0) => {
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : fallback;
};

// --- FRONTEND-ONLY PERSISTENCE CONFIG ---
// List of initial JSON files to fetch from the public folder on first load
const PUBLIC_CAMPAIGNS = [
  "Moi Campaign.json",
  "Super C Demo56.json",
  "Food Basics.json",
  "112233 Metro Demo.json"
];

const openInNewTab = (url) => {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const WorkflowButtons = ({ campaign, onNavigateToFlyer }) => {
  const fallbackOffer = "https://demo.flyer-platform.sjcisdev.com/offers?project_id=4&customer_id=demo&offer_id=1096";
  const fallbackLayout = "https://uat.flyer-platform.sjcisdev.com/layouts?new=true&customer_id=walmart";
  const fallbackPreview = "https://demo.flyer-platform.sjcisdev.com/projects/ad-plans?id=2&customer_id=demo";

  const offerUrl = campaign?.offerDataUrl || fallbackOffer;
  const layoutUrl = campaign?.layoutUrl || fallbackLayout;
  const previewUrl = campaign?.previewUrl || fallbackPreview;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => openInNewTab(offerUrl)}
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-gray-700 transition-colors"
        title="Data"
      >
        <span>📋</span> Data
      </button>

      <button
        onClick={() => openInNewTab(layoutUrl)}
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-gray-700 transition-colors"
        title="Layout"
      >
        <span>📐</span> Layout
      </button>

      <button
        onClick={() => openInNewTab(previewUrl)}
        className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-gray-700 transition-colors"
        title="Preview"
      >
        <span>👀</span> Preview
      </button>

      <button
        onClick={onNavigateToFlyer}
        className="flex items-center gap-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-red-600/20 transition-all"
        title="Production"
      >
        <span>🚀</span> Production
      </button>
    </div>
  );
};

const normalizeCampaignFromServer = (c) => {
  const strategicYear =
    c?.strategicYear ||
    (['2026', '2027', '2028'].includes(String(c?.year)) ? String(c.year) : '2026');

  return {
    docketNumber: safeInt(c?.docketNumber, 0),
    strategicYear,
    retailWeek: Math.min(52, Math.max(1, safeInt(c?.retailWeek, 1))),
    name: c?.name || '',
    banner: c?.banner || 'Metro',
    pm: c?.pm || 'Milad Moradi',
    startDate: c?.startDate || '',
    endDate: c?.endDate || '',
    channels: Array.isArray(c?.channels) ? c.channels : [],
    status: c?.status || 'Planning',
    productCount: safeInt(c?.productCount, 0),
    assets: Array.isArray(c?.assets) ? c.assets : [],
    offerDataUrl: c?.offerDataUrl || '',
    layoutUrl: c?.layoutUrl || '',
    previewUrl: c?.previewUrl || '',
    importedFileName: c?.importedFileName || '',
    year: c?.year || undefined,
    created_at: c?.created_at,
    updated_at: c?.updated_at,
  };
};

const CampaignManager = ({ onNavigateToAI, onNavigateToFlyer }) => {
  const [campaigns, setCampaigns] = useState([]);
  const [viewMode, setViewMode] = useState('tree');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [oldCampaignName, setOldCampaignName] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const today = new Date().toISOString().split('T')[0];

  const emptyForm = useMemo(() => ({
    name: '',
    docketNumber: 0,
    strategicYear: '2026',
    retailWeek: 1,
    banner: 'Metro',
    pm: 'Milad Moradi',
    startDate: today,
    endDate: '',
    channels: [],
    status: 'Planning',
    offerDataUrl: '',
    layoutUrl: '',
    previewUrl: '',
    importedFileName: '',
  }), [today]);

  const [formData, setFormData] = useState(emptyForm);

  // Persistence Helper: Merge Public Files with LocalStorage
  const initializeCampaigns = async () => {
    try {
      const localData = localStorage.getItem('sjc_campaign_storage');
      
      if (localData) {
        setCampaigns(JSON.parse(localData));
      } else {
        // First time load: Fetch static JSON files from /public/Campaigns/
        const fetched = await Promise.all(
          PUBLIC_CAMPAIGNS.map(file => 
            fetch(`/Campaigns/${file}`).then(res => res.json())
          )
        );
        const validFetched = fetched.filter(c => c && c.name);
        setCampaigns(validFetched);
        localStorage.setItem('sjc_campaign_storage', JSON.stringify(validFetched));
      }
    } catch (e) {
      console.error("Failed to initialize campaigns:", e);
    }
  };

  useEffect(() => {
    initializeCampaigns();
  }, []);

  // Sync state to local storage and broadcast to other components
  const syncCampaigns = (newList) => {
    setCampaigns(newList);
    localStorage.setItem('sjc_campaign_storage', JSON.stringify(newList));
    window.dispatchEvent(new Event("campaigns:updated"));
  };

  useEffect(() => { 
    if (campaigns.length === 0) return;
    const initialExpanded = {};
    campaigns.forEach(c => {
      const bannerKey = c.banner || 'Unassigned';
      const yearKey = `${bannerKey}-${c.strategicYear || '2026'}`;
      initialExpanded[bannerKey] = true;
      initialExpanded[yearKey] = true;
    });
    setExpandedSections(initialExpanded);
  }, [campaigns.length]);

  const validateForm = () => {
    if (!String(formData.name || '').trim()) return "Campaign name is required.";
    if (!Number.isInteger(safeInt(formData.docketNumber, NaN))) return "Docket Number must be an integer.";
    if (!STRATEGIC_YEARS.includes(String(formData.strategicYear))) return "Strategic Year must be 2026, 2027, or 2028.";
    const wk = safeInt(formData.retailWeek, 0);
    if (wk < 1 || wk > 52) return "Retail Week must be between 1 and 52.";
    return null;
  };

  const handleSave = () => {
    const err = validateForm();
    if (err) {
      window.alert(err);
      return;
    }

    const payload = normalizeCampaignFromServer({
      ...formData,
      docketNumber: safeInt(formData.docketNumber, 0),
      retailWeek: safeInt(formData.retailWeek, 1),
      updated_at: new Date().toLocaleString()
    });

    let updatedList;
    if (isEditing) {
      updatedList = campaigns.map(c => c.name === oldCampaignName ? payload : c);
    } else {
      updatedList = [...campaigns, { ...payload, created_at: new Date().toLocaleString() }];
    }

    syncCampaigns(updatedList);
    setIsModalOpen(false);
  };

  const handleEditInit = (campaign) => {
    const norm = normalizeCampaignFromServer(campaign);
    setFormData({
      ...emptyForm,
      ...norm,
    });
    setOldCampaignName(norm.name);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const toggleChannel = (channel) => {
    setFormData(prev => {
      const channels = prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels };
    });
  };

  const handleDelete = (name) => {
    if (!window.confirm(`Delete ${name}?`)) return;
    const updatedList = campaigns.filter(c => c.name !== name);
    syncCampaigns(updatedList);
  };

  const groupedCampaigns = useMemo(() => {
    return campaigns.reduce((acc, camp) => {
      const b = camp.banner || 'Unassigned';
      const y = camp.strategicYear || '2026';
      if (!acc[b]) acc[b] = {};
      if (!acc[b][y]) acc[b][y] = [];
      acc[b][y].push(camp);

      acc[b][y].sort((a, c) => {
        const w = safeInt(a.retailWeek, 0) - safeInt(c.retailWeek, 0);
        if (w !== 0) return w;
        const d = safeInt(a.docketNumber, 0) - safeInt(c.docketNumber, 0);
        if (d !== 0) return d;
        return String(a.name).localeCompare(String(c.name));
      });

      return acc;
    }, {});
  }, [campaigns]);

  return (
    <div className="h-full flex flex-col gap-6 p-4 text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">
            <span className="text-red-600">Campaign</span> Manager
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex bg-gray-950 rounded-xl p-1 border border-gray-800">
            <button
              onClick={() => setViewMode('box')}
              className={`p-2 rounded-lg ${viewMode === 'box' ? 'bg-red-600 shadow-lg' : 'text-gray-500'}`}
              title="Grid view"
            >
              <CM_Icons.Grid />
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`p-2 rounded-lg ${viewMode === 'tree' ? 'bg-red-600 shadow-lg' : 'text-gray-500'}`}
              title="Tree view"
            >
              <CM_Icons.Tree />
            </button>
          </div>

          <button
            onClick={() => {
              setFormData(emptyForm);
              setIsEditing(false);
              setOldCampaignName('');
              setIsModalOpen(true);
            }}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl font-black uppercase text-xs tracking-widest flex items-center gap-2 transition-all"
          >
            <CM_Icons.Plus /> New Campaign
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {viewMode === 'tree' ? (
          <div className="space-y-4">
            {Object.entries(groupedCampaigns).map(([banner, years]) => (
              <div key={banner} className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
                <div
                  className="bg-gray-900 px-6 py-4 border-b border-gray-800 flex items-center justify-between cursor-pointer hover:bg-gray-800"
                  onClick={() => setExpandedSections(prev => ({ ...prev, [banner]: !prev[banner] }))}
                >
                  <h3 className="font-black text-sm uppercase tracking-[0.2em] text-gray-300">{banner}</h3>
                  {expandedSections[banner] ? <CM_Icons.ChevronDown /> : <CM_Icons.ChevronRight />}
                </div>

                {expandedSections[banner] && Object.entries(years).map(([year, camps]) => {
                  const yearKey = `${banner}-${year}`;
                  return (
                    <div key={year} className="border-b last:border-0 border-gray-800">
                      <div
                        className="px-8 py-2 bg-gray-950/50 text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedSections(prev => ({ ...prev, [yearKey]: !prev[yearKey] }))}
                      >
                        <span>Strategic Year {year}</span>
                        {expandedSections[yearKey] ? <CM_Icons.ChevronDown /> : <CM_Icons.ChevronRight />}
                      </div>

                      {expandedSections[yearKey] && (
                        <div className="divide-y divide-gray-800/50">
                          {camps.map((c, i) => (
                            <div key={i} className="px-8 md:px-12 py-4 flex flex-col md:flex-row md:justify-between md:items-center hover:bg-red-600/5 group gap-4">
                              <div className="flex items-start gap-4">
                                <div className="mt-1 text-red-500"><CM_Icons.Folder /></div>
                                <div className="min-w-0">
                                  <p className="font-black text-gray-200 text-sm truncate">{c.name}</p>

                                  <div className="mt-1 flex flex-wrap gap-2 items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                      Docket <span className="text-gray-200">{c.docketNumber}</span>
                                    </span>
                                    <span className="text-gray-700">•</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                      Week <span className="text-gray-200">{c.retailWeek}</span>
                                    </span>
                                    <span className="text-gray-700">•</span>
                                    <span className="text-[10px] text-gray-500 font-mono">
                                      {c.pm} • {c.startDate || 'TBD'} → {c.endDate || 'TBD'}
                                    </span>
                                  </div>

                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {c.channels?.map(ch => (
                                      <span key={ch} className="text-[8px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-400 uppercase font-bold border border-gray-700">
                                        {ch}
                                      </span>
                                    ))}
                                  </div>

                                  {(c.offerDataUrl || c.layoutUrl || c.previewUrl) && (
                                    <div className="mt-2 flex gap-2 flex-wrap text-[10px]">
                                      {c.offerDataUrl && (
                                        <button
                                          className="flex items-center gap-1 text-gray-400 hover:text-white"
                                          onClick={() => openInNewTab(c.offerDataUrl)}
                                          title="Open Data"
                                        >
                                          <CM_Icons.Link /> Data
                                        </button>
                                      )}
                                      {c.layoutUrl && (
                                        <button
                                          className="flex items-center gap-1 text-gray-400 hover:text-white"
                                          onClick={() => openInNewTab(c.layoutUrl)}
                                          title="Open Layout"
                                        >
                                          <CM_Icons.Link /> Layout
                                        </button>
                                      )}
                                      {c.previewUrl && (
                                        <button
                                          className="flex items-center gap-1 text-gray-400 hover:text-white"
                                          onClick={() => openInNewTab(c.previewUrl)}
                                          title="Open Preview"
                                        >
                                          <CM_Icons.Link /> Preview
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-end">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-black border ${
                                    c.status === 'Planning' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                                    c.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                    c.status === 'Archive' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    'bg-green-500/10 text-green-500 border-green-500/20'
                                  }`}
                                >
                                  {c.status}
                                </span>

                                <button
                                  onClick={onNavigateToAI}
                                  className="flex items-center gap-2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border border-blue-600/20 transition-all"
                                  title="AI Item Selection"
                                >
                                  AI Selection
                                </button>

                                <WorkflowButtons campaign={c} onNavigateToFlyer={onNavigateToFlyer} />

                                <div className="h-6 w-[1px] bg-gray-800 mx-1 hidden md:block"></div>
                                <button onClick={() => handleEditInit(c)} className="p-2 hover:bg-gray-800 rounded text-gray-400 transition-colors" title="Edit">
                                  <CM_Icons.Edit />
                                </button>
                                <button onClick={() => handleDelete(c.name)} className="p-2 hover:bg-red-900/30 rounded text-gray-500 transition-colors" title="Delete">
                                  <CM_Icons.Trash />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {campaigns.map((c, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-3xl hover:border-red-600 transition-all group relative">
                <div className="absolute top-6 right-6 flex gap-2">
                  <button onClick={() => handleEditInit(c)} className="p-2 bg-gray-950 rounded-lg text-gray-500 hover:text-white" title="Edit">
                    <CM_Icons.Edit />
                  </button>
                  <button onClick={() => handleDelete(c.name)} className="p-2 bg-gray-950 rounded-lg text-gray-500 hover:text-red-500" title="Delete">
                    <CM_Icons.Trash />
                  </button>
                </div>

                <div className="p-3 bg-red-600/10 w-fit rounded-2xl text-red-600 mb-4 border border-red-600/20">
                  <CM_Icons.Folder />
                </div>

                <h3 className="text-xl font-black mb-2">{c.name}</h3>

                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                  <span>{c.banner}</span><span>•</span><span>{c.strategicYear}</span><span>•</span>
                  <span>Docket {c.docketNumber}</span><span>•</span><span>Week {c.retailWeek}</span>
                </div>

                <div className="mb-6 flex justify-between items-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[8px] uppercase font-black border ${
                      c.status === 'Planning' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                      c.status === 'In Progress' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                      c.status === 'Archive' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                      'bg-green-500/10 text-green-500 border-green-500/20'
                    }`}
                  >
                    {c.status}
                  </span>

                  <div className="text-right">
                    <p className="text-gray-500 uppercase font-black text-[9px] tracking-widest">PM</p>
                    <p className="text-xs font-bold">{c.pm}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <button onClick={onNavigateToAI} className="text-blue-500 text-[10px] font-black uppercase hover:underline">
                      Launch AI Selection
                    </button>
                  </div>

                  <WorkflowButtons campaign={c} onNavigateToFlyer={onNavigateToFlyer} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-950 border border-gray-800 w-full max-w-6xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-gray-900 flex justify-between items-center bg-gray-900/30">
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase">
                {isEditing ? 'Update Campaign' : 'New Campaign'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-white text-4xl font-light">
                &times;
              </button>
            </div>

            <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Left: Identity + tracking */}
                <div className="space-y-1">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase text-red-600 font-black tracking-widest">Campaign Name</label>
                    <input
                      className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl text-[11px] font-bold outline-none focus:border-red-600"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Docket Number</label>
                      <input
                        type="number"
                        step="1"
                        inputMode="numeric"
                        className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl outline-none text-[11px] font-bold focus:border-red-600"
                        value={formData.docketNumber}
                        onChange={e => setFormData({ ...formData, docketNumber: safeInt(e.target.value, 0) })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Strategic Year</label>
                      <select
                        className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl outline-none text-[11px] font-bold focus:border-red-600"
                        value={formData.strategicYear}
                        onChange={e => setFormData({ ...formData, strategicYear: e.target.value })}
                      >
                        {STRATEGIC_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Retail Week</label>
                      <select
                        className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl outline-none text-[11px] font-bold focus:border-red-600"
                        value={String(formData.retailWeek)}
                        onChange={e => setFormData({ ...formData, retailWeek: safeInt(e.target.value, 1) })}
                      >
                        {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Banner</label>
                      <select
                        className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl outline-none text-[11px] font-bold"
                        value={formData.banner}
                        onChange={e => setFormData({ ...formData, banner: e.target.value })}
                      >
                        {BANNERS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Status</label>
                      <select
                        className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl outline-none text-[11px] font-bold"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Start Date</label>
                      <input
                        type="date"
                        className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl text-white text-[11px] font-bold outline-none"
                        value={formData.startDate}
                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest">End Date</label>
                      <input
                        type="date"
                        className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl text-white text-[11px] font-bold outline-none"
                        value={formData.endDate}
                        onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Workflow URLs */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-600 font-black tracking-widest">Data URL</label>
                        <input
                          className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl text-[11px] outline-none focus:border-red-600 font-mono"
                          value={formData.offerDataUrl}
                          onChange={e => setFormData({ ...formData, offerDataUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-600 font-black tracking-widest">Layout URL</label>
                        <input
                          className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl text-[11px] outline-none focus:border-red-600 font-mono"
                          value={formData.layoutUrl}
                          onChange={e => setFormData({ ...formData, layoutUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-600 font-black tracking-widest">Preview URL</label>
                        <input
                          className="w-full bg-gray-900 border border-gray-800 px-5 py-4 rounded-2xl text-[11px] outline-none focus:border-red-600 font-mono"
                          value={formData.previewUrl}
                          onChange={e => setFormData({ ...formData, previewUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Channels + Horizontally Aligned Upload */}
                <div className="space-y-4">
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block">Marketing Channels</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MARKETING_CHANNELS.map(ch => {
                      const isSelected = formData.channels.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => toggleChannel(ch)}
                          className={`flex items-center justify-between px-5 py-4 rounded-2xl border text-[11px] font-black uppercase transition-all ${
                            isSelected
                              ? 'bg-red-600 border-red-500 text-white shadow-xl'
                              : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                          }`}
                        >
                          {ch} {isSelected && <CM_Icons.Check />}
                        </button>
                      );
                    })}
                  </div>

                  {/* UPLOADED SECTION - ALIGNED WITH URL SECTION ON LEFT */}
                  <div className="mt-6 pt-4">
                    <label className="text-[10px] uppercase text-red-600 font-black tracking-widest mb-3 block">
                      Campaign Data Import (CSV / XLSX)
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData(prev => ({ ...prev, importedFileName: file.name }));
                          }
                        }}
                      />
                      <div className={`w-full border-2 border-dashed px-6 py-8 rounded-[32px] flex flex-col items-center justify-center gap-2 transition-all duration-300 ${formData.importedFileName ? 'bg-red-600/10 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.1)]' : 'bg-gray-900 border-gray-800 group-hover:border-red-600'}`}>
                        <div className={`transition-colors ${formData.importedFileName ? 'text-red-500' : 'text-gray-600 group-hover:text-red-600'}`}>
                          {formData.importedFileName ? <CM_Icons.Check /> : <CM_Icons.Plus />}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-center transition-colors">
                          {formData.importedFileName ? (
                            <span className="text-white drop-shadow-sm">Attached: {formData.importedFileName}</span>
                          ) : (
                            <span className="text-gray-500">Click to Browse or Drag & Drop Data File</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 bg-gray-900/50 flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 text-gray-500 font-black uppercase text-xs tracking-widest hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em]"
              >
                Save Campaign
              </button>
            </div>
          </div>
        </div>
      )}


      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 2px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); }
      `}</style>
    </div>
  );
};

export default CampaignManager;