import React, { useState } from "react";
import { LibraryGame } from "../types";
import { Play, Download, Trash2, FolderOpen, MoreHorizontal, ArrowLeft, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  libraryData: LibraryGame[];
  refreshLibrary: () => void;
}

export default function LibraryView({ libraryData, refreshLibrary }: Props) {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ id: string, x: number, y: number } | null>(null);

  const selectedGame = libraryData.find(g => g.id === selectedGameId);

  const handleDownload = async (id: string) => {
    await fetch(`/api/download/${id}`, { method: "POST" });
    refreshLibrary();
    setContextMenu(null);
  };

  const handlePlay = async (id: string) => {
    await fetch(`/api/play/${id}`, { method: "POST" });
    setContextMenu(null);
  };

  const handleDelete = async (id: string) => {
    if(confirm("Вы уверены, что хотите удалить игру из библиотеки?")) {
      await fetch(`/api/library/remove/${id}`, { method: "POST" });
      if(selectedGameId === id) setSelectedGameId(null);
      refreshLibrary();
    }
    setContextMenu(null);
  };

  const handleOpenFolder = async (id: string) => {
    await fetch(`/api/open-folder/${id}`, { method: "POST" });
    setContextMenu(null);
  };

  const onContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  return (
    <div className="flex h-full relative" onClick={() => setContextMenu(null)}>
      
      {/* Left List: Downloaded Games */}
      <div className="w-[260px] bg-[#0c0c11] border-r border-[#1f1f2e] flex flex-col h-full flex-shrink-0 z-10">
        <div className="p-4 border-b border-[#1f1f2e]">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Все игры</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {libraryData.length === 0 && (
             <div className="p-4 text-sm text-slate-500 text-center mt-4">
                Ваша библиотека пуста
             </div>
          )}
          {libraryData.map(item => {
            const isInstalled = item.isInstalled;
            const isSelected = selectedGameId === item.id;
            
            return (
              <div 
                key={item.id}
                onClick={() => setSelectedGameId(item.id)}
                onContextMenu={(e) => onContextMenu(e, item.id)}
                className={clsx(
                  "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors group relative",
                  isSelected ? "bg-white/10" : "hover:bg-white/5"
                )}
              >
                <div className="w-8 h-8 rounded shrink-0 overflow-hidden bg-slate-900 border border-white/5">
                   {item.game.icon ? <img src={item.game.icon} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="m-2 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx(
                    "text-sm tracking-wide truncate",
                    isInstalled ? "font-bold text-white" : "font-medium text-slate-400 group-hover:text-slate-300",
                    isSelected && !isInstalled && "text-slate-200"
                  )}>
                    {item.game.name}
                  </p>
                  {item.downloadStatus !== "none" && item.downloadStatus !== "installed" && (
                    <p className="text-[10px] text-blue-400 mt-0.5">
                       {item.downloadStatus === 'extracting' ? 'Установка...' : 'Загрузка...'} {(item.progress * 100).toFixed(0)}%
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Area: Game Details or Grid View */}
      <div className="flex-1 h-full overflow-hidden relative">
        <AnimatePresence mode="wait">
          {selectedGame ? (
            <motion.div 
              key={selectedGame.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 overflow-y-auto"
            >
              {/* Game Hero Banner */}
              <div className="relative h-[400px] w-full">
                <div className="absolute inset-0 bg-slate-900">
                  <img src={selectedGame.game.image} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c11] via-[#0c0c11]/80 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-10 flex items-end gap-8">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#0c0c11] bg-slate-800 shadow-2xl shrink-0">
                    <img src={selectedGame.game.icon} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                      {selectedGame.game.name}
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      {selectedGame.isInstalled ? (
                        <button 
                          onClick={() => handlePlay(selectedGame.id)}
                          className="px-10 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all font-bold tracking-wide flex items-center gap-2"
                        >
                          <Play size={20} className="fill-current" />
                          ИГРАТЬ
                        </button>
                      ) : selectedGame.downloadStatus === "none" ? (
                        <button 
                          onClick={() => handleDownload(selectedGame.id)}
                          className="px-10 py-3 bg-white text-black hover:bg-slate-200 rounded-lg transition-all font-bold tracking-wide flex items-center gap-2"
                        >
                          <Download size={20} />
                          СКАЧАТЬ ({selectedGame.game.size})
                        </button>
                      ) : (
                        <div className="w-64">
                          <div className="flex justify-between text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider">
                            <span>{selectedGame.downloadStatus === "extracting" ? "Применение фиксов..." : "Загрузка и установка"}</span>
                            <span>{(selectedGame.progress * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={clsx(
                                "h-full transition-all duration-300",
                                selectedGame.downloadStatus === "extracting" ? "bg-emerald-500" : "bg-blue-500"
                              )}
                              style={{ width: `${Math.max(2, selectedGame.progress * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {selectedGame.game.multiplayer && (
                        <span className="ml-4 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md text-xs font-bold uppercase tracking-widest border border-purple-500/30">
                          Мультиплеер (Online Fix)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Game Content Details */}
              <div className="p-10 max-w-4xl">
                <h3 className="text-xl font-semibold mb-4 border-b border-white/10 pb-4">Об игре</h3>
                <p className="text-slate-300 leading-relaxed text-lg mb-8">
                  {selectedGame.game.description}
                </p>
                
                <div className="flex gap-2 flex-wrap mb-8">
                  {selectedGame.game.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-slate-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 p-8 overflow-y-auto"
            >
              <h2 className="text-3xl font-bold text-white mb-8">Моя Библиотека</h2>
              
              {libraryData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                  <div className="w-24 h-24 mb-6 rounded-3xl bg-white/5 flex items-center justify-center">
                    <Download className="w-10 h-10 opacity-50" />
                  </div>
                  <p className="text-xl font-medium text-slate-400 mb-2">Здесь пока пусто</p>
                  <p>Перейдите в магазин, чтобы найти игры.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {libraryData.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedGameId(item.id)}
                      onContextMenu={(e) => onContextMenu(e, item.id)}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5 relative mb-3">
                        <img 
                          src={item.game.image} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        {!item.isInstalled && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="px-4 py-2 bg-white text-black font-bold rounded-lg transform scale-95 group-hover:scale-100 transition-transform">
                              К странице игры
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className={clsx(
                        "font-semibold truncate",
                        item.isInstalled ? "text-white" : "text-slate-400 group-hover:text-slate-300"
                      )}>
                        {item.game.name}
                      </h3>
                      {item.isInstalled && <p className="text-xs text-red-400 font-bold tracking-wide mt-1">УСТАНОВЛЕНО</p>}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 bg-[#161622] border border-[#2a2a3e] rounded-xl shadow-2xl py-1.5 w-56 flex flex-col overflow-hidden"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const gameData = libraryData.find(g => g.id === contextMenu.id);
              if(!gameData) return null;
              
              return (
                <>
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <span className="text-xs font-bold text-slate-400 truncate block">
                      {gameData.game.name}
                    </span>
                  </div>
                  
                  {gameData.isInstalled ? (
                    <button 
                      onClick={() => handlePlay(gameData.id)}
                      className="px-3 py-2 text-sm text-left hover:bg-white/10 text-white flex items-center gap-2"
                    >
                      <Play size={14} className="text-emerald-400" /> Запустить
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleDownload(gameData.id)}
                      className="px-3 py-2 text-sm text-left hover:bg-white/10 text-white flex items-center gap-2"
                      disabled={gameData.downloadStatus !== "none"}
                    >
                      <Download size={14} className="text-blue-400" /> Установить
                    </button>
                  )}
                  
                  {gameData.isInstalled && (
                    <button 
                      onClick={() => handleOpenFolder(gameData.id)}
                      className="px-3 py-2 text-sm text-left hover:bg-white/10 text-slate-300 flex items-center gap-2"
                    >
                      <FolderOpen size={14} /> Открыть папку
                    </button>
                  )}
                  
                  <div className="mx-3 my-1 border-t border-white/5" />
                  
                  <button 
                    onClick={() => handleDelete(gameData.id)}
                    className="px-3 py-2 text-sm text-left hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Удалить игру
                  </button>
                </>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
