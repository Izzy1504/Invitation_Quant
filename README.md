# 「青春の最後のページ」— The Last Page of Youth

A mobile-first, single-page graduation story built with Next.js, TypeScript, native WebGL, GSAP/ScrollTrigger, Motion for React, and CSS. The latest visual direction combines the user-requested sunset/night-sky wallpaper with original sakura branches, perspective petals, and a cinematic letter entrance. The fantasy campus map follows the supplied floor-G image. A small server relay supports optional Google Sheets RSVP. Music uses the official YouTube player; no music or sound-effect recording is downloaded or bundled.

The header and footer wordmark is **Izzy**.

## Japanese + Vietnamese direction

Japanese text introduces scenes and accents the story; Vietnamese remains the primary language for event information, controls, and accessibility labels. Japanese phrases are marked with `lang="ja"`. Be Vietnam Pro is used for body text and controls, Noto Serif for Vietnamese display headings, and Noto Serif JP for Japanese text. `next/font` downloads these fonts during the build and self-hosts them; visitors do not need to request Google Fonts. Fonts use `display: swap` without preloading every weight and language subset.

Readable type is defined in `src/app/readability.css`: body copy is 16–17px, key event rows are 15px, controls are generally 14–16px, and decorative labels remain smaller. Mobile chapter labels are 10px to fit five chapters; the primary navigation is also available through larger in-page links.

| Japanese | Vietnamese meaning / role |
|---|---|
| 青春の最後のページ | Trang cuối của thanh xuân — project title |
| あの日の空 | Bầu trời ngày ấy — memories |
| 約束の日 | Ngày hẹn — ceremony |
| 学園案内 | Hướng dẫn khuôn viên — floor-G map |
| また会おう。 | Hẹn gặp lại — closing |

## Anime motion and navigation

- Japanese titles reveal character by character, with staggered opacity, a small upward motion, and a soft focus-to-sharp transition. Screen readers receive the complete phrase once, not individual decorative characters. Text remains visible without JavaScript.
- The envelope opens over 2.8 seconds: its flap lifts, the letter rises, light rings expand, the sky camera moves forward, a Japanese intertitle appears, and the scene dissolves into the invitation. Escape and Skip remain available. Reduced motion opens immediately.
- **Xem lại cảnh mở thư** in the hero replays the introduction, resets its soundtrack and Japanese/scroll reveal sequences, and enables the site's motion control without overriding operating-system reduced motion. RSVP entries and map selection are preserved. A visible notice explains when the device's reduced-motion preference is disabling the effects.
- **Bật đầy đủ hiệu ứng** is available in both the opening and hero. This explicit opt-in overrides device reduced motion for this invitation across CSS, WebGL, Motion, GSAP and native chapter navigation. The choice is saved locally when storage is available and survives reloads. **Dùng cài đặt chuyển động của thiết bị** removes the override. Without this opt-in, device accessibility preferences remain respected; the pause button still works in full-motion mode.
- Native WebGL draws 80 mobile / 140 desktop sakura petals in a single draw call. Shader-generated petal shapes rotate in perspective at different depths, with soft edges, gentle lighting, and subtle fine-pointer response. This is a lightweight 3D particle layer over 2D illustrated scenery, not a fully modeled 3D world.
- Animation is capped at 30fps on narrow screens / 45fps otherwise, with pixel ratio capped at 1.25 / 1.75. Rendering stops while the document is hidden or motion is paused; GPU buffers, shaders and programs are released on cleanup. Context loss or unavailable WebGL explicitly falls back to CSS petals with a small “Hiệu ứng nhẹ” indicator. Reduced motion does not initialize WebGL.
- Original SVG sakura boughs sway in the foreground. GSAP/ScrollTrigger moves the background and bough layers at different depths; the closing sky also has gentle parallax. Native scrolling/history remain intact, without scroll hijacking or pinned sections.
- Sections and their text blocks reveal in a soft stagger as they enter the viewport. The pause control freezes live scenery, disables animated navigation, and immediately exposes revealed text. Operating-system reduced motion disables character/scroll motion and continuous scenery.
- The default floor-G map is an original fantasy atlas with a coastal campus, jade pond, stone paths, illustrated trees, parchment buildings, and a compass. It reuses the supplied map's room/landmark outlines and positions, not game artwork. All 39 selectable locations have labels, a native selector, descriptions, and 100–300% zoom. “Đối chiếu ảnh gốc” switches to the unmodified source image using the same interactive geometry. Decorative landscaping is not a verified real-world feature.

### Background source

The user-requested [WallpaperCave image](https://wallpapercave.com/wp/wp14896430.webp) is resized to `public/anime-sky.webp` (2560 × 1420, approximately 269 KiB) and `public/anime-sky-mobile.webp` (1280 × 710, approximately 91 KiB). Narrow screens use the smaller image to reduce transfer and decoded-image memory; visitors do not depend on remote image hotlinking. Dark color grading keeps hero/opening/closing text legible; ceremony information, RSVP and map keep light readable surfaces. The image's authorship/license has not been independently established: confirm permission for your intended publication or replace it with an owned/licensed background. Sakura art and WebGL shaders are original.

## YouTube soundtrack and opening sound

Opening the envelope (or skipping the introduction) requests autoplay of the user-supplied [A Town With An Ocean View / Umi no Mieru Machi](https://www.youtube.com/watch?v=pGsZdaGu654). The official IFrame API creates a visible, inline privacy-enhanced YouTube player in the hero—not a popup. The player starts at 35% volume and requests looping. No YouTube API/player request is made before that interaction.

The **Tắt tiếng / Bật tiếng** button remains available while browsing. It controls the real YouTube player through its API; native pause, play, and volume controls remain available in the inline player. The player stays mounted across chapter changes. A browser may block unmuted autoplay even after a gesture if API loading delays it: the UI reports that and provides **Phát nhạc**, rather than claiming playback began. Player/network errors expose retry and direct links. Actual playback is reported from YouTube events, not a timer.

Direct YouTube and [YouTube Music](https://music.youtube.com/watch?v=pGsZdaGu654) links are provided. Both sharing URLs identify the same video; the Music URL is not an audio-stream endpoint and does not bypass autoplay policies. Do not hide the YouTube video or extract its audio; an audio-only player requires an owned/licensed audio file. Screen-lock/app-background playback and regional availability are controlled by YouTube and device/browser policy. Visual pause and soundtrack controls are independent.

The envelope click also plays the user-linked [“Tuturu” sound from Myinstants](https://www.myinstants.com/en/instant/tuturu/) once at 55% volume. Its source is the page's published `og:audio` URL, requested directly by an HTML audio element with `preload="none"`; no recording is copied into the project. Skip/Escape do not play this effect. Playback failure is logged and shown as a non-blocking notice; it never blocks the letter transition. The source credit appears in the opening. This external audio request exposes the guest's connection to Myinstants, and availability/usage rights remain subject to the source; confirm permission before public distribution.

## Optional RSVP → Google Sheets

The optional Vietnamese RSVP form is under the ceremony card, with a “Phản hồi” header link. It asks for a name, attending/maybe/not-attending, total guests (1–10, or zero when not attending), an optional 500-character note, and explicit storage consent. It does not collect email or phone numbers. Replies are not displayed publicly.

`POST /api/rsvp` validates the request and relays it server-side to Google Apps Script. The secret never reaches the browser. The form only shows success when the script acknowledges storage with the matching request ID. Retry requests reuse that ID; the script uses a lock and checks IDs to avoid storing the same submission twice. Guest text is escaped against spreadsheet formula injection. These checks do not replace bot protection: enable hosting-level rate limits/bot protection before publicly distributing the invitation.

### Connect your supplied Google Sheet

The spreadsheet sharing URL alone is **not** a submission endpoint. The Google account that deploys the script needs edit access to your supplied sheet. You do not need to publish the sheet or grant guests edit access.

For assisted local setup, run `npm run setup:rsvp`. This generates a cryptographically random secret in `.env.local` (or reuses the existing secret) and a private, gitignored `.rsvp-local/paste-into-apps-script.gs`. Paste that generated script into Apps Script and run **setupRsvp** once, granting spreadsheet access. It saves the matching secret in Script properties, so no manual secret copying is needed. Deploy the Web app as described below, then set `RSVP_GOOGLE_SCRIPT_URL` in `.env.local` and restart the server. Never share the generated script or environment file; send only the deployment URL when requesting assistance. Running setup again preserves existing configuration. These local files are not automatically transferred to production hosting.

Alternatively, configure the secret manually:

1. In your supplied [Google Sheet](https://docs.google.com/spreadsheets/d/16Ygkcie0B0DWRSgCmJSkT0SqCkvTesV3PgtUJ-t2km0/edit), open **Extensions → Apps Script**.
2. Paste the contents of `scripts/google-sheets-rsvp.gs` into the script editor. It targets this sheet ID and creates a separate **RSVP** tab, leaving the existing tab (`gid=0`) untouched. Do not rename or reorder the RSVP columns. Use an empty/new RSVP tab for the initial setup.
3. Generate a private random secret locally, for example `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Do not send it through chat or put it in source control.
4. In **Project Settings → Script properties**, add `RSVP_SECRET` with that secret.
5. Choose **Deploy → New deployment → Web app**, **Execute as: Me**, **Who has access: Anyone**. Authorize the requested spreadsheet access. Copy the deployment URL ending in `/exec`, not the test `/dev` URL. If your Google Workspace disallows anonymous web apps, this integration needs an alternative authorized backend.
6. Add these server-only values to `.env.local` for local use and to your hosting environment for deployment:

   ```dotenv
   RSVP_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   RSVP_GOOGLE_SCRIPT_SECRET=YOUR_PRIVATE_SECRET_FROM_STEP_3
   ```

7. Restart the Next.js server after local configuration. In production, redeploy/restart as required by the host. Open the form, send a test response, and verify a row appears in the **RSVP** tab before sharing. After modifying Apps Script, update the deployment to a new version.

Until configuration is present, the site explicitly says the form is not connected and does not accept or pretend to save responses. A Next.js server deployment (for example Vercel) is required; static GitHub Pages alone cannot run the relay. Keep sheet access restricted to the organizer, remove test rows, and delete guest data after it is no longer needed. Guests can contact Quang to correct/delete replies.

The reference repository [invitation-to-gc](https://github.com/Izzy1504/invitation-to-gc) informed the interaction direction (cinematic opening, scroll reveals, SVG map). Its code, routes, campus layout, personal details, and media are not copied. The earlier Unsplash/Pixabay pages could not be retrieved directly; the later user-specified WallpaperCave image is the current background.

The [Genshin Impact home page](https://genshin.hoyoverse.com/vi/home) was also inspected as a visual reference for scenic presentation and restrained fantasy framing. Our celestial arch, gold-edged buttons/cards, chapter navigation, sky islands, and animation assets are original; no game media, characters, or website code were copied.

## Run locally

Requires Node.js 22.13 or newer (or a supported current LTS release).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Before sharing or publishing

The supplied plan marks some ceremony details as unconfirmed. Verify the year, date, check-in room, graduate seat, parent area, and contact group with the official organizer before publishing. Until then, the site labels the year as needing confirmation and renders missing fields as “Đang cập nhật”; it intentionally has no countdown.

The floor-G map was supplied later as a 1230 × 668 PNG. Its unmodified copy is `public/campus-floor-g.png`. `src/data/campus-map.ts` contains hotspot outlines and fantasy label anchors in the same source-image coordinate system. `src/components/fantasy-campus-art.tsx` redraws the campus as original vector art. `src/components/anime-campus-map.tsx` offers both fantasy and source-image views with shared overlays, maintaining alignment at every zoom level. This preserves the source's numbered rooms, parking area, 7-Eleven label, labs, library, pond, medical room, entrance, and exit. It is not a survey or a newly verified official plan; no unconfirmed check-in location, seat, or route is inferred from it.

Personal photos and a personal timeline are omitted because approved content was not provided. Ceremony content is held in `src/data/graduation.ts`. Game sprites/Lottie can only be added once suitable assets and usage permission are available; no game characters are displayed.

## Mobile verification

Use the responsive browser tools at 360px, 390px, tablet, and desktop sizes. Check opening/Tuturu/skip/Escape, progressive Japanese titles, staggered scroll reveals, chapter navigation/history, reduced motion, motion pause, WebGL/context-loss fallback, YouTube autoplay-block/error states and mute controls, player persistence, RSVP validation/failure/retry, landmark keyboard selection, map view switching, and zoom. Check Vietnamese diacritics and Japanese glyphs after fonts load. In-app Zalo/Messenger browsers and iOS/Android playback policies require testing on actual devices before sharing; desktop emulation does not certify these webviews or guarantee a frame rate on every device.

To see the full sequence locally, run `npm run dev`, open `http://localhost:3000`, and press **Mở thư và bước vào thế giới anime**. To repeat, use **Xem lại cảnh mở thư** or reload. If the dock shows a Play triangle, motion is paused: press it to resume. Check OS/browser Accessibility → Reduced Motion if the reduced-motion notice appears; use hardware acceleration for WebGL where available. To view on a phone on the same trusted Wi-Fi, run `npm run dev -- --hostname 0.0.0.0` and open `http://YOUR_PC_LAN_IP:3000`; allow the firewall only on a trusted private network. `localhost` on a phone refers to the phone, not the PC. No public deployment is performed automatically.

## Checks

```bash
npm run lint
npm run build
npm test
```

The Node tests cover WebGL geometry/draw budgets and GPU cleanup/failure paths, RSVP validation, server relay acknowledgments/errors, and Apps Script storage with mocked Google services, including retry deduplication and formula escaping. They do not certify a real Sheet write; complete step 7 above with your own deployment.

## GitHub Pages + Supabase

The public site is intended for `https://izzy1504.github.io/Invitation_Quant/`.
GitHub Pages serves static assets only. The existing form calls the public Supabase
Edge Function at `https://zmnxgmtarbrkeefyffjg.supabase.co/functions/v1/rsvp`;
the function validates submissions and relays them to the existing Google Sheet.
No database password or Supabase service-role key is needed.

1. Authenticate locally with `npx supabase login`. Never share access tokens in chat.
2. Set `RSVP_GOOGLE_SCRIPT_URL` and `RSVP_GOOGLE_SCRIPT_SECRET` using Supabase
   Secrets, with the same values as `.env.local`, and set
   `RSVP_ALLOWED_ORIGIN=https://izzy1504.github.io`.
3. Deploy `supabase/functions/rsvp` to project `zmnxgmtarbrkeefyffjg` with JWT
   verification disabled (configured in `supabase/config.toml`); guests do not log in.
   The endpoint accepts requests from the configured Pages origin, not localhost.
   CORS is not authentication or bot protection: add rate limiting/bot protection
   before wide distribution to avoid public endpoint abuse and quota exhaustion.
4. Verify the endpoint's availability and a test write before publishing Pages.
5. Enable GitHub Pages with **GitHub Actions** as the source in the public
   `Izzy1504/Invitation_Quant` repository. Push to `master` to run the Pages workflow.

`npm run build:pages` requires `NEXT_PUBLIC_RSVP_ENDPOINT` and creates an isolated
`.pages-build/out` export. It excludes the local Next API route and private environment
files, prefixes fonts/scripts/map/background assets with `/Invitation_Quant`, and
disables server-only partial prerendering for the export. Normal `npm run build`
and `npm run start` retain the local server relay and existing configuration.
Only the public function URL goes into the frontend; Google Script secrets must
remain in Supabase Secrets. Private setup files under `.rsvp-local` and `.env.local`
are gitignored and must never be published.

Deployments are not complete until the public page and a real RSVP write have
been verified. Confirm ceremony details and asset permissions before distributing
the public invitation.
