export const attendanceOptions = {
  yes: "Mình sẽ đến",
  maybe: "Mình chưa chắc",
  no: "Tiếc quá, mình không đến được",
} as const;

export interface Rsvp {
  requestId: string;
  name: string;
  attendance: keyof typeof attendanceOptions;
  guests: number;
  note: string;
  consent: true;
}

export function parseRsvp(value: unknown): Rsvp | null {
  if (typeof value !== "object" || value === null) return null;
  if (!("requestId" in value) || typeof value.requestId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.requestId)) return null;
  if (!("name" in value) || typeof value.name !== "string" ||
    !value.name.trim() || value.name.trim().length > 80) return null;
  if (!("attendance" in value) ||
    (value.attendance !== "yes" && value.attendance !== "maybe" && value.attendance !== "no")) return null;
  if (!("guests" in value) || typeof value.guests !== "number" || !Number.isInteger(value.guests) ||
    (value.attendance === "no" ? value.guests !== 0 : value.guests < 1 || value.guests > 10)) return null;
  if (!("note" in value) || typeof value.note !== "string" || value.note.trim().length > 500) return null;
  if (!("consent" in value) || value.consent !== true) return null;
  return {
    requestId: value.requestId,
    name: value.name.trim(),
    attendance: value.attendance,
    guests: value.guests,
    note: value.note.trim(),
    consent: true,
  };
}
