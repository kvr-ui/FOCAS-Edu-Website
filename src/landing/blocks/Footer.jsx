import { Reveal } from "../ui";

const DEFAULT_LINKS = [
  { label: "Testimonials", target: "testimonials" },
  { label: "How It Works", target: "how" },
  { label: "Why Different", target: "compare" },
  { label: "FAQs", target: "faq" },
];

const DEFAULT_CONTACTS = [
  { icon: "📞", label: "+91 63835 14285", href: "tel:+916383514285" },
  { icon: "🌐", label: "www.focasedu.com", href: "https://www.focasedu.com" },
];

const DEFAULT_LEGAL = [
  { label: "Privacy Policy", href: "/pdf/Privacy%20Policy%20of%20Focas%20Edu.docx.pdf" },
  { label: "Terms", href: "/pdf/Terms%20and%20Condition%20of%20Focas%20Edu.docx.pdf" },
];

function contactList(contact) {
  if (Array.isArray(contact)) return contact;
  if (!contact || typeof contact !== "object") return DEFAULT_CONTACTS;

  const entries = [];
  if (contact.phone) entries.push({ icon: "📞", label: contact.phone, href: contact.phoneHref ?? `tel:${String(contact.phone).replace(/[^+\d]/g, "")}` });
  if (contact.email) entries.push({ icon: "✉", label: contact.email, href: `mailto:${contact.email}` });
  if (contact.website) entries.push({ icon: "🌐", label: contact.websiteLabel ?? contact.website, href: contact.website });
  return entries;
}

/**
 * Site footer with configurable brand, links, contact details and copyright.
 * @param {{ section?: { id?: string, logo?: string, logoAlt?: string, brand?: string, product?: string, tagline?: string, linksHeading?: string, links?: Array<{ label?: string, target?: string, id?: string, href?: string }>, contactHeading?: string, contact?: object | Array<{ icon?: string, label?: string, href?: string }>, contacts?: Array<object>, copyright?: string, legalLinks?: Array<{ label?: string, href?: string }> }, id?: string, logo?: string, logoAlt?: string, brand?: string, product?: string, tagline?: string, links?: Array<object>, contact?: object | Array<object>, contacts?: Array<object>, copyright?: string, legalLinks?: Array<object>, onRegister?: () => void }} props
 */
export function Footer({ section, id, ...props }) {
  const config = section ?? { id, ...props };
  const links = config.links === undefined ? DEFAULT_LINKS : Array.isArray(config.links) ? config.links : [];
  const contacts = config.contacts !== undefined
    ? Array.isArray(config.contacts) ? config.contacts : []
    : contactList(config.contact);
  const legalLinks = config.legalLinks === undefined ? DEFAULT_LEGAL : Array.isArray(config.legalLinks) ? config.legalLinks : [];
  const copyright = config.copyright ?? `© ${new Date().getFullYear()} FOCAS Edu. All rights reserved.`;
  const logo = config.logo ?? "/fs-assets/logo-white.webp";

  const goToTarget = (event, target) => {
    if (!target) return;
    event.preventDefault();
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id={config.id ?? id} className="px-6 py-16 text-slate-400" style={{ background: "#0f172a" }}>
      <Reveal className="mx-auto max-w-5xl">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-12 md:grid-cols-3">
          <div>
            {logo && <img src={logo} alt={config.logoAlt ?? "FOCAS Edu"} loading="lazy" className="mb-2 h-8 w-auto" />}
            {config.brand && <p className="mt-2 text-xs text-slate-400">{config.brand}</p>}
            {config.product && <p className="text-base font-black text-white sm:text-lg">{config.product}</p>}
            {config.tagline && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-400">{config.tagline}</p>}
          </div>

          {links.length > 0 && (
            <div>
              <div className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">{config.linksHeading ?? "Quick Links"}</div>
              <ul className="flex flex-col gap-3">
                {links.map((link, index) => {
                  const target = link?.target ?? link?.id;
                  const href = link?.href ?? (target ? `#${target}` : undefined);
                  if (!link?.label || !href) return null;
                  return (
                    <li key={`${link.label}-${index}`}>
                      <a
                        href={href}
                        onClick={(event) => goToTarget(event, target)}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="text-sm text-slate-300 transition-colors hover:text-white"
                      >
                        <span className="mr-2" style={{ color: "var(--lp-accent)" }}>›</span>
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {contacts.length > 0 && (
            <div>
              <div className="mb-5 text-xs font-bold uppercase tracking-widest text-slate-400">{config.contactHeading ?? "Contact Us"}</div>
              <ul className="flex flex-col gap-4 text-sm text-slate-400">
                {contacts.map((contact, index) => {
                  if (!contact?.label) return null;
                  const content = (
                    <>
                      {contact.icon && <span aria-hidden="true">{contact.icon}</span>}
                      <span>{contact.label}</span>
                    </>
                  );
                  return (
                    <li key={`${contact.label}-${index}`} className="flex gap-3">
                      {contact.href ? (
                        <a
                          href={contact.href}
                          target={absoluteExternal(contact.href) ? "_blank" : undefined}
                          rel={absoluteExternal(contact.href) ? "noopener noreferrer" : undefined}
                          className="flex gap-3 transition-colors hover:text-white"
                        >
                          {content}
                        </a>
                      ) : content}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 md:flex-row">
          <span className="text-xs text-slate-500">{copyright}</span>
          {legalLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5">
              {legalLinks.map((link, index) => link?.label && link?.href ? (
                <a
                  key={`${link.label}-${index}`}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-500 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ) : null)}
            </div>
          )}
        </div>
      </Reveal>
    </footer>
  );
}

function absoluteExternal(href) {
  return /^https?:\/\//i.test(href);
}

export default Footer;
