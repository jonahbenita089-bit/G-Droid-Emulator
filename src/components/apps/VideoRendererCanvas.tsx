import React, { useEffect, useRef } from 'react';

interface VideoRendererCanvasProps {
  preset: 'aurora' | 'kinetic' | 'waves' | 'orbit' | 'custom';
  accent: string;
  playing: boolean;
  progressSec: number;
  title?: string;
  className?: string;
}

export const VideoRendererCanvas: React.FC<VideoRendererCanvasProps> = ({
  preset,
  accent,
  playing,
  progressSec,
  title,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeRef = useRef(progressSec);

  useEffect(() => {
    timeRef.current = progressSec;
  }, [progressSec]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    let lastTs = performance.now();

    const drawFrame = (now: number) => {
      const dt = (now - lastTs) / 1000;
      lastTs = now;
      if (playing) {
        timeRef.current += dt;
      }
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, h);

      if (preset === 'waves' || preset === 'custom') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, accent);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        for (let layer = 0; layer < 4; layer++) {
          ctx.beginPath();
          ctx.moveTo(0, h);
          for (let x = 0; x <= w; x += 10) {
            const y =
              h * (0.45 + layer * 0.1) +
              Math.sin(x * 0.018 + t * (1.2 + layer * 0.35) + layer) * (16 + layer * 4);
            ctx.lineTo(x, y);
          }
          ctx.lineTo(w, h);
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + layer * 0.05})`;
          ctx.fill();
        }
      } else if (preset === 'orbit') {
        ctx.fillStyle = '#070b14';
        ctx.fillRect(0, 0, w, h);
        const cx = w / 2;
        const cy = h / 2;
        for (let ring = 1; ring <= 4; ring++) {
          const r = ring * 24;
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();

          const angle = t * (1.8 / ring) + ring;
          const px = cx + Math.cos(angle) * r;
          const py = cy + Math.sin(angle) * r;
          ctx.fillStyle = ring === 1 ? '#fbbf24' : accent;
          ctx.beginPath();
          ctx.arc(px, py, 5 + (4 - ring), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (preset === 'kinetic') {
        ctx.fillStyle = '#0b1120';
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 8; i++) {
          const bx = ((i * 52 + t * 48) % (w + 60)) - 30;
          const by = h / 2 + Math.sin(t * 2 + i * 0.8) * 42;
          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(t * 0.9 + i);
          ctx.fillStyle = i % 2 === 0 ? accent : '#38bdf8';
          ctx.globalAlpha = 0.78;
          ctx.fillRect(-16, -16, 32, 32);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      } else {
        // aurora
        const g1 = ctx.createRadialGradient(
          w * (0.35 + Math.sin(t * 0.7) * 0.2),
          h * (0.4 + Math.cos(t * 0.5) * 0.18),
          10,
          w * 0.5,
          h * 0.5,
          w * 0.7
        );
        g1.addColorStop(0, accent);
        g1.addColorStop(0.5, '#0f766e');
        g1.addColorStop(1, '#090d16');
        ctx.fillStyle = g1;
        ctx.fillRect(0, 0, w, h);
      }

      if (title) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(12, h - 36, Math.min(w - 24, ctx.measureText(title).width + 24), 24);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '600 11px DM Sans, sans-serif';
        ctx.fillText(title, 20, h - 20);
      }

      if (playing) {
        rafId = requestAnimationFrame(drawFrame);
      }
    };

    rafId = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(rafId);
  }, [preset, accent, playing, title]);

  return <canvas ref={canvasRef} width={360} height={204} className={className} />;
};
