import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Film,
  Home,
  MessageSquare,
  Pause,
  Play,
  PlusSquare,
  Search,
  ThumbsUp,
  Video,
} from 'lucide-react';
import { YouTubeVideo } from '../../types/emulator';
import { VideoRendererCanvas } from './VideoRendererCanvas';

interface YouTubeAppProps {
  videos: YouTubeVideo[];
  onCreateVideo: (video: Omit<YouTubeVideo, 'id' | 'views' | 'published' | 'likes'>) => void;
  darkTheme: boolean;
}

export const YouTubeApp: React.FC<YouTubeAppProps> = ({ videos, onCreateVideo, darkTheme }) => {
  const [tab, setTab] = useState<'home' | 'shorts' | 'create'>('home');
  const [query, setQuery] = useState('');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [subscribedChannels, setSubscribedChannels] = useState<string[]>([]);
  const [commentsMap, setCommentsMap] = useState<Record<string, string[]>>({
    yt1: ['Smooth 60fps rendering on Pixel 9 Pro.', 'Clean Material You layout transitions.'],
  });
  const [commentInput, setCommentInput] = useState('');

  // Video Creator Studio form state
  const [newTitle, setNewTitle] = useState('');
  const [newPreset, setNewPreset] = useState<YouTubeVideo['preset']>('waves');
  const [newAccent, setNewAccent] = useState('#1A73E8');
  const [newDuration, setNewDuration] = useState(15);
  const [newDesc, setNewDesc] = useState('');

  const activeVideo = videos.find((v) => v.id === activeVideoId) || null;

  useEffect(() => {
    if (!activeVideo || !playing) return;
    const timer = window.setInterval(() => {
      setProgress((prev) => (prev + 1 > activeVideo.durationSec ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeVideo, playing]);

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (activeVideo) {
    const isLiked = likedIds.includes(activeVideo.id);
    const isSubbed = subscribedChannels.includes(activeVideo.channel);
    const comments = commentsMap[activeVideo.id] || [];

    return (
      <div className={`h-full flex flex-col ${surface}`}>
        {/* Video Player Viewport */}
        <div className="relative bg-black shrink-0">
          <VideoRendererCanvas
            preset={activeVideo.preset}
            accent={activeVideo.accent}
            playing={playing}
            progressSec={progress}
            title={activeVideo.title}
            className="w-full h-48 object-cover block"
          />
          <button
            onClick={() => setActiveVideoId(null)}
            className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
            aria-label="Close player"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setPlaying((p) => !p)}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>

          <div className="px-3 py-1.5 bg-black/80 flex items-center gap-2 text-[10px] text-white tabular-nums">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min={0}
              max={activeVideo.durationSec}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="flex-1 accent-red-600 h-1"
            />
            <span>{formatTime(activeVideo.durationSec)}</span>
          </div>
        </div>

        {/* Metadata & Comments */}
        <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold leading-snug">{activeVideo.title}</h2>
            <p className={`text-[11px] mt-1 ${muted}`}>
              {activeVideo.views} · {activeVideo.published}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {activeVideo.channel.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{activeVideo.channel}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  setLikedIds((prev) =>
                    prev.includes(activeVideo.id)
                      ? prev.filter((id) => id !== activeVideo.id)
                      : [...prev, activeVideo.id]
                  )
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${
                  isLiked
                    ? 'bg-red-50 dark:bg-red-950 border-red-300 text-red-600'
                    : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="tabular-nums">
                  {activeVideo.likes + (isLiked ? 1 : 0)}
                </span>
              </button>
              <button
                onClick={() =>
                  setSubscribedChannels((prev) =>
                    prev.includes(activeVideo.channel)
                      ? prev.filter((c) => c !== activeVideo.channel)
                      : [...prev, activeVideo.channel]
                  )
                }
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isSubbed
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    : 'bg-red-600 text-white'
                }`}
              >
                {isSubbed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          </div>

          <p className={`text-xs leading-relaxed ${muted}`}>{activeVideo.description}</p>

          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comments ({comments.length})</span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!commentInput.trim()) return;
                setCommentsMap((prev) => ({
                  ...prev,
                  [activeVideo.id]: [...(prev[activeVideo.id] || []), commentInput.trim()],
                }));
                setCommentInput('');
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
                className={`flex-1 px-3 h-9 rounded-full border text-xs bg-transparent ${cardBg}`}
              />
              <button
                type="submit"
                className="px-3 h-9 rounded-full bg-red-600 text-white text-xs font-semibold"
              >
                Post
              </button>
            </form>

            <div className="space-y-2">
              {comments.map((c, idx) => (
                <div key={idx} className={`p-2.5 rounded-xl border text-xs ${cardBg}`}>
                  <div className="font-semibold text-[11px] mb-0.5">Jonah Benita</div>
                  <div className={muted}>{c}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredVideos = videos.filter((v) => {
    if (tab === 'shorts' && !v.isShort) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return v.title.toLowerCase().includes(q) || v.channel.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className={`h-full flex flex-col ${surface}`}>
      {/* Header */}
      <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-4 rounded bg-red-600 flex items-center justify-center">
            <Play className="w-2.5 h-2.5 fill-white text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">YouTube</span>
        </div>
        <div className={`flex-1 flex items-center gap-1.5 px-2.5 h-8 rounded-full border ${cardBg}`}>
          <Search className={`w-3.5 h-3.5 ${muted}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos"
            className="w-full bg-transparent text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto phone-scroll p-3.5 space-y-4">
        {tab === 'create' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim()) return;
              onCreateVideo({
                title: newTitle.trim(),
                channel: 'Jonah Studio',
                durationSec: newDuration,
                preset: newPreset,
                accent: newAccent,
                description:
                  newDesc.trim() || 'Generated inside Android YouTube Video Studio.',
              });
              setNewTitle('');
              setNewDesc('');
              setTab('home');
            }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-sm font-semibold">Create Video</h2>
              <p className={`text-xs mt-0.5 ${muted}`}>
                Compose an animated video clip and publish it to YouTube and Google Photos.
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <VideoRendererCanvas
                preset={newPreset}
                accent={newAccent}
                playing={true}
                progressSec={0}
                title={newTitle || 'Live Video Preview'}
                className="w-full h-40 object-cover block"
              />
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-medium mb-1">Video Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Morning Bay Area Motion Study"
                  className={`w-full px-3 h-10 rounded-xl border text-xs ${cardBg}`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1">Visual Motion Preset</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['waves', 'aurora', 'kinetic', 'orbit'] as const).map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setNewPreset(preset)}
                      className={`py-2 rounded-lg text-[11px] font-medium capitalize border ${
                        newPreset === preset
                          ? 'bg-red-600 text-white border-red-600'
                          : `${cardBg}`
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium mb-1">Color Mood</label>
                  <div className="flex items-center gap-2 h-10">
                    {['#1A73E8', '#0EA5E9', '#10B981', '#D97706', '#6366F1'].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setNewAccent(c)}
                        style={{ backgroundColor: c }}
                        className={`w-6 h-6 rounded-full ${
                          newAccent === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white' : ''
                        }`}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium mb-1">
                    Duration ({newDuration}s)
                  </label>
                  <input
                    type="range"
                    min={8}
                    max={45}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full h-10 accent-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Optional video notes..."
                  className={`w-full p-2.5 rounded-xl border text-xs resize-none ${cardBg}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
            >
              Publish Video
            </button>
          </form>
        ) : (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              onClick={() => {
                setActiveVideoId(video.id);
                setProgress(0);
                setPlaying(true);
              }}
              className="cursor-pointer space-y-2 group"
            >
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <VideoRendererCanvas
                  preset={video.preset}
                  accent={video.accent}
                  playing={false}
                  progressSec={2}
                  className="w-full h-40 object-cover block"
                />
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-medium tabular-nums">
                  {formatTime(video.durationSec)}
                </span>
              </div>
              <div className="flex items-start gap-2.5 px-0.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                  {video.channel.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-snug line-clamp-2">
                    {video.title}
                  </div>
                  <div className={`text-[11px] mt-0.5 ${muted}`}>
                    {video.channel} · {video.views} · {video.published}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="grid grid-cols-3 border-t border-slate-200 dark:border-slate-800 h-14 shrink-0">
        {[
          { id: 'home' as const, label: 'Home', icon: Home },
          { id: 'shorts' as const, label: 'Shorts', icon: Film },
          { id: 'create' as const, label: 'Create Video', icon: PlusSquare },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
                active ? 'text-red-600 font-semibold' : muted
              }`}
            >
              {item.id === 'create' ? <Video className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
