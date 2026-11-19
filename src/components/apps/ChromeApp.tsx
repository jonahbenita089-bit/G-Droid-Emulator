import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark,
  ExternalLink,
  Globe,
  Lock,
  Plus,
  RotateCw,
  Search,
  WifiOff,
  X,
} from 'lucide-react';
import { NetworkProfile } from '../../types/emulator';
import { GoogleGLogo } from '../icons/AppIcons';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  history: string[];
  historyIndex: number;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface BrowseBlock {
  type: 'heading' | 'paragraph' | 'link' | 'image';
  text?: string;
  href?: string;
  src?: string;
  alt?: string;
}

interface ChromeAppProps {
  darkTheme: boolean;
  initialQuery?: string;
  isOnline: boolean;
  networkProfile?: NetworkProfile;
  gpsLat?: number;
  gpsLon?: number;
  gpsLabel?: string;
  onLog?: (level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR', tag: string, message: string) => void;
  onReconnectWifi: () => void;
}

const NETWORK_DELAY_MS: Record<NetworkProfile, number> = {
  wifi: 0,
  '5g': 70,
  '4g': 350,
  '3g': 1400,
  offline: 0,
};

const BOOKMARKS = [
  {
    title: 'Wikipedia',
    url: 'https://en.m.wikipedia.org/wiki/Delta_State',
    subtitle: 'Delta State Info',
  },
  {
    title: 'BBC News',
    url: 'https://www.bbc.com/news',
    subtitle: 'World Headlines',
  },
  {
    title: 'Hacker News',
    url: 'https://news.ycombinator.com',
    subtitle: 'Tech Feed',
  },
  {
    title: 'Live Weather',
    url: 'chrome://weather',
    subtitle: 'Local Forecast',
  },
];

export const ChromeApp: React.FC<ChromeAppProps> = ({
  darkTheme,
  initialQuery,
  isOnline,
  networkProfile = 'wifi',
  gpsLat = 5.5126,
  gpsLon = 5.8394,
  gpsLabel = 'Orhuworun, Delta State',
  onLog,
  onReconnectWifi,
}) => {
  const initialUrl = initialQuery
    ? initialQuery.startsWith('http://') || initialQuery.startsWith('https://')
      ? initialQuery
      : `https://google.com/search?q=${encodeURIComponent(initialQuery)}`
    : 'chrome://newtab';

  const [tabs, setTabs] = useState<BrowserTab[]>([
    {
      id: 't1',
      title: initialQuery ? `${initialQuery}` : 'New Tab',
      url: initialUrl,
      history: [initialUrl],
      historyIndex: 0,
    },
  ]);
  const [activeTabId, setActiveTabId] = useState('t1');
  const [addressInput, setAddressInput] = useState(
    initialUrl === 'chrome://newtab' ? '' : initialUrl
  );
  const [showTabsOverlay, setShowTabsOverlay] = useState(false);
  const [readerMode, setReaderMode] = useState(false);
  const [reloadNonce, setReloadNonce] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchData, setSearchData] = useState<{
    query: string;
    instantSummary?: { title: string; summary: string; url: string } | null;
    results: SearchResult[];
  } | null>(null);
  const [pageData, setPageData] = useState<{
    url: string;
    title: string;
    blocks: BrowseBlock[];
  } | null>(null);
  const [weatherData, setWeatherData] = useState<{
    tempF: number;
    windMph: number;
    hourly: Array<{ time: string; tempF: number }>;
  } | null>(null);
  const [hnStories, setHnStories] = useState<
    Array<{ id: number; title: string; url: string; score: number; by: string }>
  >([]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const isWebPageUrl =
    (activeTab.url.startsWith('http://') || activeTab.url.startsWith('https://')) &&
    !activeTab.url.startsWith('https://google.com/search?q=');

  const simulateNetworkLatency = async () => {
    const ms = NETWORK_DELAY_MS[networkProfile] ?? 0;
    if (ms > 0) {
      await new Promise((r) => setTimeout(r, ms));
    }
  };

  const navigate = (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;
    const isChromeInternal = trimmed.startsWith('chrome://');
    const isUrl =
      isChromeInternal ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      (trimmed.includes('.') && !trimmed.includes(' '));

    const targetUrl = isChromeInternal
      ? trimmed
      : isUrl
      ? trimmed.startsWith('http')
        ? trimmed
        : `https://${trimmed}`
      : `https://google.com/search?q=${encodeURIComponent(trimmed)}`;

    const newTitle = isChromeInternal
      ? 'Weather'
      : isUrl
      ? targetUrl.replace(/^https?:\/\//, '').split('/')[0]
      : `${trimmed} - Search`;

    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== activeTab.id) return t;
        const nextHist = [...t.history.slice(0, t.historyIndex + 1), targetUrl];
        return {
          ...t,
          url: targetUrl,
          title: newTitle,
          history: nextHist,
          historyIndex: nextHist.length - 1,
        };
      })
    );
    setAddressInput(targetUrl === 'chrome://newtab' ? '' : targetUrl);
  };

  // Receive real link clicks & title updates from proxied iframe pages
  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'avd-chrome-nav' && typeof data.url === 'string') {
        navigate(data.url);
      } else if (data.type === 'avd-chrome-loaded' && typeof data.title === 'string') {
        setLoading(false);
        setTabs((prev) =>
          prev.map((t) =>
            t.id === activeTabId && t.url === data.url
              ? { ...t, title: data.title || t.title }
              : t
          )
        );
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId]);

  const loadUrl = async (targetUrl: string) => {
    setErrorMsg(null);

    if (targetUrl === 'chrome://newtab') {
      setSearchData(null);
      setPageData(null);
      setWeatherData(null);
      setLoading(false);
      if (isOnline && hnStories.length === 0) {
        fetch('/api/news')
          .then((r) => r.json())
          .then((d) => setHnStories(d.stories || []))
          .catch(() => {});
      }
      return;
    }

    if (!isOnline) {
      setSearchData(null);
      setPageData(null);
      setLoading(false);
      setErrorMsg('No internet connection. Enable Wi-Fi or Cellular to browse.');
      onLog?.('WARN', 'ChromeNet', `Blocked navigation (${networkProfile}): ${targetUrl}`);
      return;
    }

    if (targetUrl === 'chrome://weather') {
      setLoading(true);
      setSearchData(null);
      setPageData(null);
      try {
        await simulateNetworkLatency();
        const r = await fetch(`/api/weather?lat=${gpsLat}&lon=${gpsLon}`);
        const data = await r.json();
        setWeatherData(data);
        onLog?.(
          'INFO',
          'ChromeNet',
          `Loaded weather for ${gpsLabel} (${gpsLat.toFixed(2)}, ${gpsLon.toFixed(2)})`
        );
      } catch {
        setErrorMsg('Unable to fetch weather forecast.');
        onLog?.('ERROR', 'ChromeNet', 'Weather fetch failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (targetUrl.startsWith('https://google.com/search?q=')) {
      const q = decodeURIComponent(targetUrl.split('q=')[1] || '').replace(/\+/g, ' ');
      setLoading(true);
      setPageData(null);
      setWeatherData(null);
      try {
        await simulateNetworkLatency();
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Search failed');
        setSearchData(data);
        onLog?.(
          'INFO',
          'ChromeSearch',
          `Query "${q}" returned ${data.results?.length ?? 0} results (${networkProfile.toUpperCase()})`
        );
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Search failed');
        onLog?.('ERROR', 'ChromeSearch', `Search failed for "${q}"`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Real website navigation: use live iframe proxy by default, or /api/browse when Reader Mode is toggled
    setSearchData(null);
    setWeatherData(null);

    if (!readerMode) {
      setPageData(null);
      setLoading(true);
      onLog?.('INFO', 'ChromeWebView', `GET ${targetUrl} (${networkProfile.toUpperCase()})`);
      return;
    }

    setLoading(true);
    try {
      await simulateNetworkLatency();
      const r = await fetch(`/api/browse?url=${encodeURIComponent(targetUrl)}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Unable to load website');
      setPageData(data);
      onLog?.('INFO', 'ChromeReader', `200 OK ${targetUrl} (${networkProfile.toUpperCase()})`);
      if (data.title) {
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTab.id ? { ...t, title: data.title } : t))
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to reach website';
      setErrorMsg(msg);
      onLog?.('ERROR', 'ChromeHttp', `GET ${targetUrl} failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUrl(activeTab.url);
    setAddressInput(activeTab.url === 'chrome://newtab' ? '' : activeTab.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab.id, activeTab.url, isOnline, readerMode, reloadNonce]);

  const goBack = () => {
    if (activeTab.historyIndex <= 0) return;
    const nextIdx = activeTab.historyIndex - 1;
    const targetUrl = activeTab.history[nextIdx];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id ? { ...t, url: targetUrl, historyIndex: nextIdx } : t
      )
    );
  };

  const goForward = () => {
    if (activeTab.historyIndex >= activeTab.history.length - 1) return;
    const nextIdx = activeTab.historyIndex + 1;
    const targetUrl = activeTab.history[nextIdx];
    setTabs((prev) =>
      prev.map((t) =>
        t.id === activeTab.id ? { ...t, url: targetUrl, historyIndex: nextIdx } : t
      )
    );
  };

  const addTab = () => {
    const id = `t${Date.now()}`;
    const url = 'chrome://newtab';
    setTabs((prev) => [
      ...prev,
      { id, title: 'New tab', url, history: [url], historyIndex: 0 },
    ]);
    setActiveTabId(id);
    setShowTabsOverlay(false);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return;
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (activeTabId === id) {
      setActiveTabId(next[0].id);
    }
  };

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const barBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  const renderPageContent = () => {
    if (!isOnline && activeTab.url !== 'chrome://newtab') {
      return (
        <div className="p-6 text-center space-y-4 pt-14">
          <WifiOff className="w-10 h-10 mx-auto text-slate-400" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">You are offline</h2>
            <p className={`text-xs ${muted}`}>
              Turn on Wi-Fi or mobile data to browse the live internet.
            </p>
          </div>
          <button
            onClick={onReconnectWifi}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold"
          >
            Connect Wi-Fi
          </button>
        </div>
      );
    }

    if (errorMsg) {
      return (
        <div className="p-6 text-center space-y-3 pt-12">
          <div className="text-sm font-semibold">Page unavailable</div>
          <p className={`text-xs ${muted}`}>{errorMsg}</p>
          <button
            onClick={() => setReloadNonce((n) => n + 1)}
            className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold"
          >
            Try again
          </button>
        </div>
      );
    }

    // Real Live HTML WebView via Server Reverse Proxy
    if (isWebPageUrl && !readerMode) {
      const proxySrc = `/api/proxy?url=${encodeURIComponent(activeTab.url)}&r=${reloadNonce}`;
      return (
        <div className="w-full h-full flex flex-col bg-white relative">
          {loading && (
            <div className="h-1 w-full bg-slate-200 overflow-hidden shrink-0">
              <div className="h-full w-2/3 bg-blue-600 animate-pulse" />
            </div>
          )}
          <iframe
            key={proxySrc}
            src={proxySrc}
            title={activeTab.title}
            sandbox="allow-scripts allow-forms allow-popups"
            onLoad={() => setLoading(false)}
            className="flex-1 w-full h-full border-0 bg-white"
          />
          <div className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <button
              onClick={() => setReaderMode(true)}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Switch to Reader View
            </button>
            <a
              href={activeTab.url}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-1 ${muted} hover:text-blue-600`}
            >
              <span>Open Native Tab</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="p-5 space-y-3">
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full w-2/3 bg-blue-600 rounded-full animate-pulse" />
          </div>
          <div className={`text-xs ${muted}`}>Loading live page over free internet gateway...</div>
          <div className="space-y-2.5 pt-2">
            <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      );
    }

    if (weatherData && activeTab.url === 'chrome://weather') {
      return (
        <div className="p-4 space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-sky-100">{gpsLabel} · Live</div>
                <div className="text-3xl font-semibold tabular-nums mt-0.5">{weatherData.tempF}°F</div>
              </div>
              <div className="text-right text-xs text-sky-100 tabular-nums">
                <div>Open-Meteo Live</div>
                <div>Wind {weatherData.windMph} mph</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/20 text-center text-[11px] tabular-nums">
              {weatherData.hourly.slice(0, 4).map((h) => (
                <div key={h.time}>
                  <div className="text-sky-100">{h.time}</div>
                  <div className="font-semibold">{h.tempF}°</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (searchData && activeTab.url.startsWith('https://google.com/search')) {
      return (
        <div className="p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <GoogleGLogo size={18} />
            <span className="text-xs font-medium truncate">
              Web results for "{searchData.query}"
            </span>
          </div>

          {searchData.instantSummary && (
            <button
              onClick={() => navigate(searchData.instantSummary!.url)}
              className={`w-full text-left p-3.5 rounded-2xl border space-y-1 ${
                darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-blue-50/60 border-blue-200'
              }`}
            >
              <div className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                Knowledge Summary
              </div>
              <div className="text-sm font-semibold">{searchData.instantSummary.title}</div>
              <p className={`text-xs leading-relaxed ${muted}`}>
                {searchData.instantSummary.summary}
              </p>
            </button>
          )}

          {searchData.results.map((res, idx) => (
            <button
              key={idx}
              onClick={() => navigate(res.url)}
              className="block w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors space-y-1"
            >
              <div className={`text-[11px] truncate ${muted}`}>{res.source}</div>
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 leading-snug">
                {res.title}
              </div>
              <p className={`text-xs leading-relaxed line-clamp-3 ${muted}`}>{res.snippet}</p>
            </button>
          ))}

          {searchData.results.length === 0 && (
            <div className={`py-8 text-center text-xs ${muted}`}>
              No results returned for this query. Try another search term or enter a direct URL.
            </div>
          )}
        </div>
      );
    }

    if (pageData) {
      return (
        <div className="p-4 space-y-3">
          <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-sm font-semibold leading-snug">{pageData.title}</h1>
              <div className={`text-[10px] truncate ${muted}`}>{pageData.url}</div>
            </div>
            <button
              onClick={() => setReaderMode(false)}
              className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold shrink-0"
            >
              Web View
            </button>
          </div>

          <div className="space-y-2.5">
            {pageData.blocks.map((block, idx) => {
              if (block.type === 'heading') {
                return (
                  <h2 key={idx} className="text-sm font-semibold pt-2 leading-snug">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === 'paragraph') {
                return (
                  <p key={idx} className={`text-xs leading-relaxed ${muted}`}>
                    {block.text}
                  </p>
                );
              }
              if (block.type === 'link' && block.href) {
                return (
                  <button
                    key={idx}
                    onClick={() => navigate(block.href!)}
                    className="block text-left text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline py-0.5"
                  >
                    {block.text}
                  </button>
                );
              }
              if (block.type === 'image' && block.src) {
                return (
                  <img
                    key={idx}
                    src={block.src}
                    alt={block.alt || 'Web image'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                    className="w-full max-h-44 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                  />
                );
              }
              return null;
            })}

            {pageData.blocks.length === 0 && (
              <div className={`py-8 text-center text-xs ${muted}`}>
                This site renders dynamically via client scripts. Switch back to Web View to render the full page.
              </div>
            )}
          </div>
        </div>
      );
    }

    // Chrome New Tab Page with live bookmarks & Discover headlines
    return (
      <div className="p-4 flex flex-col items-center space-y-5">
        <div className="pt-4 flex items-center gap-2">
          <GoogleGLogo size={26} />
          <span className="text-2xl font-semibold tracking-tight">Google</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('q') as HTMLInputElement;
            if (input?.value) navigate(input.value);
          }}
          className={`w-full flex items-center gap-2 px-4 h-11 rounded-full border ${barBg}`}
        >
          <Search className={`w-4 h-4 ${muted}`} />
          <input
            name="q"
            type="text"
            placeholder="Search web or type URL (e.g. bbc.com, wikipedia.org)"
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
        </form>

        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-medium ${muted}`}>Quick Sites</span>
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              {isOnline ? `${gpsLabel} · Online` : 'Offline'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BOOKMARKS.map((bm) => (
              <button
                key={bm.url}
                onClick={() => navigate(bm.url)}
                className={`p-2.5 rounded-xl border text-left transition-colors hover:border-blue-400 ${
                  darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Bookmark className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="text-xs font-semibold truncate">{bm.title}</span>
                </div>
                <div className={`text-[10px] ${muted}`}>{bm.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        {hnStories.length > 0 && (
          <div className="w-full space-y-2 pt-1">
            <div className={`text-[11px] font-medium ${muted}`}>Live Web Headlines</div>
            <div className="space-y-2">
              {hnStories.slice(0, 4).map((st) => (
                <button
                  key={st.id}
                  onClick={() => navigate(st.url)}
                  className={`w-full text-left p-2.5 rounded-xl border space-y-1 transition-colors hover:border-blue-400 ${
                    darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-xs font-medium leading-snug line-clamp-2">{st.title}</div>
                  <div className={`text-[10px] tabular-nums ${muted}`}>
                    {st.score} points · by {st.by}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${surface} relative`}>
      {/* Chrome Top Bar */}
      <div className="px-2 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1">
        <button
          onClick={goBack}
          disabled={activeTab.historyIndex <= 0}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 shrink-0"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goForward}
          disabled={activeTab.historyIndex >= activeTab.history.length - 1}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 shrink-0"
          aria-label="Forward"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate(addressInput);
          }}
          className={`flex-1 flex items-center gap-1.5 px-2.5 h-8 rounded-full border min-w-0 ${barBg}`}
        >
          <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
          <input
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="Search or enter URL"
            className="w-full bg-transparent text-[11px] focus:outline-none truncate"
          />
        </form>

        {isWebPageUrl && (
          <button
            onClick={() => setReaderMode((r) => !r)}
            className={`w-7 h-7 flex items-center justify-center rounded-full shrink-0 ${
              readerMode
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={readerMode ? 'Exit Reader View' : 'Reader View'}
            aria-label="Toggle Reader View"
          >
            <BookOpen className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => setReloadNonce((n) => n + 1)}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          aria-label="Reload"
        >
          <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        <button
          onClick={() => setShowTabsOverlay((s) => !s)}
          className="w-6 h-6 rounded-md border-2 border-current text-[10px] font-bold flex items-center justify-center tabular-nums shrink-0"
          aria-label="Switch tabs"
        >
          {tabs.length}
        </button>
      </div>

      {/* Page Body */}
      <div className="flex-1 min-h-0 overflow-y-auto phone-scroll">{renderPageContent()}</div>

      {/* Tabs Manager Overlay */}
      {showTabsOverlay && (
        <div className={`absolute inset-0 z-20 flex flex-col ${surface}`}>
          <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={addTab}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New tab</span>
            </button>
            <button
              onClick={() => setShowTabsOverlay(false)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Done
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3.5 grid grid-cols-2 gap-3 content-start">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setShowTabsOverlay(false);
                }}
                className={`p-3 rounded-2xl border cursor-pointer space-y-2 ${
                  tab.id === activeTabId
                    ? 'border-blue-500 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-xs font-semibold truncate">{tab.title}</span>
                  </div>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                      aria-label="Close tab"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className={`text-[10px] truncate ${muted}`}>{tab.url}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
