import React, { useMemo, useEffect, useState } from "react";
import {
  X,
  Save,
  Users,
  MapPin,
  User2,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Tag,
  Home,
  ShoppingCart,
  Globe,
  PawPrint,
} from "lucide-react";

const PROVINCES = [
  "Ontario",
  "Quebec",
  "British Columbia",
  "Alberta",
  "Manitoba",
  "Saskatchewan",
  "Nova Scotia",
  "New Brunswick",
  "Newfoundland",
  "PEI",
];

// A retailer-friendly taxonomy starter set (expand freely)
const INTERESTS = [
  "Value & Deals",
  "Organic & Wellness",
  "Fitness",
  "Beauty",
  "Tech",
  "Home Renovation",
  "Home Decor",
  "Parenting",
  "Pet Care",
  "Travel",
  "Cooking",
  "Quick Meals",
  "Gaming",
  "Outdoor",
  "Fashion",
  "Automotive",
  "Financial Planning",
];

const LANGUAGES = ["English", "French", "Bilingual", "Other"];
const PET_TYPES = ["Dog", "Cat", "Fish", "Bird", "Small Pet", "Reptile"];
const SHOP_FREQ = ["Weekly", "Biweekly", "Monthly", "Occasional"];
const CHANNEL_PREF = ["In-store", "Online", "Omnichannel"];
const DWELLING = ["House", "Condo", "Apartment", "Other"];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const Pill = ({ children, onRemove }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-700 bg-gray-900 text-xs text-gray-100">
    {children}
    {onRemove && (
      <button
        onClick={onRemove}
        className="p-1 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
        aria-label="Remove filter"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </span>
);

export const PersonalizationModal = ({ isOpen, onClose, onSave }) => {
  // Core
  const [targetName, setTargetName] = useState("");
  const [activeTab, setActiveTab] = useState("Demographics");

  // Demographics
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [sex, setSex] = useState(["Male", "Female", "Other"]);
  const [householdSize, setHouseholdSize] = useState([1, 5]);
  const [incomeRange, setIncomeRange] = useState([40000, 150000]);

  // Geo
  const [selectedZones, setSelectedZones] = useState([]);
  const [urbanicity, setUrbanicity] = useState(["Urban", "Suburban", "Rural"]);

  // Interests
  const [interestQuery, setInterestQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);

  // Life events / attributes
  const [lifeEvents, setLifeEvents] = useState({
    recentMover: false,
    newParent: false,
    engagedMarried: false,
    newJob: false,
    newHomeOwner: false,
    student: false,
  });

  // Pet owner
  const [petOwner, setPetOwner] = useState(false);
  const [petTypes, setPetTypes] = useState([]);

  // Shopping behavior
  const [shopFrequency, setShopFrequency] = useState(["Weekly"]);
  const [channelPref, setChannelPref] = useState(["Omnichannel"]);
  const [loyaltyMember, setLoyaltyMember] = useState("Any"); // Any / Yes / No
  const [promoSensitivity, setPromoSensitivity] = useState(70); // 0..100
  const [preferredLanguage, setPreferredLanguage] = useState(["English", "French"]);

  // Housing
  const [dwellingType, setDwellingType] = useState(["House", "Condo", "Apartment"]);

  // Derived: interest list filtered
  const filteredInterests = useMemo(() => {
    const q = interestQuery.trim().toLowerCase();
    if (!q) return INTERESTS;
    return INTERESTS.filter((i) => i.toLowerCase().includes(q));
  }, [interestQuery]);

  const toggleInArray = (arr, value) =>
    arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];

  const handleToggleZone = (zone) => {
    setSelectedZones((prev) => (prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]));
  };

  const toggleLifeEvent = (key) => setLifeEvents((prev) => ({ ...prev, [key]: !prev[key] }));

  // A slightly more “marketing realistic” audience estimator:
  // - starts with a large base
  // - applies multiplicative constraints per filter family
  // - clamps to keep it believable in UI demos
  const [audienceCount, setAudienceCount] = useState(0);
  const [matchScore, setMatchScore] = useState(0); // 0..100 “precision” feel

  useEffect(() => {
    const base = 5_500_000; // think “national addressable IDs” (demo UI)
    const ageSpan = clamp(ageRange[1] - ageRange[0], 1, 87);
    const ageFactor = clamp(ageSpan / 87, 0.05, 1);

    const sexFactor = clamp(sex.length / 3, 0.15, 1);

    const zoneFactor =
      selectedZones.length === 0 ? 1 : clamp(selectedZones.length / PROVINCES.length, 0.08, 1);

    const urbanFactor = clamp(urbanicity.length / 3, 0.34, 1);

    const hhSpan = clamp(householdSize[1] - householdSize[0] + 1, 1, 8);
    const hhFactor = clamp(hhSpan / 8, 0.15, 1);

    const incSpan = clamp(incomeRange[1] - incomeRange[0], 1, 250000);
    const incFactor = clamp(incSpan / 250000, 0.12, 1);

    const interestFactor =
      selectedInterests.length === 0 ? 1 : clamp(1 - selectedInterests.length * 0.07, 0.55, 0.95);

    const lifeEventsSelected = Object.values(lifeEvents).filter(Boolean).length;
    const lifeFactor = lifeEventsSelected === 0 ? 1 : clamp(1 - lifeEventsSelected * 0.08, 0.50, 0.92);

    const petFactor = !petOwner ? 1 : clamp(0.80 - petTypes.length * 0.06, 0.55, 0.80);

    const shopFactor = clamp(shopFrequency.length / SHOP_FREQ.length, 0.25, 1);
    const channelFactor = clamp(channelPref.length / CHANNEL_PREF.length, 0.33, 1);

    const loyaltyFactor = loyaltyMember === "Any" ? 1 : 0.75;

    const langFactor = clamp(preferredLanguage.length / LANGUAGES.length, 0.25, 1);
    const dwellingFactor = clamp(dwellingType.length / DWELLING.length, 0.25, 1);

    const promoFactor = clamp((promoSensitivity + 20) / 120, 0.25, 1);

    const count = Math.floor(
      base *
        ageFactor *
        sexFactor *
        zoneFactor *
        urbanFactor *
        hhFactor *
        incFactor *
        interestFactor *
        lifeFactor *
        petFactor *
        shopFactor *
        channelFactor *
        loyaltyFactor *
        langFactor *
        dwellingFactor *
        promoFactor
    );

    // “precision / sophistication” score
    const filterSignals =
      (selectedZones.length ? 8 : 0) +
      (selectedInterests.length ? 10 : 0) +
      (lifeEventsSelected ? 10 : 0) +
      (petOwner ? 8 : 0) +
      (shopFrequency.length ? 6 : 0) +
      (channelPref.length ? 6 : 0) +
      (loyaltyMember !== "Any" ? 6 : 0) +
      (preferredLanguage.length ? 4 : 0) +
      (dwellingType.length ? 4 : 0);

    const score = clamp(40 + filterSignals + Math.round((100 - (ageSpan / 87) * 100) * 0.2), 0, 100);

    setAudienceCount(clamp(count, 15_000, 5_500_000));
    setMatchScore(score);
  }, [
    ageRange,
    sex,
    selectedZones,
    urbanicity,
    householdSize,
    incomeRange,
    selectedInterests,
    lifeEvents,
    petOwner,
    petTypes,
    shopFrequency,
    channelPref,
    loyaltyMember,
    promoSensitivity,
    preferredLanguage,
    dwellingType,
  ]);

  const filterChips = useMemo(() => {
    const chips = [];

    chips.push(`Age ${ageRange[0]}–${ageRange[1]}`);
    if (sex.length !== 3) chips.push(`Sex: ${sex.join(", ")}`);

    if (selectedZones.length) chips.push(`Geo: ${selectedZones.length} prov`);
    if (urbanicity.length !== 3) chips.push(`Area: ${urbanicity.join(", ")}`);

    if (selectedInterests.length) chips.push(`Interests: ${selectedInterests.length}`);
    const lifeKeys = Object.entries(lifeEvents).filter(([, v]) => v).map(([k]) => k);
    if (lifeKeys.length) chips.push(`Life events: ${lifeKeys.length}`);

    if (petOwner) chips.push(petTypes.length ? `Pet Owner: ${petTypes.join(", ")}` : "Pet Owner");

    if (householdSize[0] !== 1 || householdSize[1] !== 5) chips.push(`HH ${householdSize[0]}–${householdSize[1]}`);
    if (incomeRange[0] !== 40000 || incomeRange[1] !== 150000) chips.push(`Income $${incomeRange[0] / 1000}k–$${incomeRange[1] / 1000}k`);
    if (dwellingType.length !== 3) chips.push(`Dwelling: ${dwellingType.join(", ")}`);

    if (shopFrequency.length) chips.push(`Shop: ${shopFrequency.join(", ")}`);
    if (channelPref.length) chips.push(`Channel: ${channelPref.join(", ")}`);
    if (loyaltyMember !== "Any") chips.push(`Loyalty: ${loyaltyMember}`);

    if (preferredLanguage.length && preferredLanguage.length !== 2) chips.push(`Lang: ${preferredLanguage.join(", ")}`);

    chips.push(`Promo sensitivity ${promoSensitivity}%`);

    return chips;
  }, [
    ageRange,
    sex,
    selectedZones,
    urbanicity,
    selectedInterests,
    lifeEvents,
    petOwner,
    petTypes,
    householdSize,
    incomeRange,
    dwellingType,
    shopFrequency,
    channelPref,
    loyaltyMember,
    preferredLanguage,
    promoSensitivity,
  ]);

  const clearAll = () => {
    setAgeRange([18, 65]);
    setSex(["Male", "Female", "Other"]);
    setSelectedZones([]);
    setUrbanicity(["Urban", "Suburban", "Rural"]);
    setInterestQuery("");
    setSelectedInterests([]);
    setLifeEvents({
      recentMover: false,
      newParent: false,
      engagedMarried: false,
      newJob: false,
      newHomeOwner: false,
      student: false,
    });
    setPetOwner(false);
    setPetTypes([]);
    setHouseholdSize([1, 5]);
    setIncomeRange([40000, 150000]);
    setShopFrequency(["Weekly"]);
    setChannelPref(["Omnichannel"]);
    setLoyaltyMember("Any");
    setPromoSensitivity(70);
    setPreferredLanguage(["English", "French"]);
    setDwellingType(["House", "Condo", "Apartment"]);
  };

  const handleSave = () => {
    if (!targetName) return alert("Please enter a Target Name");

    const payload = {
      // Demographics
      ageRange,
      sex,
      householdSize,
      incomeRange,

      // Geo
      selectedZones,
      urbanicity,

      // Interests & attributes
      selectedInterests,
      lifeEvents,
      petOwner,
      petTypes,

      // Shopping
      shopFrequency,
      channelPref,
      loyaltyMember,
      promoSensitivity,

      // Language + housing
      preferredLanguage,
      dwellingType,

      // Stats
      audienceCount,
      matchScore,
      createdAt: new Date().toISOString(),
    };

    onSave(targetName, payload);
    setTargetName("");
    onClose();
  };

  if (!isOpen) return null;

  const TabButton = ({ label, icon: Icon }) => {
    const active = activeTab === label;
    return (
      <button
        onClick={() => setActiveTab(label)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all
          ${active ? "bg-red-900/30 border-red-500 text-white" : "bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"}`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-[1080px] h-[680px] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl flex overflow-hidden">
        {/* LEFT: Strategy / Meta */}
        <div className="w-[360px] border-r border-gray-800 bg-gray-800/50 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-red-500">
              <User2 className="h-5 w-5" />
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                Campaign Audience Builder
              </h2>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Target Segment Name
              </label>
              <input
                value={targetName}
                onChange={(e) => setTargetName(e.target.value)}
                placeholder="e.g. GTA Value Families"
                className="w-full bg-gray-950 border border-gray-700 rounded-md p-3 text-sm text-white focus:ring-1 focus:ring-red-500 outline-none"
              />
              <p className="text-[11px] text-gray-500 leading-snug">
                Designed for enterprise retail campaigns (Walmart / Metro / etc).
                Save as a reusable segment preset.
              </p>
            </div>

            {/* KPI tiles */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-gray-950/50 rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-xs font-bold">Estimated Reach</span>
                </div>
                <div className="text-lg font-black text-white tabular-nums">
                  {audienceCount.toLocaleString()}
                </div>
                <div className="text-[10px] text-gray-500">Addressable audience</div>
              </div>

              <div className="p-4 bg-gray-950/50 rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center gap-2 text-gray-400">
                  <Sparkles className="h-4 w-4 text-green-400" />
                  <span className="text-xs font-bold">Match Score</span>
                </div>
                <div className="text-lg font-black text-white tabular-nums">{matchScore}/100</div>
                <div className="text-[10px] text-gray-500">Precision strength</div>
              </div>
            </div>

            {/* “efficiency” bar */}
            <div className="p-4 bg-gray-950/50 rounded-xl border border-gray-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Reach Efficiency</span>
                <span className={`text-xs font-bold ${matchScore >= 75 ? "text-green-500" : matchScore >= 55 ? "text-yellow-500" : "text-red-500"}`}>
                  {matchScore >= 75 ? "High" : matchScore >= 55 ? "Balanced" : "Broad"}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${clamp(matchScore, 0, 100)}%` }} />
              </div>
              <div className="text-[10px] text-gray-500 leading-snug">
                Add interests + life events to increase precision. Keep geo + age broad to protect scale.
              </div>
            </div>

            {/* Filter chips */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Filter Summary
                </span>
                <button
                  onClick={clearAll}
                  className="text-[11px] text-gray-400 hover:text-white inline-flex items-center gap-2"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear all
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-[140px] overflow-auto pr-1">
                {filterChips.map((c, idx) => (
                  <Pill key={`${c}-${idx}`}>{c}</Pill>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="w-full py-3 bg-red-700 hover:bg-red-600 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Save className="h-4 w-4" /> Save Segment
            </button>
          </div>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-full border border-gray-700">
                <SlidersHorizontal className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-bold text-white">
                  Audience Filters
                  <span className="text-gray-500 font-normal"> • Retail Campaign Mode</span>
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="p-4 border-b border-gray-800 bg-gray-900">
            <div className="flex flex-wrap gap-2">
              <TabButton label="Demographics" icon={User2} />
              <TabButton label="Geo" icon={MapPin} />
              <TabButton label="Interests" icon={Tag} />
              <TabButton label="Life Events" icon={Home} />
              <TabButton label="Shopping" icon={ShoppingCart} />
              <TabButton label="Language" icon={Globe} />
              <TabButton label="Pets" icon={PawPrint} />
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {/* DEMOGRAPHICS */}
            {activeTab === "Demographics" && (
              <div className="space-y-8">
                <section className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Age Demographics
                  </label>
                  <div className="px-2 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border border-gray-800 bg-gray-950">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          Minimum
                        </div>
                        <input
                          type="number"
                          min={13}
                          max={99}
                          value={ageRange[0]}
                          onChange={(e) => setAgeRange([clamp(parseInt(e.target.value || "13", 10), 13, ageRange[1]), ageRange[1]])}
                          className="w-full mt-2 bg-transparent text-white text-sm outline-none"
                        />
                      </div>
                      <div className="p-3 rounded-xl border border-gray-800 bg-gray-950">
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                          Maximum
                        </div>
                        <input
                          type="number"
                          min={ageRange[0]}
                          max={100}
                          value={ageRange[1]}
                          onChange={(e) => setAgeRange([ageRange[0], clamp(parseInt(e.target.value || "65", 10), ageRange[0], 100)])}
                          className="w-full mt-2 bg-transparent text-white text-sm outline-none"
                        />
                      </div>
                    </div>

                    <input
                      type="range"
                      min="13"
                      max="100"
                      value={ageRange[1]}
                      onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value, 10)])}
                      className="w-full accent-red-600"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-gray-500">
                      <span>MIN: {ageRange[0]}</span>
                      <span>MAX: {ageRange[1]}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Sex
                  </label>
                  <div className="flex gap-2">
                    {["Male", "Female", "Other"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSex((prev) => toggleInArray(prev, s))}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                          sex.includes(s)
                            ? "bg-red-900/30 border-red-500 text-white"
                            : "bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-2 gap-4">
                  <section className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Household Size
                    </label>
                    <div className="p-4 rounded-xl border border-gray-800 bg-gray-950 space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{householdSize[0]} people</span>
                        <span>{householdSize[1]} people</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={householdSize[1]}
                        onChange={(e) => setHouseholdSize([householdSize[0], parseInt(e.target.value, 10)])}
                        className="w-full accent-red-600"
                      />
                      <div className="text-[10px] text-gray-500">
                        Useful for bulk-buy, family offers, and category targeting.
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      Household Income
                    </label>
                    <div className="p-4 rounded-xl border border-gray-800 bg-gray-950 space-y-3">
                      <div className="flex items-center justify-between text-xs text-gray-400 tabular-nums">
                        <span>${Math.round(incomeRange[0] / 1000)}k</span>
                        <span>${Math.round(incomeRange[1] / 1000)}k</span>
                      </div>
                      <input
                        type="range"
                        min="20000"
                        max="250000"
                        step="5000"
                        value={incomeRange[1]}
                        onChange={(e) => setIncomeRange([incomeRange[0], parseInt(e.target.value, 10)])}
                        className="w-full accent-red-600"
                      />
                      <div className="text-[10px] text-gray-500">
                        Helps differentiate premium vs value messaging.
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}

            {/* GEO */}
            {activeTab === "Geo" && (
              <div className="space-y-8">
                <section className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="h-3 w-3" /> Geographic Zone (Canada)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROVINCES.map((province) => (
                      <label
                        key={province}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedZones.includes(province)
                            ? "bg-blue-900/20 border-blue-500/50 text-blue-100"
                            : "bg-gray-950 border-gray-800 text-gray-500 hover:bg-gray-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedZones.includes(province)}
                          onChange={() => handleToggleZone(province)}
                        />
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center ${
                            selectedZones.includes(province) ? "bg-blue-500 border-blue-500" : "border-gray-600"
                          }`}
                        >
                          {selectedZones.includes(province) && <div className="h-2 w-2 bg-white rounded-full" />}
                        </div>
                        <span className="text-xs font-medium">{province}</span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Urbanicity
                  </label>
                  <div className="flex gap-2">
                    {["Urban", "Suburban", "Rural"].map((u) => (
                      <button
                        key={u}
                        onClick={() => setUrbanicity((prev) => toggleInArray(prev, u))}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                          urbanicity.includes(u)
                            ? "bg-purple-900/30 border-purple-500 text-white"
                            : "bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* INTERESTS */}
            {activeTab === "Interests" && (
              <div className="space-y-8">
                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Interests (Multi-select)
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-3 py-2">
                      <input
                        value={interestQuery}
                        onChange={(e) => setInterestQuery(e.target.value)}
                        placeholder="Search interests (e.g., Pet, Organic, Tech...)"
                        className="w-full bg-transparent outline-none text-sm text-white placeholder:text-gray-600"
                      />
                    </div>
                    <button
                      onClick={() => setSelectedInterests([])}
                      className="px-3 py-2 rounded-xl border border-gray-800 bg-gray-950 text-xs text-gray-400 hover:text-white"
                    >
                      Clear
                    </button>
                  </div>

                  {selectedInterests.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedInterests.map((i) => (
                        <Pill key={i} onRemove={() => setSelectedInterests((prev) => prev.filter((x) => x !== i))}>
                          {i}
                        </Pill>
                      ))}
                    </div>
                  )}
                </section>

                <section className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {filteredInterests.map((interest) => {
                      const active = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => setSelectedInterests((prev) => toggleInArray(prev, interest))}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            active
                              ? "bg-green-900/20 border-green-500/50 text-green-100"
                              : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                          }`}
                        >
                          <div className="text-xs font-bold">{interest}</div>
                          <div className="text-[10px] text-gray-500 mt-1">
                            {active ? "Selected" : "Click to select"}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* LIFE EVENTS */}
            {activeTab === "Life Events" && (
              <div className="space-y-8">
                <section className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Life Events (checkbox targeting)
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "recentMover", label: "Recent mover", hint: "Move-related offers, home setup, utilities" },
                      { key: "newParent", label: "New parent", hint: "Baby, diapers, formula, convenience" },
                      { key: "engagedMarried", label: "Engaged / Married", hint: "Registry, celebrations, home bundles" },
                      { key: "newJob", label: "New job", hint: "Commute, wardrobe, meal prep" },
                      { key: "newHomeOwner", label: "New homeowner", hint: "DIY, appliances, furniture" },
                      { key: "student", label: "Student", hint: "Budget, quick meals, dorm essentials" },
                    ].map((item) => {
                      const checked = lifeEvents[item.key];
                      return (
                        <label
                          key={item.key}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            checked
                              ? "bg-blue-900/20 border-blue-500/50 text-blue-100"
                              : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleLifeEvent(item.key)}
                              className="mt-1"
                            />
                            <div>
                              <div className="text-sm font-bold">{item.label}</div>
                              <div className="text-[11px] text-gray-500 mt-1">{item.hint}</div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Dwelling Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DWELLING.map((d) => (
                      <button
                        key={d}
                        onClick={() => setDwellingType((prev) => toggleInArray(prev, d))}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          dwellingType.includes(d)
                            ? "bg-red-900/30 border-red-500 text-white"
                            : "bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* SHOPPING */}
            {activeTab === "Shopping" && (
              <div className="space-y-8">
                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Shopping Frequency
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SHOP_FREQ.map((f) => (
                      <button
                        key={f}
                        onClick={() => setShopFrequency((prev) => toggleInArray(prev, f))}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          shopFrequency.includes(f)
                            ? "bg-green-900/20 border-green-500/50 text-green-100"
                            : "bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Channel Preference
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CHANNEL_PREF.map((c) => (
                      <button
                        key={c}
                        onClick={() => setChannelPref((prev) => toggleInArray(prev, c))}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          channelPref.includes(c)
                            ? "bg-blue-900/20 border-blue-500/50 text-blue-100"
                            : "bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Loyalty Membership
                  </label>
                  <div className="flex gap-2">
                    {["Any", "Yes", "No"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setLoyaltyMember(v)}
                        className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                          loyaltyMember === v
                            ? "bg-purple-900/30 border-purple-500 text-white"
                            : "bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500"
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Useful for “member-only” offers, points multipliers, and retention messaging.
                  </div>
                </section>

                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Promotion Sensitivity
                  </label>
                  <div className="p-4 rounded-xl border border-gray-800 bg-gray-950 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Low</span>
                      <span className="text-white font-bold tabular-nums">{promoSensitivity}%</span>
                      <span>High</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={promoSensitivity}
                      onChange={(e) => setPromoSensitivity(parseInt(e.target.value, 10))}
                      className="w-full accent-red-600"
                    />
                    <div className="text-[10px] text-gray-500">
                      Higher = respond better to discounts, bundles, and “rollback” messaging.
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* LANGUAGE */}
            {activeTab === "Language" && (
              <div className="space-y-8">
                <section className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Preferred Language
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l}
                        onClick={() => setPreferredLanguage((prev) => toggleInArray(prev, l))}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                          preferredLanguage.includes(l)
                            ? "bg-blue-900/20 border-blue-500/50 text-blue-100"
                            : "bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                  <div className="text-[11px] text-gray-500">
                    Helps localize offer copy and creative variants at scale.
                  </div>
                </section>
              </div>
            )}

            {/* PETS */}
            {activeTab === "Pets" && (
              <div className="space-y-8">
                <section className="space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Pet Ownership
                  </label>

                  <div className="p-4 rounded-xl border border-gray-800 bg-gray-950 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">Pet Owner</div>
                      <div className="text-[11px] text-gray-500">
                        Adds pet-category relevance (food, grooming, vet, accessories).
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const next = !petOwner;
                        setPetOwner(next);
                        if (!next) setPetTypes([]);
                      }}
                      className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                        petOwner
                          ? "bg-green-900/20 border-green-500/50 text-green-100"
                          : "bg-gray-900 border-gray-700 text-gray-400 hover:text-white"
                      }`}
                    >
                      {petOwner ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  {petOwner && (
                    <div className="space-y-3">
                      <div className="text-[11px] text-gray-500">Select pet types (optional):</div>
                      <div className="flex flex-wrap gap-2">
                        {PET_TYPES.map((p) => (
                          <button
                            key={p}
                            onClick={() => setPetTypes((prev) => toggleInArray(prev, p))}
                            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all ${
                              petTypes.includes(p)
                                ? "bg-red-900/30 border-red-500 text-white"
                                : "bg-gray-950 border-gray-700 text-gray-500 hover:border-gray-500"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
