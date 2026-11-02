import { useId } from "react";

function FloatingIsland({ distant = false }: { distant?: boolean }) {
  return (
    <g className={distant ? "floating-island island-distant" : "floating-island island-main"}>
      <path d="m-220 0 57 115 56-23 42 100 59-48 38-105 91-25 46-90Z" fill="#728cad" />
      <path d="m-220 0 113 92 42 100-7-167 104 119 38-105 91-25 46-90Z" fill="#93a5c1" />
      <path d="m-107 92 42 100-7-167-57-24Z" fill="#607b9c" />
      <path d="m32 144 38-105 91-25-103-27Z" fill="#b0b9cf" />
      <path d="M-225-12c53-47 136-58 231-42 97-25 158-8 209 39C173 35 93 48 7 39-92 59-171 33-225-12Z" fill="#91bda5" stroke="#bad9b8" strokeWidth="5" />
      <path d="M-207-18c67-37 113-44 198-23 91-22 158-9 204 23C125 17 74 28 4 22-83 42-151 17-207-18Z" fill="#c6d9bb" />
      <path d="M-12 24c-7 54-7 102 2 157l21-10C6 113 23 62 25 25Z" fill="#b7e9ef" opacity=".8" />
      <path className="island-waterfall" d="M2 32c-7 62 7 85 1 152m10-150c-7 47 7 72 0 122" fill="none" stroke="#eefeff" strokeWidth="3" strokeDasharray="14 12" />
      <g fill="#eaf3e3" stroke="#8da8b0" strokeWidth="2">
        <path d="m-87-26 72-31 81 28v-66l-81-27-72 31Z" />
        <path d="m-15-57 81 28v-66l-81-27Z" fill="#bfced4" />
        <path d="m-96-94 81-45 89 40-87 30Z" fill="#6c92a5" />
        <path d="m-96-94 81-45 2 70Z" fill="#97b9bd" />
        <path d="M-40-125v-53l26-25 25 25v53Z" />
        <path d="m-48-176 34-48 33 48Z" fill="#68859f" />
        <path d="M-21-148v-21h13v21Z" fill="#f3d9ac" stroke="none" />
      </g>
      <g fill="#8bbecb" stroke="#7ea2ae" strokeWidth="1">
        <path d="m-65-73 14-6v23l-14 6Zm29-12 13-6v23l-13 6Zm39 8 15 5v23l-15-5Zm29 10 15 5v23l-15-5Z" />
      </g>
      <path d="m92-31 5-80 5 80m-5-42-21-25m23 37 22-27m-224 67 5-71 5 71m-5-36-17-20" stroke="#8f7e8d" strokeWidth="6" fill="none" />
      <g fill="#edb8d1">
        <path d="M56-108c-9-24 13-42 29-34 16-23 48-13 47 10 24 6 25 34 8 43-25 21-69 7-84-19Z" />
        <path d="M-143-89c-8-19 10-36 25-27 11-22 38-15 40 4 25 1 30 28 10 39-18 17-59 8-75-16Z" />
      </g>
      <g fill="#ffe5f0"><circle cx="79" cy="-123" r="7" /><circle cx="112" cy="-103" r="5" /><circle cx="-118" cy="-98" r="6" /><circle cx="-89" cy="-85" r="4" /></g>
      <g className="island-crystals" fill="#c6efff" stroke="#effcff" strokeWidth="2">
        <path d="m-174 51 9-27 9 27-9 22Zm319 46 7-21 7 21-7 18Zm-109 109 10-26 10 26-10 21Z" />
      </g>
    </g>
  );
}

export default function FantasyScenery() {
  const skyId = useId();
  const glowId = useId();
  return (
    <svg
      className="fantasy-art"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Thế giới fantasy nguyên bản: trường học trên đảo nổi, thác nước giữa mây, hoa anh đào và tân khoa nhìn về chân trời"
    >
      <defs>
        <linearGradient id={skyId} x1="0" x2=".3" y1="0" y2="1">
          <stop stopColor="#518cce" /><stop offset=".48" stopColor="#9ccde9" /><stop offset=".8" stopColor="#e9dfe9" /><stop offset="1" stopColor="#f5c5b4" />
        </linearGradient>
        <radialGradient id={glowId}><stop stopColor="#fff5d5" stopOpacity=".95" /><stop offset="1" stopColor="#fff5d5" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1600" height="1000" fill={`url(#${skyId})`} />
      <circle cx="1285" cy="190" r="275" fill={`url(#${glowId})`} />
      <circle cx="1285" cy="190" r="48" fill="#fff3d4" opacity=".9" />
      <g className="fantasy-gate" fill="none" stroke="#fff4d8" strokeWidth="2">
        <path d="M903 485V292a232 232 0 0 1 464 0v193M920 485V292a215 215 0 0 1 430 0v193" />
        <path d="m1135 44 12 20-12 20-12-20ZM898 288l6-12 6 12-6 12Zm461 0 6-12 6 12-6 12Z" fill="#fff4d8" />
        <path d="M945 202h28m-14-14v28m332-3h28m-14-14v28" opacity=".7" />
      </g>
      <g className="fantasy-distant-clouds" fill="#f0f3f6" opacity=".55">
        <path d="M0 495c133-119 235-92 294-58 99-117 259-82 317 0 131-79 284-52 371 35 102-49 215-40 284 15 119-68 247-57 334 7v195H0Z" />
        <path d="M-40 246c59-47 98-30 123-6 28-66 111-68 145-5 60-24 116 5 140 38H-40Zm767-84c63-58 105-38 133-8 38-77 136-77 172-10 70-18 112 6 153 44H710Z" />
      </g>
      <g className="fantasy-halo" transform="translate(1135 440)">
        <ellipse rx="293" ry="80" fill="none" stroke="#e9ebff" strokeWidth="2" opacity=".7" />
        <ellipse rx="320" ry="91" fill="none" stroke="#fff4e6" strokeWidth="1" strokeDasharray="6 19" opacity=".8" />
      </g>
      <g transform="translate(745 320) scale(.38)"><FloatingIsland distant /></g>
      <g transform="translate(1455 395) scale(.28)"><FloatingIsland distant /></g>
      <g transform="translate(1135 475) scale(1.05)"><FloatingIsland /></g>
      <g className="fantasy-near-clouds" fill="#fff7f4">
        <path d="M-70 795c64-64 121-62 173-20 50-104 181-105 235-22 103-53 193-28 249 43 102-42 203-37 282 30 116-89 258-57 314 22 107-67 217-52 279 1 96-71 176-57 249-10v210H-70Z" opacity=".72" />
        <path d="M755 690c48-35 104-37 144-6 47-76 147-67 183-9 67-28 144-12 190 36H731Zm575-110c43-40 88-38 117-13 31-60 105-64 140-5 60-16 95 8 132 45h-404Z" opacity=".48" />
      </g>
      <path d="M0 858c89-34 143-24 203-46 93-33 132-2 213 27l92 161H0Z" fill="#8597a8" />
      <path d="M0 849c88-31 138-24 200-44 91-32 153-2 196 26l-15 20c-135-32-191 32-381 19Z" fill="#bad0bb" />
      <g className="fantasy-graduate" transform="translate(275 810)">
        <ellipse cy="37" rx="40" ry="8" fill="#677f93" opacity=".3" />
        <path d="M-12-19-20 29h15l5-25 5 25h15L12-19Z" fill="#33465f" />
        <path className="graduate-gown" d="m-15-75-17 72 22 5L0-17 12 1l22-5-18-71Z" fill="#354660" stroke="#53637b" strokeWidth="2" />
        <path d="m-10-73 10 21 11-21" fill="none" stroke="#efcf91" strokeWidth="4" />
        <circle cy="-91" r="14" fill="#e3c3b0" />
        <path d="M-15-91c0-25 32-26 30-2l-9-10-16 8Z" fill="#35415b" />
        <path d="m-26-111 27-9 27 9-27 9Z" fill="#32425c" />
        <path d="m23-109 1 24" stroke="#efd6a0" strokeWidth="2" />
        <path className="graduate-ribbon" d="M12-63q37 1 51-18-5 30-42 28Z" fill="#edb7c8" />
        <path d="m-26-25-6 11m59-14 5 11" stroke="#e3c3b0" strokeWidth="6" strokeLinecap="round" />
      </g>
      <g fill="#f8d9ef" className="fantasy-stardust">
        <path d="m867 189 4 11 11 4-11 4-4 11-4-11-11-4 11-4Zm479 122 3 8 8 3-8 3-3 8-3-8-8-3 8-3ZM991 620l4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" />
        <circle cx="1385" cy="245" r="3" /><circle cx="821" cy="425" r="3" /><circle cx="1222" cy="702" r="3" />
      </g>
    </svg>
  );
}
