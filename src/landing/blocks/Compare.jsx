import { Reveal } from "../ui";

const valueOf = (row, keys) => {
  for (const key of keys) {
    if (row?.[key] !== undefined && row[key] !== null) return row[key];
  }
  return "";
};

/**
 * Responsive "others vs us" comparison block.
 * @param {{ section?: { id?: string, eyebrow?: string, title?: string, sub?: string, headings?: string[] | { feature?: string, others?: string, us?: string }, columns?: { feature?: string, others?: string, us?: string }, rows?: Array<{ label?: string, feature?: string, other?: React.ReactNode, others?: React.ReactNode, us?: React.ReactNode, rti?: React.ReactNode }> }, id?: string, eyebrow?: string, title?: string, sub?: string, headings?: string[] | { feature?: string, others?: string, us?: string }, columns?: { feature?: string, others?: string, us?: string }, rows?: Array<object>, onRegister?: () => void }} props
 */
export function Compare({ section, id, ...props }) {
  const config = section ?? { id, ...props };
  const rows = Array.isArray(config.rows) ? config.rows : [];
  const headingConfig = config.headings ?? config.columns ?? {};
  const headings = Array.isArray(headingConfig)
    ? headingConfig
    : [headingConfig.feature, headingConfig.others ?? headingConfig.other, headingConfig.us];
  const [featureHeading = "Feature", othersHeading = "Others", usHeading = "Us"] = headings;
  if (!config.eyebrow && !config.title && !config.sub && rows.length === 0) return null;

  return (
    <section id={config.id ?? id} className="bg-slate-50 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        {(config.eyebrow || config.title || config.sub) && (
          <Reveal className="mb-8 text-center md:mb-12">
            {config.eyebrow && (
              <p
                className="mb-3 text-xs font-black uppercase tracking-[0.22em]"
                style={{ color: "var(--lp-accent)" }}
              >
                {config.eyebrow}
              </p>
            )}
            {config.title && (
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl md:text-5xl">
                {config.title}
              </h2>
            )}
            {config.sub && <p className="mt-3 text-base text-slate-500 md:text-lg">{config.sub}</p>}
          </Reveal>
        )}

        {rows.length > 0 && (
          <Reveal>
            <div className="flex flex-col gap-3 md:hidden">
              <div className="grid grid-cols-[minmax(0,1fr)_72px_100px] overflow-hidden rounded-2xl">
                <div className="bg-slate-200 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600">
                  {featureHeading}
                </div>
                <div className="bg-slate-200 px-2 py-2.5 text-center text-xs font-black uppercase tracking-wider text-slate-600">
                  {othersHeading}
                </div>
                <div
                  className="px-2 py-2.5 text-center text-xs font-black uppercase tracking-wider text-white"
                  style={{ background: "var(--lp-accent)" }}
                >
                  {usHeading}
                </div>
              </div>
              {rows.map((row, index) => {
                const feature = valueOf(row, ["label", "feature", "title"]);
                const others = valueOf(row, ["others", "other"]);
                const us = valueOf(row, ["us", "rti", "ours"]);
                return (
                  <div
                    key={`${String(feature)}-${index}`}
                    className="grid grid-cols-[minmax(0,1fr)_72px_100px] items-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
                  >
                    <div className="px-3 py-4 text-xs font-semibold leading-snug text-slate-700">{feature}</div>
                    <div className="border-l border-slate-100 px-2 py-4 text-center text-sm text-rose-400">{others}</div>
                    <div
                      className="overflow-hidden break-words border-l border-slate-100 px-2 py-4 text-center text-xs font-black leading-tight"
                      style={{ color: "var(--lp-accent)", background: "color-mix(in srgb, var(--lp-accent) 6%, white)" }}
                    >
                      {us}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 shadow-xl md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border-b border-slate-200 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      {featureHeading}
                    </th>
                    <th className="border-b border-slate-200 px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                      {othersHeading}
                    </th>
                    <th
                      className="border-b px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white"
                      style={{ background: "var(--lp-accent)" }}
                    >
                      {usHeading}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {rows.map((row, index) => {
                    const feature = valueOf(row, ["label", "feature", "title"]);
                    return (
                      <tr key={`${String(feature)}-${index}`} className="border-b border-slate-50 transition-colors last:border-0 hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-semibold text-slate-700">{feature}</td>
                        <td className="px-6 py-4 text-center text-lg text-rose-400">{valueOf(row, ["others", "other"])}</td>
                        <td
                          className="px-6 py-4 text-center text-lg font-black"
                          style={{ color: "var(--lp-accent)", background: "color-mix(in srgb, var(--lp-accent) 4%, white)" }}
                        >
                          {valueOf(row, ["us", "rti", "ours"])}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default Compare;
