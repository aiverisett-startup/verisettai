"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
} from "lucide-react";

interface Chapter {
  id: number;
  timeStart: number;
  timeEnd: number;
  title: string;
  badge: string;
  desc: string;
  icon: React.ElementType;
  targetAnchor?: string;
  narration: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    timeStart: 0,
    timeEnd: 5,
    badge: "01. OVERVIEW",
    title: "Autonomous Agent Settlement",
    desc: "Why AI agents need cryptographic escrow and micro-clearing rails without human intervention.",
    icon: ShieldCheck,
    targetAnchor: "#",
    narration: "Welcome to Verisett AI, the autonomous agent settlement gateway. When independent AI agents hire each other to perform work, they cannot rely on traditional banking. Verisett provides cryptographic escrow, schema verification, and instant micro-clearing with zero counterparty risk.",
  },
  {
    id: 2,
    timeStart: 5,
    timeEnd: 10,
    badge: "02. VAULT & MODES",
    title: "Unified Navigation & Vault Custody",
    desc: "Single-line top navigation, instant Sandbox/Mainnet switching, and pre-funded $10,000 vault balance.",
    icon: Layers,
    targetAnchor: "#",
    narration: "The top navigation keeps all controls on a single unified line. Toggle seamlessly between Sandbox and Mainnet environments, track your escrow vault balance, and deposit funds to back your autonomous agents.",
  },
  {
    id: 3,
    timeStart: 10,
    timeEnd: 15,
    badge: "03. SMART ESCROW",
    title: "Protocol Rails & 38ms Settlement",
    desc: "Autonomous deterministic state machine with 38ms settlement latency and double-spend prevention.",
    icon: Cpu,
    targetAnchor: "#architecture",
    narration: "Step 2 is the Protocol Architecture. When an agent initiates a task, capital is locked into an escrow smart vault. The deterministic state machine transitions through locking, worker assignment, and settlement in just 38 milliseconds.",
  },
  {
    id: 4,
    timeStart: 15,
    timeEnd: 20,
    badge: "04. ASSERTIONS",
    title: "Cryptographic Assertion Engine",
    desc: "Strict JSON Schema Draft 2020-12 validation guaranteeing output quality before any payment leaves custody.",
    icon: CheckCircle2,
    targetAnchor: "#assertions",
    narration: "Step 3 is the Assertion Engine. Funds are never released on trust alone. Verisett evaluates the worker agent's output against a strict JSON Schema specification. If validation fails, funds are automatically refunded.",
  },
  {
    id: 5,
    timeStart: 20,
    timeEnd: 25,
    badge: "05. MARKETPLACE",
    title: "Worker Marketplace & $5 Free Credit",
    desc: "Browse vetted web research, code auditing, and summarization agents with pre-funded testing credits.",
    icon: Sparkles,
    targetAnchor: "#marketplace",
    narration: "Step 4 is the Autonomous Worker Marketplace. Browse specialized utility agents for data extraction, code auditing, and document summarization. Every new developer receives five dollars in free test credits to execute real agent tasks.",
  },
  {
    id: 6,
    timeStart: 25,
    timeEnd: 30,
    badge: "06. LIVE CONSOLE",
    title: "Interactive Console & Proof Receipts",
    desc: "Execute live micro-settlement simulations, inspect sha256 transaction receipts, and verify the ledger.",
    icon: Terminal,
    targetAnchor: "#playground",
    narration: "Step 5 is the Interactive Console. Test live escrow creation, worker execution, and cryptographic assertion evaluation. Receive an immutable SHA-256 clearinghouse receipt confirming your settlement.",
  },
];

interface VideoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (anchor: string) => void;
}

export function VideoWalkthroughModal({
  isOpen,
  onClose,
  onNavigateSection,
}: VideoWalkthroughModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const lastSpokenChapterRef = useRef<number>(-1);

  // Derive active chapter directly during render (no setState in effect)
  const activeChapterIndex = Math.max(
    0,
    CHAPTERS.findIndex((c) => currentTime >= c.timeStart && currentTime < c.timeEnd)
  );

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    }
  }, [isPlaying]);

  // Voice narration using Web Speech API
  useEffect(() => {
    if (!speechEnabled || !isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (activeChapterIndex !== lastSpokenChapterRef.current) {
      lastSpokenChapterRef.current = activeChapterIndex;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const chapter = CHAPTERS[activeChapterIndex];
        if (chapter) {
          const utterance = new SpeechSynthesisUtterance(chapter.narration);
          utterance.rate = 1.05;
          utterance.pitch = 1.0;
          const voices = window.speechSynthesis.getVoices();
          const enVoice = voices.find(
            (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Microsoft"))
          ) || voices.find((v) => v.lang.startsWith("en"));
          if (enVoice) utterance.voice = enVoice;
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [activeChapterIndex, speechEnabled, isPlaying]);

  // Stop speech on close
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      lastSpokenChapterRef.current = -1;
    }
  }, [isOpen]);

  // Keyboard shortcut Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === " " && isOpen) {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, togglePlay]);

  if (!isOpen) return null;

  const handleSeek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleJumpToChapter = (chapter: Chapter) => {
    handleSeek(chapter.timeStart);
    lastSpokenChapterRef.current = -1; // trigger speech
    if (videoRef.current && !isPlaying) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
  };

  const handleRestart = () => {
    handleSeek(0);
    lastSpokenChapterRef.current = -1;
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleTryStepOnSite = (targetAnchor?: string) => {
    onClose();
    if (targetAnchor && onNavigateSection) {
      setTimeout(() => {
        onNavigateSection(targetAnchor);
      }, 100);
    }
  };

  const activeChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111317]/40 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white border border-[#E8E8E6] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E6] bg-white">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-[#FAFAF8] border border-[#E8E8E6] flex items-center justify-center text-[#111317]">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-[#111317]">
                  Verisett Protocol Walkthrough
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Step-by-Step
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Narration Audio Toggle */}
            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (speechEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                speechEnabled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-[#FAFAF8] text-[#6B7280] border border-[#E8E8E6] hover:text-[#111317]"
              }`}
              title="Toggle synchronized AI voice narration"
            >
              {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{speechEnabled ? "Voice On" : "Voice Off"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111317] hover:bg-[#FAFAF8] transition-colors"
              title="Close modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Video Stage (Left 7 cols) + Step-by-Step Chapters (Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Main Video Player Screen */}
          <div className="lg:col-span-8 flex flex-col bg-[#111317] relative">
            <div className="relative aspect-video w-full flex items-center justify-center bg-[#111317] overflow-hidden group">
              <video
                ref={videoRef}
                src="/how-it-works.webm"
                className="w-full h-full object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) setDuration(videoRef.current.duration || 30);
                }}
                onEnded={() => setIsPlaying(false)}
                playsInline
              />

              {/* Play Overlay Button if paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white text-[#111317] flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
              )}

              {/* Top Banner on video showing active chapter */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="px-2.5 py-1 rounded-md bg-[#111317]/80 backdrop-blur border border-white/10 text-[11px] font-mono text-emerald-400">
                  {activeChapter.badge}
                </div>
                <div className="px-2.5 py-1 rounded-md bg-[#111317]/80 backdrop-blur border border-white/10 text-[11px] font-mono text-white">
                  {Math.floor(currentTime)}s / {Math.floor(duration)}s
                </div>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="p-3 bg-[#181A20] border-t border-white/10 flex flex-col gap-2">
              {/* Scrub Bar with Chapter Markers */}
              <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * duration;
                  handleSeek(newTime);
                }}
              >
                <div
                  className="h-full bg-emerald-500 transition-all duration-100"
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                />
              </div>

              {/* Buttons Strip */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-mono text-white/70 text-[11px]">
                    {Math.floor(currentTime)}s / {Math.floor(duration)}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSpeedChange}
                    className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-white font-mono text-[11px]"
                  >
                    {playbackRate}x
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Active Step Explainer Card below video */}
            <div className="p-4 bg-white border-t border-[#E8E8E6] flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-emerald-600 font-semibold">
                  {activeChapter.badge}: {activeChapter.title}
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2 leading-relaxed">
                  {activeChapter.desc}
                </p>
              </div>

              {activeChapter.targetAnchor && (
                <button
                  onClick={() => handleTryStepOnSite(activeChapter.targetAnchor)}
                  className="shrink-0 minimal-btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3 cursor-pointer whitespace-nowrap"
                >
                  <span>Try on Website</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

          </div>

          {/* Right Column: Step-by-Step Chapters List */}
          <div className="lg:col-span-4 bg-[#FAFAF8] border-l border-[#E8E8E6] flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-[#E8E8E6] bg-white">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6B7280]">
                Walkthrough Chapters
              </span>
            </div>

            <div className="divide-y divide-[#E8E8E6] flex-1 overflow-y-auto">
              {CHAPTERS.map((ch, idx) => {
                const isSelected = activeChapterIndex === idx;
                const IconComponent = ch.icon;

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleJumpToChapter(ch)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-white border-l-2 border-l-[#111317] shadow-xs"
                        : "hover:bg-white/60 text-[#6B7280] hover:text-[#111317]"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                        isSelected
                          ? "bg-[#111317] text-white"
                          : "bg-white text-[#6B7280] border border-[#E8E8E6]"
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono ${
                            isSelected ? "text-[#111317] font-semibold" : "text-[#9CA3AF]"
                          }`}
                        >
                          {ch.badge}
                        </span>
                        <span className="text-[10px] font-mono text-[#9CA3AF]">
                          {ch.timeStart}s
                        </span>
                      </div>

                      <div
                        className={`text-xs font-medium mt-0.5 truncate ${
                          isSelected ? "text-[#111317] font-semibold" : "text-[#374151]"
                        }`}
                      >
                        {ch.title}
                      </div>

                      <p className="text-[11px] text-[#6B7280] line-clamp-2 mt-1 leading-normal">
                        {ch.desc}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 self-center transition-transform ${
                        isSelected ? "text-[#111317] translate-x-0.5" : "text-[#9CA3AF]"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Footer inside chapter panel */}
            <div className="p-3.5 border-t border-[#E8E8E6] bg-white flex items-center justify-between text-[11px] text-[#6B7280]">
              <span>Full Video Tour: 30s</span>
              <a
                href="/video-recorder.html"
                target="_blank"
                rel="noreferrer"
                className="text-[#111317] hover:underline font-mono"
              >
                Re-Record 1080p
              </a>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
