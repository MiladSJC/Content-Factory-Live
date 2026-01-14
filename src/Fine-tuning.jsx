import React, { useState, useRef, useEffect } from 'react';
import { Loader2, Wand2, X, Plus, Image as ImageIcon, Save, Copy, Check, AlertCircle, Terminal } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = ({ className, variant = "default", size = "default", ...props }) => {
  const variants = {
    default: "bg-zinc-900 text-zinc-50 hover:bg-zinc-800 shadow-sm",
    outline: "border border-zinc-200 bg-white hover:bg-zinc-50 hover:text-zinc-900",
    ghost: "hover:bg-zinc-100 hover:text-zinc-900",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-12 rounded-md px-8 text-base",
    icon: "h-10 w-10",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export const FineTuneModal = ({ isOpen, onClose, onSaveModel }) => {
  const [modelName, setModelName] = useState('');
  const [samples, setSamples] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + samples.length > 3) {
      setError("Maximum 3 sample images allowed for analysis context.");
      return;
    }
    setError(null);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSamples(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    if (samples.length === 0) return setError("Please upload at least 1 sample image.");
    if (!modelName) return setError("Please give your model a unique name.");

    setAnalyzing(true);
    setGeneratedPrompt('');
    setError(null);

    try {
      const response = await fetch('http://localhost:5001/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: samples, model_name: modelName })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.prompt) {
        setGeneratedPrompt(data.prompt);
      } else {
        throw new Error("Server response missing 'prompt' field.");
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Failed to connect to backend (Is app.py running on port 8000?)");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!modelName || !generatedPrompt) return;
    onSaveModel(modelName, generatedPrompt);
    setModelName('');
    setSamples([]);
    setGeneratedPrompt('');
    setError(null);
    onClose();
  };

  const copyToClipboard = () => {
    if (!generatedPrompt) return;
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div
        className="w-full max-w-7xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-20 border-b border-zinc-100 px-8 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center text-amber-700 shadow-sm ring-1 ring-amber-200/50">
              <Wand2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Design Model Fine-Tuner</h2>
              <p className="text-sm text-zinc-500">Train the AI on brand guidelines using vision analysis.</p>
            </div>
          </div>
          <button onClick={onClose} className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar width increased by 10% */}
          <div className="w-[440px] xl:w-[495px] bg-zinc-50/50 border-r border-zinc-200 flex flex-col overflow-y-auto shrink-0">
            <div className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm font-medium leading-relaxed">{error}</div>
                </div>
              )}

              <section className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-zinc-900 text-white text-xs">1</span>
                  Model Identity
                </div>
                <div className="pl-9">
                  <input
                    className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none placeholder:text-zinc-400"
                    placeholder="Name your model (e.g. Holiday Flyer 2024)"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                  />
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between text-sm font-bold text-zinc-900 uppercase tracking-wider">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-zinc-900 text-white text-xs">2</span>
                    Reference Images
                  </div>
                  <span className="text-xs font-normal text-zinc-500 bg-zinc-200/50 px-2 py-1 rounded-full">{samples.length}/3</span>
                </div>

                <div className="pl-9 space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {samples.map((src, i) => (
                      <div key={i} className="relative aspect-video rounded-xl border border-zinc-200 overflow-hidden group shadow-sm bg-zinc-100 ring-1 ring-black/5">
                        {/* Using object-contain to ensure image isn't cropped */}
                        <img src={src} className="h-full w-full object-contain" alt="sample" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <button
                            onClick={() => setSamples(prev => prev.filter((_, idx) => idx !== i))}
                            className="scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all bg-white text-red-600 px-4 py-2 rounded-full font-medium shadow-lg flex items-center gap-2"
                          >
                            <X className="h-4 w-4" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {samples.length < 3 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video border-2 border-dashed border-zinc-300 rounded-xl flex flex-col items-center justify-center hover:bg-white hover:border-amber-500 hover:text-amber-600 transition-all group bg-zinc-100/50 text-zinc-400 gap-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Plus className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Upload Screenshot</span>
                      </button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
                </div>
              </section>
            </div>

            <div className="p-8 mt-auto border-t border-zinc-200 bg-white">
              <Button
                onClick={handleAnalyze}
                disabled={analyzing || samples.length === 0 || !modelName}
                size="lg"
                className="w-full gap-2 text-base shadow-lg shadow-zinc-500/20"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" /> Analyzing Styles...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" /> Analyze & Generate Prompt
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex-1 bg-[#1e1e1e] flex flex-col relative overflow-hidden">
            <div className="h-14 bg-[#252526] flex items-center justify-between px-6 border-b border-[#333] text-zinc-400 text-sm select-none">
              <div className="flex items-center gap-3">
                <Terminal className="h-4 w-4 text-blue-400" />
                <span className="font-mono text-zinc-300">generated_prompt.txt</span>
                {generatedPrompt && <span className="text-[10px] bg-green-900/30 text-green-400 px-2 py-0.5 rounded border border-green-900/50">Ready</span>}
              </div>
              {generatedPrompt && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-2 hover:text-white transition-colors text-xs bg-[#333] hover:bg-[#444] px-3 py-1.5 rounded-md"
                >
                  {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy to Clipboard"}
                </button>
              )}
            </div>

            <div className="flex-1 relative font-mono">
              {!generatedPrompt && !analyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 gap-6 select-none pointer-events-none">
                  <div className="h-20 w-20 rounded-3xl bg-[#252526] flex items-center justify-center ring-1 ring-[#333]">
                    <ImageIcon className="h-10 w-10 opacity-40" />
                  </div>
                  <div className="text-center max-w-sm space-y-2 px-6">
                    <h3 className="text-zinc-300 font-medium text-lg">Awaiting Analysis</h3>
                    <p className="text-sm leading-relaxed">Upload reference images on the left to begin. The AI will reverse-engineer a prompt matching your brand style.</p>
                  </div>
                </div>
              )}

              {analyzing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400 gap-6 bg-[#1e1e1e]/90 z-10 backdrop-blur-[2px]">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full animate-pulse"></div>
                    <Loader2 className="h-12 w-12 animate-spin relative z-10 text-blue-500" />
                  </div>
                  <div className="space-y-1 text-center">
                    <p className="text-sm font-medium text-zinc-200">Processing Visual Data...</p>
                    <p className="text-xs text-zinc-500">Extracting layout, fonts, and colors</p>
                  </div>
                </div>
              )}

              <textarea
                className={cn(
                  "w-full h-full bg-transparent text-[#d4d4d4] p-8 focus:outline-none resize-none leading-7 text-sm selection:bg-blue-500/30 transition-opacity",
                  analyzing ? "opacity-0" : "opacity-100"
                )}
                spellCheck="false"
                value={generatedPrompt}
                placeholder={!analyzing ? "// Prompt will appear here..." : ""}
                onChange={(e) => setGeneratedPrompt(e.target.value)}
              />
            </div>

            <div className="h-20 bg-[#252526] border-t border-[#333] px-8 flex items-center justify-between shrink-0">
              <div className="text-xs text-zinc-500">
                {generatedPrompt ? `${generatedPrompt.length} characters` : ""}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-[#333]">
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!generatedPrompt}
                  className="bg-blue-600 hover:bg-blue-500 text-white gap-2 pl-6 pr-6 shadow-lg shadow-blue-900/20 border border-blue-500/50"
                >
                  <Save className="h-4 w-4" /> Save Model
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};