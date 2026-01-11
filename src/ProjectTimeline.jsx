import React, { useState, useEffect, useMemo, useRef } from 'react';

const TEAM_MAP = {
  'Milad Moradi': { initial: 'MM', color: 'bg-blue-600' },
  'Pat Flyn': { initial: 'PF', color: 'bg-green-600' },
  'default': { initial: 'AI', color: 'bg-purple-600' }
};

const STATUS_COLORS = {
  'Planning': 'bg-gray-500',
  'In Progress': 'bg-blue-600',
  'Done': 'bg-green-600',
  'Archive': 'bg-purple-600',
  'default': 'bg-red-600'
};

const ProjectTimeline = () => {
  const [currentView, setCurrentView] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Hover Logic States
  const [hoveredTaskId, setHoveredTaskId] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);
  const hoverTimerRef = useRef(null);

  useEffect(() => { fetchCampaigns(); }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('http://localhost:5001/list-campaigns', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const updateCampaignStatus = async (campaign, newStatus) => {
    try {
      setCampaigns(prev => prev.map(c => c.name === campaign.name ? { ...c, status: newStatus } : c));
      await fetch('http://localhost:5001/save-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...campaign, status: newStatus })
      });
    } catch (e) {
      console.error("Failed to sync status:", e);
      fetchCampaigns();
    }
  };

  const timelineData = useMemo(() => {
    const now = new Date();
    const viewStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalDays = 180;

    return campaigns.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.banner && c.banner.toLowerCase().includes(searchQuery.toLowerCase()))
    ).map(c => {
      const start = c.startDate ? new Date(c.startDate) : new Date();
      const end = c.endDate ? new Date(c.endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const diffStart = Math.max(0, Math.floor((start - viewStart) / (1000 * 60 * 60 * 24)));
      const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
      
      const leftPercent = (diffStart / totalDays) * 100;
      const widthPercent = (duration / totalDays) * 100;

      // Calculate Progress %
      let completion = 0;
      if (c.status === 'Done') completion = 100;
      else if (c.status === 'Planning') completion = 0;
      else {
        const total = end - start;
        const current = now - start;
        completion = Math.min(100, Math.max(0, Math.round((current / total) * 100)));
      }

      return { ...c, leftPercent, widthPercent, id: c.name, completion };
    });
  }, [searchQuery, campaigns]);

  const handleMouseEnter = (task) => {
    hoverTimerRef.current = setTimeout(() => {
      setHoveredTaskId(task.id);
      setTooltipData(task);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHoveredTaskId(null);
    setTooltipData(null);
  };

  const TimelineView = () => {
    const months = [];
    const now = new Date();
    for(let i=0; i<6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        months.push(d.toLocaleString('default', { month: 'short' }));
    }

    return (
      <div className="bg-gray-900/20 border border-gray-800 rounded-3xl p-6 overflow-visible">
        <div className="w-full">
          <div className="flex border-b border-gray-800 mb-6 pb-4">
            <div className="w-64 shrink-0 font-black text-gray-600 uppercase text-[10px] tracking-[0.3em] pl-4">Campaign Track</div>
            <div className="flex-1 grid grid-cols-6">
              {months.map((m, idx) => (
                <div key={idx} className="text-center text-[10px] text-gray-500 border-l border-gray-800/50 font-black uppercase tracking-widest">{m}</div>
              ))}
            </div>
          </div>
          <div className="space-y-3 relative">
            {timelineData.map(task => (
              <div key={task.id} className="flex items-center group hover:bg-white/5 rounded-xl py-1 transition-colors">
                <div className="w-64 shrink-0 px-4">
                   <p className="text-xs font-black text-gray-200 truncate uppercase tracking-tight">{task.name}</p>
                   <p className="text-[9px] text-gray-500 font-mono uppercase">{task.startDate} — {task.endDate}</p>
                </div>
                <div className="flex-1 relative h-10 bg-gray-950/20 rounded-lg overflow-visible">
                  <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
                    {[...Array(6)].map((_, i) => <div key={i} className="border-l border-white/5 h-full"></div>)}
                  </div>
                  
                  {/* Task Bar */}
                  <div 
                    onMouseEnter={() => handleMouseEnter(task)}
                    onMouseLeave={handleMouseLeave}
                    className={`absolute h-7 top-1.5 rounded-lg text-[9px] font-black flex items-center px-3 shadow-2xl cursor-help border border-white/10 uppercase tracking-tighter transition-all z-10 ${STATUS_COLORS[task.status] || STATUS_COLORS.default}`}
                    style={{ 
                        left: `${task.leftPercent}%`, 
                        width: `${task.widthPercent}%`,
                        minWidth: '12px'
                    }}
                  >
                    {task.widthPercent > 8 && <span className="truncate">{task.name}</span>}

                    {/* Sophisticated Hover Box */}
                    {hoveredTaskId === task.id && (
                      <div className="absolute top-full mt-3 left-0 w-72 bg-gray-950 border border-gray-700 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 pointer-events-none animate-fadeIn backdrop-blur-xl">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h5 className="text-[11px] text-white font-black mb-1">{task.name}</h5>
                            <span className="text-[8px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 border border-white/5">{task.status}</span>
                          </div>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-lg ${TEAM_MAP[task.pm]?.color || TEAM_MAP.default.color}`}>
                            {TEAM_MAP[task.pm]?.initial || '??'}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">
                              <span>Overall Completion</span>
                              <span className="text-white">{task.completion}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                              <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${task.completion}%` }}></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-3">
                            <div>
                              <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">PM Owner</p>
                              <p className="text-[10px] text-gray-200 font-bold">{task.pm}</p>
                            </div>
                            <div>
                              <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest">Banner</p>
                              <p className="text-[10px] text-gray-200 font-bold">{task.banner}</p>
                            </div>
                          </div>

                          <div className="bg-gray-900/50 rounded-xl p-2 border border-white/5 space-y-1">
                             <div className="flex justify-between">
                                <span className="text-[7px] text-gray-500 uppercase font-black">Start Date</span>
                                <span className="text-[8px] text-gray-300 font-mono">{task.startDate}</span>
                             </div>
                             <div className="flex justify-between">
                                <span className="text-[7px] text-gray-500 uppercase font-black">Expected End</span>
                                <span className="text-[8px] text-gray-300 font-mono">{task.endDate}</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BoardView = () => {
    const columns = ['Planning', 'In Progress', 'Done', 'Archive'];
    const onDragOver = (e) => e.preventDefault();
    const onDragStart = (e, task) => e.dataTransfer.setData("taskName", task.name);
    const onDrop = (e, newStatus) => {
        const taskName = e.dataTransfer.getData("taskName");
        const task = campaigns.find(c => c.name === taskName);
        if (task && task.status !== newStatus) updateCampaignStatus(task, newStatus);
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[600px]">
        {columns.map(col => (
          <div key={col} onDragOver={onDragOver} onDrop={(e) => onDrop(e, col)} className="bg-gray-900/40 p-4 rounded-3xl border border-gray-800 flex flex-col">
            <h3 className="font-black text-gray-500 uppercase text-[10px] tracking-[0.3em] mb-6 flex justify-between px-2">
              {col} <span className="bg-gray-800 px-2 rounded-full text-gray-400">{timelineData.filter(t => t.status === col || (col === 'Planning' && !t.status)).length}</span>
            </h3>
            <div className="space-y-4 flex-1">
              {timelineData.filter(t => t.status === col || (col === 'Planning' && !t.status)).map(task => (
                <div key={task.id} draggable onDragStart={(e) => onDragStart(e, task)} className="bg-gray-800/80 p-4 rounded-2xl border border-gray-700 shadow-xl cursor-move hover:border-red-600 transition-all active:scale-95 group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] bg-red-600/10 text-red-500 font-black px-2 py-0.5 rounded uppercase border border-red-600/20">{task.banner}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${TEAM_MAP[task.pm]?.color || TEAM_MAP.default.color}`}>
                      {TEAM_MAP[task.pm]?.initial || '??'}
                    </div>
                  </div>
                  <h4 className="text-sm font-black text-white mb-2 leading-tight group-hover:text-red-600 transition-colors uppercase tracking-tighter">{task.name}</h4>
                  <p className="text-[10px] text-gray-500 font-mono">📅 {task.startDate || 'TBD'}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const ListView = () => (
    <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-800/50 text-[10px] uppercase text-gray-500 font-black tracking-widest">
          <tr>
            <th className="p-6">Campaign</th>
            <th className="p-6">Banner</th>
            <th className="p-6">Owner</th>
            <th className="p-6">Timeline</th>
            <th className="p-6">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800 text-sm">
          {timelineData.map(task => (
            <tr key={task.id} className="hover:bg-red-600/5 transition-colors">
              <td className="p-6 font-black text-white uppercase tracking-tight">{task.name}</td>
              <td className="p-6 text-gray-400 font-bold uppercase text-xs">{task.banner}</td>
              <td className="p-6">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${TEAM_MAP[task.pm]?.color || TEAM_MAP.default.color}`}>
                    {TEAM_MAP[task.pm]?.initial || '??'}
                  </div>
                  <span className="text-gray-300 font-bold">{task.pm}</span>
                </div>
              </td>
              <td className="p-6 text-gray-500 font-mono text-xs">{task.startDate} → {task.endDate}</td>
              <td className="p-6">
                <span className={`border px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    task.status === 'Done' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                    task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                    {task.status || 'Planning'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-4 md:p-8 bg-gray-950 min-h-full text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black flex items-center gap-3 tracking-tighter">
            <span className="text-red-600">PROJECT</span> TIMELINE
          </h2>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">6-Month Strategic Roadmap Visibility</p>
        </div>

        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-xs rounded-2xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-red-600 outline-none w-64 transition-all"
          />
          <div className="flex bg-gray-900 p-1 rounded-2xl border border-gray-800">
            {['timeline', 'board', 'list'].map(view => (
              <button key={view} onClick={() => setCurrentView(view)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${currentView === view ? 'bg-red-600 text-white shadow-xl shadow-red-600/30' : 'text-gray-500 hover:text-gray-300'}`}>
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
        </div>
      ) : timelineData.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-[40px]">
           <p className="text-gray-600 font-black uppercase tracking-[0.3em]">No Projects Found</p>
        </div>
      ) : (
        <div className="animate-fadeIn">
          {currentView === 'timeline' && <TimelineView />}
          {currentView === 'board' && <BoardView />}
          {currentView === 'list' && <ListView />}
        </div>
      )}
    </div>
  );
};

export default ProjectTimeline;