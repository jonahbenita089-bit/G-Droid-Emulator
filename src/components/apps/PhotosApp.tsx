import React, { useState } from 'react';
import { ArrowLeft, Film, Image as ImageIcon, Play, Pause, Sliders, Trash2 } from 'lucide-react';
import { MediaItem } from '../../types/emulator';
import { VideoRendererCanvas } from './VideoRendererCanvas';

interface PhotosAppProps {
  media: MediaItem[];
  onUpdateFilter: (id: string, filter: MediaItem['filter']) => void;
  onDeleteMedia: (id: string) => void;
  darkTheme: boolean;
}

export const PhotosApp: React.FC<PhotosAppProps> = ({
  media,
  onUpdateFilter,
  onDeleteMedia,
  darkTheme,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'videos'>('all');
  const [playingVideo, setPlayingVideo] = useState(true);

  const selected = media.find((m) => m.id === selectedId) || null;
  const visibleMedia =
    filterTab === 'videos' ? media.filter((m) => m.type === 'video') : media;

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  const getCssFilter = (f?: MediaItem['filter']) => {
    switch (f) {
      case 'vivid':
        return 'saturate(1.45) contrast(1.08)';
      case 'mono':
        return 'grayscale(1) contrast(1.1)';
      case 'warm':
        return 'sepia(0.35) saturate(1.2)';
      default:
        return 'none';
    }
  };

  if (selected) {
    return (
      <div className="h-full flex flex-col bg-black text-white">
        <div className="px-3 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10"
            aria-label="Back to library"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="text-center min-w-0 px-2">
            <div className="text-xs font-semibold truncate">{selected.title}</div>
            <div className="text-[10px] text-slate-400 truncate">
              {selected.dateLabel} · {selected.location}
            </div>
          </div>
          <button
            onClick={() => {
              onDeleteMedia(selected.id);
              setSelectedId(null);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/10 text-red-400"
            aria-label="Delete item"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-3 overflow-hidden relative">
          {selected.type === 'video' ? (
            selected.blobUrl ? (
              <video
                src={selected.blobUrl}
                controls
                autoPlay
                loop
                className="max-h-full w-full rounded-xl"
              />
            ) : (
              <div className="w-full relative rounded-xl overflow-hidden">
                <VideoRendererCanvas
                  preset={selected.videoPreset || 'waves'}
                  accent={selected.videoColor || '#1A73E8'}
                  playing={playingVideo}
                  progressSec={0}
                  title={selected.title}
                  className="w-full h-56 object-cover block"
                />
                <button
                  onClick={() => setPlayingVideo((p) => !p)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/60 flex items-center justify-center"
                >
                  {playingVideo ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
              </div>
            )
          ) : (
            <img
              src={selected.src}
              alt={selected.title}
              referrerPolicy="no-referrer"
              style={{ filter: getCssFilter(selected.filter) }}
              className="max-h-full max-w-full object-contain rounded-xl transition-all"
            />
          )}
        </div>

        {selected.type === 'photo' && (
          <div className="px-4 py-3 border-t border-white/10 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
              <Sliders className="w-3.5 h-3.5" />
              <span>Color Filter</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['original', 'vivid', 'mono', 'warm'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => onUpdateFilter(selected.id, f)}
                  className={`py-1.5 rounded-lg text-[11px] font-medium capitalize ${
                    (selected.filter || 'original') === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${surface}`}>
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <span className="text-base font-semibold tracking-tight">Google Photos</span>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
              filterTab === 'all' ? 'bg-white dark:bg-slate-800 shadow-sm' : muted
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterTab('videos')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium ${
              filterTab === 'videos' ? 'bg-white dark:bg-slate-800 shadow-sm' : muted
            }`}
          >
            Videos
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll p-3">
        {visibleMedia.length === 0 ? (
          <div className={`py-16 text-center text-xs ${muted} space-y-2`}>
            <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
            <div>No media items yet. Capture photos or record videos in Camera.</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {visibleMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedId(item.id);
                  setPlayingVideo(true);
                }}
                className="relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 cursor-pointer group bg-slate-900"
              >
                {item.type === 'video' ? (
                  item.blobUrl ? (
                    <video src={item.blobUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <VideoRendererCanvas
                      preset={item.videoPreset || 'waves'}
                      accent={item.videoColor || '#1A73E8'}
                      playing={false}
                      progressSec={1}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <img
                    src={item.src}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    style={{ filter: getCssFilter(item.filter) }}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                  <div className="flex items-center justify-between gap-1 text-white">
                    <span className="text-[10px] font-medium truncate">{item.title}</span>
                    {item.type === 'video' && <Film className="w-3 h-3 shrink-0" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
