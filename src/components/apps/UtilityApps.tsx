import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BatteryCharging,
  Bluetooth,
  Delete,
  Moon,
  Pause,
  Phone,
  PhoneOff,
  Play,
  RotateCcw,
  Send,
  Sun,
  Trash2,
  Wifi,
} from 'lucide-react';
import {
  AndroidVersion,
  AppDefinition,
  AppId,
  EmulatorSystemState,
  GoogleAccount,
  SmsThread,
} from '../../types/emulator';
import { WALLPAPERS } from '../../data/appsCatalog';
import { AppIcon } from '../icons/AppIcons';

/* ================= PHONE APP ================= */
export const PhoneApp: React.FC<{ darkTheme: boolean }> = ({ darkTheme }) => {
  const [digits, setDigits] = useState('');
  const [inCallWith, setInCallWith] = useState<string | null>(null);
  const [callSec, setCallSec] = useState(0);

  useEffect(() => {
    if (!inCallWith) return;
    const t = window.setInterval(() => setCallSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [inCallWith]);

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const keyBg = darkTheme ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  if (inCallWith) {
    return (
      <div className="h-full flex flex-col items-center justify-between py-12 px-6 bg-slate-950 text-white">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 rounded-full bg-blue-600 mx-auto flex items-center justify-center text-2xl font-semibold">
            {inCallWith.charAt(0)}
          </div>
          <div className="text-lg font-semibold">{inCallWith}</div>
          <div className="text-xs text-slate-400 font-mono-tabular">
            0:{callSec.toString().padStart(2, '0')} · HD Voice
          </div>
        </div>
        <button
          onClick={() => {
            setInCallWith(null);
            setCallSec(0);
          }}
          className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg"
          aria-label="End call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col p-4 justify-between ${surface}`}>
      <div className="space-y-2">
        <div className={`text-[11px] font-medium ${muted}`}>Quick Contacts</div>
        <div className="flex gap-2 overflow-x-auto phone-scroll">
          {['Elena Vance', 'Marcus Chen', 'Support Desk'].map((c) => (
            <button
              key={c}
              onClick={() => {
                setCallSec(0);
                setInCallWith(c);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 border border-slate-200 dark:border-slate-800`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center py-2">
        <div className="text-2xl font-semibold tracking-wider font-mono-tabular min-h-[36px]">
          {digits || <span className={`text-sm font-normal ${muted}`}>Enter number</span>}
        </div>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
            <button
              key={k}
              onClick={() => setDigits((d) => (d.length < 14 ? d + k : d))}
              className={`h-12 rounded-2xl text-lg font-semibold font-mono-tabular transition-colors ${keyBg}`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6 pt-1">
          <div className="w-11" />
          <button
            onClick={() => {
              if (!digits) return;
              setCallSec(0);
              setInCallWith(digits);
            }}
            className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md hover:bg-emerald-700"
            aria-label="Place call"
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDigits((d) => d.slice(0, -1))}
            className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MESSAGES APP ================= */
export const MessagesApp: React.FC<{
  threads: SmsThread[];
  onSendMessage: (threadId: string, text: string) => void;
  darkTheme: boolean;
}> = ({ threads, onSendMessage, darkTheme }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const activeThread = threads.find((t) => t.id === activeId) || null;
  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  if (activeThread) {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <button
            onClick={() => setActiveId(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-semibold">{activeThread.contactName}</div>
            <div className={`text-[10px] font-mono-tabular ${muted}`}>{activeThread.phone}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-2.5">
          {activeThread.messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'me'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : darkTheme
                    ? 'bg-slate-800 text-slate-100 rounded-bl-sm'
                    : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                }`}
              >
                <div>{m.text}</div>
                <div className="text-[9px] opacity-70 mt-0.5 tabular-nums">{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            onSendMessage(activeThread.id, draft.trim());
            setDraft('');
          }}
          className="p-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Text message"
            className={`flex-1 px-3.5 h-10 rounded-full border text-xs ${cardBg}`}
          />
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0"
            aria-label="Send SMS"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${surface}`}>
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <span className="text-base font-semibold tracking-tight">Messages</span>
      </div>
      <div className="flex-1 overflow-y-auto phone-scroll divide-y divide-slate-200/60 dark:divide-slate-800">
        {threads.map((t) => {
          const last = t.messages[t.messages.length - 1];
          return (
            <div
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className="px-4 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {t.contactName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold truncate">{t.contactName}</span>
                  <span className={`text-[10px] tabular-nums ${muted}`}>{last?.time}</span>
                </div>
                <div className={`text-xs truncate ${muted}`}>{last?.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ================= CLOCK APP ================= */
export const ClockApp: React.FC<{
  darkTheme: boolean;
  gpsLabel?: string;
}> = ({ darkTheme, gpsLabel = 'Orhuworun, Delta State' }) => {
  const [tab, setTab] = useState<'world' | 'alarms' | 'stopwatch'>('world');
  const [alarms, setAlarms] = useState([
    { id: 'a1', time: '07:00', label: 'Morning Standup', enabled: true },
    { id: 'a2', time: '08:30', label: 'Daily Sync', enabled: false },
  ]);
  const [swMs, setSwMs] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    if (!swRunning) return;
    const t = window.setInterval(() => setSwMs((v) => v + 50), 50);
    return () => clearInterval(t);
  }, [swRunning]);

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  const formatSw = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centi = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centi
      .toString()
      .padStart(2, '0')}`;
  };

  const now = new Date();

  return (
    <div className={`h-full flex flex-col ${surface}`}>
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-base font-semibold">Clock</span>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg text-[11px]">
          {(['world', 'alarms', 'stopwatch'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium ${
                tab === t ? 'bg-white dark:bg-slate-800 shadow-sm' : muted
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll p-4">
        {tab === 'world' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl font-semibold font-mono-tabular">
                {now.toLocaleTimeString([], {
                  timeZone:
                    gpsLabel.toLowerCase().includes('orhuworun') ||
                    gpsLabel.toLowerCase().includes('delta') ||
                    gpsLabel.toLowerCase().includes('lagos') ||
                    gpsLabel.toLowerCase().includes('nigeria')
                      ? 'Africa/Lagos'
                      : undefined,
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
              <div className={`text-xs mt-1 ${muted}`}>
                {gpsLabel} ·{' '}
                {gpsLabel.toLowerCase().includes('orhuworun') ||
                gpsLabel.toLowerCase().includes('delta') ||
                gpsLabel.toLowerCase().includes('lagos') ||
                gpsLabel.toLowerCase().includes('nigeria')
                  ? 'WAT'
                  : 'Local'}
              </div>
            </div>
            <div className="space-y-2">
              {[
                { city: 'Lagos, Nigeria', tz: 'Africa/Lagos' },
                { city: 'London', tz: 'Europe/London' },
                { city: 'New York', tz: 'America/New_York' },
                { city: 'Tokyo', tz: 'Asia/Tokyo' },
              ].map((c) => (
                <div
                  key={c.city}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${cardBg}`}
                >
                  <span className="text-xs font-semibold">{c.city}</span>
                  <span className="text-sm font-semibold font-mono-tabular">
                    {now.toLocaleTimeString([], {
                      timeZone: c.tz,
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'alarms' && (
          <div className="space-y-2.5">
            {alarms.map((a) => (
              <div
                key={a.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${cardBg}`}
              >
                <div>
                  <div className="text-xl font-semibold font-mono-tabular">{a.time}</div>
                  <div className={`text-[11px] ${muted}`}>{a.label}</div>
                </div>
                <button
                  onClick={() =>
                    setAlarms((prev) =>
                      prev.map((item) =>
                        item.id === a.id ? { ...item, enabled: !item.enabled } : item
                      )
                    )
                  }
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                    a.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle alarm"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      a.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'stopwatch' && (
          <div className="flex flex-col items-center space-y-5 pt-4">
            <div className="text-4xl font-semibold font-mono-tabular">{formatSw(swMs)}</div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSwRunning((r) => !r)}
                className="h-11 px-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {swRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{swRunning ? 'Pause' : 'Start'}</span>
              </button>
              {swRunning ? (
                <button
                  onClick={() => setLaps((l) => [swMs, ...l])}
                  className={`h-11 px-4 rounded-full border text-xs font-semibold ${cardBg}`}
                >
                  Lap
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSwMs(0);
                    setLaps([]);
                  }}
                  className={`h-11 px-4 rounded-full border text-xs font-semibold flex items-center gap-1 ${cardBg}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
            {laps.length > 0 && (
              <div className="w-full space-y-1.5 pt-2">
                {laps.map((l, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 font-mono-tabular"
                  >
                    <span className={muted}>Lap {laps.length - idx}</span>
                    <span className="font-semibold">{formatSw(l)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { SettingsApp } from './SettingsApp';

