import React, { useState } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  AreaChart, Area,
  ComposedChart,
  ScatterChart, Scatter, ZAxis,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar
} from 'recharts';

// --- BRAND CONSTANTS ---
const COLORS = {
  red: '#CC0000',      // Metro Red
  dark: '#212121',     // Dark Gray
  gray: '#757575',     // Medium Gray
  light: '#E0E0E0',    // Light Gray
  green: '#10B981',    // Success Green
  blue: '#3B82F6',     // Info Blue (B2B)
  purple: '#8B5CF6',   // AI/Intelligence
  yellow: '#F59E0B',   // Warning
  competitors: {
    Metro: '#CC0000',
    amazon: '#FF9900',
    bestbuy: '#0046BE'
  },
  channels: {
    flyer: '#EF4444',
    carousel: '#F59E0B',
    animation: '#3B82F6',
    banner: '#10B981'
  }
};

// --- 1A. BUSINESS KPI DATA (Metro-level KPIs) ---
const BUSINESS_KPI_METRICS = {
  retail: [
    { label: 'Total Revenue', value: '$412,450', change: '+12.4%', isPositive: true, suffix: 'vs last period' },
    { label: 'Solutionshop Sales', value: '$85,200', change: '+8.1%', isPositive: true, suffix: 'print & tech' },
    { label: 'E-Comm Conversion', value: '3.4%', change: '-0.2%', isPositive: false, suffix: 'industry avg 2.8%' },
    { label: 'Avg Basket (AOV)', value: '$64.50', change: '+5.5%', isPositive: true, suffix: 'per txn' },
  ],
  b2b: [
    { label: 'Contract Revenue', value: '$890,100', change: '+4.2%', isPositive: true, suffix: 'contract spend' },
    { label: 'Active Accounts', value: '1,240', change: '+15', isPositive: true, suffix: 'new managed accts' },
    { label: 'Contract Compliance', value: '94%', change: '+1.2%', isPositive: true, suffix: 'on-contract spend' },
    { label: 'Avg Order Size', value: '$450.00', change: '-2.1%', isPositive: false, suffix: 'bulk orders' },
  ]
};

// --- 1B. CHANNEL KPI DATA (Omni / Media KPIs) ---
const CHANNEL_KPI_METRICS = {
  retail: [
    { label: 'Omni-Channel Rev', value: '$1.2M', change: '+12.4%', isPositive: true, suffix: 'attributed sales' },
    { label: 'Digital Flyer Reach', value: '850K', change: '+8.1%', isPositive: true, suffix: 'unique opens' },
    { label: 'Animation CTR', value: '4.2%', change: '+1.2%', isPositive: true, suffix: 'video engagement' },
    { label: 'Avg Basket (AOV)', value: '$68.50', change: '+5.5%', isPositive: true, suffix: 'per txn' },
  ],
  b2b: [
    { label: 'Contract Revenue', value: '$890K', change: '+4.2%', isPositive: true, suffix: 'contract spend' },
    { label: 'LinkedIn Reach', value: '45K', change: '+15%', isPositive: true, suffix: 'decision makers' },
    { label: 'Webinar Signups', value: '1,240', change: '+1.2%', isPositive: true, suffix: 'from banners' },
    { label: 'Avg Order Size', value: '$450.00', change: '-2.1%', isPositive: false, suffix: 'bulk orders' },
  ]
};

// --- 2. REVENUE + AI FORECAST (Composed Chart) ---
const REVENUE_DATA = [
  { date: 'Nov 01', actual: 4200, forecast: 4100 },
  { date: 'Nov 05', actual: 4800, forecast: 4900 },
  { date: 'Nov 10', actual: 5100, forecast: 5300 },
  { date: 'Nov 15', actual: 6800, forecast: 6500 },
  { date: 'Nov 20', actual: 5900, forecast: 6100 },
  { date: 'Nov 25', actual: 7200, forecast: 7400 },
  { date: 'Nov 30', actual: null, forecast: 8500 },
];

// --- 3. SOLUTIONSHOP / SERVICES MIX ---
const SERVICE_MIX = [
  { name: 'Print & Marketing', value: 45, color: COLORS.red },
  { name: 'Tech Services', value: 25, color: COLORS.dark },
  { name: 'Shipping (FedEx/Puro)', value: 20, color: COLORS.gray },
  { name: 'Passport Photos', value: 10, color: COLORS.light },
];

// --- 4. CANADIAN REGIONAL PERFORMANCE ---
const REGIONAL_DATA = [
  { region: 'ON (GTA)', retail: 85000, b2b: 120000, weather: 'Clear' },
  { region: 'BC (Lower Mainland)', retail: 45000, b2b: 65000, weather: 'Rain' },
  { region: 'AB (Calgary/Edm)', retail: 38000, b2b: 55000, weather: 'Snow Alert' },
  { region: 'QC (Montreal)', retail: 42000, b2b: 48000, weather: 'Clear' },
  { region: 'Atlantic', retail: 15000, b2b: 22000, weather: 'Wind' },
];

// --- 5. PRICE ELASTICITY (Discount vs Volume vs Margin) ---
const ELASTICITY_DATA = [
  { discount: 10, volume: 15, margin: 40, category: 'Paper' },
  { discount: 20, volume: 45, margin: 25, category: 'Laptops' },
  { discount: 5, volume: 5, margin: 50, category: 'Ink' },
  { discount: 30, volume: 80, margin: 10, category: 'Furniture' },
  { discount: 15, volume: 25, margin: 35, category: 'Breakroom' },
  { discount: 50, volume: 120, margin: 5, category: 'Clearance' },
];

// --- 6. LOGISTICS STATUS ---
const LOGISTICS_STATUS = [
  { hub: 'Brampton DC', status: 'Operational', load: '92%' },
  { hub: 'Calgary DC', status: 'Delay (Weather)', load: '45%' },
  { hub: 'Laval DC', status: 'Operational', load: '88%' },
  { hub: 'Delta DC', status: 'High Volume', load: '98%' },
];

// --- 7. CHANNEL EFFICIENCY (Radar) ---
const CHANNEL_EFFICIENCY = [
  { subject: 'Reach', flyer: 90, carousel: 60, animation: 50, banner: 80 },
  { subject: 'Engagement', flyer: 40, carousel: 85, animation: 95, banner: 30 },
  { subject: 'Conversion', flyer: 70, carousel: 55, animation: 60, banner: 85 },
  { subject: 'Cost Eff.', flyer: 50, carousel: 80, animation: 40, banner: 90 },
  { subject: 'Retention', flyer: 65, carousel: 75, animation: 80, banner: 45 },
];

// --- 8. CHANNEL ROI (Scatter/Bubble) ---
const CHANNEL_ROI = [
  { name: 'Digital Flyer', spend: 15000, roi: 6.5, revenue: 97500, color: COLORS.channels.flyer },
  { name: 'Social Carousel', spend: 5000, roi: 4.2, revenue: 21000, color: COLORS.channels.carousel },
  { name: 'Animation (Video)', spend: 12000, roi: 5.8, revenue: 69600, color: COLORS.channels.animation },
  { name: 'Web Banner', spend: 3000, roi: 8.5, revenue: 25500, color: COLORS.channels.banner },
];

// --- 9. ATTRIBUTION DATA ---
const ATTRIBUTION_DATA = [
  { channel: 'Flyer', firstTouch: 45000, lastTouch: 32000 },
  { channel: 'Carousel', firstTouch: 25000, lastTouch: 8000 },
  { channel: 'Animation', firstTouch: 30000, lastTouch: 15000 },
  { channel: 'Banner', firstTouch: 10000, lastTouch: 55000 },
];

// --- 10. SENTIMENT DATA ---
const SENTIMENT_DATA = [
  { name: 'Positive', value: 65, color: COLORS.green },
  { name: 'Neutral', value: 25, color: COLORS.gray },
  { name: 'Negative', value: 10, color: COLORS.red },
];

// --- 11. COMPETITOR PRICE INDEX ---
const COMPETITOR_DATA = [
  { date: 'Week 1', Metro: 100, amazon: 105, bestbuy: 102 },
  { date: 'Week 2', Metro: 98, amazon: 102, bestbuy: 99 },
  { date: 'Week 3', Metro: 95, amazon: 98, bestbuy: 97 }, // Campaign Discount
  { date: 'Week 4', Metro: 95, amazon: 94, bestbuy: 96 }, // Competitor Reaction
];

// --- 12. SUSTAINABILITY IMPACT ---
const ECO_DATA = [
  { name: 'Trees Saved', uv: 120, fill: COLORS.green },
  { name: 'Water (L) Saved', uv: 80, fill: COLORS.blue },
  { name: 'CO2 Offset', uv: 100, fill: COLORS.yellow },
];

// --- 13. INVENTORY VELOCITY ---
const VELOCITY_DATA = [
  { time: '9am', sales: 12 },
  { time: '11am', sales: 45 },
  { time: '1pm', sales: 82 },
  { time: '3pm', sales: 65 },
  { time: '5pm', sales: 90 },
  { time: '7pm', sales: 30 },
];

// --- 14. HEATMAP AXES ---
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEATMAP_HOURS = ['9am', '12pm', '3pm', '6pm', '9pm'];

function Analytics() {
  const [segment, setSegment] = useState('retail');
  const [timeframe, setTimeframe] = useState('This Month');

  const isB2B = segment === 'b2b';
  const primaryColor = isB2B ? COLORS.blue : COLORS.red;

  const businessKPIs = BUSINESS_KPI_METRICS[segment];
  const channelKPIs = CHANNEL_KPI_METRICS[segment];

  return (
    <div className="bg-gray-900 text-white min-h-screen p-6 space-y-6 animate-fadeIn font-sans">
      {/* --- TOP CONTROL BAR --- */}
      <div
        className="flex flex-col lg:flex-row justify-between items-center bg-gray-800 p-4 rounded-xl border-l-4 shadow-lg"
        style={{ borderColor: primaryColor }}
      >
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">{isB2B ? '🏢' : '🛒'}</span>
            {isB2B ? 'Metro Professional Intelligence' : 'Metro Retail & E-Comm Intelligence'}
          </h1>
          <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Data Pipeline • {isB2B ? 'B2B Contract Scope' : 'National Retail Scope'}
          </p>
        </div>

        <div className="flex bg-gray-900 p-1 rounded-lg mt-4 lg:mt-0">
          <button
            onClick={() => setSegment('retail')}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
              !isB2B ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Retail / Online
          </button>
          <button
            onClick={() => setSegment('b2b')}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
              isB2B ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Metro Professional
          </button>
        </div>
      </div>

      {/* --- ROW 1: BUSINESS KPIs --- */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Business KPIs
          </h2>
          <span className="text-xs text-gray-500">{timeframe}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {businessKPIs.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="text-6xl text-gray-400">📊</div>
              </div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                {kpi.label}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{kpi.value}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    kpi.isPositive
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}
                >
                  {kpi.change}
                </span>
                <span className="text-xs text-gray-500">{kpi.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ROW 2: CHANNEL KPIs --- */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">
            Omni-Channel & Media KPIs
          </h2>
          <span className="text-xs text-gray-500">Attributed to campaigns & content</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelKPIs.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm relative overflow-hidden group hover:border-gray-500 transition-colors"
            >
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                {kpi.label}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-bold text-white">{kpi.value}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                    kpi.isPositive
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-red-900/50 text-red-400'
                  }`}
                >
                  {kpi.change}
                </span>
                <span className="text-xs text-gray-500">{kpi.suffix}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN GRID: REVENUE + LOGISTICS / SOLUTIONSHOP --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue + AI Forecasting */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📈 Revenue Performance
                <span className="px-2 py-1 bg-purple-900/50 text-purple-400 text-[10px] rounded border border-purple-500/30">
                  AI FORECAST ENABLED
                </span>
              </h3>
              <p className="text-xs text-gray-400">Actuals vs. End-of-Period Prediction</p>
            </div>
            <select
              className="bg-gray-900 border border-gray-600 rounded px-3 py-1 text-xs"
              value={timeframe}
              onChange={e => setTimeframe(e.target.value)}
            >
              <option>This Month</option>
              <option>Last Quarter</option>
              <option>YTD</option>
            </select>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tickFormatter={val => `$${val}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke={primaryColor}
                  fill={primaryColor}
                  fillOpacity={0.15}
                  name="Actual Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke={COLORS.purple}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="AI Prediction"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supply Chain + Solutionshop Mix */}
        <div className="space-y-6">
          {/* Logistics */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-sm font-bold text-gray-300 uppercase mb-4 tracking-wider">
              🇨🇦 Supply Chain Status
            </h3>
            <div className="space-y-3">
              {LOGISTICS_STATUS.map((hub, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg"
                >
                  <div>
                    <div className="text-sm font-bold text-white">{hub.hub}</div>
                    <div className="text-xs text-gray-500">Load: {hub.load}</div>
                  </div>
                  <div
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      hub.status.includes('Delay')
                        ? 'bg-red-900 text-red-400'
                        : hub.status.includes('High')
                        ? 'bg-yellow-900 text-yellow-400'
                        : 'bg-green-900 text-green-400'
                    }`}
                  >
                    {hub.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solutionshop Mix */}
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-2">Solutionshop Mix</h3>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SERVICE_MIX}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {SERVICE_MIX.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">35%</span>
                <span className="text-[10px] text-gray-400">Print Growth</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CHANNEL DEEP DIVE: RADAR + ROI MATRIX --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-1">Channel Efficiency DNA</h3>
          <p className="text-xs text-gray-400 mb-4">Comparing strengths across generated assets</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={CHANNEL_EFFICIENCY}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Flyer"
                  dataKey="flyer"
                  stroke={COLORS.channels.flyer}
                  fill={COLORS.channels.flyer}
                  fillOpacity={0.1}
                />
                <Radar
                  name="Carousel"
                  dataKey="carousel"
                  stroke={COLORS.channels.carousel}
                  fill={COLORS.channels.carousel}
                  fillOpacity={0.1}
                />
                <Radar
                  name="Animation"
                  dataKey="animation"
                  stroke={COLORS.channels.animation}
                  fill={COLORS.channels.animation}
                  fillOpacity={0.1}
                />
                <Radar
                  name="Banner"
                  dataKey="banner"
                  stroke={COLORS.channels.banner}
                  fill={COLORS.channels.banner}
                  fillOpacity={0.1}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROI Matrix */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg relative">
          <div className="absolute top-4 right-4 text-xs text-gray-500 text-right">
            <p>Size = Total Revenue</p>
            <p>X = Spend | Y = ROI Multiplier</p>
          </div>
          <h3 className="text-lg font-bold text-white mb-4">Channel ROI Matrix</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  dataKey="spend"
                  name="Spend"
                  unit="$"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="roi"
                  name="ROI"
                  unit="x"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="revenue" range={[100, 1000]} name="Revenue" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1F2937' }}
                />
                <Scatter name="Channels" data={CHANNEL_ROI} fill="#8884d8">
                  {CHANNEL_ROI.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
                <Legend />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- MARKET & COMPETITIVE INTELLIGENCE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Price Index */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2">Competitor Price Index</h3>
          <p className="text-xs text-gray-400 mb-4">
            Indexed Pricing (100 = Baseline) vs Amazon & Best Buy
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={COMPETITOR_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis domain={[90, 110]} stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Metro"
                  stroke={COLORS.competitors.Metro}
                  strokeWidth={3}
                  name="Metro"
                />
                <Line
                  type="monotone"
                  dataKey="amazon"
                  stroke={COLORS.competitors.amazon}
                  strokeDasharray="5 5"
                  name="Amazon"
                />
                <Line
                  type="monotone"
                  dataKey="bestbuy"
                  stroke={COLORS.competitors.bestbuy}
                  strokeDasharray="5 5"
                  name="Best Buy"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Velocity */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2">Real-Time Inventory Velocity</h3>
          <p className="text-xs text-gray-400 mb-4">
            Units sold per hour (Top Campaign SKU)
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={VELOCITY_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke={COLORS.green}
                  fill={COLORS.green}
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- ATTRIBUTION & SENTIMENT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attribution */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Attribution Modeling</h3>
              <p className="text-xs text-gray-400">
                Comparing Awareness (First Touch) vs. Conversion (Last Touch)
              </p>
            </div>
            <div className="flex bg-gray-900 rounded p-1">
              <span className="px-3 py-1 text-xs font-bold text-gray-400">Model:</span>
              <span className="px-3 py-1 text-xs font-bold text-white bg-gray-700 rounded ml-2">
                Linear Comp.
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ATTRIBUTION_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="channel" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
                <Legend />
                <Bar
                  dataKey="firstTouch"
                  name="First Touch (Awareness)"
                  fill={COLORS.purple}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="lastTouch"
                  name="Last Touch (Sales)"
                  fill={COLORS.green}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Donut */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <span>🧠</span> AI Sentiment
          </h3>
          <p className="text-xs text-gray-400 mb-4">Social Comments Analysis</p>
          <div className="h-40 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SENTIMENT_DATA}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {SENTIMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-green-400">65%</span>
              <span className="text-[10px] text-gray-400">Positive</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SUSTAINABILITY & HEATMAP --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sustainability */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">🌱 Eco-Impact Tracker</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="10%" outerRadius="80%" barSize={10} data={ECO_DATA}>
                <RadialBar
                  minAngle={15}
                  label={{ position: 'insideStart', fill: '#fff' }}
                  background
                  clockWise
                  dataKey="uv"
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  wrapperStyle={{ top: 0, left: 0, lineHeight: '24px' }}
                />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-green-400 mt-2">
            Savings vs. Print Flyer equivalent
          </p>
        </div>

        {/* Engagement Heatmap */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Peak Engagement Heatmap</h3>
          <div className="grid grid-cols-8 gap-1">
            <div className="col-span-1"></div>
            {HEATMAP_DAYS.map(day => (
              <div
                key={day}
                className="text-center text-xs text-gray-400 font-bold"
              >
                {day}
              </div>
            ))}

            {HEATMAP_HOURS.map(hour => (
              <React.Fragment key={hour}>
                <div className="text-right pr-4 text-xs text-gray-400 font-bold self-center">
                  {hour}
                </div>
                {HEATMAP_DAYS.map(day => {
                  const intensity = Math.floor(Math.random() * 4);
                  const bgColors = [
                    'bg-gray-700',
                    'bg-red-900/40',
                    'bg-red-600/60',
                    'bg-red-500',
                  ];
                  return (
                    <div
                      key={`${day}-${hour}`}
                      className={`${bgColors[intensity]} h-8 rounded-sm hover:border hover:border-white transition-all`}
                    ></div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* --- REGIONAL PERFORMANCE & PRICE ELASTICITY --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold text-white mb-4">Regional Performance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REGIONAL_DATA} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" hide />
                <YAxis
                  dataKey="region"
                  type="category"
                  width={110}
                  stroke="#D1D5DB"
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: '#374151' }}
                  contentStyle={{ backgroundColor: '#1F2937' }}
                />
                <Legend />
                <Bar
                  dataKey="retail"
                  name="Retail Sales"
                  fill={COLORS.red}
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
                <Bar
                  dataKey="b2b"
                  name="Professional"
                  fill={COLORS.blue}
                  radius={[0, 4, 4, 0]}
                  barSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Elasticity */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Price Elasticity Analysis</h3>
              <p className="text-xs text-gray-400">
                Impact of discounts on volume & margin
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs bg-gray-700 px-2 py-1 rounded text-white">
                Category Level
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  dataKey="discount"
                  name="Discount %"
                  unit="%"
                  stroke="#9CA3AF"
                />
                <YAxis
                  type="number"
                  dataKey="volume"
                  name="Vol Lift"
                  unit="%"
                  stroke="#9CA3AF"
                />
                <ZAxis type="number" dataKey="margin" range={[50, 400]} name="Margin" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{ backgroundColor: '#1F2937' }}
                />
                <Scatter name="Categories" data={ELASTICITY_DATA} fill={primaryColor} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
