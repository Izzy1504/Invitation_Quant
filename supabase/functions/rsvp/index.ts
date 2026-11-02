import { createRsvpHandler } from "../_shared/rsvp-handler.ts";

Deno.serve(createRsvpHandler({
  url: Deno.env.get("RSVP_GOOGLE_SCRIPT_URL"),
  secret: Deno.env.get("RSVP_GOOGLE_SCRIPT_SECRET"),
  origin: Deno.env.get("RSVP_ALLOWED_ORIGIN"),
}));
