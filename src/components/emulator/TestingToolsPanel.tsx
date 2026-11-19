import React, { useState } from 'react';
import {
  Activity,
  Camera,
  Download,
  Terminal,
  Trash2,
  Video,
  Zap,
} from 'lucide-react';
import { AppId, LogEntry, MediaItem } from '../../types/emulator';

interface TestingToolsPanelProps {
  activeAppId: AppId | null;
  activeCustomPkg?: string | null;
  androidVersion: string;
  cpuHistory: number[];
  memHistory: number[];
  logs: LogEntry[];
  media: MediaItem[];
  screenRecording: boolean;
  onClearLogs: () => void;
  onTriggerGc: () => void;
  onTriggerStress: () => void;
  onTakeScreenshot: () => void;
  onToggleScreenRecord: () => void;
  onOpenPhotos: () => void;
}

const PACKAGE_MAP: Record<AppId, string> = {
  playstore: 'com.android.vending',
  apkpure: 'com.apkpure.aegon',
  chrome: 'com.android.chrome',
  gmail: 'com.google.android.gm',
  maps: 'com.google.android.apps.maps',
  youtube: 'com.google.android.youtube',
  photos: 'com.google.android.apps.photos',
  calendar: 'com.google.android.calendar',
  drive: 'com.google.android.apps.docs',
  meet: 'com.google.android.apps.meetings',
  search: 'com.google.android.googlequicksearchbox',
  camera: 'com.google.android.GoogleCamera',
  phone: 'com.google.android.dialer',
  messages: 'com.google.android.apps.messaging',
  clock: 'com.google.android.deskclock',
  settings: 'com.android.settings',
  keep: 'com.google.android.keep',
  docs: 'com.google.android.apps.docs.editors.docs',
  translate: 'com.google.android.apps.translate',
  ytmusic: 'com.google.android.apps.youtube.music',
  earth: 'com.google.earth',
  blockdash: 'com.pixelarcade.blockdash',
};

const Sparkline: React.FC<{ data: number[]; max: number; stroke: string }> = ({
  data,
  max,
  stroke,
}) => {
  const width = 260;
  const height = 44;
  const points = data
    .map((val, idx) => {
      const x = (idx / Math.max(1, data.length - 1)) * width;
      const y = height - Math.min(1, Math.max(0, val / max)) * (height - 6) - 3;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-11 overflow-visible">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export const TestingToolsPanel: React.FC<TestingToolsPanelProps> = ({
  activeAppId,
  activeCustomPkg,
  androidVersion,
  cpuHistory,
  memHistory,
  logs,
  media,
  screenRecording,
  onClearLogs,
  onTriggerGc,
  onTriggerStress,
  onTakeScreenshot,
  onToggleScreenRecord,
  onOpenPhotos,
}) => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | LogEntry['level']>('ALL');
  const [logQuery, setLogQuery] = useState('');

  const latestCpu = cpuHistory[cpuHistory.length - 1] ?? 12;
  const latestMem = memHistory[memHistory.length - 1] ?? 640;

  const filteredLogs = logs.filter((l) => {
    if (levelFilter !== 'ALL' && l.level !== levelFilter) return false;
    if (logQuery.trim()) {
      const q = logQuery.toLowerCase();
      return (
        l.tag.toLowerCase().includes(q) ||
        l.message.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const fgPackage = activeCustomPkg
    ? activeCustomPkg
    : activeAppId
    ? PACKAGE_MAP[activeAppId]
    : 'com.google.android.apps.nexuslauncher';

  const recentCaptures = media.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Performance Profiler */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Performance Profiler
            </h3>
          </div>
          <span className="text-[11px] font-mono-tabular text-slate-500 dark:text-slate-400">
            API {androidVersion}
          </span>
        </div>

        <div className="text-[11px] font-mono-tabular text-slate-600 dark:text-slate-300 truncate bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
          Process: {fgPackage}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>CPU</span>
              <span className="font-mono-tabular font-semibold text-blue-600 dark:text-blue-400">
                {latestCpu}%
              </span>
            </div>
            <Sparkline data={cpuHistory} max={100} stroke="#2563eb" />
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>RAM Heap</span>
              <span className="font-mono-tabular font-semibold text-emerald-600 dark:text-emerald-400">
                {latestMem} MB
              </span>
            </div>
            <Sparkline data={memHistory} max={2048} stroke="#059669" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onTriggerGc}
            className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Force GC
          </button>
          <button
            onClick={onTriggerStress}
            className="h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-medium flex items-center justify-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Zap className="w-3 h-3 text-amber-500" />
            <span>CPU Burst</span>
          </button>
        </div>
      </div>

      {/* Debugger / Logcat */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
              Logcat Debugger
            </h3>
          </div>
          <button
            onClick={onClearLogs}
            className="text-[11px] text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={`px-2 py-1 rounded-md text-[10px] font-mono-tabular font-semibold ${
                levelFilter === lvl
                  ? 'bg-slate-900 dark:bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={logQuery}
          onChange={(e) => setLogQuery(e.target.value)}
          placeholder="Filter tag or message..."
          className="w-full px-2.5 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-[11px] focus:outline-none"
        />

        <div className="h-36 overflow-y-auto bg-slate-950 text-slate-200 rounded-xl p-2.5 font-mono-tabular text-[10px] space-y-1.5">
          {filteredLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">No log entries match filter</div>
          ) : (
            filteredLogs.map((l) => (
              <div key={l.id} className="leading-snug break-words">
                <span className="text-slate-500">{l.time}</span>{' '}
                <span
                  className={
                    l.level === 'ERROR'
                      ? 'text-red-400 font-semibold'
                      : l.level === 'WARN'
                      ? 'text-amber-400 font-semibold'
                      : 'text-emerald-400 font-semibold'
                  }
                >
                  {l.level[0]}/{l.tag}
                </span>
                : {l.message}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Screen Capture & Activity Recording */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">
            Capture & Screen Record
          </h3>
          <button
            onClick={onOpenPhotos}
            className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            View in Photos
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onTakeScreenshot}
            className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Screenshot</span>
          </button>
          <button
            onClick={onToggleScreenRecord}
            className={`h-9 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${
              screenRecording
                ? 'bg-red-600 border-red-600 text-white'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>{screenRecording ? 'Stop Rec' : 'Record Screen'}</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {recentCaptures.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 text-[11px]"
            >
              <div className="min-w-0">
                <div className="font-medium truncate text-slate-800 dark:text-slate-200">
                  {item.title}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {item.type === 'video' ? `Video · ${item.durationSec ?? 5}s` : 'Image'} · {item.dateLabel}
                </div>
              </div>
              {item.src && (
                <a
                  href={item.src}
                  download={`${item.title.replace(/\s+/g, '_').toLowerCase()}.jpg`}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                  title="Download PNG/JPEG"
                  aria-label="Download capture"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
              {item.blobUrl && (
                <a
                  href={item.blobUrl}
                  download={`${item.title.replace(/\s+/g, '_').toLowerCase()}.webm`}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                  title="Download WebM Video"
                  aria-label="Download video"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
