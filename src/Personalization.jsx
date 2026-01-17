import React, { useState, useEffect } from 'react';
import { X, Save, Users, MapPin, User2 } from 'lucide-react';

const PROVINCES = ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Saskatchewan', 'Nova Scotia', 'New Brunswick', 'Newfoundland', 'PEI'];

export const PersonalizationModal = ({ isOpen, onClose, onSave }) => {
  const [targetName, setTargetName] = useState('');
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [sex, setSex] = useState(['Male', 'Female', 'Other']);
  const [selectedZones, setSelectedZones] = useState([]);
  const [audienceCount, setAudienceCount] = useState(0);

  useEffect(() => {
    let base = 500000;
    const ageFactor = (ageRange[1] - ageRange[0]) / 80;
    const zoneFactor = selectedZones.length > 0 ? selectedZones.length / 10 : 1;
    const sexFactor = sex.length / 3;
    
    const count = Math.floor(base * ageFactor * zoneFactor * sexFactor);
    setAudienceCount(count);
  }, [ageRange, sex, selectedZones]);

  if (!isOpen) return null;

  const handleToggleZone = (zone) => {
    setSelectedZones(prev => 
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const handleSave = () => {
    if (!targetName) return alert("Please enter a Target Name");
    onSave(targetName, { ageRange, sex, selectedZones, audienceCount });
    setTargetName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-[900px] h-[600px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex overflow-hidden">
        
        {/* Left Sidebar: Meta */}
        <div className="w-1/3 border-r border-gray-800 bg-gray-800/50 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-red-500">
              <User2 className="h-5 w-5" />
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Market Identity</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Market Name</label>
              <input 
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. GTA Millennials"
                className="w-full bg-gray-950 border border-gray-700 rounded-md p-3 text-sm text-white focus:ring-1 focus:ring-red-500 outline-none"
              />
            </div>

            <div className="p-4 bg-gray-950/50 rounded-lg border border-gray-800 space-y-3">
               <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Reach Efficiency</span>
                  <span className="text-xs font-bold text-green-500">High</span>
               </div>
               <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[75%]" />
               </div>
            </div>
          </div>

          <div className="space-y-3">
             <button onClick={onClose} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
             <button onClick={handleSave} className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-lg text-white font-bold flex items-center justify-center gap-2 shadow-lg">
                <Save className="h-4 w-4" /> Save Target
             </button>
          </div>
        </div>

        {/* Right Content: Filters & Stats */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-bold text-white tabular-nums">{audienceCount.toLocaleString()} <span className="text-gray-500 font-normal">Audience</span></span>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* Age Slicer */}
            <section className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">Age Demographics</label>
              <div className="px-2">
                <input 
                  type="range" min="13" max="100" 
                  value={ageRange[1]} 
                  onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                  className="w-full accent-red-600" 
                />
                <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-500">
                  <span>MIN: {ageRange[0]}</span>
                  <span>MAX: {ageRange[1]}</span>
                </div>
              </div>
            </section>

            {/* Sex Selection */}
            <section className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sex</label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setSex(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                    className={`flex-1 py-2 rounded-md border text-xs font-bold transition-all ${sex.includes(s) ? 'bg-red-900/30 border-red-500 text-white' : 'bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Zone Filter */}
            <section className="space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><MapPin className="h-3 w-3" /> Geographic Zone (Canada)</label>
              <div className="grid grid-cols-2 gap-2">
                {PROVINCES.map(province => (
                  <label key={province} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${selectedZones.includes(province) ? 'bg-blue-900/20 border-blue-500/50 text-blue-100' : 'bg-gray-950 border-gray-800 text-gray-500 hover:bg-gray-800'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={selectedZones.includes(province)}
                      onChange={() => handleToggleZone(province)}
                    />
                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${selectedZones.includes(province) ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}>
                      {selectedZones.includes(province) && <div className="h-2 w-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-xs font-medium">{province}</span>
                  </label>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};