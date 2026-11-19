import React, { useState } from 'react';
import { ChevronUp, Search, X } from 'lucide-react';
import { AppDefinition, AppId, CalendarEvent, CustomApkApp } from '../../types/emulator';
import { AppIcon, CustomApkIcon, GoogleGLogo } from '../icons/AppIcons';

interface HomeScreenProps {
  apps: AppDefinition[];
  installedIds: AppId[];
  customApks?: CustomApkApp[];
  liveIconsMap?: Record<string, string>;
  nextEvent?: CalendarEvent;
  liveTempF?: number;
  gpsLabel?: string;
  drawerOpen: boolean;
  onSetDrawerOpen: (open: boolean) => void;
  onOpenApp: (id: AppId) => void;
  onOpenCustomApk?: (packageName: string) => void;
  onSearchGoogle: (query: string) => void;
  darkTheme: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  apps,
  installedIds,
  customApks = [],
  liveIconsMap = {},
  nextEvent,
  liveTempF = 84,
  gpsLabel = 'Orhuworun, Delta State',
  drawerOpen,
  onSetDrawerOpen,
  onOpenApp,
  onOpenCustomApk,
  onSearchGoogle,
  darkTheme,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [drawerFilter, setDrawerFilter] = useState('');

  const installedApps = apps.filter((a) => installedIds.includes(a.id));
  const dockApps = installedApps
    .filter((a) => typeof a.dockOrder === 'number')
    .sort((a, b) => (a.dockOrder ?? 0) - (b.dockOrder ?? 0));

  const homeGridApps = installedApps.filter(
    (a) => typeof a.dockOrder !== 'number' && (a.pinnedOnHome || !a.preinstalled)
  );

  const filteredDrawerApps = installedApps.filter((a) =>
    drawerFilter.trim()
      ? a.name.toLowerCase().includes(drawerFilter.toLowerCase()) ||
        a.packageName.toLowerCase().includes(drawerFilter.toLowerCase())
      : true
  );

  const filteredCustomApks = customApks.filter((a) =>
    drawerFilter.trim()
      ? a.name.toLowerCase().includes(drawerFilter.toLowerCase()) ||
        a.packageName.toLowerCase().includes(drawerFilter.toLowerCase())
      : true
  );

  return (
    <div className="h-full flex flex-col justify-between px-4 pt-3 pb-2 relative select-none">
      {/* At a Glance Widget */}
      <div className="space-y-1 text-white drop-shadow-sm">
        <div className="text-base font-semibold tabular-nums">Tue, Nov 18 · {liveTempF}°F</div>
        {nextEvent ? (
          <button
            onClick={() => onOpenApp('calendar')}
            className="text-xs text-white/90 hover:underline text-left truncate block max-w-full"
          >
            {nextEvent.startTime} · {nextEvent.title}
          </button>
        ) : (
          <div className="text-xs text-white/80">Clear skies in {gpsLabel}</div>
        )}
      </div>

      {/* Home Screen App Icons */}
      <div className="grid grid-cols-4 gap-y-3.5 gap-x-2 my-auto py-2 content-start overflow-y-auto phone-scroll">
        {homeGridApps.map((app) => (
          <button
            key={app.id}
            onClick={() => onOpenApp(app.id)}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <AppIcon
              id={app.id}
              iconUrl={liveIconsMap[app.packageName]}
              size={46}
              className="group-hover:brightness-105"
            />
            <span className="text-[11px] font-medium text-white drop-shadow-sm truncate w-full text-center">
              {app.name}
            </span>
          </button>
        ))}

        {customApks.map((apk) => (
          <button
            key={apk.packageName}
            onClick={() => onOpenCustomApk?.(apk.packageName)}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-transform"
          >
            <CustomApkIcon
              name={apk.name}
              iconUrl={apk.iconUrl}
              size={46}
              className="group-hover:brightness-105"
            />
            <span className="text-[11px] font-medium text-white drop-shadow-sm truncate w-full text-center">
              {apk.name}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Search Bar & Dock */}
      <div className="space-y-2.5">
        <button
          onClick={() => onSetDrawerOpen(true)}
          className="mx-auto flex items-center gap-1 text-[11px] font-medium text-white/85 hover:text-white py-0.5 px-3"
        >
          <ChevronUp className="w-3.5 h-3.5" />
          <span>All apps</span>
        </button>

        {/* Material You Google Search Pill */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (searchInput.trim()) {
              onSearchGoogle(searchInput.trim());
              setSearchInput('');
            } else {
              onOpenApp('search');
            }
          }}
          className={`flex items-center gap-2.5 px-3.5 h-10 rounded-full shadow-md ${
            darkTheme ? 'bg-slate-900/95 text-white' : 'bg-white/95 text-slate-900'
          }`}
        >
          <GoogleGLogo size={18} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search Google"
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
          <button type="submit" aria-label="Search">
            <Search className="w-4 h-4 text-slate-500" />
          </button>
        </form>

        {/* Dock */}
        <div className="grid grid-cols-5 gap-1 pt-0.5 pb-1">
          {dockApps.map((app) => (
            <button
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="flex flex-col items-center justify-center active:scale-95 transition-transform"
              aria-label={`Open ${app.name}`}
            >
              <AppIcon
                id={app.id}
                iconUrl={liveIconsMap[app.packageName]}
                size={44}
              />
            </button>
          ))}
        </div>
      </div>

      {/* App Drawer Overlay */}
      {drawerOpen && (
        <div
          className={`absolute inset-0 z-20 flex flex-col p-4 pt-3 ${
            darkTheme ? 'bg-slate-950/95 text-white' : 'bg-slate-50/95 text-slate-900'
          } backdrop-blur-xl`}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className={`flex-1 flex items-center gap-2 px-3 h-10 rounded-full border ${
                darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={drawerFilter}
                onChange={(e) => setDrawerFilter(e.target.value)}
                placeholder="Search apps"
                className="flex-1 bg-transparent text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={() => onSetDrawerOpen(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-200/60 dark:hover:bg-slate-800"
              aria-label="Close app drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto phone-scroll grid grid-cols-4 gap-y-5 gap-x-2 content-start">
            {filteredDrawerApps.map((app) => (
              <button
                key={app.id}
                onClick={() => {
                  onSetDrawerOpen(false);
                  onOpenApp(app.id);
                }}
                className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              >
                <AppIcon
                  id={app.id}
                  iconUrl={liveIconsMap[app.packageName]}
                  size={48}
                />
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {app.name}
                </span>
              </button>
            ))}

            {filteredCustomApks.map((apk) => (
              <button
                key={apk.packageName}
                onClick={() => {
                  onSetDrawerOpen(false);
                  onOpenCustomApk?.(apk.packageName);
                }}
                className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
              >
                <CustomApkIcon name={apk.name} iconUrl={apk.iconUrl} size={48} />
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {apk.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
