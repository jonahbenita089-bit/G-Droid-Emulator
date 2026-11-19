import React, { useEffect, useRef, useState } from 'react';
import { Camera, Check, Video } from 'lucide-react';
import { MediaItem } from '../../types/emulator';

interface CameraAppProps {
  onCaptureMedia: (item: Omit<MediaItem, 'id'>) => void;
  onOpenPhotos: () => void;
  gyroRoll?: number;
}

export const CameraApp: React.FC<CameraAppProps> = ({
  onCaptureMedia,
  onOpenPhotos,
  gyroRoll = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [zoom, setZoom] = useState<0.5 | 1 | 2>(1);
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const start = performance.now();

    const renderViewfinder = (now: number) => {
      const t = (now - start) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      // Scenic horizon + geometric kinetic mountain skyline
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, '#0f172a');
      sky.addColorStop(0.55, '#1d4ed8');
      sky.addColorStop(1, '#f59e0b');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-w / 2, -h / 2);

      // Sun orb
      const sunX = w * 0.5 + Math.sin(t * 0.4) * 35;
      const sunY = h * 0.36;
      ctx.fillStyle = 'rgba(253, 224, 71, 0.9)';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 26, 0, Math.PI * 2);
      ctx.fill();

      // Mountain ridge 1
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.65);
      ctx.lineTo(w * 0.3, h * 0.48);
      ctx.lineTo(w * 0.62, h * 0.62);
      ctx.lineTo(w, h * 0.46);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      // Mountain ridge 2
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.74);
      ctx.lineTo(w * 0.42, h * 0.58);
      ctx.lineTo(w * 0.8, h * 0.72);
      ctx.lineTo(w, h * 0.63);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Rule of thirds subtle grid
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w / 3, 0);
      ctx.lineTo(w / 3, h);
      ctx.moveTo((2 * w) / 3, 0);
      ctx.lineTo((2 * w) / 3, h);
      ctx.moveTo(0, h / 3);
      ctx.lineTo(w, h / 3);
      ctx.moveTo(0, (2 * h) / 3);
      ctx.lineTo(w, (2 * h) / 3);
      ctx.stroke();

      rafId = requestAnimationFrame(renderViewfinder);
    };

    rafId = requestAnimationFrame(renderViewfinder);
    return () => cancelAnimationFrame(rafId);
  }, [zoom]);

  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [recording]);

  const showToast = (msg: string) => {
    setFlashMessage(msg);
    window.setTimeout(() => setFlashMessage(null), 2200);
  };

  const handlePhotoCapture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCaptureMedia({
      type: 'photo',
      title: `Pixel Capture ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      dateLabel: 'Just now',
      location: 'Pixel Virtual Camera',
      src: dataUrl,
      filter: 'original',
    });
    showToast('Photo saved to Google Photos');
  };

  const toggleVideoRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!recording) {
      setRecordSeconds(0);
      setRecording(true);
      try {
        if (typeof canvas.captureStream === 'function' && typeof MediaRecorder !== 'undefined') {
          const stream = canvas.captureStream(30);
          const recorder = new MediaRecorder(stream);
          chunksRef.current = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const blobUrl = URL.createObjectURL(blob);
            onCaptureMedia({
              type: 'video',
              title: `Camera Video ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
              dateLabel: 'Just now',
              location: 'Pixel Virtual Camera',
              blobUrl,
              durationSec: Math.max(2, recordSeconds),
            });
          };
          recorder.start();
          recorderRef.current = recorder;
        }
      } catch {
        recorderRef.current = null;
      }
    } else {
      setRecording(false);
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      } else {
        onCaptureMedia({
          type: 'video',
          title: `Camera Video ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          dateLabel: 'Just now',
          location: 'Pixel Virtual Camera',
          videoPreset: 'aurora',
          videoColor: '#1d4ed8',
          durationSec: Math.max(3, recordSeconds),
        });
      }
      showToast('Video saved to Google Photos');
    }
  };

  const isLevel = Math.abs(gyroRoll) <= 2;

  return (
    <div className="h-full flex flex-col bg-black text-white relative">
      {/* Top Status */}
      <div className="px-4 py-2.5 flex items-center justify-between text-xs z-10">
        <span className="font-medium text-slate-300">Pixel Camera</span>
        {recording ? (
          <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-semibold tabular-nums">
            REC 0:{recordSeconds.toString().padStart(2, '0')}
          </span>
        ) : (
          <span className="text-slate-400 font-mono-tabular">
            {zoom}x · {gyroRoll}°
          </span>
        )}
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative overflow-hidden mx-2 rounded-3xl border border-white/10">
        <canvas ref={canvasRef} width={340} height={440} className="w-full h-full object-cover block" />

        {/* Virtual Gyroscope Horizon Level */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            style={{ transform: `rotate(${gyroRoll}deg)` }}
            className="w-28 flex items-center justify-between transition-transform duration-150"
          >
            <div className={`h-[2px] w-8 ${isLevel ? 'bg-amber-400' : 'bg-white/75'}`} />
            <div className={`w-2 h-2 rounded-full border ${isLevel ? 'border-amber-400 bg-amber-400/50' : 'border-white/80'}`} />
            <div className={`h-[2px] w-8 ${isLevel ? 'bg-amber-400' : 'bg-white/75'}`} />
          </div>
        </div>

        {flashMessage && (
          <div className="absolute top-3 inset-x-4 py-2 px-3 rounded-xl bg-black/75 backdrop-blur-md text-xs font-medium flex items-center justify-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{flashMessage}</span>
          </div>
        )}

        {/* Zoom Pills */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full">
          {([0.5, 1, 2] as const).map((z) => (
            <button
              key={z}
              onClick={() => setZoom(z)}
              className={`w-8 h-7 rounded-full text-[11px] font-semibold tabular-nums transition-colors ${
                zoom === z ? 'bg-amber-400 text-slate-950' : 'text-white'
              }`}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Mode & Shutter Controls */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-center gap-6 text-xs font-semibold">
          <button
            onClick={() => !recording && setMode('photo')}
            className={mode === 'photo' ? 'text-amber-400' : 'text-slate-400'}
          >
            Photo
          </button>
          <button
            onClick={() => !recording && setMode('video')}
            className={mode === 'video' ? 'text-amber-400' : 'text-slate-400'}
          >
            Video
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onOpenPhotos}
            className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-semibold"
            aria-label="Open Photos"
          >
            Photos
          </button>

          <button
            onClick={mode === 'photo' ? handlePhotoCapture : toggleVideoRecording}
            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition-transform"
            aria-label={mode === 'photo' ? 'Take photo' : 'Record video'}
          >
            {mode === 'photo' ? (
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-900">
                <Camera className="w-5 h-5" />
              </div>
            ) : (
              <div
                className={`transition-all flex items-center justify-center ${
                  recording ? 'w-6 h-6 rounded-md bg-red-600' : 'w-12 h-12 rounded-full bg-red-600'
                }`}
              >
                {!recording && <Video className="w-5 h-5 text-white" />}
              </div>
            )}
          </button>

          <div className="w-11" />
        </div>
      </div>
    </div>
  );
};
