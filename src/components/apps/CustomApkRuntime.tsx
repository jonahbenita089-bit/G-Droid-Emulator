import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCheck,
  Disc3,
  ExternalLink,
  Globe,
  HardDriveDownload,
  Info,
  Pause,
  Play,
  RotateCw,
  Search,
  Send,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Trash2,
  Volume2,
} from 'lucide-react';
import { CustomApkApp } from '../../types/emulator';
import { CustomApkIcon } from '../icons/AppIcons';

interface CustomApkRuntimeProps {
  apk: CustomApkApp;
  isOnline: boolean;
  darkTheme: boolean;
  gpsLabel?: string;
  volume?: number;
  onOpenInChrome: (query: string) => void;
  onUninstall: (packageName: string) => void;
}

type RuntimeMode = 'music' | 'chat' | 'video' | 'browser' | 'web';

interface TrackItem {
  id: string;
  title: string;
  artist: string;
  album: string;
  artwork: string;
  previewUrl: string;
  durationSec: number;
}

interface ChatThread {
  id: string;
  name: string;
  status: string;
  unread: number;
  messages: Array<{ id: string; fromMe: boolean; text: string; time: string }>;
}

const KNOWN_APP_URLS: Array<{ match: string; url: string }> = [
  { match: 'wikipedia', url: 'https://en.m.wikipedia.org/wiki/Delta_State' },
  { match: 'github', url: 'https://github.com/trending' },
  { match: 'reddit', url: 'https://old.reddit.com' },
  { match: 'bbc', url: 'https://www.bbc.com/news' },
  { match: 'cnn', url: 'https://lite.cnn.com' },
  { match: 'opera', url: 'https://html.duckduckgo.com/html/?q=Orhuworun+Delta+State' },
  { match: 'firefox', url: 'https://en.m.wikipedia.org' },
  { match: 'brave', url: 'https://news.ycombinator.com' },
  { match: 'duckduckgo', url: 'https://html.duckduckgo.com/html/' },
  { match: 'facebook', url: 'https://en.m.wikipedia.org/wiki/Facebook' },
  { match: 'instagram', url: 'https://en.m.wikipedia.org/wiki/Instagram' },
  { match: 'jumia', url: 'https://www.jumia.com.ng' },
];

function classifyApkRuntime(apk: CustomApkApp): RuntimeMode {
  const key = `${apk.packageName} ${apk.name}`.toLowerCase();
  if (
    /spotify|music|audiomack|boomplay|soundcloud|shazam|apple\.android\.music|podcast|anchor/.test(
      key
    )
  ) {
    return 'music';
  }
  if (/whatsapp|telegram|messenger|orca|signal|securesms|discord|slack|viber|line|imo/.test(key)) {
    return 'chat';
  }
  if (/tiktok|musically|vlc|mxtech|netflix|twitch|vimeo|player|video/.test(key)) {
    return 'video';
  }
  if (/opera|firefox|brave|duckduckgo|edge|browser|ucbrowser/.test(key)) {
    return 'browser';
  }
  return 'web';
}

function getInitialWebUrl(apk: CustomApkApp): string {
  const key = `${apk.packageName} ${apk.name}`.toLowerCase();
  const known = KNOWN_APP_URLS.find((item) => key.includes(item.match));
  if (known) return known.url;
  return `https://en.m.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(apk.name)}`;
}

/* ---------------- LIVE MUSIC RUNTIME (Spotify / Boomplay / Audiomack) ---------------- */
const MusicAppRuntime: React.FC<{
  apk: CustomApkApp;
  isOnline: boolean;
  darkTheme: boolean;
  volume: number;
}> = ({ apk, isOnline, darkTheme, volume }) => {
  const [query, setQuery] = useState('Afrobeats');
  const [tracks, setTracks] = useState<TrackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadTracks = async (term: string) => {
    if (!isOnline) return;
    setLoading(true);
    try {
      const r = await fetch(`/api/music/search?q=${encodeURIComponent(term)}`);
      const d = await r.json();
      setTracks(d.tracks || []);
      setActiveIndex(0);
      setPlaying(false);
      setProgress(0);
    } catch {
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks('Burna Boy Afrobeats');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume]);

  const currentTrack = tracks[activeIndex];

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.previewUrl;
    setProgress(0);
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, currentTrack?.previewUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (audio && audio.duration) {
            setProgress((audio.currentTime / audio.duration) * 100);
          }
        }}
        onEnded={() => {
          if (tracks.length > 0) {
            setActiveIndex((i) => (i + 1) % tracks.length);
            setPlaying(true);
          }
        }}
      />

      <div className="p-3 space-y-2.5 border-b border-slate-200/80 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (query.trim()) loadTracks(query.trim());
          }}
          className={`flex items-center gap-2 px-3 h-9 rounded-full border ${cardBg}`}
        >
          <Search className={`w-3.5 h-3.5 shrink-0 ${muted}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search songs on ${apk.name}`}
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto phone-scroll">
          {['Burna Boy', 'Wizkid', 'Rema', 'Asake', 'Top Hits'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setQuery(tag);
                loadTracks(tag);
              }}
              className={`px-2.5 py-1 rounded-full border text-[10px] font-medium shrink-0 ${cardBg}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll p-3 space-y-1.5">
        {!isOnline && (
          <div className={`p-4 rounded-2xl border text-center text-xs ${cardBg} ${muted}`}>
            Enable Wi-Fi or Mobile Data to stream music on {apk.name}.
          </div>
        )}

        {loading && (
          <div className="py-10 text-center text-xs text-slate-400">
            Loading live tracks...
          </div>
        )}

        {!loading &&
          tracks.map((track, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={track.id}
                onClick={() => {
                  setActiveIndex(idx);
                  setPlaying(true);
                  window.setTimeout(() => {
                    audioRef.current?.play().catch(() => {});
                  }, 50);
                }}
                className={`w-full p-2 rounded-xl flex items-center gap-2.5 text-left transition-colors ${
                  isActive
                    ? 'bg-emerald-500/15 border border-emerald-500/40'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-900'
                }`}
              >
                {track.artwork ? (
                  <img
                    src={track.artwork}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-800"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
                    <Disc3 className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-semibold truncate ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : ''
                    }`}
                  >
                    {track.title}
                  </div>
                  <div className={`text-[10px] truncate ${muted}`}>
                    {track.artist} · {track.album}
                  </div>
                </div>
                {isActive && playing ? (
                  <Pause className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Play className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
      </div>

      {/* Mini Now Playing Bar */}
      {currentTrack && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-900 text-white space-y-2 shrink-0">
          <div className="h-1 rounded-full bg-slate-700 overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-[#24CD77] transition-all"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{currentTrack.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentTrack.artist}</div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() =>
                  setActiveIndex((i) => (i - 1 + tracks.length) % tracks.length)
                }
                className="p-1.5 rounded-full hover:bg-slate-800"
                aria-label="Previous track"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#24CD77] text-slate-950 flex items-center justify-center"
                aria-label={playing ? 'Pause' : 'Play'}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button
                onClick={() => setActiveIndex((i) => (i + 1) % tracks.length)}
                className="p-1.5 rounded-full hover:bg-slate-800"
                aria-label="Next track"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------- LIVE CHAT RUNTIME (WhatsApp / Telegram / Discord / Signal) ---------------- */
const ChatAppRuntime: React.FC<{
  apk: CustomApkApp;
  darkTheme: boolean;
  gpsLabel: string;
}> = ({ apk, darkTheme, gpsLabel }) => {
  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: 'c1',
      name: 'Adaeze (Orhuworun)',
      status: 'Online',
      unread: 1,
      messages: [
        {
          id: 'm1',
          fromMe: false,
          text: `Hey! Just joined ${apk.name} around ${gpsLabel}. Are you connected?`,
          time: '11:30',
        },
      ],
    },
    {
      id: 'c2',
      name: 'Udu Tech Hub',
      status: '14 members online',
      unread: 0,
      messages: [
        {
          id: 'm2',
          fromMe: false,
          text: 'Pixel 9 Pro Android 15 build is running smoothly on the gateway.',
          time: '10:42',
        },
      ],
    },
    {
      id: 'c3',
      name: 'Tunde (Delta State)',
      status: 'Last seen today',
      unread: 0,
      messages: [
        {
          id: 'm3',
          fromMe: true,
          text: 'Testing mobile hotspot & messaging now.',
          time: '09:15',
        },
      ],
    },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const activeThread = threads.find((t) => t.id === selectedId) || null;
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';

  const sendMessage = () => {
    const text = draft.trim();
    if (!text || !activeThread) return;
    const nowTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const targetId = activeThread.id;
    setDraft('');
    setThreads((prev) =>
      prev.map((t) =>
        t.id === targetId
          ? {
              ...t,
              messages: [
                ...t.messages,
                { id: `u-${Date.now()}`, fromMe: true, text, time: nowTime },
              ],
            }
          : t
      )
    );

    window.setTimeout(() => {
      setThreads((prev) =>
        prev.map((t) =>
          t.id === targetId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: `r-${Date.now()}`,
                    fromMe: false,
                    text: `Received on ${apk.name}: "${text.slice(0, 40)}"`,
                    time: nowTime,
                  },
                ],
              }
            : t
        )
      );
    }, 750);
  };

  if (activeThread) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <button
            onClick={() => setSelectedId(null)}
            className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Back to chats"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {activeThread.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate">{activeThread.name}</div>
            <div className={`text-[10px] ${muted}`}>{activeThread.status}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto phone-scroll p-3 space-y-2">
          {activeThread.messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.fromMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[82%] px-3 py-2 rounded-2xl text-xs space-y-1 ${
                  m.fromMe
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : `${cardBg} border rounded-bl-xs`
                }`}
              >
                <div>{m.text}</div>
                <div
                  className={`text-[9px] font-mono-tabular flex items-center justify-end gap-1 ${
                    m.fromMe ? 'text-emerald-100' : muted
                  }`}
                >
                  <span>{m.time}</span>
                  {m.fromMe && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message via ${apk.name}`}
            className={`flex-1 h-9 px-3.5 rounded-full border text-xs focus:outline-none ${cardBg}`}
          />
          <button
            type="submit"
            className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto phone-scroll divide-y divide-slate-200/70 dark:divide-slate-800">
      {threads.map((thread) => {
        const last = thread.messages[thread.messages.length - 1];
        return (
          <button
            key={thread.id}
            onClick={() => {
              setSelectedId(thread.id);
              setThreads((prev) =>
                prev.map((t) => (t.id === thread.id ? { ...t, unread: 0 } : t))
              );
            }}
            className="w-full px-3.5 py-3 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-900/60"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {thread.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold truncate">{thread.name}</span>
                <span className={`text-[10px] font-mono-tabular ${muted}`}>{last?.time}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <span className={`text-[11px] truncate ${muted}`}>{last?.text}</span>
                {thread.unread > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                    {thread.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

/* ---------------- LIVE VIDEO PLAYER RUNTIME (TikTok / VLC / Netflix) ---------------- */
const VideoPlayerRuntime: React.FC<{
  apk: CustomApkApp;
  darkTheme: boolean;
}> = ({ apk, darkTheme }) => {
  const clips = [
    { title: 'Orhuworun Express Drive', creator: '@delta_roads', color: '#0ea5e9', speed: 1 },
    { title: 'Android 15 Material Motion', creator: '@pixel_dev', color: '#10b981', speed: 1 },
    { title: 'Studio Synth Equalizer', creator: '@lagos_audio', color: '#8b5cf6', speed: 1 },
  ];
  const [clipIdx, setClipIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame = 0;
    let raf = 0;

    const render = () => {
      if (playing) frame += 1;
      const w = canvas.width;
      const h = canvas.height;
      const active = clips[clipIdx];
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(1, active.color);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      for (let i = 0; i < 6; i++) {
        const y = h * 0.52 + Math.sin(frame * 0.05 + i * 0.8) * 28;
        const x = ((frame * 2 + i * 65) % (w + 60)) - 30;
        ctx.fillStyle = 'rgba(255,255,255,0.16)';
        ctx.beginPath();
        ctx.arc(x, y, 18 + i * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Plus Jakarta Sans, sans-serif';
      ctx.fillText(active.title, 18, h - 48);
      ctx.font = '12px DM Sans, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(`${active.creator} · ${apk.name} Hardware Decoder`, 18, h - 26);

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [clipIdx, playing, apk.name]);

  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';

  return (
    <div className="flex-1 flex flex-col min-h-0 p-3 space-y-3 overflow-y-auto phone-scroll">
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
        <canvas ref={canvasRef} width={340} height={240} className="w-full h-56 block" />
        <button
          onClick={() => setPlaying((p) => !p)}
          className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white/90 text-slate-950 flex items-center justify-center shadow-lg"
          aria-label={playing ? 'Pause video' : 'Play video'}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>

      <div className="space-y-2">
        <div className={`text-[11px] font-semibold ${muted}`}>Playable Stream Queue</div>
        {clips.map((c, idx) => (
          <button
            key={c.title}
            onClick={() => {
              setClipIdx(idx);
              setPlaying(true);
            }}
            className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left ${
              idx === clipIdx ? 'border-blue-500 bg-blue-500/10' : cardBg
            }`}
          >
            <div>
              <div className="text-xs font-semibold">{c.title}</div>
              <div className={`text-[10px] ${muted}`}>{c.creator}</div>
            </div>
            <Play className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

/* ---------------- EMBEDDED LIVE WEBVIEW APP RUNTIME ---------------- */
const WebAppRuntime: React.FC<{
  apk: CustomApkApp;
  isOnline: boolean;
  darkTheme: boolean;
}> = ({ apk, isOnline, darkTheme }) => {
  const [url, setUrl] = useState(() => getInitialWebUrl(apk));
  const [inputUrl, setInputUrl] = useState(url);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    const onMessage = (ev: MessageEvent) => {
      const data = ev.data;
      if (data?.type === 'avd-chrome-nav' && typeof data.url === 'string') {
        setUrl(data.url);
        setInputUrl(data.url);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!isOnline) {
    return (
      <div className="p-6 text-center text-xs text-slate-400">
        Connect to Wi-Fi or Cellular to run {apk.name}.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = inputUrl.trim();
          if (!v) return;
          const next =
            v.startsWith('http://') || v.startsWith('https://')
              ? v
              : v.includes('.') && !v.includes(' ')
              ? `https://${v}`
              : `https://html.duckduckgo.com/html/?q=${encodeURIComponent(v)}`;
          setUrl(next);
          setInputUrl(next);
        }}
        className="px-2.5 py-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className={`flex-1 h-7 px-2.5 rounded-full text-[11px] border focus:outline-none ${
            darkTheme
              ? 'bg-slate-900 border-slate-800 text-slate-200'
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}
        />
        <button
          type="button"
          onClick={() => setNonce((n) => n + 1)}
          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Reload app view"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>
      </form>
      <iframe
        key={`${url}-${nonce}`}
        src={`/api/proxy?url=${encodeURIComponent(url)}&r=${nonce}`}
        title={apk.name}
        sandbox="allow-scripts allow-forms allow-popups"
        className="flex-1 w-full h-full border-0 bg-white"
      />
    </div>
  );
};

/* ---------------- ROOT RUNTIME WRAPPER ---------------- */
export const CustomApkRuntime: React.FC<CustomApkRuntimeProps> = ({
  apk,
  isOnline,
  darkTheme,
  gpsLabel = 'Orhuworun, Delta State',
  volume = 70,
  onOpenInChrome,
  onUninstall,
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const mode = classifyApkRuntime(apk);

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`h-full flex flex-col ${surface}`}>
      {/* Installed App Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <CustomApkIcon name={apk.name} iconUrl={apk.iconUrl} size={30} />
          <div className="min-w-0">
            <div className="text-xs font-bold truncate">{apk.name}</div>
            <div className={`text-[9px] font-mono-tabular truncate ${muted}`}>
              {apk.packageName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowInfo((s) => !s)}
            className={`p-1.5 rounded-full transition-colors ${
              showInfo
                ? 'bg-blue-600 text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="App Info & Manifest"
            aria-label="App Info"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUninstall(apk.packageName)}
            className="p-1.5 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Uninstall APK"
            aria-label={`Uninstall ${apk.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* App Body or App Info Overlay */}
      {showInfo ? (
        <div className="flex-1 overflow-y-auto phone-scroll p-4 space-y-4">
          <div className={`p-4 rounded-2xl border space-y-2 ${cardBg}`}>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span>Installed via APKPure</span>
              <span className="font-mono-tabular text-[#16A34A] dark:text-[#24CD77]">
                {apk.version} · {apk.sizeMb} MB
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${muted}`}>{apk.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onOpenInChrome(getInitialWebUrl(apk))}
              className="h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Open in Chrome</span>
            </button>

            <a
              href={`/api/apkpure/download?pkg=${encodeURIComponent(
                apk.packageName
              )}&name=${encodeURIComponent(apk.name)}&version=${encodeURIComponent(
                apk.version
              )}`}
              download={`${apk.packageName}.apk`}
              className={`h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 ${cardBg}`}
            >
              <HardDriveDownload className="w-3.5 h-3.5 text-[#24CD77]" />
              <span>Export .APK</span>
            </a>
          </div>

          <div className={`p-3.5 rounded-2xl border space-y-2 ${cardBg}`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#24CD77]" />
              <span>Package Manifest</span>
            </div>
            <div className={`text-[11px] font-mono-tabular space-y-1 ${muted}`}>
              <div>Package: {apk.packageName}</div>
              <div>Developer: {apk.developer}</div>
              <div>Runtime Mode: {mode.toUpperCase()}</div>
              <div className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                <span>System Volume: {volume}%</span>
              </div>
            </div>
            <a
              href={apk.apkpureUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16A34A] dark:text-[#24CD77] hover:underline pt-1"
            >
              <span>Open APKPure Listing</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      ) : mode === 'music' ? (
        <MusicAppRuntime
          apk={apk}
          isOnline={isOnline}
          darkTheme={darkTheme}
          volume={volume}
        />
      ) : mode === 'chat' ? (
        <ChatAppRuntime apk={apk} darkTheme={darkTheme} gpsLabel={gpsLabel} />
      ) : mode === 'video' ? (
        <VideoPlayerRuntime apk={apk} darkTheme={darkTheme} />
      ) : (
        <WebAppRuntime apk={apk} isOnline={isOnline} darkTheme={darkTheme} />
      )}
    </div>
  );
};
