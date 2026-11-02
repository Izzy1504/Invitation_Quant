"use client";

import { useEffect, useRef } from "react";
import { createSakuraRenderer, type SakuraRenderer } from "@/lib/sakura-webgl";

export default function SakuraWorld({ paused, entering, reducedMotion }: { paused: boolean; entering: boolean; reducedMotion: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const controls = useRef({ paused, entering });

  useEffect(() => {
    controls.current = { paused, entering };
    window.dispatchEvent(new Event("sakura-motion-change"));
  }, [paused, entering]);

  useEffect(() => {
    const element = canvas.current;
    const container = layer.current;
    if (!element || !container) return;
    const compact = window.matchMedia("(max-width: 620px)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let renderer: SakuraRenderer | null = null;
    let frame = 0;
    let previous = 0;
    let lastDraw = 0;
    let time = 0;
    let arrival = 0;
    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let failed = false;

    function resize() {
      renderer?.resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, compact.matches ? 1.25 : 1.75));
    }

    function draw(now: number) {
      frame = 0;
      if (!renderer || reducedMotion || controls.current.paused || document.hidden) return;
      const delta = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      time += delta * (controls.current.entering ? 2.8 : 1);
      arrival += ((controls.current.entering ? 1 : 0) - arrival) * Math.min(delta * 2, 1);
      if (now - lastDraw >= 1000 / (compact.matches ? 30 : 45)) {
        smoothX += (pointerX - smoothX) * 0.04;
        smoothY += (pointerY - smoothY) * 0.04;
        renderer.render(time, smoothX, smoothY, arrival);
        lastDraw = now;
      }
      frame = requestAnimationFrame(draw);
    }

    function sync() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (reducedMotion) {
        renderer?.dispose();
        renderer = null;
        container!.dataset.renderer = "reduced";
        return;
      }
      if (!renderer && !failed) {
        try {
          renderer = createSakuraRenderer(element!, compact.matches ? 80 : 140);
          resize();
          container!.dataset.renderer = "webgl";
        } catch (error) {
          failed = true;
          container!.dataset.renderer = "fallback";
          console.warn("Sakura WebGL unavailable; using lightweight CSS petals.", error);
        }
      }
      if (renderer && !controls.current.paused && !document.hidden) frame = requestAnimationFrame(draw);
    }

    function onPointer(event: PointerEvent) {
      if (!finePointer.matches || controls.current.paused || reducedMotion) return;
      pointerX = event.clientX / window.innerWidth * 2 - 1;
      pointerY = 1 - event.clientY / window.innerHeight * 2;
    }

    function onContextLost(event: Event) {
      event.preventDefault();
      cancelAnimationFrame(frame);
      renderer?.dispose();
      renderer = null;
      failed = true;
      container!.dataset.renderer = "fallback";
      console.warn("Sakura WebGL context lost; using CSS petals until the context is restored.");
    }

    function onContextRestored() {
      failed = false;
      sync();
    }

    sync();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("sakura-motion-change", sync);
    document.addEventListener("visibilitychange", sync);
    element.addEventListener("webglcontextlost", onContextLost);
    element.addEventListener("webglcontextrestored", onContextRestored);
    return () => {
      cancelAnimationFrame(frame);
      renderer?.dispose();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("sakura-motion-change", sync);
      document.removeEventListener("visibilitychange", sync);
      element.removeEventListener("webglcontextlost", onContextLost);
      element.removeEventListener("webglcontextrestored", onContextRestored);
    };
  }, [reducedMotion]);

  return (
    <div className="sakura-world" ref={layer} data-paused={paused} aria-hidden="true">
      <canvas ref={canvas} className="sakura-webgl" />
      <div className="ambient-petals sakura-fallback">
        {Array.from({ length: 14 }, (_, index) => <span key={index} />)}
      </div>
      <span className="sakura-fallback-label">Hiệu ứng nhẹ</span>
    </div>
  );
}
