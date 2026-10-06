---
name: new-landing-page
description: Create or edit a FOCAS Edu config-driven landing page from a free-text ad brief plus image file names already placed in public/lp/<slug>/. Writes only src/landing-pages/<slug>.js (and public/lp/), validates, builds, and reports paths. Use when asked to make, add, update or tweak a landing page / ad page / campaign page.
---

# new-landing-page

Turn an ad brief into `src/landing-pages/<slug>.js`: a plain JS config consumed by the landing-page engine. The page is served at `/<slug>`, its thank-you page at `/<slug>-success`.

**Input:** a free-text ad brief (offer, audience, price, dates, copy ideas) and image file names already in `public/lp/<slug>/` (the slug may be unknown until step 1; images may be mentioned by name only).

**Reference (read first):** `src/landing-pages/_template.js` lists every block type with all props, every form field, all three submit kinds, expiry and variants. `src/landing/schema.js` is the validator contract. Existing configs in `src/landing-pages/*.js` show real usage.

## Hard rules

- Write ONLY inside `src/landing-pages/` and `public/lp/`. Never edit blocks, the renderer, the schema, scripts, `_template.js`, `.env*`, or any other file. Never run git commit/push (the caller does that).
- Use ONLY the existing block types: `hero`, `ticker`, `countdown`, `highlights`, `whatYouGet`, `howItWorks`, `agenda`, `compare`, `testimonials`, `videoTestimonials`, `gallery`, `faq`, `finalCta`, `footer`.
- NEVER use JSX, React, imports, or the `custom` block. Icons are plain strings (emoji).
- NEVER invent facts: prices, dates, phone numbers, testimonials, results, links, image names. Use only what the brief states or what the user answers. Image paths must point to files that actually exist in `public/lp/<slug>/` (check with `ls`); if a referenced image is missing, omit it and list it under "Couldn't do".
- If the brief asks for something no block supports (a quiz, a pricing slider, live chat, a map, a form field outside the library, an extra variant override such as a different footer, etc.), build the closest supported version and record it in the final "Couldn't do" list. Do not write code for it.

## Steps

1. **Derive the slug.** Short kebab-case from the campaign name (lowercase letters, digits, single hyphens; e.g. "CA Final Strategy Masterclass" -> `ca-final-strategy`). It must not end in `-success`, must not start with `_`, must not collide with an existing `src/landing-pages/<slug>.js` (for a NEW page, pick another slug) or a reserved route (see `RESERVED_ROUTES` in `src/landing/schema.js`: focas, links, meet, payment, success, counselling, rti, career-guidance, audit, manual, workout-batch, fs, course, privacy-policy, plus `<route>-success`, `assets`, `lp`). If the user supplied a slug or the images live in `public/lp/<slug>/`, use that slug.

2. **List missing essentials and ask.** Essentials:
   - **Price / submit kind:** free -> `zoho` (default for free pages); paid -> `razorpay` (needs `amount` in rupees, plus `register` and `verify` endpoint paths, and `backend` env var name if not `VITE_BACKEND_URL`); own lead server -> `leadServer` (needs `endpoint`). Never guess backend endpoints.
   - **Lead source name** (`form.submit.source`, e.g. `manual-class`). If absent, propose the slug and mark it as an assumption in the questions.
   - **Dates:** event/class date-time (for `countdown`, `agenda`, copy) and registration close (`expiresAt`, and what happens after: waitlist or redirect). Use ISO with offset, e.g. `2026-11-30T23:59:00+05:30` (India = +05:30).
   - **Success message:** the thank-you heading/message and next steps (and a WhatsApp group link if any).
   - Also needed when relevant: contact number/WhatsApp link for the footer, ad-angle variants (`?v=`).
   
   If anything essential is missing, STOP, still emit the final output format below with the `Questions` list filled and the other fields marked `pending`, and do not write a config built on guesses. Non-essential gaps (a missing FAQ, testimonials not supplied) are not blockers: omit that section rather than invent content. When the caller supplies answers, resume from step 3.

3. **Write `src/landing-pages/<slug>.js`.** `export default { slug, meta, theme?, nav?, sections, form, success, expiresAt?, afterExpiry?, variants? }`, copying prop shapes from `_template.js`.
   - `slug` equals the file name. `meta.title` and `meta.description` are required (write them from the brief); `meta.ogImage` only if an image exists.
   - Section order: a sensible conversion flow, typically `ticker?`, `hero`, `countdown?`, `highlights`/`whatYouGet`, `howItWorks`/`agenda`, `compare?`, `testimonials`/`videoTestimonials`/`gallery`, `faq`, `finalCta`, `footer`. Give each section an `id` and mirror the main ones into `nav` (`{ label, target }`).
   - Hero is the only section a variant may override (`variants.<name> = { hero: {...}, sourceSuffix }`); variant names are kebab-case.
   - `form.fields`: choose from `name, phone, email, caStatus, attempt, language, city, state, address` (use `address` only for physical shipping). Default to `["name", "phone"]` plus whatever the brief requires.
   - `expiresAt` requires `afterExpiry` (`waitlist` or `redirect` with `redirectTo`).
   - Image paths: `/lp/<slug>/<file>`.

4. **Validate and build.**
   - `node scripts/validate-landing.mjs <slug>`; fix every reported error and re-run until it prints valid.
   - Then `npm run build`; fix config-caused failures. If the build fails for a reason unrelated to the config (another page or app code), do not touch it: report it.

5. **Edit requests** (the page already exists): read the existing config, change only what was asked (a field, a string, one section, a date), keep everything else byte-identical including formatting and order, then re-run step 4. Do not regenerate or restyle the whole file. Do not rename the slug.

## Final output

End with exactly this block, machine-readable (the Telegram bot parses it). Use `none` for empty lists and `pending` for values not yet known.

```
SLUG: <slug>
PAGE: /<slug>
SUCCESS: /<slug>-success
VARIANTS:
- /<slug>?v=<name>
COULDNT_DO:
- <item>
QUESTIONS:
- <question>
```

`VARIANTS`, `COULDNT_DO` and `QUESTIONS` are bullet lists (or `none`). Mention nothing else after the block. Add a short human summary before it only if useful; keep the block last.
