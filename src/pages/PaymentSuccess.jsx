import { Link, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

/**
 * Landing page for the PesaPal return URL.
 *
 * The API redirects to `{FRONTEND_URL}/payment-success?status=…&reference=…`
 * (PaymentController::callback), so this route has to exist or the learner
 * lands on the 404 page straight after paying.
 */
const COPY = {
  COMPLETED: {
    tone: "success",
    icon: "bi-patch-check",
    title: "Payment received",
    text: "Your enrolment is confirmed. Your invoice and receipt are on the way to your inbox and the training is now available in your learning workspace.",
  },
  PENDING: {
    tone: "info",
    icon: "bi-hourglass-split",
    title: "Payment is being confirmed",
    text: "The gateway has not confirmed this payment yet. This usually takes a minute — check your transactions shortly, and your training will unlock as soon as it clears.",
  },
  FAILED: {
    tone: "danger",
    icon: "bi-exclamation-octagon",
    title: "Payment did not go through",
    text: "The gateway reported a failed transaction. No money should have left your account. You can start the enrolment again whenever you are ready.",
  },
  INVALID: {
    tone: "danger",
    icon: "bi-exclamation-octagon",
    title: "Payment was not valid",
    text: "The gateway rejected this transaction. Please try again, and contact support if it keeps happening.",
  },
};

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const status = String(params.get("status") || "PENDING").toUpperCase();
  const reference = params.get("reference") || "";
  const copy = COPY[status] || COPY.PENDING;
  const paid = status === "COMPLETED";

  return (
    <>
      <NavBar />

      <main tabIndex={-1} id="main-content" className="th-container-wide th-section">
        <div className="th-empty">
          <span className={`th-empty__icon text-${copy.tone}`}>
            <i className={`bi ${copy.icon}`} aria-hidden="true"></i>
          </span>
          <h1 className="th-empty__title">{copy.title}</h1>
          <p className="th-empty__text">{copy.text}</p>

          {reference && (
            <p className="text-muted small">
              Reference: <strong>{reference}</strong>
            </p>
          )}

          <div className="d-flex gap-2 justify-content-center flex-wrap">
            {paid ? (
              <Link to="/learning" className="btn btn-primary">
                Go to my learning
              </Link>
            ) : (
              <Link to="/trainings" className="btn btn-primary">
                Browse trainings
              </Link>
            )}
            <Link to="/transactions" className="btn btn-outline-dark">
              View transactions
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
