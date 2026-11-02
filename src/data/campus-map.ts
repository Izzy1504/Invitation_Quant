export interface CampusLocation {
  id: string;
  name: string;
  category: "landmark" | "room";
  outline: string;
  description: string;
}

export const landmarkLabels: Record<string, { x: number; y: number; lines: string[]; rotate?: number }> = {
  pond: { x: 402, y: 365, lines: ["Hồ Sen"] },
  library: { x: 193, y: 393, lines: ["THƯ", "VIỆN"] },
  innovation: { x: 1086, y: 369, lines: ["Innovation Lab"], rotate: 90 },
  digital: { x: 1015, y: 392, lines: ["Digital", "Business", "Lab"] },
  ohm: { x: 1015, y: 313, lines: ["Ohm", "Lab"] },
  shop: { x: 918, y: 177, lines: ["7-Eleven"], rotate: 18 },
  parking: { x: 419, y: 103, lines: ["BÃI GIỮ XE"] },
  entrance: { x: 310, y: 599, lines: ["LỐI VÀO BÃI GIỮ XE"] },
  exit: { x: 79, y: 395, lines: ["LỐI RA"], rotate: 90 },
  medical: { x: 213, y: 271, lines: ["Y tế"], rotate: 90 },
};

export const roomLabels: Record<string, { x: number; y: number; rotate?: number }> = {
  "040": { x: 149, y: 208 }, "039": { x: 202, y: 201 },
  "037": { x: 376, y: 183 }, "036": { x: 429, y: 177 },
  "035": { x: 482, y: 170 }, "034": { x: 535, y: 164 },
  "033": { x: 587, y: 158 }, "030": { x: 692, y: 146 },
  "029": { x: 745, y: 140 }, "028": { x: 796, y: 135 },
  "004": { x: 273, y: 547 }, "005": { x: 327, y: 547 },
  "006": { x: 381, y: 547 }, "007": { x: 434, y: 547 },
  "008": { x: 478, y: 547, rotate: 90 }, "010": { x: 589, y: 547 },
  "011": { x: 641, y: 547 }, "012": { x: 695, y: 547 },
  "013": { x: 749, y: 547 }, "014": { x: 802, y: 547 },
  "015": { x: 854, y: 547 }, "016": { x: 907, y: 547 },
  "001": { x: 149, y: 475 }, "041": { x: 158, y: 315 },
  "042": { x: 166, y: 270 }, "044": { x: 256, y: 267 },
  "045": { x: 266, y: 316, rotate: 90 },
  LB01: { x: 265, y: 473, rotate: 90 }, LB02: { x: 266, y: 369, rotate: 90 },
};

export const floorMap = {
  image: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/campus-floor-g.png`,
  width: 1230,
  height: 668,
} as const;

const landmarks: CampusLocation[] = [
  { id: "pond", name: "Hồ Sen", category: "landmark", outline: "M441 275C416 259 363 286 345 328C329 366 347 434 376 455C407 481 454 462 461 431C465 405 443 385 446 349C449 318 473 294 441 275Z", description: "Hồ Sen nằm trong sân trung tâm, phía bên trái sơ đồ và bên phải khu thư viện." },
  { id: "library", name: "Thư viện", category: "landmark", outline: "M122 341H195V289H246V340H282V444H246V499H176V448H122Z", description: "Thư viện ở dãy bên trái, cạnh phòng 041, LB01 và LB02 trên hình được cung cấp." },
  { id: "innovation", name: "Innovation Lab", category: "landmark", outline: "M1058 289H1113V449H1058Z", description: "Innovation Lab ở dãy bên phải, cạnh Ohm Lab và Digital Business Lab." },
  { id: "digital", name: "Digital Business Lab", category: "landmark", outline: "M988 343H1043V448H988Z", description: "Digital Business Lab nằm ngay dưới Ohm Lab, phía bên trái Innovation Lab trên sơ đồ." },
  { id: "ohm", name: "Ohm Lab", category: "landmark", outline: "M988 288H1043V341H988Z", description: "Ohm Lab ở phía bên phải sân trung tâm, ngay trên Digital Business Lab." },
  { id: "shop", name: "7-Eleven", category: "landmark", outline: "M897 139L954 157L933 216L878 199Z", description: "7-Eleven ở hành lang phía trên bên phải, sau dãy phòng 028–040 trên hình." },
  { id: "parking", name: "Bãi giữ xe", category: "landmark", outline: "M110 64H812V98L57 177Z", description: "Bãi giữ xe là khu dài nằm ở phía trên cùng của sơ đồ." },
  { id: "entrance", name: "Lối vào bãi giữ xe", category: "landmark", outline: "M198 587H409L434 598L409 610H198Z", description: "Lối vào bãi giữ xe được đánh dấu bằng mũi tên ở cạnh dưới bên trái, hướng sang phải." },
  { id: "exit", name: "Lối ra", category: "landmark", outline: "M69 290H90V500H95L79 525L64 500H69Z", description: "Lối ra được đánh dấu bằng mũi tên đi xuống ở cạnh trái của sơ đồ." },
  { id: "medical", name: "Y tế", category: "landmark", outline: "M196 252H229V288H196Z", description: "Khu Y tế ở cụm phòng phía trên thư viện, giữa phòng 042 và 044." },
];

const upperRooms = [
  { number: "040", points: "M121 183L172 177L177 232L122 239Z" },
  { number: "039", points: "M174 176L223 170L230 227L178 233Z" },
  { number: "037", points: "M348 158L399 151L404 209L352 215Z" },
  { number: "036", points: "M401 151L452 145L458 203L405 209Z" },
  { number: "035", points: "M454 145L503 139L510 197L459 203Z" },
  { number: "034", points: "M505 139L556 133L562 191L511 197Z" },
  { number: "033", points: "M558 132L608 127L614 185L563 191Z" },
  { number: "030", points: "M662 120L714 114L721 173L669 179Z" },
  { number: "029", points: "M716 114L767 108L773 167L723 173Z" },
  { number: "028", points: "M769 108L819 107L823 162L775 167Z" },
];

const lowerRooms = [
  { number: "004", x: 247, width: 52 },
  { number: "005", x: 301, width: 53 },
  { number: "006", x: 356, width: 50 },
  { number: "007", x: 408, width: 53 },
  { number: "008", x: 463, width: 30 },
  { number: "010", x: 563, width: 51 },
  { number: "011", x: 616, width: 50 },
  { number: "012", x: 668, width: 54 },
  { number: "013", x: 724, width: 50 },
  { number: "014", x: 776, width: 51 },
  { number: "015", x: 829, width: 50 },
  { number: "016", x: 881, width: 53 },
];

export const campusLocations: CampusLocation[] = [
  ...landmarks,
  ...upperRooms.map(({ number, points }) => ({
    id: `room-${number}`,
    name: `Phòng ${number}`,
    category: "room" as const,
    outline: points,
    description: `Phòng ${number} thuộc dãy phía trên sân trung tâm, bên dưới bãi giữ xe. Chưa xác nhận đây là phòng check-in.`,
  })),
  ...lowerRooms.map(({ number, x, width }) => ({
    id: `room-${number}`,
    name: `Phòng ${number}`,
    category: "room" as const,
    outline: `M${x} 522h${width}v49h-${width}Z`,
    description: `Phòng ${number} thuộc dãy phía dưới sân trung tâm. Chưa xác nhận đây là phòng check-in.`,
  })),
  ...[
    { number: "001", outline: "M123 449H174V499H123Z" },
    { number: "041", outline: "M123 291H195V340H123Z" },
    { number: "042", outline: "M138 256L193 251V287H138Z" },
    { number: "044", outline: "M231 247L281 241V288H231Z" },
    { number: "045", outline: "M249 291H282V341H249Z" },
    { number: "LB01", outline: "M246 444H282V499H246Z" },
    { number: "LB02", outline: "M249 343H282V397H249Z" },
  ].map(({ number, outline }) => ({
    id: `room-${number}`,
    name: `Phòng ${number}`,
    category: "room" as const,
    outline,
    description: `Phòng ${number} nằm trong cụm thư viện bên trái sơ đồ. Chưa xác nhận đây là phòng check-in.`,
  })),
];
