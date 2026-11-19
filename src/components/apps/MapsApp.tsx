import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  MapPin,
  Minus,
  Navigation,
  Plus,
  Search,
  X,
} from 'lucide-react';

interface Place {
  id: string;
  name: string;
  category: 'Landmarks' | 'Coffee' | 'Transit' | 'Parks';
  x: number;
  y: number;
  address: string;
  rating: string;
  etaMin: number;
  distanceKm: string;
}

const DELTA_PLACES: Place[] = [
  {
    id: 'ng1',
    name: 'Orhuworun Town Square',
    category: 'Landmarks',
    x: 192,
    y: 185,
    address: 'Orhuworun Main Rd, Udu LGA, Delta State',
    rating: '4.8',
    etaMin: 4,
    distanceKm: '1.1 km',
  },
  {
    id: 'ng2',
    name: 'DSC Steel Complex',
    category: 'Landmarks',
    x: 118,
    y: 128,
    address: 'Aladja-Orhuworun Corridor, Delta State',
    rating: '4.6',
    etaMin: 9,
    distanceKm: '3.2 km',
  },
  {
    id: 'ng3',
    name: 'Udu Express Junction',
    category: 'Transit',
    x: 262,
    y: 168,
    address: 'DSC Expressway, Udu, Delta State',
    rating: '4.5',
    etaMin: 11,
    distanceKm: '4.4 km',
  },
  {
    id: 'ng4',
    name: 'Warri River Crossing',
    category: 'Parks',
    x: 245,
    y: 256,
    address: 'Warri-Udu Waterfront, Delta State',
    rating: '4.7',
    etaMin: 14,
    distanceKm: '5.8 km',
  },
  {
    id: 'ng5',
    name: 'Effurun Roundabout',
    category: 'Coffee',
    x: 138,
    y: 252,
    address: 'Effurun-Warri Rd, Delta State',
    rating: '4.6',
    etaMin: 16,
    distanceKm: '7.1 km',
  },
];

const SF_PLACES: Place[] = [
  {
    id: 'p1',
    name: 'Ferry Building',
    category: 'Transit',
    x: 280,
    y: 190,
    address: '1 Ferry Building, San Francisco',
    rating: '4.7',
    etaMin: 11,
    distanceKm: '3.4 km',
  },
  {
    id: 'p2',
    name: 'Golden Gate Bridge',
    category: 'Landmarks',
    x: 105,
    y: 95,
    address: 'Golden Gate Strait',
    rating: '4.9',
    etaMin: 18,
    distanceKm: '8.2 km',
  },
  {
    id: 'p3',
    name: 'Sightglass Coffee',
    category: 'Coffee',
    x: 215,
    y: 245,
    address: '270 7th St, SoMa',
    rating: '4.6',
    etaMin: 7,
    distanceKm: '1.9 km',
  },
  {
    id: 'p4',
    name: 'Golden Gate Park',
    category: 'Parks',
    x: 115,
    y: 235,
    address: '501 Stanyan St',
    rating: '4.8',
    etaMin: 14,
    distanceKm: '5.1 km',
  },
  {
    id: 'p5',
    name: 'Coit Tower',
    category: 'Landmarks',
    x: 248,
    y: 132,
    address: '1 Telegraph Hill Blvd',
    rating: '4.6',
    etaMin: 12,
    distanceKm: '3.8 km',
  },
];

interface MapsAppProps {
  darkTheme: boolean;
  gpsLat?: number;
  gpsLon?: number;
  gpsLabel?: string;
}

export const MapsApp: React.FC<MapsAppProps> = ({
  darkTheme,
  gpsLat = 5.5126,
  gpsLon = 5.8394,
  gpsLabel = 'Orhuworun, Delta State',
}) => {
  const isDeltaRegion =
    gpsLabel.toLowerCase().includes('orhuworun') ||
    gpsLabel.toLowerCase().includes('delta') ||
    gpsLabel.toLowerCase().includes('nigeria') ||
    gpsLabel.toLowerCase().includes('lagos') ||
    (gpsLat >= 4 && gpsLat <= 14 && gpsLon >= 2 && gpsLon <= 15);

  const activePlaces = isDeltaRegion ? DELTA_PLACES : SF_PLACES;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'All' | Place['category']>('All');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(activePlaces[0]);
  const [routingTo, setRoutingTo] = useState<Place | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ dragging: boolean; sx: number; sy: number; px: number; py: number }>({
    dragging: false,
    sx: 0,
    sy: 0,
    px: 0,
    py: 0,
  });

  useEffect(() => {
    setSelectedPlace(activePlaces[0]);
    setRoutingTo(null);
  }, [isDeltaRegion]);

  const userOrigin = { x: 195, y: 210 };

  const visiblePlaces = activePlaces.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    if (query.trim() && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Map water / river & land base
    ctx.fillStyle = darkTheme ? '#0f172a' : '#dbeafe';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(w / 2 + pan.x, h / 2 + pan.y);
    ctx.scale(zoom, zoom);
    ctx.translate(-195, -200);

    // Land mass polygon (Delta riverbanks vs SF peninsula)
    ctx.fillStyle = darkTheme ? '#1e293b' : '#f1f5f9';
    ctx.beginPath();
    if (isDeltaRegion) {
      ctx.moveTo(45, 70);
      ctx.lineTo(340, 70);
      ctx.lineTo(340, 260);
      ctx.lineTo(255, 295);
      ctx.lineTo(140, 325);
      ctx.lineTo(45, 325);
    } else {
      ctx.moveTo(65, 110);
      ctx.lineTo(235, 105);
      ctx.lineTo(295, 175);
      ctx.lineTo(285, 340);
      ctx.lineTo(65, 340);
    }
    ctx.closePath();
    ctx.fill();

    // Green zones / parks
    ctx.fillStyle = darkTheme ? '#14532d' : '#bbf7d0';
    ctx.fillRect(85, 220, 75, 28);
    ctx.fillRect(215, 130, 32, 26);

    // Street Grid
    ctx.strokeStyle = darkTheme ? '#334155' : '#e2e8f0';
    ctx.lineWidth = 1.5;
    for (let x = 80; x <= 275; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, 115);
      ctx.lineTo(x, 330);
      ctx.stroke();
    }
    for (let y = 120; y <= 325; y += 22) {
      ctx.beginPath();
      ctx.moveTo(75, y);
      ctx.lineTo(280, y);
      ctx.stroke();
    }

    // Major arterials
    ctx.strokeStyle = darkTheme ? '#475569' : '#cbd5e1';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(95, 95);
    ctx.lineTo(130, 145);
    ctx.lineTo(280, 190);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(155, 285);
    ctx.lineTo(280, 190);
    ctx.stroke();

    // Active route polyline
    if (routingTo) {
      ctx.strokeStyle = '#1A73E8';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(userOrigin.x, userOrigin.y);
      ctx.lineTo(routingTo.x, userOrigin.y);
      ctx.lineTo(routingTo.x, routingTo.y);
      ctx.stroke();
    }

    // Current user blue dot
    ctx.fillStyle = 'rgba(26, 115, 232, 0.2)';
    ctx.beginPath();
    ctx.arc(userOrigin.x, userOrigin.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1A73E8';
    ctx.beginPath();
    ctx.arc(userOrigin.x, userOrigin.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Place pins
    visiblePlaces.forEach((p) => {
      const isSelected = selectedPlace?.id === p.id;
      ctx.fillStyle = isSelected ? '#EA4335' : '#0F9D58';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isSelected ? 7 : 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = darkTheme ? '#f8fafc' : '#0f172a';
      ctx.font = '600 9px DM Sans, sans-serif';
      ctx.fillText(p.name, p.x + 9, p.y + 3);
    });

    ctx.restore();
  }, [darkTheme, zoom, pan, visiblePlaces, selectedPlace, routingTo, isDeltaRegion]);

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = {
      dragging: true,
      sx: e.clientX,
      sy: e.clientY,
      px: pan.x,
      py: pan.y,
    };
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.dragging) return;
    setPan({
      x: dragRef.current.px + (e.clientX - dragRef.current.sx),
      y: dragRef.current.py + (e.clientY - dragRef.current.sy),
    });
  };

  const handleCanvasPointerUp = () => {
    dragRef.current.dragging = false;
  };

  const surface = darkTheme ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="h-full relative overflow-hidden flex flex-col">
      <canvas
        ref={canvasRef}
        width={380}
        height={640}
        onPointerDown={handleCanvasPointerDown}
        onPointerMove={handleCanvasPointerMove}
        onPointerUp={handleCanvasPointerUp}
        onPointerLeave={handleCanvasPointerUp}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />

      {/* Top Search & Categories */}
      <div className="absolute top-2.5 left-2.5 right-2.5 space-y-2 pointer-events-none">
        <div className={`pointer-events-auto flex items-center gap-2 px-3 h-10 rounded-full shadow-md border border-slate-200/80 dark:border-slate-700 ${surface}`}>
          <Search className={`w-4 h-4 ${muted}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${gpsLabel}`}
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search">
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        <div className="pointer-events-auto inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/75 text-white text-[10px] font-mono-tabular backdrop-blur-sm">
          <span>GPS: {gpsLabel}</span>
          <span>·</span>
          <span>{gpsLat.toFixed(4)}, {gpsLon.toFixed(4)}</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto phone-scroll">
          {(['All', 'Landmarks', 'Coffee', 'Transit', 'Parks'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium shadow-sm whitespace-nowrap shrink-0 transition-colors ${
                category === cat
                  ? 'bg-blue-600 text-white'
                  : `${surface} border border-slate-200 dark:border-slate-700`
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Zoom & Recenter Controls */}
      <div className="absolute right-2.5 bottom-44 flex flex-col gap-1.5">
        <button
          onClick={() => setZoom((z) => Math.min(2.2, +(z + 0.25).toFixed(2)))}
          className={`w-9 h-9 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center ${surface}`}
          aria-label="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}
          className={`w-9 h-9 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center ${surface}`}
          aria-label="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className={`w-9 h-9 rounded-full shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center ${surface}`}
          aria-label="Recenter map"
        >
          <Compass className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* Bottom Place & Routing Sheet */}
      <div className={`absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-xl border-t border-slate-200 dark:border-slate-800 p-3.5 space-y-2.5 ${surface}`}>
        <div className="flex items-center gap-1.5 overflow-x-auto phone-scroll pb-1">
          {visiblePlaces.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPlace(p);
                setRoutingTo(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap shrink-0 border transition-colors ${
                selectedPlace?.id === p.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {selectedPlace && (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-sm font-semibold truncate">{selectedPlace.name}</span>
              </div>
              <div className={`text-[11px] truncate ${muted}`}>
                {selectedPlace.address} · {selectedPlace.rating} stars
              </div>
              {routingTo?.id === selectedPlace.id && (
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5 tabular-nums">
                  {selectedPlace.etaMin} min ({selectedPlace.distanceKm}) ·{' '}
                  {isDeltaRegion ? 'Head east via DSC Expressway' : 'Head east toward Embarcadero'}
                </div>
              )}
            </div>
            <button
              onClick={() =>
                setRoutingTo((curr) => (curr?.id === selectedPlace.id ? null : selectedPlace))
              }
              className="h-10 px-4 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 hover:bg-blue-700 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{routingTo?.id === selectedPlace.id ? 'Clear' : 'Directions'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
