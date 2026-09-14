"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface AutonomousVerificationNetworkProps {
  className?: string;
  transparent?: boolean;
  accentColor?: string;
  interactive?: boolean;
  autoRotate?: boolean;
  showOverlayStats?: boolean;
}

export function AutonomousVerificationNetwork({
  className = "",
  transparent = false,
  accentColor = "#D4AF37",
  interactive = true,
  autoRotate = true,
  showOverlayStats = true,
}: AutonomousVerificationNetworkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pulseCount, setPulseCount] = useState(148);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    if (!transparent) {
      scene.background = new THREE.Color("#14120E"); // Luxury obsidian charcoal-gold background
    }

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 9.2);

    // 3. Renderer with High-Performance Alpha & Antialias
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Volumetric Soft Lighting Setup with Warm Golden Hues
    const ambientLight = new THREE.AmbientLight(0x211c14, 2.2);
    scene.add(ambientLight);

    // Warm Gold Key Light
    const goldKeyLight = new THREE.DirectionalLight(0xd4af37, 3.2);
    goldKeyLight.position.set(-6, 7, 5);
    scene.add(goldKeyLight);

    // Satin Gold Rim Light from opposite rear
    const rimLight = new THREE.DirectionalLight(0xc59b5f, 2.5);
    rimLight.position.set(6, -4, -4);
    scene.add(rimLight);

    // Soft Cream Fill Light
    const fillLight = new THREE.PointLight(0xfff8ee, 1.2, 18);
    fillLight.position.set(0, 5, 4);
    scene.add(fillLight);

    // Internal Core Glow Point (Incandescent Gold)
    const coreLight = new THREE.PointLight(0xf5e2a8, 2.8, 8);
    coreLight.position.set(0, -0.4, 0);
    scene.add(coreLight);

    // 5. Build Root Crystalline Network Group
    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // ==========================================
    // 6. Geometry: Faceted Crystalline "V" Structure
    // ==========================================
    // We define a sculpted 3D faceted geometry that narrows into a sharp consensus apex at bottom (Y: -2.4)
    // and splits into two sweeping architectural wing spires at top (Left: X: -2.2, Right: X: +2.2, Y: 2.2).
    const vertices = new Float32Array([
      // Front Top Left Wing
      -2.2, 2.2, 0.4,   // 0
      -1.4, 2.4, 0.7,   // 1
      -0.6, 1.1, 0.9,   // 2
      -1.5, 0.6, 0.8,   // 3

      // Front Top Right Wing
      2.2, 2.2, 0.4,    // 4
      1.4, 2.4, 0.7,    // 5
      0.6, 1.1, 0.9,    // 6
      1.5, 0.6, 0.8,    // 7

      // Center Nexus & Bifurcation
      0.0, 0.4, 1.1,    // 8: Center high crest
      0.0, -0.6, 1.0,   // 9: Mid junction

      // Lower Converging V-Arms
      -0.9, -1.2, 0.7,  // 10: Left lower taper
      0.9, -1.2, 0.7,   // 11: Right lower taper

      // Bottom Consensus Apex
      0.0, -2.4, 0.3,   // 12: Bottom sharp consensus point

      // Backside Keel Vertices for 3D Volume & Depth
      -1.8, 1.9, -0.6,  // 13: Back Left top
      1.8, 1.9, -0.6,   // 14: Back Right top
      0.0, 0.2, -0.9,   // 15: Back center keel
      0.0, -2.2, -0.4,  // 16: Back bottom apex
    ]);

    // Triangular facets for obsidian crystal body
    const indices = [
      // Left Wing Front Facets
      0, 1, 3,
      1, 2, 3,
      3, 2, 8,
      3, 8, 9,
      3, 9, 10,
      10, 9, 12,

      // Right Wing Front Facets
      4, 7, 5,
      5, 7, 6,
      7, 8, 6,
      7, 9, 8,
      7, 10, 9,
      7, 11, 9,
      11, 12, 9,

      // Central valley & apex
      8, 2, 6,
      8, 6, 9,
      9, 6, 11,
      9, 10, 12,
      9, 12, 11,

      // Left Wing Rear & Side Facets
      0, 13, 1,
      13, 15, 1,
      1, 15, 2,
      13, 16, 10,
      10, 16, 12,
      0, 3, 13,
      13, 3, 10,

      // Right Wing Rear & Side Facets
      4, 5, 14,
      14, 5, 15,
      5, 6, 15,
      14, 11, 16,
      11, 12, 16,
      4, 14, 7,
      14, 11, 7,

      // Rear Keel Closing
      15, 13, 16,
      15, 16, 14,
      8, 15, 6,
      8, 2, 15,
    ];

    const crystalGeometry = new THREE.BufferGeometry();
    crystalGeometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    crystalGeometry.setIndex(indices);
    crystalGeometry.computeVertexNormals();

    // 7. Material 1: Deep Obsidian Base with Frosted Glass Refractions
    const obsidianMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x070b14),
      emissive: new THREE.Color(0x02172b),
      emissiveIntensity: 0.35,
      roughness: 0.18,
      metalness: 0.88,
      transmission: 0.62, // Frosted refraction
      ior: 1.54,
      thickness: 1.6,
      transparent: true,
      opacity: 0.92,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.12,
      side: THREE.DoubleSide,
    });

    const crystalMesh = new THREE.Mesh(crystalGeometry, obsidianMaterial);
    networkGroup.add(crystalMesh);

    // 8. Glowing Cyan Edges Wireframe
    const edgesGeometry = new THREE.EdgesGeometry(crystalGeometry, 18);
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(accentColor),
      linewidth: 2,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    networkGroup.add(edgesMesh);

    // ==========================================
    // 9. Illuminated Nodal Vertices
    // ==========================================
    const keyNodePositions = [
      new THREE.Vector3(-2.2, 2.2, 0.4),  // Top Left Wing Apex
      new THREE.Vector3(-1.4, 2.4, 0.7),  // Left Outer Crest
      new THREE.Vector3(-0.6, 1.1, 0.9),  // Left Shoulder
      new THREE.Vector3(2.2, 2.2, 0.4),   // Top Right Wing Apex
      new THREE.Vector3(1.4, 2.4, 0.7),   // Right Outer Crest
      new THREE.Vector3(0.6, 1.1, 0.9),   // Right Shoulder
      new THREE.Vector3(0.0, 0.4, 1.1),   // Central High Nexus
      new THREE.Vector3(0.0, -0.6, 1.0),  // Core Router
      new THREE.Vector3(-0.9, -1.2, 0.7), // Left Mid Gate
      new THREE.Vector3(0.9, -1.2, 0.7),  // Right Mid Gate
      new THREE.Vector3(0.0, -2.4, 0.3),  // Bottom Consensus Apex
    ];

    const nodeGeometry = new THREE.SphereGeometry(0.075, 16, 16);
    const apexGeometry = new THREE.SphereGeometry(0.12, 24, 24);

    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xe0f2fe),
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 2.4,
      roughness: 0.2,
      metalness: 0.5,
    });

    const apexMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0xffffff),
      emissive: new THREE.Color(0x38bdf8),
      emissiveIntensity: 3.5,
      roughness: 0.1,
      metalness: 0.8,
    });

    const nodesGroup = new THREE.Group();
    keyNodePositions.forEach((pos, idx) => {
      const isConsensusApex = idx === keyNodePositions.length - 1;
      const mesh = new THREE.Mesh(
        isConsensusApex ? apexGeometry : nodeGeometry,
        isConsensusApex ? apexMaterial : nodeMaterial
      );
      mesh.position.copy(pos);
      nodesGroup.add(mesh);

      // Add a subtle halo ring around the consensus apex
      if (isConsensusApex) {
        const ringGeo = new THREE.RingGeometry(0.18, 0.22, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xd4af37,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.rotation.x = Math.PI / 2;
        nodesGroup.add(ring);
      }
    });
    networkGroup.add(nodesGroup);

    // ==========================================
    // 10. Network Struts & Traveling Micro-Pulses of Light
    // ==========================================
    const strutPairs = [
      [keyNodePositions[0], keyNodePositions[2]],
      [keyNodePositions[2], keyNodePositions[6]],
      [keyNodePositions[3], keyNodePositions[5]],
      [keyNodePositions[5], keyNodePositions[6]],
      [keyNodePositions[6], keyNodePositions[7]],
      [keyNodePositions[7], keyNodePositions[8]],
      [keyNodePositions[7], keyNodePositions[9]],
      [keyNodePositions[8], keyNodePositions[10]],
      [keyNodePositions[9], keyNodePositions[10]],
      [keyNodePositions[1], keyNodePositions[7]],
      [keyNodePositions[4], keyNodePositions[7]],
    ];

    // Build Strut Lines (Satin Gold)
    const strutLinesGroup = new THREE.Group();
    const strutMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(0xc59b5f),
      transparent: true,
      opacity: 0.55,
    });

    strutPairs.forEach(([start, end]) => {
      const geom = new THREE.BufferGeometry().setFromPoints([start, end]);
      const line = new THREE.Line(geom, strutMaterial);
      strutLinesGroup.add(line);
    });
    networkGroup.add(strutLinesGroup);

    // Traveling Energy Pulses (Brilliant Golden Photons moving along struts)
    const pulseGeometry = new THREE.SphereGeometry(0.045, 12, 12);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xfff0b3),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    const activePulses: {
      mesh: THREE.Mesh;
      start: THREE.Vector3;
      end: THREE.Vector3;
      progress: number;
      speed: number;
    }[] = [];

    // Initialize 6 traveling photon pulses
    for (let i = 0; i < 6; i++) {
      const pair = strutPairs[i % strutPairs.length];
      const mesh = new THREE.Mesh(pulseGeometry, pulseMaterial);
      mesh.position.copy(pair[0]);
      networkGroup.add(mesh);
      activePulses.push({
        mesh,
        start: pair[0],
        end: pair[1],
        progress: (i / 6),
        speed: 0.008 + Math.random() * 0.006,
      });
    }

    // ==========================================
    // 11. Surrounding Volumetric Orbital Ring & Dust
    // ==========================================
    const orbitRingGeo = new THREE.TorusGeometry(3.6, 0.015, 16, 100);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x = Math.PI / 2.3;
    orbitRing.rotation.y = -0.2;
    networkGroup.add(orbitRing);

    // Outer faint dust particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particleCoords = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particleCoords[i] = (Math.random() - 0.5) * 10;
      particleCoords[i + 1] = (Math.random() - 0.5) * 8;
      particleCoords[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particleCoords, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.04,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(dustParticles);

    // ==========================================
    // 12. Cursor Interactivity & Zero-Gravity Inertia
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      mouseX = (x - 0.5) * 2;
      mouseY = (y - 0.5) * 2;

      targetRotationY = mouseX * 0.45;
      targetRotationX = mouseY * 0.35;
    };

    const handleMouseLeave = () => {
      targetRotationX = 0;
      targetRotationY = 0;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // ==========================================
    // 13. Render Loop with Inertia Drift & Photons
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Zero-Gravity Rotational Drift on Idle
      if (autoRotate) {
        networkGroup.rotation.y += 0.0035;
        networkGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.12;
      }

      // Mild Inertia Tilt responding to cursor (Parallax depth)
      networkGroup.rotation.y += (targetRotationY - networkGroup.rotation.y) * 0.04;
      networkGroup.rotation.x += (targetRotationX - networkGroup.rotation.x) * 0.04;

      // Ambient breathing on nodal materials
      const pulseIntensity = 2.0 + Math.sin(elapsedTime * 2.2) * 0.6;
      nodeMaterial.emissiveIntensity = pulseIntensity;
      apexMaterial.emissiveIntensity = pulseIntensity * 1.3;

      // Update Traveling Micro-Pulses of Light
      activePulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1) {
          pulse.progress = 0;
          const newPair = strutPairs[Math.floor(Math.random() * strutPairs.length)];
          pulse.start = newPair[0];
          pulse.end = newPair[1];
        }

        pulse.mesh.position.lerpVectors(pulse.start, pulse.end, pulse.progress);
        const scale = 0.8 + Math.sin(pulse.progress * Math.PI) * 0.5;
        pulse.mesh.scale.set(scale, scale, scale);
      });

      // Slowly rotate dust particles for volumetric depth
      dustParticles.rotation.y = elapsedTime * 0.02;
      orbitRing.rotation.z = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    // Telemetry updates
    const statsInterval = setInterval(() => {
      setPulseCount((prev) => prev + 1);
    }, 2400);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(statsInterval);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      // Dispose Three.js Resources
      crystalGeometry.dispose();
      obsidianMaterial.dispose();
      edgesGeometry.dispose();
      edgesMaterial.dispose();
      nodeGeometry.dispose();
      apexGeometry.dispose();
      nodeMaterial.dispose();
      apexMaterial.dispose();
      pulseGeometry.dispose();
      pulseMaterial.dispose();
      orbitRingGeo.dispose();
      orbitRingMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [transparent, accentColor, interactive, autoRotate]);

  return (
    <div className={`relative w-full h-full overflow-hidden select-none ${className}`}>
      {/* Three.js Canvas Mount */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Network Telemetry HUD Overlay */}
      {showOverlayStats && (
        <div className="absolute top-4 left-4 pointer-events-none flex flex-col gap-1.5 font-mono text-[11px]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#14120E]/90 backdrop-blur-md border border-[#C59B5F]/40 text-[#FAF6EE] shadow-lg">
            <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-ping" />
            <span className="font-semibold tracking-wider uppercase">
              Consensus Apex Network // Active
            </span>
          </div>
          <div className="px-3 py-1 text-[10px] text-[#C59B5F]/90 font-mono">
            Strut Pulses: <span className="text-[#D4AF37] font-bold">{pulseCount}</span> • Rotational Drift: 0.0035 rad/s
          </div>
        </div>
      )}

      {/* Interactive Helper Hint */}
      {showOverlayStats && (
        <div className="absolute bottom-4 right-4 pointer-events-none text-[10px] font-mono text-[#D4AF37]/90 bg-[#14120E]/85 px-2.5 py-1 rounded border border-[#C59B5F]/30 backdrop-blur-xs">
          Interactive Parallax: Move Cursor to Tilt
        </div>
      )}
    </div>
  );
}
export default AutonomousVerificationNetwork;
