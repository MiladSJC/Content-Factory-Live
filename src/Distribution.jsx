import React, { useState, useEffect } from 'react';
import { 
  Globe, Truck, Package, MapPin, BarChart3, Clock, 
  CheckCircle2, ChevronRight, Search, Filter, TrendingUp, 
  Users, Zap, Bell, Calendar, Download, Eye, MousePointer, 
  Share2, AlertCircle, Radio, ShoppingCart, RefreshCcw 
} from "lucide-react";

const RaddarUnifiedDistribution = () => {
  const [activeRegion, setActiveRegion] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [liveMetrics, setLiveMetrics] = useState({ 
    views: 842502, 
    gmroi: 1.58, 
    inStock: 98.4,
    uplift: 8.2 
  });

  // High-Frequency Data Stream Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        ...prev,
        views: prev.views + Math.floor(Math.random() * 85),
        inStock: Math.max(94, prev.inStock + (Math.random() - 0.5) * 0.1),
        uplift: Math.min(15, prev.uplift + (Math.random() - 0.5) * 0.05)
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const regions = [
    { 
      id: 'all', 
      name: 'National Network', 
      households: '8.8M', 
      coverage: '98%', 
      gmroi: '1.58', 
      status: 'optimal', 
      inStock: '98.4%',
      growth: '+9.4%'
    },
    { 
      id: 'on', 
      name: 'Ontario (GTA Core)', 
      households: '4.0M', 
      coverage: '100%', 
      gmroi: '1.72', 
      status: 'high-velocity', 
      inStock: '97.8%',
      growth: '+14.2%',
      insight: 'GTA High-Velocity Zones active.'
    },
    { 
      id: 'qc', 
      name: 'Quebec', 
      households: '2.4M', 
      coverage: '96%', 
      gmroi: '1.55', 
      status: 'optimal', 
      inStock: '99.1%',
      growth: '+7.1%'
    },
    { 
      id: 'bc', 
      name: 'British Columbia', 
      households: '2.4M', 
      coverage: '94%', 
      gmroi: '1.48', 
      status: 'stable', 
      inStock: '98.2%',
      growth: '+6.8%'
    },
  ];

  const campaignsData = [
    {
      id: 'CAMP-2026-ON1',
      retailer: 'Loblaws',
      name: 'Ontario Fresh Launch',
      status: 'live',
      gmroi: '1.92',
      uplift: '+18.4%',
      inventoryRisk: 'Low',
      printReach: '3.1M',
      digitalViews: '1.2M',
      revenue: '$2.44M',
      regionId: 'on'
    },
    {
      id: 'CAMP-2025-X1',
      retailer: 'Staples Canada',
      name: 'Back-to-School Power',
      status: 'live',
      gmroi: '1.82',
      uplift: '+14.2%',
      inventoryRisk: 'Low',
      printReach: '2.1M',
      digitalViews: '412K',
      revenue: '$1.24M',
      regionId: 'all'
    },
    {
      id: 'CAMP-2025-M1',
      retailer: 'Metro Inc.',
      name: 'Weekly Grocery Specials',
      status: 'live',
      gmroi: '1.65',
      uplift: '+11.2%',
      inventoryRisk: 'Med',
      printReach: '1.8M',
      digitalViews: '487K',
      revenue: '$984K',
      regionId: 'qc'
    }
  ];

  const selectedRegionData = regions.find(r => r.id === activeRegion) || regions[0];

  return (
    <div className="min-h-screen bg-[#0a0f18] text-gray-100 p-6 font-sans selection:bg-red-500/30">
      <div className="max-w-[1800px] mx-auto space-y-6">
        
        {/* Unified Power Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-black p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px] -z-10" />
          <div className="relative flex justify-between items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg shadow-lg shadow-red-600/20">
                    <TrendingUp size={24}/>
                </div>
                <h1 className="text-3xl font-black uppercase tracking-tighter italic">
                    SJC <span className="text-red-600">Distribution Hub</span>
                </h1>
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">Advanced Omnichannel Retail Intelligence</p>
            </div>

            <div className="flex gap-4">
               <div className="hidden lg:flex bg-white/5 border border-white/10 p-3 rounded-2xl items-center gap-4 px-6">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase">Live Network Reach</p>
                    <p className="text-xl font-black text-green-400">{liveMetrics.views.toLocaleString()}</p>
                  </div>
                  <RefreshCcw size={20} className="text-green-500 animate-spin-slow"/>
               </div>
               <button className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(220,38,38,0.4)] group">
                 <Calendar size={18} className="group-hover:rotate-12 transition-transform"/> INITIATE FLYER FLIGHT
               </button>
            </div>
          </div>
        </div>

        {/* Global Navigation */}
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl w-fit">
          {['overview', 'campaigns', 'analytics'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-12 gap-6">
          
          {/* Sidebar: Regional Intelligence */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Globe size={14} className="text-red-500"/> Network Penetration
               </h3>
               <div className="space-y-3">
                 {regions.map(r => (
                   <button key={r.id} onClick={() => setActiveRegion(r.id)} 
                     className={`w-full p-4 rounded-2xl border text-left transition-all ${
                        activeRegion === r.id ? 'bg-red-600 border-red-500 shadow-xl scale-[1.02]' : 'bg-black/40 border-white/5 hover:border-white/20'
                     }`}>
                     <div className="flex justify-between items-center mb-1">
                        <span className="font-black text-sm">{r.name}</span>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${r.id === 'on' ? 'bg-blue-300' : 'bg-green-400'}`} />
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-medium opacity-70 block">{r.households} HH</span>
                            <span className="text-[9px] font-black uppercase opacity-60">Status: {r.status}</span>
                        </div>
                        <span className="text-xs font-black italic">GMROI: {r.gmroi}</span>
                     </div>
                   </button>
                 ))}
               </div>
            </div>

            <div className="bg-gradient-to-t from-red-900/20 to-transparent border border-red-500/20 rounded-3xl p-6">
               <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Live Performance Uplift</h4>
               <div className="text-4xl font-black mb-2">+{liveMetrics.uplift.toFixed(1)}%</div>
               <p className="text-[10px] text-gray-400 leading-relaxed uppercase font-bold tracking-tight">
                 Aggregate Sales Lift Across Active Digital Nodes.
               </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            
            {/* Context-Aware KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Network Reach', value: selectedRegionData.households, detail: 'Addressable Households', icon: Users, color: 'blue' },
                { label: 'Inventory Sync', value: selectedRegionData.inStock, detail: 'Shelf Availability', icon: ShoppingCart, color: 'green' },
                { label: 'Digital Velocity', value: '412K', detail: 'Real-time Interactions', icon: Zap, color: 'purple' },
                { label: 'Growth Index', value: selectedRegionData.growth, detail: 'Period over Period', icon: TrendingUp, color: 'red' },
              ].map((kpi, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl hover:border-red-500/50 transition-colors group">
                  <div className="flex justify-between mb-4">
                    <kpi.icon size={20} className={`text-${kpi.color}-500`} />
                    <span className="text-[10px] font-black text-gray-500 uppercase">{kpi.label}</span>
                  </div>
                  <div className="text-2xl font-black group-hover:text-white transition-colors">{kpi.value}</div>
                  <div className="text-[10px] font-bold text-gray-500 mt-1 uppercase">{kpi.detail}</div>
                </div>
              ))}
            </div>

            {/* Campaign Flight Performance (New Elements from Image) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: 'Sell-Through Rate', value: '78.2%', detail: 'Flyer Item Velocity', icon: ShoppingCart, color: 'blue' },
                { label: 'Digital-to-Store', value: '34,242', detail: 'Click-to-Collect Leads', icon: MousePointer, color: 'purple' },
                { label: 'Print Efficiency', value: '$0.12', detail: 'Cost Per Household', icon: Package, color: 'green' },
                { label: 'Network Reach', value: '8.8M', detail: 'Total Active Households', icon: Users, color: 'red' },
              ].map((kpi, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl hover:border-red-500/50 transition-colors group">
                  <div className="flex justify-between mb-4">
                    <kpi.icon size={20} className={`text-${kpi.color}-500`} />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-tight">{kpi.label}</span>
                  </div>
                  <div className="text-3xl font-black group-hover:text-white transition-colors tracking-tight">{kpi.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 mt-1 uppercase italic tracking-wider">{kpi.detail}</div>
                </div>
              ))}
            </div>

            {/* Content Logic */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                 {/* Ontario / AI Insights Card - NOW LIVE */}
                 <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/50 border border-blue-500/30 rounded-3xl p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <BarChart3 className="text-blue-400" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Distribution Intelligence</h3>
                        </div>
                        <h2 className="text-2xl font-black mb-4 tracking-tight">GTA High-Velocity Deployment</h2>
                        <p className="text-sm text-slate-400 leading-relaxed mb-6">
                            The Ontario network is operating at peak capacity. AI-modeled heatmaps have identified 4.0M households with a 94.2% retail readiness score. GTA clusters are currently seeing a 14.2% higher engagement than the national average.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-black/40 p-4 rounded-2xl flex-1 border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Target HH</span>
                            <span className="text-xl font-black italic">4.0M</span>
                        </div>
                        <div className="bg-black/40 p-4 rounded-2xl flex-1 border border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase block mb-1">Efficiency</span>
                            <span className="text-xl font-black italic text-blue-400">98.2%</span>
                        </div>
                    </div>
                 </div>

                 {/* Engagement Mini-Chart/Visualizer */}
                 <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                    <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                        <div className="absolute inset-0 border-[12px] border-white/5 rounded-full" />
                        <div className="absolute inset-0 border-[12px] border-red-600 rounded-full border-t-transparent animate-spin-slow shadow-[0_0_20px_rgba(220,38,38,0.2)]" />
                        <div className="text-center">
                            <span className="text-4xl font-black italic">{liveMetrics.uplift.toFixed(1)}%</span>
                            <span className="block text-[9px] font-black text-gray-500 uppercase mt-1">Daily Uplift</span>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed font-medium">
                        Live telemetry from 14 active campaigns across the national grid.
                    </p>
                 </div>
              </div>
            )}

            {/* Campaigns View */}
            {activeTab === 'campaigns' && (
              <div className="bg-slate-900/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
                 <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 flex items-center gap-2">
                      <Zap size={14} className="text-yellow-500"/> Active Campaign Flight Monitor
                    </h3>
                    <div className="flex gap-2">
                      <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all"><Download size={14}/></button>
                      <button className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition-all"><Filter size={14}/></button>
                    </div>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-black/40 text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4">Retailer / Campaign</th>
                          <th className="px-6 py-4">Reach (Print/Digital)</th>
                          <th className="px-6 py-4">GMROI</th>
                          <th className="px-6 py-4">Uplift</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4 text-right">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {campaignsData.map(c => (
                          <tr key={c.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                            <td className="px-6 py-5">
                              <div className="font-black text-sm">{c.name}</div>
                              <div className="text-[10px] text-gray-500 font-bold uppercase">{c.retailer}</div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="text-xs font-bold">{c.printReach} <span className="text-gray-500">/</span> {c.digitalViews}</div>
                            </td>
                            <td className="px-6 py-5 font-black text-green-400">{c.gmroi}x</td>
                            <td className="px-6 py-5">
                              <span className="font-black text-sm text-red-500">{c.uplift}</span>
                            </td>
                            <td className="px-6 py-5">
                               <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
                                 <span className="text-[10px] font-black uppercase text-green-500">In-Flight</span>
                               </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                               <button className="p-2 hover:bg-red-600 rounded-lg transition-all"><ChevronRight size={16}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
              </div>
            )}

            {/* Analytics Tab (Placeholder) */}
            {activeTab === 'analytics' && (
              <div className="h-96 bg-slate-900/30 border border-white/5 rounded-3xl flex items-center justify-center italic text-slate-600">
                Detailed ROI Analytics Engine Loading...
              </div>
            )}

          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default RaddarUnifiedDistribution;