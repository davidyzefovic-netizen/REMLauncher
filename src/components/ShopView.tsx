import { useState, useEffect } from "react";
import { Search, Plus, Check } from "lucide-react";
import { GameInfo } from "../types";
import { motion } from "motion/react";

interface ShopGame extends GameInfo {
  inLibrary: boolean;
}

interface Props {
  onGameAdded: () => void;
}

export default function ShopView({ onGameAdded }: Props) {
  const [games, setGames] = useState<ShopGame[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch("/api/shop");
      const data = await res.json();
      setGames(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async (id: string, inLibrary: boolean) => {
    if (inLibrary) return;
    try {
      await fetch(`/api/library/add/${id}`, { method: "POST" });
      onGameAdded(); // notify parent to switch tab
    } catch(e) {}
  };

  const filteredGames = games.filter(g => 
    g.name.toLowerCase().includes(query.toLowerCase()) || 
    g.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-7xl mx-auto w-full">
       <div className="flex items-end justify-between mb-8">
         <div>
           <h2 className="text-3xl font-bold text-white mb-2">Магазин REM</h2>
           <p className="text-slate-400">Находите новинки и лучшие релизы.</p>
         </div>

         <div className="relative w-72">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
           <input 
             type="text"
             placeholder="Поиск игр..."
             value={query}
             onChange={e => setQuery(e.target.value)}
             className="w-full bg-[#121218] border border-white/10 rounded-xl px-10 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-white/30 transition-colors"
           />
         </div>
       </div>

       {loading ? (
         <div className="h-64 flex items-center justify-center">
           <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-red-500 animate-spin" />
         </div>
       ) : (
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGames.map((game, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={game.id} 
                className="bg-[#121218]/50 border border-white/5 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:border-white/10 hover:bg-[#121218] transition-colors"
              >
                 <div className="w-full sm:w-48 aspect-video sm:aspect-[3/4] sm:min-h-[220px] bg-slate-900 relative shrink-0">
                    <img src={game.image} className="w-full h-full object-cover" />
                 </div>
                 
                 <div className="p-5 flex-1 flex flex-col min-w-0">
                    <div className="mb-1 flex items-start justify-between gap-3">
                       <h3 className="text-lg font-bold text-white leading-tight truncate">{game.name}</h3>
                       {game.multiplayer && (
                         <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded shrink-0">
                           Online Fix
                         </span>
                       )}
                    </div>
                    <p className="text-xs text-slate-500 mb-3 font-mono">{game.size} • v{game.version}</p>
                    
                    <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {game.description}
                    </p>

                    <div className="flex gap-1.5 mb-5 flex-wrap">
                      {game.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs font-medium px-2 py-0.5 rounded bg-white/5 text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto">
                       <button
                         onClick={() => handleAddToLibrary(game.id, game.inLibrary)}
                         className={`w-full py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all flex items-center justify-center gap-2
                           ${game.inLibrary 
                             ? 'bg-slate-800 text-slate-400 cursor-default'
                             : 'bg-white text-black hover:bg-slate-200'}`}
                       >
                         {game.inLibrary ? (
                           <>
                             <Check size={16} />
                             В БИБЛИОТЕКЕ
                           </>
                         ) : (
                           <>
                             <Plus size={16} />
                             ДОБАВИТЬ БЕСПЛАТНО
                           </>
                         )}
                       </button>
                    </div>
                 </div>
              </motion.div>
            ))}
         </div>
       )}
    </div>
  );
}
