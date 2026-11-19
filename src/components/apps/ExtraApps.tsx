import React, { useEffect, useRef, useState } from 'react';
import {
  Languages,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trash2,
} from 'lucide-react';
import { KeepNote } from '../../types/emulator';

/* ================= GOOGLE KEEP ================= */
export const KeepApp: React.FC<{
  notes: KeepNote[];
  onAddNote: (title: string, content: string, color: string) => void;
  onDeleteNote: (id: string) => void;
  darkTheme: boolean;
}> = ({ notes, onAddNote, onDeleteNote, darkTheme }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [adding, setAdding] = useState(false);

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`h-full flex flex-col relative ${surface}`}>
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-base font-semibold">Google Keep</span>
        <button
          onClick={() => setAdding((a) => !a)}
          className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Note</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-3">
        {adding && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim() && !content.trim()) return;
              onAddNote(title.trim() || 'Untitled note', content.trim(), '#FEF3C7');
              setTitle('');
              setContent('');
              setAdding(false);
            }}
            className={`p-3 rounded-2xl border space-y-2 ${cardBg}`}
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-transparent text-xs font-semibold focus:outline-none"
            />
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Take a note..."
              className="w-full bg-transparent text-xs resize-none focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="px-3 py-1 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {notes.map((n) => (
          <div
            key={n.id}
            style={{ backgroundColor: darkTheme ? undefined : n.color }}
            className={`p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 ${
              darkTheme ? 'bg-slate-900' : ''
            } space-y-1.5`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-xs font-semibold">{n.title}</div>
              <button
                onClick={() => onDeleteNote(n.id)}
                className="text-slate-400 hover:text-red-500"
                aria-label="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs whitespace-pre-line opacity-85 leading-relaxed">{n.content}</div>
            <div className={`text-[10px] ${muted}`}>{n.updatedAt}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= GOOGLE TRANSLATE ================= */
const PHRASEBOOK: Record<string, Record<string, string>> = {
  es: {
    hello: 'Hola',
    'thank you': 'Gracias',
    'where is the train station?': 'Donde esta la estacion de tren?',
    'good morning': 'Buenos dias',
  },
  fr: {
    hello: 'Bonjour',
    'thank you': 'Merci',
    'where is the train station?': 'Ou est la gare?',
    'good morning': 'Bonjour',
  },
  ja: {
    hello: 'Konnichiwa',
    'thank you': 'Arigato gozaimasu',
    'where is the train station?': 'Eki wa doko desu ka?',
    'good morning': 'Ohayo gozaimasu',
  },
  de: {
    hello: 'Hallo',
    'thank you': 'Danke schon',
    'where is the train station?': 'Wo ist der Bahnhof?',
    'good morning': 'Guten Morgen',
  },
};

export const TranslateApp: React.FC<{ darkTheme: boolean }> = ({ darkTheme }) => {
  const [targetLang, setTargetLang] = useState<'es' | 'fr' | 'ja' | 'de'>('es');
  const [input, setInput] = useState('Hello');
  const [liveTranslation, setLiveTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  useEffect(() => {
    const trimmed = input.trim();
    if (!trimmed) {
      setLiveTranslation('');
      return;
    }
    const timer = window.setTimeout(async () => {
      setTranslating(true);
      try {
        const r = await fetch(
          `/api/translate?text=${encodeURIComponent(trimmed)}&to=${targetLang}`
        );
        if (r.ok) {
          const data = (await r.json()) as { translatedText?: string };
          if (data.translatedText) {
            setLiveTranslation(data.translatedText);
            setTranslating(false);
            return;
          }
        }
      } catch {
        // fallback below
      }
      const normalized = trimmed.toLowerCase();
      setLiveTranslation(
        PHRASEBOOK[targetLang][normalized] || `[${targetLang.toUpperCase()}] ${trimmed}`
      );
      setTranslating(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [input, targetLang]);

  const normalized = input.trim().toLowerCase();
  const translated =
    liveTranslation ??
    (PHRASEBOOK[targetLang][normalized] ||
      (input.trim() ? `[${targetLang.toUpperCase()}] ${input.trim()}` : ''));

  return (
    <div className={`h-full flex flex-col p-4 space-y-4 ${surface}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600" />
          <span className="text-base font-semibold">Google Translate</span>
        </div>
        <span className={`text-[10px] ${muted}`}>
          {translating ? 'Translating...' : 'Online'}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {[
          { code: 'es' as const, label: 'Spanish' },
          { code: 'fr' as const, label: 'French' },
          { code: 'ja' as const, label: 'Japanese' },
          { code: 'de' as const, label: 'German' },
        ].map((lang) => (
          <button
            key={lang.code}
            onClick={() => setTargetLang(lang.code)}
            className={`py-2 rounded-xl text-[11px] font-medium border ${
              targetLang === lang.code ? 'bg-blue-600 text-white border-blue-600' : cardBg
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter English text"
        className={`w-full p-3 rounded-2xl border text-sm resize-none ${cardBg}`}
      />

      <div className="p-4 rounded-2xl bg-blue-600 text-white space-y-1">
        <div className="text-[11px] opacity-80 uppercase tracking-wider">{targetLang}</div>
        <div className="text-lg font-semibold">{translated || 'Translation'}</div>
      </div>

      <div className="space-y-1.5">
        <div className={`text-[11px] font-medium ${muted}`}>Quick Phrases</div>
        <div className="flex flex-wrap gap-1.5">
          {['Hello', 'Thank you', 'Good morning', 'Where is the train station?'].map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] ${cardBg}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================= GOOGLE DOCS ================= */
export const DocsApp: React.FC<{ darkTheme: boolean }> = ({ darkTheme }) => {
  const [title, setTitle] = useState('Emulator Release Notes');
  const [body, setBody] = useState(
    'Android 15 Virtual Device Verification\n\nAll core Google applications including Play Store, Chrome, Gmail, Maps, YouTube, and Photos are running smoothly on the Pixel 9 Pro profile.'
  );
  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <div className={`h-full flex flex-col ${surface}`}>
      <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-sm font-semibold bg-transparent focus:outline-none flex-1 mr-2"
        />
        <span className={`text-[11px] tabular-nums shrink-0 ${muted}`}>{words} words</span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="flex-1 p-4 bg-transparent text-xs leading-relaxed resize-none focus:outline-none"
      />
    </div>
  );
};

/* ================= YOUTUBE MUSIC (WEB AUDIO SYNTHESIZER) ================= */
const TRACKS = [
  { title: 'Silicon Valley Dawn', artist: 'Studio Ambient', freq: 220, chord: [220, 277.18, 329.63] },
  { title: 'Material Waves', artist: 'Pixel Soundscape', freq: 261.63, chord: [261.63, 329.63, 392.0] },
  { title: 'Late Night Compile', artist: 'Lo-Fi Synth', freq: 196, chord: [196, 246.94, 293.66] },
];

export const YouTubeMusicApp: React.FC = () => {
  const [trackIdx, setTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscsRef = useRef<OscillatorNode[]>([]);

  const stopAudio = () => {
    oscsRef.current.forEach((o) => {
      try {
        o.stop();
        o.disconnect();
      } catch {
        // ignore
      }
    });
    oscsRef.current = [];
  };

  useEffect(() => {
    if (!playing) {
      stopAudio();
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      stopAudio();
      const master = ctx.createGain();
      master.gain.value = 0.04;
      master.connect(ctx.destination);

      const chord = TRACKS[trackIdx].chord;
      oscsRef.current = chord.map((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        osc.connect(master);
        osc.start();
        return osc;
      });
    } catch {
      // AudioContext unavailable
    }
    return () => stopAudio();
  }, [playing, trackIdx]);

  const track = TRACKS[trackIdx];

  return (
    <div className="h-full flex flex-col justify-between p-5 bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white">
      <div className="text-xs font-semibold text-red-400">YouTube Music</div>

      <div className="space-y-5 text-center">
        <div className="w-44 h-44 mx-auto rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-slate-900 shadow-2xl flex items-center justify-center border border-white/10">
          <div className="flex items-end gap-1.5 h-16">
            {[0.4, 0.9, 0.6, 1, 0.5, 0.8].map((h, i) => (
              <div
                key={i}
                style={{ height: `${playing ? h * 100 : 25}%` }}
                className="w-2.5 rounded-full bg-white/90 transition-all duration-300"
              />
            ))}
          </div>
        </div>
        <div>
          <div className="text-base font-semibold">{track.title}</div>
          <div className="text-xs text-slate-400 mt-0.5">{track.artist}</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 pb-4">
        <button
          onClick={() => setTrackIdx((i) => (i - 1 + TRACKS.length) % TRACKS.length)}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/10"
          aria-label="Previous track"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button
          onClick={() => setTrackIdx((i) => (i + 1) % TRACKS.length)}
          className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-white/10"
          aria-label="Next track"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/* ================= GOOGLE EARTH ================= */
export const EarthApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rot, setRot] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = 115;

    const grad = ctx.createRadialGradient(cx - 35, cy - 35, 15, cx, cy, r);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(0.6, '#1d4ed8');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Latitude / Longitude wireframe
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy + i * 32, Math.sqrt(Math.max(100, r * r - i * 32 * i * 32)), 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Stylized continents rotating
    const cities = [
      { name: 'San Francisco', lon: 0.3, lat: -0.25 },
      { name: 'London', lon: 1.7, lat: -0.45 },
      { name: 'Tokyo', lon: 3.4, lat: -0.2 },
    ];
    cities.forEach((city) => {
      const a = city.lon + rot;
      const x = cx + Math.sin(a) * r * 0.85;
      const y = cy + city.lat * r;
      if (Math.cos(a) > -0.2) {
        ctx.fillStyle = '#34d399';
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '600 11px DM Sans, sans-serif';
        ctx.fillText(city.name, x + 8, y + 4);
      }
    });
  }, [rot]);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white p-4 justify-between">
      <div className="text-sm font-semibold">Google Earth</div>
      <canvas ref={canvasRef} width={320} height={360} className="w-full rounded-2xl" />
      <div className="space-y-2">
        <div className="text-xs text-slate-400">Rotate globe longitude</div>
        <input
          type="range"
          min={0}
          max={6.28}
          step={0.05}
          value={rot}
          onChange={(e) => setRot(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>
    </div>
  );
};

/* ================= BLOCK DASH MINI-GAME ================= */
export const BlockDashApp: React.FC = () => {
  const [targetIdx, setTargetIdx] = useState(5);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  const handleTap = (idx: number) => {
    if (idx === targetIdx) {
      const next = score + 10;
      setScore(next);
      if (next > best) setBest(next);
      setTargetIdx((t) => {
        let n = Math.floor(Math.random() * 16);
        if (n === t) n = (t + 3) % 16;
        return n;
      });
    } else {
      setScore(0);
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-4 bg-slate-950 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">Block Dash</div>
          <div className="text-[11px] text-slate-400">Tap the lit tile to score</div>
        </div>
        <button
          onClick={() => setScore(0)}
          className="p-2 rounded-full bg-slate-900 border border-slate-800"
          aria-label="Reset score"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center font-mono-tabular">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400">SCORE</div>
          <div className="text-xl font-bold text-sky-400">{score}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] text-slate-400">BEST</div>
          <div className="text-xl font-bold text-emerald-400">{best}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 my-auto">
        {Array.from({ length: 16 }, (_, i) => (
          <button
            key={i}
            onClick={() => handleTap(i)}
            className={`aspect-square rounded-2xl transition-transform active:scale-95 ${
              i === targetIdx
                ? 'bg-sky-400 shadow-lg shadow-sky-400/30'
                : 'bg-slate-900 border border-slate-800 hover:bg-slate-800'
            }`}
            aria-label={`Tile ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
