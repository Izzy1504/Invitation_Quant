"use client";

import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const chapters = [
  { id: "home", label: "Khởi đầu", japanese: "序章" },
  { id: "story", label: "Lời mời", japanese: "手紙" },
  { id: "details", label: "Buổi lễ", japanese: "卒業" },
  { id: "map", label: "Khuôn viên", japanese: "学園" },
  { id: "closing", label: "Hẹn gặp", japanese: "未来" },
] as const;

export function useSceneDirector(
  frameRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  reducedMotion: boolean,
) {
  const [activeChapter, setActiveChapter] = useState<string>("home");
  const [motionPaused, setMotionPaused] = useState(false);
  const [travelling, setTravelling] = useState(false);
  const transitionAnimation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!enabled || motionPaused || reducedMotion || !frameRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        gsap.to(".hero .anime-sky-image", {
          y: 70,
          scale: 1.06,
          ease: "none",
          scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: 0.5 },
        });
        gsap.to(".hero .sakura-depth", {
          y: -45,
          ease: "none",
          scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: 0.8 },
        });
        gsap.fromTo(".closing-art .anime-sky-image",
          { y: -40 },
          { y: 20, ease: "none", scrollTrigger: { trigger: "#closing", start: "top bottom", end: "bottom top", scrub: 0.8 } },
        );
      }, frameRef);
    return () => context.revert();
  }, [enabled, motionPaused, reducedMotion, frameRef]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !enabled) return;

    const sections = chapters.map(({ id }) => document.getElementById(id));
    const reveals = frame.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.03, rootMargin: "0px 0px -5% 0px" },
    );
    reveals.forEach((element) => {
      element.classList.add("reveal-ready");
      observer.observe(element);
    });

    let animationFrame = 0;
    const updateScene = () => {
      animationFrame = 0;
      const readingLine = window.innerHeight * 0.4;
      let current: string = chapters[0].id;
      sections.forEach((section) => {
        if (section && section.getBoundingClientRect().top <= readingLine) {
          current = section.id;
        }
      });
      setActiveChapter(current);
    };
    const onScroll = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(updateScene);
    };
    updateScene();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      observer.disconnect();
      reveals.forEach((element) => element.classList.remove("reveal-ready", "is-revealed"));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(animationFrame);
    };
  }, [enabled, frameRef]);

  useEffect(() => () => {
    transitionAnimation.current?.kill();
  }, []);

  function navigate(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented || event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
    ) return;
    const anchor = event.target instanceof Element
      ? event.target.closest<HTMLAnchorElement>('a[href^="#"]')
      : null;
    if (!anchor || anchor.target || anchor.hasAttribute("download")) return;
    const target = document.getElementById(anchor.hash.slice(1));
    if (!target || !frameRef.current?.contains(target)) return;
    event.preventDefault();
    const reduced = reducedMotion;
    transitionAnimation.current?.kill();
    setTravelling(!motionPaused && !reduced);
    history.pushState(null, "", anchor.hash);
    target.scrollIntoView({ behavior: motionPaused || reduced ? "instant" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
    if (!motionPaused && !reduced) {
      transitionAnimation.current = gsap.fromTo(
        frameRef.current.querySelectorAll(".cloud-transition > span"),
        { xPercent: 0 },
        { xPercent: 300, duration: 0.95, stagger: 0.025, ease: "power2.inOut", onComplete: () => setTravelling(false) },
      );
    }
  }

  return { activeChapter, motionPaused, setMotionPaused, travelling, navigate };
}

export function SceneNavigation({
  activeChapter,
  motionPaused,
  onToggleMotion,
}: {
  activeChapter: string;
  motionPaused: boolean;
  onToggleMotion: () => void;
}) {
  return (
    <div className="scene-dock">
      <nav className="chapter-navigation" aria-label="Các chương của lời mời">
        {chapters.map((chapter, index) => (
          <a
            href={`#${chapter.id}`}
            key={chapter.id}
            aria-current={activeChapter === chapter.id ? "location" : undefined}
            aria-label={`Chương ${index + 1}: ${chapter.label}`}
          >
            <span className="chapter-number">0{index + 1}</span>
            <span className="chapter-japanese" lang="ja" aria-hidden="true">{chapter.japanese}</span>
            <span className="chapter-name">{chapter.label}</span>
          </a>
        ))}
      </nav>
      <button
        className="motion-toggle"
        type="button"
        onClick={onToggleMotion}
        aria-pressed={motionPaused}
        aria-label={motionPaused ? "Bật chuyển động" : "Tạm dừng chuyển động"}
        title={motionPaused ? "Bật chuyển động" : "Tạm dừng chuyển động"}
      >
        <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {motionPaused
            ? <path d="m7 4 9 6-9 6V4Z" fill="currentColor" />
            : <path d="M7 4v12m6-12v12" stroke="currentColor" strokeWidth="2" />}
        </svg>
      </button>
    </div>
  );
}

export function SceneAtmosphere() {
  return (
    <div className="scene-atmosphere" aria-hidden="true">
      <div className="sky-cloud sky-cloud-one" />
      <div className="sky-cloud sky-cloud-two" />
      <div className="sky-cloud sky-cloud-three" />
      <div className="sunlight-beam" />
      <div className="ambient-petals">
        {Array.from({ length: 14 }, (_, index) => <span key={index} />)}
      </div>
      <div className="sky-birds"><span /><span /><span /></div>
    </div>
  );
}
