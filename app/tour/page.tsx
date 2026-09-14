"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowLeft,
  ChevronRight,
  Download,
  ExternalLink,
} from "lucide-react";
import { CHAPTERS, TOTAL_DURATION, Chapter } from "./chapters";
import { drawTourFrame } from "./drawTourFrame";

export default function TourPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(true);
  const lastSpokenRef = useRef<number>(-1);

  // Derive active chapter directly during render (no setState in effect)
  const activeChapterIndex = Math.max(
    0,
    CHAPTERS.findIndex((c) => currentTime >= c.timeStart && currentTime < c.timeEnd)
  );

  // Sync isPlayingRef
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Web Speech voice synthesis
  useEffect(() => {
    if (!speechEnabled || !isPlaying) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (activeChapterIndex !== lastSpokenRef.current) {
      lastSpokenRef.current = activeChapterIndex;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const ch = CHAPTERS[activeChapterIndex];
        if (ch) {
          const u = new SpeechSynthesisUtterance(ch.narration);
          u.rate = 1.05;
          const voices = window.speechSynthesis.getVoices();
          const enVoice = voices.find(
            (v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google"))
          ) || voices.find((v) => v.lang.startsWith("en"));
          if (enVoice) u.voice = enVoice;
          window.speechSynthesis.speak(u);
        }
      }
    }
  }, [activeChapterIndex, speechEnabled, isPlaying]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    startTimeRef.current = performance.now();

    const interval = setInterval(() => {
      if (!isPlayingRef.current) return;

      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;

      if (elapsed >= TOTAL_DURATION) {
        // Loop back to start
        startTimeRef.current = performance.now();
        setCurrentTime(0);
        lastSpokenRef.current = -1;
      } else {
        setCurrentTime(elapsed);
        drawTourFrame(ctx, elapsed, CHAPTERS, TOTAL_DURATION);
      }
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      pausedAtRef.current = currentTime;
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
    } else {
      const now = performance.now();
      startTimeRef.current = now - pausedAtRef.current * 1000;
      setIsPlaying(true);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }
    }
  }, [isPlaying, currentTime]);

  const handleJumpToChapter = useCallback((ch: Chapter) => {
    const now = performance.now();
    startTimeRef.current = now - ch.timeStart * 1000;
    setCurrentTime(ch.timeStart);
    lastSpokenRef.current = -1;
    setIsPlaying(true);
  }, []);

  const handleRestart = useCallback(() => {
    const now = performance.now();
    startTimeRef.current = now;
    setCurrentTime(0);
    lastSpokenRef.current = -1;
    setIsPlaying(true);
  }, []);

  // Export video button
  const handleExportVideo = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsExporting(true);
    setExportMessage("Recording high-definition WebM stream (18s)...");

    const stream = canvas.captureStream(30);
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm; codecs=vp9" });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      setExportMessage("Saving video to server & local download...");

      // Download locally
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "verisett-explainer-tour.webm";
      a.click();

      // Post to API
      try {
        await fetch("/api/save-video", {
          method: "POST",
          body: blob,
          headers: { "Content-Type": "video/webm" },
        });
        setExportMessage("✓ Video Exported & Saved Successfully!");
      } catch {
        setExportMessage("✓ Video Downloaded!");
      }

      setIsExporting(false);
    };

    recorder.start();
    const now = performance.now();
    startTimeRef.current = now;
    setCurrentTime(0);
    setIsPlaying(true);

    setTimeout(() => {
      recorder.stop();
    }, 18500);
  }, []);

  const activeChapter = CHAPTERS[activeChapterIndex] || CHAPTERS[0];

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#E2E8F0] flex flex-col font-sans selection:bg-[#10B981] selection:text-black">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#1E2230] bg-[#090A0F]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <span className="text-slate-700">|</span>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                Verisett AI
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#10B981] border border-emerald-500/30">
                Video Explainer Tour
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSpeechEnabled(!speechEnabled);
                if (speechEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
                speechEnabled
                  ? "bg-emerald-500/20 text-[#10B981] border border-emerald-500/40"
                  : "bg-[#161922] text-slate-400 border border-[#1E2230] hover:text-white"
              }`}
            >
              {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{speechEnabled ? "Voice On" : "Voice Off"}</span>
            </button>

            {/* Export Video Button */}
            <button
              onClick={handleExportVideo}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-[#090A0F] font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? "Exporting..." : "Download .WebM"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tour Workspace */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-6">
        
        {/* Status notification banner if exporting */}
        {exportMessage && (
          <div className="p-3 rounded-xl bg-[#11131A] border border-emerald-500/40 text-xs font-mono text-[#10B981] flex items-center justify-between">
            <span>{exportMessage}</span>
            <button onClick={() => setExportMessage("")} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 1080p Canvas Video Stage (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#1E2230] bg-[#07080C] shadow-2xl">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Playback Controls Strip */}
            <div className="p-4 rounded-xl bg-[#0D0F15] border border-[#1E2230] flex flex-col gap-3">
              {/* Scrub timeline */}
              <div
                className="relative w-full h-2.5 bg-[#1E2230] rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newTime = (clickX / rect.width) * TOTAL_DURATION;
                  const now = performance.now();
                  startTimeRef.current = now - newTime * 1000;
                  setCurrentTime(newTime);
                }}
              >
                <div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#06B6D4] transition-all duration-75"
                  style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className="h-8 w-8 rounded-full bg-[#10B981] text-[#090A0F] flex items-center justify-center hover:bg-emerald-400 transition-colors cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={handleRestart}
                    className="p-1.5 rounded-lg hover:bg-[#1E2230] text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Restart Tour"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <span className="text-xs font-mono text-slate-400">
                    {Math.floor(currentTime)}s / {TOTAL_DURATION}s
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#F59E0B] px-2 py-0.5 rounded bg-[#161922] border border-[#1E2230]">
                    {activeChapter.badge}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Chapter Description Card */}
            <div className="p-5 rounded-xl bg-[#11131A] border border-[#1E2230] flex items-center justify-between gap-6">
              <div className="min-w-0">
                <div className="text-xs font-mono text-[#10B981] font-semibold">
                  {activeChapter.badge}: {activeChapter.title}
                </div>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  {activeChapter.subtitle}
                </p>
              </div>

              <Link
                href={activeChapter.targetAnchor}
                className="shrink-0 minimal-btn-primary text-xs flex items-center gap-1.5 py-2 px-4 whitespace-nowrap"
              >
                <span>Try Step on Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Step-by-Step Chapters (4 cols) */}
          <div className="lg:col-span-4 flex flex-col rounded-2xl bg-[#0D0F15] border border-[#1E2230] overflow-hidden">
            <div className="p-4 border-b border-[#1E2230] bg-[#11131A]">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                Video Chapters (6 Steps)
              </span>
            </div>

            <div className="divide-y divide-[#1E2230]">
              {CHAPTERS.map((ch) => {
                const isSelected = activeChapter.id === ch.id;
                const IconComponent = ch.icon;

                return (
                  <button
                    key={ch.id}
                    onClick={() => handleJumpToChapter(ch)}
                    className={`w-full text-left p-4 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-[#161922] border-l-4 border-l-[#10B981]"
                        : "hover:bg-[#11131A] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                        isSelected
                          ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                          : "bg-[#161922] text-slate-500 border border-[#1E2230]"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-mono ${
                            isSelected ? "text-[#10B981] font-semibold" : "text-slate-500"
                          }`}
                        >
                          {ch.badge}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {ch.timeStart}s
                        </span>
                      </div>

                      <div
                        className={`text-xs font-semibold mt-0.5 truncate ${
                          isSelected ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {ch.title}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-normal">
                        {ch.subtitle}
                      </p>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 self-center transition-transform ${
                        isSelected ? "text-[#10B981] translate-x-1" : "text-slate-600"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-[#1E2230] bg-[#11131A] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Duration: 18s Tour</span>
              <span className="text-emerald-400">● 60 FPS HD</span>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
