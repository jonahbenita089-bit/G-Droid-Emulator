import React from 'react';
import {
  Battery,
  BatteryCharging,
  Bluetooth,
  MinusCircle,
  Plane,
  Radio,
  Signal,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { EmulatorSystemState } from '../../types/emulator';

interface StatusBarProps {
  timeText: string;
  system: EmulatorSystemState;
  lightText: boolean;
  onOpenShade: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  timeText,
  system,
  lightText,
  onOpenShade,
}) => {
  const textColor = lightText ? 'text-white' : 'text-slate-900';
  const netLabel = system.airplaneMode
    ? ''
    : system.networkProfile === '3g'
    ? '3G'
    : system.networkProfile === '4g'
    ? '4G'
    : system.networkProfile === '5g'
    ? '5G'
    : '';

  return (
    <button
      onClick={onOpenShade}
      className={`w-full h-8 px-5 flex items-center justify-between text-[11px] font-semibold select-none shrink-0 z-30 transition-colors ${textColor}`}
      aria-label="Open quick settings shade"
    >
      <div className="flex items-center gap-2 font-mono-tabular">
        <span>{timeText}</span>
        {system.screenRecording && (
          <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-semibold">
            REC
          </span>
        )}
      </div>

      {/* Camera punch-hole spacer */}
      <div className="w-5 h-5" />

      <div className="flex items-center gap-1.5">
        {system.dnd && <MinusCircle className="w-3 h-3" />}
        {system.hotspot && !system.airplaneMode && (
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
        )}
        {system.bluetooth && <Bluetooth className="w-3 h-3" />}
        {system.airplaneMode || system.networkProfile === 'offline' ? (
          <Plane className="w-3.5 h-3.5" />
        ) : (
          <>
            {system.wifi && system.networkProfile === 'wifi' ? (
              <Wifi className="w-3.5 h-3.5" />
            ) : !system.wifi && system.networkProfile === 'wifi' ? (
              <WifiOff className="w-3.5 h-3.5 opacity-60" />
            ) : null}
            {system.cellular && (
              <div className="flex items-center gap-0.5">
                {netLabel && <span className="text-[9px] font-mono-tabular">{netLabel}</span>}
                <Signal className="w-3.5 h-3.5" />
              </div>
            )}
          </>
        )}
        <div className="flex items-center gap-0.5 font-mono-tabular">
          {system.charging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Battery className="w-3.5 h-3.5" />
          )}
          <span className="text-[10px]">{system.battery}%</span>
        </div>
      </div>
    </button>
  );
};
