"use client";

import { motion } from "framer-motion";
import { RotateCcw, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clearChatMemory, streamChat } from "@/lib/api";
import { addMoodRecord } from "@/lib/moodHistory";
import { ActionPlan } from "@/components/ActionPlan";
import { CrisisBanner } from "@/components/CrisisBanner";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  plan?: string[];
  isEmergency?: boolean;
}

interface ChatInterfaceProps {
  onMoodUpdate: (mood: string, severity: number) => void;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function ChatInterface({ onMoodUpdate }: ChatInterfaceProps) {
  const sessionId = useMemo(() => uid(), []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [crisisActive, setCrisisActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    setCrisisActive(false);
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };
    const assistantId = uid();
    setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
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
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + event.content } : m))
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

  return (
    <div className="flex h-full flex-col gap-4">
      {crisisActive && <CrisisBanner />}

      <div ref={scrollRef} className="glass flex-1 overflow-y-auto rounded-2xl p-4 sm:p-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-muted">
            <Sparkles className="animate-float-slow text-primary" size={28} />
            <p className="max-w-xs text-sm">
              Share what&apos;s on your mind. NeuraWell listens with care and offers gentle,
              grounding support.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex max-w-[85%] flex-col gap-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={
                      m.role === "user"
                        ? "rounded-2xl rounded-br-sm px-4 py-2.5 text-sm text-primary-foreground"
                        : "glass rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed"
                    }
                    style={m.role === "user" ? { background: "var(--primary)" } : undefined}
                  >
                    {m.content || (isStreaming && <TypingDots />)}
                  </div>
                  {m.plan && m.plan.length > 0 && <ActionPlan steps={m.plan} />}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="glass flex items-end gap-2 rounded-2xl p-2.5">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="How are you feeling right now?"
          rows={1}
          className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-muted"
        />
        <button
          type="button"
          onClick={handleClear}
          title="Clear conversation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-black/5 dark:hover:bg-white/5"
        >
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          onClick={send}
          disabled={isStreaming || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: "var(--primary)" }}
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
