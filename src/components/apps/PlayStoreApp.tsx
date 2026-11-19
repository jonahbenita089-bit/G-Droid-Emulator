import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Download,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { AppDefinition, AppId, GoogleAccount, PlayCategory } from '../../types/emulator';
import { AppIcon } from '../icons/AppIcons';

interface PlayStoreAppProps {
  apps: AppDefinition[];
  installedIds: AppId[];
  installingMap: Partial<Record<AppId, number>>;
  liveIconsMap?: Record<string, string>;
  account?: GoogleAccount;
  onInstall: (id: AppId) => void;
  onUninstall: (id: AppId) => void;
  onOpenApp: (id: AppId) => void;
  darkTheme: boolean;
}

export const PlayStoreApp: React.FC<PlayStoreAppProps> = ({
  apps,
  installedIds,
  installingMap,
  liveIconsMap = {},
  account = { name: 'Jonah Benita', email: 'jonahbenita089@gmail.com', avatarColor: '#047857' },
  onInstall,
  onUninstall,
  onOpenApp,
  darkTheme,
}) => {
  const [tab, setTab] = useState<'apps' | 'games' | 'library'>('apps');
  const [category, setCategory] = useState<PlayCategory>('All');
  const [query, setQuery] = useState('');
  const [selectedAppId, setSelectedAppId] = useState<AppId | null>(null);

  const selectedApp = apps.find((a) => a.id === selectedAppId) || null;

  const filteredApps = apps.filter((app) => {
    if (tab === 'games' && app.category !== 'Games') return false;
    if (tab === 'library' && !installedIds.includes(app.id)) return false;
    if (tab === 'apps' && category !== 'All' && app.category !== category) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        app.name.toLowerCase().includes(q) ||
        app.developer.toLowerCase().includes(q) ||
        app.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  if (selectedApp) {
    const isInstalled = installedIds.includes(selectedApp.id);
    const progress = installingMap[selectedApp.id];
    const isInstalling = typeof progress === 'number';

    return (
      <div className={`h-full flex flex-col ${surface}`}>
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200/70 dark:border-slate-800">
          <button
            onClick={() => setSelectedAppId(null)}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Back to Play Store"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold truncate px-2">App details</span>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto phone-scroll p-4 space-y-5">
          <div className="flex items-start gap-4">
            <AppIcon
              id={selectedApp.id}
              iconUrl={liveIconsMap[selectedApp.packageName]}
              size={64}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold leading-tight truncate">{selectedApp.name}</h2>
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                {selectedApp.developer}
              </p>
              <p className={`text-[11px] font-mono-tabular mt-0.5 truncate ${muted}`}>
                {selectedApp.packageName}
              </p>
              <p className={`text-xs mt-0.5 ${muted}`}>
                {selectedApp.category} · v{selectedApp.version} · {selectedApp.apkSource || 'Verified APK'}
              </p>
            </div>
          </div>

          <div className={`grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 py-2.5 border-y border-slate-200/80 dark:border-slate-800 text-center`}>
            <div>
              <div className="text-sm font-semibold flex items-center justify-center gap-1 tabular-nums">
                <span>{selectedApp.rating}</span>
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
              <div className={`text-[11px] ${muted}`}>{selectedApp.reviewsCount} reviews</div>
            </div>
            <div>
              <div className="text-sm font-semibold tabular-nums">{selectedApp.sizeMb} MB</div>
              <div className={`text-[11px] ${muted}`}>Download size</div>
            </div>
            <div>
              <div className="text-sm font-semibold tabular-nums">{selectedApp.downloads}</div>
              <div className={`text-[11px] ${muted}`}>Downloads</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isInstalling ? (
              <div className="flex-1 h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">
                <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span>Installing {progress}%</span>
              </div>
            ) : isInstalled ? (
              <>
                {!selectedApp.preinstalled && (
                  <button
                    onClick={() => onUninstall(selectedApp.id)}
                    className="h-11 px-4 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Uninstall</span>
                  </button>
                )}
                <button
                  onClick={() => onOpenApp(selectedApp.id)}
                  className="flex-1 h-11 rounded-full bg-[#01875F] text-white text-xs font-semibold hover:bg-[#017350] transition-colors"
                >
                  Open
                </button>
              </>
            ) : (
              <button
                onClick={() => onInstall(selectedApp.id)}
                className="flex-1 h-11 rounded-full bg-[#01875F] text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#017350] transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Install</span>
              </button>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold">About this app</h3>
            <p className={`text-xs leading-relaxed ${muted}`}>{selectedApp.description}</p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${cardBg} space-y-1.5`}>
            <div className="text-xs font-semibold">What is new</div>
            <p className={`text-xs leading-relaxed ${muted}`}>{selectedApp.whatsNew}</p>
          </div>

          <div className={`p-3.5 rounded-2xl border ${cardBg} flex items-center gap-3`}>
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-semibold">Verified by Play Protect</div>
              <div className={`text-[11px] ${muted}`}>Scanned on virtual device · No issues found</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${surface}`}>
      {/* Top Search Bar */}
      <div className="px-3.5 pt-3 pb-2 space-y-2.5 border-b border-slate-200/70 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className={`flex-1 flex items-center gap-2 px-3 h-10 rounded-full border ${cardBg}`}>
            <Search className={`w-4 h-4 shrink-0 ${muted}`} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps & games"
              className="w-full bg-transparent text-xs focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
          <div
            style={{ backgroundColor: account.avatarColor }}
            className="w-8 h-8 rounded-full text-white text-xs font-semibold flex items-center justify-center shrink-0"
            title={account.email}
          >
            {account.name.charAt(0).toUpperCase()}
          </div>
        </div>

        {tab === 'apps' && (
          <div className="flex items-center gap-1.5 overflow-x-auto phone-scroll pb-0.5">
            {(['All', 'Productivity', 'Media', 'Navigation', 'Utilities', 'Games'] as PlayCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                    category === cat
                      ? 'bg-[#01875F] text-white'
                      : darkTheme
                      ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-4">
        {tab === 'apps' && !query && category === 'All' && (
          <div
            onClick={() => setSelectedAppId('ytmusic')}
            className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer group"
          >
            <img
              src="/src/assets/images/play_banner_featured_1795013137189.jpg"
              alt="Featured Play Store showcase"
              referrerPolicy="no-referrer"
              className="w-full h-32 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-3.5">
              <span className="text-[10px] font-medium text-emerald-300">Editor Choice · Essential Suite</span>
              <div className="text-sm font-semibold text-white">Install Google Suite & Studio Apps</div>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold tracking-tight">
              {tab === 'library'
                ? 'Installed on this device'
                : tab === 'games'
                ? 'Featured Games'
                : query
                ? 'Search results'
                : 'Recommended for you'}
            </h3>
            <span className={`text-[11px] tabular-nums ${muted}`}>{filteredApps.length} apps</span>
          </div>

          <div className="divide-y divide-slate-200/60 dark:divide-slate-800/80">
            {filteredApps.map((app) => {
              const isInstalled = installedIds.includes(app.id);
              const progress = installingMap[app.id];
              const isInstalling = typeof progress === 'number';

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className="py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-900/60 rounded-xl px-1.5 transition-colors"
                >
                  <AppIcon
                    id={app.id}
                    iconUrl={liveIconsMap[app.packageName]}
                    size={46}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{app.name}</div>
                    <div className={`text-[11px] truncate ${muted}`}>
                      {app.category} · {app.sizeMb} MB · {app.rating} stars
                    </div>
                  </div>

                  <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                    {isInstalling ? (
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 tabular-nums">
                        {progress}%
                      </span>
                    ) : isInstalled ? (
                      <button
                        onClick={() => onOpenApp(app.id)}
                        className="px-3.5 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-[11px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Open
                      </button>
                    ) : (
                      <button
                        onClick={() => onInstall(app.id)}
                        className="px-3.5 py-1.5 rounded-full bg-[#01875F] text-white text-[11px] font-semibold hover:bg-[#017350] transition-colors"
                      >
                        Install
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredApps.length === 0 && (
              <div className={`py-10 text-center text-xs ${muted}`}>
                No matching apps found. Try clearing filters or searching another keyword.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tabs */}
      <div className="grid grid-cols-3 border-t border-slate-200 dark:border-slate-800 h-14 shrink-0">
        {[
          { id: 'games' as const, label: 'Games' },
          { id: 'apps' as const, label: 'Apps' },
          { id: 'library' as const, label: 'Installed' },
        ].map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
                active ? 'text-[#01875F] font-semibold' : muted
              }`}
            >
              {item.id === 'library' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
