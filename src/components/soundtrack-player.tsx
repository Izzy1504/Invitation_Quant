"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const videoId = "pGsZdaGu654";
const soundtrackUrl = `https://www.youtube.com/watch?v=${videoId}`;

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

interface YouTubeApi {
  Player: new (element: HTMLElement, options: {
    host: string;
    videoId: string;
    playerVars: Record<string, string | number>;
    events: {
      onReady: (event: { target: YouTubePlayer }) => void;
      onStateChange: (event: { data: number; target: YouTubePlayer }) => void;
      onAutoplayBlocked: () => void;
      onError: (event: { data: number }) => void;
    };
  }) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeApi> | null = null;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    const previous = window.onYouTubeIframeAPIReady;
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      script.remove();
      window.onYouTubeIframeAPIReady = previous;
      apiPromise = null;
      reject(new Error("YouTube player API did not load."));
    };
    const timeout = setTimeout(fail, 15000);
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (settled) return;
      if (!window.YT?.Player) return fail();
      settled = true;
      clearTimeout(timeout);
      window.onYouTubeIframeAPIReady = previous;
      resolve(window.YT);
    };
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return apiPromise;
}

export default function SoundtrackPlayer({ requested }: { requested: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YouTubePlayer | null>(null);
  const [muted, setMuted] = useState(false);
  const [status, setStatus] = useState<"waiting" | "ready" | "playing" | "paused" | "blocked" | "error">("waiting");
  const [attempt, setAttempt] = useState(0);
  const mutePreference = useRef(false);

  useEffect(() => {
    if (!requested || !host.current) return;
    let cancelled = false;
    let instance: YouTubePlayer | null = null;
    let readyTimer: ReturnType<typeof setTimeout> | undefined;
    const container = host.current;
    loadYouTubeApi().then((api) => {
      if (cancelled) return;
      const mount = document.createElement("div");
      container.appendChild(mount);
      readyTimer = setTimeout(() => {
        if (cancelled) return;
        console.error("YouTube soundtrack player did not become ready.");
        setStatus("error");
      }, 15000);
      instance = new api.Player(mount, {
        host: "https://www.youtube-nocookie.com",
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: videoId,
          origin: window.location.origin,
        },
        events: {
          onReady: ({ target }) => {
            if (cancelled) return;
            clearTimeout(readyTimer);
            player.current = target;
            target.setVolume(35);
            if (mutePreference.current) target.mute();
            else target.unMute();
            setStatus("ready");
            target.playVideo();
          },
          onStateChange: ({ data, target }) => {
            if (cancelled) return;
            setMuted(target.isMuted());
            if (data === 1) setStatus("playing");
            if (data === 2) setStatus("paused");
          },
          onAutoplayBlocked: () => {
            if (!cancelled) setStatus("blocked");
          },
          onError: ({ data }) => {
            if (cancelled) return;
            clearTimeout(readyTimer);
            console.error("YouTube soundtrack playback failed.", { code: data });
            setStatus("error");
          },
        },
      });
    }).catch((error: unknown) => {
      if (cancelled) return;
      clearTimeout(readyTimer);
      console.error("Could not initialize YouTube soundtrack.", error);
      setStatus("error");
    });
    return () => {
      cancelled = true;
      clearTimeout(readyTimer);
      player.current = null;
      instance?.destroy();
      container.replaceChildren();
    };
  }, [requested, attempt]);

  function toggleMute() {
    if (!player.current) return;
    const next = !player.current.isMuted();
    if (next) player.current.mute();
    else player.current.unMute();
    mutePreference.current = next;
    setMuted(next);
  }

  return (
    <div className="soundtrack-player soundtrack-inline">
      <p className="soundtrack-title">A Town With An Ocean View</p>
      <p className="soundtrack-subtitle">Umi no Mieru Machi · Kiki’s Delivery Service</p>
      {requested && <>
        <div className="soundtrack-inline-host" ref={host} />
        {createPortal(<button className="soundtrack-mute" type="button" onClick={toggleMute} disabled={status === "waiting" || status === "error"}
          aria-pressed={muted} aria-label={muted ? "Bật tiếng nhạc nền" : "Tắt tiếng nhạc nền"}>
          <span aria-hidden="true">{muted ? "♪ ×" : "♪"}</span>
          {muted ? "Bật tiếng" : "Tắt tiếng"}
        </button>, document.body)}
        <p className="soundtrack-playback-status" role="status">
          {status === "playing" ? "Nhạc đang phát · Bạn có thể tiếp tục cuộn xem thiệp."
            : status === "error" ? "Không phát được nhạc. Hãy thử lại hoặc nghe trực tiếp trên YouTube."
            : status === "blocked" ? "Trình duyệt chặn tự phát có tiếng. Chạm Phát nhạc hoặc ▶ bên dưới."
            : status === "paused" ? "Nhạc đang tạm dừng."
            : "Đang kết nối YouTube. Nếu chưa nghe thấy nhạc, chạm Phát nhạc hoặc ▶ trong trình phát."}
        </p>
        {status !== "playing" && status !== "error" && <button className="soundtrack-play" type="button" disabled={status === "waiting"}
          onClick={() => player.current?.playVideo()}>Phát nhạc</button>}
        {status === "error" && <button className="soundtrack-play" type="button" onClick={() => {
          setStatus("waiting");
          setAttempt((value) => value + 1);
        }}>Thử kết nối lại</button>}
      </>}
      <p className="soundtrack-notice">{requested
        ? "YouTube có thể dùng cookie. Tự phát có tiếng, khóa màn hình và chuyển ứng dụng tùy chính sách trình duyệt."
        : "Mở thiệp để bắt đầu câu chuyện và nhạc nền."}</p>
      <a href={soundtrackUrl} target="_blank" rel="noopener noreferrer">Nghe trên YouTube ↗</a>
      <a href={`https://music.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Mở YouTube Music ↗</a>
    </div>
  );
}
