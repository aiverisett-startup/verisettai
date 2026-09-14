"use client";

import React, { useEffect, useState } from "react";

export default function AmbientBackdrop() {
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden bg-[#faf9f6]">
      {/* Dynamic Soft Cursor Follower */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[120px] transition-transform duration-500 ease-out pointer-events-none"
        style={{
          transform: `translate(${mousePos.x - 250}px, ${mousePos.y - 250}px)`,
        }}
      />

      {/* Very Subtle Ambient Atmospheric Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-blue-50/50 via-zinc-100/30 to-transparent rounded-full blur-[140px]" />
    </div>
  );
}
