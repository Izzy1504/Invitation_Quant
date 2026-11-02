"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, MotionConfig } from "motion/react";
import { graduation } from "@/data/graduation";
import AnimeCampusMap from "@/components/anime-campus-map";
import AnimeBackdrop from "@/components/anime-backdrop";
import CinematicJapanese from "@/components/cinematic-japanese";
import SakuraWorld from "@/components/sakura-world";
import SoundtrackPlayer from "@/components/soundtrack-player";
import RsvpForm from "@/components/rsvp-form";
import { getFullMotion, setFullMotion, subscribeToFullMotion } from "@/lib/motion-preference";
import { SceneAtmosphere, SceneNavigation, useSceneDirector } from "@/components/scene-director";

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
      <path d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function FlowerMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none">
      <path
        d="M24 7c4.4 0 5.7 6.4 5.7 10.1 3.2-2 8.5-4 10.7-.2 2.2 3.8-2.6 8.2-5.8 10.1 3.2 1.9 8 6.3 5.8 10.1-2.2 3.8-7.5 1.8-10.7-.2C29.7 40.6 28.4 47 24 47s-5.7-6.4-5.7-10.1c-3.2 2-8.5 4-10.7.2-2.2-3.8 2.6-8.2 5.8-10.1-3.2-1.9-8-6.3-5.8-10.1 2.2-3.8 7.5-1.8 10.7.2C18.3 13.4 19.6 7 24 7Z"
        transform="translate(0 -3)"
      />
      <circle cx="24" cy="24" r="3" />
    </svg>
  );
}

function MotionPreferenceControl({ fullMotion, systemReduced, onChange }: {
  fullMotion: boolean;
  systemReduced: boolean;
  onChange: () => void;
}) {
  return (
    <div className="motion-preference-control">
      <p>{fullMotion ? "Đang bật đầy đủ hiệu ứng theo lựa chọn của bạn."
        : systemReduced ? "Thiết bị đang yêu cầu giảm chuyển động. Bạn có thể chủ động bật hiệu ứng cho thiệp này."
        : "Hiệu ứng đang theo cài đặt thiết bị."}</p>
      <button type="button" onClick={onChange} aria-pressed={fullMotion}>
        {fullMotion ? "Dùng cài đặt chuyển động của thiết bị" : "Bật đầy đủ hiệu ứng"}
      </button>
    </div>
  );
}

function OpeningLetter({ onOpen, onEnter, reducedMotion, fullMotion, systemReduced, onChangeMotion }: {
  onOpen: () => void;
  onEnter: () => void;
  reducedMotion: boolean;
  fullMotion: boolean;
  systemReduced: boolean;
  onChangeMotion: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    if (opening && reducedMotion) onOpen();
  }, [opening, reducedMotion, onOpen]);

  function openLetter() {
    if (opening) return;
    onEnter();
    if (reducedMotion) {
      onOpen();
      return;
    }
    setOpening(true);
    timer.current = setTimeout(onOpen, 2800);
  }

  return (
    <div
      className={`opening${opening ? " opening--leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Mở thiệp mời"
      onKeyDown={(event) => {
        if (event.key === "Escape") onOpen();
        if (event.key !== "Tab") return;
        const buttons = event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]");
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
    >
      <AnimeBackdrop entrance />
      <div className="opening-wash" aria-hidden="true" />
      <div className="letter-portal" aria-hidden="true"><span /><span /><span /></div>
      <motion.div className="opening-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <CinematicJapanese className="opening-japanese">青春の最後のページ</CinematicJapanese>
        <span className="eyebrow">MỘT CÁNH THƯ · MỘT CHƯƠNG MỚI</span>
        <h1>Ngày ấy, mình<br />cùng lớn lên.</h1>
        <p>Một lời mời nhỏ cho một ngày thật đáng nhớ.</p>
        <button className="envelope-button" onClick={openLetter} disabled={opening} autoFocus aria-label={opening ? "Đang mở cánh cửa thanh xuân" : "Mở thư và bước vào thế giới anime"}>
          <span className="envelope" aria-hidden="true">
            <motion.span
              className="envelope-flap"
              animate={{ rotateX: opening ? 180 : 0 }}
              transition={{ duration: 0.55 }}
            />
            <span className="envelope-paper"><FlowerMark /></span>
            <span className="envelope-face"><FlowerMark /></span>
          </span>
          <span className="open-prompt" role="status">{opening ? "Cánh cửa thanh xuân đang mở…" : "Chạm để mở thư"}</span>
        </button>
        <button className="skip-link" onClick={onOpen}>Bỏ qua lời mở đầu <ArrowIcon /></button>
        <MotionPreferenceControl fullMotion={fullMotion} systemReduced={systemReduced} onChange={onChangeMotion} />
        <span className="opening-audio-note">Mở thư kèm nhạc · <a href="https://www.myinstants.com/en/instant/tuturu/" target="_blank" rel="noopener noreferrer">Âm thanh “Tuturu” ↗</a></span>
      </motion.div>
      <div className="portal-invitation" aria-hidden="true">
        <CinematicJapanese active={opening}>物語が、いま始まる。</CinematicJapanese>
        <span>Câu chuyện của chúng ta bắt đầu từ đây.</span>
      </div>
      <span className="opening-footnote">TRÂN TRỌNG MỜI BẠN</span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{value ?? <span className="pending-value">Đang cập nhật</span>}</dd>
    </div>
  );
}

function subscribeToMotionPreference(onChange: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", onChange);
  return () => preference.removeEventListener("change", onChange);
}

function getMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function InvitationExperience() {
  const [showOpening, setShowOpening] = useState(true);
  const [entering, setEntering] = useState(false);
  const [musicRequested, setMusicRequested] = useState(false);
  const [soundError, setSoundError] = useState(false);
  const [openingRun, setOpeningRun] = useState(0);
  const letterSound = useRef<HTMLAudioElement>(null);
  const systemReduced = useSyncExternalStore(subscribeToMotionPreference, getMotionPreference, () => false);
  const fullMotion = useSyncExternalStore(subscribeToFullMotion, getFullMotion, () => false);
  const reducedMotion = systemReduced && !fullMotion;
  const frameRef = useRef<HTMLDivElement>(null);
  const { activeChapter, motionPaused, setMotionPaused, travelling, navigate } =
    useSceneDirector(frameRef, !showOpening, reducedMotion);

  useEffect(() => {
    document.documentElement.dataset.fullMotion = String(fullMotion);
    return () => { delete document.documentElement.dataset.fullMotion; };
  }, [fullMotion]);

  function changeMotionPreference() {
    setFullMotion(!fullMotion);
    setMotionPaused(false);
  }

  useEffect(() => {
    document.body.classList.toggle("intro-active", showOpening);
    if (!showOpening) {
      const current = document.getElementById(window.location.hash.slice(1) || "home");
      current?.focus({ preventScroll: true });
    }
    return () => document.body.classList.remove("intro-active");
  }, [showOpening]);

  useEffect(() => {
    const audio = letterSound.current;
    return () => { audio?.pause(); };
  }, []);

  function startEntrance() {
    setEntering(true);
    setMusicRequested(true);
    const audio = letterSound.current;
    if (audio) {
      audio.volume = 0.55;
      audio.play().catch((error: unknown) => {
        console.warn("Opening sound effect could not play.", error);
        setSoundError(true);
      });
    }
  }

  function enterWorld() {
    setMusicRequested(true);
    setEntering(false);
    setShowOpening(false);
  }

  function replayOpening() {
    letterSound.current?.pause();
    if (letterSound.current) letterSound.current.currentTime = 0;
    setMusicRequested(false);
    setSoundError(false);
    setEntering(false);
    setMotionPaused(false);
    setOpeningRun((value) => value + 1);
    window.history.replaceState(null, "", "#home");
    window.scrollTo({ top: 0, behavior: "instant" });
    setShowOpening(true);
  }

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <SakuraWorld paused={motionPaused} entering={entering} reducedMotion={reducedMotion} />
      <audio ref={letterSound} src="https://www.myinstants.com/media/sounds/tuturu_1.mp3" preload="none" onError={() => {
        console.warn("Myinstants opening sound could not be loaded.");
        setSoundError(true);
      }} />
      {showOpening && <OpeningLetter onOpen={enterWorld} onEnter={startEntrance} reducedMotion={reducedMotion}
        fullMotion={fullMotion} systemReduced={systemReduced} onChangeMotion={changeMotionPreference} />}
      <div
        className="site-frame"
        ref={frameRef}
        inert={showOpening}
        aria-hidden={showOpening}
        data-motion={motionPaused ? "paused" : "running"}
        data-entered={!showOpening}
        onClick={navigate}
      >
      <div className={`cloud-transition${travelling ? " is-travelling" : ""}`} aria-hidden="true">
        <span /><span /><span />
      </div>
      <SceneNavigation
        activeChapter={activeChapter}
        motionPaused={motionPaused}
        onToggleMotion={() => setMotionPaused((paused) => !paused)}
      />
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Izzy — về đầu trang">
          <span className="wordmark-icon"><FlowerMark /></span>
          <span>Izzy<span className="wordmark-dot">.</span></span>
        </a>
        <nav className="main-nav" aria-label="Điều hướng chính">
          <a href="#story">Lời mời</a>
          <a href="#details">Thông tin</a>
          <a href="#map">Khuôn viên</a>
          <a href="#rsvp">Phản hồi</a>
        </nav>
        <a className="header-cta" href="#details">Ngày đặc biệt <ArrowIcon /></a>
      </header>

      <main>
        <section className="hero" id="home" tabIndex={-1} aria-label="Khởi đầu">
          <AnimeBackdrop />
          <div className="hero-haze" aria-hidden="true" />
          <SceneAtmosphere />
          <CinematicJapanese className="hero-vertical-jp" active={!showOpening}>あの日の空を、忘れない。</CinematicJapanese>
          <div className="hero-content">
            <span className="anime-scene-tag"><span /><span lang="ja">第一章</span> · MỘT TRANG THANH XUÂN</span>
            <span className="eyebrow hero-eyebrow">{graduation.university} <i /> LỄ TỐT NGHIỆP</span>
            <motion.div
              key={showOpening ? "waiting" : "revealed"}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 22 }}
              animate={{ opacity: showOpening ? 0 : 1, y: !reducedMotion && showOpening ? 22 : 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : 0.15 }}
            >
              <CinematicJapanese className="hero-japanese-title" active={!showOpening}>青春の最後のページ</CinematicJapanese>
              <h1>Trang cuối<br /><em>của thanh xuân.</em></h1>
              <p className="hero-intro">Qua tầng mây ấy, một hành trình mới bắt đầu.</p>
            </motion.div>
            <div className="hero-graduate">
              <span className="graduate-rule" />
              <div>
                <span className="micro-label">TÂN KHOA</span>
                <strong>{graduation.graduateName}</strong>
                <span className="student-id">MSSV&nbsp; {graduation.studentId}</span>
              </div>
            </div>
            <a className="button button-dark" href="#story">Khám phá lời mời <ArrowIcon /></a>
            <button type="button" className="replay-opening" onClick={replayOpening}>Xem lại cảnh mở thư <span aria-hidden="true">↗</span></button>
            <MotionPreferenceControl fullMotion={fullMotion} systemReduced={systemReduced} onChange={changeMotionPreference} />
            <SoundtrackPlayer key={openingRun} requested={musicRequested} />
            {soundError && <p className="sound-effect-notice" role="status">Hiệu ứng “Tuturu” chưa phát được. Bạn vẫn có thể xem thiệp và nghe nhạc nền.</p>}
          </div>
          <div className="hero-meta" aria-label="Thông tin buổi lễ">
            <span>{graduation.className}</span>
            <span className="hero-meta-divider" />
            <span>{graduation.date.label} · {graduation.session}</span>
          </div>
          <a className="scroll-cue" href="#story"><span /> CUỘN ĐỂ KHÁM PHÁ</a>
          <div className="hero-index">01 <span>/</span> 05</div>
        </section>

        <section className="story-section section-wrap" id="story" tabIndex={-1} aria-label="Lời mời">
          <div className="story-stamp" data-reveal><FlowerMark /><CinematicJapanese active={!showOpening}>思い出のかけら</CinematicJapanese><span>MẢNH GHÉP KỶ NIỆM</span></div>
          <div className="story-copy reveal-sequence" data-reveal>
            <span className="eyebrow">GỬI NHỮNG NGƯỜI THƯƠNG</span>
            <CinematicJapanese className="section-japanese" active={!showOpening}>あの日の空</CinematicJapanese>
            <h2>Có những ngày<br />mình muốn <em>giữ lại.</em></h2>
            <p>
              Những buổi đến lớp, những lần cùng nhau cố gắng, và cả những người đã
              luôn ở bên — tất cả đã làm nên một hành trình thật đẹp. Quang mong
              được cùng bạn viết trang cuối của những ngày sinh viên, trước khi
              mỗi người bay về một vùng trời mới.
            </p>
            <p className="story-signature">Thân mời,<br /><strong>Quang</strong></p>
          </div>
          <div className="story-aside" data-reveal>
            <span className="aside-line" />
            <span>“Thanh xuân không khép lại.<br />Nó chỉ đổi sang một khung trời mới.”</span>
            <span className="aside-note">MỘT NGÀY · MỘT KỶ NIỆM · MỘT CHƯƠNG MỚI</span>
          </div>
        </section>

        <section className="details-section" id="details" tabIndex={-1} aria-label="Thông tin buổi lễ">
          <div className="details-top section-wrap reveal-sequence" data-reveal>
            <div>
              <span className="eyebrow"><CinematicJapanese active={!showOpening}>約束の日</CinematicJapanese> · NGÀY MÌNH HẸN NHAU</span>
              <h2>Hẹn gặp bạn<br /><em>ở ngày đặc biệt.</em></h2>
            </div>
            <p className="details-intro">
              Sự hiện diện của bạn sẽ làm ngày này trọn vẹn hơn.
              Hãy lưu lại thời gian buổi lễ nhé.
            </p>
          </div>
          <div className="invitation-card" data-reveal>
            <div className="card-side">
              <span className="card-monogram"><FlowerMark /></span>
              <span className="card-university">{graduation.university}</span>
              <span className="card-decoration" aria-hidden="true">✳</span>
              <span className="card-small">A DAY TO REMEMBER</span>
            </div>
            <div className="card-main">
              <span className="eyebrow">LỄ TỐT NGHIỆP · {graduation.session.toUpperCase()}</span>
              <h3>{graduation.graduateName}</h3>
              <span className="card-student">MSSV {graduation.studentId} <i /> {graduation.className}</span>
              <div className="date-display">
                <span className="date-day">{graduation.date.day}</span>
                <span className="date-divider" />
                <span className="date-month">THÁNG<br />{graduation.date.month}</span>
                <span className="date-year">
                  {graduation.year}
                  {graduation.yearConfirmed ? "" : " · CẦN XÁC NHẬN"}
                </span>
              </div>
              <p className="date-confirmation">Ngày và năm tổ chức cần được xác nhận trước khi gửi thiệp.</p>
              <div className="card-schedule">
                <div><span>ĐÓN KHÁCH</span><strong>{graduation.checkIn.start} — {graduation.checkIn.end}</strong></div>
                <div><span>BUỔI LỄ</span><strong>{graduation.ceremony.start} — {graduation.ceremony.end}</strong></div>
              </div>
              <dl className="details-list">
                <DetailRow label="Phòng check-in" value={graduation.checkInRoom} />
                <DetailRow label="Chỗ ngồi tân khoa" value={graduation.graduateSeat} />
                <DetailRow label="Khu vực phụ huynh" value={graduation.parentSeat} />
                <DetailRow label="Nhóm liên hệ" value={graduation.contactGroup} />
              </dl>
              <p className="card-footer">Mong được đón bạn trong ngày vui này <span>♡</span></p>
            </div>
          </div>
          <p className="details-footnote">THÔNG TIN ĐỊA ĐIỂM SẼ ĐƯỢC BỔ SUNG KHI CÓ XÁC NHẬN CHÍNH THỨC</p>
          <RsvpForm />
        </section>

        <section className="map-section section-wrap" id="map" tabIndex={-1} aria-label="Khuôn viên mùa xuân">
          <div className="map-heading reveal-sequence" data-reveal>
            <div>
              <span className="eyebrow"><CinematicJapanese active={!showOpening}>学園案内</CinematicJapanese> · SƠ ĐỒ KHUÔN VIÊN</span>
              <h2>Một điểm hẹn,<br /><em>ngàn cảm xúc.</em></h2>
            </div>
            <p>Trường Đại học FPT<br />Khu vực check-in: <span>Đang cập nhật</span></p>
          </div>
          <AnimeCampusMap />
        </section>

        <section className="closing-section" id="closing" tabIndex={-1} aria-label="Hẹn gặp bạn">
          <div className="closing-art" aria-hidden="true">
            <AnimeBackdrop />
            <span className="closing-sun" />
            <span className="closing-hill closing-hill-back" />
            <span className="closing-hill closing-hill-front" />
            <span className="closing-branch">✳</span>
          </div>
          <SceneAtmosphere />
          <div className="closing-content reveal-sequence" data-reveal>
            <CinematicJapanese className="closing-japanese" active={!showOpening}>また会おう。</CinematicJapanese>
            <span className="eyebrow">CHƯƠNG MỚI ĐANG CHỜ</span>
            <h2>Hẹn gặp bạn<br /><em>ở ngày ấy nhé.</em></h2>
            <a href="#home" className="button button-light">Trở về đầu trang <ArrowIcon /></a>
            <span className="closing-class">{graduation.className} <i /> {graduation.university}</span>
          </div>
          <span className="closing-flower closing-flower-one">✿</span>
          <span className="closing-flower closing-flower-two">✿</span>
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark" href="#home"><span className="wordmark-icon"><FlowerMark /></span><span>Izzy<span className="wordmark-dot">.</span></span></a>
        <span>Được viết bằng sự biết ơn · 2026</span>
        <a href="#home">Lên đầu trang ↑</a>
      </footer>
      </div>
    </MotionConfig>
  );
}
