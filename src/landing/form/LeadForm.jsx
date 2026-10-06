import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATE_CITIES, STATES } from "@/data/indiaStatesCities";
import { DIAL_CODES, Honeypot } from "@/components/bigin/formKit";
import {
  ADDRESS_PARTS,
  buildSubmission,
  initialValues,
  normalizeFields,
  validateValues,
} from "./fields";
import { submitLead } from "./submitters";

/**
 * Config-driven, full-screen lead form for landing pages.
 *
 * Renders only the fields listed in `form.fields`, validates inline, and hands
 * the payload to `submitLead` (tracking + zoho / leadServer / razorpay).
 * In "waitlist" mode nothing is sent to a backend; an inline thank-you shows.
 *
 * Accent colours come from the LandingTheme CSS variables.
 */

const ACCENT = "var(--lp-accent, #1D9E75)";
const ACCENT_2 = "var(--lp-accent-2, #0f6e56)";

const LEAD_FORM_CSS = `
.lpf-input { width: 100%; padding: 0.875rem 1.25rem; border: 2px solid #e5e7eb; border-radius: 1rem;
  font-size: 0.875rem; font-weight: 500; color: #374151; outline: none; background: #fff;
  transition: border-color .15s; }
.lpf-input::placeholder { color: #9ca3af; }
.lpf-input:focus { border-color: ${ACCENT}; }
.lpf-input:disabled { background: #f9fafb; color: #9ca3af; }
.lpf-input.lpf-invalid { border-color: #f87171; }
.lpf-label { display: block; font-size: 0.75rem; font-weight: 700; color: #4b5563; margin: 0 0 0.375rem 0.25rem; }
.lpf-error { display: block; font-size: 0.75rem; font-weight: 600; color: #ef4444; margin: 0.375rem 0 0 0.25rem; }
.lpf-btn { width: 100%; padding: 1rem; border-radius: 1rem; color: #fff; font-weight: 900; font-size: 1rem;
  background: ${ACCENT}; box-shadow: 0 10px 15px -3px rgba(0,0,0,.1); transition: transform .15s, background .15s; }
.lpf-btn:hover:not(:disabled) { transform: scale(1.02); background: ${ACCENT_2}; }
.lpf-btn:disabled { opacity: .7; cursor: not-allowed; }
`;

const FieldError = ({ id, error }) =>
  error ? (
    <span id={id} className="lpf-error" role="alert">
      {error}
    </span>
  ) : null;

const inputCls = (error) => "lpf-input" + (error ? " lpf-invalid" : "");

export default function LeadForm({ form = {}, slug, variant = null, mode = "normal", onClose }) {
  const navigate = useNavigate();
  const specs = useMemo(() => normalizeFields(form.fields), [form.fields]);
  const [values, setValues] = useState(() => initialValues(specs));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);

  const waitlist = mode === "waitlist";
  const submit = form.submit || {};
  const hasState = specs.some((f) => f.type === "state");

  // Escape closes the modal.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const clearError = (k) => errors[k] && setErrors((er) => ({ ...er, [k]: undefined }));

  const setField = (name, value) => {
    setValues((v) => {
      const next = { ...v, [name]: value };
      // Changing the state resets the dependent city selection.
      if (name === "state" && hasState && specs.some((f) => f.type === "city")) next.city = "";
      return next;
    });
    clearError(name);
  };

  const setAddress = (part, value) => {
    setValues((v) => ({ ...v, address: { ...v.address, [part]: value } }));
    clearError(`address.${part}`);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;
    setSubmitError("");
    const e = validateValues(specs, values);
    setErrors(e);
    if (Object.keys(e).length) return;

    const { payload, tracked } = buildSubmission(specs, values);
    setSubmitting(true);
    const result = await submitLead({
      form,
      slug,
      variant,
      mode,
      payload,
      tracked,
      honeypot: values.company,
      navigate,
    });
    if (result.status === "waitlist") setWaitlistDone(true);
    else if (result.status === "error") setSubmitError(result.error);
    setSubmitting(false);
  };

  const renderField = (f) => {
    const id = `lpf-${f.name}`;
    const err = errors[f.name];
    const aria = { "aria-invalid": err ? true : undefined, "aria-describedby": err ? `${id}-err` : undefined };
    const label = (
      <label htmlFor={id} className="lpf-label">
        {f.label}
        {!f.required && <span className="font-normal text-gray-400"> (optional)</span>}
      </label>
    );

    if (f.type === "address") {
      return (
        <fieldset key={f.name} className="flex flex-col gap-3 border-0 p-0 m-0">
          <legend className="lpf-label">{f.label}</legend>
          {ADDRESS_PARTS.map(({ part, placeholder }) => {
            const pid = `lpf-address-${part}`;
            const perr = errors[`address.${part}`];
            return (
              <div key={part}>
                <input
                  id={pid}
                  type="text"
                  inputMode={part === "pincode" ? "numeric" : undefined}
                  maxLength={part === "pincode" ? 6 : 200}
                  placeholder={placeholder}
                  aria-label={placeholder}
                  aria-invalid={perr ? true : undefined}
                  className={inputCls(perr)}
                  value={values.address?.[part] ?? ""}
                  onChange={(e) =>
                    setAddress(
                      part,
                      part === "pincode" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value
                    )
                  }
                />
                <FieldError id={`${pid}-err`} error={perr} />
              </div>
            );
          })}
        </fieldset>
      );
    }

    let control;
    if (f.type === "phone") {
      control = (
        <div className="flex gap-2">
          <select
            aria-label="Country code"
            className="lpf-input"
            style={{ width: "6.5rem", flex: "none" }}
            value={values.dialCode}
            onChange={(e) => setValues((v) => ({ ...v, dialCode: e.target.value }))}
          >
            {DIAL_CODES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder={f.placeholder}
            className={inputCls(err)}
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            {...aria}
          />
        </div>
      );
    } else if (f.type === "select" || f.type === "state" || (f.type === "city" && hasState)) {
      let options = f.options || [];
      let disabled = false;
      let placeholder = "-Select-";
      if (f.type === "state") options = STATES;
      if (f.type === "city") {
        options = STATE_CITIES[values.state] || [];
        disabled = !values.state;
        placeholder = values.state ? "-Select city-" : "-Select state first-";
      }
      control = (
        <select
          id={id}
          className={inputCls(err)}
          value={values[f.name]}
          disabled={disabled}
          onChange={(e) => setField(f.name, e.target.value)}
          {...aria}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    } else {
      // text / email / city without a state selector
      control = (
        <input
          id={id}
          type={f.type === "email" ? "email" : "text"}
          maxLength={f.type === "email" ? 120 : 80}
          placeholder={f.placeholder}
          className={inputCls(err)}
          value={values[f.name]}
          onChange={(e) => setField(f.name, e.target.value)}
          {...aria}
        />
      );
    }

    return (
      <div key={f.name}>
        {label}
        {control}
        <FieldError id={`${id}-err`} error={err} />
      </div>
    );
  };

  const ctaLabel =
    form.cta ||
    (waitlist
      ? "Join the waitlist"
      : submit.kind === "razorpay" && submit.amount
        ? `Pay ₹${submit.amount} & Get Started →`
        : "Submit");

  return (
    <div
      className="fixed inset-0 z-[100] bg-white overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lpf-title"
    >
      <style>{LEAD_FORM_CSS}</style>
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-6 pb-12 sm:pb-16">
        <button
          type="button"
          onClick={onClose}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Back
        </button>

        <div className="text-center mb-8 sm:mb-10">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: "#f3f4f6", color: ACCENT_2 }}
          >
            {waitlist ? "Registrations closed" : form.badge || "Get Started"}
          </span>
          <h2 id="lpf-title" className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
            {waitlist ? form.waitlistTitle || "Join the waitlist" : form.title || "Register now"}
          </h2>
          <p className="text-gray-500">
            {waitlist
              ? form.waitlistMessage || "Leave your details and we'll reach out when registrations reopen."
              : form.subtitle || "Takes only 2 minutes to register."}
          </p>
        </div>

        {waitlistDone ? (
          <div
            role="status"
            className="rounded-2xl border-2 p-6 text-center"
            style={{ borderColor: ACCENT }}
          >
            <p className="text-lg font-black text-gray-900 mb-1">Thank you! You're on the waitlist.</p>
            <p className="text-sm text-gray-500">We'll contact you as soon as registrations open.</p>
          </div>
        ) : (
          <form className="flex flex-col gap-4 relative" onSubmit={handleSubmit} noValidate>
            <Honeypot value={values.company} onChange={(e) => setField("company", e.target.value)} />

            {specs.map(renderField)}

            {submitError && (
              <p role="alert" className="text-center text-sm font-semibold text-red-500">
                {submitError}
              </p>
            )}

            <button type="submit" className="lpf-btn" disabled={submitting}>
              {submitting ? "Processing..." : ctaLabel}
            </button>
            {!waitlist && submit.kind === "razorpay" && (
              <p className="text-center text-xs text-gray-400">
                You'll be redirected to the payment gateway.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
