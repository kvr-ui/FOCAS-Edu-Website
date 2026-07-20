// Shared building blocks for the native Bigin-look lead forms
// (CounselingForm, WorkoutBatchForm). Keeps the visual replica, UTM capture,
// dial codes, CA status options, and the field Row identical across forms.

// Base URL of our submission server (server/index.js). Both forms post here,
// to different paths (/api/counseling, /api/workout-batch).
// Empty default = same origin (the server serves the site + API on one port).
// Set VITE_COUNSELING_API only if the API runs on a different host/port.
export const LEAD_API_BASE = import.meta.env.VITE_COUNSELING_API || "";

export const DIAL_CODES = ["+91", "+1", "+44", "+61", "+971", "+65", "+60", "+64"];

export const CA_STATUS_OPTIONS = ["Foundation", "Intermediate", "Final"];

// Read utm_* params from the current URL, persisting first-touch values so they
// survive navigation. Returns the UTM set (empty strings if none).
export function captureUtms() {
  const qs = new URLSearchParams(window.location.search);
  const fromUrl = {
    utmSource: qs.get("utm_source") || "",
    utmMedium: qs.get("utm_medium") || "",
    utmCampaign: qs.get("utm_campaign") || "",
    utmContent: qs.get("utm_content") || "",
    utmTerm: qs.get("utm_term") || "",
    landingUrl: window.location.href,
    referrer: document.referrer || "",
  };
  try {
    if (fromUrl.utmSource) {
      // First touch with UTMs → remember them.
      localStorage.setItem("focas_utms", JSON.stringify(fromUrl));
      return fromUrl;
    }
    const saved = localStorage.getItem("focas_utms");
    if (saved) return JSON.parse(saved);
  } catch {
    /* localStorage blocked — fall through */
  }
  return fromUrl;
}

// Defined at module scope (NOT inside a component) so its identity is stable
// across renders — otherwise React remounts the inputs on every keystroke and
// they lose focus after a single character.
export const Row = ({ label, name, error, children }) => (
  <div className="bwf-row">
    <div className="bwf-label">{label}</div>
    <div
      className={
        "bwf-field bwf-field-mandatory" +
        (error ? " bwf-field-error-active" : "")
      }
    >
      <div className="bwf-field-inner">{children}</div>
      {error && <span className="bwf-field-error">{error}</span>}
    </div>
  </div>
);

// Offscreen honeypot input — real users never see it; bots fill it and the
// server silently drops the submission. Pass the controlled value/onChange.
export const Honeypot = ({ value, onChange }) => (
  <input
    type="text"
    name="company"
    tabIndex={-1}
    autoComplete="off"
    aria-hidden="true"
    value={value}
    onChange={onChange}
    style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
  />
);

/* Scoped replica of Bigin's form CSS (prefixed `bwf-` so it can't clash
   with the app's Tailwind styles). */
export const BIGIN_CSS = `
.bwf-scope { font-family: Arial, sans-serif; font-size: 15px; color: #222; -webkit-font-smoothing: antialiased; }
.bwf-scope * { box-sizing: border-box; }
.bwf-wrapper { width: 100%; max-width: 700px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 0 2px 0 #00000033; }
.bwf-form { padding: 30px 30px 40px; position: relative; }
.bwf-header { font-size: 22px; font-weight: bold; padding-bottom: 28px; word-break: break-word; }
.bwf-row { margin-bottom: 20px; }
.bwf-label { padding: 7px 0; word-break: break-word; }
.bwf-field { text-align: left; word-break: break-word; border: 0; position: relative; }
.bwf-field-inner { position: relative; display: flex; flex: 1; }
.bwf-field-mandatory .bwf-field-inner::before { content: ''; position: absolute; inset-inline-start: 0; top: 0; bottom: 0; background: #ff6a6a; width: 3px; border-start-start-radius: 4px; border-end-start-radius: 4px; z-index: 2; }
.bwf-input { width: 100%; border: 1px solid #BDC8D3; border-radius: 4px; padding: 10px 15px; min-height: 38px; font-size: 15px; font-family: inherit; -webkit-appearance: none; }
.bwf-input:focus { outline: none; border: 1px solid #1980d8; }
.bwf-select { -webkit-appearance: none; -moz-appearance: none; appearance: none; background-color: #fff; background-image: url("data:image/svg+xml;utf8,<svg fill='black' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>"); background-repeat: no-repeat; background-position: right 10px center; background-size: 20px; padding-right: 38px; cursor: pointer; }
.bwf-select:invalid, .bwf-select option[value=""] { color: #919191; }
.bwf-dialcode { border: 1px solid #BDC8D3; border-right: 0; border-radius: 4px 0 0 4px; padding: 10px 8px; min-height: 38px; font-size: 15px; background: #fff; font-family: inherit; }
.bwf-dialcode:focus { outline: none; border-color: #1980d8; }
.bwf-phone { border-radius: 0 4px 4px 0; }
.bwf-two-col { display: flex; gap: 10px; width: 100%; }
.bwf-two-col > .bwf-input { flex: 1; min-width: 0; }
.bwf-select:disabled { background-color: #f2f4f7; color: #919191; cursor: not-allowed; }
@media screen and (max-width: 480px) { .bwf-two-col { flex-direction: column; } }
.bwf-field-error-active .bwf-input, .bwf-field-error-active .bwf-dialcode { border: 1px solid #FD6B6D; box-shadow: 0 0 1px 1px #F4A2A2; }
.bwf-field-error { display: block; color: #EA4E4E; font-size: 13px; margin-top: 6px; }
.bwf-btn-wrap { display: flex; margin-top: 40px; align-items: center; justify-content: flex-start; }
.bwf-btn { background: #1980d8; color: #fff; border: 1px solid #1980d8; border-radius: 4px; padding: 10px 26px; font-size: 15px; font-family: inherit; cursor: pointer; }
.bwf-btn:hover { background: #1668b0; border-color: #1668b0; }
.bwf-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.bwf-submit-error { color: #EA4E4E; font-size: 14px; margin-top: 16px; }
.bwf-tick { width: 60px; height: 60px; border-radius: 50%; background: #1D9E75; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
@media screen and (max-width: 590px) { .bwf-form { padding: 20px; } }
`;
