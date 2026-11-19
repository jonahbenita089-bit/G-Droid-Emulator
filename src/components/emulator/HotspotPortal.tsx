import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Globe,
  Lock,
  MapPin,
  Radio,
  Search,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface HotspotSessionPublic {
  id: string;
  instanceId: string;
  deviceName: string;
  ssid: string;
  band: string;
  active: boolean;
  locationLabel: string;
  lat: number;
  lon: number;
  clientCount: number;
}

interface HotspotPortalProps {
  hotspotId: string;
}

export const HotspotPortal: React.FC<HotspotPortalProps> = ({ hotspotId }) => {
  const [session, setSession] = useState<HotspotSessionPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [clientName, setClientName] = useState('External Phone / Browser');
  const [clientId] = useState(() => `web-${Math.random().toString(36).slice(2, 8)}`);
  const [connectedIp, setConnectedIp] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Free gateway browsing once connected
  const [searchQuery, setSearchQuery] = useState('Orhuworun Delta State Nigeria');
  const [results, setResults] = useState<Array<{ title: string; url: string; snippet: string }>>([]);
  const [searching, setSearching] = useState(false);

  const loadSession = async () => {
    try {
      const r = await fetch(`/api/hotspot/${encodeURIComponent(hotspotId)}`);
      if (!r.ok) {
        setSession(null);
      } else {
        const d = await r.json();
        setSession(d.session || null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
    const timer = window.setInterval(loadSession, 4000);
    return () => clearInterval(timer);
  }, [hotspotId]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/hotspot/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: hotspotId,
          password,
          clientId,
          clientName: clientName.trim() || 'Connected Device',
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data.error || 'Could not authenticate with hotspot');
        return;
      }
      setConnectedIp(data.assignedIp);
      setSession(data.session);
    } catch {
      setErrorMsg('Network error contacting hotspot gateway');
    }
  };

  const handleDisconnect = async () => {
    await fetch('/api/hotspot/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: hotspotId, clientId }),
    }).catch(() => {});
    setConnectedIp(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const resp = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
      if (resp.ok) {
        const data = await resp.json();
        setResults(data.results || []);
      }
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0B0E14] text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Radio className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-base tracking-tight">Pixel AVD Hotspot Gateway</span>
        </div>
        <a
          href="/"
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Emulator</span>
        </a>
      </header>

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500">
            Scanning for hotspot gateway...
          </div>
        ) : !session || !session.active ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <WifiOff className="w-8 h-8 mx-auto text-slate-400" />
            <h1 className="text-base font-semibold">Hotspot is Offline</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Turn on Wi-Fi Hotspot inside the Android emulator's Quick Settings or Settings &gt; Hotspot &amp; tethering, then refresh this gateway.
            </p>
            <button
              onClick={loadSession}
              className="px-4 h-9 rounded-full bg-blue-600 text-white text-xs font-semibold"
            >
              Retry Scan
            </button>
          </div>
        ) : !connectedIp ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-emerald-600">Active Hotspot Signal</div>
                <h1 className="text-lg font-bold mt-0.5">{session.ssid}</h1>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {session.locationLabel} ({session.lat.toFixed(4)}, {session.lon.toFixed(4)})
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono-tabular text-slate-500">{session.band}</span>
            </div>

            <form onSubmit={handleConnect} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-medium mb-1">Your Device Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Hotspot Password (WPA2/WPA3)</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter hotspot password"
                    className="w-full pl-9 pr-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Wifi className="w-4 h-4" />
                <span>Connect to {session.ssid}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">
                    Connected to {session.ssid}
                  </div>
                  <div className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400 truncate">
                    IP {connectedIp} · Gateway 192.168.43.1 · {session.locationLabel}
                  </div>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 h-8 rounded-full border border-slate-300 dark:border-slate-700 text-[11px] font-semibold shrink-0"
              >
                Disconnect
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Shared Free Internet Browser</span>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search the live web over hotspot..."
                  className="flex-1 px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
                <button
                  type="submit"
                  className="px-4 h-10 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Go</span>
                </button>
              </form>

              {searching && (
                <div className="text-xs text-slate-500 py-3 text-center">Loading over hotspot...</div>
              )}

              {results.length > 0 && (
                <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {results.map((r, i) => (
                    <a
                      key={i}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block py-2.5 hover:text-blue-600"
                    >
                      <div className="text-xs font-semibold">{r.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2">{r.snippet}</div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
