import React, { useState } from 'react';
import { AppId } from '../../types/emulator';

interface AppIconProps {
  id: AppId;
  size?: number;
  className?: string;
  iconUrl?: string;
}

export const GoogleGLogo: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.52 12.27c0-.85-.08-1.68-.22-2.47H12v4.67h6.45c-.28 1.5-1.12 2.77-2.39 3.62v3.01h3.87c2.26-2.08 3.59-5.15 3.59-8.83z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.87-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.11C3.25 21.31 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.29c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.6H1.28C.47 8.21 0 10.05 0 12s.47 3.79 1.28 5.4l4-3.11z"
    />
    <path
      fill="#EA4335"
      d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.69 1.28 6.6l4 3.11c.95-2.84 3.6-4.95 6.72-4.95z"
    />
  </svg>
);

export const AppIcon: React.FC<AppIconProps> = ({ id, size = 48, className = '', iconUrl }) => {
  const [imgFailed, setImgFailed] = useState(false);

  const renderGlyph = () => {
    switch (id) {
      case 'playstore':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <path d="M14 11.5v25c0 .9 1 1.4 1.8.9l18.8-12.5c.7-.4.7-1.4 0-1.8L15.8 10.6c-.8-.5-1.8 0-1.8.9z" fill="#00C853" />
            <path d="M14 11.5l12.8 12.5L14 36.5c-.4-.3-.6-.7-.6-1.2V12.7c0-.5.2-.9.6-1.2z" fill="#00B0FF" />
            <path d="M26.8 24l6.2-4.1-4.8-3.2L15.8 10.6l11 13.4z" fill="#00E676" />
            <path d="M26.8 24L15.8 37.4l12.4-6.1 4.8-3.2-6.2-4.1z" fill="#FF3D00" />
            <path d="M33 19.9l4.1 2.7c.9.6.9 2 0 2.6L33 27.9 26.8 24 33 19.9z" fill="#FFC400" />
          </svg>
        );
      case 'apkpure':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#24CD77" />
            <path
              d="M24 10L11 36h6.4l6.6-13.5L30.6 36H37L24 10z"
              fill="#FFFFFF"
            />
            <path
              d="M24 23l-4.2 8.5h8.4L24 23z"
              fill="#119C56"
            />
          </svg>
        );
      case 'chrome':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="15" fill="#EA4335" />
            <path d="M24 9a15 15 0 0 1 13 7.5H24v15l-7.5-13L24 9z" fill="#EA4335" />
            <path d="M24 16.5h13a15 15 0 0 1-13 22.5l6.5-11.2-6.5-11.3z" fill="#FBBC05" />
            <path d="M11 16.5L17.5 27.7 24 39a15 15 0 0 1-13-22.5z" fill="#34A853" />
            <circle cx="24" cy="24" r="7.5" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="5.5" fill="#4285F4" />
          </svg>
        );
      case 'gmail':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <path d="M10 17v16c0 1.1.9 2 2 2h4V22.5L10 17z" fill="#4285F4" />
            <path d="M38 17v16c0 1.1-.9 2-2 2h-4V22.5L38 17z" fill="#34A853" />
            <path d="M32 22.5l6-5.5c0-2-2.2-3.1-3.8-1.9L24 23l-10.2-7.9C12.2 13.9 10 15 10 17l6 5.5 8 6.2 8-6.2z" fill="#EA4335" />
            <path d="M38 17l-6 5.5v-7.4l2.2-1.7c1.6-1.2 3.8-.1 3.8 1.9V17z" fill="#FBBC05" />
          </svg>
        );
      case 'maps':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <path d="M24 9c-6.1 0-11 4.9-11 11 0 8.1 11 19 11 19s11-10.9 11-19c0-6.1-4.9-11-11-11z" fill="#EA4335" />
            <path d="M24 9c-4.5 0-8.4 2.7-10.1 6.6L24 24V9z" fill="#4285F4" />
            <path d="M13.9 15.6C13.3 17 13 18.5 13 20c0 3.7 2.3 8 5 11.7L24 24l-10.1-8.4z" fill="#FBBC05" />
            <path d="M24 24l-6 7.7C20.9 35.6 24 39 24 39s6.3-6.2 9.3-12.5L24 24z" fill="#34A853" />
            <circle cx="24" cy="20" r="4.5" fill="#FFFFFF" />
          </svg>
        );
      case 'youtube':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <rect x="8" y="13" width="32" height="22" rx="6.5" fill="#FF0000" />
            <path d="M21 19.5v9l8-4.5-8-4.5z" fill="#FFFFFF" />
          </svg>
        );
      case 'photos':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <path d="M24 24h-9a6 6 0 0 1 6-6h3v6z" fill="#FBBC05" />
            <path d="M24 24v-9a6 6 0 0 1 6 6v3h-6z" fill="#EA4335" />
            <path d="M24 24h9a6 6 0 0 1-6 6h-3v-6z" fill="#4285F4" />
            <path d="M24 24v9a6 6 0 0 1-6-6v-3h6z" fill="#34A853" />
            <path d="M12 24a6 6 0 0 1 6-6h6v6H12z" fill="#FBBC05" />
            <path d="M24 12a6 6 0 0 1 6 6v6h-6V12z" fill="#EA4335" />
            <path d="M36 24a6 6 0 0 1-6 6h-6v-6h12z" fill="#4285F4" />
            <path d="M24 36a6 6 0 0 1-6-6v-6h6v12z" fill="#34A853" />
          </svg>
        );
      case 'calendar':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <rect x="10" y="10" width="28" height="28" rx="5" fill="#4285F4" />
            <rect x="14" y="14" width="20" height="20" rx="2" fill="#FFFFFF" />
            <rect x="30" y="30" width="8" height="8" fill="#1967D2" />
            <rect x="10" y="30" width="6" height="8" rx="2" fill="#34A853" />
            <rect x="32" y="10" width="6" height="6" rx="2" fill="#FBBC05" />
            <text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1A73E8" fontFamily="sans-serif">
              18
            </text>
          </svg>
        );
      case 'drive':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <path d="M19.5 11h9l9.5 16.5-4.5 7.5H14.5L10 27.5 19.5 11z" fill="#4285F4" />
            <path d="M19.5 11L10 27.5l4.5 7.5 9.5-16.5-4.5-7.5z" fill="#0F9D58" />
            <path d="M28.5 11H19.5l9.5 16.5h9L28.5 11z" fill="#FBBC05" />
            <path d="M14.5 35h19l4.5-7.5H19l-4.5 7.5z" fill="#4285F4" />
            <polygon points="19.5,27.5 28.5,27.5 24,19.5" fill="#FFFFFF" />
          </svg>
        );
      case 'meet':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <rect x="10" y="16" width="18" height="16" rx="3" fill="#00AC47" />
            <path d="M28 21l8-6v18l-8-6v-6z" fill="#00832D" />
            <path d="M10 16h10v6H10z" fill="#4285F4" />
            <path d="M20 16h8v6h-8z" fill="#FFBA00" />
            <path d="M10 26h10v6H10z" fill="#EA4335" />
          </svg>
        );
      case 'search':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FFFFFF" />
            <g transform="translate(12, 12)">
              <GoogleGLogo size={24} />
            </g>
          </svg>
        );
      case 'camera':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#202124" />
            <rect x="11" y="16" width="26" height="19" rx="4" fill="#3C4043" />
            <path d="M18 16l2-3h8l2 3H18z" fill="#5F6368" />
            <circle cx="24" cy="25.5" r="6.5" fill="#1A73E8" />
            <circle cx="24" cy="25.5" r="3.5" fill="#8AB4F8" />
            <circle cx="32.5" cy="19.5" r="1.5" fill="#F28B82" />
          </svg>
        );
      case 'phone':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#1A73E8" />
            <path
              d="M17.5 14.5c-.5 0-1 .2-1.4.6l-2.3 2.3c-.6.6-.8 1.5-.5 2.3 2 5.4 6.4 9.8 11.8 11.8.8.3 1.7.1 2.3-.5l2.3-2.3c.8-.8.8-2 0-2.8l-2.5-2.5c-.7-.7-1.9-.7-2.6 0l-1.2 1.2c-2.2-1.1-4-2.9-5.1-5.1l1.2-1.2c.7-.7.7-1.9 0-2.6l-2.5-2.5c-.4-.4-.9-.6-1.5-.6z"
              fill="#FFFFFF"
            />
          </svg>
        );
      case 'messages':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#1A73E8" />
            <rect x="12" y="14" width="24" height="17" rx="4" fill="#FFFFFF" />
            <path d="M16 31v5l6-5h-6z" fill="#FFFFFF" />
            <rect x="17" y="19" width="14" height="2" rx="1" fill="#1A73E8" />
            <rect x="17" y="23.5" width="10" height="2" rx="1" fill="#8AB4F8" />
          </svg>
        );
      case 'clock':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#1E293B" />
            <circle cx="24" cy="24" r="13" fill="#4285F4" />
            <circle cx="24" cy="24" r="10" fill="#FFFFFF" />
            <path d="M24 17v7.5l5 3" stroke="#1E293B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        );
      case 'settings':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#475569" />
            <circle cx="24" cy="24" r="10" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeDasharray="4.2 3.2" />
            <circle cx="24" cy="24" r="4.5" fill="#FFFFFF" />
          </svg>
        );
      case 'keep':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FBBC04" />
            <path d="M24 13a7.5 7.5 0 0 0-4.5 13.5V30h9v-3.5A7.5 7.5 0 0 0 24 13z" fill="#FFFFFF" />
            <rect x="20" y="32" width="8" height="2.5" rx="1.2" fill="#FFFFFF" />
          </svg>
        );
      case 'docs':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#2B579A" />
            <rect x="14" y="11" width="20" height="26" rx="3" fill="#4285F4" />
            <rect x="18" y="18" width="12" height="2" rx="1" fill="#FFFFFF" />
            <rect x="18" y="23" width="12" height="2" rx="1" fill="#FFFFFF" />
            <rect x="18" y="28" width="8" height="2" rx="1" fill="#FFFFFF" />
          </svg>
        );
      case 'translate':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#1A73E8" />
            <rect x="11" y="12" width="15" height="16" rx="2.5" fill="#FFFFFF" />
            <rect x="22" y="20" width="15" height="16" rx="2.5" fill="#D2E3FC" />
            <text x="18.5" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1A73E8">A</text>
            <text x="29.5" y="32" textAnchor="middle" fontSize="9" fontWeight="700" fill="#1967D2">文</text>
          </svg>
        );
      case 'ytmusic':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#FF0000" />
            <circle cx="24" cy="24" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2.2" />
            <path d="M21 19v10l8-5-8-5z" fill="#FFFFFF" />
          </svg>
        );
      case 'earth':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#0F172A" />
            <circle cx="24" cy="24" r="13" fill="#1A73E8" />
            <path d="M13 20c3-2 7-1 10 2s6 3 11 1" stroke="#34A853" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M16 30c4-1 7 1 11 0" stroke="#8AB4F8" strokeWidth="3" strokeLinecap="round" fill="none" />
          </svg>
        );
      case 'blockdash':
        return (
          <svg viewBox="0 0 48 48" className="w-full h-full">
            <rect width="48" height="48" rx="14" fill="#0F172A" />
            <rect x="12" y="12" width="10" height="10" rx="2" fill="#38BDF8" />
            <rect x="26" y="12" width="10" height="10" rx="2" fill="#34D399" />
            <rect x="12" y="26" width="10" height="10" rx="2" fill="#FBBF24" />
            <rect x="26" y="26" width="10" height="10" rx="2" fill="#F472B6" />
          </svg>
        );
    }
  };

  if (iconUrl && !imgFailed) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`shrink-0 shadow-sm overflow-hidden rounded-[28%] bg-white select-none ${className}`}
      >
        <img
          src={iconUrl}
          alt={id}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`shrink-0 shadow-sm overflow-hidden rounded-[28%] select-none ${className}`}
    >
      {renderGlyph()}
    </div>
  );
};

export const CustomApkIcon: React.FC<{
  name: string;
  iconUrl?: string;
  size?: number;
  className?: string;
}> = ({ name, iconUrl, size = 48, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const initial = (name.trim().charAt(0) || 'A').toUpperCase();

  return (
    <div
      style={{ width: size, height: size }}
      className={`shrink-0 shadow-sm overflow-hidden rounded-[28%] bg-emerald-600 text-white font-bold flex items-center justify-center select-none ${className}`}
    >
      {iconUrl && !imgFailed ? (
        <img
          src={iconUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover bg-white"
        />
      ) : (
        <span style={{ fontSize: Math.max(12, Math.round(size * 0.44)) }}>{initial}</span>
      )}
    </div>
  );
};
