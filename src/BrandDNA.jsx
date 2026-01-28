import React, { useEffect, useMemo, useState } from 'react';

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

  const assets = useMemo(() => {
    return {
      hyundaiLogoWhite:
        'https://www.hyundaicanada.com/-/media/hyundai/feature/global-navigation/hyundai-logo-white.svg',
      promoIoniq6N:
        'https://www.hyundaicanada.com/-/media/hyundai/coming-soon/2026-ioniq-6-n/promo-tiles/desktop-372x580/my26_nexo-d.jpg',
      promoNexo:
        'https://www.hyundaicanada.com/-/media/hyundai/showroom/2026/nexo/nexo---promo-tiles-assets/nexo_promo_d.jpg',
      promoCrater:
        'https://www.hyundaicanada.com/-/media/hyundai/coming-soon/concept-crater/hyundai_crater_images_website/2_promo_tile/crater_pt_td_372x580.jpg',
      promoSignup:
        'https://www.hyundaicanada.com/-/media/hyundai/homepage-content/2025/02_february/hac-homepage-newsletter/hac_newsletter_signup_tiles_d.jpg',
    };
  }, []);

  // Helper for conditional nav classes
  const getNavClass = (id) => {
    const baseClass =
      'block px-3 py-2 rounded-xl transition-all duration-200 border border-transparent';
    const activeClass = isDarkMode
      ? 'bg-white/10 border-white/10 text-white'
      : 'bg-sky-50 border-sky-100 text-sky-800 font-semibold';
    const inactiveClass = isDarkMode
      ? 'hover:bg-white/5 hover:border-white/10 text-slate-300'
      : 'hover:bg-slate-100 text-slate-700';
    return activeSection === id ? `${baseClass} ${activeClass}` : `${baseClass} ${inactiveClass}`;
  };

  return (
    <div
      className={`brand-dna-wrapper min-h-screen selection:bg-[color:var(--brand-blue)] selection:text-white ${
        isDarkMode ? 'text-white' : 'text-slate-900'
      }`}
    >
      {/* --- STYLES & FONTS ---
        In a production app, fonts usually go in index.html and styles in a CSS file.
        For this standalone component, we inject them here.

        Note: Hyundai’s official typefaces (e.g., Hyundai Sans) are typically licensed/internal.
        This component uses Inter as a fallback and includes brand-like stacks you can swap with self-hosted files.
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .brand-dna-wrapper {
          /* Brand tokens (approximate CSS tokens; adjust to your official brand library) */
          --brand-blue: #002C5F; /* Hyundai Blue reference */
          --brand-silver: #C7CED6;
          --brand-ink: #0B1220;
          --brand-night: ${isDarkMode ? '#070B14' : '#ffffff'};

          --text-main: ${isDarkMode ? '#ffffff' : '#0f172a'};
          --text-muted: ${isDarkMode ? 'rgba(203, 213, 225, 0.72)' : 'rgba(71, 85, 105, 0.86)'};

          font-family: "Hyundai Sans Head", "Hyundai Sans Text", Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
          color: var(--text-main);

          background: ${
            isDarkMode
              ? `radial-gradient(1100px 600px at 10% 10%, rgba(0,44,95,.22), transparent 60%),
                 radial-gradient(900px 520px at 85% 18%, rgba(199,206,214,.12), transparent 55%),
                 radial-gradient(900px 520px at 30% 92%, rgba(0,44,95,.16), transparent 55%),
                 linear-gradient(180deg, #060914, var(--brand-night) 60%, #040611)`
              : `radial-gradient(1100px 600px at 10% 10%, rgba(0,44,95,0.08), transparent 60%),
                 linear-gradient(180deg, #ffffff, #f7f9fc 60%, #eef2f7)`
          };
        }

        .font-display {
          font-family: "Hyundai Sans Head", Inter, system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
        }

        /* Custom Utilities */
        .grid-overlay {
          background-image:
            linear-gradient(to right, rgba(148,163,184,.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,.06) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: radial-gradient(circle at 20% 0%, black, transparent 70%);
          -webkit-mask-image: radial-gradient(circle at 20% 0%, black, transparent 70%);
        }

        .glow-blue {
          box-shadow: 0 0 0 1px rgba(0,44,95,.35), 0 10px 40px rgba(0,44,95,.18);
        }
        .glow-silver {
          box-shadow: 0 0 0 1px rgba(199,206,214,.22), 0 10px 40px rgba(199,206,214,.10);
        }
        .glow-ink {
          box-shadow: 0 0 0 1px rgba(11,18,32,.22), 0 10px 40px rgba(11,18,32,.12);
        }

        .glass {
          background: ${
            isDarkMode
              ? 'linear-gradient(180deg, rgba(15,23,42,.86), rgba(2,6,23,.72))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.75))'
          };
          border: 1px solid ${
            isDarkMode ? 'rgba(148,163,184,.16)' : 'rgba(203, 213, 225, 0.55)'
          };
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: ${isDarkMode ? 'none' : '0 8px 24px -10px rgb(0 0 0 / 0.18)'};
        }

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
        .brand-dna-wrapper ::-webkit-scrollbar-track { background: ${isDarkMode ? '#040611' : '#eef2f7'}; }
        .brand-dna-wrapper ::-webkit-scrollbar-thumb { background: ${isDarkMode ? '#22314A' : '#cbd5e1'}; border-radius:999px; }
        .brand-dna-wrapper ::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#2E415E' : '#94a3b8'}; }

        html { scroll-behavior: smooth; }
      `}</style>

      {/* Background overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-70 grid-overlay z-0" />

      {/* Top bar */}
      <header className={`z-50 w-full ${isDarkMode ? 'bg-[#070B14]' : 'bg-white/55'}`}>
        <div className="mx-auto max-w-[1400px] px-6 py-4">
          <div className="glass rounded-2xl px-5 py-4 flex items-center justify-between shadow-2xl relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[color:var(--brand-blue)]/15 border border-[color:var(--brand-blue)]/35 flex items-center justify-center glow-blue">
                <span className="text-lg">🚘</span>
              </div>
              <div>
                <div className="font-display text-lg font-semibold tracking-tight">Brand DNA</div>
                <div className={`text-xs ${isDarkMode ? 'text-slate-300/70' : 'text-slate-600/75'}`}>
                  Visual system • Logo • Type • Photography • UI
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isDarkMode ? 'border-white/10 bg-white/5 text-slate-200/75' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono">SYSTEM STATUS: STABLE</span>
                </span>

                <span
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                    isDarkMode ? 'border-white/10 bg-white/5 text-slate-200/75' : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <span className="font-mono">vHyundai</span>
                  <span className={`${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>Canada-inspired reference</span>
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
                <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600'}`}>
                  NAV
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-slate-200/50' : 'text-slate-500'}`}>Jump</div>
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
                <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                  Quick rules
                </div>
                <ul className={`text-xs space-y-1 ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/80'}`}>
                  <li>
                    • Use <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>Hyundai Blue</span> for primary CTAs and selected states.
                  </li>
                  <li>
                    • Keep layouts <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>calm & confident</span>: one hero message, clear next action.
                  </li>
                  <li>
                    • Photography: <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>premium, clean, human-centered</span>.
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="lg:col-span-9 space-y-8 relative">
            {/* Hero */}
            <section className="glass rounded-3xl p-8 md:p-10 overflow-hidden relative">
              <div className="absolute -top-20 -right-16 w-[420px] h-[420px] bg-[color:var(--brand-blue)]/14 rounded-full blur-3xl" />
              <div className="absolute -bottom-28 -left-28 w-[520px] h-[520px] bg-[color:var(--brand-silver)]/10 rounded-full blur-3xl" />

              <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-7">
                  <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                    Hyundai-inspired visual system (reference build).
                  </h1>
                  <p className={`mt-4 text-lg leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                    A clean, premium spec aligned to Hyundai’s design language: logo usage, color & type tokens, photography direction, and UI patterns for
                    vehicles, offers, and build journeys.
                  </p>

                  <div
                    className={`mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border ${
                      isDarkMode ? 'border-white/10 bg-white/5 text-slate-200/75' : 'border-slate-200 bg-white text-slate-700'
                    } text-xs`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[color:var(--brand-blue)]" />
                    Inspired by <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>Hyundai Canada</span> (not official). Use your internal brand library for production.
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5">
                      Calm • Confident • Human
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5">
                      Digital + Print ready
                    </span>
                    <span className="px-3 py-1.5 rounded-full text-xs border border-white/10 bg-white/5">
                      Copy/paste tokens
                    </span>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <a
                      href="#logo"
                      className="px-4 py-2.5 rounded-xl bg-[color:var(--brand-blue)] text-white font-semibold hover:brightness-110 transition glow-blue"
                    >
                      Start with Logo
                    </a>
                    <a
                      href="#ui"
                      className={`px-4 py-2.5 rounded-xl border font-semibold transition ${
                        isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      Jump to Components
                    </a>
                  </div>
                </div>

                <div className="md:col-span-5">
                  {/* Animated DNA visual */}
                  <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/8 to-white/0 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer opacity-40" />
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600'}`}>
                          BRAND SIGNAL
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-slate-200/50' : 'text-slate-500'}`}>
                          precision
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-6 gap-3">
                        <div className="h-28 rounded-full bg-[color:var(--brand-blue)]/45 border border-[color:var(--brand-blue)]/45 animate-float" />
                        <div className="h-36 rounded-full bg-white/10 border border-white/10 animate-float" style={{ animationDelay: '0.1s' }} />
                        <div className="h-24 rounded-full bg-[color:var(--brand-silver)]/20 border border-[color:var(--brand-silver)]/25 animate-float" style={{ animationDelay: '0.2s' }} />
                        <div className="h-40 rounded-full bg-[color:var(--brand-blue)]/35 border border-[color:var(--brand-blue)]/40 animate-float" style={{ animationDelay: '0.3s' }} />
                        <div className="h-30 rounded-full bg-white/10 border border-white/10 animate-float" style={{ animationDelay: '0.4s' }} />
                        <div className="h-34 rounded-full bg-[color:var(--brand-silver)]/18 border border-[color:var(--brand-silver)]/22 animate-float" style={{ animationDelay: '0.5s' }} />
                      </div>

                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                          <div className={`text-xs mb-1 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                            Primary
                          </div>
                          <div className="font-mono text-sm text-white">#002C5F</div>
                        </div>
                        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                          <div className={`text-xs mb-1 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                            Type
                          </div>
                          <div className="text-sm">
                            <span className="font-display">Hyundai Sans</span> (fallback <span className="font-semibold">Inter</span>)
                          </div>
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
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>ESSENCE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 glow-blue">
                  <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Vision</div>
                  <div className="mt-2 text-xl font-semibold">Progress for Humanity</div>
                  <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                    Progress becomes meaningful when it’s connected to humanity—design, technology, and service that help people move through life with confidence.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 glow-silver">
                  <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Personality</div>
                  <div className="mt-2 text-xl font-semibold">Premium • Calm • Precise</div>
                  <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                    Clean layouts, confident typography, and a restrained palette. Communicate capability without shouting.
                  </p>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 glow-ink">
                  <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Principles</div>
                  <ul className={`mt-3 text-sm space-y-2 ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                    <li>
                      • <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>One hero message.</span> One primary CTA per module.
                    </li>
                    <li>
                      • <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>Clarity first.</span> Specs and actions are easy to scan.
                    </li>
                    <li>
                      • <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>Human-centered.</span> People + vehicle in real contexts.
                    </li>
                    <li>
                      • <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>Confidence in detail.</span> Consistent spacing, alignment, and hierarchy.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Tagline direction</div>
                  <div className="mt-2 text-base font-semibold">“Progress for Humanity.” • “Confidence, engineered.”</div>
                  <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/80'}`}>
                    Short, benefit-led, and unmistakably Hyundai.
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Core benefits</div>
                  <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                    Design-forward vehicles • Safety tech • Electrified lineup • Ownership support & warranty
                  </div>
                </div>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Primary audiences</div>
                  <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                    EV adopters • Families • Commuters • Performance enthusiasts • Tech-minded buyers
                  </div>
                </div>
              </div>
            </section>

            {/* Logo */}
            <section id="logo" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Logo System</h2>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>LOGO</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5 relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-72 h-72 bg-[color:var(--brand-blue)]/12 rounded-full blur-3xl" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-semibold">Logo slot (SVG preferred)</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                        Replace with official assets from your brand library
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                          Primary on light surface
                        </div>
                        <div className="h-24 rounded-2xl bg-white text-slate-900 border border-black/10 flex items-center justify-center p-4">
                          <div className="flex items-center gap-3">
                            {/* Fallback: simple wordmark if SVG fails to load */}
                            <img
                              src={assets.hyundaiLogoWhite}
                              alt="Hyundai Logo (white SVG source; replace with dark variant in production)"
                              className="h-8 w-auto object-contain hidden"
                            />
                            <span className="font-display tracking-[0.18em] text-sm font-semibold text-slate-900">
                              HYUNDAI
                            </span>
                          </div>
                        </div>
                        <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                          Use a dark logo on light backgrounds (preferred). Keep generous clearspace.
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                        <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                          Reverse on Hyundai Blue
                        </div>
                        <div
                          className="h-24 rounded-2xl border flex items-center justify-center p-4"
                          style={{
                            background: 'var(--brand-blue)',
                            borderColor: 'rgba(255,255,255,.18)',
                          }}
                        >
                          <img
                            src={assets.hyundaiLogoWhite}
                            alt="Hyundai Reverse Logo"
                            className="h-10 w-auto object-contain"
                          />
                        </div>
                        <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                          Use only on solid blue or very dark surfaces for maximum contrast.
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">Clearspace & minimum size</div>
                        <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>
                          USAGE
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Clearspace</div>
                          <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                            Minimum clearspace = height of the <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>H mark</span> around all sides.
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Minimum width</div>
                          <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                            Digital: <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>96px</span> recommended for wordmark. Print: <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>20mm</span>.
                          </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Don’t</div>
                          <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
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
                    <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>
                      SYSTEM
                    </div>
                  </div>

                  <div className={`space-y-3 text-sm ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>1) Primary lockup</div>
                      <div className="mt-1">Use in headers/footers, hero intros, and brand signatures.</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>2) Monochrome</div>
                      <div className="mt-1">Black/white only for low-color contexts (emboss, stamps, compliance docs).</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>3) Co-brand lockups</div>
                      <div className="mt-1">Partner marks must be optically balanced; preserve Hyundai clearspace.</div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Note</div>
                    <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                      This is a <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>visual reference</span>. For official
                      assets and rules, use Hyundai’s internal brand system and legal guidance.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Color */}
            <section id="color" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Color</h2>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>COLOR TOKENS</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5 glow-blue">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Primary</div>
                    <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>
                      CTA / BRAND
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-5">
                    <div className="w-24 h-24 rounded-2xl bg-[color:var(--brand-blue)] border border-[color:var(--brand-blue)]/45" />
                    <div className="flex-1">
                      <div className="font-mono text-2xl font-bold">#002C5F</div>
                      <div className={`text-xs mt-1 ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        CSS: <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>var(--brand-blue)</span>
                      </div>
                      <div className={`mt-3 text-xs leading-relaxed ${isDarkMode ? 'text-slate-200/70' : 'text-slate-700/85'}`}>
                        Use for primary buttons, key navigation states, and hero emphasis. Avoid large “painted” screens—prefer blue as a precision signal.
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Accessibility</div>
                    <div className={`mt-2 text-xs leading-relaxed ${isDarkMode ? 'text-slate-200/70' : 'text-slate-700/85'}`}>
                      Prefer white text on Hyundai Blue; keep body copy in ink/charcoal for legibility.
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Supporting palette</div>
                    <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>
                      NEUTRALS + STATES
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-14 rounded-xl bg-white border border-black/10" />
                      <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        Background
                      </div>
                      <div className="font-mono text-sm font-semibold">#FFFFFF</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-14 rounded-xl" style={{ background: '#F4F6F9', border: '1px solid rgba(0,0,0,.08)' }} />
                      <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        Surface
                      </div>
                      <div className="font-mono text-sm font-semibold">#F4F6F9</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-14 rounded-xl" style={{ background: '#0B1220', border: '1px solid rgba(255,255,255,.10)' }} />
                      <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        Ink
                      </div>
                      <div className="font-mono text-sm font-semibold">#0B1220</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-14 rounded-xl" style={{ background: '#C7CED6', border: '1px solid rgba(0,0,0,.08)' }} />
                      <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        Silver
                      </div>
                      <div className="font-mono text-sm font-semibold">#C7CED6</div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Success</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl" style={{ background: '#16A34A' }} />
                        <div>
                          <div className="font-mono text-sm font-semibold">#16A34A</div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                            Confirmation, eligible, available
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Warning</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl" style={{ background: '#F59E0B' }} />
                        <div>
                          <div className="font-mono text-sm font-semibold">#F59E0B</div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                            Important notices
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Info</div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl" style={{ background: '#2563EB' }} />
                        <div>
                          <div className="font-mono text-sm font-semibold">#2563EB</div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                            Secondary emphasis
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                      Blue usage pattern
                    </div>
                    <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                      Use Hyundai Blue as a <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>precision signal</span> (CTA, active state, hero accents)—not as a default background for long content screens.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Typography */}
            <section id="type" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Typography</h2>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>TYPE</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Font stack</div>

                  <div className="mt-3 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                      Primary UI
                    </div>
                    <div className={`mt-1 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                      Preferred: <span className={isDarkMode ? 'text-white font-mono' : 'text-slate-900 font-mono'}>"Hyundai Sans Head", "Hyundai Sans Text"</span>
                      <br />
                      Fallback: <span className={isDarkMode ? 'text-white font-mono' : 'text-slate-900 font-mono'}>Inter, system-ui, -apple-system, "Segoe UI", Arial</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                      Headline style
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight">
                      Design that feels effortless.
                    </div>
                    <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                      Sentence case. Tight tracking. Plenty of whitespace.
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                      Vehicle hierarchy
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="text-xs" style={{ color: isDarkMode ? 'rgba(203,213,225,.75)' : 'rgba(71,85,105,.9)' }}>
                        Electrified • AWD available
                      </div>
                      <div className="text-base font-semibold">IONIQ 5</div>
                      <div className="text-xl font-extrabold" style={{ color: 'var(--brand-blue)' }}>
                        Build &amp; Price
                      </div>
                      <div className="text-xs" style={{ color: isDarkMode ? 'rgba(203,213,225,.75)' : 'rgba(71,85,105,.9)' }}>
                        Compare trims • Explore features
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-semibold">Type scale</div>
                    <div className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>
                      HIERARCHY
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                        Hero
                      </div>
                      <div className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
                        Progress for Humanity.
                      </div>
                      <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                        Keep to 1–2 lines. Avoid all-caps unless it’s a very short badge.
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                        Section title
                      </div>
                      <div className="font-display text-2xl font-semibold tracking-tight">
                        Explore vehicles.
                      </div>
                      <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                        Clear, direct, not clever.
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                        Body
                      </div>
                      <div className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        Use 14–16px with a comfortable line height. Prioritize scan-friendly bullets for features and eligibility details.
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                        Microcopy
                      </div>
                      <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                        Use short labels: “Build &amp; Price”, “Get Instant Quote”, “Compare”, “Find a Dealer”. Put conditions in smaller text below.
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
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>PHOTO</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Direction</div>
                  <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                    Clean, premium compositions. Prioritize natural light, controlled reflections, and credible environments. Show the vehicle as the hero,
                    but keep the human story present (arrival, departure, charging, family moments).
                  </p>

                  <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      <img src={assets.promoIoniq6N} alt="IONIQ 6 N promo tile" className="w-full h-44 object-cover" />
                      <div className="p-4">
                        <div className="text-sm font-semibold">Performance clarity</div>
                        <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                          Crisp edges, minimal clutter, confident stance.
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      <img src={assets.promoNexo} alt="NEXO promo tile" className="w-full h-44 object-cover" />
                      <div className="p-4">
                        <div className="text-sm font-semibold">Architectural calm</div>
                        <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                          Modern environments, neutral materials.
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      <img src={assets.promoCrater} alt="Concept promo tile" className="w-full h-44 object-cover" />
                      <div className="p-4">
                        <div className="text-sm font-semibold">Capability story</div>
                        <div className={`mt-1 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                          Landscape scale with readable vehicle details.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Rules</div>
                    <ul className={`mt-3 text-sm space-y-2 ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                      <li>• Use high-resolution images with clean gradients and controlled highlights.</li>
                      <li>• Keep overlays in low-detail regions with generous padding.</li>
                      <li>• Maintain consistent lighting per row/section.</li>
                      <li>• Prefer authentic moments (charging, commuting, weekend trips) over overly staged scenes.</li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Do / Don’t</div>

                  <div className="mt-4 space-y-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Do</div>
                      <ul className={`mt-2 text-sm space-y-2 ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        <li>• Show clear silhouettes with readable model identity.</li>
                        <li>• Use neutral, premium backdrops (glass, concrete, night city, open road).</li>
                        <li>• Feature human scale (door open, hands on wheel, charging cable).</li>
                      </ul>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Don’t</div>
                      <ul className={`mt-2 text-sm space-y-2 ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        <li>• Don’t use heavy filters that distort paint color or interior materials.</li>
                        <li>• Don’t place text on complex reflections or busy backgrounds.</li>
                        <li>• Don’t mix wildly different lighting styles in a single module grid.</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-1 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                        Crops
                      </div>
                      <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                        Use <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>16:9</span> for hero banners, <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>4:5</span> for tiles,
                        <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>1:1</span> for trims/feature cards.
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                      <img src={assets.promoSignup} alt="Hyundai newsletter tile" className="w-full h-40 object-cover rounded-xl" />
                      <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        Use editorial tiles sparingly; keep copy short and benefits clear.
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
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>ICON</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Style</div>
                  <p className={`mt-3 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                    Minimal, geometric, and consistent stroke weights. Icons should feel engineered: precise, balanced, and legible at small sizes.
                    Pair icons with labels in navigation and feature lists.
                  </p>

                  <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl">🚗</div>
                      <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>Vehicles</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl">⚡</div>
                      <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>Electrified</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl">🛡️</div>
                      <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>Safety</div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 text-center">
                      <div className="text-2xl">📍</div>
                      <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>Dealers</div>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Rules</div>
                    <ul className={`mt-3 text-sm space-y-2 ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                      <li>• Keep icon grid consistent (24px or 32px) with optical alignment.</li>
                      <li>
                        • Default icons use <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>ink</span>; reserve blue for active/selected states.
                      </li>
                      <li>• Avoid “cartoonish” metaphors; prefer direct symbols.</li>
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Active / selected states</div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Default</div>
                      <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-slate-200/85' : 'text-slate-700/90'}`}>
                        <span>⚡</span> Electrified
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Active</div>
                      <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--brand-blue)' }}>
                        <span>⚡</span> Electrified
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Prefer SVG</div>
                    <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                      Use SVG icons with a shared grid and consistent stroke weights. Emojis here are placeholders.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Layout & Grid */}
            <section id="layout" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Layout & Grid</h2>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>LAYOUT</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Page structure (Hyundai-style)</div>
                  <div className="mt-4 space-y-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Header</div>
                      <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        Logo • Vehicles • Build &amp; Price • Special Offers • Dealers.
                        Keep nav clean. Avoid overcrowding; use “More” menus for secondary content.
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Modules</div>
                      <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        Hero (model/innovation) → Model tiles → Feature highlights → Build journey.
                        Maintain rhythm: <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>one strong hero</span>, then consistent grids.
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Footer</div>
                      <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        Utility links grouped by tasks (Buy, Owners, About, Legal). Keep it structured and easy to scan.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Spacing tokens</div>
                  <div className={`mt-4 grid grid-cols-2 gap-4 text-xs ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>4</div> Micro gaps, chips
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>8</div> List rows
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>16</div> Card padding
                    </div>
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
                      <div className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>24</div> Section spacing
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Radius</div>
                    <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                      Use <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>12–16px</span> for cards and inputs. Keep banners slightly squarer for a more “automotive” feel.
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Grid</div>
                    <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                      Desktop: 12-col; Mobile: 4-col. Tiles: 2-up mobile, 3–4-up desktop. Keep consistent gutters.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* UI Components */}
            <section id="ui" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">UI Components</h2>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>COMPONENTS</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold mb-4">Hyundai-style header + hero</div>

                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-white">
                    {/* Header row */}
                    <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,.08)' }}>
                      <button
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: '#0B1220', color: 'white', fontWeight: 800 }}
                        aria-label="Open menu"
                      >
                        ≡
                      </button>

                      <div className="h-8 flex items-center">
                        <span className="font-display tracking-[0.18em] text-sm font-semibold text-slate-900">
                          HYUNDAI
                        </span>
                      </div>

                      <div className="hidden md:flex items-center gap-4 text-sm text-slate-700 ml-4">
                        <span className="font-semibold">Vehicles</span>
                        <span>Build &amp; Price</span>
                        <span>Special Offers</span>
                        <span>Find a Dealer</span>
                      </div>

                      <div className="flex-1" />

                      <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#0B1220', color: 'white' }}>
                        Sign in
                      </button>
                      <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#002C5F', color: 'white' }}>
                        Get Instant Quote
                      </button>
                    </div>

                    {/* Search row */}
                    <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,.08)' }}>
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                          style={{ background: '#F4F6F9', border: '1px solid rgba(0,0,0,.08)' }}
                        >
                          <span style={{ opacity: 0.6 }}>🔎</span>
                          <input
                            className="w-full bg-transparent outline-none text-sm"
                            placeholder="Search vehicles, trims, features"
                          />
                        </div>
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#002C5F', color: 'white' }}>
                          Search
                        </button>
                      </div>
                    </div>

                    {/* Hero */}
                    <div className="p-4">
                      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,.08)' }}>
                        <img src={assets.promoIoniq6N} alt="Hero banner example" className="w-full h-56 object-cover" />
                        <div className="p-4">
                          <div className="text-xs text-slate-500">High-performance • Electrified</div>
                          <div className="mt-1 text-xl font-semibold text-slate-900">A new paradigm for performance.</div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#002C5F', color: 'white' }}>
                              Build &amp; Price
                            </button>
                            <button className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#0B1220', color: 'white' }}>
                              View Gallery
                            </button>
                            <button className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: '#F4F6F9', color: '#0B1220', border: '1px solid rgba(0,0,0,.08)' }}>
                              Compare
                            </button>
                          </div>
                          <div className="mt-3 text-xs text-slate-500">
                            Example module. Replace with official offers, legal copy, and regional pricing rules.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Primary CTA</div>
                      <button
                        className="w-full px-4 py-3 rounded-xl text-white font-semibold glow-blue"
                        style={{ background: '#002C5F' }}
                      >
                        Build &amp; Price
                      </button>
                      <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        One primary action per module.
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Secondary CTA</div>
                      <button
                        className="w-full px-4 py-3 rounded-xl font-semibold transition"
                        style={{ background: '#0B1220', color: 'white' }}
                      >
                        View Inventory
                      </button>
                      <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        Helpful step without competing with primary CTA.
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Tertiary link</div>
                      <a className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#002C5F' }} href="#">
                        Learn more <span aria-hidden="true">→</span>
                      </a>
                      <div className={`mt-2 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                        Use for details, conditions, and supporting content.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold mb-4">Vehicle card pattern</div>

                  <div className="rounded-2xl border border-white/10 bg-white overflow-hidden">
                    <div className="p-4">
                      <div className="rounded-2xl overflow-hidden border border-black/10">
                        <img src={assets.promoNexo} className="w-full h-40 object-cover" alt="Vehicle" />
                      </div>

                      <div className="mt-4">
                        <div className="text-xs" style={{ color: '#64748b' }}>Fuel cell electric • Innovation</div>
                        <div className="text-base font-semibold" style={{ color: '#0B1220' }}>NEXO</div>
                        <div className="text-xs mt-1" style={{ color: '#64748b' }}>Explore trims, features, and ownership</div>

                        <div className="mt-3 flex items-baseline gap-3">
                          <div className="text-xl font-extrabold" style={{ color: '#002C5F' }}>
                            Build &amp; Price
                          </div>
                          <div className="text-xs" style={{ color: '#64748b' }}>Compare • Get quote</div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#002C5F', color: 'white' }}>
                            Build
                          </button>
                          <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#0B1220', color: 'white' }}>
                            Gallery
                          </button>
                          <button className="px-3 py-2 rounded-xl text-sm font-semibold" style={{ background: '#F4F6F9', color: '#0B1220', border: '1px solid rgba(0,0,0,.08)' }}>
                            ♡ Save
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 pb-4">
                      <div className="text-xs" style={{ color: '#64748b' }}>
                        Replace with market-specific availability, disclaimers, and pricing rules.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Category tiles</div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-white text-slate-900 border border-black/10">
                        <div className="text-2xl">⚡</div>
                        <div className="mt-2 text-sm font-semibold">Electrified</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-white text-slate-900 border border-black/10">
                        <div className="text-2xl">🛡️</div>
                        <div className="mt-2 text-sm font-semibold">Safety &amp; Tech</div>
                      </div>
                    </div>
                    <div className={`mt-3 text-xs ${isDarkMode ? 'text-slate-200/70' : 'text-slate-600/85'}`}>
                      Tiles are simple, consistent, and scan-friendly.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Voice */}
            <section id="voice" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Voice & Copy</h2>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>VOICE</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">How Hyundai should sound</div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Tone</div>
                      <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        Confident and calm—never gimmicky in purchasing flows.
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Clarity</div>
                      <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        Lead with the benefit. Put eligibility and conditions in smaller text below.
                      </div>
                    </div>
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                      <div className={`text-xs ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Precision</div>
                      <div className={`mt-2 text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                        Use direct verbs: Explore, Build, Compare, Book, Find, Get quote.
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="text-sm font-semibold">Examples</div>
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Headline</div>
                        <div className="text-lg font-semibold tracking-tight">Designed to move you.</div>
                        <div className={`mt-1 text-sm ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                          Explore electrified options and advanced safety technologies.
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                        <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Helper text</div>
                        <div className={`text-sm ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                          Offers, availability, and eligibility vary by province and model. See details for conditions.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold mb-4">Copy rules</div>
                  <ul className={`text-sm space-y-2 ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                    <li>
                      • Use <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>sentence case</span> for navigation and forms.
                    </li>
                    <li>
                      • Use <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>short badges</span> for trim highlights (e.g., “AWD”, “EV”, “N Line”).
                    </li>
                    <li>• Keep disclaimers clearly separated from the hero message.</li>
                    <li>• Avoid negative language unless legally required (safety/legal).</li>
                    <li>• Always define next step (“Build &amp; Price” beats “Continue”).</li>
                  </ul>

                  <div className="mt-6 p-4 rounded-2xl border border-white/10 bg-white/5">
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>
                      Microcopy checklist
                    </div>
                    <div className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-200/75' : 'text-slate-700/85'}`}>
                      CTA verb • Outcome clarity • Trim/model clarity • Conditions link • Dealer/region context
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Do Not */}
            <section id="dont" className="glass rounded-3xl p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">Do Not Do</h2>
                <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-200/60' : 'text-slate-500'}`}>DON’TS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">Visual</div>
                  <ul className={`mt-3 text-sm space-y-2 ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                    <li>• Don’t flood entire screens with Hyundai Blue.</li>
                    <li>• Don’t mix multiple headline styles in the same hero area.</li>
                    <li>• Don’t use low-res imagery or inconsistent lighting across tiles.</li>
                    <li>• Don’t overcrowd modules with too many CTAs.</li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                  <div className="text-sm font-semibold">UX</div>
                  <ul className={`mt-3 text-sm space-y-2 ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                    <li>• Don’t make the primary CTA ambiguous (“Continue” → “Build &amp; Price”).</li>
                    <li>• Don’t bury regional eligibility or dealer context if it changes outcomes.</li>
                    <li>• Don’t rely on icons alone for navigation.</li>
                    <li>• Don’t add motion that competes with reading or decision-making.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-5 rounded-2xl border border-white/10 bg-white/5">
                <div className={`text-xs mb-2 ${isDarkMode ? 'text-slate-200/60' : 'text-slate-600'}`}>Rule of thumb</div>
                <div className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-200/80' : 'text-slate-700/85'}`}>
                  If a user can’t find <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>the model</span> and <span className={isDarkMode ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>the next step</span> within one glance, simplify the module.
                </div>
              </div>
            </section>

            <footer className={`text-xs px-2 pb-2 ${isDarkMode ? 'text-slate-200/50' : 'text-slate-600/70'}`}>
              <div className="mt-2">
                Tip: Replace placeholders with your official Hyundai assets + exact specs (clear-space, min-size, legal, and regional pricing rules).
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BrandDNA;
