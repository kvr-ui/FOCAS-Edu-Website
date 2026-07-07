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
 * Native replica of the Zoho Bigin "WORKOUT BATCH" form
 * (forms/workout-batch, org 60068257282).
 *
 * Same setup as the counseling form: posts JSON to our server (server/index.js
 * → /api/workout-batch), which inserts a Bigin Contact and forwards the lead +
 * UTMs to the leads API. Lead_Source is fixed to "Workout Batch" server-side.
 */

const WORKOUT_API = `${LEAD_API_BASE}/api/workout-batch`;

const WorkoutBatchForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    "First Name": "",
    "Last Name": "",
    dialCode: "+91",
    phone: "",
    CA_Status: "",
    State: "",
    "Other City": "",
    company: "", // honeypot — must stay empty for real users
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [utms, setUtms] = useState(null);

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
    if (values["First Name"].trim() && /\d/.test(values["First Name"]))
      e["First Name"] = "Only letters are allowed.";
    if (values["Last Name"].trim() && /\d/.test(values["Last Name"]))
      e["Last Name"] = "Only letters are allowed.";
    if (!values.phone.trim()) e.phone = "This field is required.";
    else if (!/^[0-9]{6,15}$/.test(values.phone.trim()))
      e.phone = "Enter a valid Phone.";
    req("CA_Status");
    req("State");
    req("Other City");
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
      caStatus: values.CA_Status,
      city: values["Other City"],
      state: values.State,
      company: values.company, // honeypot
      utm: utms || captureUtms(),
    };

    setSubmitting(true);
    try {
      const res = await fetch(WORKOUT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      if (typeof window.fbq === "function") window.fbq("track", "Lead");
      if (typeof window.gtag === "function")
        window.gtag("event", "workout_batch_submit", {
          event_category: "engagement",
          event_label: "Workout Batch Enroll",
        });

      navigate("/workout-batch-success");
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
          <h1 className="bwf-header">WORKOUT BATCH</h1>

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

          <Row label="CA Status  - Foundation - Intermediate - Final" name="CA_Status" error={errors.CA_Status}>
            <select
              name="CA_Status"
              className="bwf-input bwf-select"
              value={values.CA_Status}
              onChange={set("CA_Status")}
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

export default WorkoutBatchForm;
