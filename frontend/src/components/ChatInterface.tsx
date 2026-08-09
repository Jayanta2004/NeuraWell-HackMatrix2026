"use client";

import { motion } from "framer-motion";
import {
  Download,
  Leaf,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  User,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clearChatMemory, streamChat } from "@/lib/api";
import { addMoodRecord } from "@/lib/moodHistory";
import { ActionPlan } from "@/components/ActionPlan";
import { CrisisBanner } from "@/components/CrisisBanner";

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  plan?: string[];
  isEmergency?: boolean;
}

interface ChatInterfaceProps {
  onMoodUpdate: (mood: string, severity: number) => void;
  onModeToggle?: (mode: "chat" | "journal") => void;
  currentMode?: "chat" | "journal";
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatTimestamp(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ChatInterface({
  onMoodUpdate,
  onModeToggle,
  currentMode = "chat",
}: ChatInterfaceProps) {
  const sessionId = useMemo(() => uid(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [crisisActive, setCrisisActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
  });
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
      };
      const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInput("");
    setCrisisActive(false);
    const userMsg: ChatMessage = {
      id: uid(),
      role: "user",
      content: text,
      timestamp: formatTimestamp(),
    };
    const assistantId = uid();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "", timestamp: formatTimestamp() },
    ]);
    setIsStreaming(true);

    try {
      for await (const event of streamChat(text, sessionId)) {
        if (event.type === "metadata") {
          onMoodUpdate(event.mood, event.severity);
          addMoodRecord({
            mood: event.mood,
            severity: event.severity,
            isEmergency: event.is_emergency,
            source: "chat",
          });
          if (event.is_emergency) {
            setCrisisActive(true);
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, isEmergency: true } : m))
            );
          }
        } else if (event.type === "token") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + event.content } : m
            )
          );
        } else if (event.type === "plan") {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, plan: event.content } : m))
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong connecting to NeuraWell. Please try again." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClear = async () => {
    await clearChatMemory(sessionId);
    setMessages([]);
    setCrisisActive(false);
  };

  const handleExportTranscript = () => {
    if (messages.length === 0) return;
    let transcriptText = `NeuraWell Support Session Transcript\nDate: ${new Date().toLocaleString()}\nSession ID: ${sessionId}\n\n========================================\n\n`;
    messages.forEach((m) => {
      const sender = m.role === "user" ? "User" : "NeuraWell AI";
      transcriptText += `[${m.timestamp}] ${sender}:\n${m.content}\n`;
      if (m.plan && m.plan.length > 0) {
        transcriptText += `Grounding Action Plan:\n${m.plan.map((p, idx) => `  ${idx + 1}. ${p}`).join("\n")}\n`;
      }
      transcriptText += `\n----------------------------------------\n\n`;
    });

    const blob = new Blob([transcriptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `neurawell-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header Bar with Mode Toggle & Actions */}
      <div className="glass flex items-center justify-between rounded-2xl px-4 py-2.5 border border-emerald-500/10 dark:bg-emerald-950/30">
        {/* Mode Toggle Header: Chat vs Journal */}
        <div className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => onModeToggle && onModeToggle("chat")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              currentMode === "chat"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold"
                : "text-muted hover:text-foreground"
            }`}
          >
            Chat Mode
          </button>
          <button
            type="button"
            onClick={() => onModeToggle && onModeToggle("journal")}
            className={`rounded-lg px-3 py-1 transition-colors ${
              currentMode === "journal"
                ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-bold"
                : "text-muted hover:text-foreground"
            }`}
          >
            Journal Mode
          </button>
        </div>

        {/* Action Controls: Export & Clear */}
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleExportTranscript}
              title="Export Transcript (.txt)"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-500/20"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleClear}
            title="Clear Chat Memory"
            className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-500/20"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {crisisActive && <CrisisBanner />}

      {/* Message History Panel */}
      <div ref={scrollRef} className="glass flex-1 overflow-y-auto rounded-3xl p-4 sm:p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted py-12">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <Sparkles className="animate-float-slow" size={28} />
            </div>
            <h3 className="text-base font-semibold text-foreground">Welcome to NeuraWell</h3>
            <p className="max-w-xs text-xs text-muted leading-relaxed">
              Share what&apos;s on your mind. NeuraWell provides a safe, compassionate space with gentle, grounding support.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* User / Bot Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    m.role === "user"
                      ? "bg-emerald-700 text-white dark:bg-emerald-500 dark:text-emerald-950"
                      : "bg-teal-600 text-white dark:bg-teal-400 dark:text-teal-950"
                  }`}
                >
                  {m.role === "user" ? <User size={16} /> : <Leaf size={16} />}
                </div>

                <div
                  className={`flex max-w-[85%] flex-col gap-1.5 ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {/* Message Header with Role & Timestamp */}
                  <div className="flex items-center gap-2 px-1 text-[11px] text-muted">
                    <span className="font-semibold">
                      {m.role === "user" ? "You" : "NeuraWell AI"}
                    </span>
                    <span>·</span>
                    <span>{m.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "rounded-tr-xs bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-950 font-medium"
                        : m.isEmergency
                        ? "rounded-tl-xs border-2 border-red-500/50 bg-red-500/10 text-foreground shadow-sm"
                        : "glass rounded-tl-xs border border-emerald-500/10 bg-white/70 dark:bg-emerald-950/40 text-foreground"
                    }`}
                  >
                    {m.isEmergency && (
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-red-500">
                        <AlertTriangle size={15} />
                        Support Notice
                      </div>
                    )}
                    {m.content || (isStreaming && <TypingDots />)}
                  </div>

                  {/* Grounding Action Plan rendering */}
                  {m.plan && m.plan.length > 0 && <ActionPlan steps={m.plan} />}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Input & Dictation Controls */}
      <div className="glass flex items-end gap-2 rounded-2xl p-2 border border-emerald-500/10 dark:bg-emerald-950/30">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder={
            isListening
              ? "Listening to your voice... Speak clearly..."
              : "How are you feeling right now?"
          }
          rows={1}
          className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted"
        />

        {/* Speech-to-Text Dictation Button */}
        {speechSupported && (
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Stop Listening" : "Start Voice Dictation"}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "text-muted hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        )}

        {/* Send Button */}
        <button
          type="button"
          onClick={send}
          disabled={isStreaming || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white dark:text-emerald-950 bg-emerald-600 dark:bg-emerald-400 shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-current opacity-60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}
