import { useState, useEffect } from "react";
import { Library, Store, Settings as SettingsIcon, ChevronUp, DownloadCloud } from "lucide-react";
import LibraryView from "./components/LibraryView";
import ShopView from "./components/ShopView";
import SettingsView from "./components/SettingsView";
import clsx from "clsx";
import { DownloadState, LibraryGame, AppSettings } from "./types";
import { motion, AnimatePresence } from "motion/react";

const STRINGS = {
  ru: { lib: "Библиотека", shop: "Магазин", dl: "Загрузка:", games: "игр(ы)", ext: "УСТАНОВКА", down: "СКАЧИВАНИЕ" },
  en: { lib: "Library", shop: "Store", dl: "Downloading:", games: "game(s)", ext: "INSTALLING", down: "DOWNLOADING" }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"library" | "shop" | "settings">("library");
  const [downloads, setDownloads] = useState<DownloadState[]>([]);
  const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
  const [libraryData, setLibraryData] = useState<LibraryGame[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings(data);
      if (data.theme === 'light') document.documentElement.classList.add('light-theme');
      else document.documentElement.classList.remove('light-theme');
    } catch(e) {}
  };

  const updateSetting = async (key: keyof AppSettings, value: any) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : null);
    if (key === 'theme') {
      if (value === 'light') document.documentElement.classList.add('light-theme');
      else document.documentElement.classList.remove('light-theme');
    }
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value })
    });
  };

  const fetchDownloads = async () => {
    try {
      const res = await fetch("/api/downloads");
      const data = await res.json();
      setDownloads(data);
    } catch(e) {}
  };

  const fetchLibrary = async () => {
    try {
      const res = await fetch("/api/library");
      const data = await res.json();
      setLibraryData(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchSettings();
    fetchDownloads();
    fetchLibrary();
    const interval = setInterval(() => {
      fetchDownloads();
      fetchLibrary();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalProgress = downloads.length > 0 
    ? downloads.reduce((acc, d) => acc + d.progress, 0) / downloads.length 
    : 0;
  
  const hasDownloads = downloads.length > 0;
  const t = settings ? STRINGS[settings.language] : STRINGS.ru;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f] text-slate-100 font-sans overflow-hidden">
      {/* Top Navbar */}
      <div className="h-16 bg-[#121218] border-b border-[#1f1f2e] flex items-center justify-between px-6 z-20 shrink-0">
        <div className="flex items-center gap-8">
          <h1 
            className="text-xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 shadow-sm leading-tight inline-block cursor-pointer select-none"
            onClick={() => setActiveTab("library")}
          >
            REM
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 not-italic -mt-1 ml-0.5">Launcher</div>
          </h1>
          
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("library")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold",
                activeTab === "library"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Library size={18} className={activeTab === "library" ? "text-red-400" : ""} />
              {t.lib}
            </button>
            <button
              onClick={() => setActiveTab("shop")}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold",
                activeTab === "shop"
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              )}
            >
              <Store size={18} className={activeTab === "shop" ? "text-red-400" : ""} />
              {t.shop}
            </button>
          </nav>
        </div>

        <button
          onClick={() => setActiveTab("settings")}
          className={clsx(
            "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
            activeTab === "settings"
              ? "bg-white/10 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
          )}
          title="Настройки"
        >
          <SettingsIcon size={20} className={activeTab === "settings" ? "text-red-400" : ""} />
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden z-10 bg-gradient-to-br from-[#0c0c11] to-[#050508]">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeTab === "library" && <LibraryView libraryData={libraryData} refreshLibrary={fetchLibrary} />}
          {activeTab === "shop" && <ShopView onGameAdded={() => { fetchLibrary(); setActiveTab("library"); }} />}
          {activeTab === "settings" && settings && <SettingsView settings={settings} updateSetting={updateSetting} />}
        </div>
        
        {/* Global Bottom Download Bar */}
        <AnimatePresence>
          {hasDownloads && (
            <motion.div 
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-[#16161f] border-t border-slate-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            >
              <div 
                className="h-12 px-6 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsDownloadsOpen(!isDownloadsOpen)}
              >
                <div className="flex items-center gap-4">
                  <DownloadCloud size={20} className="text-blue-400" />
                  <span className="text-sm font-medium">
                    {t.dl} {downloads.length} {t.games}
                  </span>
                </div>
                
                <div className="flex items-center gap-6 flex-1 max-w-md mx-6">
                   <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-blue-500 transition-all duration-300 relative"
                       style={{ width: `${Math.max(2, totalProgress * 100)}%` }}
                     >
                       <div className="absolute inset-0 bg-white/20 animate-pulse" />
                     </div>
                   </div>
                   <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
                     {(totalProgress * 100).toFixed(1)}%
                   </span>
                </div>

                <button className="text-slate-400 hover:text-white p-1 rounded-md transition-colors">
                  <motion.div animate={{ rotate: isDownloadsOpen ? 180 : 0 }}>
                    <ChevronUp size={20} />
                  </motion.div>
                </button>
              </div>

              {/* Expandable Downloads List */}
              <AnimatePresence>
                {isDownloadsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-800 bg-[#0d0d12] max-h-64 overflow-y-auto overflow-hidden"
                  >
                     <div className="p-4 space-y-3">
                        {downloads.map(dl => {
                          const game = libraryData.find(g => g.id === dl.id)?.game;
                          return (
                            <div key={dl.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/5">
                              <img src={game?.icon || "https://placehold.co/100x100"} className="w-10 h-10 rounded bg-slate-900 object-cover" />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium truncate">{game?.name || "???"}</span>
                                  <span className={clsx(
                                    "text-xs font-mono px-1.5 py-0.5 rounded",
                                    dl.status === "extracting" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                                  )}>
                                    {dl.status === "extracting" ? t.ext : t.down}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                     <div 
                                       className={clsx(
                                         "h-full transition-all duration-300",
                                         dl.status === "extracting" ? "bg-emerald-500" : "bg-blue-500"
                                       )}
                                       style={{ width: `${Math.max(2, dl.progress * 100)}%` }}
                                     />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
