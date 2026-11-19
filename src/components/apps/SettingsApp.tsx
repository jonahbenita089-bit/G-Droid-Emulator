import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  BatteryCharging,
  Bluetooth,
  Check,
  ChevronRight,
  Copy,
  Cpu,
  ExternalLink,
  Eye,
  EyeOff,
  HardDrive,
  Info,
  Lock,
  MapPin,
  Moon,
  Palette,
  Plane,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Usb,
  Volume2,
  Wifi,
} from 'lucide-react';
import {
  AndroidVersion,
  AppDefinition,
  AppId,
  CustomApkApp,
  DownloadedApk,
  EmulatorSystemState,
  GoogleAccount,
  NetworkProfile,
  ResolutionPreset,
} from '../../types/emulator';
import { WALLPAPERS } from '../../data/appsCatalog';
import { AppIcon, CustomApkIcon } from '../icons/AppIcons';

type SettingsSection =
  | 'main'
  | 'network'
  | 'wifi'
  | 'hotspot'
  | 'connected'
  | 'apps'
  | 'battery'
  | 'storage'
  | 'sound'
  | 'display'
  | 'wallpaper'
  | 'security'
  | 'system'
  | 'developer'
  | 'about';

interface HotspotClientItem {
  clientId: string;
  clientName: string;
  ip: string;
  connectedAt: string;
}

interface HotspotListEntry {
  id: string;
  instanceId: string;
  deviceName: string;
  ssid: string;
  band: string;
  locationLabel: string;
  clientCount: number;
}

interface SettingsAppProps {
  instanceId?: string;
  system: EmulatorSystemState;
  androidVersion?: AndroidVersion;
  deviceName?: string;
  account?: GoogleAccount;
  onUpdateSystem: (patch: Partial<EmulatorSystemState>) => void;
  apps: AppDefinition[];
  installedIds: AppId[];
  customApks?: CustomApkApp[];
  downloadedApks?: DownloadedApk[];
  liveIconsMap?: Record<string, string>;
  onUninstallApp: (id: AppId) => void;
  onUninstallCustomApk?: (packageName: string) => void;
  onLog?: (level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', tag: string, msg: string) => void;
}

const SwitchToggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
}> = ({ checked, onChange, label }) => (
  <button
    onClick={onChange}
    className={`w-11 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
      checked ? 'bg-[#1A73E8]' : 'bg-slate-300 dark:bg-slate-700'
    }`}
    aria-label={label}
  >
    <div
      className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

export const SettingsApp: React.FC<SettingsAppProps> = ({
  instanceId = 'avd-1',
  system,
  androidVersion = '15',
  deviceName = 'Pixel 9 Pro',
  account = { name: 'Jonah Benita', email: 'jonahbenita089@gmail.com', avatarColor: '#047857' },
  onUpdateSystem,
  apps,
  installedIds,
  customApks = [],
  downloadedApks = [],
  liveIconsMap = {},
  onUninstallApp,
  onUninstallCustomApk,
  onLog,
}) => {
  const [section, setSection] = useState<SettingsSection>('main');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHotspotPw, setShowHotspotPw] = useState(false);
  const [buildTaps, setBuildTaps] = useState(0);
  const [localToast, setLocalToast] = useState<string | null>(null);

  // Hotspot live QR, connected clients & Wi-Fi scanner state
  const [qrMode, setQrMode] = useState<'gateway' | 'wifi'>('gateway');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [hotspotClients, setHotspotClients] = useState<HotspotClientItem[]>([]);
  const [availableHotspots, setAvailableHotspots] = useState<HotspotListEntry[]>([]);
  const [joiningHotspot, setJoiningHotspot] = useState<HotspotListEntry | null>(null);
  const [joinPassword, setJoinPassword] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const ownHotspotId = `hs-${instanceId}`;
  const gatewayShareUrl = `${window.location.origin}/?hotspot=${encodeURIComponent(ownHotspotId)}`;

  const surface = system.darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-[#F8F9FA] text-slate-900';
  const cardBg = system.darkTheme
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-slate-200/80';
  const muted = system.darkTheme ? 'text-slate-400' : 'text-slate-500';

  const notifyLocal = (msg: string) => {
    setLocalToast(msg);
    window.setTimeout(() => setLocalToast(null), 2200);
  };

  useEffect(() => {
    if (section !== 'hotspot') return;
    const payload =
      qrMode === 'gateway'
        ? gatewayShareUrl
        : `WIFI:T:WPA;S:${system.hotspotSsid};P:${system.hotspotPassword};;`;
    QRCode.toDataURL(payload, { width: 180, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [section, qrMode, gatewayShareUrl, system.hotspotSsid, system.hotspotPassword]);

  const fetchOwnHotspotClients = async () => {
    try {
      const r = await fetch(`/api/hotspot/${encodeURIComponent(ownHotspotId)}`);
      if (r.ok) {
        const d = await r.json();
        setHotspotClients(d.session?.clients || []);
      }
    } catch {
      // ignore transient error
    }
  };

  const fetchAvailableHotspots = async () => {
    try {
      const r = await fetch('/api/hotspot/list');
      if (r.ok) {
        const d = await r.json();
        setAvailableHotspots(d.hotspots || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (section === 'hotspot' && system.hotspot && !system.airplaneMode) {
      fetchOwnHotspotClients();
      const t = window.setInterval(fetchOwnHotspotClients, 3000);
      return () => clearInterval(t);
    }
    if (section === 'wifi') {
      fetchAvailableHotspots();
      const t = window.setInterval(fetchAvailableHotspots, 3000);
      return () => clearInterval(t);
    }
  }, [section, system.hotspot, system.airplaneMode, ownHotspotId]);

  const renderHeader = (title: string, backTo: SettingsSection = 'main') => (
    <div className="px-3 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-2 shrink-0 bg-white/80 dark:bg-slate-950/90 backdrop-blur-sm">
      <button
        onClick={() => setSection(backTo)}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
        aria-label="Back"
      >
        <ArrowLeft className="w-4 h-4" />
      </button>
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );

  /* ---------------- WI-FI SCANNER & HOTSPOT CONNECT ---------------- */
  if (section === 'wifi') {
    const wifiOn = system.wifi && !system.airplaneMode;
    return (
      <div className={`h-full flex flex-col ${surface} relative`}>
        {renderHeader('Internet (Wi-Fi)', 'network')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div className="flex items-center gap-3">
              <Wifi className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs font-semibold">Use Wi-Fi</div>
                <div className={`text-[11px] ${muted}`}>
                  {wifiOn ? 'Scanning Orhuworun & AVD networks' : 'Wi-Fi is off'}
                </div>
              </div>
            </div>
            <SwitchToggle
              checked={wifiOn}
              onChange={() =>
                onUpdateSystem({
                  wifi: !system.wifi,
                  airplaneMode: false,
                  networkProfile: !system.wifi ? 'wifi' : '4g',
                })
              }
              label="Toggle Wi-Fi"
            />
          </div>

          {wifiOn && (
            <>
              <div className="flex items-center justify-between px-1">
                <span className={`text-[11px] font-medium ${muted}`}>Available networks</span>
                <button
                  onClick={fetchAvailableHotspots}
                  className="text-[11px] font-semibold text-blue-600 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Scan</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onUpdateSystem({
                    connectedHotspotId: undefined,
                    connectedHotspotSsid: undefined,
                    connectedHotspotIp: undefined,
                    wifi: true,
                    networkProfile: 'wifi',
                  });
                }}
                className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left ${cardBg}`}
              >
                <div className="flex items-center gap-3">
                  <Wifi className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="text-xs font-semibold">PixelStudio-5G (Free Gateway)</div>
                    <div className={`text-[11px] ${muted}`}>
                      {!system.connectedHotspotSsid ? 'Connected · Orhuworun Fiber' : 'Saved'}
                    </div>
                  </div>
                </div>
                {!system.connectedHotspotSsid && (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
              </button>

              {availableHotspots
                .filter((hs) => hs.id !== ownHotspotId)
                .map((hs) => {
                  const isConnected = system.connectedHotspotId === hs.id;
                  return (
                    <button
                      key={hs.id}
                      onClick={() => {
                        if (isConnected) {
                          fetch('/api/hotspot/disconnect', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: hs.id, clientId: instanceId }),
                          }).catch(() => {});
                          onUpdateSystem({
                            connectedHotspotId: undefined,
                            connectedHotspotSsid: undefined,
                            connectedHotspotIp: undefined,
                          });
                        } else {
                          setJoinError(null);
                          setJoinPassword('');
                          setJoiningHotspot(hs);
                        }
                      }}
                      className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left ${cardBg}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Radio className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{hs.ssid}</div>
                          <div className={`text-[10px] truncate ${muted}`}>
                            {isConnected
                              ? `Connected · ${system.connectedHotspotIp}`
                              : `${hs.deviceName} · ${hs.locationLabel} · ${hs.band}`}
                          </div>
                        </div>
                      </div>
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
            </>
          )}
        </div>

        {joiningHotspot && (
          <div className="absolute inset-0 z-30 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className={`w-full rounded-2xl p-4 border space-y-3 shadow-2xl ${cardBg}`}
            >
              <div>
                <div className="text-sm font-bold">{joiningHotspot.ssid}</div>
                <div className={`text-[11px] ${muted}`}>
                  Hosted by {joiningHotspot.deviceName} · {joiningHotspot.locationLabel}
                </div>
              </div>
              <input
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                placeholder="Enter hotspot password"
                className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
              />
              {joinError && (
                <div className="text-[11px] text-red-600 dark:text-red-400">{joinError}</div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => setJoiningHotspot(null)}
                  className="flex-1 h-9 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setJoinError(null);
                    const resp = await fetch('/api/hotspot/connect', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: joiningHotspot.id,
                        password: joinPassword,
                        clientId: instanceId,
                        clientName: deviceName,
                      }),
                    });
                    const data = await resp.json();
                    if (!resp.ok) {
                      setJoinError(data.error || 'Authentication failed');
                      return;
                    }
                    onUpdateSystem({
                      wifi: true,
                      airplaneMode: false,
                      networkProfile: 'wifi',
                      connectedHotspotId: joiningHotspot.id,
                      connectedHotspotSsid: joiningHotspot.ssid,
                      connectedHotspotIp: data.assignedIp,
                    });
                    onLog?.(
                      'INFO',
                      'WifiStateMachine',
                      `Connected to hotspot "${joiningHotspot.ssid}" (${data.assignedIp})`
                    );
                    setJoiningHotspot(null);
                  }}
                  className="flex-1 h-9 rounded-full bg-blue-600 text-white text-xs font-semibold"
                >
                  Connect
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ---------------- NETWORK & INTERNET ---------------- */
  if (section === 'network') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Network & internet')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 ${cardBg}`}>
            <button
              onClick={() => setSection('wifi')}
              className="flex items-center gap-3 min-w-0 flex-1 text-left"
            >
              <Wifi className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold">Internet (Wi-Fi)</div>
                <div className={`text-[11px] truncate ${muted}`}>
                  {system.airplaneMode
                    ? 'Airplane mode is on'
                    : system.wifi
                    ? system.connectedHotspotSsid
                      ? `Connected · ${system.connectedHotspotSsid}`
                      : `Connected · PixelStudio-5G (${system.networkProfile.toUpperCase()})`
                    : 'Wi-Fi disabled'}
                </div>
              </div>
            </button>
            <SwitchToggle
              checked={system.wifi && !system.airplaneMode}
              onChange={() =>
                onUpdateSystem({
                  wifi: !system.wifi,
                  airplaneMode: false,
                  networkProfile: !system.wifi ? 'wifi' : '4g',
                })
              }
              label="Toggle Wi-Fi"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-semibold">Mobile SIM · Free Gateway</div>
                <div className={`text-[11px] font-mono-tabular ${muted}`}>
                  {system.cellular && !system.airplaneMode
                    ? `Active · ${system.networkProfile.toUpperCase()} Unlimited`
                    : 'Off'}
                </div>
              </div>
            </div>
            <SwitchToggle
              checked={system.cellular && !system.airplaneMode}
              onChange={() =>
                onUpdateSystem({
                  cellular: !system.cellular,
                  airplaneMode: false,
                })
              }
              label="Toggle Mobile Data"
            />
          </div>

          <button
            onClick={() => setSection('hotspot')}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left ${cardBg}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Radio
                className={`w-4 h-4 shrink-0 ${
                  system.hotspot && !system.airplaneMode ? 'text-emerald-600' : 'text-slate-500'
                }`}
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold">Hotspot & tethering</div>
                <div className={`text-[11px] truncate ${muted}`}>
                  {system.hotspot && !system.airplaneMode
                    ? `Sharing "${system.hotspotSsid}" (${system.hotspotBand})`
                    : 'Off · Tap to configure Wi-Fi hotspot'}
                </div>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 shrink-0 ${muted}`} />
          </button>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div className="flex items-center gap-3">
              <Plane className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <div className="text-xs font-semibold">Airplane mode</div>
                <div className={`text-[11px] ${muted}`}>Disable all wireless radios</div>
              </div>
            </div>
            <SwitchToggle
              checked={system.airplaneMode}
              onChange={() =>
                onUpdateSystem({
                  airplaneMode: !system.airplaneMode,
                  hotspot: !system.airplaneMode ? false : system.hotspot,
                  networkProfile: !system.airplaneMode ? 'offline' : 'wifi',
                })
              }
              label="Toggle Airplane mode"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border space-y-2 ${cardBg}`}>
            <div className="text-xs font-semibold">Simulated Radio Speed</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'wifi', label: 'Wi-Fi Fiber' },
                  { id: '5g', label: '5G Ultra' },
                  { id: '4g', label: '4G LTE' },
                  { id: '3g', label: '3G Slow' },
                ] as Array<{ id: NetworkProfile; label: string }>
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() =>
                    onUpdateSystem({
                      networkProfile: p.id,
                      airplaneMode: false,
                      wifi: p.id === 'wifi',
                      cellular: true,
                    })
                  }
                  className={`py-2 px-2.5 rounded-xl border text-[11px] font-medium ${
                    system.networkProfile === p.id && !system.airplaneMode
                      ? 'border-[#1A73E8] bg-blue-50 dark:bg-blue-950/60 text-[#1A73E8] dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- HOTSPOT & TETHERING ---------------- */
  if (section === 'hotspot') {
    const hotspotActive = system.hotspot && !system.airplaneMode;
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Hotspot & tethering', 'network')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-4 rounded-2xl border space-y-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio
                  className={`w-5 h-5 ${hotspotActive ? 'text-emerald-600' : 'text-slate-400'}`}
                />
                <div>
                  <div className="text-sm font-semibold">Wi-Fi hotspot</div>
                  <div className={`text-[11px] font-mono-tabular ${muted}`}>
                    {hotspotActive
                      ? `Active · ${hotspotClients.length} device${
                          hotspotClients.length === 1 ? '' : 's'
                        } connected`
                      : 'Off · Share internet via Gateway QR or AVD Wi-Fi'}
                  </div>
                </div>
              </div>
              <SwitchToggle
                checked={hotspotActive}
                onChange={() => {
                  const next = !hotspotActive;
                  onUpdateSystem({
                    hotspot: next,
                    airplaneMode: false,
                    cellular: true,
                  });
                  onLog?.(
                    'INFO',
                    'SoftApManager',
                    next
                      ? `Wi-Fi Hotspot "${system.hotspotSsid}" started at ${system.sensors.gpsLabel}`
                      : 'Wi-Fi Hotspot stopped'
                  );
                }}
                label="Toggle Wi-Fi hotspot"
              />
            </div>

            <div className={`flex items-center gap-1.5 text-[11px] ${muted}`}>
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">
                Location: {system.sensors.gpsLabel} ({system.sensors.gpsLat.toFixed(4)},{' '}
                {system.sensors.gpsLon.toFixed(4)})
              </span>
            </div>

            {hotspotActive && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                  <span>Live Hotspot QR & Share Link</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setQrMode('gateway')}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        qrMode === 'gateway'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/60 dark:bg-slate-900'
                      }`}
                    >
                      Gateway URL
                    </button>
                    <button
                      onClick={() => setQrMode('wifi')}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        qrMode === 'wifi'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white/60 dark:bg-slate-900'
                      }`}
                    >
                      Wi-Fi QR
                    </button>
                  </div>
                </div>

                {qrDataUrl && (
                  <div className="flex justify-center py-1">
                    <img
                      src={qrDataUrl}
                      alt="Hotspot QR Code"
                      className="w-36 h-36 rounded-xl bg-white p-1.5 border border-emerald-200"
                    />
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(gatewayShareUrl);
                      setCopiedLink(true);
                      window.setTimeout(() => setCopiedLink(false), 1800);
                    }}
                    className="flex-1 h-8 rounded-lg bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-1"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied Link' : 'Copy Gateway Link'}</span>
                  </button>
                  <a
                    href={gatewayShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1"
                  >
                    <span>Test Connect</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <p className={`text-[10px] leading-snug ${muted}`}>
              Note: Web browsers cannot broadcast physical 802.11 Wi-Fi radio waves to external phone hardware. Use Test Connect / Gateway QR on another phone or browser tab, or connect another emulator instance under Settings &gt; Internet (Wi-Fi).
            </p>
          </div>

          {hotspotActive && (
            <div className={`p-3.5 rounded-2xl border space-y-2 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Connected devices</span>
                <span className={`text-[11px] font-mono-tabular ${muted}`}>
                  {hotspotClients.length} active
                </span>
              </div>
              {hotspotClients.length === 0 ? (
                <div className={`text-[11px] py-2 ${muted}`}>
                  Waiting for devices to authenticate with "{system.hotspotSsid}"...
                </div>
              ) : (
                <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {hotspotClients.map((client) => (
                    <div
                      key={client.clientId}
                      className="py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{client.clientName}</div>
                        <div className={`text-[10px] font-mono-tabular ${muted}`}>
                          {client.ip} · Joined {client.connectedAt}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await fetch('/api/hotspot/disconnect', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: ownHotspotId, clientId: client.clientId }),
                          });
                          fetchOwnHotspotClients();
                        }}
                        className="px-2.5 py-1 rounded-full border border-slate-300 dark:border-slate-700 text-[10px] font-semibold text-red-500"
                      >
                        Kick
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={`p-3.5 rounded-2xl border space-y-3 ${cardBg}`}>
            <div>
              <label className={`block text-[11px] font-medium mb-1 ${muted}`}>
                Hotspot name (SSID)
              </label>
              <input
                type="text"
                value={system.hotspotSsid}
                onChange={(e) => onUpdateSystem({ hotspotSsid: e.target.value })}
                className="w-full px-3 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className={`block text-[11px] font-medium mb-1 ${muted}`}>
                Hotspot password (WPA2/WPA3-Personal)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showHotspotPw ? 'text' : 'password'}
                  value={system.hotspotPassword}
                  onChange={(e) => onUpdateSystem({ hotspotPassword: e.target.value })}
                  className="flex-1 px-3 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-mono-tabular focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => setShowHotspotPw((s) => !s)}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                  aria-label="Show or hide password"
                >
                  {showHotspotPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className={`block text-[11px] font-medium mb-1.5 ${muted}`}>AP Band</label>
              <div className="grid grid-cols-2 gap-2">
                {(['2.4 GHz', '5 GHz'] as const).map((band) => (
                  <button
                    key={band}
                    onClick={() => onUpdateSystem({ hotspotBand: band })}
                    className={`h-9 rounded-xl border text-xs font-medium font-mono-tabular ${
                      system.hotspotBand === band
                        ? 'border-[#1A73E8] bg-blue-50 dark:bg-blue-950/60 text-[#1A73E8] dark:text-blue-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {band}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border space-y-3 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Usb className="w-4 h-4 text-slate-500" />
                <div>
                  <div className="text-xs font-semibold">USB tethering</div>
                  <div className={`text-[11px] ${muted}`}>
                    {system.usbTethering ? 'Sharing network via virtual USB0' : 'Virtual USB bridge ready'}
                  </div>
                </div>
              </div>
              <SwitchToggle
                checked={system.usbTethering}
                onChange={() => onUpdateSystem({ usbTethering: !system.usbTethering })}
                label="Toggle USB tethering"
              />
            </div>

            <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bluetooth className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="text-xs font-semibold">Bluetooth tethering</div>
                  <div className={`text-[11px] ${muted}`}>
                    {system.btTethering ? 'Sharing PAN over Bluetooth' : 'Off'}
                  </div>
                </div>
              </div>
              <SwitchToggle
                checked={system.btTethering}
                onChange={() =>
                  onUpdateSystem({ btTethering: !system.btTethering, bluetooth: true })
                }
                label="Toggle Bluetooth tethering"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- CONNECTED DEVICES ---------------- */
  if (section === 'connected') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Connected devices')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div className="flex items-center gap-3">
              <Bluetooth className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs font-semibold">Bluetooth</div>
                <div className={`text-[11px] ${muted}`}>
                  {system.bluetooth ? `Visible as "${deviceName}"` : 'Off'}
                </div>
              </div>
            </div>
            <SwitchToggle
              checked={system.bluetooth}
              onChange={() => onUpdateSystem({ bluetooth: !system.bluetooth })}
              label="Toggle Bluetooth"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border space-y-2.5 ${cardBg}`}>
            <div className={`text-[11px] font-medium ${muted}`}>Previously connected devices</div>
            {[
              { name: 'Pixel Buds Pro', status: 'Audio · Battery 92%' },
              { name: 'Android Auto Head Unit', status: 'Saved for projection' },
            ].map((dev) => (
              <div
                key={dev.name}
                className="flex items-center justify-between py-1.5 border-b last:border-b-0 border-slate-100 dark:border-slate-800"
              >
                <div>
                  <div className="text-xs font-semibold">{dev.name}</div>
                  <div className={`text-[11px] ${muted}`}>{dev.status}</div>
                </div>
                <span className="text-[10px] font-mono-tabular text-slate-400">Saved</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- APPS ---------------- */
  if (section === 'apps') {
    const installed = apps.filter((a) => installedIds.includes(a.id));
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader(`Apps (${installed.length + customApks.length})`)}
        <div className="flex-1 overflow-y-auto phone-scroll divide-y divide-slate-200/70 dark:divide-slate-800">
          {customApks.map((apk) => (
            <div key={apk.packageName} className="px-3.5 py-2.5 flex items-center gap-3">
              <CustomApkIcon name={apk.name} iconUrl={apk.iconUrl} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{apk.name}</div>
                <div className={`text-[10px] font-mono-tabular truncate ${muted}`}>
                  {apk.packageName}
                </div>
                <div className={`text-[10px] tabular-nums ${muted}`}>
                  {apk.sizeMb} MB · Installed via APKPure
                </div>
              </div>
              {onUninstallCustomApk && (
                <button
                  onClick={() => onUninstallCustomApk(apk.packageName)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full"
                  aria-label={`Uninstall ${apk.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {installed.map((app) => (
            <div key={app.id} className="px-3.5 py-2.5 flex items-center gap-3">
              <AppIcon id={app.id} iconUrl={liveIconsMap[app.packageName]} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{app.name}</div>
                <div className={`text-[10px] font-mono-tabular truncate ${muted}`}>
                  {app.packageName}
                </div>
                <div className={`text-[10px] tabular-nums ${muted}`}>
                  {app.sizeMb} MB · v{app.version} · {app.apkSource || app.developer}
                </div>
              </div>
              {!app.preinstalled && (
                <button
                  onClick={() => onUninstallApp(app.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full"
                  aria-label={`Uninstall ${app.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- BATTERY ---------------- */
  if (section === 'battery') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Battery')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-4 rounded-2xl border space-y-2 ${cardBg}`}>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold font-mono-tabular">{system.battery}%</div>
              <BatteryCharging className="w-6 h-6 text-emerald-600" />
            </div>
            <div className={`text-xs ${muted}`}>
              {system.charging ? 'Charging rapidly via virtual USB-PD' : 'On battery · ~14 hr remaining'}
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${system.battery}%` }}
                className="h-full bg-emerald-600 transition-all"
              />
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div>
              <div className="text-xs font-semibold">Battery Saver</div>
              <div className={`text-[11px] ${muted}`}>
                Limit background network sync and darkens UI
              </div>
            </div>
            <SwitchToggle
              checked={system.batterySaver}
              onChange={() =>
                onUpdateSystem({
                  batterySaver: !system.batterySaver,
                  darkTheme: !system.batterySaver ? true : system.darkTheme,
                })
              }
              label="Toggle Battery Saver"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div>
              <div className="text-xs font-semibold">Simulate AC Charger</div>
              <div className={`text-[11px] ${muted}`}>Toggle virtual power delivery</div>
            </div>
            <SwitchToggle
              checked={system.charging}
              onChange={() => onUpdateSystem({ charging: !system.charging })}
              label="Toggle Charging"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- STORAGE ---------------- */
  if (section === 'storage') {
    const apkMb = downloadedApks.reduce((acc, a) => acc + a.sizeMb, 0);
    const appsGb = ((installedIds.length + customApks.length) * 0.14).toFixed(1);
    const totalUsedGb = (18.4 + Number(appsGb) + apkMb / 1024).toFixed(1);
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Storage')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-4 rounded-2xl border space-y-2.5 ${cardBg}`}>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono-tabular">{totalUsedGb} GB</span>
              <span className={`text-xs font-mono-tabular ${muted}`}>used of 256 GB</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div style={{ width: '12%' }} className="h-full bg-[#1A73E8]" />
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border divide-y divide-slate-200/70 dark:divide-slate-800 ${cardBg}`}>
            {[
              { label: 'Android System', value: '14.2 GB' },
              { label: 'Apps & Play Store', value: `${appsGb} GB` },
              { label: 'APKPure /Download/*.apk', value: `${apkMb} MB` },
              { label: 'Photos & Screen Captures', value: '3.8 GB' },
            ].map((row) => (
              <div key={row.label} className="py-2.5 flex items-center justify-between text-xs">
                <span>{row.label}</span>
                <span className={`font-mono-tabular font-semibold ${muted}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- SOUND & VIBRATION ---------------- */
  if (section === 'sound') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Sound & vibration')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-3.5 rounded-2xl border space-y-2 ${cardBg}`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Media volume</span>
              <span className="font-mono-tabular">{system.volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={system.volume}
              onChange={(e) => onUpdateSystem({ volume: Number(e.target.value) })}
              className="w-full accent-[#1A73E8]"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div>
              <div className="text-xs font-semibold">Do Not Disturb</div>
              <div className={`text-[11px] ${muted}`}>Silence notifications and alerts</div>
            </div>
            <SwitchToggle
              checked={system.dnd}
              onChange={() => onUpdateSystem({ dnd: !system.dnd })}
              label="Toggle Do Not Disturb"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- DISPLAY ---------------- */
  if (section === 'display') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Display')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-3.5 rounded-2xl border space-y-2 ${cardBg}`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Brightness level</span>
              <span className="font-mono-tabular">{system.brightness}%</span>
            </div>
            <input
              type="range"
              min={35}
              max={100}
              value={system.brightness}
              onChange={(e) => onUpdateSystem({ brightness: Number(e.target.value) })}
              className="w-full accent-[#1A73E8]"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div className="flex items-center gap-3">
              {system.darkTheme ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <div>
                <div className="text-xs font-semibold">Dark theme</div>
                <div className={`text-[11px] ${muted}`}>Material You dark palette</div>
              </div>
            </div>
            <SwitchToggle
              checked={system.darkTheme}
              onChange={() => onUpdateSystem({ darkTheme: !system.darkTheme })}
              label="Toggle Dark theme"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div>
              <div className="text-xs font-semibold">Landscape orientation</div>
              <div className={`text-[11px] ${muted}`}>Rotate virtual display 90 deg</div>
            </div>
            <SwitchToggle
              checked={system.landscape}
              onChange={() => onUpdateSystem({ landscape: !system.landscape })}
              label="Toggle Landscape orientation"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border space-y-2 ${cardBg}`}>
            <div className="text-xs font-semibold">Display resolution</div>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { id: 'compact', label: '720p Compact' },
                  { id: 'standard', label: '1080p Pixel' },
                  { id: 'qhd', label: '1440p QHD+' },
                  { id: 'tablet', label: '1600p Tablet' },
                ] as Array<{ id: ResolutionPreset; label: string }>
              ).map((r) => (
                <button
                  key={r.id}
                  onClick={() => onUpdateSystem({ resolution: r.id })}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-medium font-mono-tabular ${
                    system.resolution === r.id
                      ? 'border-[#1A73E8] bg-blue-50 dark:bg-blue-950/60 text-[#1A73E8] dark:text-blue-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- WALLPAPER ---------------- */
  if (section === 'wallpaper') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Wallpaper & style')}
        <div className="p-3.5 grid grid-cols-2 gap-3 overflow-y-auto phone-scroll">
          {WALLPAPERS.map((wp, idx) => (
            <button
              key={wp.id}
              onClick={() => onUpdateSystem({ wallpaperIndex: idx })}
              className={`rounded-2xl overflow-hidden border-2 text-left ${
                system.wallpaperIndex === idx
                  ? 'border-blue-600'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="h-32 w-full">
                {wp.src ? (
                  <img
                    src={wp.src}
                    alt={wp.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div style={{ background: wp.gradient }} className="w-full h-full" />
                )}
              </div>
              <div className="p-2 text-xs font-medium">{wp.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- SECURITY & PRIVACY ---------------- */
  if (section === 'security') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Security & privacy')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${cardBg}`}>
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-semibold">Google Play Protect</div>
              <div className={`text-[11px] ${muted}`}>
                No harmful apps found · Scanned {installedIds.length + customApks.length} packages
              </div>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div>
              <div className="text-xs font-semibold">Install unknown apps (APKPure)</div>
              <div className={`text-[11px] ${muted}`}>
                Allowed for com.apkpure.aegon
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600">Allowed</span>
          </div>

          <button
            onClick={() => onUpdateSystem({ locked: true })}
            className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between ${cardBg}`}
          >
            <div>
              <div className="text-xs font-semibold">Device lock screen</div>
              <div className={`text-[11px] ${muted}`}>Tap to lock virtual device now</div>
            </div>
            <Lock className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- SYSTEM & DEVELOPER ---------------- */
  if (section === 'system') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('System')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-3.5 rounded-2xl border space-y-1 ${cardBg}`}>
            <div className="text-xs font-semibold">Languages</div>
            <div className={`text-[11px] ${muted}`}>English (United States)</div>
          </div>

          <div className={`p-3.5 rounded-2xl border space-y-1 ${cardBg}`}>
            <div className="text-xs font-semibold">Date & time</div>
            <div className={`text-[11px] ${muted}`}>Set time automatically · Network-provided</div>
          </div>

          <button
            onClick={() => setSection('developer')}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left ${cardBg}`}
          >
            <div>
              <div className="text-xs font-semibold">Developer options</div>
              <div className={`text-[11px] ${muted}`}>
                {system.developerMode
                  ? `USB debugging ${system.usbDebugging ? 'enabled' : 'disabled'}`
                  : 'Enabled for Android Studio / AVD'}
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 ${muted}`} />
          </button>
        </div>
      </div>
    );
  }

  if (section === 'developer') {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {renderHeader('Developer options', 'system')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div>
              <div className="text-xs font-semibold">Developer mode</div>
              <div className={`text-[11px] ${muted}`}>Expose ADB & profiling tools</div>
            </div>
            <SwitchToggle
              checked={system.developerMode}
              onChange={() => onUpdateSystem({ developerMode: !system.developerMode })}
              label="Toggle developer mode"
            />
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}>
            <div>
              <div className="text-xs font-semibold">USB debugging (ADB)</div>
              <div className={`text-[11px] ${muted}`}>Debug bridge active on port 5554</div>
            </div>
            <SwitchToggle
              checked={system.usbDebugging}
              onChange={() => onUpdateSystem({ usbDebugging: !system.usbDebugging })}
              label="Toggle USB debugging"
            />
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ABOUT EMULATED DEVICE ---------------- */
  if (section === 'about') {
    const apiCode =
      androidVersion === '15'
        ? '35'
        : androidVersion === '14'
        ? '34'
        : androidVersion === '13'
        ? '33'
        : '31';

    return (
      <div className={`h-full flex flex-col ${surface} relative`}>
        {renderHeader('About emulated device')}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-2.5">
          {[
            { label: 'Device name', value: deviceName },
            { label: 'Google account', value: account.email },
            { label: 'Android version', value: `Android ${androidVersion} (API ${apiCode})` },
            { label: 'Android security update', value: 'November 5, 2026' },
            { label: 'Kernel version', value: '6.1.99-android15-8-g04f9a' },
            { label: 'IP address', value: '10.0.2.15' },
            { label: 'Hotspot IP', value: system.hotspot ? '192.168.43.1' : 'Inactive' },
          ].map((item) => (
            <div key={item.label} className={`p-3 rounded-2xl border ${cardBg}`}>
              <div className="text-xs font-semibold">{item.label}</div>
              <div className={`text-[11px] font-mono-tabular mt-0.5 ${muted}`}>{item.value}</div>
            </div>
          ))}

          <button
            onClick={() => {
              const next = buildTaps + 1;
              setBuildTaps(next);
              if (next >= 5) {
                onUpdateSystem({ developerMode: true });
                notifyLocal('You are now a developer!');
              } else {
                notifyLocal(`${5 - next} more taps to enable developer mode`);
              }
            }}
            className={`w-full p-3 rounded-2xl border text-left ${cardBg}`}
          >
            <div className="text-xs font-semibold">Build number</div>
            <div className={`text-[11px] font-mono-tabular mt-0.5 ${muted}`}>
              sdk_gphone64_arm64-userdebug {androidVersion} AP3A.241105.008
            </div>
          </button>
        </div>

        {localToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] shadow-lg whitespace-nowrap">
            {localToast}
          </div>
        )}
      </div>
    );
  }

  /* ---------------- MAIN SETTINGS MENU ---------------- */
  const menuItems: Array<{
    id: SettingsSection;
    title: string;
    subtitle: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: string;
  }> = [
    {
      id: 'network',
      title: 'Network & internet',
      subtitle: system.hotspot && !system.airplaneMode
        ? `Hotspot active · ${system.hotspotSsid}`
        : system.airplaneMode
        ? 'Airplane mode'
        : `${system.networkProfile.toUpperCase()} · Wi-Fi ${system.wifi ? 'on' : 'off'}`,
      icon: Wifi,
      accent: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60',
    },
    {
      id: 'hotspot',
      title: 'Hotspot & tethering',
      subtitle:
        system.hotspot && !system.airplaneMode
          ? `On · ${system.hotspotSsid} (${system.hotspotBand})`
          : 'Wi-Fi hotspot, USB, Bluetooth tethering',
      icon: Radio,
      accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      id: 'connected',
      title: 'Connected devices',
      subtitle: `Bluetooth ${system.bluetooth ? 'on' : 'off'} · Pixel Buds Pro`,
      icon: Bluetooth,
      accent: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60',
    },
    {
      id: 'apps',
      title: 'Apps',
      subtitle: `${installedIds.length + customApks.length} installed · Play Store & APKPure`,
      icon: Smartphone,
      accent: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60',
    },
    {
      id: 'battery',
      title: 'Battery',
      subtitle: `${system.battery}% · ${system.charging ? 'Charging' : 'On battery'}`,
      icon: BatteryCharging,
      accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      id: 'storage',
      title: 'Storage',
      subtitle: '22.5 GB used of 256 GB',
      icon: HardDrive,
      accent: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60',
    },
    {
      id: 'sound',
      title: 'Sound & vibration',
      subtitle: `Media ${system.volume}% · ${system.dnd ? 'DND on' : 'Ring normal'}`,
      icon: Volume2,
      accent: 'text-violet-600 bg-violet-50 dark:bg-violet-950/60',
    },
    {
      id: 'display',
      title: 'Display',
      subtitle: `${system.darkTheme ? 'Dark' : 'Light'} theme · ${system.resolution.toUpperCase()}`,
      icon: Sun,
      accent: 'text-orange-600 bg-orange-50 dark:bg-orange-950/60',
    },
    {
      id: 'wallpaper',
      title: 'Wallpaper & style',
      subtitle: WALLPAPERS[system.wallpaperIndex]?.name || 'Material You',
      icon: Palette,
      accent: 'text-pink-600 bg-pink-50 dark:bg-pink-950/60',
    },
    {
      id: 'security',
      title: 'Security & privacy',
      subtitle: 'Play Protect active · Unknown apps',
      icon: ShieldCheck,
      accent: 'text-teal-600 bg-teal-50 dark:bg-teal-950/60',
    },
    {
      id: 'system',
      title: 'System',
      subtitle: 'Languages, gestures, developer options',
      icon: Cpu,
      accent: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
    },
    {
      id: 'about',
      title: 'About emulated device',
      subtitle: `${deviceName} · Android ${androidVersion}`,
      icon: Info,
      accent: 'text-slate-600 bg-slate-100 dark:bg-slate-800',
    },
  ];

  const filteredMenu = searchQuery.trim()
    ? menuItems.filter(
        (m) =>
          m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  return (
    <div className={`h-full flex flex-col ${surface}`}>
      <div className="px-4 pt-3.5 pb-2.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xl font-semibold tracking-tight">Settings</span>
          <div
            style={{ backgroundColor: account.avatarColor }}
            className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center"
            title={account.email}
          >
            {account.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className={`flex items-center gap-2 px-3 h-10 rounded-full border ${cardBg}`}>
          <Search className={`w-4 h-4 shrink-0 ${muted}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings (hotspot, wifi, battery...)"
            className="w-full bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll px-3.5 pb-4 space-y-2">
        {!searchQuery && (
          <div className={`p-3 rounded-2xl border flex items-center gap-3 ${cardBg}`}>
            <div
              style={{ backgroundColor: account.avatarColor }}
              className="w-9 h-9 rounded-full text-white text-sm font-bold flex items-center justify-center shrink-0"
            >
              {account.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{account.name}</div>
              <div className={`text-[11px] truncate ${muted}`}>
                {account.email} · Google Services active
              </div>
            </div>
          </div>
        )}

        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full p-3 rounded-2xl border flex items-center gap-3 text-left hover:brightness-98 transition-all ${cardBg}`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${item.accent}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">{item.title}</div>
                <div className={`text-[11px] truncate ${muted}`}>{item.subtitle}</div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 ${muted}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
