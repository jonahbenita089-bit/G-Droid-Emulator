import React, { useState } from 'react';
import {
  ArrowLeft,
  Inbox,
  Mail,
  PenSquare,
  Reply,
  Search,
  Send,
  Star,
  X,
} from 'lucide-react';
import { EmailMessage, GoogleAccount } from '../../types/emulator';

interface GmailAppProps {
  emails: EmailMessage[];
  account?: GoogleAccount;
  onToggleStar: (id: string) => void;
  onMarkRead: (id: string) => void;
  onSendEmail: (to: string, subject: string, body: string) => void;
  darkTheme: boolean;
}

export const GmailApp: React.FC<GmailAppProps> = ({
  emails,
  account = { name: 'Jonah Benita', email: 'jonahbenita089@gmail.com', avatarColor: '#dc2626' },
  onToggleStar,
  onMarkRead,
  onSendEmail,
  darkTheme,
}) => {
  const [folder, setFolder] = useState<'inbox' | 'starred' | 'sent'>('inbox');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);
  const [toInput, setToInput] = useState('');
  const [subjectInput, setSubjectInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');

  const selectedEmail = emails.find((e) => e.id === selectedId) || null;

  const filtered = emails.filter((e) => {
    if (folder === 'inbox' && e.folder !== 'inbox') return false;
    if (folder === 'sent' && e.folder !== 'sent') return false;
    if (folder === 'starred' && !e.starred) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q) ||
        e.preview.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const surface = darkTheme ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = darkTheme ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200';
  const muted = darkTheme ? 'text-slate-400' : 'text-slate-500';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toInput.trim() || !subjectInput.trim()) return;
    onSendEmail(toInput.trim(), subjectInput.trim(), bodyInput.trim());
    setToInput('');
    setSubjectInput('');
    setBodyInput('');
    setComposing(false);
    setFolder('sent');
  };

  if (composing) {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComposing(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close compose"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold">Compose</span>
          </div>
          <button
            onClick={handleSend}
            className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </div>
        <form onSubmit={handleSend} className="flex-1 flex flex-col p-3.5 space-y-3">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-2 text-xs flex items-center gap-2">
            <span className={muted}>From</span>
            <span>{account.email}</span>
          </div>
          <input
            type="email"
            required
            value={toInput}
            onChange={(e) => setToInput(e.target.value)}
            placeholder="To (recipient@example.com)"
            className="border-b border-slate-200 dark:border-slate-800 pb-2 text-xs bg-transparent focus:outline-none"
          />
          <input
            type="text"
            required
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            placeholder="Subject"
            className="border-b border-slate-200 dark:border-slate-800 pb-2 text-xs bg-transparent focus:outline-none font-medium"
          />
          <textarea
            value={bodyInput}
            onChange={(e) => setBodyInput(e.target.value)}
            placeholder="Compose email..."
            className="flex-1 resize-none bg-transparent text-xs leading-relaxed focus:outline-none"
          />
        </form>
      </div>
    );
  }

  if (selectedEmail) {
    return (
      <div className={`h-full flex flex-col ${surface}`}>
        <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Back to inbox"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStar(selectedEmail.id)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Star email"
          >
            <Star
              className={`w-4 h-4 ${
                selectedEmail.starred ? 'fill-amber-400 text-amber-400' : muted
              }`}
            />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto phone-scroll p-4 space-y-4">
          <h2 className="text-base font-semibold leading-snug">{selectedEmail.subject}</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center">
                {selectedEmail.from.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-semibold">{selectedEmail.from}</div>
                <div className={`text-[11px] ${muted}`}>{selectedEmail.fromEmail}</div>
              </div>
            </div>
            <span className={`text-[11px] tabular-nums ${muted}`}>{selectedEmail.time}</span>
          </div>
          <div className="text-xs leading-relaxed whitespace-pre-line pt-2 border-t border-slate-200/70 dark:border-slate-800">
            {selectedEmail.body}
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setToInput(selectedEmail.fromEmail);
              setSubjectInput(`Re: ${selectedEmail.subject}`);
              setComposing(true);
            }}
            className="w-full h-10 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${surface} relative`}>
      <div className="p-3 space-y-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className={`flex items-center gap-2 px-3 h-10 rounded-full border ${cardBg}`}>
          <Search className={`w-4 h-4 ${muted}`} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search in mail"
            className="flex-1 bg-transparent text-xs focus:outline-none"
          />
          <div
            style={{ backgroundColor: account.avatarColor }}
            className="w-7 h-7 rounded-full text-white text-[11px] font-semibold flex items-center justify-center"
            title={account.email}
          >
            {account.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[
            { id: 'inbox' as const, label: 'Inbox', icon: Inbox },
            { id: 'starred' as const, label: 'Starred', icon: Star },
            { id: 'sent' as const, label: 'Sent', icon: Mail },
          ].map((item) => {
            const Icon = item.icon;
            const active = folder === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFolder(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  active
                    ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-semibold'
                    : muted
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto phone-scroll divide-y divide-slate-200/60 dark:divide-slate-800/80">
        {filtered.map((email) => (
          <div
            key={email.id}
            onClick={() => {
              onMarkRead(email.id);
              setSelectedId(email.id);
            }}
            className="px-3.5 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60"
          >
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {email.from.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs truncate ${email.unread ? 'font-bold' : 'font-medium'}`}>
                  {email.from}
                </span>
                <span className={`text-[10px] tabular-nums shrink-0 ${muted}`}>{email.time}</span>
              </div>
              <div className={`text-xs truncate ${email.unread ? 'font-semibold' : ''}`}>
                {email.subject}
              </div>
              <div className={`text-[11px] truncate ${muted}`}>{email.preview}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(email.id);
              }}
              className="p-1 shrink-0"
              aria-label="Star message"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  email.starred ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className={`py-12 text-center text-xs ${muted}`}>No messages in this folder.</div>
        )}
      </div>

      <button
        onClick={() => setComposing(true)}
        className="absolute bottom-4 right-4 h-11 px-4 rounded-2xl bg-red-600 text-white shadow-lg flex items-center gap-2 text-xs font-semibold hover:bg-red-700 transition-colors"
      >
        <PenSquare className="w-4 h-4" />
        <span>Compose</span>
      </button>
    </div>
  );
};
