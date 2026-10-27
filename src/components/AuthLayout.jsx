import NavBar from "./NavBar";
import Footer from "./Footer";

const DEFAULT_POINTS = [
  "Accredited courses from verified providers",
  "Cohort-based learning with real projects",
  "Verifiable certificates on completion",
];

/**
 * Shared two-column shell for authentication screens.
 * Keeps the marketing header/footer and the brand story panel consistent.
 */
export default function AuthLayout({ title, subtitle, children, asideTitle, points = DEFAULT_POINTS }) {
  return (
    <>
      <NavBar />
      <main id="main-content" className="th-auth">
        <div className="th-auth__panel">
          <div className="th-auth__card">
            <h1 className="th-auth__title">{title}</h1>
            {subtitle && <p className="th-auth__sub">{subtitle}</p>}
            {children}
          </div>
        </div>

        <aside className="th-auth__aside" aria-hidden="true">
          <div>
            <h2>{asideTitle || "Skills that move Tanzania forward."}</h2>
            <ul className="th-auth__points">
              {points.map((point) => (
                <li key={point}>
                  <i className="bi bi-check-circle-fill"></i>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <p className="mb-0">
            Elevating skills. Transforming Tanzania. Join thousands of professionals
            learning with TrainHub TZ.
          </p>
        </aside>
      </main>
      <Footer />
    </>
  );
}
