import React from 'react';
import { X } from 'lucide-react';
import { AppDefinition, AppId } from '../../types/emulator';
import { AppIcon } from '../icons/AppIcons';

interface RecentsViewProps {
  recentApps: AppDefinition[];
  liveIconsMap?: Record<string, string>;
  onOpenApp: (id: AppId) => void;
  onCloseRecent: (id: AppId) => void;
  onClearAll: () => void;
  onDismiss: () => void;
}

export const RecentsView: React.FC<RecentsViewProps> = ({
  recentApps,
  liveIconsMap = {},
  onOpenApp,
  onCloseRecent,
  onClearAll,
  onDismiss,
}) => {
  return (
    <div
      onClick={onDismiss}
      className="absolute inset-0 z-30 bg-slate-950/85 backdrop-blur-lg flex flex-col justify-between p-4 pt-8"
    >
      <div className="flex items-center justify-between text-white">
        <span className="text-xs font-semibold">Recent apps</span>
        {recentApps.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClearAll();
            }}
            className="px-3 py-1 rounded-full bg-white/15 text-xs font-medium hover:bg-white/25"
          >
            Clear all
          </button>
        )}
      </div>

      {recentApps.length === 0 ? (
        <div className="text-center text-xs text-slate-400 my-auto">
          No recently opened apps
        </div>
      ) : (
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex-1 overflow-y-auto phone-scroll py-4 space-y-3"
        >
          {recentApps.map((app) => (
            <div
              key={app.id}
              onClick={() => onOpenApp(app.id)}
              className="p-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <AppIcon
                  id={app.id}
                  iconUrl={liveIconsMap[app.packageName]}
                  size={40}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{app.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{app.category} · Running</div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseRecent(app.id);
                }}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                aria-label={`Close ${app.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
