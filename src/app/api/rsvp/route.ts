import { parseRsvp } from "@/lib/rsvp";

function configuration() {
  const url = process.env.RSVP_GOOGLE_SCRIPT_URL;
  const secret = process.env.RSVP_GOOGLE_SCRIPT_SECRET;
  if (!url || !secret || secret.length < 32) return null;
  try {
    const parsed = new URL(url);
    if (parsed.origin !== "https://script.google.com" || !/^\/macros\/s\/[\w-]+\/exec$/.test(parsed.pathname) ||
      parsed.search || parsed.hash) return null;
    return { url, secret };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  // Reading the request keeps configuration checks at runtime, not build time.
  void request.url;
  return Response.json({ available: configuration() !== null }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const config = configuration();
  if (!config) {
    console.error("RSVP Google Sheets integration is not configured.");
    return Response.json({ error: "Form chưa kết nối Google Sheet. Vui lòng quay lại sau." }, { status: 503 });
  }
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return Response.json({ error: "Nguồn gửi không hợp lệ." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return Response.json({ error: "Định dạng gửi không hợp lệ." }, { status: 415 });
  }
  let value: unknown;
  try {
    const reader = request.body?.getReader();
    if (!reader) return Response.json({ error: "Thiếu thông tin phản hồi." }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      length += chunk.byteLength;
      if (length > 8192) {
        await reader.cancel();
        return Response.json({ error: "Thông tin gửi quá dài." }, { status: 413 });
      }
      chunks.push(chunk);
    }
    value = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (!(error instanceof SyntaxError)) console.error("Could not read RSVP request body.", error);
    return Response.json({ error: "Không đọc được thông tin. Vui lòng thử lại." }, { status: 400 });
  }
  const rsvp = parseRsvp(value);
  if (!rsvp) {
    return Response.json({ error: "Vui lòng kiểm tra tên, lựa chọn tham dự, số khách (1–10) và đồng ý lưu phản hồi." }, { status: 400 });
  }
  try {
    const upstream = await fetch(config.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...rsvp, secret: config.secret }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    const result: unknown = upstream.ok ? await upstream.json() : null;
    if (typeof result !== "object" || result === null || !("ok" in result) || result.ok !== true ||
      !("requestId" in result) || result.requestId !== rsvp.requestId) {
      console.error("Google Sheets did not acknowledge RSVP storage.", { status: upstream.status });
      return Response.json({ error: "Chưa xác nhận được phản hồi đã lưu. Vui lòng thử gửi lại." }, { status: 502 });
    }
    return Response.json({ ok: true, requestId: rsvp.requestId });
  } catch (error) {
    console.error("RSVP delivery to Google Sheets failed.", error instanceof Error ? error.name : "Unknown error");
    return Response.json({ error: "Không kết nối được Google Sheet. Hãy thử lại; phản hồi trùng sẽ không được lưu hai lần." }, { status: 502 });
  }
}
