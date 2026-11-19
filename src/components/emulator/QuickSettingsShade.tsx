import React from 'react';
import {
  Bluetooth,
  ChevronUp,
  Flashlight,
  MinusCircle,
  Moon,
  Plane,
  Radio,
  Settings,
  Sun,
  Video,
  Wifi,
  X,
} from 'lucide-react';
import { AppId, EmulatorSystemState, NotificationItem } from '../../types/emulator';
import { AppIcon } from '../icons/AppIcons';

interface QuickSettingsShadeProps {
  system: EmulatorSystemState;
  notifications: NotificationItem[];
  onUpdateSystem: (patch: Partial<EmulatorSystemState>) => void;
  onDismissNotification: (id: string) => void;
  onOpenApp: (id: AppId) => void;
  onToggleScreenRecord: () => void;
  onClose: () => void;
}

export const QuickSettingsShade: React.FC<QuickSettingsShadeProps> = ({
  system,
  notifications,
  onUpdateSystem,
  onDismissNotification,
  onOpenApp,
  onToggleScreenRecord,
  onClose,
}) => {
  const tiles = [
    {
      label: 'Internet',
      sub: system.wifi ? 'Studio-5G' : 'Off',
      active: system.wifi && !system.airplaneMode,
      icon: Wifi,
      onClick: () => onUpdateSystem({ wifi: !system.wifi }),
    },
    {
      label: 'Hotspot',
      sub: system.hotspot && !system.airplaneMode ? `${system.hotspotSsid}` : 'Off',
      active: system.hotspot && !system.airplaneMode,
      icon: Radio,
      onClick: () =>
        onUpdateSystem({
          hotspot: !system.hotspot,
          airplaneMode: false,
          cellular: true,
        }),
    },
    {
      label: 'Bluetooth',
      sub: system.bluetooth ? 'On' : 'Off',
      active: system.bluetooth,
      icon: Bluetooth,
      onClick: () => onUpdateSystem({ bluetooth: !system.bluetooth }),
    },
    {
      label: 'Dark theme',
      sub: system.darkTheme ? 'On' : 'Off',
      active: system.darkTheme,
      icon: Moon,
      onClick: () => onUpdateSystem({ darkTheme: !system.darkTheme }),
    },
    {
      label: 'Flashlight',
      sub: system.flashlight ? 'On' : 'Off',
      active: system.flashlight,
      icon: Flashlight,
      onClick: () => onUpdateSystem({ flashlight: !system.flashlight }),
    },
    {
      label: 'Airplane',
      sub: system.airplaneMode ? 'On' : 'Off',
      active: system.airplaneMode,
      icon: Plane,
      onClick: () =>
        onUpdateSystem({
          airplaneMode: !system.airplaneMode,
          hotspot: !system.airplaneMode ? false : system.hotspot,
        }),
    },
    {
      label: 'Screen Rec',
      sub: system.screenRecording ? 'Recording' : 'Ready',
      active: system.screenRecording,
      icon: Video,
      onClick: onToggleScreenRecord,
    },
  ];

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-xl text-white flex flex-col p-4 pt-10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-300">Tue, Nov 18</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onClose();
              onOpenApp('settings');
            }}
            className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-slate-700"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdateSystem({ dnd: !system.dnd })}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              system.dnd ? 'bg-blue-600' : 'bg-slate-800'
            }`}
            aria-label="Do Not Disturb"
          >
            <MinusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Brightness Slider */}
      <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 mb-3">
        <Sun className="w-4 h-4 text-amber-400 shrink-0" />
        <input
          type="range"
          min={35}
          max={100}
          value={system.brightness}
          onChange={(e) => onUpdateSystem({ brightness: Number(e.target.value) })}
          className="flex-1 accent-blue-500 h-1.5"
          aria-label="Display brightness"
        />
        <span className="text-[11px] font-mono-tabular text-slate-300 w-8 text-right">
          {system.brightness}%
        </span>
      </div>

      {/* Quick Tiles */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <button
              key={tile.label}
              onClick={tile.onClick}
              className={`p-3 rounded-2xl flex items-center gap-2.5 text-left transition-colors ${
                tile.active
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{tile.label}</div>
                <div className="text-[10px] opacity-80 truncate">{tile.sub}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      <div className="flex-1 overflow-y-auto phone-scroll space-y-2">
        <div className="text-[11px] font-medium text-slate-400">Notifications</div>
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">No active notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                onClose();
                onOpenApp(n.appId);
              }}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-2.5 cursor-pointer hover:bg-slate-800/80"
            >
              <AppIcon id={n.appId} size={28} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{n.appName}</span>
                  <span>{n.time}</span>
                </div>
                <div className="text-xs font-semibold truncate">{n.title}</div>
                <div className="text-[11px] text-slate-300 line-clamp-2">{n.body}</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDismissNotification(n.id);
                }}
                className="p-1 text-slate-500 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={onClose}
        className="mt-2 py-2 flex items-center justify-center text-slate-400 hover:text-white"
        aria-label="Close quick settings"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
    </div>
  );
};
