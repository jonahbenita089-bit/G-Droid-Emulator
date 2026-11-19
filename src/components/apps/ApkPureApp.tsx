import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ExternalLink,
  HardDriveDownload,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  WifiOff,
  X,
} from 'lucide-react';
import {
  AppDefinition,
  AppId,
  CustomApkApp,
  DownloadedApk,
  NetworkProfile,
} from '../../types/emulator';
import { AppIcon, CustomApkIcon } from '../icons/AppIcons';

interface LiveSearchResult {
  packageName: string;
  name: string;
  developer: string;
  iconUrl: string;
  description: string;
  version: string;
  sizeMb: number;
  rating: string;
  apkpureUrl: string;
  source: string;
}

interface ApkPureAppProps {
  apps: AppDefinition[];
  installedIds: AppId[];
  customApks: CustomApkApp[];
  downloadedApks: DownloadedApk[];
  liveIconsMap: Record<string, string>;
  downloadingApkMap: Record<string, number>;
  isOnline: boolean;
  networkProfile: NetworkProfile;
  darkTheme: boolean;
  onDownloadApk: (pkg: {
    packageName: string;
    name: string;
    developer: string;
    version: string;
    sizeMb: number;
    iconUrl?: string;
    description?: string;
    rating?: string;
    apkpureUrl: string;
    appId?: AppId;
  }) => void;
  onInstallDownloadedApk: (apk: DownloadedApk) => void;
  onDeleteDownloadedApk: (id: string) => void;
  onOpenApp: (id: AppId) => void;
  onOpenCustomApk: (pkg: string) => void;
  onSyncOfficialIcons: () => Promise<void>;
  onLog: (level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', tag: string, msg: string) => void;
}

const QUICK_SEARCH_QUERIES = [
  'Spotify',
  'WhatsApp',
  'Wikipedia',
  'Telegram',
  'TikTok',
  'GitHub',
];

export const ApkPureApp: React.FC<ApkPureAppProps> = ({
  apps,
  installedIds,
  customApks,
  downloadedApks,
  liveIconsMap,
  downloadingApkMap,
  isOnline,
  networkProfile,
  darkTheme,
  onDownloadApk,
  onInstallDownloadedApk,
  onDeleteDownloadedApk,
  onOpenApp,
  onOpenCustomApk,
  onSyncOfficialIcons,
  onLog,
}) => {
  const [tab, setTab] = useState<'google' | 'search' | 'downloads'>('google');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LiveSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [syncingGoogle, setSyncingGoogle] = useState(false);
  const [installerApk, setInstallerApk] = useState<DownloadedApk | null>(null);
  const [installedJustNow, setInstalledJustNow] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<LiveSearchResult | null>(null);

  const googleApps = apps.filter((a) => a.developer === 'Google LLC');

  useEffect(() => {
    if (isOnline && Object.keys(liveIconsMap).length === 0) {
      setSyncingGoogle(true);
      onSyncOfficialIcons().finally(() => setSyncingGoogle(false));
    }
  }, [isOnline]);

  const runSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setTab('search');
    setQuery(trimmed);
    if (!isOnline) {
      setSearchError('Device is offline. Enable Wi-Fi or Cellular to search APKPure.');
      return;
    }
    setSearching(true);
    setSearchError(null);
    onLog('INFO', 'APKPureClient', `Searching APKPure packages for "${trimmed}"`);
    try {
      const resp = await fetch(`/api/apkpure/search?q=${encodeURIComponent(trimmed)}`);
      if (!resp.ok) throw new Error('Search failed');
      const data = await resp.json();
      setSearchResults(data.results || []);
      if ((data.results || []).length === 0) {
        setSearchError(`No APK packages found for "${trimmed}".`);
      }
    } catch {
      setSearchError('Unable to reach APKPure package index.');
    } finally {
      setSearching(false);
    }
  };

  const isPkgInstalled = (packageName: string, appId?: AppId) => {
    if (appId && installedIds.includes(appId)) return true;
    return customApks.some((c) => c.packageName === packageName);
  };

  const getDownloadedRecord = (packageName: string) =>
    downloadedApks.find((d) => d.packageName === packageName);

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  if (selectedDetail) {
    const dlProgress = downloadingApkMap[selectedDetail.packageName];
    const downloaded = getDownloadedRecord(selectedDetail.packageName);
    const matchingBuiltin = apps.find((a) => a.packageName === selectedDetail.packageName);
    const installed = isPkgInstalled(selectedDetail.packageName, matchingBuiltin?.id);

    return (
      <div className={`h-full flex flex-col ${surface} relative`}>
        <div className="px-3 py-2.5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setSelectedDetail(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Back to APKPure"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold">APK Package Details</span>
          <a
            href={selectedDetail.apkpureUrl}
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-[#24CD77]"
            title="View on apkpure.com"
            aria-label="View on apkpure.com"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="flex-1 overflow-y-auto phone-scroll p-4 space-y-4">
          <div className="flex items-start gap-3.5">
            <CustomApkIcon
              name={selectedDetail.name}
              iconUrl={selectedDetail.iconUrl}
              size={60}
            />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold leading-snug">{selectedDetail.name}</h2>
              <p className="text-xs font-medium text-[#16A34A] dark:text-[#24CD77]">
                {selectedDetail.developer}
              </p>
              <p className={`text-[11px] font-mono-tabular mt-0.5 truncate ${muted}`}>
                {selectedDetail.packageName}
              </p>
            </div>
          </div>

          <div className={`grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 py-2.5 border-y border-slate-200/80 dark:border-slate-800 text-center`}>
            <div>
              <div className="text-xs font-semibold font-mono-tabular">{selectedDetail.rating}</div>
              <div className={`text-[10px] ${muted}`}>Rating</div>
            </div>
            <div>
              <div className="text-xs font-semibold font-mono-tabular">{selectedDetail.sizeMb} MB</div>
              <div className={`text-[10px] ${muted}`}>APK Size</div>
            </div>
            <div>
              <div className="text-xs font-semibold font-mono-tabular">APK</div>
              <div className={`text-[10px] ${muted}`}>{selectedDetail.version}</div>
            </div>
          </div>

          <div className="space-y-2">
            {typeof dlProgress === 'number' ? (
              <div className="h-11 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-300 font-mono-tabular">
                <span>Downloading APK...</span>
                <span>{dlProgress}%</span>
              </div>
            ) : installed ? (
              <button
                onClick={() =>
                  matchingBuiltin
                    ? onOpenApp(matchingBuiltin.id)
                    : onOpenCustomApk(selectedDetail.packageName)
                }
                className="w-full h-11 rounded-full bg-[#24CD77] hover:bg-[#1EB869] text-slate-950 text-xs font-bold transition-colors"
              >
                Open Installed App
              </button>
            ) : downloaded ? (
              <button
                onClick={() => {
                  setInstalledJustNow(false);
                  setInstallerApk(downloaded);
                }}
                className="w-full h-11 rounded-full bg-[#24CD77] hover:bg-[#1EB869] text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Install Downloaded APK</span>
              </button>
            ) : (
              <button
                onClick={() =>
                  onDownloadApk({
                    packageName: selectedDetail.packageName,
                    name: selectedDetail.name,
                    developer: selectedDetail.developer,
                    version: selectedDetail.version,
                    sizeMb: selectedDetail.sizeMb,
                    iconUrl: selectedDetail.iconUrl,
                    description: selectedDetail.description,
                    rating: selectedDetail.rating,
                    apkpureUrl: selectedDetail.apkpureUrl,
                    appId: matchingBuiltin?.id,
                  })
                }
                className="w-full h-11 rounded-full bg-[#24CD77] hover:bg-[#1EB869] text-slate-950 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download APK ({selectedDetail.sizeMb} MB)</span>
              </button>
            )}

            <a
              href={`/api/apkpure/download?pkg=${encodeURIComponent(
                selectedDetail.packageName
              )}&name=${encodeURIComponent(selectedDetail.name)}&version=${encodeURIComponent(
                selectedDetail.version
              )}`}
              download={`${selectedDetail.packageName}.apk`}
              className={`w-full h-10 rounded-full border text-xs font-semibold flex items-center justify-center gap-2 ${cardBg}`}
            >
              <HardDriveDownload className="w-4 h-4 text-[#24CD77]" />
              <span>Save .APK File to Computer</span>
            </a>
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold">About Package</h3>
            <p className={`text-xs leading-relaxed ${muted}`}>{selectedDetail.description}</p>
          </div>

          <div className={`p-3 rounded-2xl border ${cardBg} flex items-center gap-3`}>
            <ShieldCheck className="w-5 h-5 text-[#24CD77] shrink-0" />
            <div className="min-w-0">
              <div className="text-xs font-semibold">APKPure Signature Verified</div>
              <div className={`text-[11px] truncate ${muted}`}>
                Original SHA-256 package · {selectedDetail.apkpureUrl}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${surface} relative`}>
      {/* APKPure Header */}
      <div className="px-3.5 pt-3 pb-2.5 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppIcon id="apkpure" size={26} />
            <div>
              <div className="text-sm font-bold leading-none">APKPure</div>
              <div className={`text-[10px] font-mono-tabular ${muted}`}>
                {isOnline ? `Connected · ${networkProfile.toUpperCase()}` : 'Offline'}
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              setSyncingGoogle(true);
              await onSyncOfficialIcons();
              setSyncingGoogle(false);
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${cardBg}`}
            title="Sync original Google LLC icons & package metadata"
          >
            <RefreshCw className={`w-3 h-3 ${syncingGoogle ? 'animate-spin text-[#24CD77]' : ''}`} />
            <span>Sync Originals</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className={`flex items-center gap-2 px-3 h-9 rounded-full border ${cardBg}`}
        >
          <Search className={`w-3.5 h-3.5 shrink-0 ${muted}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search real APKs (Spotify, WhatsApp, Chrome...)"
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear query">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </form>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3.5">
        {tab === 'google' && (
          <>
            <div className={`p-3 rounded-2xl border ${cardBg} space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#16A34A] dark:text-[#24CD77]">
                  Original Google LLC APKs
                </span>
                <span className={`text-[10px] font-mono-tabular ${muted}`}>
                  {googleApps.length} packages
                </span>
              </div>
              <p className={`text-[11px] leading-snug ${muted}`}>
                Authentic com.google.android.* & com.android.* packages sourced via APKPure. Download .apk archives directly inside this device.
              </p>
            </div>

            <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
              {googleApps.map((app) => {
                const liveIcon = liveIconsMap[app.packageName];
                const dlProgress = downloadingApkMap[app.packageName];
                const downloaded = getDownloadedRecord(app.packageName);
                const installed = installedIds.includes(app.id);

                return (
                  <div key={app.id} className="py-2.5 flex items-center gap-2.5">
                    <AppIcon id={app.id} iconUrl={liveIcon} size={42} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate">{app.name}</span>
                        {liveIcon && (
                          <CheckCircle2 className="w-3 h-3 text-[#24CD77] shrink-0" />
                        )}
                      </div>
                      <div className={`text-[10px] font-mono-tabular truncate ${muted}`}>
                        {app.packageName}
                      </div>
                      <div className={`text-[10px] font-mono-tabular ${muted}`}>
                        v{app.version} · {app.sizeMb} MB · APKPure
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {typeof dlProgress === 'number' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#16A34A] dark:text-[#24CD77] text-[10px] font-bold font-mono-tabular">
                          {dlProgress}%
                        </span>
                      ) : downloaded && !installed ? (
                        <button
                          onClick={() => {
                            setInstalledJustNow(false);
                            setInstallerApk(downloaded);
                          }}
                          className="px-2.5 py-1 rounded-full bg-[#24CD77] text-slate-950 text-[10px] font-bold"
                        >
                          Install
                        </button>
                      ) : !installed ? (
                        <button
                          onClick={() =>
                            onDownloadApk({
                              packageName: app.packageName,
                              name: app.name,
                              developer: app.developer,
                              version: app.version,
                              sizeMb: app.sizeMb,
                              iconUrl: liveIcon,
                              description: app.description,
                              rating: String(app.rating),
                              apkpureUrl:
                                app.apkpureUrl ||
                                `https://apkpure.com/search?q=${encodeURIComponent(app.packageName)}`,
                              appId: app.id,
                            })
                          }
                          className="px-2.5 py-1 rounded-full bg-[#24CD77] hover:bg-[#1EB869] text-slate-950 text-[10px] font-bold flex items-center gap-1"
                          title="Download APK inside emulator"
                        >
                          <Download className="w-3 h-3" />
                          <span>APK</span>
                        </button>
                      ) : null}

                      {installed && (
                        <button
                          onClick={() => onOpenApp(app.id)}
                          className="px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          Open
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'search' && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto phone-scroll pb-1">
              {QUICK_SEARCH_QUERIES.map((chip) => (
                <button
                  key={chip}
                  onClick={() => runSearch(chip)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium shrink-0 ${cardBg}`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {!isOnline && (
              <div className={`p-4 rounded-2xl border text-center space-y-2 ${cardBg}`}>
                <WifiOff className="w-5 h-5 mx-auto text-slate-400" />
                <div className="text-xs font-semibold">No Internet Connection</div>
                <p className={`text-[11px] ${muted}`}>
                  Switch Network to Wi-Fi or 5G to query live APKPure packages.
                </p>
              </div>
            )}

            {searching && (
              <div className="py-10 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
                <div className="w-5 h-5 rounded-full border-2 border-[#24CD77] border-t-transparent animate-spin" />
                <span>Searching APKPure package index...</span>
              </div>
            )}

            {!searching && searchError && (
              <div className={`p-4 rounded-2xl border text-xs text-center ${cardBg} ${muted}`}>
                {searchError}
              </div>
            )}

            {!searching && searchResults.length > 0 && (
              <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
                {searchResults.map((pkg) => {
                  const dlProgress = downloadingApkMap[pkg.packageName];
                  const downloaded = getDownloadedRecord(pkg.packageName);
                  const builtin = apps.find((a) => a.packageName === pkg.packageName);
                  const installed = isPkgInstalled(pkg.packageName, builtin?.id);

                  return (
                    <div
                      key={pkg.packageName}
                      onClick={() => setSelectedDetail(pkg)}
                      className="py-2.5 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-xl px-1"
                    >
                      <CustomApkIcon name={pkg.name} iconUrl={pkg.iconUrl} size={44} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate">{pkg.name}</div>
                        <div className={`text-[10px] font-mono-tabular truncate ${muted}`}>
                          {pkg.packageName}
                        </div>
                        <div className={`text-[10px] ${muted}`}>
                          {pkg.developer} · {pkg.sizeMb} MB · {pkg.rating} stars
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                        {typeof dlProgress === 'number' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[#16A34A] dark:text-[#24CD77] text-[10px] font-bold font-mono-tabular">
                            {dlProgress}%
                          </span>
                        ) : installed ? (
                          <button
                            onClick={() =>
                              builtin ? onOpenApp(builtin.id) : onOpenCustomApk(pkg.packageName)
                            }
                            className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-[11px] font-semibold"
                          >
                            Open
                          </button>
                        ) : downloaded ? (
                          <button
                            onClick={() => {
                              setInstalledJustNow(false);
                              setInstallerApk(downloaded);
                            }}
                            className="px-3 py-1.5 rounded-full bg-[#24CD77] text-slate-950 text-[11px] font-bold"
                          >
                            Install
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onDownloadApk({
                                packageName: pkg.packageName,
                                name: pkg.name,
                                developer: pkg.developer,
                                version: pkg.version,
                                sizeMb: pkg.sizeMb,
                                iconUrl: pkg.iconUrl,
                                description: pkg.description,
                                rating: pkg.rating,
                                apkpureUrl: pkg.apkpureUrl,
                                appId: builtin?.id,
                              })
                            }
                            className="px-3 py-1.5 rounded-full bg-[#24CD77] text-slate-950 text-[11px] font-bold"
                          >
                            Get APK
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!searching && searchResults.length === 0 && !searchError && isOnline && (
              <div className={`p-5 rounded-2xl border text-center space-y-1.5 ${cardBg}`}>
                <div className="text-xs font-semibold">Search Any Android App</div>
                <p className={`text-[11px] ${muted}`}>
                  Search real Android packages above or tap a quick tag to download its .apk inside the emulator.
                </p>
              </div>
            )}
          </div>
        )}

        {tab === 'downloads' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">/sdcard/Download/*.apk</span>
              <span className={`text-[11px] font-mono-tabular ${muted}`}>
                {downloadedApks.length} saved
              </span>
            </div>

            {Object.entries(downloadingApkMap).map(([pkg, pct]) => (
              <div key={pkg} className={`p-3 rounded-2xl border space-y-2 ${cardBg}`}>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="truncate font-mono-tabular">{pkg}.apk</span>
                  <span className="font-mono-tabular text-[#16A34A] dark:text-[#24CD77]">{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className="h-full bg-[#24CD77] transition-all duration-200"
                  />
                </div>
              </div>
            ))}

            {downloadedApks.length === 0 && Object.keys(downloadingApkMap).length === 0 ? (
              <div className={`p-6 rounded-2xl border text-center space-y-1.5 ${cardBg}`}>
                <Download className="w-5 h-5 mx-auto text-slate-400" />
                <div className="text-xs font-semibold">No APK Downloads Yet</div>
                <p className={`text-[11px] ${muted}`}>
                  Tap APK on any Google app or search any Android package to download it here.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {downloadedApks.map((apk) => {
                  const builtin = apps.find((a) => a.packageName === apk.packageName);
                  const installed =
                    apk.installed || isPkgInstalled(apk.packageName, builtin?.id);

                  return (
                    <div key={apk.id} className={`p-3 rounded-2xl border space-y-2.5 ${cardBg}`}>
                      <div className="flex items-center gap-3">
                        <CustomApkIcon name={apk.name} iconUrl={apk.iconUrl} size={40} />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold truncate">{apk.name}</div>
                          <div className={`text-[10px] font-mono-tabular truncate ${muted}`}>
                            {apk.packageName}_apkpure.apk
                          </div>
                          <div className={`text-[10px] font-mono-tabular ${muted}`}>
                            {apk.sizeMb} MB · {apk.downloadedAt} · {installed ? 'Installed' : 'Ready to install'}
                          </div>
                        </div>
                        <button
                          onClick={() => onDeleteDownloadedApk(apk.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500"
                          title="Delete APK file"
                          aria-label={`Delete ${apk.name} APK`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {installed ? (
                          <button
                            onClick={() =>
                              builtin
                                ? onOpenApp(builtin.id)
                                : onOpenCustomApk(apk.packageName)
                            }
                            className="flex-1 h-8 rounded-full border border-slate-300 dark:border-slate-700 text-[11px] font-semibold"
                          >
                            Open App
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setInstalledJustNow(false);
                              setInstallerApk(apk);
                            }}
                            className="flex-1 h-8 rounded-full bg-[#24CD77] hover:bg-[#1EB869] text-slate-950 text-[11px] font-bold flex items-center justify-center gap-1"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Install APK</span>
                          </button>
                        )}

                        <a
                          href={`/api/apkpure/download?pkg=${encodeURIComponent(
                            apk.packageName
                          )}&name=${encodeURIComponent(apk.name)}&version=${encodeURIComponent(
                            apk.version
                          )}`}
                          download={`${apk.packageName}.apk`}
                          className="h-8 px-3 rounded-full border border-slate-300 dark:border-slate-700 text-[11px] font-semibold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <HardDriveDownload className="w-3.5 h-3.5" />
                          <span>Save .APK</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Tabs */}
      <div className="grid grid-cols-3 border-t border-slate-200 dark:border-slate-800 h-13 shrink-0">
        {[
          { id: 'google' as const, label: 'Google APKs' },
          { id: 'search' as const, label: 'Search' },
          {
            id: 'downloads' as const,
            label: `Downloads (${downloadedApks.length})`,
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`text-[11px] font-medium transition-colors ${
              tab === item.id ? 'text-[#16A34A] dark:text-[#24CD77] font-bold' : muted
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Android Package Installer Confirmation Sheet */}
      {installerApk && (
        <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-xs flex items-end justify-center p-3">
          <div
            className={`w-full rounded-3xl p-4 space-y-3.5 border shadow-2xl ${
              darkTheme
                ? 'bg-slate-900 border-slate-700 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <CustomApkIcon name={installerApk.name} iconUrl={installerApk.iconUrl} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-[#24CD77]">Android Package Installer</div>
                <div className="text-sm font-bold truncate">{installerApk.name}</div>
                <div className={`text-[10px] font-mono-tabular truncate ${muted}`}>
                  {installerApk.packageName}
                </div>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border text-[11px] space-y-1 ${cardBg}`}>
              <div className="font-semibold">
                {installedJustNow ? 'Application installed' : 'Install this application?'}
              </div>
              <div className={muted}>
                Permissions: {installerApk.permissions.join(', ')}
              </div>
              <div className={`font-mono-tabular ${muted}`}>
                Source: APKPure Verified Signature · {installerApk.sizeMb} MB
              </div>
            </div>

            {installedJustNow ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setInstallerApk(null);
                    setInstalledJustNow(false);
                  }}
                  className="flex-1 h-10 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    const builtin = apps.find((a) => a.packageName === installerApk.packageName);
                    const pkg = installerApk.packageName;
                    setInstallerApk(null);
                    setInstalledJustNow(false);
                    if (builtin) {
                      onOpenApp(builtin.id);
                    } else {
                      onOpenCustomApk(pkg);
                    }
                  }}
                  className="flex-1 h-10 rounded-full bg-[#24CD77] hover:bg-[#1EB869] text-slate-950 text-xs font-bold"
                >
                  Open App
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setInstallerApk(null);
                    setInstalledJustNow(false);
                  }}
                  className="flex-1 h-10 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onInstallDownloadedApk(installerApk);
                    setInstalledJustNow(true);
                  }}
                  className="flex-1 h-10 rounded-full bg-[#24CD77] hover:bg-[#1EB869] text-slate-950 text-xs font-bold"
                >
                  Install
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
