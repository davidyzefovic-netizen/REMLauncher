import { HelpCircle, Settings2, Globe, Monitor, Shield, Download as DownloadIcon } from "lucide-react";
import clsx from "clsx";
import { AppSettings } from "../types";

interface Props {
  settings: AppSettings;
  updateSetting: (key: keyof AppSettings, value: any) => void;
}

export default function SettingsView({ settings, updateSetting }: Props) {
  const T = {
    ru: {
      title: "Настройки", desc: "Персонализация и поведение среды REM.",
      main: "Основные", lang: "Язык интерфейса", langDesc: "Выберите предпочитаемый язык.",
      theme: "Тема", themeDesc: "Внешний вид лаунчера.", dark: "Тёмная", light: "Светлая", sys: "Система",
      behav: "Поведение", 
      runStart: "Запуск вместе с Windows", runStartDesc: "Автоматически открывать лаунчер при загрузке системы.",
      minTray: "Закрывать лаунчер в трей", minTrayDesc: "При нажатии на крестик лаунчер сворачивается на панель задач.",
      confExit: "Подтверждение при закрытии", confExitDesc: "Предупреждать, если идёт активная загрузка файла.",
      upd: "Автообновление (GitHub)", updDesc: "Проверять новые версии лаунчера при каждом запуске.",
      arch: "Об архитектуре (Симуляция)", archDesc: "Приложение работает в изолированном контейнере. Настройки сохраняются в SQLite БД и мгновенно применяются!"
    },
    en: {
      title: "Settings", desc: "Personalize and control REM environment.",
      main: "General", lang: "Interface Language", langDesc: "Choose your preferred language.",
      theme: "Theme", themeDesc: "Launcher appearance.", dark: "Dark", light: "Light", sys: "System",
      behav: "Behavior", 
      runStart: "Run on Windows startup", runStartDesc: "Automatically open the launcher on boot.",
      minTray: "Minimize to tray on close", minTrayDesc: "Launcher completely hides when clicking close.",
      confExit: "Confirm on exit", confExitDesc: "Warn if there's an active download.",
      upd: "Auto-updates (GitHub)", updDesc: "Check for new versions on every startup.",
      arch: "About Architecture (Simulation)", archDesc: "Running in an isolated container. Settings are saved to SQLite DB and reflect instantly!"
    }
  };

  const t = T[settings.language] || T.ru;

  const Toggle = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
    <button 
      onClick={onChange}
      className={clsx(
        "w-11 h-6 rounded-full transition-colors relative flex-shrink-0 cursor-pointer",
        checked ? "bg-red-500" : "bg-white/10"
      )}
    >
      <div className={clsx(
        "w-4 h-4 rounded-full bg-white absolute top-1 transition-transform",
        checked ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-8 w-full overflow-y-auto custom-scrollbar h-full pb-20">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">{t.title}</h2>
        <p className="text-slate-400">{t.desc}</p>
      </header>

      {/* Основные */}
      <section className="bg-[#121218] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
           <Settings2 size={18} className="text-red-400" />
           <h3 className="text-base font-semibold text-white">{t.main}</h3>
        </div>
        <div className="p-6 space-y-8">
          
          <div className="flex items-center justify-between gap-4">
             <div className="flex-1">
               <label className="text-sm font-medium text-slate-200 flex items-center gap-2"><Globe size={16} className="text-slate-400" /> {t.lang}</label>
               <p className="text-xs text-slate-500 mt-1">{t.langDesc}</p>
             </div>
             <div className="flex gap-2">
                <button 
                  onClick={() => updateSetting('language', 'ru')}
                  className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors border outline-none", settings.language === 'ru' ? "bg-white/10 text-white border-white/10" : "border-transparent text-slate-400 hover:bg-white/5")}
                >
                  Русский
                </button>
                <button 
                  onClick={() => updateSetting('language', 'en')}
                  className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors border outline-none", settings.language === 'en' ? "bg-white/10 text-white border-white/10" : "border-transparent text-slate-400 hover:bg-white/5")}
                >
                  English
                </button>
             </div>
          </div>

          <div className="flex items-center justify-between gap-4">
             <div className="flex-1">
               <label className="text-sm font-medium text-slate-200 flex items-center gap-2"><Monitor size={16} className="text-slate-400" /> {t.theme}</label>
               <p className="text-xs text-slate-500 mt-1">{t.themeDesc}</p>
             </div>
             <div className="flex gap-2 bg-[#0c0c11] p-1 rounded-lg border border-white/5 text-sm font-medium shrink-0">
                <button 
                  onClick={() => updateSetting('theme', 'dark')}
                  className={clsx("px-4 py-1.5 rounded-md transition-colors outline-none", settings.theme === 'dark' ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200")}
                >
                  {t.dark}
                </button>
                <button 
                  onClick={() => updateSetting('theme', 'light')}
                  className={clsx("px-4 py-1.5 rounded-md transition-colors outline-none", settings.theme === 'light' ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200")}
                >
                  {t.light}
                </button>
                <button 
                  onClick={() => updateSetting('theme', 'system')}
                  className={clsx("px-4 py-1.5 rounded-md transition-colors outline-none", settings.theme === 'system' ? "bg-white/10 text-white" : "text-slate-400 hover:text-slate-200")}
                >
                  {t.sys}
                </button>
             </div>
          </div>

        </div>
      </section>

      {/* Поведение */}
      <section className="bg-[#121218] rounded-2xl border border-white/5 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-white/5 flex items-center gap-2">
           <Shield size={18} className="text-red-400" />
           <h3 className="text-base font-semibold text-white">{t.behav}</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4">
             <div className="flex-1">
               <label className="text-sm font-medium text-slate-200">{t.runStart}</label>
               <p className="text-xs text-slate-500 mt-1">{t.runStartDesc}</p>
             </div>
             <Toggle checked={settings.runOnStartup} onChange={() => updateSetting('runOnStartup', !settings.runOnStartup)} />
          </div>

          <div className="flex items-center justify-between gap-4">
             <div className="flex-1">
               <label className="text-sm font-medium text-slate-200">{t.minTray}</label>
               <p className="text-xs text-slate-500 mt-1">{t.minTrayDesc}</p>
             </div>
             <Toggle checked={settings.minimizeToTray} onChange={() => updateSetting('minimizeToTray', !settings.minimizeToTray)} />
          </div>

          <div className="flex items-center justify-between gap-4">
             <div className="flex-1">
               <label className="text-sm font-medium text-slate-200">{t.confExit}</label>
               <p className="text-xs text-slate-500 mt-1">{t.confExitDesc}</p>
             </div>
             <Toggle checked={settings.confirmOnExit} onChange={() => updateSetting('confirmOnExit', !settings.confirmOnExit)} />
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
             <div className="flex-1">
               <label className="text-sm font-medium text-slate-200 flex items-center gap-2"><DownloadIcon size={16} className="text-slate-400" /> {t.upd}</label>
               <p className="text-xs text-slate-500 mt-1">{t.updDesc}</p>
             </div>
             <Toggle checked={settings.checkUpdates} onChange={() => updateSetting('checkUpdates', !settings.checkUpdates)} />
          </div>
        </div>
      </section>

      {/* Ограничения песочницы */}
      <section className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden p-6 relative">
         <HelpCircle className="absolute top-6 right-6 w-12 h-12 text-white/5" />
         <h3 className="text-lg font-semibold text-white mb-2">{t.arch}</h3>
         <p className="text-sm text-slate-400 leading-relaxed max-w-prose relative z-10">
           {t.archDesc}
         </p>
      </section>

    </div>
  );
}
