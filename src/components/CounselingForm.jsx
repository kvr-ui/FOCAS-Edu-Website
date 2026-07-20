import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATE_CITIES, STATES } from "@/data/indiaStatesCities";
import {
  BIGIN_CSS,
  CA_STATUS_OPTIONS,
  DIAL_CODES,
  Honeypot,
  LEAD_API_BASE,
  Row,
  captureUtms,
} from "@/components/bigin/formKit";

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

const COUNSELING_API = LEAD_API_BASE;

const LANGUAGE_OPTIONS = ["English", "Tamil", "Hindi"];

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

          <Honeypot value={values.company} onChange={set("company")} />


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

export default CounselingForm;
