"use client";

import { useRef, useState } from "react";
import { campusLocations, floorMap } from "@/data/campus-map";
import FantasyCampusArt, { CampusLocationLabel } from "@/components/fantasy-campus-art";

export default function AnimeCampusMap() {
  const [selectedId, setSelectedId] = useState(campusLocations[0].id);
  const [zoom, setZoom] = useState(1);
  const [original, setOriginal] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const art = useRef<SVGSVGElement>(null);
  const selected = campusLocations.find(({ id }) => id === selectedId) ?? campusLocations[0];

  function selectLocation(id: string) {
    setSelectedId(id);
    const shape = art.current?.querySelector<SVGPathElement>(`[data-location-id="${id}"] path`);
    if (!shape || !viewport.current || !art.current) return;
    const bounds = shape.getBBox();
    const scale = art.current.getBoundingClientRect().width / floorMap.width;
    viewport.current.scrollTo({
      left: (bounds.x + bounds.width / 2) * scale - viewport.current.clientWidth / 2,
      top: (bounds.y + bounds.height / 2) * scale - viewport.current.clientHeight / 2,
      behavior: "instant",
    });
  }

  return (
    <div className="anime-map floor-map" data-reveal>
      <div className="anime-map-toolbar">
        <div><span className="live-dot" /><span lang="ja">学園案内</span> · SƠ ĐỒ TẦNG G</div>
        <div className="map-zoom-controls" role="group" aria-label="Thu phóng sơ đồ tầng G">
          <button type="button" onClick={() => setZoom(Math.max(1, zoom - 0.25))} disabled={zoom === 1} aria-label="Thu nhỏ">−</button>
          <output aria-live="polite" aria-label="Mức thu phóng">{Math.round(zoom * 100)}%</output>
          <button type="button" onClick={() => setZoom(Math.min(3, zoom + 0.25))} disabled={zoom === 3} aria-label="Phóng to">+</button>
          <button type="button" onClick={() => {
            setZoom(1);
            viewport.current?.scrollTo({ left: 0, top: 0, behavior: "instant" });
          }} aria-label="Đặt lại bản đồ">↺</button>
        </div>
      </div>
      <p className="map-safety-label">Theo hình bạn cung cấp · Phòng check-in và chỗ ngồi chưa được xác nhận.</p>
      <div className="map-view-switch" role="group" aria-label="Kiểu bản đồ">
        <button type="button" aria-pressed={!original} onClick={() => setOriginal(false)}>Bản đồ fantasy</button>
        <button type="button" aria-pressed={original} onClick={() => setOriginal(true)}>Đối chiếu ảnh gốc</button>
      </div>
      <p className="floor-map-hint">Chọn địa điểm để làm nổi bật. Bấm + để đọc số phòng; vuốt hoặc cuộn trong bản đồ để xem.</p>
      <div
        className="anime-map-viewport"
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label="Sơ đồ tầng G. Có thể cuộn ngang và dọc khi phóng to."
      >
        <div className="anime-map-canvas" style={{ width: `${zoom * 100}%` }}>
          <svg
            ref={art}
            viewBox={`0 0 ${floorMap.width} ${floorMap.height}`}
            className={`anime-map-art${original ? "" : " fantasy-map-art"}`}
            role="group"
            aria-label={`${original ? "Sơ đồ gốc" : "Minh họa fantasy"} tầng G với các địa điểm và phòng có thể chọn`}
          >
            {original ? <image href={floorMap.image} width={floorMap.width} height={floorMap.height} /> : <FantasyCampusArt />}
            {campusLocations.map((location) => (
              <g
                key={location.id}
                data-location-id={location.id}
                className={`floor-map-hotspot${location.id === selectedId ? " is-selected" : ""}`}
                role="button"
                tabIndex={0}
                aria-label={`Chọn ${location.name}`}
                aria-pressed={location.id === selectedId}
                aria-controls="floor-map-detail"
                onClick={() => selectLocation(location.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectLocation(location.id);
                  }
                }}
              >
                <title>{location.name}</title>
                <path d={location.outline} />
                {!original && <CampusLocationLabel id={location.id} />}
              </g>
            ))}
          </svg>
        </div>
      </div>
      <div className="floor-map-selection">
        <label htmlFor="floor-map-location">Tìm địa điểm hoặc số phòng</label>
        <select id="floor-map-location" value={selectedId} onChange={(event) => selectLocation(event.target.value)}>
          <optgroup label="Địa điểm">
            {campusLocations.filter(({ category }) => category === "landmark").map((location) => (
              <option value={location.id} key={location.id}>{location.name}</option>
            ))}
          </optgroup>
          <optgroup label="Phòng trên sơ đồ">
            {campusLocations.filter(({ category }) => category === "room").map((location) => (
              <option value={location.id} key={location.id}>{location.name}</option>
            ))}
          </optgroup>
        </select>
      </div>
      <div className="anime-map-bottom">
        <div className="map-location-buttons" role="group" aria-label="Địa điểm tầng G">
          {campusLocations.filter(({ category }) => category === "landmark").map((location) => (
            <button type="button" key={location.id} aria-pressed={selectedId === location.id} onClick={() => selectLocation(location.id)}>
              {location.name}
            </button>
          ))}
        </div>
        <div className="map-location-detail" id="floor-map-detail" aria-live="polite" aria-atomic="true">
          <span className="eyebrow"><span lang="ja">ここにあります</span> · TRÊN SƠ ĐỒ</span>
          <h3>{selected.name}</h3>
          <p>{selected.description}</p>
          <a className="map-original-link" href={floorMap.image} target="_blank" rel="noopener noreferrer">Mở ảnh gốc để xem đầy đủ ↗</a>
        </div>
      </div>
      <div className="map-official-note">
        Minh họa fantasy nguyên bản dựa trên bố cục và số phòng của hình được cung cấp, không phải bản đồ của game.
        Cây, mặt nước và trang trí chỉ mang tính minh họa. Dùng “Đối chiếu ảnh gốc” để kiểm tra;
        chưa vẽ tuyến đường đến buổi lễ khi chưa có phòng check-in xác nhận.
      </div>
    </div>
  );
}
