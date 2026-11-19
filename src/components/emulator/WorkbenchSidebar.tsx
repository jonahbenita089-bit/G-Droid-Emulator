import React, { useState } from 'react';
import {
  BatteryCharging,
  Camera,
  Compass,
  Lock,
  Monitor,
  Moon,
  Power,
  Radio,
  RotateCw,
  Sun,
  Unlock,
  Video,
  Volume2,
  VolumeX,
  Wifi,
} from 'lucide-react';
import {
  AndroidVersion,
  AppDefinition,
  AppId,
  EmulatorInstance,
  EmulatorSystemState,
  LogEntry,
  MediaItem,
  NetworkProfile,
  ResolutionPreset,
  SensorData,
} from '../../types/emulator';
import { AppIcon, CustomApkIcon } from '../icons/AppIcons';
import { TestingToolsPanel } from './TestingToolsPanel';

interface WorkbenchSidebarProps {
  instance: EmulatorInstance;
  apps: AppDefinition[];
  liveIconsMap?: Record<string, string>;
  cpuHistory: number[];
  memHistory: number[];
  logs: LogEntry[];
  media: MediaItem[];
  onUpdateSystem: (patch: Partial<EmulatorSystemState>) => void;
  onUpdateSensors: (patch: Partial<SensorData>) => void;
  onUpdateInstanceMeta: (patch: {
    name?: string;
    androidVersion?: AndroidVersion;
    accountName?: string;
    accountEmail?: string;
  }) => void;
  onVolumeStep: (delta: number) => void;
  onOpenApp: (id: AppId) => void;
  onOpenCustomApk?: (pkg: string) => void;
  onTakeScreenshot: () => void;
  onToggleScreenRecord: () => void;
  onClearLogs: () => void;
  onTriggerGc: () => void;
  onTriggerStress: () => void;
  onShakeDevice: () => void;
}

const GPS_PRESETS = [
  { label: 'Orhuworun, Delta State', lat: 5.5126, lon: 5.8394 },
  { label: 'Lagos, Nigeria', lat: 6.5244, lon: 3.3792 },
  { label: 'London', lat: 51.5074, lon: -0.1278 },
  { label: 'New York', lat: 40.7128, lon: -74.006 },
];

export const WorkbenchSidebar: React.FC<WorkbenchSidebarProps> = ({
  instance,
  apps,
  liveIconsMap = {},
  cpuHistory,
  memHistory,
  logs,
  media,
  onUpdateSystem,
  onUpdateSensors,
  onUpdateInstanceMeta,
  onVolumeStep,
  onOpenApp,
  onOpenCustomApk,
  onTakeScreenshot,
  onToggleScreenRecord,
  onClearLogs,
  onTriggerGc,
  onTriggerStress,
  onShakeDevice,
}) => {
  const [tab, setTab] = useState<'controls' | 'display' | 'sensors' | 'device' | 'testing'>(
    'controls'
  );
  const { system, installedIds, activeAppId, activeCustomPkg, customApks } = instance;
  const installedApps = apps.filter((a) => installedIds.includes(a.id));

  return (
    <aside className="w-full lg:w-[368px] shrink-0 space-y-4">
      {/* Segmented Workbench Tabs */}
      <div className="grid grid-cols-5 gap-1 p-1 bg-slate-200/70 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        {[
          { id: 'controls' as const, label: 'Controls' },
          { id: 'display' as const, label: 'Display' },
          { id: 'sensors' as const, label: 'Sensors' },
          { id: 'device' as const, label: 'Device' },
          { id: 'testing' as const, label: 'Testing' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
              tab === item.id
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'controls' && (
        <div className="space-y-4">
          {/* Device Hardware Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Hardware Controls
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {instance.name} · Android {instance.androidVersion}
                </p>
              </div>
              <span className="text-xs font-mono-tabular font-medium text-slate-600 dark:text-slate-300">
                {system.landscape ? 'Landscape' : 'Portrait'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onUpdateSystem({ locked: !system.locked })}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200 transition-colors"
              >
                {system.locked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{system.locked ? 'Unlock' : 'Lock'}</span>
              </button>

              <button
                onClick={() => onUpdateSystem({ landscape: !system.landscape })}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>

              <button
                onClick={() => onUpdateSystem({ darkTheme: !system.darkTheme })}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200 transition-colors"
              >
                {system.darkTheme ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{system.darkTheme ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onTakeScreenshot}
                className="h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium flex items-center justify-center gap-1.5 text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Screenshot</span>
              </button>

              <button
                onClick={onToggleScreenRecord}
                className={`h-10 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  system.screenRecording
                    ? 'bg-red-600 border-red-600 text-white'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>{system.screenRecording ? 'Stop Video' : 'Record Video'}</span>
              </button>
            </div>

            {/* Volume & Battery */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {system.volume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>Media Volume</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onVolumeStep(-10)}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    -
                  </button>
                  <span className="w-9 text-center text-xs font-mono-tabular">{system.volume}%</span>
                  <button
                    onClick={() => onVolumeStep(10)}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono-tabular">Battery ({system.battery}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={system.battery}
                    onChange={(e) => onUpdateSystem({ battery: Number(e.target.value) })}
                    className="w-24 accent-blue-600"
                    aria-label="Simulated battery level"
                  />
                  <button
                    onClick={() => onUpdateSystem({ charging: !system.charging })}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium border ${
                      system.charging
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    AC
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Installed Apps Quick Launcher */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Installed Apps & APKs
              </h2>
              <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                {installedApps.length + customApks.length} ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-0.5">
              {installedApps.map((app) => {
                const active = activeAppId === app.id && !activeCustomPkg;
                return (
                  <button
                    key={app.id}
                    onClick={() => onOpenApp(app.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                        : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <AppIcon
                      id={app.id}
                      iconUrl={liveIconsMap[app.packageName]}
                      size={30}
                    />
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate w-full">
                      {app.name}
                    </span>
                  </button>
                );
              })}

              {customApks.map((apk) => {
                const active = activeCustomPkg === apk.packageName;
                return (
                  <button
                    key={apk.packageName}
                    onClick={() => onOpenCustomApk?.(apk.packageName)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-colors ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40'
                        : 'border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <CustomApkIcon name={apk.name} iconUrl={apk.iconUrl} size={30} />
                    <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate w-full">
                      {apk.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <button
                onClick={() => onOpenApp('apkpure')}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Open APKPure
              </button>
              <button
                onClick={() => onOpenApp('playstore')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
              >
                <Power className="w-3 h-3" />
                <span>Play Store</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'display' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Screen Resolution
              </h3>
            </div>
            <div className="space-y-2">
              {(
                [
                  { id: 'compact', label: 'Compact Phone', spec: '720 x 1560 · 320 dpi' },
                  { id: 'standard', label: 'Standard Pixel', spec: '1080 x 2400 · 420 dpi' },
                  { id: 'qhd', label: 'Flagship QHD+', spec: '1440 x 3120 · 560 dpi' },
                  { id: 'tablet', label: 'Pixel Tablet', spec: '1600 x 2560 · 320 dpi' },
                ] as Array<{ id: ResolutionPreset; label: string; spec: string }>
              ).map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onUpdateSystem({ resolution: preset.id })}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    system.resolution === preset.id
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {preset.label}
                  </span>
                  <span className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400">
                    {preset.spec}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Network Speed Simulation
              </h3>
            </div>
            <div className="space-y-2">
              {(
                [
                  { id: 'wifi', label: 'Wi-Fi Fiber (Free)', spec: '100+ Mbps · 0ms' },
                  { id: '5g', label: '5G Ultra Wideband', spec: '80 Mbps · 70ms' },
                  { id: '4g', label: '4G LTE', spec: '18 Mbps · 350ms' },
                  { id: '3g', label: '3G Slow Cellular', spec: '1.5 Mbps · 1400ms' },
                  { id: 'offline', label: 'Offline (No Signal)', spec: '0 Mbps · Disconnected' },
                ] as Array<{ id: NetworkProfile; label: string; spec: string }>
              ).map((net) => (
                <button
                  key={net.id}
                  onClick={() =>
                    onUpdateSystem({
                      networkProfile: net.id,
                      airplaneMode: net.id === 'offline',
                      wifi: net.id === 'wifi',
                      cellular: net.id !== 'offline',
                      hotspot: net.id === 'offline' ? false : system.hotspot,
                    })
                  }
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-colors ${
                    system.networkProfile === net.id
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {net.label}
                  </span>
                  <span className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400">
                    {net.spec}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Wi-Fi Hotspot
                </h3>
              </div>
              <button
                onClick={() =>
                  onUpdateSystem({
                    hotspot: !system.hotspot,
                    airplaneMode: false,
                    cellular: true,
                  })
                }
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  system.hotspot && !system.airplaneMode
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {system.hotspot && !system.airplaneMode ? 'Active' : 'Off'}
              </button>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
              SSID: {system.hotspotSsid} · {system.hotspotBand}
            </div>
            <button
              onClick={() => onOpenApp('settings')}
              className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Configure in Android Settings
            </button>
          </div>
        </div>
      )}

      {tab === 'sensors' && (
        <div className="space-y-4">
          {/* Mock GPS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Mock GPS Location
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {GPS_PRESETS.map((loc) => (
                <button
                  key={loc.label}
                  onClick={() =>
                    onUpdateSensors({
                      gpsLat: loc.lat,
                      gpsLon: loc.lon,
                      gpsLabel: loc.label,
                    })
                  }
                  className={`py-2 px-2.5 rounded-xl border text-xs font-medium text-left ${
                    system.sensors.gpsLabel === loc.label
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {loc.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={system.sensors.gpsLat}
                  onChange={(e) =>
                    onUpdateSensors({
                      gpsLat: Number(e.target.value),
                      gpsLabel: 'Custom Pin',
                    })
                  }
                  className="w-full px-2.5 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={system.sensors.gpsLon}
                  onChange={(e) =>
                    onUpdateSensors({
                      gpsLon: Number(e.target.value),
                      gpsLabel: 'Custom Pin',
                    })
                  }
                  className="w-full px-2.5 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono-tabular"
                />
              </div>
            </div>
          </div>

          {/* Accelerometer & Gyroscope */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Accelerometer & Gyroscope
              </h3>
              <button
                onClick={onShakeDevice}
                className="px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-blue-600 text-white text-[11px] font-medium"
              >
                Shake Pulse
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'accelX' as const, label: 'Accel X (m/s2)', min: -15, max: 15, step: 0.2 },
                { key: 'accelY' as const, label: 'Accel Y (m/s2)', min: -15, max: 15, step: 0.2 },
                { key: 'accelZ' as const, label: 'Accel Z (m/s2)', min: -15, max: 15, step: 0.2 },
                { key: 'gyroRoll' as const, label: 'Gyro Roll (deg)', min: -45, max: 45, step: 1 },
                { key: 'gyroPitch' as const, label: 'Gyro Pitch (deg)', min: -45, max: 45, step: 1 },
              ].map((s) => (
                <div key={s.key} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 dark:text-slate-300">{s.label}</span>
                    <span className="font-mono-tabular font-semibold">
                      {system.sensors[s.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={system.sensors[s.key]}
                    onChange={(e) => onUpdateSensors({ [s.key]: Number(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                onUpdateSensors({
                  accelX: 0,
                  accelY: 9.8,
                  accelZ: 0,
                  gyroPitch: 0,
                  gyroRoll: 0,
                  gyroYaw: 0,
                })
              }
              className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Reset Sensors Upright
            </button>
          </div>
        </div>
      )}

      {tab === 'device' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Instance Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Changes apply exclusively to {instance.name}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Instance Name
              </label>
              <input
                type="text"
                value={instance.name}
                onChange={(e) => onUpdateInstanceMeta({ name: e.target.value })}
                className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Android OS Version
              </label>
              <select
                value={instance.androidVersion}
                onChange={(e) =>
                  onUpdateInstanceMeta({ androidVersion: e.target.value as AndroidVersion })
                }
                className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
              >
                <option value="15">Android 15 (API 35)</option>
                <option value="14">Android 14 (API 34)</option>
                <option value="13">Android 13 (API 33)</option>
                <option value="12">Android 12 (API 31)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Logged-in Google Account Name
              </label>
              <input
                type="text"
                value={instance.account.name}
                onChange={(e) => onUpdateInstanceMeta({ accountName: e.target.value })}
                className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Logged-in Google Email
              </label>
              <input
                type="email"
                value={instance.account.email}
                onChange={(e) => onUpdateInstanceMeta({ accountEmail: e.target.value })}
                className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {tab === 'testing' && (
        <TestingToolsPanel
          activeAppId={activeAppId}
          activeCustomPkg={activeCustomPkg}
          androidVersion={instance.androidVersion}
          cpuHistory={cpuHistory}
          memHistory={memHistory}
          logs={logs}
          media={media}
          screenRecording={system.screenRecording}
          onClearLogs={onClearLogs}
          onTriggerGc={onTriggerGc}
          onTriggerStress={onTriggerStress}
          onTakeScreenshot={onTakeScreenshot}
          onToggleScreenRecord={onToggleScreenRecord}
          onOpenPhotos={() => onOpenApp('photos')}
        />
      )}
    </aside>
  );
};
