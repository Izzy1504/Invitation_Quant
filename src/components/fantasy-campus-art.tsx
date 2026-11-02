import { campusLocations, landmarkLabels, roomLabels } from "@/data/campus-map";

export function CampusLocationLabel({ id }: { id: string }) {
  const room = id.startsWith("room-") ? id.slice(5) : null;
  const label = room ? roomLabels[room] : landmarkLabels[id];
  const lines = room ? [room] : landmarkLabels[id].lines;
  return (
    <text
      x={label.x}
      y={label.y}
      transform={label.rotate ? `rotate(${label.rotate} ${label.x} ${label.y})` : undefined}
      className={`fantasy-map-label${room ? " fantasy-room-label" : ` fantasy-label-${id}`}`}
      aria-hidden="true"
    >
      {lines.map((line, index) => (
        <tspan key={line} x={label.x} y={label.y + (index - (lines.length - 1) / 2) * (id === "library" ? 26 : 16)}>{line}</tspan>
      ))}
    </text>
  );
}

export default function FantasyCampusArt() {
  return (
    <g className="fantasy-campus-base" aria-hidden="true">
      <defs>
        <linearGradient id="atlas-ocean" x2="1" y2="1">
          <stop stopColor="#284e66" /><stop offset="1" stopColor="#162d48" />
        </linearGradient>
        <linearGradient id="atlas-land" x2=".3" y2="1">
          <stop stopColor="#b5c990" /><stop offset="1" stopColor="#6b997c" />
        </linearGradient>
        <linearGradient id="atlas-water" x2="1" y2="1">
          <stop stopColor="#b0ede0" /><stop offset="1" stopColor="#398c9d" />
        </linearGradient>
        <pattern id="atlas-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M60 0H0V60" fill="none" stroke="#d7e8d1" strokeOpacity=".07" />
        </pattern>
        <pattern id="atlas-paving" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 0H22V22H0Z" fill="#d9d4b0" stroke="#b8b894" strokeWidth=".7" />
        </pattern>
        <filter id="atlas-shadow" x="-.1" y="-.2" width="1.3" height="1.5">
          <feDropShadow dx="3" dy="6" stdDeviation="3" floodColor="#183a38" floodOpacity=".35" />
        </filter>
        <g id="atlas-tree">
          <path d="M0 10V-13" stroke="#61715a" strokeWidth="4" />
          <circle cy="-15" r="13" fill="#467e6b" /><circle cx="-6" cy="-19" r="9" fill="#639578" />
          <circle cx="4" cy="-23" r="8" fill="#82aa81" />
        </g>
        <g id="atlas-sakura">
          <path d="M0 10V-13" stroke="#807263" strokeWidth="4" />
          <circle cy="-15" r="15" fill="#d8a8b6" /><circle cx="-8" cy="-21" r="11" fill="#efc7cf" />
          <circle cx="7" cy="-24" r="10" fill="#f3d9d7" />
        </g>
      </defs>
      <rect width="1230" height="668" fill="url(#atlas-ocean)" />
      <rect width="1230" height="668" fill="url(#atlas-grid)" />
      <path d="M20 175L88 35L831 35L1211 142L1213 636L113 641L20 588Z" fill="#234b52" stroke="#72a4a0" strokeWidth="14" />
      <path d="M30 176L98 44L828 45L1200 151L1201 625L120 629L30 579Z" fill="url(#atlas-land)" stroke="#d3d9ae" strokeWidth="4" />
      <path d="M45 181L108 54H827L1191 158V619H121" fill="none" stroke="#ede1ba" strokeWidth="21" />
      <path d="M46 183L108 54H827L1191 158V619H121" fill="none" stroke="#c3b991" strokeWidth="2" strokeDasharray="5 8" />
      <path d="M108 242L815 178L1128 273V578H115Z" fill="url(#atlas-paving)" stroke="#ede6c6" strokeWidth="8" />
      <path d="M301 238L808 187L986 237V498H301Z" fill="#92b58a" stroke="#e9ddba" strokeWidth="7" />
      <path d="M480 269L804 233L941 269V466H485Z" fill="#a5bd90" stroke="#bacb9b" strokeWidth="3" />
      <path d="M492 476L946 476M491 488L946 488M476 264V463" stroke="#d9d8ad" strokeWidth="3" />
      <circle cx="718" cy="359" r="71" fill="none" stroke="#d5d8ab" strokeWidth="2" />
      <circle cx="718" cy="359" r="61" fill="none" stroke="#d5d8ab" strokeWidth="1" strokeDasharray="3 7" />
      <path d="M718 280V438M640 359H797M661 302L775 416M661 416L775 302" stroke="#d5d8ab" strokeWidth="2" opacity=".65" />
      {campusLocations.map((location) => (
        <path key={location.id} d={location.outline}
          className={`fantasy-map-building fantasy-building-${location.id} ${location.category === "room" ? "fantasy-room" : ""}`}
        />
      ))}
      <path d="M226 170L275 164L282 221L231 227ZM610 126L660 120L667 180L616 185ZM495 522H545V571H495Z" fill="#b9c9b0" stroke="#f4e7c7" strokeWidth="2" />
      <path d="M277 164L346 157L351 214L284 221Z" fill="#dfcfac" stroke="#f4e7c7" strokeWidth="2" />
      <path d="M123 522H242V571H123Z" fill="#638e79" stroke="#f4e7c7" strokeWidth="2" />
      <g className="fantasy-map-label fantasy-room-label">
        <text x="254" y="197">WC</text><text x="639" y="156">WC</text>
        <text x="520" y="548">WC</text><text x="314" y="190">Cổng</text>
        <text x="182" y="549" fontSize="13">PASSIO</text>
      </g>
      <path d="M358 352Q396 334 437 349M358 390Q400 375 439 389M377 426Q409 418 441 425" fill="none" stroke="#d3f0d7" strokeWidth="3" opacity=".7" />
      <g fill="#eac9d3" stroke="#f7e3de" strokeWidth="1">
        <path d="M380 315l7-9 7 9-7 5Z" /><path d="M420 410l7-9 7 9-7 5Z" />
      </g>
      <path d="M474 340L454 340L454 367L474 367" fill="#e4d6b7" stroke="#b1a181" strokeWidth="3" />
      <g filter="url(#atlas-shadow)">
        {[510, 572, 866, 929].map((x) => <use key={x} href="#atlas-tree" x={x} y={292} />)}
        {[514, 574, 858, 922].map((x) => <use key={x} href="#atlas-sakura" x={x} y={441} />)}
        <use href="#atlas-sakura" x="326" y="277" /><use href="#atlas-tree" x="327" y="478" />
        <use href="#atlas-sakura" x="1160" y="331" /><use href="#atlas-tree" x="1160" y="410" />
      </g>
      <g transform="translate(1051 514)" stroke="#f6e5bb" fill="none">
        <circle r="33" fill="#799e8b" strokeWidth="3" /><circle r="24" />
        <path d="M0-27L8-8L27 0L8 8L0 27L-8 8L-27 0L-8-8Z" fill="#e3d4a9" />
      </g>
      <text x="718" y="353" className="fantasy-atlas-title">TẦNG G</text>
      <text x="718" y="384" className="fantasy-atlas-subtitle">FPT UNIVERSITY</text>
      <g transform="translate(1125 94)" fill="none" stroke="#e9d8ad" strokeWidth="2">
        <path d="M0-38L9-9L34 0L9 9L0 38L-9 9L-34 0L-9-9Z" />
        <circle r="20" />
      </g>
      <path d="M1149 250V180L1094 164M1084 598H1157V534" fill="none" stroke="#f0ddae" strokeWidth="3" />
      <path d="M1094 164L1105 161L1100 173M1157 534L1151 545L1163 545" fill="none" stroke="#f0ddae" strokeWidth="3" />
      <path d="M15 20H80M15 20V80M1215 20H1150M1215 20V80M15 648H80M15 648V588M1215 648H1150M1215 648V588" fill="none" stroke="#bca97e" strokeWidth="2" />
    </g>
  );
}
