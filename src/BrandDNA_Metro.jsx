import React, { useEffect, useState } from 'react';

const BrandDNA = ({ isDarkMode }) => {
  const [activeSection, setActiveSection] = useState('');

  // Scroll Spy Logic for Navigation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0.02 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  // Helper for conditional nav classes
  const getNavClass = (id) => {
    const baseClass = "block px-3 py-2 rounded-xl transition-all duration-200 border border-transparent";
    const activeClass = isDarkMode ? "bg-white/10 border-white/10 text-white" : "bg-red-50 border-red-100 text-red-600 font-semibold";
    const inactiveClass = isDarkMode ? "hover:bg-white/5 hover:border-white/10 text-slate-300" : "hover:bg-slate-100 text-slate-600";
    return activeSection === id ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  };

  return (
    <div className={`brand-dna-wrapper min-h-screen font-sans selection:bg-red-500 selection:text-white ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* --- STYLES & FONTS --- 
        In a production app, fonts usually go in index.html and styles in a CSS file.
        For this standalone component, we inject them here.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .brand-dna-wrapper {
          --brand-red: #D81E05;
          --ink: ${isDarkMode ? '#0B1220' : '#f8fafc'};
          --night: ${isDarkMode ? '#0A0F1D' : '#ffffff'};
          --text-main: ${isDarkMode ? '#ffffff' : '#0f172a'};
          --text-muted: ${isDarkMode ? 'rgba(203, 213, 225, 0.7)' : 'rgba(71, 85, 105, 0.8)'};
          
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: var(--text-main);
          background: ${isDarkMode 
            ? `radial-gradient(1200px 600px at 10% 10%, rgba(204,0,0,.14), transparent 60%),
               radial-gradient(900px 500px at 90% 20%, rgba(59,130,246,.12), transparent 55%),
               radial-gradient(900px 500px at 30% 90%, rgba(34,197,94,.10), transparent 55%),
               linear-gradient(180deg, var(--night), #070B14 60%, #050813)`
            : `radial-gradient(1200px 600px at 10% 10%, rgba(216,30,5,0.05), transparent 60%),
               linear-gradient(180deg, #f8fafc, #f1f5f9 60%, #e2e8f0)`};
        }

        .font-display { font-family: 'Inter', sans-serif; }
        
        /* Custom Utilities */
        .grid-overlay {
          background-image:
            linear-gradient(to right, rgba(148,163,184,.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,.06) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at 20% 0%, black, transparent 70%);
          -webkit-mask-image: radial-gradient(circle at 20% 0%, black, transparent 70%);
        }
        
        .glow-red { box-shadow: 0 0 0 1px rgba(204,0,0,.35), 0 10px 40px rgba(204,0,0,.18); }
        .glow-blue { box-shadow: 0 0 0 1px rgba(59,130,246,.25), 0 10px 40px rgba(59,130,246,.12); }
        .glow-green { box-shadow: 0 0 0 1px rgba(34,197,94,.25), 0 10px 40px rgba(34,197,94,.12); }
        
        .glass {
          background: ${isDarkMode 
            ? 'linear-gradient(180deg, rgba(15,23,42,.86), rgba(2,6,23,.72))' 
            : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'};
          border: 1px solid ${isDarkMode ? 'rgba(148,163,184,.16)' : 'rgba(203, 213, 225, 0.5)'};
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: ${isDarkMode ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'};
        }
        
        .nav-text { color: var(--text-muted); }
        .nav-active { color: var(--brand-red); font-weight: 600; }

        /* Animations */
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        .animate-float { animation: float 5s ease-in-out infinite; }
        
        @keyframes shimmer { 0%{background-position:0% 50%} 100%{background-position:100% 50%} }
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,.03), rgba(255,255,255,.10), rgba(255,255,255,.03));
          background-size: 200% 200%;
          animation: shimmer 3.5s linear infinite;
        }

        /* Custom Scrollbar */
        .brand-dna-wrapper ::-webkit-scrollbar { width:10px; }
        .brand-dna-wrapper ::-webkit-scrollbar-track { background: ${isDarkMode ? '#050813' : '#f1f5f9'}; }
        .brand-dna-wrapper ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#243045' : '#cbd5e1'}; border-radius:999px; }
        .brand-dna-wrapper ::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#2F3D57' : '#94a3b8'}; }
        
        html { scroll-behavior: smooth; }
      `}</style>

      {/* Background overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-70 grid-overlay z-0"></div>

      {/* Top bar */}
      <header className={`z-50 w-full ${isDarkMode ? 'bg-[#0A0F1D]' : 'bg-white/50'}`}>  
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="glass rounded-2xl px-5 py-4 flex items-center justify-between shadow-2xl relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-600/40 flex items-center justify-center glow-red">
                <span className="text-lg">🧬</span>
              </div>
              <div>
                <div className="font-display text-lg font-semibold tracking-tight">Brand DNA</div>
                <div className="text-xs text-slate-300/70">Visual system • Logo • Type • Photography • UI</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-200/70">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono">SYSTEM STATUS: STABLE</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5">
                  <span className="font-mono">v2</span>
                  <span className="text-slate-200/60">Metro reference</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 pb-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left nav */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="glass rounded-2xl p-5 sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs font-mono text-slate-200/70">NAV</div>
                <div className="text-xs text-slate-200/50">Jump</div>
              </div>

              <nav className="space-y-1 text-sm">
                {[
                  { id: 'essence', label: 'Brand Essence' },
                  { id: 'logo', label: 'Logo System' },
                  { id: 'color', label: 'Color' },
                  { id: 'type', label: 'Typography' },
                  { id: 'photo', label: 'Photography' },
                  { id: 'icon', label: 'Iconography' },
                  { id: 'layout', label: 'Layout & Grid' },
                  { id: 'ui', label: 'UI Components' },
                  { id: 'voice', label: 'Voice & Copy' },
                  { id: 'dont', label: 'Do Not Do' },
                ].map((link) => (
                  <a key={link.id} className={getNavClass(link.id)} href={`#${link.id}`}>
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="text-xs text-slate-200/60 mb-2">Quick rules</div>
                <ul className="text-xs text-slate-200/70 space-y-1">
                  <li>• Use <span className="text-white font-semibold">Brand Red</span> for CTAs & savings highlights.</li>
                  <li>• Keep layouts <span className="text-white font-semibold">scan-friendly</span>: price + action first.</li>
                  <li>• Photography: <span className="text-white font-semibold">human, practical, confident</span>.</li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 space-y-8 relative">

            {/* Hero */}
            <section className="glass rounded-3xl p-8 md:p-10 overflow-hidden relative">
              <div className="absolute -top-20 -right-16 w-[420px] h-[420px] bg-red-600/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-blue-500/10 rounded-full blur-3xl"></div>

              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7">
                  <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                    Metro.ca-inspired visual system (reference build).
                  </h1>
                  <p className="mt-4 text-slate-200/70 text-lg leading-relaxed">
                    A practical, highly visual spec modeled after metro.ca: logo usage, color & type tokens, photography direction, and UI patterns for promos, aisles, and product cards.
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-200/70">
                    <span className="w-2 h-2 rounded-full bg-[color:var(--brand-red)]"></span>
                    Inspired by <span className="text-white font-semibold">metro.ca</span> (not official). Use internal assets for production.
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5">Atoms → Molecules → Organisms</span>
                    <span className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5">Digital + Print ready</span>
                    <span className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5">Copy/paste tokens</span>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <a href="#logo" className="px-4 py-2.5 rounded-xl bg-[color:var(--brand-red)] text-white font-semibold hover:brightness-110 transition glow-red">
                      Start with Logo
                    </a>
                    <a href="#ui" className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition">
                      Jump to Components
                    </a>
                  </div>
                </div>

                <div className="md:col-span-5">
                  {/* Animated DNA visual */}
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/8 to-white/0 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer opacity-40"></div>

                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-mono text-slate-200/70">BRAND SIGNAL</div>
                        <div className="text-xs text-slate-200/50">heartbeat</div>
                      </div>

                      <div className="mt-5 grid grid-cols-6 gap-3">
                        {/* DNA bars */}
                        <div className="h-28 rounded-full bg-red-600/40 border border-red-600/50 animate-float"></div>
                        <div className="h-36 rounded-full bg-white/10 border border-white/10 animate-float" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-24 rounded-full bg-blue-500/20 border border-blue-500/25 animate-float" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-40 rounded-full bg-red-600/35 border border-red-600/45 animate-float" style={{ animationDelay: '0.3s' }}></div>
                        <div className="h-30 rounded-full bg-emerald-500/15 border border-emerald-500/20 animate-float" style={{ animationDelay: '0.4s' }}></div>
                        <div className="h-34 rounded-full bg-white/10 border border-white/10 animate-float" style={{ animationDelay: '0.5s' }}></div>
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                          <div className="text-xs text-slate-200/60 mb-1">Primary</div>
                          <div className="font-mono text-sm text-white">#D81E05</div>
                        </div>
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                          <div className="text-xs text-slate-200/60 mb-1">Type</div>
                          <div className="text-sm"><span className="font-display">System Sans</span> + <span className="font-semibold">Inter</span></div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </section>

            {/* Brand Essence */}
            <section id="essence" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Brand Essence</h2>
                <span className="text-xs font-mono text-slate-200/60">ESSENCE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 glow-red">
                  <div className="text-xs text-slate-200/60">Promise</div>
                  <div className="mt-2 text-xl font-semibold">Make grocery shopping feel easier.</div>
                  <p className="mt-3 text-sm text-slate-200/70 leading-relaxed">
                    Fast paths to <span className="text-white font-semibold">fresh</span>, <span className="text-white font-semibold">local</span>,
                    and <span className="text-white font-semibold">great value</span>—online and in store.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 glow-blue">
                  <div className="text-xs text-slate-200/60">Personality</div>
                  <div className="mt-2 text-xl font-semibold">Warm • Practical • Confident</div>
                  <p className="mt-3 text-sm text-slate-200/70 leading-relaxed">
                    Helpful and no‑nonsense. Skimmable deals, clear actions, and a friendly tone that respects people’s time.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 glow-green">
                  <div className="text-xs text-slate-200/60">Principles</div>
                  <ul className="mt-3 text-sm text-slate-200/75 space-y-2">
                    <li>• <span className="text-white font-semibold">Deals are scannable.</span> Price + size first.</li>
                    <li>• <span className="text-white font-semibold">Freshness is visual.</span> Real food, real texture.</li>
                    <li>• <span class="text-white font-semibold">Mobile-first.</span> Large tap targets, short copy.</li>
                    <li>• <span className="text-white font-semibold">One hero message.</span> One primary CTA per module.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-xs text-slate-200/60">Tagline direction</div>
                  <div className="mt-2 text-base font-semibold">“Your local grocery.” • “Your GO‑TO for savings.”</div>
                  <div className="mt-2 text-xs text-slate-200/70">Short, benefit-led, and unmistakably grocery.</div>
                </div>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-xs text-slate-200/60">Core benefits</div>
                  <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                    Fresh selection • Weekly flyer deals • Delivery / pick‑up convenience • Rewards & personalized offers
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-xs text-slate-200/60">Primary audiences</div>
                  <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                    Busy families • Weekly planners • Deal seekers • “What’s for dinner?” shoppers
                  </div>
                </div>
              </div>
            </section>

            {/* Logo */}
            <section id="logo" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Logo System</h2>
                <span className="text-xs font-mono text-slate-200/60">LOGO</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-red-600/12 rounded-full blur-3xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-semibold">Logo slot (SVG preferred)</div>
                      <div className="text-xs text-slate-200/60">Place real assets here</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <div className="text-xs text-slate-200/60 mb-2">Primary on white</div>
                        <div className="h-24 rounded-2xl bg-white text-slate-900 border border-white/20 flex items-center justify-center p-4">
                          <img src="/Metro1.png" alt="Metro Primary Logo" className="h-full w-auto object-contain" />
                        </div>
                        <div className="mt-3 text-xs text-slate-200/70">Use for most placements. Keep ample white space.</div>
                      </div>

                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <div className="text-xs text-slate-200/60 mb-2">Reverse on brand red</div>
                        <div className="h-24 rounded-2xl border border-red-600/40 flex items-center justify-center p-4" style={{ background: 'hsla(10, 94%, 53%, 1.00)' }}>
                          <img src="/Metro2.png" alt="Metro Reverse Logo" className="h-full w-auto object-contain" />
                        </div>
                        <div className="mt-3 text-xs text-slate-200/70">Use only on solid brand red or very dark surfaces.</div>
                      </div>
                    </div>

                    <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Clearspace & minimum size</div>
                        <div className="text-xs font-mono text-slate-200/60">USAGE</div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className="text-xs text-slate-200/60">Clearspace</div>
                          <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                            Minimum clearspace = height of the <span className="text-white font-semibold">“M”</span> around all sides.
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className="text-xs text-slate-200/60">Minimum width</div>
                          <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                            Digital: <span className="text-white font-semibold">96px</span> width (wordmark). Print: <span className="text-white font-semibold">20mm</span>.
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className="text-xs text-slate-200/60">Don’t</div>
                          <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                            Don’t stretch, outline, add drop shadows, or place on busy photography.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Logo variations</div>
                    <div className="text-xs font-mono text-slate-200/60">SYSTEM</div>
                  </div>

                  <div className="space-y-3 text-sm text-slate-200/75">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">1) Wordmark</div>
                      <div className="mt-1">Primary for headers, footers, packaging callouts, and app chrome.</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">2) Monochrome</div>
                      <div className="mt-1">Black / white only for low‑color contexts (receipts, emboss, stamps).</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">3) Co‑brand lockups</div>
                      <div className="mt-1">Keep partner marks optically balanced; never reduce Metro prominence below equal size.</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs text-slate-200/60 mb-2">Note</div>
                    <div className="text-xs text-slate-200/75 leading-relaxed">
                      This page is a <span className="text-white font-semibold">visual reference inspired by metro.ca</span>. For official assets/usage,
                      use Metro’s internal brand library.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Color */}
            <section id="color" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Color</h2>
                <span className="text-xs font-mono text-slate-200/60">COLOR TOKENS</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5 glow-red">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Primary</div>
                    <div className="text-xs font-mono text-slate-200/60">CTA / BRAND</div>
                  </div>

                  <div className="mt-4 flex items-center gap-5">
                    <div className="w-24 h-24 rounded-2xl bg-[color:var(--brand-red)] border border-red-600/40"></div>
                    <div className="flex-1">
                      <div className="font-mono text-2xl font-bold">#D81E05</div>
                      <div className="text-xs text-slate-200/70 mt-1">CSS: <span className="text-white">var(--brand-red)</span></div>
                      <div className="mt-3 text-xs text-slate-200/70 leading-relaxed">
                        Use for primary buttons, sale/offer emphasis, selected states, and critical affordances.
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-xs text-slate-200/60">Accessibility</div>
                    <div className="mt-2 text-xs text-slate-200/70 leading-relaxed">
                      Prefer white text on brand red; avoid small red text on white for long copy.
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Supporting palette</div>
                    <div className="text-xs font-mono text-slate-200/60">NEUTRALS + STATES</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-14 rounded-xl bg-white border border-white/20"></div>
                      <div className="mt-3 text-xs text-slate-200/70">Background</div>
                      <div className="font-mono text-sm font-semibold">#FFFFFF</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-14 rounded-xl" style={{ background: '#F6F7F8', border: '1px solid rgba(255,255,255,.12)' }}></div>
                      <div className="mt-3 text-xs text-slate-200/70">Surface</div>
                      <div className="font-mono text-sm font-semibold">#F6F7F8</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-14 rounded-xl" style={{ background: '#111827', border: '1px solid rgba(255,255,255,.12)' }}></div>
                      <div className="mt-3 text-xs text-slate-200/70">Ink</div>
                      <div className="font-mono text-sm font-semibold">#111827</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-14 rounded-xl" style={{ background: '#6B7280', border: '1px solid rgba(255,255,255,.12)' }}></div>
                      <div className="mt-3 text-xs text-slate-200/70">Muted</div>
                      <div className="font-mono text-sm font-semibold">#6B7280</div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Success</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl" style={{ background: '#16A34A' }}></div>
                        <div>
                          <div className="font-mono text-sm font-semibold">#16A34A</div>
                          <div className="text-xs text-slate-200/70">Confirmation, availability</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Warning</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl" style={{ background: '#F59E0B' }}></div>
                        <div>
                          <div className="font-mono text-sm font-semibold">#F59E0B</div>
                          <div className="text-xs text-slate-200/70">Important notices</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Info</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl" style={{ background: '#2563EB' }}></div>
                        <div>
                          <div className="font-mono text-sm font-semibold">#2563EB</div>
                          <div className="text-xs text-slate-200/70">Secondary emphasis</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs text-slate-200/60 mb-1">Red usage pattern</div>
                    <div className="text-xs text-slate-200/75 leading-relaxed">
                      Use brand red as a <span className="text-white font-semibold">signal</span> (CTA, savings, key nav state)—not as background for long, content-heavy screens.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Typography */}
            <section id="type" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Typography</h2>
                <span className="text-xs font-mono text-slate-200/60">TYPE</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Font stack</div>
                  <div className="mt-3 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs text-slate-200/60">Primary UI</div>
                    <div className="mt-1 text-sm text-slate-200/80 leading-relaxed">
                      System sans: <span className="font-mono text-white">-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs text-slate-200/60">Promo headline style</div>
                    <div className="mt-2 text-2xl font-extrabold uppercase tracking-tight">Limited‑time offer</div>
                    <div className="mt-1 text-xs text-slate-200/70">Bold, short, high-contrast. Keep to one line when possible.</div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs text-slate-200/60">Product hierarchy</div>
                    <div className="mt-3 space-y-2">
                      <div className="text-sm font-semibold">Product name</div>
                      <div className="text-xs text-slate-200/70">Brand • Size</div>
                      <div className="text-xl font-extrabold" style={{ color: '#D81E05' }}>$6.49</div>
                      <div className="text-xs text-slate-200/70">$1.86 /100 g</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Type scale</div>
                    <div className="text-xs font-mono text-slate-200/60">HIERARCHY</div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60 mb-2">Hero</div>
                      <div className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.05]">
                        Your GO‑TO for weekly savings.
                      </div>
                      <div className="mt-2 text-sm text-slate-200/70">One statement. One CTA. No sub‑clauses.</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <div className="text-xs text-slate-200/60 mb-2">Section title</div>
                        <div className="text-2xl font-bold tracking-tight">Flyer deals</div>
                        <div className="mt-2 text-sm text-slate-200/70">Use sentence case for navigation clarity.</div>
                      </div>
                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <div className="text-xs text-slate-200/60 mb-2">Body</div>
                        <p className="text-sm text-slate-200/80 leading-relaxed">
                          Keep copy short and helpful. Use bullet lists for conditions and details. Avoid long paragraphs in commerce flows.
                        </p>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60 mb-2">Microcopy</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">Shop now</div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">View the flyer</div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">Add to cart</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Photography */}
            <section id="photo" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Photography</h2>
                <span className="text-xs font-mono text-slate-200/60">PHOTO</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Style references (from metro.ca)</div>
                    <div className="text-xs text-slate-200/60">Used here as visual cues</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <figure className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      <img src="https://www.metro.ca/userfiles/image/animated-popup/2025/20251113/20251113-66029-mobile-on-en-v2.png" alt="Metro promo banner sample" className="w-full h-40 object-cover" />
                      <figcaption className="p-3 text-xs text-slate-200/70">Promo banners: bold type, clean surfaces.</figcaption>
                    </figure>
                    <figure className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      <img src="https://www.metro.ca/userfiles/image/accueil/2025/20251211/on/A1-M-Blitz-Upass-6-12month-ON-EN.png" alt="Metro offer banner sample" className="w-full h-40 object-cover" />
                      <figcaption className="p-3 text-xs text-slate-200/70">Offer modules: one message + strong CTA.</figcaption>
                    </figure>
                    <figure className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      <img src="https://product-images.metro.ca/images/h93/hb9/14391493656606.jpg" alt="Product photo sample" className="w-full h-40 object-cover bg-white" />
                      <figcaption className="p-3 text-xs text-slate-200/70">Product photography: clear label + accurate color.</figcaption>
                    </figure>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Photography principles</div>
                    <ul className="mt-3 text-sm text-slate-200/75 space-y-2">
                      <li>• Bright, natural light; true-to-life color.</li>
                      <li>• Fresh texture close-ups (produce, bakery, meals) to signal quality.</li>
                      <li>• Simple surfaces for price/offer overlays (avoid noisy backgrounds).</li>
                      <li>• People, when used: candid moments in kitchens and gatherings.</li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Do / Don’t</div>
                    <div className="text-xs font-mono text-slate-200/60">GUARDRAILS</div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Do</div>
                      <ul className="mt-2 text-sm text-slate-200/75 space-y-2">
                        <li>• Use high‑resolution images with minimal compression artifacts.</li>
                        <li>• Crop for appetite appeal (hero ingredient front-and-center).</li>
                        <li>• Keep overlays in high-contrast zones with breathing room.</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Don’t</div>
                      <ul className="mt-2 text-sm text-slate-200/75 space-y-2">
                        <li>• Don’t use heavy filters that distort product color.</li>
                        <li>• Don’t place price text over detailed textures or faces.</li>
                        <li>• Don’t mix lighting styles within the same module grid.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60 mb-1">Quick crops</div>
                      <div className="text-xs text-slate-200/75 leading-relaxed">
                        Use <span className="text-white font-semibold">16:9</span> for promos, <span className="text-white font-semibold">1:1</span> for product cards,
                        <span className="text-white font-semibold">4:3</span> for category tiles.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Iconography */}
            <section id="icon" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Iconography</h2>
                <span className="text-xs font-mono text-slate-200/60">ICON</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Style</div>
                  <p className="mt-3 text-sm text-slate-200/75 leading-relaxed">
                    Simple, familiar ecommerce icons. Favor clarity over personality: cart, search, menu, store, delivery, pickup.
                  </p>

                  <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl">🛒</div>
                      <div className="mt-2 text-xs text-slate-200/70">Cart</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl">🔎</div>
                      <div className="mt-2 text-xs text-slate-200/70">Search</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl">🏬</div>
                      <div className="mt-2 text-xs text-slate-200/70">Store</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl">🚚</div>
                      <div className="mt-2 text-xs text-slate-200/70">Delivery</div>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Rules</div>
                    <ul className="mt-3 text-sm text-slate-200/75 space-y-2">
                      <li>• Keep stroke weight consistent within a set.</li>
                      <li>• Default icons use <span className="text-white font-semibold">ink</span>; reserve red for active/selected states.</li>
                      <li>• Pair icons with labels for navigation (don’t rely on icon alone).</li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Active / selected states</div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60 mb-2">Default</div>
                      <div className="flex items-center gap-2 text-sm text-slate-200/80">
                        <span>🔎</span> Search
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60 mb-2">Active</div>
                      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#D81E05' }}>
                        <span>🔎</span> Search
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs text-slate-200/60 mb-1">Prefer SVG</div>
                    <div className="text-xs text-slate-200/75 leading-relaxed">
                      Use SVG icons with a shared grid (24px) and consistent optical alignment.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Layout & Grid */}
            <section id="layout" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Layout & Grid</h2>
                <span className="text-xs font-mono text-slate-200/60">LAYOUT</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Page structure (metro.ca‑like)</div>
                  <div className="mt-4 space-y-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Header</div>
                      <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                        Menu • Wordmark • Search • Account • Store selector • Cart.
                        Keep header compact and persistent; search is the primary job-to-be-done.
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Modules</div>
                      <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                        Promo banner → Category tiles → Product carousel → Secondary promos.
                        Maintain rhythm: <span className="text-white font-semibold">one strong hero</span>, then repeatable grids.
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Footer</div>
                      <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                        Utility links grouped by task (Deals, Grocery, Help, About). Avoid marketing-heavy clutter.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Spacing tokens</div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-200/70">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-white font-semibold">4</div> Micro gaps, chips
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-white font-semibold">8</div> List rows
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-white font-semibold">16</div> Card padding
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-white font-semibold">24</div> Section spacing
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Radius</div>
                    <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                      Use <span className="text-white font-semibold">12–16px</span> rounded corners for cards and inputs. Keep promo banners slightly squarer for a “retail” feel.
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Grid</div>
                    <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                      Desktop: 12‑col; Mobile: 4‑col. Product grids: 2‑up (mobile), 3–4‑up (desktop).
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* UI Components */}
            <section id="ui" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">UI Components</h2>
                <span className="text-xs font-mono text-slate-200/60">COMPONENTS</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold mb-4">Metro-style header + promo</div>

                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-white">
                    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,.08)' }}>
                      <button className="w-10 h-10 rounded-xl" style={{ background: '#D81E05', color: 'white', fontWeight: 800 }}>≡</button>
                      <div className="h-8 flex items-center">
                        <img src="/Metro1.png" alt="Metro Logo" className="h-full w-auto object-contain" />
                      </div>
                      <div className="flex-1"></div>

                      <div className="hidden md:flex items-center gap-2 text-sm" style={{ color: '#111827' }}>
                        <span className="font-semibold">My store</span><span style={{ opacity: .6 }}>•</span><span>Change</span>
                      </div>
                      <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#111827', color: 'white' }}>Sign in</button>
                      <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#D81E05', color: 'white' }}>Cart (0)</button>
                    </div>

                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,.08)' }}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#F6F7F8', border: '1px solid rgba(0,0,0,.08)' }}>
                          <span style={{ opacity: .6 }}>🔎</span>
                          <input className="w-full bg-transparent outline-none text-sm" placeholder="Search products, recipes and articles" />
                        </div>
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#D81E05', color: 'white' }}>Search</button>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,.08)' }}>
                        <img src="https://www.metro.ca/userfiles/image/accueil/2025/20251211/on/A1-M-Blitz-Upass-6-12month-ON-EN.png" alt="Promo banner example" className="w-full h-48 object-cover" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60 mb-2">Primary CTA</div>
                      <button className="w-full px-4 py-3 rounded-xl text-white font-extrabold uppercase tracking-tight glow-red" style={{ background: '#D81E05' }}>
                        Shop now
                      </button>
                      <div className="mt-2 text-xs text-slate-200/70">Use for one main action per module.</div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60 mb-2">Secondary CTA</div>
                      <button className="w-full px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition">
                        View the flyer
                      </button>
                      <div className="mt-2 text-xs text-slate-200/70">Neutral action with clear label.</div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60 mb-2">Tertiary link</div>
                      <a className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#D81E05' }} href="#">
                        Learn more <span aria-hidden="true">→</span>
                      </a>
                      <div className="mt-2 text-xs text-slate-200/70">Use for footnotes and conditions.</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold mb-4">Product card pattern</div>

                  <div className="rounded-2xl border border-white/10 bg-white overflow-hidden">
                    <div className="p-4 flex gap-4">
                      <div className="w-28 h-28 rounded-2xl bg-white border border-black/10 overflow-hidden flex items-center justify-center">
                        <img src="https://product-images.metro.ca/images/h93/hb9/14391493656606.jpg" className="w-full h-full object-cover" alt="Product" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs" style={{ color: '#6B7280' }}>Kraft Dinner</div>
                        <div className="text-base font-semibold" style={{ color: '#111827' }}>Macaroni and Havarti Cheddar Cheese</div>
                        <div className="text-xs mt-1" style={{ color: '#6B7280' }}>349 g</div>
                        <div className="mt-2 flex items-baseline gap-3">
                          <div className="text-2xl font-extrabold" style={{ color: '#D81E05' }}>$6.49</div>
                          <div className="text-xs" style={{ color: '#6B7280' }}>$1.86 /100 g</div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#D81E05', color: 'white' }}>Add to cart</button>
                          <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#111827', color: 'white' }}>♡</button>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="text-xs" style={{ color: '#6B7280' }}>
                        Prices may vary by store and time slot.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Category tile</div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-white text-slate-900 border border-black/10">
                        <div className="text-2xl">🥦</div>
                        <div className="mt-2 text-sm font-semibold">Fruits & Vegetables</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white text-slate-900 border border-black/10">
                        <div className="text-2xl">🥛</div>
                        <div className="mt-2 text-sm font-semibold">Dairy & Eggs</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-200/70">Tiles are simple, consistent, and scan-friendly.</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Voice */}
            <section id="voice" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Voice & Copy</h2>
                <span className="text-xs font-mono text-slate-200/60">VOICE</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">How Metro should sound</div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Tone</div>
                      <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                        Friendly and helpful—never jokey in checkout flows.
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Clarity</div>
                      <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                        Lead with the benefit. Put conditions in smaller text below.
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="text-xs text-slate-200/60">Confidence</div>
                      <div className="mt-2 text-sm text-slate-200/80 leading-relaxed">
                        Use direct verbs: Shop, View, Add, Pick up, Deliver.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Examples</div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-xs text-slate-200/60 mb-2">Promo headline</div>
                        <div className="text-lg font-extrabold uppercase tracking-tight">Limited‑time offer</div>
                        <div className="mt-1 text-sm text-slate-200/75">Get unlimited deliveries for $1.25/week.</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className="text-xs text-slate-200/60 mb-2">Helper text</div>
                        <div className="text-sm text-slate-200/80">Prices shown are valid until Wednesday and may change by time slot.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold mb-4">Copy rules</div>
                  <ul className="text-sm text-slate-200/75 space-y-2">
                    <li>• Use <span className="text-white font-semibold">sentence case</span> for navigation and forms.</li>
                    <li>• Use <span className="text-white font-semibold">uppercase</span> sparingly for promos and “sale” moments.</li>
                    <li>• Always include units: <span className="text-white font-semibold">g, kg, ea.</span></li>
                    <li>• Keep conditionals in footnotes, not the headline.</li>
                    <li>• Avoid negative language unless legally required (age gates, restrictions).</li>
                  </ul>

                  <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-xs text-slate-200/60 mb-1">Microcopy checklist</div>
                    <div className="text-xs text-slate-200/75 leading-relaxed">
                      CTA verb • Outcome clarity • Time sensitivity • Conditions link • Store/time slot context
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Do Not */}
            <section id="dont" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Do Not Do</h2>
                <span className="text-xs font-mono text-slate-200/60">DON’TS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Visual</div>
                  <ul className="mt-3 text-sm text-slate-200/75 space-y-2">
                    <li>• Don’t flood entire screens with brand red.</li>
                    <li>• Don’t mix multiple headline styles in the same promo zone.</li>
                    <li>• Don’t use low-res product imagery or inconsistent lighting.</li>
                    <li>• Don’t hide pricing hierarchy (price must be the fastest thing to find).</li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">UX</div>
                  <ul className="mt-3 text-sm text-slate-200/75 space-y-2">
                    <li>• Don’t make the primary CTA ambiguous (“Continue” → “Checkout now”).</li>
                    <li>• Don’t bury store/time slot selection—it affects price & availability.</li>
                    <li>• Don’t rely on icons alone for navigation.</li>
                    <li>• Don’t add motion that competes with price/offer reading.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                <div className="text-xs text-slate-200/60 mb-2">Rule of thumb</div>
                <div className="text-sm text-slate-200/80 leading-relaxed">
                  If a user can’t find <span className="text-white font-semibold">the price</span> and <span className="text-white font-semibold">the action</span> within
                  one glance, simplify the module.
                </div>
              </div>
            </section>

            <footer className="text-xs text-slate-200/50 px-2 pb-2">
              <div className="mt-2">Tip: Replace placeholders with your official assets + exact specs (clear-space, min-size, print rules).</div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandDNA;