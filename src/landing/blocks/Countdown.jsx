import { useEffect, useState } from "react";
import { Reveal } from "../ui";
import { hasText, resolveSection } from "./shared";

const DEFAULT_LABELS = ["Days", "Hours", "Mins", "Secs"];
const pad = (number) => String(number).padStart(2, "0");

function remainingParts(milliseconds) {
  return [
    Math.floor(milliseconds / 86_400_000),
    Math.floor(milliseconds / 3_600_000) % 24,
    Math.floor(milliseconds / 60_000) % 60,
    Math.floor(milliseconds / 1_000) % 60,
  ];
}

/**
 * Live countdown which unmounts itself when its target date passes.
 * @param {object} props
 * @param {object} [props.section] Alternative to spreading the section as props.
 * @param {string} [props.id] Navigation anchor.
 * @param {string|Date|number} [props.date] ISO date, Date, or timestamp.
 * @param {string|Date|number} [props.target] Alias for `date`.
 * @param {string} [props.label] Copy shown before the timer.
 * @param {string[]} [props.labels] Labels for days, hours, minutes, seconds.
 * @param {() => void} [props.onRegister] Accepted for the common block interface.
 */
export function CountdownBlock({ section, ...props }) {
  const config = resolveSection(section, props);
  const targetValue = config.date ?? config.target ?? config.targetDate;
  const targetTime = targetValue instanceof Date ? targetValue.getTime() : new Date(targetValue).getTime();
  const [remaining, setRemaining] = useState(() =>
    Number.isFinite(targetTime) ? Math.max(0, targetTime - Date.now()) : 0,
  );

  useEffect(() => {
    if (!Number.isFinite(targetTime)) return undefined;
    const update = () => setRemaining(Math.max(0, targetTime - Date.now()));
    update();
    if (targetTime <= Date.now()) return undefined;
    const timer = window.setInterval(() => {
      const next = Math.max(0, targetTime - Date.now());
      setRemaining(next);
      if (next === 0) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [targetTime]);

  if (!Number.isFinite(targetTime) || remaining <= 0) return null;
  const values = remainingParts(remaining);
  const labels = Array.isArray(config.labels) ? config.labels : DEFAULT_LABELS;

  return (
    <section id={config.id} className="px-4 py-8 sm:px-6">
      <Reveal className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-4 sm:flex-row">
        {hasText(config.label) && <p className="text-lg font-semibold text-slate-600">{config.label}</p>}
        <div className="flex gap-2" role="timer" aria-live="off">
          {values.map((value, index) => (
            <div
              key={labels[index] ?? index}
              className="w-[4.5rem] rounded-2xl border bg-white py-2 text-center shadow-sm sm:w-20"
              style={{ borderColor: "color-mix(in srgb,var(--lp-accent) 24%,white)" }}
            >
              <div className="text-2xl font-black tabular-nums text-slate-900 sm:text-3xl">{pad(value)}</div>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--lp-accent)" }}>
                {labels[index] ?? DEFAULT_LABELS[index]}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export default CountdownBlock;
