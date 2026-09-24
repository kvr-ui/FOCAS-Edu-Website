import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATE_CITIES, STATES } from "@/data/indiaStatesCities";
import {
  BIGIN_CSS,
  DIAL_CODES,
  Honeypot,
  LEAD_API_BASE,
  Row,
  captureUtms,
} from "@/components/bigin/formKit";

/**
 * Registration form for the Foundation for School Students program (/fs).
 *
 * Same setup as CounselingForm: posts JSON to focas-lead-server
 * (/api/foundation-school), which upserts a Bigin Contact with
 * Lead_Source1 = "Foundation School". The lead is captured here, before the
 * ₹9 step on /fs/book, so no lead is lost if the parent skips payment.
 */

const FS_API = `${LEAD_API_BASE}/api/foundation-school`;

const CLASS_OPTIONS = ["Class 11", "Class 12"];
const LANGUAGE_OPTIONS = ["English", "Tamil", "Hindi"];

const FsForm = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    "First Name": "",
    "Last Name": "",
    dialCode: "+91",
    phone: "",
    Class: "",
    State: "",
    "Other City": "",
    Language: "",
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
    req("Class");
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
      caStatus: `School - ${values.Class}`,
      city: values["Other City"],
      state: values.State,
      language: values.Language,
      company: values.company, // honeypot
      utm: utms || captureUtms(),
    };

    setSubmitting(true);
    try {
      const res = await fetch(FS_API, {
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
        window.gtag("event", "fs_form_submit", {
          event_category: "engagement",
          event_label: "Foundation for School Students",
        });

      // Carry the form data forward so /fs/book can prefill Razorpay.
      const leadData = {
        ...payload,
        name: `${payload.firstName} ${payload.lastName}`.trim(),
      };
      try {
        sessionStorage.setItem("focas_lead", JSON.stringify(leadData));
      } catch {
        /* sessionStorage may be unavailable (private mode) — non-fatal */
      }

      navigate("/fs/book", { state: leadData });
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bwf-scope">
      <style>{BIGIN_CSS}</style>
      <style>{FS_FORM_CSS}</style>

      <div className="bwf-wrapper">
        <form className="bwf-form" onSubmit={handleSubmit} noValidate>
          <h2 className="bwf-header">Register your child</h2>

          <Honeypot value={values.company} onChange={set("company")} />

          <Row label="Student First Name" name="First Name" error={errors["First Name"]}>
            <input
              name="First Name"
              maxLength={40}
              type="text"
              className="bwf-input"
              value={values["First Name"]}
              onChange={set("First Name")}
            />
          </Row>

          <Row label="Student Last Name" name="Last Name" error={errors["Last Name"]}>
            <input
              name="Last Name"
              maxLength={80}
              type="text"
              className="bwf-input"
              value={values["Last Name"]}
              onChange={set("Last Name")}
            />
          </Row>

          <Row label="Parent's WhatsApp Number" name="phone" error={errors.phone}>
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

          <Row label="Currently studying in" name="Class" error={errors.Class}>
            <select
              name="Class"
              className="bwf-input bwf-select"
              value={values.Class}
              onChange={set("Class")}
            >
              <option value="" disabled>
                -Select-
              </option>
              {CLASS_OPTIONS.map((o) => (
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
              {submitting ? "Submitting…" : "Continue — Book counselling for ₹9"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Brand overrides on top of the Bigin replica (teal instead of Bigin blue).
const FS_FORM_CSS = `
.bwf-scope { font-family: 'Urbanist', Arial, sans-serif; }
.bwf-header { font-family: 'Sora', Arial, sans-serif; color: #0b3d33; }
.bwf-wrapper { border-radius: 18px; box-shadow: 0 20px 50px -20px rgba(11,61,51,.35), 0 0 0 1px rgba(11,61,51,.08); }
.bwf-input:focus, .bwf-dialcode:focus { border-color: #1D9E75; }
.bwf-btn-wrap { margin-top: 28px; }
.bwf-btn { width: 100%; background: #0f6e56; border-color: #0f6e56; border-radius: 12px; padding: 14px 20px; font-weight: 700; font-size: 16px; }
.bwf-btn:hover { background: #0b5745; border-color: #0b5745; }
`;

export default FsForm;
