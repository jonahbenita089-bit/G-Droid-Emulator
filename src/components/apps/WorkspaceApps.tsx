import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  FileSpreadsheet,
  FileText,
  Folder,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Plus,
  Presentation,
  Search,
  Send,
  Star,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
import { CalendarEvent, DriveFile } from '../../types/emulator';
import { GoogleGLogo } from '../icons/AppIcons';
import { VideoRendererCanvas } from './VideoRendererCanvas';

/* ================= GOOGLE CALENDAR ================= */
interface CalendarAppProps {
  events: CalendarEvent[];
  onAddEvent: (ev: Omit<CalendarEvent, 'id'>) => void;
  darkTheme: boolean;
}

export const CalendarApp: React.FC<CalendarAppProps> = ({ events, onAddEvent, darkTheme }) => {
  const [selectedDay, setSelectedDay] = useState(18);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [location, setLocation] = useState('');

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  const daysInNov = Array.from({ length: 30 }, (_, i) => i + 1);
  const dayEvents = events.filter((e) => e.day === selectedDay);

  return (
    <div className={`h-full flex flex-col relative ${surface}`}>
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold">November 2026</span>
        </div>
        <button
          onClick={() => setSelectedDay(18)}
          className="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-medium"
        >
          Today
        </button>
      </div>

      {/* Month Grid */}
      <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className={`grid grid-cols-7 text-center text-[10px] font-medium mb-1.5 ${muted}`}>
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-center text-xs tabular-nums">
          {daysInNov.map((d) => {
            const hasEvent = events.some((e) => e.day === d);
            const active = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`h-8 w-8 mx-auto rounded-full flex flex-col items-center justify-center relative transition-colors ${
                  active
                    ? 'bg-blue-600 text-white font-semibold'
                    : d === 18
                    ? 'text-blue-600 font-semibold'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{d}</span>
                {hasEvent && !active && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 absolute bottom-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Schedule */}
      <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-2.5">
        <div className={`text-[11px] font-medium ${muted}`}>
          Schedule for November {selectedDay}
        </div>
        {dayEvents.length === 0 ? (
          <div className={`py-8 text-center text-xs ${muted}`}>
            No events scheduled. Tap New Event to add one.
          </div>
        ) : (
          dayEvents.map((ev) => (
            <div
              key={ev.id}
              className={`p-3 rounded-2xl border flex items-start gap-3 ${cardBg}`}
            >
              <span
                style={{ backgroundColor: ev.color }}
                className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{ev.title}</div>
                <div className={`text-[11px] tabular-nums mt-0.5 ${muted}`}>
                  {ev.startTime} - {ev.endTime} · {ev.location || 'No location'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setCreating(true)}
        className="absolute bottom-4 right-4 h-11 px-4 rounded-2xl bg-blue-600 text-white shadow-lg flex items-center gap-1.5 text-xs font-semibold"
      >
        <Plus className="w-4 h-4" />
        <span>Event</span>
      </button>

      {creating && (
        <div className={`absolute inset-0 z-20 p-4 flex flex-col ${surface}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm font-semibold">New Event · Nov {selectedDay}</span>
            <button onClick={() => setCreating(false)} aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              onAddEvent({
                title: title.trim(),
                day: selectedDay,
                startTime,
                endTime,
                location: location.trim() || 'Virtual',
                color: '#1A73E8',
              });
              setTitle('');
              setLocation('');
              setCreating(false);
            }}
            className="space-y-3 pt-4"
          >
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className={`w-full px-3 h-10 rounded-xl border text-xs ${cardBg}`}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`px-3 h-10 rounded-xl border text-xs tabular-nums ${cardBg}`}
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`px-3 h-10 rounded-xl border text-xs tabular-nums ${cardBg}`}
              />
            </div>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or Google Meet"
              className={`w-full px-3 h-10 rounded-xl border text-xs ${cardBg}`}
            />
            <button
              type="submit"
              className="w-full h-11 rounded-full bg-blue-600 text-white text-xs font-semibold"
            >
              Save Event
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

/* ================= GOOGLE DRIVE ================= */
interface DriveAppProps {
  files: DriveFile[];
  onAddFile: (name: string, type: DriveFile['type']) => void;
  onToggleStar: (id: string) => void;
  darkTheme: boolean;
}

export const DriveApp: React.FC<DriveAppProps> = ({
  files,
  onAddFile,
  onToggleStar,
  darkTheme,
}) => {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'starred'>('all');
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<DriveFile['type']>('doc');

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  const visible = files.filter((f) => {
    if (tab === 'starred' && !f.starred) return false;
    if (query.trim() && !f.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const renderFileIcon = (type: DriveFile['type']) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-5 h-5 text-slate-500" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'sheet':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case 'slide':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className={`h-full flex flex-col relative ${surface}`}>
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className={`flex items-center gap-2 px-3 h-10 rounded-full border ${cardBg}`}>
          <Search className={`w-4 h-4 ${muted}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in Drive"
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium ${
              tab === 'all' ? 'bg-blue-600 text-white' : muted
            }`}
          >
            My Drive
          </button>
          <button
            onClick={() => setTab('starred')}
            className={`px-3 py-1 rounded-lg text-[11px] font-medium ${
              tab === 'starred' ? 'bg-blue-600 text-white' : muted
            }`}
          >
            Starred
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll divide-y divide-slate-200/60 dark:divide-slate-800">
        {visible.map((file) => (
          <div
            key={file.id}
            onClick={() => setPreviewFile(file)}
            className="px-3.5 py-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            {renderFileIcon(file.type)}
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{file.name}</div>
              <div className={`text-[11px] tabular-nums ${muted}`}>
                Modified {file.modified} · {file.size}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(file.id);
              }}
              aria-label="Star file"
            >
              <Star
                className={`w-4 h-4 ${
                  file.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => setCreating(true)}
        className="absolute bottom-4 right-4 h-11 px-4 rounded-2xl bg-blue-600 text-white shadow-lg flex items-center gap-1.5 text-xs font-semibold"
      >
        <Plus className="w-4 h-4" />
        <span>New</span>
      </button>

      {previewFile && (
        <div className={`absolute inset-0 z-20 p-4 flex flex-col ${surface}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm font-semibold truncate">{previewFile.name}</span>
            <button onClick={() => setPreviewFile(null)} aria-label="Close preview">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pt-4 text-xs leading-relaxed whitespace-pre-line">
            {previewFile.content || `Folder "${previewFile.name}" synced with Google Drive cloud storage.`}
          </div>
        </div>
      )}

      {creating && (
        <div className={`absolute inset-0 z-20 p-4 flex flex-col ${surface}`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <span className="text-sm font-semibold">Create in Drive</span>
            <button onClick={() => setCreating(false)} aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              onAddFile(newName.trim(), newType);
              setNewName('');
              setCreating(false);
            }}
            className="space-y-3 pt-4"
          >
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Document or folder name"
              className={`w-full px-3 h-10 rounded-xl border text-xs ${cardBg}`}
            />
            <div className="grid grid-cols-3 gap-2">
              {(['doc', 'sheet', 'folder'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setNewType(t)}
                  className={`py-2 rounded-lg text-xs font-medium capitalize border ${
                    newType === t ? 'bg-blue-600 text-white border-blue-600' : cardBg
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-full bg-blue-600 text-white text-xs font-semibold"
            >
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

/* ================= GOOGLE MEET ================= */
export const MeetApp: React.FC<{ darkTheme: boolean }> = ({ darkTheme }) => {
  const [inCall, setInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([
    { sender: 'Elena Vance', text: 'Audio and 1080p stream look crisp from Pixel AVD.' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [meetingCode, setMeetingCode] = useState('pxl-avd-942');

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  if (inCall) {
    return (
      <div className="h-full flex flex-col bg-slate-950 text-white relative">
        <div className="px-3.5 py-2.5 flex items-center justify-between text-xs border-b border-white/10">
          <span className="font-mono-tabular font-medium">{meetingCode}</span>
          <span className="text-emerald-400 text-[11px] font-medium">3 participants</span>
        </div>

        <div className="flex-1 p-3 grid grid-rows-2 gap-2.5">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
            <VideoRendererCanvas
              preset="aurora"
              accent="#0F9D58"
              playing={true}
              progressSec={0}
              className="w-full h-full object-cover block"
            />
            <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded bg-black/60 text-[11px] font-medium">
              Elena Vance
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
              {camOn ? (
                <VideoRendererCanvas
                  preset="waves"
                  accent="#1A73E8"
                  playing={true}
                  progressSec={2}
                  className="w-full h-full object-cover block"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                  J
                </div>
              )}
              <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-black/60 text-[10px] font-medium">
                You {!micOn && '(Muted)'}
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-700 flex items-center justify-center text-sm font-bold">
                M
              </div>
              <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded bg-black/60 text-[10px] font-medium">
                Marcus Chen
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3.5 border-t border-white/10 flex items-center justify-center gap-4">
          <button
            onClick={() => setMicOn((m) => !m)}
            className={`w-11 h-11 rounded-full flex items-center justify-center ${
              micOn ? 'bg-slate-800' : 'bg-red-600'
            }`}
            aria-label="Toggle microphone"
          >
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setCamOn((c) => !c)}
            className={`w-11 h-11 rounded-full flex items-center justify-center ${
              camOn ? 'bg-slate-800' : 'bg-red-600'
            }`}
            aria-label="Toggle camera"
          >
            {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setShowChat((s) => !s)}
            className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center"
            aria-label="Toggle meeting chat"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setInCall(false)}
            className="w-12 h-11 rounded-full bg-red-600 flex items-center justify-center"
            aria-label="Leave call"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>

        {showChat && (
          <div className="absolute inset-x-0 bottom-16 top-12 bg-slate-900/95 backdrop-blur-md p-3.5 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-semibold">In-call messages</span>
              <button onClick={() => setShowChat(false)} aria-label="Close chat">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {chatMsgs.map((m, i) => (
                <div key={i} className="text-xs space-y-0.5">
                  <div className="font-semibold text-blue-400">{m.sender}</div>
                  <div className="text-slate-200">{m.text}</div>
                </div>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                setChatMsgs((prev) => [...prev, { sender: 'You', text: chatInput.trim() }]);
                setChatInput('');
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Send message to call"
                className="flex-1 px-3 h-9 rounded-full bg-slate-800 text-xs focus:outline-none"
              />
              <button type="submit" className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col p-4 space-y-5 ${surface}`}>
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold tracking-tight">Google Meet</span>
      </div>

      <div className={`p-4 rounded-2xl border space-y-3 ${cardBg}`}>
        <div className="text-sm font-semibold">Start or join a video meeting</div>
        <p className={`text-xs leading-relaxed ${muted}`}>
          Connect with HD video tiles, microphone controls, and live in-call chat.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setInCall(true)}
            className="flex-1 h-10 rounded-full bg-blue-600 text-white text-xs font-semibold"
          >
            New meeting
          </button>
          <button
            onClick={() => setMeetingCode(`pxl-${Math.floor(100 + Math.random() * 900)}`)}
            className="px-3.5 h-10 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold"
          >
            New code
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium">Join with code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={meetingCode}
            onChange={(e) => setMeetingCode(e.target.value)}
            className={`flex-1 px-3 h-10 rounded-xl border text-xs font-mono-tabular ${cardBg}`}
          />
          <button
            onClick={() => setInCall(true)}
            className="px-4 h-10 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= GOOGLE SEARCH APP ================= */
export const GoogleSearchApp: React.FC<{
  darkTheme: boolean;
  liveTempF?: number;
  gpsLabel?: string;
  isOnline?: boolean;
  onSearchInChrome: (q: string) => void;
}> = ({
  darkTheme,
  liveTempF = 84,
  gpsLabel = 'Orhuworun, Delta State',
  isOnline = true,
  onSearchInChrome,
}) => {
  const [query, setQuery] = useState('');
  const [headlines, setHeadlines] = useState<string[]>([
    `${gpsLabel} weather today`,
    'Android 15 Material You features',
    'Wikipedia: Linux kernel',
    'Pixel 9 Pro camera specs',
  ]);

  React.useEffect(() => {
    if (!isOnline) return;
    fetch('/api/news')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.stories?.length) {
          setHeadlines(d.stories.slice(0, 5).map((s: { title: string }) => s.title));
        }
      })
      .catch(() => {});
  }, [isOnline]);

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`h-full flex flex-col p-4 space-y-5 overflow-y-auto phone-scroll ${surface}`}>
      <div className="pt-4 flex items-center justify-center gap-2">
        <GoogleGLogo size={26} />
        <span className="text-2xl font-semibold tracking-tight">Google</span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) onSearchInChrome(query.trim());
        }}
        className={`flex items-center gap-2 px-3.5 h-11 rounded-full border ${cardBg}`}
      >
        <Search className={`w-4 h-4 ${muted}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the live web"
          className="flex-1 bg-transparent text-xs focus:outline-none"
        />
      </form>

      <div className="grid grid-cols-2 gap-2.5">
        <div className={`p-3 rounded-2xl border ${cardBg}`}>
          <div className={`text-[10px] ${muted}`}>Live Weather</div>
          <div className="text-lg font-semibold tabular-nums mt-0.5">{liveTempF}°F</div>
          <div className={`text-[11px] truncate ${muted}`}>{gpsLabel}</div>
        </div>
        <div className={`p-3 rounded-2xl border ${cardBg}`}>
          <div className={`text-[10px] ${muted}`}>Connection</div>
          <div className="text-xs font-semibold mt-1 truncate">
            {isOnline ? 'Free Internet' : 'Offline'}
          </div>
          <div className={`text-[11px] ${muted}`}>Unlimited Data</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className={`text-[11px] font-medium ${muted}`}>Live Web Topics</div>
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {headlines.map((topic) => (
            <button
              key={topic}
              onClick={() => onSearchInChrome(topic)}
              className="w-full py-2.5 text-left text-xs font-medium flex items-center justify-between gap-2 hover:text-blue-600"
            >
              <span className="line-clamp-1">{topic}</span>
              <Search className={`w-3.5 h-3.5 shrink-0 ${muted}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
