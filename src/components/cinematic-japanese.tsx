"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export default function CinematicJapanese({
  children,
  className = "",
  active = true,
}: {
  children: string;
  className?: string;
  active?: boolean;
}) {
  const text = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = text.current;
    if (!element) return;
    element.dataset.ready = "true";
    if (!active) {
      element.dataset.visible = "false";
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        element.dataset.visible = "true";
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);

  return (
    <span ref={text} className={`jp-cinematic ${className}`} lang="ja">
      <span className="sr-only">{children}</span>
      <span className="jp-glyphs" aria-hidden="true">
        {Array.from(children).map((character, index) => (
          <span className="jp-glyph" style={{ "--glyph-index": index } as CSSProperties} key={index}>{character}</span>
        ))}
      </span>
    </span>
  );
}
