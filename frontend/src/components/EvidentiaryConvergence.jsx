import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Sliders, Sparkles, Maximize2, ShieldAlert } from 'lucide-react';

/**
 * EvidentiaryConvergence — 3D Particle Swarm & Money Flow Vortex Visualizer
 *
 * Simulates transaction particles spiraling inward from routine banking activity (blue)
 * toward the high-risk investigation core (crimson red) as risk compounds along the trail.
 */
const EvidentiaryConvergence = ({ isEmbedded = false, onClose }) => {
  const containerRef = useRef(null);
  const animFrameId = useRef(null);

  // User-configurable controls
  const [speed, setSpeed] = useState(0.25);
  const [swirl, setSwirl] = useState(4.0);
  const [outerRadius, setOuterRadius] = useState(90);
  const [coreRadius, setCoreRadius] = useState(2.0);
  const [chaos, setChaos] = useState(1.5);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(!isEmbedded);

  // References to keep render loop in sync without tearing down Three.js scene
  const paramsRef = useRef({ speed, swirl, outerRadius, coreRadius, chaos, isPlaying });
  useEffect(() => {
    paramsRef.current = { speed, swirl, outerRadius, coreRadius, chaos, isPlaying };
  }, [speed, swirl, outerRadius, coreRadius, chaos, isPlaying]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // ─── 1. Scene, Camera, Renderer ──────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080d18, 0.0035);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 45, 110);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x080d18, 1);
    container.appendChild(renderer.domElement);

    // ─── 2. Investigation Core Visual (Pulsing Center) ────────────────────────
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner glowing sphere
    const coreGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.9,
    });
    const coreSphere = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreSphere);

    // Outer orbital wireframe rings
    const ringGeo1 = new THREE.RingGeometry(4.0, 4.4, 48);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(6.5, 6.8, 48);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 6;
    coreGroup.add(ring2);

    // ─── 3. Particle System Instantiation (4,000 convergence nodes) ───────────
    const particleCount = 4000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorHelper = new THREE.Color();
    const targetHelper = new THREE.Vector3();

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Material
    const pMaterial = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(geometry, pMaterial);
    scene.add(particleSystem);

    // ─── 4. Mouse Interactive Camera Orbit ────────────────────────────────────
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = { radius: 120, theta: 0, phi: Math.PI / 3 };

    const updateCameraFromSpherical = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 0, 0);
    };
    updateCameraFromSpherical();

    const onMouseDown = (e) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));
      updateCameraFromSpherical();
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e) => {
      spherical.radius = Math.max(30, Math.min(220, spherical.radius + e.deltaY * 0.08));
      updateCameraFromSpherical();
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: true });

    // ─── 5. Animation Render Loop ─────────────────────────────────────────────
    let clock = new THREE.Clock();
    let totalTime = 0;

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const { speed: sp, swirl: sw, outerRadius: oRad, coreRadius: cRad, chaos: ch, isPlaying: play } = paramsRef.current;

      if (play) {
        totalTime += delta;
      }
      const time = totalTime;

      // Animate core pulsing & rings
      const pulse = 1.0 + Math.sin(time * 3.5) * 0.12;
      coreSphere.scale.set(pulse, pulse, pulse);
      ring1.rotation.z = time * 0.4;
      ring2.rotation.z = -time * 0.3;

      const posAttr = geometry.attributes.position;
      const colAttr = geometry.attributes.color;
      const posArr = posAttr.array;
      const colArr = colAttr.array;

      const streamCount = 12;
      const safeStreamCount = streamCount > 0 ? streamCount : 1;

      // ─── Evidentiary Convergence Particle Physics Loop ──────────────────────
      for (let i = 0; i < particleCount; i++) {
        const streamId = i % streamCount;
        const baseAngle = (streamId / safeStreamCount) * Math.PI * 2.0;

        const seed = (i * 12.9898) % 1000;
        const phase = (seed / 1000) + time * sp;
        const t = phase - Math.floor(phase);

        const jitter = Math.sin(seed * 3.71 + time * 0.5) * ch;
        const radius = cRad + (oRad - cRad) * (1.0 - t) + jitter;

        const angle = baseAngle + t * sw + time * 0.15;
        const wave = Math.sin(baseAngle * 3.0 + time * 1.2) * (1.0 - t) * 10.0;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = wave + Math.sin(time * 0.8 + seed) * 2.0 * (1.0 - t);

        targetHelper.set(x, y, z);

        const idx3 = i * 3;
        posArr[idx3]     = targetHelper.x;
        posArr[idx3 + 1] = targetHelper.y;
        posArr[idx3 + 2] = targetHelper.z;

        // Color computation: Routine Activity Blue (0.58) -> Risk Core Red (0.00)
        const hue = 0.58 - t * 0.58;
        const sat = 0.85;
        const light = Math.min(0.35 + (1.0 - t) * 0.15 + Math.max(0, 0.25 - t), 0.85);
        colorHelper.setHSL(hue, sat, light);

        colArr[idx3]     = colorHelper.r;
        colArr[idx3 + 1] = colorHelper.g;
        colArr[idx3 + 2] = colorHelper.b;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Subtle slow scene rotation
      if (!isDragging) {
        spherical.theta += 0.0012;
        updateCameraFromSpherical();
      }

      renderer.render(scene, camera);
    };

    animate();

    // ─── 6. Resize Handler ───────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      renderer.dispose();
      if (domEl.parentNode) domEl.parentNode.removeChild(domEl);
    };
  }, []);

  return (
    <div className={`relative w-full h-full bg-[#080D18] select-none overflow-hidden ${isEmbedded ? 'rounded-sm border border-[#1A2640]' : ''}`}>
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ─── Top Narrative Info Banner ─── */}
      <div className="absolute top-4 left-4 max-w-md p-3.5 bg-[#0C1220]/90 backdrop-blur-md border border-[#1A2640] rounded-sm shadow-2xl z-20 pointer-events-auto">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100">
            Evidentiary Convergence
          </h3>
          <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase ml-auto">
            3D SWARM ENGINE
          </span>
        </div>
        <p className="text-[10.5px] font-mono text-slate-300 leading-relaxed">
          Transaction particles spiral inward from routine activity (<span className="text-blue-400 font-bold">blue</span>) toward the investigation core (<span className="text-rose-400 font-bold">red</span>) as risk compounds along the money trail.
        </p>

        {/* Legend / Key */}
        <div className="flex items-center gap-3 mt-2.5 pt-2 border-t border-[#1A2640]/70 text-[9px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-400">Routine Inflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-slate-400">Layering Swarm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-400 font-bold">Investigation Core</span>
          </div>
        </div>
      </div>

      {/* ─── Top Right Action Buttons ─── */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1220]/90 backdrop-blur-md border border-[#1A2640] hover:border-[#243352] text-slate-300 hover:text-white rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
        >
          {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
          <span>{isPlaying ? 'Pause' : 'Resume'}</span>
        </button>

        <button
          onClick={() => setShowControls(!showControls)}
          className={`flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1220]/90 backdrop-blur-md border rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${
            showControls ? 'border-blue-500/50 text-blue-400' : 'border-[#1A2640] text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>Controls</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 bg-[#0C1220]/90 border border-[#1A2640] hover:border-rose-500/50 text-slate-400 hover:text-rose-300 rounded-sm text-[10px] font-mono transition-all"
          >
            ✕
          </button>
        )}
      </div>

      {/* ─── Floating Parameter Controls Drawer ─── */}
      {showControls && (
        <div className="absolute bottom-4 left-4 p-4 bg-[#0C1220]/95 backdrop-blur-md border border-[#1A2640] rounded-sm shadow-2xl z-20 w-80 space-y-3 pointer-events-auto animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#1A2640] pb-2">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300">
              Vortex Physics Parameters
            </span>
            <button
              onClick={() => {
                setSpeed(0.25);
                setSwirl(4.0);
                setOuterRadius(90);
                setCoreRadius(2.0);
                setChaos(1.5);
              }}
              className="text-[8px] font-mono text-slate-500 hover:text-slate-300 flex items-center gap-1"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          </div>

          {/* Flow Speed */}
          <div>
            <div className="flex justify-between text-[9.5px] font-mono mb-1">
              <span className="text-slate-400">Flow Speed</span>
              <span className="text-blue-400 font-bold">{speed.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="1.0"
              step="0.05"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-blue-500 bg-[#1A2640] h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Swirl Amount */}
          <div>
            <div className="flex justify-between text-[9.5px] font-mono mb-1">
              <span className="text-slate-400">Swirl Amount</span>
              <span className="text-purple-400 font-bold">{swirl.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={swirl}
              onChange={(e) => setSwirl(parseFloat(e.target.value))}
              className="w-full accent-purple-500 bg-[#1A2640] h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Swarm Radius */}
          <div>
            <div className="flex justify-between text-[9.5px] font-mono mb-1">
              <span className="text-slate-400">Swarm Radius</span>
              <span className="text-emerald-400 font-bold">{outerRadius}</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={outerRadius}
              onChange={(e) => setOuterRadius(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-[#1A2640] h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Core Radius */}
          <div>
            <div className="flex justify-between text-[9.5px] font-mono mb-1">
              <span className="text-slate-400">Core Radius</span>
              <span className="text-rose-400 font-bold">{coreRadius.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={coreRadius}
              onChange={(e) => setCoreRadius(parseFloat(e.target.value))}
              className="w-full accent-rose-500 bg-[#1A2640] h-1.5 rounded cursor-pointer"
            />
          </div>

          {/* Layering Chaos */}
          <div>
            <div className="flex justify-between text-[9.5px] font-mono mb-1">
              <span className="text-slate-400">Layering Chaos</span>
              <span className="text-amber-400 font-bold">{chaos.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.25"
              value={chaos}
              onChange={(e) => setChaos(parseFloat(e.target.value))}
              className="w-full accent-amber-500 bg-[#1A2640] h-1.5 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ─── Interactive Orbit Hint Footer ─── */}
      <div className="absolute bottom-3 right-4 text-[8.5px] font-mono text-slate-600 bg-[#060B14]/80 px-2 py-1 rounded border border-[#1A2640]/50 pointer-events-none">
        Click & Drag to Orbit 3D Space · Scroll to Zoom
      </div>
    </div>
  );
};

export default EvidentiaryConvergence;
