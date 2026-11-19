import React from 'react';
import {
  Camera,
  ChevronLeft,
  Circle,
  Lock,
  Power,
  Radio,
  RefreshCw,
  RotateCw,
  Square,
  Unlock,
  Video,
  Volume1,
  Volume2,
} from 'lucide-react';
import { ResolutionPreset } from '../../types/emulator';

interface PhoneChassisProps {
  landscape: boolean;
  locked: boolean;
  booting?: boolean;
  hotspotActive?: boolean;
  resolution: ResolutionPreset;
  brightness: number;
  flashlight: boolean;
  volumeHudVisible: boolean;
  volume: number;
  darkNavBar: boolean;
  screenRecording: boolean;
  onPressPower: () => void;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onRotate: () => void;
  onScreenshot: () => void;
  onToggleRecord: () => void;
  onToggleHotspot?: () => void;
  onReboot?: () => void;
  onNavBack: () => void;
  onNavHome: () => void;
  onNavRecents: () => void;
  children: React.ReactNode;
}

const RESOLUTION_DIMENSIONS: Record<
  ResolutionPreset,
  { portraitW: string; portraitH: string; landscapeW: string; landscapeH: string }
> = {
  compact: {
    portraitW: 'w-[318px] max-w-full',
    portraitH: 'h-[min(630px,calc(100vh-148px))] min-h-[520px]',
    landscapeW: 'w-[min(600px,calc(100vw-120px))]',
    landscapeH: 'h-[324px]',
  },
  standard: {
    portraitW: 'w-[356px] max-w-full',
    portraitH: 'h-[min(710px,calc(100vh-148px))] min-h-[560px]',
    landscapeW: 'w-[min(680px,calc(100vw-120px))]',
    landscapeH: 'h-[368px]',
  },
  qhd: {
    portraitW: 'w-[388px] max-w-full',
    portraitH: 'h-[min(750px,calc(100vh-148px))] min-h-[580px]',
    landscapeW: 'w-[min(730px,calc(100vw-120px))]',
    landscapeH: 'h-[396px]',
  },
  tablet: {
    portraitW: 'w-[500px] max-w-full',
    portraitH: 'h-[min(680px,calc(100vh-148px))] min-h-[540px]',
    landscapeW: 'w-[min(740px,calc(100vw-120px))]',
    landscapeH: 'h-[480px]',
  },
};

export const PhoneChassis: React.FC<PhoneChassisProps> = ({
  landscape,
  locked,
  booting = false,
  hotspotActive = false,
  resolution,
  brightness,
  flashlight,
  volumeHudVisible,
  volume,
  darkNavBar,
  screenRecording,
  onPressPower,
  onVolumeUp,
  onVolumeDown,
  onRotate,
  onScreenshot,
  onToggleRecord,
  onToggleHotspot,
  onReboot,
  onNavBack,
  onNavHome,
  onNavRecents,
  children,
}) => {
  const dims = RESOLUTION_DIMENSIONS[resolution] || RESOLUTION_DIMENSIONS.standard;
  const frameWidth = landscape ? dims.landscapeW : dims.portraitW;
  const frameHeight = landscape ? dims.landscapeH : dims.portraitH;

  return (
    <div className="relative flex items-center justify-center gap-4 select-none">
      {/* Device Hardware Frame */}
      <div className="relative flex items-center justify-center">
        {/* Hardware Side Buttons (Portrait Right Edge) */}
        {!landscape && (
          <div className="absolute -right-[6px] top-32 flex flex-col gap-2.5 z-10">
            <button
              onClick={onPressPower}
              title="Power / Lock Screen"
              aria-label="Hardware Power Button"
              className="w-[5px] h-12 rounded-r-md bg-slate-700 hover:bg-slate-500 active:translate-x-[-1px] transition-all"
            />
            <div className="flex flex-col gap-1.5 mt-2">
              <button
                onClick={onVolumeUp}
                title="Volume Up"
                aria-label="Hardware Volume Up"
                className="w-[5px] h-10 rounded-r-md bg-slate-700 hover:bg-slate-500 active:translate-x-[-1px] transition-all"
              />
              <button
                onClick={onVolumeDown}
                title="Volume Down"
                aria-label="Hardware Volume Down"
                className="w-[5px] h-10 rounded-r-md bg-slate-700 hover:bg-slate-500 active:translate-x-[-1px] transition-all"
              />
            </div>
          </div>
        )}

        {/* Main Titanium Pixel Frame */}
        <div
          className={`${frameWidth} ${frameHeight} ${
            resolution === 'tablet' ? 'rounded-[28px]' : 'rounded-[42px]'
          } p-[10px] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-[0_24px_60px_-15px_rgba(15,23,42,0.45)] border border-slate-700/80 transition-all duration-200 relative ${
            flashlight ? 'ring-4 ring-amber-200/70' : ''
          }`}
        >
          {/* Inner Display Bezel */}
          <div
            style={{ filter: `brightness(${brightness / 100})` }}
            className={`w-full h-full ${
              resolution === 'tablet' ? 'rounded-[18px]' : 'rounded-[32px]'
            } overflow-hidden bg-slate-950 relative flex flex-col`}
          >
            {/* Top Front Camera Punch Hole */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-black border border-slate-800 z-50 pointer-events-none flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            {/* Volume Overlay HUD */}
            {volumeHudVisible && (
              <div className="absolute right-3 top-24 z-50 bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-full py-2.5 px-2 flex flex-col items-center gap-2 text-white shadow-xl">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <div className="w-1.5 h-24 rounded-full bg-slate-700 overflow-hidden flex items-end">
                  <div
                    style={{ height: `${volume}%` }}
                    className="w-full bg-blue-500 rounded-full transition-all"
                  />
                </div>
                <span className="text-[10px] font-mono-tabular">{volume}</span>
              </div>
            )}

            {/* Screen Content Area */}
            <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
              {children}

              {booting && (
                <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4 text-white">
                  <div className="w-10 h-10 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  <div className="text-center space-y-1">
                    <div className="text-sm font-semibold tracking-tight">Google Android</div>
                    <div className="text-[11px] font-mono-tabular text-slate-400">
                      Cold booting AVD kernel...
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Android Navigation Bar */}
            <div
              className={`h-10 shrink-0 px-10 flex items-center justify-between border-t transition-colors z-30 ${
                darkNavBar
                  ? 'bg-slate-950/95 border-slate-800/80 text-slate-300'
                  : 'bg-white/95 border-slate-200/80 text-slate-700'
              }`}
            >
              <button
                onClick={onNavBack}
                className="w-12 h-9 flex items-center justify-center rounded-full hover:bg-slate-500/15 active:scale-90 transition-all"
                aria-label="Android Back"
                title="Back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNavHome}
                className="w-12 h-9 flex items-center justify-center rounded-full hover:bg-slate-500/15 active:scale-90 transition-all"
                aria-label="Android Home"
                title="Home"
              >
                <Circle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNavRecents}
                className="w-12 h-9 flex items-center justify-center rounded-full hover:bg-slate-500/15 active:scale-90 transition-all"
                aria-label="Android Recents"
                title="Recent Apps"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Android Preview Vertical Hardware Toolbar */}
      <div className="hidden sm:flex flex-col items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <button
          onClick={onPressPower}
          title={locked ? 'Unlock / Wake' : 'Power / Lock'}
          aria-label="Power button"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {locked ? <Unlock className="w-4 h-4 text-blue-600" /> : <Power className="w-4 h-4" />}
        </button>
        <button
          onClick={onVolumeUp}
          title="Volume Up"
          aria-label="Volume Up"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
        </button>
        <button
          onClick={onVolumeDown}
          title="Volume Down"
          aria-label="Volume Down"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Volume1 className="w-4 h-4" />
        </button>
        <div className="w-5 h-px bg-slate-200 dark:bg-slate-800 my-0.5" />
        <button
          onClick={onRotate}
          title="Rotate Portrait / Landscape"
          aria-label="Rotate device"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={onScreenshot}
          title="Take Screenshot"
          aria-label="Take screenshot"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleRecord}
          title={screenRecording ? 'Stop Screen Recording' : 'Record Screen Video'}
          aria-label="Record screen video"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            screenRecording
              ? 'bg-red-600 text-white'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Video className="w-4 h-4" />
        </button>
        {onToggleHotspot && (
          <button
            onClick={onToggleHotspot}
            title={hotspotActive ? 'Hotspot Active (Click to turn off)' : 'Toggle Wi-Fi Hotspot'}
            aria-label="Toggle Wi-Fi Hotspot"
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              hotspotActive
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4" />
          </button>
        )}
        {onReboot && (
          <button
            onClick={onReboot}
            title="Cold Boot / Restart Emulator"
            aria-label="Restart Emulator"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        <div className="w-5 h-px bg-slate-200 dark:bg-slate-800 my-0.5" />
        <button
          onClick={onNavBack}
          title="Back"
          aria-label="Back"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNavHome}
          title="Home"
          aria-label="Home"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Circle className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onNavRecents}
          title="Recent Apps"
          aria-label="Recent apps"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Square className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onPressPower}
          title="Lock Screen"
          aria-label="Lock Screen"
          className="sr-only"
        >
          <Lock className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
