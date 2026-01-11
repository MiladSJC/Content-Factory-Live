import { useEffect, useState } from 'react';

// --- CONFIGURATION ---
// These files must exist in your public folder
const AUTO_LOAD_VIDEO_PATH = '/Video2/Video_IONIQ 5.mp4';
const AUTO_LOAD_CONFIG_PATH = '/Video2/Video_IONIQ 5.json';

function VideoEditor({
  // State and Setters (passed from parent)
  videoAssets, setVideoAssets,
  textOverlays, setTextOverlays,
  currentTime, setCurrentTime,
  duration, setDuration,
  isPlaying, setIsPlaying,
  transferData, setTransferData,
  activeVideoLanguage, setActiveVideoLanguage,
  
  // Refs
  videoRef,
  fileInputRef,
  configInputRef
}) {

  // Local state for auto-load feedback
  const [isLoading, setIsLoading] = useState(false);

  // --- Video Generation Logic ---
  
  // 1. Manual File Change (Fallback)
  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      if (videoAssets.url) {
        URL.revokeObjectURL(videoAssets.url);
      }
      
      const url = URL.createObjectURL(file);
      setVideoAssets({ file, url });
      setTextOverlays([]); 
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  // 2. Manual Config Change (Fallback)
  const handleConfigFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.endsWith('json')) {
      alert("Please select a valid .json config file.");
      return;
    }
    loadConfigFromBlob(file);
    if (configInputRef.current) configInputRef.current.value = null;
  };

  // Helper: Process Config Data (Shared between manual and auto)
  const processConfigData = (configData) => {
      if (configData && Array.isArray(configData.overlays)) {
          const updatedOverlays = configData.overlays.map(overlay => ({
              ...overlay,
              text_EN: overlay.text_EN || overlay.text || 'EN Text',
              text_FR: overlay.text_FR || 'FR Text',
              text_CANTONESE: overlay.text_CANTONESE || 'Cantonese Text',
              text: undefined, 
          }));
          setTextOverlays(updatedOverlays);
          return true;
      }
      return false;
  };

  const loadConfigFromBlob = (blob) => {
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const configData = JSON.parse(event.target.result);
              if (processConfigData(configData)) {
                  alert("Configuration loaded successfully.");
              } else {
                  alert("Invalid config file. Could not find 'overlays' array.");
              }
          } catch (error) {
              alert(`Error parsing config file: ${error.message}`);
          }
      };
      reader.readAsText(blob);
  };
  
  // --- NEW: AUTO-LOADER FUNCTION ---
  const handleAutoLoad = async () => {
    if (videoAssets.url) {
        // If a video is already loaded, ask if they want to reload/reset
        if (!window.confirm("A video is already loaded. Do you want to replace it with the auto-load preset?")) {
            return;
        }
    }

    setIsLoading(true);
    try {
        // 1. Load Video
        const videoRes = await fetch(AUTO_LOAD_VIDEO_PATH);
        if (!videoRes.ok) throw new Error(`Video not found at ${AUTO_LOAD_VIDEO_PATH}`);
        const videoBlob = await videoRes.blob();
        
        // Clean up old URL
        if (videoAssets.url) URL.revokeObjectURL(videoAssets.url);

        const videoUrl = URL.createObjectURL(videoBlob);
        // Create a fake File object for consistency
        const videoFile = new File([videoBlob], "Video_IONIQ 5.mp4", { type: "video/mp4" });
        
        setVideoAssets({ file: videoFile, url: videoUrl });
        setCurrentTime(0);
        setIsPlaying(false);

        // 2. Load Config
        const configRes = await fetch(AUTO_LOAD_CONFIG_PATH);
        if (!configRes.ok) throw new Error(`Config not found at ${AUTO_LOAD_CONFIG_PATH}`);
        const configData = await configRes.json();
        
        if (processConfigData(configData)) {
            console.log("Auto-loaded video and config successfully.");
        } else {
            console.warn("Auto-loaded config was invalid.");
        }

    } catch (error) {
        console.error("Auto-load failed:", error);
        alert(`Auto-load failed. \nEnsure "Video_IONIQ 5.mp4" and "Video_IONIQ 5.json" are in "public/Video2/".\n\nError: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleImportHeadlinesToVideo = () => {
    if (!transferData || transferData.length === 0) {
        alert("No carousel headline data available to import.");
        return;
    }

    const newOverlays = transferData.map((data, index) => {
        const defaultStartTime = index * 2; 
        
        return {
            id: Date.now() + index,
            text_EN: data.text_EN,
            text_FR: data.text_FR,
            text_CANTONESE: data.text_CANTONESE,
            startTime: defaultStartTime, 
            endTime: defaultStartTime + 3, 
            x: 50, 
            y: 50, 
            fontSize: 44, 
            color: '#ffffff',
            entryTransition: 'fadeIn',
            exitTransition: 'fadeOut',
            transitionDuration: 0.5
        };
    });

    setTextOverlays(prev => [...prev, ...newOverlays]);
    setTransferData(null); 
    alert(`Successfully imported ${newOverlays.length} headlines with default video settings.`);
  };

  const handleExportConfig = () => {
    if (textOverlays.length === 0) {
      alert("Please add at least one overlay to export.");
      return;
    }

    const cleanedOverlays = textOverlays.map(overlay => {
      const { text, ...rest } = overlay; 
      return {
          ...rest,
          text_EN: rest.text_EN || 'EN Text',
          text_FR: rest.text_FR || 'FR Text',
          text_CANTONESE: rest.text_CANTONESE || 'Cantonese Text',
      };
    });

    const configData = {
      videoName: videoAssets.file?.name || null,
      overlays: cleanedOverlays
    };

    const jsonString = JSON.stringify(configData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    let fileName = 'video-config.json';
    if (videoAssets.file?.name) {
      fileName = videoAssets.file.name.split('.').slice(0, -1).join('.') + '-config.json';
    }

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(
        "Configuration exported successfully!\n\n" +
        "NOTE: Due to browser security restrictions, the file was saved to your " +
        "default downloads folder. Please move it to your desired destination."
    );
  };


  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoUrl = videoAssets.url;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const updatePlayState = () => setIsPlaying(!video.paused);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', updatePlayState);
    video.addEventListener('pause', updatePlayState);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', updatePlayState);
      video.removeEventListener('pause', updatePlayState);
      if (!videoUrl && videoAssets.url) {
        URL.revokeObjectURL(videoAssets.url);
      }
    };
  }, [videoAssets.url, videoRef, setCurrentTime, setDuration, setIsPlaying]); 

  const addTextOverlay = () => {
    const newOverlay = {
      id: Date.now(),
      text_EN: 'New English Text',
      text_FR: 'Nouveau Texte Français',
      text_CANTONESE: '新廣東話文本',
      startTime: currentTime,
      endTime: currentTime + 3,
      x: 50,
      y: 50,
      fontSize: 32,
      color: '#ffffff',
      entryTransition: 'fadeIn',
      exitTransition: 'fadeOut',
      transitionDuration: 0.5
    };
    setTextOverlays([...textOverlays, newOverlay]);
  };

  const updateOverlay = (id, property, value) => {
    setTextOverlays(textOverlays.map(overlay =>
      overlay.id === id ? { ...overlay, [property]: value } : overlay
    ));
  };

  const deleteOverlay = (id) => {
    setTextOverlays(textOverlays.filter(overlay => overlay.id !== id));
  };

  const isOverlayVisible = (overlay) => {
    return currentTime >= overlay.startTime && currentTime <= overlay.endTime;
  };

  const getAnimationClass = (overlay) => {
    const timeInOverlay = currentTime - overlay.startTime;
    const timeUntilEnd = overlay.endTime - currentTime;

    if (timeInOverlay < overlay.transitionDuration) {
      return `animate-${overlay.entryTransition}`;
    } else if (timeUntilEnd < overlay.transitionDuration) {
      return `animate-${overlay.exitTransition}`;
    }
    return '';
  };
  
  const getOverlayText = (overlay) => {
      switch (activeVideoLanguage) {
          case 'FR':
              return overlay.text_FR;
          case 'CANTONESE':
              return overlay.text_CANTONESE;
          case 'EN':
          default:
              return overlay.text_EN;
      }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const currentVideoUrl = videoAssets.url;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Hidden inputs for manual fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoFileChange}
        className="hidden"
      />
      <input
        ref={configInputRef}
        type="file"
        accept=".json"
        onChange={handleConfigFileChange}
        className="hidden"
      />

      {/* Controls column */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-4">Text Overlays</h2>

          {transferData && (
              <button
                  onClick={handleImportHeadlinesToVideo}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 rounded-lg font-semibold mb-4 text-sm"
              >
                  ✨ Import {transferData.length} Carousel Headings
              </button>
          )}

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Switch Language</label>
            <div className="flex gap-2">
                {['EN', 'FR', 'CANTONESE'].map(lang => (
                    <button
                        key={lang}
                        onClick={() => setActiveVideoLanguage(lang)}
                        className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition-colors ${
                            activeVideoLanguage === lang
                                ? 'bg-red-600 text-white' // Staples Red
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                    >
                        {lang}
                    </button>
                ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => configInputRef.current?.click()}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded-lg font-semibold text-sm"
            >
              Import Config
            </button>
            <button
              onClick={handleExportConfig}
              disabled={textOverlays.length === 0}
              className="w-full bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed py-2 px-3 rounded-lg font-semibold text-sm"
            >
              Export Config
            </button>
          </div>

          <button
            onClick={addTextOverlay}
            disabled={!currentVideoUrl}
            className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold mb-4" 
          >
            + Add Text at Current Time
          </button>

          {textOverlays.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No text overlays yet</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {textOverlays.map(overlay => (
                <div key={overlay.id} className="bg-gray-700 rounded-lg p-3 space-y-2">
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-300 flex justify-between items-center">
                        <span>Text ({activeVideoLanguage})</span>
                        <span className="text-xs text-gray-400">ID: {overlay.id}</span>
                    </h4>
                    <input
                        type="text"
                        value={getOverlayText(overlay)}
                        onChange={(e) => updateOverlay(overlay.id, `text_${activeVideoLanguage}`, e.target.value)}
                        className="bg-gray-800 px-2 py-1 rounded w-full text-sm"
                    />
                  </div>


                  <div className="grid grid-cols-5 gap-1 text-xs">
                    <div>
                      <label className="text-gray-400 block mb-1">Start</label>
                      <input
                        type="number"
                        step="0.1"
                        value={overlay.startTime}
                        onChange={(e) => updateOverlay(overlay.id, 'startTime', parseFloat(e.target.value))}
                        className="bg-gray-800 px-1 py-1 rounded w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">End</label>
                      <input
                        type="number"
                        step="0.1"
                        value={overlay.endTime}
                        onChange={(e) => updateOverlay(overlay.id, 'endTime', parseFloat(e.target.value))}
                        className="bg-gray-800 px-1 py-1 rounded w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">X</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={overlay.x}
                        onChange={(e) => updateOverlay(overlay.id, 'x', parseFloat(e.target.value))}
                        className="bg-gray-800 px-1 py-1 rounded w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Y</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={overlay.y}
                        onChange={(e) => updateOverlay(overlay.id, 'y', parseFloat(e.target.value))}
                        className="bg-gray-800 px-1 py-1 rounded w-full text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Size</label>
                      <input
                        type="number"
                        min="16"
                        max="72"
                        value={overlay.fontSize}
                        onChange={(e) => updateOverlay(overlay.id, 'fontSize', parseInt(e.target.value))}
                        className="bg-gray-800 px-1 py-1 rounded w-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-xs">
                    <div>
                      <label className="text-gray-400 block mb-1">Color</label>
                      <input
                        type="color"
                        value={overlay.color}
                        onChange={(e) => updateOverlay(overlay.id, 'color', e.target.value)}
                        className="w-full h-6 rounded cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Entry</label>
                      <select
                        value={overlay.entryTransition}
                        onChange={(e) => updateOverlay(overlay.id, 'entryTransition', e.target.value)}
                        className="bg-gray-800 px-1 py-1 rounded w-full text-xs"
                      >
                        <option value="fadeIn">Fade In</option>
                        <option value="slideInLeft">←</option>
                        <option value="slideInRight">→</option>
                        <option value="slideInTop">↑</option>
                        <option value="slideInBottom">↓</option>
                        <option value="zoomIn">Zoom</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-400 block mb-1">Exit</label>
                      <select
                        value={overlay.exitTransition}
                        onChange={(e) => updateOverlay(overlay.id, 'exitTransition', e.target.value)}
                        className="bg-gray-800 px-1 py-1 rounded w-full text-xs"
                      >
                        <option value="fadeOut">Fade Out</option>
                        <option value="slideOutLeft">←</option>
                        <option value="slideOutRight">→</option>
                        <option value="slideOutTop">↑</option>
                        <option value="slideOutBottom">↓</option>
                        <option value="zoomOut">Zoom</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-1">
                      <div className="flex-1">
                        <label className="text-gray-400 block mb-1">Speed</label>
                        <input
                          type="number"
                          min="0.1"
                          max="2"
                          step="0.1"
                          value={overlay.transitionDuration}
                          onChange={(e) => updateOverlay(overlay.id, 'transitionDuration', parseFloat(e.target.value))}
                          className="bg-gray-800 px-1 py-1 rounded w-full text-xs"
                        />
                      </div>
                      <button
                        onClick={() => deleteOverlay(overlay.id)}
                        className="bg-red-600 hover:bg-red-700 h-6 w-6 rounded text-sm mb-1" 
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-300">Video Preview</h3>
            <button
                onClick={() => alert('Export MP4 clicked (not implemented)')}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-5 rounded-lg font-semibold text-base"
            >
                Export MP4
            </button>
        </div>

        {!currentVideoUrl ? ( 
          <div
            // CHANGED: Now calls handleAutoLoad instead of fileInputRef
            onClick={handleAutoLoad}
            className="bg-gray-800 rounded-lg p-12 border-2 border-dashed border-gray-600 cursor-pointer hover:border-red-500 transition-colors text-center relative"
          >
            {isLoading && (
               <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg z-10">
                  <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white font-bold">Auto-loading Preset...</p>
               </div>
            )}
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-xl text-gray-400">Click to upload video</p>
            <p className="text-sm text-gray-500 mt-2">MP4, MOV, AVI, etc.</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="relative bg-black">
              <video
                ref={videoRef}
                src={currentVideoUrl}
                className="w-full"
                style={{ maxHeight: '60vh' }}
              />

              {textOverlays.map(overlay => (
                isOverlayVisible(overlay) && (
                  <div
                    key={overlay.id}
                    className={`absolute ${getAnimationClass(overlay)}`}
                    style={{
                      left: `${overlay.x}%`,
                      top: `${overlay.y}%`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: `${overlay.fontSize}px`,
                      color: overlay.color,
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                      animationDuration: `${overlay.transitionDuration}s`,
                    }}
                  >
                    {getOverlayText(overlay)}
                  </div>
                )
              ))}
            </div>

            <div className="p-4 space-y-3">
              <input
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full"
              />
              <div className="flex items-center justify-between">
                <button
                  onClick={togglePlayPause}
                  className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold"
                >
                  {isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <span className="text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button
                  // CHANGED: "Change Video" also triggers auto-load now, but you could revert this to manual if preferred
                  onClick={handleAutoLoad}
                  className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                  Change Video
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export default VideoEditor;