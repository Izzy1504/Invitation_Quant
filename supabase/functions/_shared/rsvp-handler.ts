import { parseRsvp } from "../../../src/lib/rsvp.ts";

interface Configuration {
  url?: string;
  secret?: string;
  origin?: string;
}

export function createRsvpHandler(config: Configuration) {
  let configured = false;
  try {
    const url = new URL(config.url || "");
    const origin = new URL(config.origin || "");
    configured = url.origin === "https://script.google.com" &&
      /^\/macros\/s\/[\w-]+\/exec$/.test(url.pathname) && !url.search && !url.hash &&
      (config.secret?.length ?? 0) >= 32 &&
      origin.protocol === "https:" && origin.origin === config.origin;
  } catch {
    console.error("RSVP Edge Function configuration is invalid.");
  }

  return async function handle(request: Request): Promise<Response> {
    const headers = {
      "Access-Control-Allow-Origin": config.origin || "https://izzy1504.github.io",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Cache-Control": "no-store",
      Vary: "Origin",
    };
    const json = (body: object, status = 200) => Response.json(body, { status, headers });
    if (request.headers.get("origin") !== config.origin) {
      return json({ error: "Nguồn gửi không hợp lệ." }, 403);
    }
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method === "GET") return json({ available: configured });
    if (request.method !== "POST") return json({ error: "Phương thức không hợp lệ." }, 405);
    if (!configured) {
      console.error("RSVP Edge Function is not configured.");
      return json({ error: "Form chưa kết nối Google Sheet. Vui lòng quay lại sau." }, 503);
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return json({ error: "Định dạng gửi không hợp lệ." }, 415);
    }
    let value: unknown;
    try {
      const reader = request.body?.getReader();
      if (!reader) return json({ error: "Thiếu thông tin phản hồi." }, 400);
      const chunks: Uint8Array[] = [];
      let length = 0;
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        length += chunk.byteLength;
        if (length > 8192) {
          await reader.cancel();
          return json({ error: "Thông tin gửi quá dài." }, 413);
        }
        chunks.push(chunk);
      }
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
      }
      value = JSON.parse(new TextDecoder().decode(bytes));
    } catch (error) {
      console.error("Could not read RSVP request.", error instanceof Error ? error.name : "Unknown error");
      return json({ error: "Không đọc được thông tin. Vui lòng thử lại." }, 400);
    }
    const rsvp = parseRsvp(value);
    if (!rsvp) return json({ error: "Vui lòng kiểm tra tên, lựa chọn tham dự, số khách và đồng ý lưu phản hồi." }, 400);
    try {
      const upstream = await fetch(config.url!, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...rsvp, secret: config.secret }),
        signal: AbortSignal.timeout(15000),
      });
      const result: unknown = upstream.ok ? await upstream.json() : null;
      if (typeof result !== "object" || result === null || !("ok" in result) || result.ok !== true ||
          !("requestId" in result) || result.requestId !== rsvp.requestId) {
        console.error("Google Sheets did not acknowledge RSVP storage.", { status: upstream.status });
        return json({ error: "Chưa xác nhận được phản hồi đã lưu. Vui lòng thử gửi lại." }, 502);
      }
      return json({ ok: true, requestId: rsvp.requestId });
    } catch (error) {
      console.error("RSVP delivery failed.", error instanceof Error ? error.name : "Unknown error");
      return json({ error: "Không kết nối được Google Sheet. Hãy thử gửi lại." }, 502);
    }
  };
}
