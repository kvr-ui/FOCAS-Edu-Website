import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATE_CITIES, STATES } from "@/data/indiaStatesCities";

/**
 * Native replica of the Zoho Bigin "Student Registration Form"
 * (book-your-1on1-counseling-session, org 60068257282).
 *
 * Pixel-matches the Bigin default form look (white card, top-aligned labels,
 * red mandatory bars, blue #1980d8 submit).
 *
 * Submissions are POSTed as JSON to our own server (server/index.js), which
 * holds the Zoho credentials and inserts a Contact via the Bigin REST API.
 * The refresh token must never reach the browser, so we never call Bigin
 * directly from here.
 */

// Where the form posts. Defaults to the local standalone server on :7001.
const COUNSELING_API =
  import.meta.env.VITE_COUNSELING_API || "http://localhost:7001";

// Read utm_* params from the current URL, persisting first-touch values so they
// survive navigation. Returns the UTM set (empty strings if none).
function captureUtms() {
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

const DIAL_CODES = ["+91", "+1", "+44", "+61", "+971", "+65", "+60", "+64"];

const CA_STATUS_OPTIONS = ["Foundation", "Intermediate", "Final"];

const LANGUAGE_OPTIONS = ["English", "Tamil", "Hindi"];

// Defined at module scope (NOT inside the component) so its identity is stable
// across renders — otherwise React remounts the inputs on every keystroke and
// they lose focus after a single character.
const Row = ({ label, name, error, children }) => (
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

const CounselingForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    "First Name": "",
    "Last Name": "",
    dialCode: "+91",
    phone: "",
    CONTACTCF1: "", // CA status
    CONTACTCF7: "", // Attempt
    State: "", // State
    "Other City": "", // City
    Language: "", // Preferred Language
    company: "", // honeypot — must stay empty for real users
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [utms, setUtms] = useState(null);

  // Capture UTMs once on mount (first-touch, persisted in captureUtms).
  useEffect(() => {
    setUtms(captureUtms());
  }, []);

  const set = (name) => (e) => {
    setValues((v) => ({ ...v, [name]: e.target.value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  // Changing the state resets the dependent city selection.
  const setState = (e) => {
    const State = e.target.value;
    setValues((v) => ({ ...v, State, "Other City": "" }));
    setErrors((er) => ({ ...er, State: undefined }));
  };

  const validate = () => {
    const e = {};
    const req = (k, msg) => {
      if (!values[k] || !String(values[k]).trim()) e[k] = msg || "This field is required.";
    };
    req("First Name");
    req("Last Name");
    // Bigin names are letters-only
    if (values["First Name"].trim() && /\d/.test(values["First Name"]))
      e["First Name"] = "Only letters are allowed.";
    if (values["Last Name"].trim() && /\d/.test(values["Last Name"]))
      e["Last Name"] = "Only letters are allowed.";
    if (!values.phone.trim()) e.phone = "This field is required.";
    else if (!/^[0-9]{6,15}$/.test(values.phone.trim()))
      e.phone = "Enter a valid Phone.";
    req("CONTACTCF1");
    req("CONTACTCF7");
    req("State");
    req("Other City");
    req("Language");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const payload = {
      firstName: values["First Name"].trim(),
      lastName: values["Last Name"].trim(),
      phone: `${values.dialCode}${values.phone}`.trim(),
      caStatus: values.CONTACTCF1,
      attempt: values.CONTACTCF7,
      city: values["Other City"],
      state: values.State,
      language: values.Language,
      company: values.company, // honeypot
      // UTM attribution — forwarded to the leads API (never stored in Bigin).
      utm: utms || captureUtms(),
    };

    setSubmitting(true);
    try {
      const res = await fetch(`${COUNSELING_API}/api/counseling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      // Fire lead tracking (same events the rest of the site uses).
      if (typeof window.fbq === "function") window.fbq("track", "Lead");
      if (typeof window.gtag === "function")
        window.gtag("event", "counseling_form_submit", {
          event_category: "engagement",
          event_label: "Book 1 on 1 Counseling Session",
        });

      // Redirect to the success page (https://focasedu.com/success in prod).
      navigate("/success");
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bwf-scope">
      <style>{BIGIN_CSS}</style>

      <div className="bwf-wrapper">
        <form className="bwf-form" onSubmit={handleSubmit} noValidate>
          <h1 className="bwf-header">Student Registration Form</h1>

          {/* Honeypot: hidden from real users; bots fill it and get silently dropped. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={values.company}
            onChange={set("company")}
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
          />


          <Row label="First Name" name="First Name" error={errors["First Name"]}>
            <input
              name="First Name"
              maxLength={40}
              type="text"
              className="bwf-input"
              value={values["First Name"]}
              onChange={set("First Name")}
            />
          </Row>

          <Row label="Last Name" name="Last Name" error={errors["Last Name"]}>
            <input
              name="Last Name"
              maxLength={80}
              type="text"
              className="bwf-input"
              value={values["Last Name"]}
              onChange={set("Last Name")}
            />
          </Row>

          <Row label="Phone" name="phone" error={errors.phone}>
            <select
              className="bwf-dialcode"
              value={values.dialCode}
              onChange={set("dialCode")}
              aria-label="Country code"
            >
              {DIAL_CODES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              maxLength={20}
              type="tel"
              inputMode="numeric"
              className="bwf-input bwf-phone"
              value={values.phone}
              onChange={set("phone")}
            />
          </Row>

          <Row label="CA status  - Foundation - Intermediate - Final" name="CONTACTCF1" error={errors.CONTACTCF1}>
            <select
              name="CONTACTCF1"
              className="bwf-input bwf-select"
              value={values.CONTACTCF1}
              onChange={set("CONTACTCF1")}
            >
              <option value="" disabled>
                -Select-
              </option>
              {CA_STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Row>

          <Row label="Attempt" name="CONTACTCF7" error={errors.CONTACTCF7}>
            <input
              name="CONTACTCF7"
              maxLength={255}
              type="text"
              className="bwf-input"
              value={values.CONTACTCF7}
              onChange={set("CONTACTCF7")}
            />
          </Row>

          <Row label="State &amp; City" name="location" error={errors.State || errors["Other City"]}>
            <div className="bwf-two-col">
              <select
                name="State"
                className="bwf-input bwf-select"
                value={values.State}
                onChange={setState}
              >
                <option value="" disabled>
                  -State-
                </option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                name="Other City"
                className="bwf-input bwf-select"
                value={values["Other City"]}
                onChange={set("Other City")}
                disabled={!values.State}
              >
                <option value="" disabled>
                  {values.State ? "-City-" : "-Select state first-"}
                </option>
                {(STATE_CITIES[values.State] || []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </Row>

          <Row label="Preferred Language" name="Language" error={errors.Language}>
            <select
              name="Language"
              className="bwf-input bwf-select"
              value={values.Language}
              onChange={set("Language")}
            >
              <option value="" disabled>
                -Select-
              </option>
              {LANGUAGE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Row>

          {submitError && <div className="bwf-submit-error">{submitError}</div>}

          <div className="bwf-btn-wrap">
            <button type="submit" className="bwf-btn" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* Scoped replica of Bigin's form CSS (prefixed `bwf-` so it can't clash
   with the app's Tailwind styles). */
const BIGIN_CSS = `
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

export default CounselingForm;
