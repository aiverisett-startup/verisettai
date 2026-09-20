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
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  Terminal,
  Film,
  Sparkle,
} from "lucide-react";
import { drawTourFrame } from "@/app/tour/drawTourFrame";

export interface Chapter {
  id: number;
  timeStart: number;
  timeEnd: number;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  icon: React.ElementType;
  targetAnchor: string;
  narration: string;
}

export const TOTAL_DURATION = 30; // 30 seconds total (5s per chapter)

export const CHAPTERS: Chapter[] = [
  {
    id: 1,
    timeStart: 0,
    timeEnd: 5,
    badge: "CHAPTER 01 / 06",
    title: "Autonomous Agent Settlement",
    subtitle: "Why AI agents need cryptographic escrow and micro-clearing rails",
    desc: "When autonomous agents transact, Verisett provides cryptographic escrow, schema verification, and instant micro-clearing with zero counterparty risk.",
    icon: ShieldCheck,
    targetAnchor: "#",
    narration: "Welcome to Verisett AI, the autonomous agent settlement gateway. When independent AI agents hire each other to perform work, they cannot rely on traditional banking. Verisett provides cryptographic escrow, schema verification, and instant micro-clearing with zero counterparty risk.",
  },
  {
    id: 2,
    timeStart: 5,
    timeEnd: 10,
    badge: "CHAPTER 02 / 06",
    title: "Global Control & Vault Custody",
    subtitle: "Single-line top navigation, Sandbox/Mainnet switcher & $10,000 Vault",
    desc: "Unified single-line navigation. Toggle seamlessly between Sandbox and Live Mainnet, track your vault balance, and deposit pre-funded budgets.",
    icon: Layers,
    targetAnchor: "#",
    narration: "The top navigation keeps all controls on a single unified line. Toggle seamlessly between Sandbox and Mainnet environments, track your escrow vault balance, and deposit funds to back your autonomous agents.",
  },
  {
    id: 3,
    timeStart: 10,
    timeEnd: 15,
    badge: "CHAPTER 03 / 06",
    title: "Protocol Rails: Smart Escrow Locking",
    subtitle: "Deterministic state machine with 38ms settlement latency & zero double-spend",
    desc: "Capital is locked in a deterministic state machine: Escrow Init, Worker Claim, Assertion Verify, and Settled Release in 38 milliseconds.",
    icon: Cpu,
    targetAnchor: "#architecture",
    narration: "Step 2 is the Protocol Architecture. When an agent initiates a task, capital is locked into an escrow smart vault. The deterministic state machine transitions through locking, worker assignment, and settlement in just 38 milliseconds.",
  },
  {
    id: 4,
    timeStart: 15,
    timeEnd: 20,
    badge: "CHAPTER 04 / 06",
    title: "Cryptographic Assertion Engine",
    subtitle: "Real-time JSON Schema Draft 2020-12 validation before payment release",
    desc: "Funds are never released on trust. Verisett strictly evaluates the worker agent's output against a JSON Schema Draft 2020-12 specification.",
    icon: CheckCircle2,
    targetAnchor: "#assertions",
    narration: "Step 3 is the Assertion Engine. Funds are never released on trust alone. Verisett evaluates the worker agent's output against a strict JSON Schema specification. If validation fails, funds are automatically refunded.",
  },
  {
    id: 5,
    timeStart: 20,
    timeEnd: 25,
    badge: "CHAPTER 05 / 06",
    title: "Autonomous Worker Marketplace",
    subtitle: "Hire specialized web search, code audit & summarization workers",
    desc: "Browse specialized worker agents for web search, security auditing, and document summarization. Test with $5 in free credits.",
    icon: Sparkles,
    targetAnchor: "#marketplace",
    narration: "Step 4 is the Autonomous Worker Marketplace. Browse specialized utility agents for data extraction, code auditing, and document summarization. Every new developer receives five dollars in free test credits to execute real agent tasks.",
  },
  {
    id: 6,
    timeStart: 25,
    timeEnd: 30,
    badge: "CHAPTER 06 / 06",
    title: "Interactive Console & Instant Settlement",
    subtitle: "Cryptographic release, sha256 ledger proof & zero double-spend",
    desc: "Execute live simulations, inspect SHA-256 clearinghouse receipts, and verify cryptographic state changes in real time.",
    icon: Terminal,
    targetAnchor: "#sandbox",
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [viewMode, setViewMode] = useState<"walkthrough" | "cinematic">("walkthrough");
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const lastSpokenChapterRef = useRef<number>(-1);
  const isPlayingRef = useRef<boolean>(true);
  const playbackRateRef = useRef<number>(1);

  // Sync refs
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  // Derive active chapter directly during render
  const activeChapterIndex = Math.max(
    0,
    CHAPTERS.findIndex((c) => currentTime >= c.timeStart && currentTime < c.timeEnd)
  );

  // Auto-play when opened
  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setCurrentTime(0);
      lastSpokenChapterRef.current = -1;
    } else {
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      lastSpokenChapterRef.current = -1;
    }
  }, [isOpen]);

  // Main Canvas Render Loop (60 FPS high-definition vector graphics)
  useEffect(() => {
    if (!isOpen || viewMode !== "walkthrough") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw initial frame immediately
    drawTourFrame(ctx, currentTime, CHAPTERS, TOTAL_DURATION);

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      if (isPlayingRef.current) {
        setCurrentTime((prev) => {
          const next = prev + delta * playbackRateRef.current;
          if (next >= TOTAL_DURATION) {
            // Loop back to beginning
            lastSpokenChapterRef.current = -1;
            drawTourFrame(ctx, 0, CHAPTERS, TOTAL_DURATION);
            return 0;
          }
          drawTourFrame(ctx, next, CHAPTERS, TOTAL_DURATION);
          return next;
        });
      } else {
        // Redraw current static frame
        drawTourFrame(ctx, currentTime, CHAPTERS, TOTAL_DURATION);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isOpen, viewMode]);

  // Immediate redraw when scrubbing or jumping while paused
  useEffect(() => {
    if (!isOpen || viewMode !== "walkthrough" || isPlaying) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawTourFrame(ctx, currentTime, CHAPTERS, TOTAL_DURATION);
  }, [currentTime, isOpen, viewMode, isPlaying]);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      if (videoRef.current) videoRef.current.pause();
    } else {
      setIsPlaying(true);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
      if (videoRef.current) videoRef.current.play().catch(() => {});
    }
  }, [isPlaying]);

  // Speech narration synchronized with active chapter
  useEffect(() => {
    if (!speechEnabled || !isPlaying || !isOpen) {
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
          utterance.rate = 1.05 * playbackRate;
          utterance.pitch = 1.0;
          const voices = window.speechSynthesis.getVoices();
          const enVoice =
            voices.find(
              (v) =>
                v.lang.startsWith("en") &&
                (v.name.includes("Natural") ||
                  v.name.includes("Google") ||
                  v.name.includes("Microsoft") ||
                  v.name.includes("Samantha"))
            ) || voices.find((v) => v.lang.startsWith("en"));
          if (enVoice) utterance.voice = enVoice;
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [activeChapterIndex, speechEnabled, isPlaying, isOpen, playbackRate]);

  // Stop speech on close
  useEffect(() => {
    if (!isOpen && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      lastSpokenChapterRef.current = -1;
    }
  }, [isOpen]);

  // Keyboard shortcut Esc / Space
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
    const clampedTime = Math.max(0, Math.min(TOTAL_DURATION, time));
    setCurrentTime(clampedTime);
    lastSpokenChapterRef.current = -1; // re-trigger narration for that chapter
    if (videoRef.current) videoRef.current.currentTime = clampedTime;
  };

  const handleJumpToChapter = (chapter: Chapter) => {
    handleSeek(chapter.timeStart);
    setIsPlaying(true);
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
  };

  const handleRestart = () => {
    handleSeek(0);
    setIsPlaying(true);
  };

  const handleTryStepOnSite = (targetAnchor?: string) => {
    onClose();
    if (targetAnchor && onNavigateSection) {
      setTimeout(() => {
        onNavigateSection(targetAnchor);
      }, 150);
    }
  };

  const activeChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111317]/60 backdrop-blur-md p-2 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white border border-[#E8E8E6] shadow-[0_25px_60px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E8E8E6] bg-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-8 w-8 rounded-xl bg-[#FAF8F5] border border-[#EAE3D2] flex items-center justify-center text-[#9E7A45] shadow-2xs">
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-[#1C1A17]">
                  Verisett Protocol Walkthrough
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Interactive Video Tour
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Interactive Walkthrough vs HD Teaser */}
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-[#FAF8F5] border border-[#EAE3D2] text-[11px] font-mono">
              <button
                onClick={() => setViewMode("walkthrough")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === "walkthrough"
                    ? "bg-white text-[#9E7A45] shadow-xs font-semibold"
                    : "text-[#8C8275] hover:text-[#1C1A17]"
                }`}
              >
                <Sparkle className="w-3 h-3" />
                <span>6-Step Tour</span>
              </button>
              <button
                onClick={() => setViewMode("cinematic")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  viewMode === "cinematic"
                    ? "bg-white text-[#9E7A45] shadow-xs font-semibold"
                    : "text-[#8C8275] hover:text-[#1C1A17]"
                }`}
              >
                <Film className="w-3 h-3" />
                <span>HD Teaser</span>
              </button>
            </div>

            {/* Voice Narration Audio Toggle */}
            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (speechEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                speechEnabled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-[#FAFAF8] text-[#6B7280] border border-[#E8E8E6] hover:text-[#111317]"
              }`}
              title="Toggle AI synchronized voice narration"
            >
              {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden xs:inline">{speechEnabled ? "Voice On" : "Voice Off"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111317] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
              title="Close modal (Esc)"
              aria-label="Close walkthrough modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Video Stage (Left 8 cols) + Step-by-Step Chapters (Right 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-0">
          
          {/* Main Stage Screen */}
          <div className="lg:col-span-8 flex flex-col bg-[#090A0F] relative overflow-hidden">
            
            {/* Visual Display Container */}
            <div className="relative aspect-video w-full flex items-center justify-center bg-[#07080C] overflow-hidden group">
              
              {/* Mode 1: High-Performance Interactive Canvas */}
              {viewMode === "walkthrough" ? (
                <canvas
                  ref={canvasRef}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-contain block select-none cursor-pointer"
                  onClick={togglePlay}
                />
              ) : (
                /* Mode 2: Cinematic MP4 Video */
                <video
                  ref={videoRef}
                  src="/how-it-works.mp4"
                  className="w-full h-full object-contain block"
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                  }}
                  onEnded={() => setIsPlaying(false)}
                  autoPlay
                  playsInline
                  loop
                />
              )}

              {/* Centered Play Overlay Button when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-white/95 hover:bg-white text-[#111317] flex items-center justify-center shadow-2xl hover:scale-110 transition-all cursor-pointer z-20 backdrop-blur-xs"
                  aria-label="Play video"
                >
                  <Play className="w-7 h-7 fill-current ml-1 text-[#1C1A17]" />
                </button>
              )}

              {/* Floating Top HUD on video stage */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                <div className="px-2.5 py-1 rounded-md bg-[#090A0F]/80 backdrop-blur border border-white/10 text-[11px] font-mono text-emerald-400">
                  {activeChapter.badge}
                </div>
                <div className="px-2.5 py-1 rounded-md bg-[#090A0F]/80 backdrop-blur border border-white/10 text-[11px] font-mono text-white">
                  {Math.floor(currentTime)}s / {TOTAL_DURATION}s
                </div>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="p-3 bg-[#11131A] border-t border-white/10 flex flex-col gap-2 shrink-0">
              
              {/* Scrub Bar with Chapter Markers */}
              <div
                className="relative w-full h-2.5 bg-white/15 hover:h-3.5 rounded-full overflow-hidden cursor-pointer transition-all group/scrub"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * TOTAL_DURATION;
                  handleSeek(newTime);
                }}
              >
                {/* Progress bar fill */}
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-75"
                  style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
                />

                {/* Chapter dividers */}
                {CHAPTERS.map((ch) => (
                  <div
                    key={ch.id}
                    className="absolute top-0 bottom-0 w-0.5 bg-[#090A0F]/80 pointer-events-none"
                    style={{ left: `${(ch.timeStart / TOTAL_DURATION) * 100}%` }}
                  />
                ))}
              </div>

              {/* Action Buttons Strip */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-1.5 rounded-md hover:bg-white/15 text-white transition-colors cursor-pointer"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-1.5 rounded-md hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Restart from beginning"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-mono text-white/80 text-[11px] ml-1">
                    {Math.floor(currentTime)}s / {TOTAL_DURATION}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Speed toggle */}
                  <button
                    onClick={handleSpeedChange}
                    className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 border border-white/10 text-white font-mono text-[11px] cursor-pointer"
                    title="Cycle playback speed"
                  >
                    {playbackRate}x
                  </button>

                  {/* Narration toggle in player bar */}
                  <button
                    onClick={() => setSpeechEnabled(!speechEnabled)}
                    className="p-1.5 rounded-md hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title={speechEnabled ? "Mute speech narration" : "Enable speech narration"}
                  >
                    {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Active Step Explainer Card below video */}
            <div className="p-4 bg-white border-t border-[#E8E8E6] flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-emerald-700">
                    {activeChapter.badge}
                  </span>
                  <span className="text-xs font-semibold text-[#1C1A17] truncate">
                    {activeChapter.title}
                  </span>
                </div>
                <p className="text-xs text-[#6E675D] mt-1 line-clamp-2 leading-relaxed">
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
          <div className="lg:col-span-4 bg-[#FAFAF8] border-t lg:border-t-0 lg:border-l border-[#E8E8E6] flex flex-col overflow-y-auto">
            <div className="p-3.5 border-b border-[#E8E8E6] bg-white flex items-center justify-between shrink-0">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#6E675D]">
                Walkthrough Steps
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] text-[#8C8275] border border-[#EAE3D2]">
                6 Chapters
              </span>
            </div>

            <div className="divide-y divide-[#EAE3D2] flex-1 overflow-y-auto">
              {CHAPTERS.map((ch, idx) => {
                const isSelected = activeChapterIndex === idx;
                const IconComponent = ch.icon;

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleJumpToChapter(ch)}
                    className={`w-full text-left p-3.5 sm:p-4 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-white border-l-3 border-l-[#C59B5F] shadow-xs"
                        : "hover:bg-white/70 text-[#6E675D] hover:text-[#1C1A17]"
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                        isSelected
                          ? "bg-[#1C1A17] text-[#C59B5F]"
                          : "bg-white text-[#8C8275] border border-[#EAE3D2]"
                      }`}
                    >
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[10px] font-mono font-bold ${
                            isSelected ? "text-[#C59B5F]" : "text-[#8C8275]"
                          }`}
                        >
                          {ch.badge}
                        </span>
                        <span className="text-[10px] font-mono text-[#8C8275]">
                          {ch.timeStart}s
                        </span>
                      </div>

                      <div
                        className={`text-xs font-semibold mt-0.5 ${
                          isSelected ? "text-[#1C1A17]" : "text-[#4B5563]"
                        }`}
                      >
                        {ch.title}
                      </div>

                      <p className="text-[11px] text-[#8C8275] line-clamp-2 mt-1 leading-snug">
                        {ch.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
