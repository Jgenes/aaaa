import NavBar from "./NavBar";
import Footer from "./Footer";

/**
 * Shared shell for every authentication screen.
 *
 * One centred card on a paper canvas: the form is the only thing on screen, so
 * there is nothing competing with it for attention. Login, Register, the OTP
 * step and the provider sign-up all render through here.
 */
export default function AuthLayout({ eyebrow, title, subtitle, children, wide = false }) {
  return (
    <>
      <NavBar />

      <main id="main-content" className="th-auth">
        <div className={`th-auth__card${wide ? " th-auth__card--wide" : ""}`}>
          <header className="th-auth__card-head">
            {eyebrow && <p className="th-eyebrow th-auth__eyebrow">{eyebrow}</p>}
            <h1 className="th-auth__title" id="auth-title">
              {title}
            </h1>
            {subtitle && <p className="th-auth__sub">{subtitle}</p>}
          </header>

          {children}
        </div>
      </main>

      <Footer />
    </>
  );
}
