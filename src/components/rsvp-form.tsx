"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { attendanceOptions } from "@/lib/rsvp";

const endpoint = process.env.NEXT_PUBLIC_RSVP_ENDPOINT || "/api/rsvp";

export default function RsvpForm() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [configurationError, setConfigurationError] = useState(false);
  const [attendance, setAttendance] = useState<keyof typeof attendanceOptions>("yes");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const feedback = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const result: unknown = await response.json();
        if (!response.ok || typeof result !== "object" || result === null ||
          !("available" in result) || typeof result.available !== "boolean") {
          throw new Error("Invalid RSVP availability response.");
        }
        setAvailable(result.available);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Could not check RSVP availability.", error);
        setConfigurationError(true);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (status === "sent" || status === "error") feedback.current?.focus();
  }, [status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending" || !available) return;
    const form = new FormData(event.currentTarget);
    requestId.current ??= crypto.randomUUID();
    setStatus("sending");
    setError("");
    let failureMessage = "Kết nối bị gián đoạn. Hãy thử gửi lại.";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          name: form.get("name"),
          attendance,
          guests: attendance === "no" ? 0 : Number(form.get("guests")),
          note: form.get("note"),
          consent: form.get("consent") === "on",
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        failureMessage = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error : "Không gửi được phản hồi. Vui lòng thử lại.";
        throw new Error("RSVP server rejected the response.");
      }
      if (typeof result !== "object" || result === null || !("ok" in result) || result.ok !== true ||
        !("requestId" in result) || result.requestId !== requestId.current) {
        failureMessage = "Chưa xác nhận được phản hồi đã lưu. Vui lòng thử lại.";
        throw new Error("Invalid RSVP storage acknowledgment.");
      }
      setStatus("sent");
    } catch (error) {
      console.error("RSVP submission failed.", error instanceof Error ? error.name : "Unknown error");
      setError(failureMessage);
      setStatus("error");
    }
  }

  return (
    <div className="rsvp-card reveal-sequence" id="rsvp" tabIndex={-1} data-reveal>
      <span className="eyebrow"><span lang="ja">出欠のお返事</span> · MỘT LỜI NHẮN CHO QUANG</span>
      <h3>Bạn sẽ đến chứ?</h3>
      <p>Phản hồi hoàn toàn tùy chọn. Nếu muốn, hãy cho Quang biết để mình chuẩn bị đón bạn nhé.</p>
      {configurationError ? <p role="alert">Chưa kiểm tra được kết nối form. Vui lòng tải lại trang hoặc quay lại sau.</p>
        : available === null ? <p role="status">Đang kiểm tra kết nối phản hồi…</p>
        : !available ? <p role="status">Form đang chờ kết nối Google Sheet, chưa nhận phản hồi. Vui lòng quay lại sau nhé.</p>
        : status === "sent" ? <p className="rsvp-feedback" role="status" tabIndex={-1} ref={feedback}>Cảm ơn bạn! Phản hồi đã được lưu vào Google Sheet của Quang.</p>
        : (
          <form onSubmit={submit} onChange={() => { requestId.current = null; }} aria-busy={status === "sending"}>
            <fieldset disabled={status === "sending"}>
              <label htmlFor="rsvp-name">Tên của bạn <span>(bắt buộc)</span></label>
              <input id="rsvp-name" name="name" autoComplete="name" required maxLength={80} pattern={".*\\S.*"} />
              <label htmlFor="rsvp-attendance">Bạn có thể tham dự không?</label>
              <select id="rsvp-attendance" name="attendance" value={attendance} onChange={(event) => {
                const value = event.target.value;
                if (value === "yes" || value === "maybe" || value === "no") setAttendance(value);
              }}>
                {Object.entries(attendanceOptions).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
              {attendance !== "no" && <>
                <label htmlFor="rsvp-guests">Tổng số người, gồm cả bạn <span>(1–10)</span></label>
                <input id="rsvp-guests" name="guests" type="number" min={1} max={10} step={1} defaultValue={1} required />
              </>}
              <label htmlFor="rsvp-note">Lời nhắn <span>(không bắt buộc)</span></label>
              <textarea id="rsvp-note" name="note" maxLength={500} rows={3} />
              <label className="rsvp-consent"><input type="checkbox" name="consent" required /> <span>Mình đồng ý gửi tên, lựa chọn tham dự, số khách và lời nhắn vào Google Sheet riêng của Quang để chuẩn bị buổi lễ.</span></label>
              <p className="rsvp-privacy">Không cần số điện thoại hay email. Đừng gửi thông tin nhạy cảm trong lời nhắn. Bạn có thể liên hệ Quang để sửa hoặc xóa phản hồi.</p>
              <button type="submit" className="button button-dark">{status === "sending" ? "Đang gửi…" : "Gửi lời nhắn cho Quang"}</button>
            </fieldset>
            {status === "error" && <p className="rsvp-feedback" role="alert" tabIndex={-1} ref={feedback}>{error} Nội dung bạn nhập vẫn được giữ lại.</p>}
          </form>
        )}
    </div>
  );
}
