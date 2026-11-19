import React, { useState } from 'react';
import {
  ChevronDown,
  Pause,
  Play,
  Plus,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';
import {
  AndroidVersion,
  EmulatorInstance,
  ResolutionPreset,
} from '../../types/emulator';

interface InstanceManagerProps {
  instances: EmulatorInstance[];
  activeInstanceId: string;
  onSelectInstance: (id: string) => void;
  onTogglePauseInstance: (id: string) => void;
  onDeleteInstance: (id: string) => void;
  onCreateInstance: (config: {
    name: string;
    androidVersion: AndroidVersion;
    accountName: string;
    accountEmail: string;
    resolution: ResolutionPreset;
  }) => void;
}

export const InstanceManager: React.FC<InstanceManagerProps> = ({
  instances,
  activeInstanceId,
  onSelectInstance,
  onTogglePauseInstance,
  onDeleteInstance,
  onCreateInstance,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('Pixel 8a QA');
  const [androidVersion, setAndroidVersion] = useState<AndroidVersion>('14');
  const [accountName, setAccountName] = useState('Alex Rivera');
  const [accountEmail, setAccountEmail] = useState('alex.qa@gmail.com');
  const [resolution, setResolution] = useState<ResolutionPreset>('standard');

  const active = instances.find((i) => i.id === activeInstanceId) || instances[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !accountEmail.trim()) return;
    onCreateInstance({
      name: name.trim(),
      androidVersion,
      accountName: accountName.trim() || 'Android User',
      accountEmail: accountEmail.trim(),
      resolution,
    });
    setModalOpen(false);
    setDropdownOpen(false);
    setName(`Pixel Device ${instances.length + 2}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen((o) => !o)}
        className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-xs transition-colors"
      >
        <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
        <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
          {active.name}
        </span>
        <span className="text-slate-400 hidden sm:inline">·</span>
        <span className="text-slate-500 dark:text-slate-400 font-mono-tabular hidden sm:inline whitespace-nowrap">
          Android {active.androidVersion} · {active.account.email}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute left-0 top-11 z-40 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 space-y-1">
            <div className="px-2.5 py-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Running Virtual Devices ({instances.length})</span>
            </div>

            {instances.map((inst) => {
              const isSelected = inst.id === activeInstanceId;
              return (
                <div
                  key={inst.id}
                  onClick={() => {
                    onSelectInstance(inst.id);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between gap-2 p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{inst.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-mono-tabular">
                      Android {inst.androidVersion} · {inst.account.email} ·{' '}
                      {inst.status === 'running' ? 'Active' : 'Paused'}
                    </div>
                  </div>
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 shrink-0"
                  >
                    <button
                      onClick={() => onTogglePauseInstance(inst.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-500"
                      title={inst.status === 'running' ? 'Pause' : 'Resume'}
                      aria-label={inst.status === 'running' ? 'Pause instance' : 'Resume instance'}
                    >
                      {inst.status === 'running' ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {instances.length > 1 && (
                      <button
                        onClick={() => onDeleteInstance(inst.id)}
                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950 text-slate-400 hover:text-red-600"
                        title="Remove instance"
                        aria-label="Remove instance"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  setModalOpen(true);
                }}
                className="w-full h-9 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Virtual Device</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create New Emulator Instance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Launch New Emulator Instance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure OS version, resolution, and Google account
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Device Instance Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Android Version
                  </label>
                  <select
                    value={androidVersion}
                    onChange={(e) => setAndroidVersion(e.target.value as AndroidVersion)}
                    className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="15">Android 15 (API 35)</option>
                    <option value="14">Android 14 (API 34)</option>
                    <option value="13">Android 13 (API 33)</option>
                    <option value="12">Android 12 (API 31)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Screen Resolution
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as ResolutionPreset)}
                    className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="compact">Compact (720 x 1560)</option>
                    <option value="standard">Standard (1080 x 2400)</option>
                    <option value="qhd">QHD+ (1440 x 3120)</option>
                    <option value="tablet">Tablet (1600 x 2560)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Google Account Name
                  </label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Google Email
                  </label>
                  <input
                    type="email"
                    required
                    value={accountEmail}
                    onChange={(e) => setAccountEmail(e.target.value)}
                    className="w-full px-3 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-10 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500"
                >
                  Create & Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
