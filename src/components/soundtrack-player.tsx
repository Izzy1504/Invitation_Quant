"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const source = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/audio/ocean-view.mp3`;

export default function SoundtrackPlayer({ requested }: { requested: boolean }) {
  const audio = useRef<HTMLAudioElement>(null);
  const generation = useRef(0);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<"waiting" | "playing" | "blocked" | "error">("waiting");

  function play() {
    const element = audio.current;
    if (!element) return;
    const run = ++generation.current;
    void element.play().catch((error: unknown) => {
      if (run !== generation.current) return;
      console.error("Background music could not play.", error);
      setStatus(error instanceof DOMException && error.name === "NotAllowedError" ? "blocked" : "error");
    });
  }

  useEffect(() => {
    const element = audio.current;
    const lifecycle = generation;
    if (element) element.volume = 0.35;
    window.addEventListener("invitation-play-soundtrack", play);
    return () => {
      window.removeEventListener("invitation-play-soundtrack", play);
      lifecycle.current++;
      element?.pause();
    };
  }, []);

  function toggleMute() {
    const element = audio.current;
    if (!element) return;
    element.muted = !element.muted;
    setMuted(element.muted);
    if (!element.muted && element.paused) play();
  }

  return (
    <>
      <audio ref={audio} src={source} loop preload="none"
        onPlaying={() => setStatus("playing")}
        onError={() => {
          console.error("Background audio file failed to load.", { code: audio.current?.error?.code });
          setStatus("error");
        }} />
      {requested && createPortal(
        <div className="soundtrack-controls">
          <button className="soundtrack-mute" type="button" onClick={toggleMute}
            aria-pressed={muted} aria-label={muted ? "Bật tiếng nhạc nền" : "Tắt tiếng nhạc nền"}>
            <span aria-hidden="true">{muted ? "♪ ×" : "♪"}</span>
            {muted ? "Bật tiếng" : "Tắt tiếng"}
          </button>
          {(status === "blocked" || status === "error") &&
            <div className="soundtrack-error" role="alert">
              <p>{status === "blocked" ? "Chạm để cho phép phát nhạc nền." : "Chưa tải được nhạc nền. Bạn có thể thử lại."}</p>
              <button type="button" className="soundtrack-play" onClick={() => {
                if (status === "error") audio.current?.load();
                play();
              }}>Phát nhạc</button>
            </div>}
        </div>, document.body)}
    </>
  );
}
