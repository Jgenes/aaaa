import NavBar from "./NavBar";
import Footer from "./Footer";

const DEFAULT_POINTS = [
  "Accredited courses from verified providers",
  "Cohort-based learning with real projects",
  "Verifiable certificates on completion",
];

/**
 * Shared shell for every authentication screen.
 *
 * The form column carries one bordered card with a single field rhythm; the
 * ink column carries the brand story. Both pages, the OTP step and the
 * provider sign-up render through this component so the structures cannot
 * drift apart again.
 *
 * `points` accepts plain strings (legacy callers) or `{ title, text }` objects.
 */
export default function AuthLayout({
  eyebrow,
  title,
  subtitle,
  asideTitle,
  asideLead,
  points = DEFAULT_POINTS,
  children,
}) {
  return (
    <>
      <NavBar />

      <main id="main-content" className="th-auth">
        <div className="th-auth__panel">
          <div className="th-auth__card">
            <header className="th-auth__card-head">
              {eyebrow && <p className="th-eyebrow th-auth__eyebrow">{eyebrow}</p>}
              <h1 className="th-auth__title" id="auth-title">
                {title}
              </h1>
              {subtitle && <p className="th-auth__sub">{subtitle}</p>}
            </header>

            {children}
          </div>
        </div>

        <aside className="th-auth__aside" aria-labelledby="auth-aside-title">
          <div className="th-auth__aside-body">
            <p className="th-auth__aside-eyebrow">TrainHub TZ</p>

            <h2 className="th-auth__aside-title" id="auth-aside-title">
              {asideTitle || "Skills that move Tanzania forward."}
            </h2>

            {asideLead && <p className="th-auth__aside-lead">{asideLead}</p>}

            <ul className="th-auth__points">
              {points.map((point, index) => {
                const item =
                  typeof point === "string" ? { text: point } : point || {};

                return (
                  <li key={item.title || item.text || index}>
                    <span className="th-auth__point-index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="th-auth__point-body">
                      {item.title && (
                        <span className="th-auth__point-title">{item.title}</span>
                      )}
                      {item.text && (
                        <span className="th-auth__point-text">{item.text}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <p className="th-auth__aside-note mb-0">
            Elevating skills. Transforming Tanzania.
          </p>
        </aside>
      </main>

      <Footer />
    </>
  );
}
