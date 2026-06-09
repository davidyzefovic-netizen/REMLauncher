import express from "express";
import path from "path";
import fs from "fs-extra";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";

// Setup SQLite database
const dbDir = path.join(process.cwd(), "db");
fs.ensureDirSync(dbDir);
const dbPath = path.join(dbDir, "remlauncher.sqlite");
const db = new Database(dbPath);

// Initialize DB schema
db.exec(`
  CREATE TABLE IF NOT EXISTS library (
    id TEXT PRIMARY KEY,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_installed INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS downloads (
    id TEXT PRIMARY KEY,
    status TEXT, 
    progress REAL,
    error TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

const defaultSettings = [
  ['language', 'ru'], ['theme', 'dark'], ['runOnStartup', 'false'],
  ['minimizeToTray', 'true'], ['confirmOnExit', 'true'], ['checkUpdates', 'true']
];
const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
defaultSettings.forEach(([k, v]) => insertSetting.run(k, v));

const SHOP_GAMES = [
  {
    id: "1",
    name: "A Day Out",
    version: "1.0.2",
    size: "5.2 GB",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    icon: "https://placehold.co/100x100/111/fff?text=AD",
    description: "Monster hunting co-op survival game. Investigate mysteries and hunt down supernatural entities.",
    tags: ["Co-op", "Survival", "Multiplayer", "Horror"],
    multiplayer: true
  },
  {
    id: "2",
    name: "Cyber Neon",
    version: "2.1.4",
    size: "42 GB",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
    icon: "https://placehold.co/100x100/111/fff?text=CN",
    description: "Action RPG in a dystopian future where corporations rule the world.",
    tags: ["RPG", "Singleplayer", "Action", "Cyberpunk"],
    multiplayer: false
  },
  {
    id: "3",
    name: "Cozy Farm",
    version: "1.5.6",
    size: "800 MB",
    image: "https://images.unsplash.com/photo-1592839719941-8e2651039d01?auto=format&fit=crop&q=80&w=800",
    icon: "https://placehold.co/100x100/111/fff?text=CF",
    description: "Relaxing farming game. Grow crops, meet townsfolk, and build your dream farm.",
    tags: ["Farming", "RPG", "Simulation"],
    multiplayer: true
  },
  {
    id: "4",
    name: "Velocity Rivals",
    version: "3.2.0",
    size: "15 GB",
    image: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=800",
    icon: "https://placehold.co/100x100/111/fff?text=VR",
    description: "High-octane arcade racing with excessive drift mechanics.",
    tags: ["Racing", "Multiplayer", "Arcade"],
    multiplayer: true
  }
];

const GAMES_DIR = path.join(process.cwd(), "games");
fs.ensureDirSync(GAMES_DIR);

const activeDownloads = new Map();

function startMockDownload(id: string) {
  if (activeDownloads.has(id)) return;
  
  db.prepare('INSERT OR REPLACE INTO downloads (id, status, progress, error) VALUES (?, ?, ?, ?)').run(id, "downloading", 0, null);
  activeDownloads.set(id, true);

  const gameInfo = SHOP_GAMES.find(g => g.id === id);
  if (!gameInfo) return;

  const gameDir = path.join(GAMES_DIR, id);
  fs.ensureDirSync(gameDir);
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 0.08 + 0.02; // Random jumps
    if (progress >= 1) {
      clearInterval(interval);
      progress = 1;
      
      // Simulate fake files
      const sanitizedName = gameInfo.name.replace(/\s+/g, "").toLowerCase();
      fs.writeFileSync(path.join(gameDir, `${sanitizedName}.torrent`), "fake torrent data");
      if(gameInfo.multiplayer) {
         fs.writeFileSync(path.join(gameDir, "onlinefix.exe"), "fake online fix executable");
      }
      fs.writeFileSync(path.join(gameDir, "game.exe"), "MZ... fake executable payload");
      
      db.prepare('UPDATE downloads SET status = ?, progress = ? WHERE id = ?').run("extracting", 1, id);
      
      // Simulate extraction and fix applying
      setTimeout(() => {
        db.prepare('UPDATE downloads SET status = ?, progress = ? WHERE id = ?').run("installed", 1, id);
        db.prepare('UPDATE library SET is_installed = 1 WHERE id = ?').run(id);
        activeDownloads.delete(id);
      }, 2500);
    } else {
      db.prepare('UPDATE downloads SET status = ?, progress = ? WHERE id = ?').run("downloading", progress, id);
    }
  }, 500);
}


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Shop
  app.get("/api/shop", (req, res) => {
    const libraryItems = db.prepare('SELECT id FROM library').all() as {id: string}[];
    const libraryIds = new Set(libraryItems.map(i => i.id));
    
    const enrichedShop = SHOP_GAMES.map(game => ({
      ...game,
      inLibrary: libraryIds.has(game.id)
    }));
    
    res.json(enrichedShop);
  });

  // Library
  app.get("/api/library", (req, res) => {
    const libRows = db.prepare('SELECT * FROM library ORDER BY added_at DESC').all() as any[];
    const downloads = db.prepare('SELECT * FROM downloads').all() as any[];
    
    const library = libRows.map(row => {
      const gameInfo = SHOP_GAMES.find(g => g.id === row.id)!;
      const dlInfo = downloads.find(d => d.id === row.id);
      
      let downloadStatus = 'none';
      let progress = 0;
      
      if (dlInfo) {
        if (dlInfo.status === 'installed' && row.is_installed === 1) {
          downloadStatus = 'installed';
          progress = 1;
        } else {
          downloadStatus = dlInfo.status;
          progress = dlInfo.progress;
        }
      } else if (row.is_installed === 1) {
        downloadStatus = 'installed';
        progress = 1;
      }

      return {
        id: row.id,
        game: gameInfo,
        isInstalled: row.is_installed === 1,
        downloadStatus,
        progress
      };
    }).filter(item => !!item.game);

    res.json(library);
  });
  
  app.get("/api/downloads", (req, res) => {
    const downloads = db.prepare('SELECT * FROM downloads WHERE status != "none" AND status != "installed"').all();
    res.json(downloads);
  });

  app.post("/api/library/add/:id", (req, res) => {
    const { id } = req.params;
    try {
      db.prepare('INSERT OR IGNORE INTO library (id) VALUES (?)').run(id);
      res.json({ success: true });
    } catch(err) {
      res.status(500).json({ error: String(err) });
    }
  });

  app.post("/api/library/remove/:id", (req, res) => {
    const { id } = req.params;
    
    // Stop ongoing download if active
    if (activeDownloads.has(id)) {
       // Note: we can't easily kill the setInterval safely here without storing token, 
       // but for simulation we just ignore it or it will error if it tries to update DB.
    }
    
    db.prepare('DELETE FROM library WHERE id = ?').run(id);
    db.prepare('DELETE FROM downloads WHERE id = ?').run(id);
    
    const gameDir = path.join(GAMES_DIR, id);
    if(fs.existsSync(gameDir)) {
      fs.removeSync(gameDir);
    }
    res.json({ success: true });
  });

  // API: Download game
  app.post("/api/download/:id", (req, res) => {
    const { id } = req.params;
    startMockDownload(id);
    res.json({ success: true });
  });

  // API: Play game
  app.post("/api/play/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Simulating launch of game ${id} from ./games/`);
    setTimeout(() => console.log(`Game ${id} exited.`), 5000);
    res.json({ success: true });
  });

  // API: Open Folder
  app.post("/api/open-folder/:id", (req, res) => {
    const { id } = req.params;
    console.log(`Simulated opening explorer to: ${path.join(GAMES_DIR, id)}`);
    res.json({ success: true });
  });

  // API: Settings
  app.get("/api/settings", (req, res) => {
    const rows = db.prepare('SELECT * FROM settings').all() as any[];
    const setObj: any = {};
    rows.forEach(r => {
      setObj[r.key] = r.value === 'true' ? true : r.value === 'false' ? false : r.value;
    });
    res.json(setObj);
  });

  app.post("/api/settings", (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(value));
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
