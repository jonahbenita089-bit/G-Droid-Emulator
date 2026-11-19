export type AppId =
  | 'playstore'
  | 'apkpure'
  | 'chrome'
  | 'gmail'
  | 'maps'
  | 'youtube'
  | 'photos'
  | 'calendar'
  | 'drive'
  | 'meet'
  | 'search'
  | 'camera'
  | 'phone'
  | 'messages'
  | 'clock'
  | 'settings'
  | 'keep'
  | 'docs'
  | 'translate'
  | 'ytmusic'
  | 'earth'
  | 'blockdash';

export type PlayCategory = 'All' | 'Productivity' | 'Media' | 'Navigation' | 'Utilities' | 'Games';

export type ResolutionPreset = 'compact' | 'standard' | 'qhd' | 'tablet';

export type NetworkProfile = 'wifi' | '5g' | '4g' | '3g' | 'offline';

export type AndroidVersion = '15' | '14' | '13' | '12';

export interface GoogleAccount {
  name: string;
  email: string;
  avatarColor: string;
}

export interface SensorData {
  gpsLat: number;
  gpsLon: number;
  gpsLabel: string;
  accelX: number;
  accelY: number;
  accelZ: number;
  gyroPitch: number;
  gyroRoll: number;
  gyroYaw: number;
}

export interface AppDefinition {
  id: AppId;
  packageName: string;
  name: string;
  developer: string;
  category: PlayCategory;
  rating: number;
  reviewsCount: string;
  downloads: string;
  sizeMb: number;
  version: string;
  description: string;
  whatsNew: string;
  preinstalled: boolean;
  pinnedOnHome?: boolean;
  dockOrder?: number;
  accentColor: string;
  apkpureUrl?: string;
  apkSource?: string;
}

export interface DownloadedApk {
  id: string;
  packageName: string;
  name: string;
  developer: string;
  version: string;
  sizeMb: number;
  iconUrl?: string;
  description?: string;
  rating?: string;
  downloadedAt: string;
  installed: boolean;
  permissions: string[];
  apkpureUrl: string;
  appId?: AppId;
}

export interface CustomApkApp {
  packageName: string;
  name: string;
  developer: string;
  version: string;
  sizeMb: number;
  iconUrl?: string;
  description: string;
  apkpureUrl: string;
  rating: string;
}

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  title: string;
  dateLabel: string;
  location: string;
  src?: string;
  videoPreset?: 'aurora' | 'kinetic' | 'waves' | 'orbit' | 'custom';
  videoColor?: string;
  durationSec?: number;
  blobUrl?: string;
  filter?: 'original' | 'vivid' | 'mono' | 'warm';
}

export interface CalendarEvent {
  id: string;
  title: string;
  day: number;
  startTime: string;
  endTime: string;
  location: string;
  color: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  time: string;
  unread: boolean;
  starred: boolean;
  folder: 'inbox' | 'sent';
}

export interface SmsMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

export interface SmsThread {
  id: string;
  contactName: string;
  phone: string;
  messages: SmsMessage[];
  unread: boolean;
}

export interface KeepNote {
  id: string;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  updatedAt: string;
}

export interface DriveFile {
  id: string;
  name: string;
  type: 'folder' | 'doc' | 'sheet' | 'slide' | 'video';
  modified: string;
  size: string;
  starred: boolean;
  content?: string;
}

export interface NotificationItem {
  id: string;
  appId: AppId;
  appName: string;
  title: string;
  body: string;
  time: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  views: string;
  published: string;
  durationSec: number;
  preset: 'aurora' | 'kinetic' | 'waves' | 'orbit' | 'custom';
  accent: string;
  description: string;
  likes: number;
  isShort?: boolean;
}

export interface EmulatorSystemState {
  locked: boolean;
  darkTheme: boolean;
  wifi: boolean;
  bluetooth: boolean;
  cellular: boolean;
  airplaneMode: boolean;
  dnd: boolean;
  flashlight: boolean;
  hotspot: boolean;
  hotspotSsid: string;
  hotspotPassword: string;
  hotspotBand: '2.4 GHz' | '5 GHz';
  connectedHotspotId?: string;
  connectedHotspotSsid?: string;
  connectedHotspotIp?: string;
  usbTethering: boolean;
  btTethering: boolean;
  brightness: number;
  volume: number;
  battery: number;
  charging: boolean;
  batterySaver: boolean;
  landscape: boolean;
  wallpaperIndex: number;
  screenRecording: boolean;
  resolution: ResolutionPreset;
  networkProfile: NetworkProfile;
  developerMode: boolean;
  usbDebugging: boolean;
  sensors: SensorData;
}

export interface EmulatorInstance {
  id: string;
  name: string;
  androidVersion: AndroidVersion;
  account: GoogleAccount;
  system: EmulatorSystemState;
  installedIds: AppId[];
  activeAppId: AppId | null;
  activeCustomPkg: string | null;
  recentIds: AppId[];
  notifications: NotificationItem[];
  downloadedApks: DownloadedApk[];
  customApks: CustomApkApp[];
  status: 'running' | 'paused';
}

export interface LogEntry {
  id: string;
  time: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';
  tag: string;
  message: string;
}

