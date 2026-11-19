import React, { useEffect, useRef, useState } from 'react';
import {
  APPS_CATALOG,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_DRIVE_FILES,
  INITIAL_EMAILS,
  INITIAL_KEEP_NOTES,
  INITIAL_MEDIA,
  INITIAL_NOTIFICATIONS,
  INITIAL_SMS_THREADS,
  INITIAL_YOUTUBE_VIDEOS,
  WALLPAPERS,
} from './data/appsCatalog';
import {
  AndroidVersion,
  AppId,
  CalendarEvent,
  CustomApkApp,
  DownloadedApk,
  DriveFile,
  EmailMessage,
  EmulatorInstance,
  EmulatorSystemState,
  KeepNote,
  LogEntry,
  MediaItem,
  ResolutionPreset,
  SensorData,
  SmsThread,
  YouTubeVideo,
} from './types/emulator';
import { PhoneChassis } from './components/emulator/PhoneChassis';
import { WorkbenchSidebar } from './components/emulator/WorkbenchSidebar';
import { InstanceManager } from './components/emulator/InstanceManager';
import { StatusBar } from './components/emulator/StatusBar';
import { QuickSettingsShade } from './components/emulator/QuickSettingsShade';
import { LockScreen } from './components/emulator/LockScreen';
import { HomeScreen } from './components/emulator/HomeScreen';
import { RecentsView } from './components/emulator/RecentsView';
import { PlayStoreApp } from './components/apps/PlayStoreApp';
import { ApkPureApp } from './components/apps/ApkPureApp';
import { CustomApkRuntime } from './components/apps/CustomApkRuntime';
import { ChromeApp } from './components/apps/ChromeApp';
import { GmailApp } from './components/apps/GmailApp';
import { MapsApp } from './components/apps/MapsApp';
import { YouTubeApp } from './components/apps/YouTubeApp';
import { PhotosApp } from './components/apps/PhotosApp';
import { CameraApp } from './components/apps/CameraApp';
import {
  CalendarApp,
  DriveApp,
  GoogleSearchApp,
  MeetApp,
} from './components/apps/WorkspaceApps';
import {
  ClockApp,
  MessagesApp,
  PhoneApp,
} from './components/apps/UtilityApps';
import { SettingsApp } from './components/apps/SettingsApp';
import {
  BlockDashApp,
  DocsApp,
  EarthApp,
  KeepApp,
  TranslateApp,
  YouTubeMusicApp,
} from './components/apps/ExtraApps';

import { HotspotPortal } from './components/emulator/HotspotPortal';

const DEFAULT_SENSORS: SensorData = {
  gpsLat: 5.5126,
  gpsLon: 5.8394,
  gpsLabel: 'Orhuworun, Delta State',
  accelX: 0,
  accelY: 9.8,
  accelZ: 0,
  gyroPitch: 0,
  gyroRoll: 0,
  gyroYaw: 0,
};

function createSystemState(overrides?: Partial<EmulatorSystemState>): EmulatorSystemState {
  return {
    locked: false,
    darkTheme: false,
    wifi: true,
    bluetooth: true,
    cellular: true,
    airplaneMode: false,
    dnd: false,
    flashlight: false,
    hotspot: false,
    hotspotSsid: 'Pixel_9_Pro_Hotspot',
    hotspotPassword: 'pixel-studio-wifi',
    hotspotBand: '5 GHz',
    usbTethering: false,
    btTethering: false,
    brightness: 100,
    volume: 70,
    battery: 88,
    charging: true,
    batterySaver: false,
    landscape: false,
    wallpaperIndex: 0,
    screenRecording: false,
    resolution: 'standard',
    networkProfile: 'wifi',
    developerMode: true,
    usbDebugging: true,
    sensors: { ...DEFAULT_SENSORS },
    ...overrides,
  };
}

const PREINSTALLED_IDS = APPS_CATALOG.filter((a) => a.preinstalled).map((a) => a.id);

const INITIAL_INSTANCES: EmulatorInstance[] = [
  {
    id: 'avd-1',
    name: 'Pixel 9 Pro',
    androidVersion: '15',
    account: {
      name: 'Jonah Benita',
      email: 'jonahbenita089@gmail.com',
      avatarColor: '#047857',
    },
    system: createSystemState(),
    installedIds: [...PREINSTALLED_IDS],
    activeAppId: null,
    activeCustomPkg: null,
    recentIds: ['apkpure', 'playstore', 'chrome', 'youtube'],
    notifications: [...INITIAL_NOTIFICATIONS],
    downloadedApks: [],
    customApks: [],
    status: 'running',
  },
  {
    id: 'avd-2',
    name: 'Pixel Tablet QA',
    androidVersion: '14',
    account: {
      name: 'Studio QA',
      email: 'qa.testing@android.dev',
      avatarColor: '#1d4ed8',
    },
    system: createSystemState({
      darkTheme: true,
      wallpaperIndex: 1,
      resolution: 'tablet',
      networkProfile: '4g',
      wifi: false,
      cellular: true,
      battery: 72,
      charging: false,
      hotspotSsid: 'Pixel_Tablet_AP',
    }),
    installedIds: [...PREINSTALLED_IDS, 'keep'],
    activeAppId: 'playstore',
    activeCustomPkg: null,
    recentIds: ['playstore', 'maps'],
    notifications: [],
    downloadedApks: [],
    customApks: [],
    status: 'running',
  },
];

export default function App() {
  const hotspotParam = new URLSearchParams(window.location.search).get('hotspot');
  if (hotspotParam) {
    return <HotspotPortal hotspotId={hotspotParam} />;
  }
  return <EmulatorWorkbench />;
}

function EmulatorWorkbench() {
  const [instances, setInstances] = useState<EmulatorInstance[]>(INITIAL_INSTANCES);
  const [activeInstanceId, setActiveInstanceId] = useState<string>('avd-1');
  const [installingMap, setInstallingMap] = useState<Partial<Record<string, number>>>({});
  const [downloadingApkMap, setDownloadingApkMap] = useState<Partial<Record<string, number>>>({});
  const [liveIconsMap, setLiveIconsMap] = useState<Record<string, string>>({});
  const [booting, setBooting] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shadeOpen, setShadeOpen] = useState(false);
  const [recentsOpen, setRecentsOpen] = useState(false);
  const [chromeQuery, setChromeQuery] = useState<string | undefined>(undefined);
  const [volumeHudVisible, setVolumeHudVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Shared App data
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [emails, setEmails] = useState<EmailMessage[]>(INITIAL_EMAILS);
  const [smsThreads, setSmsThreads] = useState<SmsThread[]>(INITIAL_SMS_THREADS);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>(INITIAL_DRIVE_FILES);
  const [keepNotes, setKeepNotes] = useState<KeepNote[]>(INITIAL_KEEP_NOTES);
  const [videos, setVideos] = useState<YouTubeVideo[]>(INITIAL_YOUTUBE_VIDEOS);

  // Testing Tools State (Debugger Logcat & Performance Profiler)
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-init-1',
      time: '06:45:01',
      level: 'INFO',
      tag: 'SystemServer',
      message: 'Booted Pixel 9 Pro (Android 15 API 35) with Google Play Services',
    },
    {
      id: 'log-init-2',
      time: '06:45:02',
      level: 'INFO',
      tag: 'NetGateway',
      message: 'Free Internet Gateway connected (Orhuworun, Delta State)',
    },
  ]);
  const [cpuHistory, setCpuHistory] = useState<number[]>([14, 18, 15, 22, 19, 16, 20, 17, 15, 18, 16, 14]);
  const [memHistory, setMemHistory] = useState<number[]>([610, 620, 618, 635, 642, 640, 638, 645, 642, 640, 638, 642]);
  const [stressUntil, setStressUntil] = useState<number>(0);

  const [now, setNow] = useState(() => new Date());
  const [liveTempF, setLiveTempF] = useState<number>(84);
  const volumeTimerRef = useRef<number | null>(null);
  const recStartRef = useRef<number>(0);

  const activeInstance =
    instances.find((i) => i.id === activeInstanceId) || instances[0];
  const {
    system,
    installedIds,
    activeAppId,
    activeCustomPkg,
    recentIds,
    notifications,
    downloadedApks,
    customApks,
  } = activeInstance;
  const isOnline =
    activeInstance.status === 'running' &&
    !system.airplaneMode &&
    system.networkProfile !== 'offline' &&
    (system.wifi || system.cellular);

  const appendLog = (
    level: LogEntry['level'],
    tag: string,
    message: string
  ) => {
    const t = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    setLogs((prev) => [
      { id: `l-${Date.now()}-${Math.random()}`, time: t, level, tag, message },
      ...prev.slice(0, 79),
    ]);
  };

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    fetch(
      `/api/weather?lat=${system.sensors.gpsLat}&lon=${system.sensors.gpsLon}`
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (typeof d?.tempF === 'number') setLiveTempF(d.tempF);
      })
      .catch(() => {});
  }, [isOnline, system.sensors.gpsLat, system.sensors.gpsLon]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', system.darkTheme);
  }, [system.darkTheme]);

  // Sync each instance's hotspot broadcast state to the Express Hotspot Registry
  const hotspotSyncKey = instances
    .map((inst) =>
      [
        inst.id,
        inst.name,
        inst.status,
        inst.system.hotspot,
        inst.system.airplaneMode,
        inst.system.hotspotSsid,
        inst.system.hotspotPassword,
        inst.system.hotspotBand,
        inst.system.sensors.gpsLabel,
        inst.system.sensors.gpsLat,
        inst.system.sensors.gpsLon,
      ].join('|')
    )
    .join(';;');

  useEffect(() => {
    instances.forEach((inst) => {
      const active =
        inst.status === 'running' && inst.system.hotspot && !inst.system.airplaneMode;
      fetch('/api/hotspot/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `hs-${inst.id}`,
          instanceId: inst.id,
          deviceName: inst.name,
          ssid: inst.system.hotspotSsid,
          password: inst.system.hotspotPassword,
          band: inst.system.hotspotBand,
          active,
          locationLabel: inst.system.sensors.gpsLabel,
          lat: inst.system.sensors.gpsLat,
          lon: inst.system.sensors.gpsLon,
        }),
      }).catch(() => {});
    });
  }, [hotspotSyncKey]);

  const syncOfficialGoogleIcons = async () => {
    if (!isOnline) return;
    const googlePackages = APPS_CATALOG.filter((a) => a.developer === 'Google LLC').map(
      (a) => a.packageName
    );
    const settled = await Promise.allSettled(
      googlePackages.map(async (pkg) => {
        const res = await fetch(`/api/apkpure/package?pkg=${encodeURIComponent(pkg)}`);
        if (!res.ok) return null;
        return res.json();
      })
    );
    const updates: Record<string, string> = {};
    settled.forEach((item) => {
      if (item.status === 'fulfilled' && item.value?.packageName && item.value?.iconUrl) {
        updates[item.value.packageName] = item.value.iconUrl;
      }
    });
    if (Object.keys(updates).length > 0) {
      setLiveIconsMap((prev) => ({ ...prev, ...updates }));
      appendLog(
        'INFO',
        'APKPureSync',
        `Verified ${Object.keys(updates).length} official Google LLC package icons`
      );
    }
  };

  useEffect(() => {
    if (isOnline && Object.keys(liveIconsMap).length === 0) {
      syncOfficialGoogleIcons().catch(() => {});
    }
  }, [isOnline]);

  // Performance Profiler sampler
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (activeInstance.status === 'paused') {
        setCpuHistory((h) => [...h.slice(-15), 2]);
        return;
      }
      const isStress = Date.now() < stressUntil;
      const appWeight =
        activeAppId === 'camera' || activeAppId === 'youtube' || activeAppId === 'earth'
          ? 34
          : activeAppId === 'maps' || activeAppId === 'chrome' || activeAppId === 'playstore'
          ? 24
          : activeAppId
          ? 16
          : 9;
      const cpuSample = Math.min(
        98,
        Math.max(4, Math.round(appWeight + (isStress ? 48 : 0) + (Math.random() * 10 - 5)))
      );
      const memTarget =
        580 +
        recentIds.length * 48 +
        (activeAppId === 'youtube' || activeAppId === 'camera' ? 190 : 80) +
        (isStress ? 260 : 0);

      setCpuHistory((prev) => [...prev.slice(-15), cpuSample]);
      setMemHistory((prev) => {
        const last = prev[prev.length - 1] ?? 640;
        const next = Math.round(last + (memTarget - last) * 0.35 + (Math.random() * 12 - 6));
        return [...prev.slice(-15), Math.max(420, Math.min(1980, next))];
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [activeInstance.status, activeAppId, recentIds.length, stressUntil]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(null), 2600);
  };

  const updateActiveInstance = (updater: (inst: EmulatorInstance) => EmulatorInstance) => {
    setInstances((prev) =>
      prev.map((inst) => (inst.id === activeInstance.id ? updater(inst) : inst))
    );
  };

  const updateSystem = (patch: Partial<EmulatorSystemState>) => {
    updateActiveInstance((inst) => ({
      ...inst,
      system: { ...inst.system, ...patch },
    }));
    if (patch.networkProfile) {
      appendLog('INFO', 'Connectivity', `Network switched to ${patch.networkProfile.toUpperCase()}`);
    }
    if (patch.resolution) {
      appendLog('INFO', 'WindowManager', `Display resolution set to ${patch.resolution}`);
    }
  };

  const updateSensors = (patch: Partial<SensorData>) => {
    updateActiveInstance((inst) => ({
      ...inst,
      system: {
        ...inst.system,
        sensors: { ...inst.system.sensors, ...patch },
      },
    }));
    if (patch.gpsLabel) {
      appendLog(
        'INFO',
        'LocationManager',
        `GPS mocked to ${patch.gpsLabel} (${patch.gpsLat?.toFixed(3)}, ${patch.gpsLon?.toFixed(3)})`
      );
    }
  };

  const handleVolumeStep = (delta: number) => {
    updateSystem({ volume: Math.max(0, Math.min(100, system.volume + delta)) });
    setVolumeHudVisible(true);
    if (volumeTimerRef.current) window.clearTimeout(volumeTimerRef.current);
    volumeTimerRef.current = window.setTimeout(() => setVolumeHudVisible(false), 1600);
  };

  const openApp = (id: AppId, searchQuery?: string) => {
    if (activeInstance.status === 'paused') {
      showToast('Resume this emulator instance to interact');
      return;
    }
    if (!installedIds.includes(id)) {
      updateActiveInstance((inst) => ({
        ...inst,
        activeAppId: 'playstore',
        activeCustomPkg: null,
      }));
      return;
    }
    if (id === 'chrome' && searchQuery) {
      setChromeQuery(searchQuery);
    } else if (id === 'chrome' && !searchQuery) {
      setChromeQuery(undefined);
    }
    setDrawerOpen(false);
    setShadeOpen(false);
    setRecentsOpen(false);
    updateActiveInstance((inst) => ({
      ...inst,
      system: { ...inst.system, locked: false },
      activeAppId: id,
      activeCustomPkg: null,
      recentIds: [id, ...inst.recentIds.filter((x) => x !== id)].slice(0, 8),
    }));
    appendLog('INFO', 'ActivityManager', `START u0 {app=${id}} on ${activeInstance.name}`);
  };

  const openCustomApk = (packageName: string) => {
    if (activeInstance.status === 'paused') {
      showToast('Resume this emulator instance to interact');
      return;
    }
    setDrawerOpen(false);
    setShadeOpen(false);
    setRecentsOpen(false);
    updateActiveInstance((inst) => ({
      ...inst,
      system: { ...inst.system, locked: false },
      activeAppId: null,
      activeCustomPkg: packageName,
    }));
    appendLog('INFO', 'ActivityManager', `START u0 {pkg=${packageName}} on ${activeInstance.name}`);
  };

  const handleDownloadApk = (pkg: {
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
  }) => {
    if (!isOnline) {
      showToast('Connect to Wi-Fi or Cellular to download APKs');
      return;
    }
    const dlKey = `${activeInstance.id}:${pkg.packageName}`;
    if (typeof downloadingApkMap[dlKey] === 'number') return;

    setDownloadingApkMap((prev) => ({ ...prev, [dlKey]: 10 }));
    appendLog(
      'INFO',
      'APKPureDownloader',
      `Downloading ${pkg.packageName}_apkpure.apk (${pkg.sizeMb} MB) via ${system.networkProfile.toUpperCase()}`
    );

    const stepMs =
      system.networkProfile === '3g' ? 480 : system.networkProfile === '4g' ? 260 : 150;
    const targetInstId = activeInstance.id;

    const interval = window.setInterval(() => {
      setDownloadingApkMap((prev) => {
        const current = prev[dlKey] ?? 0;
        if (current >= 100) {
          window.clearInterval(interval);
          const nextMap = { ...prev };
          delete nextMap[dlKey];

          const nowTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          const newApk: DownloadedApk = {
            id: `apk-${Date.now()}`,
            packageName: pkg.packageName,
            name: pkg.name,
            developer: pkg.developer,
            version: pkg.version,
            sizeMb: pkg.sizeMb,
            iconUrl: pkg.iconUrl,
            description: pkg.description,
            rating: pkg.rating,
            downloadedAt: nowTime,
            installed: false,
            permissions: ['INTERNET', 'ACCESS_NETWORK_STATE', 'WAKE_LOCK'],
            apkpureUrl: pkg.apkpureUrl,
            appId: pkg.appId,
          };

          setInstances((all) =>
            all.map((inst) => {
              if (inst.id !== targetInstId) return inst;
              const deduped = inst.downloadedApks.filter(
                (d) => d.packageName !== pkg.packageName
              );
              return {
                ...inst,
                downloadedApks: [newApk, ...deduped],
                notifications: [
                  {
                    id: `n-apk-${Date.now()}`,
                    appId: 'apkpure',
                    appName: 'APKPure',
                    title: `${pkg.name}.apk downloaded`,
                    body: `Saved to /sdcard/Download/${pkg.packageName}.apk`,
                    time: 'now',
                  },
                  ...inst.notifications,
                ],
              };
            })
          );
          appendLog(
            'INFO',
            'DownloadManager',
            `Saved /sdcard/Download/${pkg.packageName}_apkpure.apk`
          );
          showToast(`${pkg.name}.apk saved to Downloads`);
          return nextMap;
        }
        return { ...prev, [dlKey]: Math.min(100, current + 25) };
      });
    }, stepMs);
  };

  const handleInstallDownloadedApk = (apk: DownloadedApk) => {
    const builtinMatch = APPS_CATALOG.find((a) => a.packageName === apk.packageName);
    updateActiveInstance((inst) => {
      const nextInstalledIds =
        builtinMatch && !inst.installedIds.includes(builtinMatch.id)
          ? [...inst.installedIds, builtinMatch.id]
          : inst.installedIds;
      const nextCustomApks =
        !builtinMatch && !inst.customApks.some((c) => c.packageName === apk.packageName)
          ? [
              ...inst.customApks,
              {
                packageName: apk.packageName,
                name: apk.name,
                developer: apk.developer,
                version: apk.version,
                sizeMb: apk.sizeMb,
                iconUrl: apk.iconUrl,
                description:
                  apk.description || `Installed from APKPure (${apk.packageName}).`,
                apkpureUrl: apk.apkpureUrl,
                rating: apk.rating || '4.6',
              },
            ]
          : inst.customApks;
      return {
        ...inst,
        installedIds: nextInstalledIds,
        customApks: nextCustomApks,
        downloadedApks: inst.downloadedApks.map((d) =>
          d.packageName === apk.packageName ? { ...d, installed: true } : d
        ),
      };
    });
    appendLog(
      'INFO',
      'PackageInstaller',
      `Installed APK ${apk.packageName} from APKPure`
    );
    showToast(`${apk.name} installed via Package Installer`);
  };

  const handleUninstallCustomApk = (packageName: string) => {
    updateActiveInstance((inst) => ({
      ...inst,
      customApks: inst.customApks.filter((c) => c.packageName !== packageName),
      downloadedApks: inst.downloadedApks.map((d) =>
        d.packageName === packageName ? { ...d, installed: false } : d
      ),
      activeCustomPkg: inst.activeCustomPkg === packageName ? null : inst.activeCustomPkg,
    }));
    appendLog('INFO', 'PackageManager', `Uninstalled ${packageName}`);
    showToast('APK uninstalled');
  };

  const handleReboot = () => {
    setBooting(true);
    setShadeOpen(false);
    setRecentsOpen(false);
    setDrawerOpen(false);
    updateActiveInstance((inst) => ({
      ...inst,
      activeAppId: null,
      activeCustomPkg: null,
      system: { ...inst.system, locked: false },
    }));
    appendLog('INFO', 'AVDManager', `Cold booting ${activeInstance.name}...`);
    window.setTimeout(() => {
      setBooting(false);
      showToast(`${activeInstance.name} booted`);
    }, 1400);
  };

  const handleInstallApp = (id: AppId) => {
    const key = `${activeInstance.id}:${id}`;
    if (installedIds.includes(id) || typeof installingMap[key] === 'number') return;
    setInstallingMap((prev) => ({ ...prev, [key]: 12 }));
    appendLog('INFO', 'PlayStore', `Downloading package ${id} over ${system.networkProfile.toUpperCase()}`);

    const stepMs =
      system.networkProfile === '3g' ? 520 : system.networkProfile === '4g' ? 280 : 180;
    const targetInstId = activeInstance.id;

    const interval = window.setInterval(() => {
      setInstallingMap((prev) => {
        const current = prev[key] ?? 0;
        if (current >= 100) {
          window.clearInterval(interval);
          const next = { ...prev };
          delete next[key];
          const appMeta = APPS_CATALOG.find((a) => a.id === id);
          setInstances((all) =>
            all.map((inst) => {
              if (inst.id !== targetInstId) return inst;
              const nextInstalled = inst.installedIds.includes(id)
                ? inst.installedIds
                : [...inst.installedIds, id];
              const nextNotifs = appMeta
                ? [
                    {
                      id: `n-${Date.now()}`,
                      appId: 'playstore' as AppId,
                      appName: 'Play Store',
                      title: `${appMeta.name} installed`,
                      body: 'Added to Home Screen and App Drawer.',
                      time: 'now',
                    },
                    ...inst.notifications,
                  ]
                : inst.notifications;
              return { ...inst, installedIds: nextInstalled, notifications: nextNotifs };
            })
          );
          if (appMeta) {
            appendLog('INFO', 'PackageManager', `Installed ${appMeta.name} on ${targetInstId}`);
            showToast(`${appMeta.name} installed from Play Store`);
          }
          return next;
        }
        return { ...prev, [key]: Math.min(100, current + 22) };
      });
    }, stepMs);
  };

  const handleUninstallApp = (id: AppId) => {
    const appMeta = APPS_CATALOG.find((a) => a.id === id);
    if (appMeta?.preinstalled) return;
    updateActiveInstance((inst) => ({
      ...inst,
      installedIds: inst.installedIds.filter((x) => x !== id),
      recentIds: inst.recentIds.filter((x) => x !== id),
      activeAppId: inst.activeAppId === id ? null : inst.activeAppId,
    }));
    appendLog('INFO', 'PackageManager', `Uninstalled ${appMeta?.name ?? id}`);
    showToast(`${appMeta?.name ?? 'App'} uninstalled`);
  };

  const handleTakeScreenshot = () => {
    const activeApp = APPS_CATALOG.find((a) => a.id === activeAppId);
    const label = activeApp ? activeApp.name : 'Home Screen';
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 480, 360);
      grad.addColorStop(0, system.darkTheme ? '#0f172a' : '#e2e8f0');
      grad.addColorStop(1, activeApp?.accentColor || '#1A73E8');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 480, 360);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px Plus Jakarta Sans, sans-serif';
      ctx.fillText(`${activeInstance.name} · ${label}`, 28, 165);
      ctx.font = '14px DM Sans, sans-serif';
      ctx.fillText(
        `Android ${activeInstance.androidVersion} · ${now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        28,
        195
      );
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setMedia((prev) => [
      {
        id: `ss-${Date.now()}`,
        type: 'photo',
        title: `Screenshot (${label})`,
        dateLabel: 'Just now',
        location: activeInstance.name,
        src: dataUrl,
        filter: 'original',
      },
      ...prev,
    ]);
    appendLog('INFO', 'ScreenshotService', `Captured ${label} screenshot`);
    showToast('Screenshot saved to Google Photos');
  };

  const handleToggleScreenRecord = () => {
    if (!system.screenRecording) {
      recStartRef.current = Date.now();
      updateSystem({ screenRecording: true });
      appendLog('INFO', 'ScreenRecord', 'Started screen activity capture');
      showToast('Screen video recording started');
    } else {
      const elapsedSec = Math.max(4, Math.round((Date.now() - recStartRef.current) / 1000));
      updateSystem({ screenRecording: false });
      const activeApp = APPS_CATALOG.find((a) => a.id === activeAppId);
      setMedia((prev) => [
        {
          id: `rec-${Date.now()}`,
          type: 'video',
          title: `Screen Recording (${activeApp ? activeApp.name : 'Android OS'})`,
          dateLabel: 'Just now',
          location: activeInstance.name,
          videoPreset: 'kinetic',
          videoColor: activeApp?.accentColor || '#1A73E8',
          durationSec: elapsedSec,
        },
        ...prev,
      ]);
      appendLog('INFO', 'ScreenRecord', `Saved ${elapsedSec}s recording to Google Photos`);
      showToast('Recorded video saved to Google Photos');
    }
  };

  const handleNavBack = () => {
    if (shadeOpen) {
      setShadeOpen(false);
      return;
    }
    if (recentsOpen) {
      setRecentsOpen(false);
      return;
    }
    if (drawerOpen) {
      setDrawerOpen(false);
      return;
    }
    if (activeAppId || activeCustomPkg) {
      updateActiveInstance((inst) => ({
        ...inst,
        activeAppId: null,
        activeCustomPkg: null,
      }));
    }
  };

  const handleNavHome = () => {
    if (system.locked) return;
    setShadeOpen(false);
    setRecentsOpen(false);
    setDrawerOpen(false);
    updateActiveInstance((inst) => ({
      ...inst,
      activeAppId: null,
      activeCustomPkg: null,
    }));
  };

  const handleNavRecents = () => {
    if (system.locked) return;
    setShadeOpen(false);
    setDrawerOpen(false);
    setRecentsOpen((r) => !r);
  };

  const timeText = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dateText = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const currentWallpaper = WALLPAPERS[system.wallpaperIndex] || WALLPAPERS[0];
  const isHomeVisible = (!activeAppId && !activeCustomPkg) || system.locked;
  const statusBarLightText =
    isHomeVisible ||
    system.darkTheme ||
    activeAppId === 'camera' ||
    activeAppId === 'meet' ||
    activeAppId === 'ytmusic' ||
    activeAppId === 'earth' ||
    activeAppId === 'blockdash';

  // Extract installing percentage map for current instance
  const instanceInstallingMap: Partial<Record<AppId, number>> = {};
  Object.entries(installingMap).forEach(([k, v]) => {
    const [instId, appId] = k.split(':');
    if (instId === activeInstance.id && typeof v === 'number') {
      instanceInstallingMap[appId as AppId] = v;
    }
  });

  const instanceDownloadingApkMap: Record<string, number> = {};
  Object.entries(downloadingApkMap).forEach(([k, v]) => {
    const idx = k.indexOf(':');
    if (idx > 0) {
      const instId = k.slice(0, idx);
      const pkg = k.slice(idx + 1);
      if (instId === activeInstance.id && typeof v === 'number') {
        instanceDownloadingApkMap[pkg] = v;
      }
    }
  });

  const renderActiveApp = () => {
    if (activeCustomPkg) {
      const customApk = customApks.find((c) => c.packageName === activeCustomPkg);
      if (customApk) {
        return (
          <CustomApkRuntime
            apk={customApk}
            isOnline={isOnline}
            darkTheme={system.darkTheme}
            gpsLabel={system.sensors.gpsLabel}
            volume={system.volume}
            onOpenInChrome={(q) => openApp('chrome', q)}
            onUninstall={handleUninstallCustomApk}
          />
        );
      }
    }

    switch (activeAppId) {
      case 'playstore':
        return (
          <PlayStoreApp
            apps={APPS_CATALOG}
            installedIds={installedIds}
            installingMap={instanceInstallingMap}
            liveIconsMap={liveIconsMap}
            account={activeInstance.account}
            onInstall={handleInstallApp}
            onUninstall={handleUninstallApp}
            onOpenApp={(id) => openApp(id)}
            darkTheme={system.darkTheme}
          />
        );
      case 'apkpure':
        return (
          <ApkPureApp
            apps={APPS_CATALOG}
            installedIds={installedIds}
            customApks={customApks}
            downloadedApks={downloadedApks}
            liveIconsMap={liveIconsMap}
            downloadingApkMap={instanceDownloadingApkMap}
            isOnline={isOnline}
            networkProfile={system.networkProfile}
            darkTheme={system.darkTheme}
            onDownloadApk={handleDownloadApk}
            onInstallDownloadedApk={handleInstallDownloadedApk}
            onDeleteDownloadedApk={(id) =>
              updateActiveInstance((inst) => ({
                ...inst,
                downloadedApks: inst.downloadedApks.filter((d) => d.id !== id),
              }))
            }
            onOpenApp={(id) => openApp(id)}
            onOpenCustomApk={openCustomApk}
            onSyncOfficialIcons={syncOfficialGoogleIcons}
            onLog={appendLog}
          />
        );
      case 'chrome':
        return (
          <ChromeApp
            darkTheme={system.darkTheme}
            initialQuery={chromeQuery}
            isOnline={isOnline}
            networkProfile={system.networkProfile}
            gpsLat={system.sensors.gpsLat}
            gpsLon={system.sensors.gpsLon}
            gpsLabel={system.sensors.gpsLabel}
            onLog={appendLog}
            onReconnectWifi={() =>
              updateSystem({ airplaneMode: false, wifi: true, networkProfile: 'wifi' })
            }
          />
        );
      case 'gmail':
        return (
          <GmailApp
            emails={emails}
            account={activeInstance.account}
            onToggleStar={(id) =>
              setEmails((prev) =>
                prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e))
              )
            }
            onMarkRead={(id) =>
              setEmails((prev) =>
                prev.map((e) => (e.id === id ? { ...e, unread: false } : e))
              )
            }
            onSendEmail={(to, subject, body) => {
              setEmails((prev) => [
                {
                  id: `em-${Date.now()}`,
                  from: `To: ${to}`,
                  fromEmail: activeInstance.account.email,
                  subject,
                  preview: body.slice(0, 60),
                  body,
                  time: 'now',
                  unread: false,
                  starred: false,
                  folder: 'sent',
                },
                ...prev,
              ]);
              appendLog('INFO', 'GmailSync', `Sent email to ${to}`);
              showToast('Email sent');
            }}
            darkTheme={system.darkTheme}
          />
        );
      case 'maps':
        return (
          <MapsApp
            darkTheme={system.darkTheme}
            gpsLat={system.sensors.gpsLat}
            gpsLon={system.sensors.gpsLon}
            gpsLabel={system.sensors.gpsLabel}
          />
        );
      case 'youtube':
        return (
          <YouTubeApp
            videos={videos}
            onCreateVideo={(newVid) => {
              const created: YouTubeVideo = {
                ...newVid,
                id: `yt-${Date.now()}`,
                views: '1 view',
                published: 'Just now',
                likes: 1,
              };
              setVideos((prev) => [created, ...prev]);
              setMedia((prev) => [
                {
                  id: `vid-${Date.now()}`,
                  type: 'video',
                  title: created.title,
                  dateLabel: 'Just now',
                  location: 'YouTube Video Studio',
                  videoPreset: created.preset,
                  videoColor: created.accent,
                  durationSec: created.durationSec,
                },
                ...prev,
              ]);
              appendLog('INFO', 'YouTubeStudio', `Published video "${created.title}"`);
              showToast('Video published to YouTube & Photos');
            }}
            darkTheme={system.darkTheme}
          />
        );
      case 'photos':
        return (
          <PhotosApp
            media={media}
            onUpdateFilter={(id, filter) =>
              setMedia((prev) => prev.map((m) => (m.id === id ? { ...m, filter } : m)))
            }
            onDeleteMedia={(id) =>
              setMedia((prev) => prev.filter((m) => m.id !== id))
            }
            darkTheme={system.darkTheme}
          />
        );
      case 'camera':
        return (
          <CameraApp
            gyroRoll={system.sensors.gyroRoll}
            onCaptureMedia={(item) => {
              setMedia((prev) => [{ ...item, id: `cam-${Date.now()}` }, ...prev]);
              appendLog('INFO', 'CameraService', `Saved ${item.type} capture to Photos`);
            }}
            onOpenPhotos={() => openApp('photos')}
          />
        );
      case 'calendar':
        return (
          <CalendarApp
            events={events}
            onAddEvent={(ev) =>
              setEvents((prev) => [...prev, { ...ev, id: `ev-${Date.now()}` }])
            }
            darkTheme={system.darkTheme}
          />
        );
      case 'drive':
        return (
          <DriveApp
            files={driveFiles}
            onAddFile={(name, type) =>
              setDriveFiles((prev) => [
                {
                  id: `d-${Date.now()}`,
                  name,
                  type,
                  modified: 'Just now',
                  size: type === 'folder' ? '0 items' : '12 KB',
                  starred: false,
                  content: `New ${type} created inside Android Google Drive.`,
                },
                ...prev,
              ])
            }
            onToggleStar={(id) =>
              setDriveFiles((prev) =>
                prev.map((f) => (f.id === id ? { ...f, starred: !f.starred } : f))
              )
            }
            darkTheme={system.darkTheme}
          />
        );
      case 'meet':
        return <MeetApp darkTheme={system.darkTheme} />;
      case 'search':
        return (
          <GoogleSearchApp
            darkTheme={system.darkTheme}
            liveTempF={liveTempF}
            gpsLabel={system.sensors.gpsLabel}
            isOnline={isOnline}
            onSearchInChrome={(q) => openApp('chrome', q)}
          />
        );
      case 'phone':
        return <PhoneApp darkTheme={system.darkTheme} />;
      case 'messages':
        return (
          <MessagesApp
            threads={smsThreads}
            onSendMessage={(threadId, text) => {
              const nowTime = new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
              });
              setSmsThreads((prev) =>
                prev.map((t) =>
                  t.id === threadId
                    ? {
                        ...t,
                        messages: [
                          ...t.messages,
                          { id: `m-${Date.now()}`, sender: 'me', text, time: nowTime },
                        ],
                      }
                    : t
                )
              );
              window.setTimeout(() => {
                setSmsThreads((prev) =>
                  prev.map((t) =>
                    t.id === threadId
                      ? {
                          ...t,
                          messages: [
                            ...t.messages,
                            {
                              id: `r-${Date.now()}`,
                              sender: 'them',
                              text: 'Got it, looks good on Android.',
                              time: nowTime,
                            },
                          ],
                        }
                      : t
                  )
                );
              }, 800);
            }}
            darkTheme={system.darkTheme}
          />
        );
      case 'clock':
        return <ClockApp darkTheme={system.darkTheme} gpsLabel={system.sensors.gpsLabel} />;
      case 'settings':
        return (
          <SettingsApp
            instanceId={activeInstance.id}
            system={system}
            androidVersion={activeInstance.androidVersion}
            deviceName={activeInstance.name}
            account={activeInstance.account}
            onUpdateSystem={updateSystem}
            apps={APPS_CATALOG}
            installedIds={installedIds}
            customApks={customApks}
            downloadedApks={downloadedApks}
            liveIconsMap={liveIconsMap}
            onUninstallApp={handleUninstallApp}
            onUninstallCustomApk={handleUninstallCustomApk}
            onLog={appendLog}
          />
        );
      case 'keep':
        return (
          <KeepApp
            notes={keepNotes}
            onAddNote={(title, content, color) =>
              setKeepNotes((prev) => [
                {
                  id: `k-${Date.now()}`,
                  title,
                  content,
                  color,
                  pinned: false,
                  updatedAt: 'Just now',
                },
                ...prev,
              ])
            }
            onDeleteNote={(id) =>
              setKeepNotes((prev) => prev.filter((n) => n.id !== id))
            }
            darkTheme={system.darkTheme}
          />
        );
      case 'translate':
        return <TranslateApp darkTheme={system.darkTheme} />;
      case 'docs':
        return <DocsApp darkTheme={system.darkTheme} />;
      case 'ytmusic':
        return <YouTubeMusicApp />;
      case 'earth':
        return <EarthApp />;
      case 'blockdash':
        return <BlockDashApp />;
      default:
        return null;
    }
  };

  const recentApps = recentIds
    .filter((id) => installedIds.includes(id))
    .map((id) => APPS_CATALOG.find((a) => a.id === id)!)
    .filter(Boolean);

  const [inspectorOpen, setInspectorOpen] = useState(true);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 transition-colors">
      {/* 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <a
          href="/"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 font-display"
        >
          Pixel AVD Studio
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={handleNavHome}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Home Screen
          </button>
          <button
            onClick={() => openApp('apkpure')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            APKPure
          </button>
          <button
            onClick={() => openApp('playstore')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Play Store
          </button>
          <button
            onClick={() => openApp('settings')}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Settings
          </button>
          <button
            onClick={() => setInspectorOpen((o) => !o)}
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {inspectorOpen ? 'Hide Inspector' : 'Show Inspector'}
          </button>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleReboot}
            className="px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            Cold Boot
          </button>
          <button
            onClick={handleTakeScreenshot}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-blue-600 rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
          >
            Take Screenshot
          </button>
        </div>
      </header>

      {/* Main Studio Stage */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
        {/* Centered Android Preview Stage */}
        <div className="flex-1 flex flex-col items-center justify-start min-w-0 w-full space-y-4">
          {/* Compact AI Studio-Style Preview Bar */}
          <div className="w-full max-w-[780px] flex flex-wrap items-center justify-between gap-2">
            <InstanceManager
              instances={instances}
              activeInstanceId={activeInstance.id}
              onSelectInstance={(id) => {
                setActiveInstanceId(id);
                setDrawerOpen(false);
                setShadeOpen(false);
                setRecentsOpen(false);
                const target = instances.find((i) => i.id === id);
                if (target) {
                  appendLog(
                    'INFO',
                    'AVDManager',
                    `Switched focus to ${target.name} (Android ${target.androidVersion})`
                  );
                }
              }}
              onTogglePauseInstance={(id) => {
                setInstances((prev) =>
                  prev.map((i) =>
                    i.id === id
                      ? { ...i, status: i.status === 'running' ? 'paused' : 'running' }
                      : i
                  )
                );
              }}
              onDeleteInstance={(id) => {
                if (instances.length <= 1) return;
                const remaining = instances.filter((i) => i.id !== id);
                setInstances(remaining);
                if (activeInstanceId === id) {
                  setActiveInstanceId(remaining[0].id);
                }
              }}
              onCreateInstance={({
                name,
                androidVersion,
                accountName,
                accountEmail,
                resolution,
              }) => {
                const newId = `avd-${Date.now()}`;
                const newInst: EmulatorInstance = {
                  id: newId,
                  name,
                  androidVersion,
                  account: {
                    name: accountName,
                    email: accountEmail,
                    avatarColor: '#7c3aed',
                  },
                  system: createSystemState({
                    resolution,
                    hotspotSsid: `${name.replace(/\s+/g, '_')}_Hotspot`,
                  }),
                  installedIds: [...PREINSTALLED_IDS],
                  activeAppId: null,
                  activeCustomPkg: null,
                  recentIds: [],
                  notifications: [...INITIAL_NOTIFICATIONS],
                  downloadedApks: [],
                  customApks: [],
                  status: 'running',
                };
                setInstances((prev) => [...prev, newInst]);
                setActiveInstanceId(newId);
                appendLog(
                  'INFO',
                  'AVDManager',
                  `Created instance "${name}" (Android ${androidVersion})`
                );
              }}
            />

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateSystem({
                    hotspot: !system.hotspot,
                    airplaneMode: false,
                    cellular: true,
                  })
                }
                className={`h-9 px-3 rounded-xl border text-xs font-medium transition-colors ${
                  system.hotspot && !system.airplaneMode
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {system.hotspot && !system.airplaneMode ? 'Hotspot On' : 'Hotspot Off'}
              </button>

              <select
                value={system.resolution}
                onChange={(e) =>
                  updateSystem({ resolution: e.target.value as ResolutionPreset })
                }
                aria-label="Screen resolution"
                className="h-9 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="compact">720 x 1560</option>
                <option value="standard">1080 x 2400</option>
                <option value="qhd">1440 x 3120</option>
                <option value="tablet">1600 x 2560</option>
              </select>

              <select
                value={system.networkProfile}
                onChange={(e) => {
                  const net = e.target.value as EmulatorSystemState['networkProfile'];
                  updateSystem({
                    networkProfile: net,
                    airplaneMode: net === 'offline',
                    wifi: net === 'wifi',
                    cellular: net !== 'offline',
                    hotspot: net === 'offline' ? false : system.hotspot,
                  });
                }}
                aria-label="Network speed"
                className="h-9 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="wifi">Wi-Fi (Free)</option>
                <option value="5g">5G</option>
                <option value="4g">4G LTE</option>
                <option value="3g">3G Slow</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <PhoneChassis
            landscape={system.landscape}
            locked={system.locked}
            booting={booting}
            hotspotActive={system.hotspot && !system.airplaneMode}
            resolution={system.resolution}
            brightness={system.brightness}
            flashlight={system.flashlight}
            volumeHudVisible={volumeHudVisible}
            volume={system.volume}
            darkNavBar={
              system.darkTheme ||
              isHomeVisible ||
              activeAppId === 'camera' ||
              activeAppId === 'meet' ||
              activeAppId === 'ytmusic' ||
              activeAppId === 'earth' ||
              activeAppId === 'blockdash'
            }
            screenRecording={system.screenRecording}
            onPressPower={() => updateSystem({ locked: !system.locked })}
            onVolumeUp={() => handleVolumeStep(10)}
            onVolumeDown={() => handleVolumeStep(-10)}
            onRotate={() => updateSystem({ landscape: !system.landscape })}
            onScreenshot={handleTakeScreenshot}
            onToggleRecord={handleToggleScreenRecord}
            onToggleHotspot={() =>
              updateSystem({
                hotspot: !system.hotspot,
                airplaneMode: false,
                cellular: true,
              })
            }
            onReboot={handleReboot}
            onNavBack={handleNavBack}
            onNavHome={handleNavHome}
            onNavRecents={handleNavRecents}
          >
            {/* Wallpaper Backdrop */}
            <div className="absolute inset-0 z-0">
              {currentWallpaper.src ? (
                <img
                  src={currentWallpaper.src}
                  alt={currentWallpaper.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div style={{ background: currentWallpaper.gradient }} className="w-full h-full" />
              )}
            </div>

            {/* Active App or Home Screen Surface */}
            <div className="relative z-10 flex-1 min-h-0 flex flex-col">
              <div
                className={
                  (activeAppId || activeCustomPkg) && !system.locked
                    ? system.darkTheme ||
                      activeAppId === 'camera' ||
                      activeAppId === 'meet' ||
                      activeAppId === 'ytmusic' ||
                      activeAppId === 'earth' ||
                      activeAppId === 'blockdash'
                      ? 'bg-slate-950'
                      : 'bg-white'
                    : 'bg-transparent'
                }
              >
                <StatusBar
                  timeText={timeText}
                  system={system}
                  lightText={statusBarLightText}
                  onOpenShade={() => setShadeOpen(true)}
                />
              </div>

              <div className="flex-1 min-h-0 relative">
                {activeAppId || activeCustomPkg ? (
                  renderActiveApp()
                ) : (
                  <HomeScreen
                    apps={APPS_CATALOG}
                    installedIds={installedIds}
                    customApks={customApks}
                    liveIconsMap={liveIconsMap}
                    nextEvent={events.find((e) => e.day === 18)}
                    liveTempF={liveTempF}
                    gpsLabel={system.sensors.gpsLabel}
                    drawerOpen={drawerOpen}
                    onSetDrawerOpen={setDrawerOpen}
                    onOpenApp={(id) => openApp(id)}
                    onOpenCustomApk={openCustomApk}
                    onSearchGoogle={(q) => openApp('chrome', q)}
                    darkTheme={system.darkTheme}
                  />
                )}
              </div>
            </div>

            {/* System Overlays */}
            {shadeOpen && (
              <QuickSettingsShade
                system={system}
                notifications={notifications}
                onUpdateSystem={updateSystem}
                onDismissNotification={(id) =>
                  updateActiveInstance((inst) => ({
                    ...inst,
                    notifications: inst.notifications.filter((n) => n.id !== id),
                  }))
                }
                onOpenApp={(id) => openApp(id)}
                onToggleScreenRecord={handleToggleScreenRecord}
                onClose={() => setShadeOpen(false)}
              />
            )}

            {recentsOpen && (
              <RecentsView
                recentApps={recentApps}
                liveIconsMap={liveIconsMap}
                onOpenApp={(id) => openApp(id)}
                onCloseRecent={(id) =>
                  updateActiveInstance((inst) => ({
                    ...inst,
                    recentIds: inst.recentIds.filter((x) => x !== id),
                    activeAppId: inst.activeAppId === id ? null : inst.activeAppId,
                  }))
                }
                onClearAll={() => {
                  updateActiveInstance((inst) => ({
                    ...inst,
                    recentIds: [],
                    activeAppId: null,
                    activeCustomPkg: null,
                  }));
                  setRecentsOpen(false);
                }}
                onDismiss={() => setRecentsOpen(false)}
              />
            )}

            {system.locked && (
              <LockScreen
                timeText={timeText}
                dateText={dateText}
                notifications={notifications}
                onUnlock={() => updateSystem({ locked: false })}
              />
            )}

            {activeInstance.status === 'paused' && (
              <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <div className="text-sm font-semibold">{activeInstance.name} is Paused</div>
                <p className="text-xs text-slate-300">
                  Instance state is preserved in memory. Resume to interact.
                </p>
                <button
                  onClick={() =>
                    updateActiveInstance((inst) => ({ ...inst, status: 'running' }))
                  }
                  className="px-4 py-2 rounded-full bg-blue-600 text-xs font-semibold"
                >
                  Resume Instance
                </button>
              </div>
            )}

            {/* System Toast inside screen */}
            {toastMsg && (
              <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-50 px-3.5 py-2 rounded-full bg-slate-900/90 text-white text-[11px] font-medium whitespace-nowrap shadow-lg border border-white/10">
                {toastMsg}
              </div>
            )}
          </PhoneChassis>
        </div>

        {/* Collapsible Device, Sensor & Testing Inspector */}
        {inspectorOpen && (
          <WorkbenchSidebar
            instance={activeInstance}
            apps={APPS_CATALOG}
            liveIconsMap={liveIconsMap}
            cpuHistory={cpuHistory}
            memHistory={memHistory}
            logs={logs}
            media={media}
            onUpdateSystem={updateSystem}
            onUpdateSensors={updateSensors}
            onUpdateInstanceMeta={(patch) => {
              updateActiveInstance((inst) => ({
                ...inst,
                name: patch.name ?? inst.name,
                androidVersion: patch.androidVersion ?? inst.androidVersion,
                account: {
                  ...inst.account,
                  name: patch.accountName ?? inst.account.name,
                  email: patch.accountEmail ?? inst.account.email,
                },
              }));
            }}
            onVolumeStep={handleVolumeStep}
            onOpenApp={(id) => openApp(id)}
            onOpenCustomApk={openCustomApk}
            onTakeScreenshot={handleTakeScreenshot}
            onToggleScreenRecord={handleToggleScreenRecord}
            onClearLogs={() => setLogs([])}
            onTriggerGc={() => {
              setMemHistory((prev) => [...prev.slice(-15), 512]);
              appendLog('DEBUG', 'dalvikvm', 'Explicit GC freed 148 MB heap memory');
              showToast('Garbage collection completed');
            }}
            onTriggerStress={() => {
              setStressUntil(Date.now() + 6000);
              appendLog('WARN', 'Profiler', 'Triggered 6s synthetic CPU/RAM load spike');
            }}
            onShakeDevice={() => {
              updateSensors({
                accelX: 11.4,
                accelY: -8.2,
                accelZ: 9.1,
                gyroRoll: 18,
              });
              appendLog('DEBUG', 'SensorService', 'Injected accelerometer shake impulse');
              window.setTimeout(() => {
                updateSensors({ accelX: 0, accelY: 9.8, accelZ: 0, gyroRoll: 0 });
              }, 600);
            }}
          />
        )}
      </main>
    </div>
  );
}
