import { useId, type CSSProperties } from "react";

export function SakuraCanopy() {
  const blossom = useId();
  return (
    <svg className="sakura-canopy" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <g id={blossom}>
          <g fill="#eab7cf">
            {[0, 72, 144, 216, 288].map((angle) => (
              <path key={angle} d="M0 1C-18-6-21-26-10-28L0-21L8-29C23-24 18-6 0 1Z" transform={`rotate(${angle})`} />
            ))}
          </g>
          <circle r="4" fill="#ffe5c1" />
          <path d="M0 0L-6-10M0 0L8-7M0 0L3 11" stroke="#fff1d2" strokeWidth="1.5" />
        </g>
      </defs>
      <g className="sakura-bough sakura-bough-right">
        <path d="M1690 700Q1460 344 1384 185Q1290 88 1090 53" fill="none" stroke="#33364c" strokeWidth="33" strokeLinecap="round" />
        <path d="M1487 365Q1398 280 1198 257M1387 191Q1428 103 1519 56M1280 105Q1207 147 1049 139M1427 265Q1355 193 1283 185" fill="none" stroke="#494055" strokeWidth="14" strokeLinecap="round" />
        <path d="M1202 255L1091 205M1197 255L1104 294M1487 95L1467 7M1207 147L1137 194" fill="none" stroke="#5d4a62" strokeWidth="6" strokeLinecap="round" />
        {[
          [1087, 53, .9], [1140, 70, 1.15], [1198, 92, .85], [1255, 107, 1],
          [1310, 124, 1.25], [1362, 167, .8], [1406, 210, 1.1],
          [1205, 143, .9], [1139, 146, 1.1], [1077, 140, .8], [1132, 195, .7],
          [1286, 188, 1], [1342, 215, .85], [1375, 250, 1.15],
          [1244, 259, .8], [1190, 257, 1.1], [1110, 291, .85], [1094, 206, .75],
          [1471, 94, 1.1], [1518, 55, .8], [1468, 22, .9],
        ].map(([x, y, scale], index) => (
          <g key={index} transform={`translate(${x} ${y}) scale(${scale}) rotate(${index * 37})`}>
            <use href={`#${blossom}`} />
            <use href={`#${blossom}`} x="22" y="12" transform="scale(.6)" opacity=".8" />
          </g>
        ))}
      </g>
      <g className="sakura-bough sakura-bough-left">
        <path d="M-70 625Q25 311 111 195Q212 96 316 97" fill="none" stroke="#34384e" strokeWidth="24" strokeLinecap="round" />
        <path d="M84 237Q176 259 241 217M110 196Q101 128 65 87M190 132L202 53M34 365L154 343" fill="none" stroke="#53475f" strokeWidth="9" strokeLinecap="round" />
        {[[314, 97], [264, 104], [214, 124], [171, 151], [125, 193], [240, 218], [192, 242], [67, 87], [98, 137], [201, 57], [151, 343]].map(([x, y], index) => (
          <use key={index} href={`#${blossom}`} transform={`translate(${x} ${y}) scale(${.65 + index % 3 * .15}) rotate(${index * 51})`} />
        ))}
      </g>
    </svg>
  );
}

export default function AnimeBackdrop({ entrance = false }: { entrance?: boolean }) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const background: CSSProperties & Record<"--sky-desktop" | "--sky-mobile", string> = {
    "--sky-desktop": `url("${base}/anime-sky.webp")`,
    "--sky-mobile": `url("${base}/anime-sky-mobile.webp")`,
  };
  return (
    <div className={`anime-world-backdrop${entrance ? " anime-world-backdrop--entrance" : ""}`} style={background} aria-hidden="true">
      <div className="anime-sky-image" />
      <div className="anime-sky-grade" />
      <div className="anime-sky-stars"><i /><i /><i /><i /><i /></div>
      <div className="sakura-depth"><SakuraCanopy /></div>
    </div>
  );
}
