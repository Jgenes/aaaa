import { Link, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { getRole, isAuthenticated, roleHome } from "../lib/session";

export default function NotFound() {
  const location = useLocation();
  const signedIn = isAuthenticated();
  const home = signedIn ? roleHome(getRole()) : "/";

  return (
    <>
      <NavBar />

      <main tabIndex={-1} id="main-content" className="th-container-wide th-section">
        <div className="th-auth__card mx-auto text-center" style={{ maxWidth: 620 }}>
          <p className="th-eyebrow">Error 404</p>
          <h1 className="mb-2" style={{ fontSize: "var(--th-fs-2xl)" }}>
            We can&apos;t find that page
          </h1>
          <p className="text-muted mb-4">
            <code>{location.pathname}</code> doesn&apos;t exist, may have moved, or you may not
            have access to it. Everything else is still where you left it.
          </p>

          <div className="d-flex gap-2 justify-content-center flex-wrap">
            <Link to={home} className="btn btn-primary">
              {signedIn ? "Back to my workspace" : "Back to home"}
            </Link>
            <Link to="/trainings" className="btn btn-outline-dark">
              Browse trainings
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
