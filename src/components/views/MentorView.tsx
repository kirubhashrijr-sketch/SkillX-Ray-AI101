import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Loader2, Send, Trash2 } from 'lucide-react';
import type { AnalysisRecord, MentorMessage } from '../../types/skillxray';

interface MentorViewProps {
  activeAnalysis: AnalysisRecord | undefined;
}

const STARTER_PROMPTS = [
  'What should I focus on today in my 30-day roadmap?',
  'Draft an interview pitch highlighting my hidden skills.',
  'How do I close my top missing skill fastest?',
  'Suggest a weekend portfolio project aligned with my top career match.',
];

export function MentorView({ activeAnalysis }: MentorViewProps) {
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch('/api/mentor/messages')
      .then((r) => r.json())
      .then((data: { messages?: MentorMessage[] }) => {
        setMessages(data.messages ?? []);
      })
      .catch(() => setError('Unable to load mentor conversation.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function sendQuestion(text: string) {
    if (!text.trim() || sending) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      const data = (await res.json()) as {
        userMessage?: MentorMessage;
        assistantMessage?: MentorMessage;
        error?: string;
      };
      if (!res.ok || !data.userMessage || !data.assistantMessage) {
        setError(data.error || 'Mentor request failed.');
        return;
      }
      setMessages((prev) => [...prev, data.userMessage!, data.assistantMessage!]);
      setInput('');
    } catch {
      setError('Network error while contacting Learning Mentor Agent.');
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await sendQuestion(input);
  }

  async function handleClear() {
    await fetch('/api/mentor/messages', { method: 'DELETE' });
    setMessages([]);
  }

  return (
    <div className="space-y-6">
      <div className="glass-surface-elevated rounded-2xl p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-violet-400">Learning Mentor Agent</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">AI Career Mentor</h1>
          <p className="mt-1 text-sm text-slate-300">
            {activeAnalysis
              ? `Grounded in your "${activeAnalysis.title}" scan (${activeAnalysis.result.learningRoadmap.targetCareer}).`
              : 'Ask career, interview, or roadmap questions anytime.'}
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-red-500/40 hover:text-red-300 cursor-pointer shrink-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Starter Prompts */}
      <div className="flex flex-wrap gap-2">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={sending}
            onClick={() => sendQuestion(prompt)}
            className="rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-2 text-xs text-slate-300 hover:border-blue-500/50 hover:text-white transition-colors cursor-pointer text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="glass-surface rounded-2xl flex flex-col h-[480px]">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading mentor history…
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4">
              <Bot className="h-10 w-10 text-violet-400" />
              <p className="mt-3 font-display text-base font-semibold text-white">
                Your Learning Mentor is ready
              </p>
              <p className="mt-1 max-w-md text-sm text-slate-400">
                Choose a prompt above or ask how to frame your hidden skills, tackle today&apos;s
                roadmap module, or prepare for technical interviews.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-800 bg-slate-900/90 text-slate-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="mx-6 mb-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs text-red-200">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-800/80 p-4 flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI Mentor about skills, interviews, or roadmap tasks…"
            className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/80 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="btn-primary-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 cursor-pointer shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
