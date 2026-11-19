import React from 'react';
import { Fingerprint, Lock } from 'lucide-react';
import { NotificationItem } from '../../types/emulator';
import { AppIcon } from '../icons/AppIcons';

interface LockScreenProps {
  timeText: string;
  dateText: string;
  notifications: NotificationItem[];
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  timeText,
  dateText,
  notifications,
  onUnlock,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between p-6 pt-14 pb-8 text-white bg-slate-950/35 backdrop-blur-sm">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs text-white/80 mb-2">
          <Lock className="w-3.5 h-3.5" />
          <span>Locked</span>
        </div>
        <div className="text-6xl font-semibold tracking-tight font-mono-tabular">{timeText}</div>
        <div className="text-sm font-medium text-white/90">{dateText}</div>
      </div>

      {notifications.length > 0 && (
        <div className="space-y-2 my-auto">
          {notifications.slice(0, 2).map((n) => (
            <div
              key={n.id}
              onClick={onUnlock}
              className="p-3 rounded-2xl bg-slate-900/75 backdrop-blur-md border border-white/15 flex items-center gap-3 cursor-pointer"
            >
              <AppIcon id={n.appId} size={30} />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate">{n.title}</div>
                <div className="text-[11px] text-white/75 truncate">{n.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onUnlock}
          className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Unlock with fingerprint"
        >
          <Fingerprint className="w-8 h-8 text-white" />
        </button>
        <span className="text-[11px] font-medium text-white/80">
          Tap fingerprint sensor to unlock
        </span>
      </div>
    </div>
  );
};
