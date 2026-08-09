"use client";

import { motion } from "framer-motion";
import { Headphones, Volume2, VolumeX, Play, Pause, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type SoundscapeId = "rain" | "wind" | "ocean" | "binaural";

interface SoundscapeTrack {
  id: SoundscapeId;
  name: string;
  category: string;
  icon: string;
  description: string;
  color: string;
}

const TRACKS: SoundscapeTrack[] = [
  {
    id: "rain",
    name: "Emerald Rain",
    category: "Nature Calm",
    icon: "🌧️",
    description: "Gentle, soothing rainfall for deep focus & anxiety reduction.",
    color: "#059669",
  },
  {
    id: "wind",
    name: "Deep Forest Wind",
    category: "Sanctuary",
    icon: "🌲",
    description: "Soft ambient breeze through pine trees to slow racing thoughts.",
    color: "#10b981",
  },
  {
    id: "ocean",
    name: "Calm Ocean Waves",
    category: "Grounding",
    icon: "🌊",
    description: "Rhythmic tide cycles synced with your natural breath.",
    color: "#0d9488",
  },
  {
    id: "binaural",
    name: "432Hz Healing Waves",
    category: "Binaural Tone",
    icon: "🩵",
    description: "Harmonic frequency designed for stress relief & mental clarity.",
    color: "#34d399",
  },
];

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function Soundscapes() {
  const [selectedId, setSelectedId] = useState<SoundscapeId>("rain");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);
  const oscSourceRef = useRef<OscillatorNode | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = TRACKS.find((t) => t.id === selectedId) || TRACKS[0];

  // Stop active synthesis
  const stopAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (noiseSourceRef.current) {
      try {
        (noiseSourceRef.current as AudioBufferSourceNode).stop();
      } catch {
        // ignore if already stopped
      }
      noiseSourceRef.current.disconnect();
      noiseSourceRef.current = null;
    }
    if (oscSourceRef.current) {
      try {
        oscSourceRef.current.stop();
      } catch {
        // ignore
      }
      oscSourceRef.current.disconnect();
      oscSourceRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.suspend();
    }
  };

  // Start sound synthesis based on track
  const startAudio = (trackId: SoundscapeId) => {
    stopAudio();

    if (typeof window === "undefined") return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: new () => AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }

    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    if (trackId === "rain" || trackId === "wind" || trackId === "ocean") {
      const buffer = createNoiseBuffer(ctx);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();

      if (trackId === "rain") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000, ctx.currentTime);
      } else if (trackId === "wind") {
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, ctx.currentTime);
        filter.Q.setValueAtTime(3, ctx.currentTime);
      } else if (trackId === "ocean") {
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600, ctx.currentTime);

        // LFO for wave gain oscillation
        timerRef.current = setInterval(() => {
          if (!audioCtxRef.current || !masterGainRef.current) return;
          const now = audioCtxRef.current.currentTime;
          const waveVal = (Math.sin(now * 0.8) + 1.2) * 0.4 * volume;
          masterGainRef.current.gain.setTargetAtTime(waveVal, now, 0.5);
        }, 200);
      }

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();
      noiseSourceRef.current = noiseSource;
    } else if (trackId === "binaural") {
      // 432Hz Sine Tone with soft modulation
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(432, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.3 * volume, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      oscSourceRef.current = osc;
    }
  };

  // Sync volume node
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
      setIsPlaying(false);
    } else {
      startAudio(selectedId);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (trackId: SoundscapeId) => {
    setSelectedId(trackId);
    if (isPlaying) {
      startAudio(trackId);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header Banner */}
      <div className="glass flex items-center justify-between rounded-3xl p-6 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <Headphones size={24} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-foreground">Calm Soundscapes</h2>
            <p className="text-xs text-muted">
              Web Audio synthesis for focus, deep breathing & anxiety relief.
            </p>
          </div>
        </div>

        {/* Master Play Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold text-white dark:text-emerald-950 shadow-md transition-all hover:scale-105 active:scale-95 bg-emerald-600 dark:bg-emerald-400"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          <span>{isPlaying ? "Pause Audio" : "Play Soundscape"}</span>
        </button>
      </div>

      {/* Active Track Control Card */}
      <div className="glass flex flex-col gap-5 rounded-3xl p-6 sm:p-8 border border-emerald-500/10 dark:bg-emerald-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentTrack.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-foreground">{currentTrack.name}</span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                  {currentTrack.category}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">{currentTrack.description}</p>
            </div>
          </div>

          {/* Sound Visualizer Waves */}
          {isPlaying && (
            <div className="flex items-end gap-1 h-8">
              {[0.4, 0.8, 0.5, 0.9, 0.6, 0.3].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-emerald-500"
                  animate={{ height: ["20%", `${h * 100}%`, "20%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Volume Controls */}
        <div className="flex items-center gap-4 rounded-2xl bg-emerald-500/5 p-4 border border-emerald-500/10">
          <button
            type="button"
            onClick={() => setVolume((v) => (v > 0 ? 0 : 0.5))}
            className="text-muted hover:text-foreground transition-colors"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.02}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-1.5 flex-1 accent-emerald-500 cursor-pointer rounded-lg bg-emerald-500/20"
          />

          <span className="text-xs font-bold text-muted w-10 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Grid of Soundscapes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TRACKS.map((t) => {
          const isSelected = selectedId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleSelectTrack(t.id)}
              className={`flex items-start gap-4 rounded-3xl p-5 text-left transition-all border ${
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                  : "border-emerald-500/10 glass hover:bg-emerald-500/5"
              }`}
            >
              <span className="text-3xl">{t.icon}</span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-foreground">{t.name}</span>
                  {isSelected && isPlaying && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                      <Sparkles size={12} className="animate-spin" /> Active
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted leading-relaxed">{t.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
