import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import api from "../api/axio";

const TZ_DATA = {
  Arusha: ["Arusha City", "Arumeru", "Karatu", "Monduli", "Ngorongoro"],
  "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Kigamboni", "Ubungo"],
  Dodoma: ["Dodoma City", "Bahi", "Chamwino", "Kondoa", "Mpwapwa"],
  Mwanza: ["Ilemela", "Nyamagana", "Magu", "Sengerema"],
  Tanga: ["Tanga City", "Handeni", "Korogwe", "Lushoto", "Muheza", "Pangani"],
};

const formatTzPhone = (number) => {
  if (!number) return "";
  let cleaned = number.toString().replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "255" + cleaned.substring(1);
  if (cleaned.startsWith("7") || cleaned.startsWith("6")) return "255" + cleaned;
  return cleaned;
};

export default function TrainingHubCheckout() {
  const { courseId, cohortId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [cohort, setCohort] = useState(null);
  const [requestingOtp, setRequestingOtp] = useState(false);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    organizationName: "",
    position: "",
    street: "",
    city: "",
    region: "",
    country: "Tanzania",
    postalCode: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const cohortRes = await api.get(`/courses/${courseId}/cohorts/${cohortId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cohortData = cohortRes.data.data || cohortRes.data;
        setCohort(cohortData);
        setCourse(cohortData.course || null);

        const userRes = await api.get("/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = userRes.data;
        setUserInfo((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          phone: formatTzPhone(user.phone || ""),
        }));
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, cohortId, navigate]);

  const handleRequestOtp = async () => {
    try {
      setRequestingOtp(true);
      await api.post(
        "/payment/send-otp",
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setShowOtpModal(true);
    } catch (err) {
      toast.error("Error sending the verification code. Please try again.");
    } finally {
      setRequestingOtp(false);
    }
  };

  const handleVerifyAndPay = async () => {
    try {
      setIsVerifying(true);
      const token = localStorage.getItem("token");

      await api.post(
        "/payment/verify-otp",
        { otp: otpValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const paymentData = {
        course_id: courseId,
        cohort_id: cohortId,
        amount: cohort?.price,
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        organization: userInfo.organizationName,
        position: userInfo.position,
        street: userInfo.street,
        region: userInfo.region,
        city: userInfo.city,
        postal: userInfo.postalCode,
      };

      const res = await api.post("/payment/initiate", paymentData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && res.data.redirect_url) {
        navigate("/pesapal-gateway", {
          state: { url: res.data.redirect_url, courseName: course?.title },
        });
      } else {
        toast.error("We could not start the payment: " + (res.data.message || "unknown error"));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid verification code.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavBar />
        <main id="main-content" className="th-container-wide th-section">
          <div className="row g-4" aria-hidden="true">
            <div className="col-lg-7">
              <div className="th-skeleton" style={{ height: 420 }} />
            </div>
            <div className="col-lg-5">
              <div className="th-skeleton" style={{ height: 260 }} />
            </div>
          </div>
          <p className="visually-hidden" role="status">
            Loading checkout…
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const price = cohort?.price?.toLocaleString() ?? "—";

  return (
    <>
      <NavBar />

      <main id="main-content">
        <section className="th-page-hero">
          <div className="th-container-wide">
            <nav aria-label="Breadcrumb">
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <Link to="/trainings">Trainings</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to={`/course/${courseId}`}>{course?.title || "Training"}</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Checkout
                </li>
              </ol>
            </nav>
            <h1 className="mb-2" style={{ fontSize: "clamp(1.5rem, 1.25rem + 1.1vw, 2rem)" }}>
              Checkout
            </h1>
            <p className="th-section-lead">
              Confirm your details and complete payment securely with PesaPal.
            </p>
          </div>
        </section>

        <div className="th-container-wide th-section-tight">
          <div className="row g-4">
            <div className="col-lg-7">
              <form
                className="th-panel"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleRequestOtp();
                }}
              >
                <h2 className="mb-1" style={{ fontSize: "var(--th-fs-lg)" }}>
                  Billing information
                </h2>
                <p className="text-muted mb-4" style={{ fontSize: "var(--th-fs-sm)" }}>
                  This appears on your invoice and receipt.
                </p>

                <div className="mb-3">
                  <label className="form-label" htmlFor="checkout-name">
                    Full name
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    className="form-control"
                    value={userInfo.name}
                    readOnly
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="checkout-email">
                      Email address
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      className="form-control"
                      value={userInfo.email}
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="checkout-phone">
                      Phone (255…)
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      className="form-control"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <h3
                  className="mt-4 mb-3 pb-2"
                  style={{
                    fontSize: "var(--th-fs-base)",
                    borderBottom: "1px solid var(--th-line)",
                  }}
                >
                  Work details <span className="text-muted fw-normal">(optional)</span>
                </h3>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="checkout-org">
                      Organisation
                    </label>
                    <input
                      id="checkout-org"
                      type="text"
                      className="form-control"
                      value={userInfo.organizationName}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, organizationName: e.target.value })
                      }
                      placeholder="e.g. NMB Bank"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="checkout-position">
                      Position
                    </label>
                    <input
                      id="checkout-position"
                      type="text"
                      className="form-control"
                      value={userInfo.position}
                      onChange={(e) => setUserInfo({ ...userInfo, position: e.target.value })}
                      placeholder="e.g. Operations Manager"
                    />
                  </div>
                </div>

                <h3
                  className="mt-2 mb-3 pb-2"
                  style={{
                    fontSize: "var(--th-fs-base)",
                    borderBottom: "1px solid var(--th-line)",
                  }}
                >
                  Billing address
                </h3>

                <div className="mb-3">
                  <label className="form-label" htmlFor="checkout-street">
                    Street address
                  </label>
                  <input
                    id="checkout-street"
                    type="text"
                    className="form-control"
                    value={userInfo.street}
                    onChange={(e) => setUserInfo({ ...userInfo, street: e.target.value })}
                    placeholder="e.g. Mwai Kibaki Road"
                    autoComplete="street-address"
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="checkout-region">
                      Region
                    </label>
                    <select
                      id="checkout-region"
                      className="form-select"
                      value={userInfo.region}
                      onChange={(e) =>
                        setUserInfo({ ...userInfo, region: e.target.value, city: "" })
                      }
                    >
                      <option value="">Select region</option>
                      {Object.keys(TZ_DATA)
                        .sort()
                        .map((reg) => (
                          <option key={reg} value={reg}>
                            {reg}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="checkout-city">
                      City / district
                    </label>
                    <select
                      id="checkout-city"
                      className="form-select"
                      value={userInfo.city}
                      disabled={!userInfo.region}
                      onChange={(e) => setUserInfo({ ...userInfo, city: e.target.value })}
                    >
                      <option value="">Select city</option>
                      {userInfo.region &&
                        TZ_DATA[userInfo.region].map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="checkout-country">
                      Country
                    </label>
                    <input
                      id="checkout-country"
                      className="form-control"
                      value="Tanzania"
                      readOnly
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label" htmlFor="checkout-postal">
                      Postal code
                    </label>
                    <input
                      id="checkout-postal"
                      type="text"
                      className="form-control"
                      value={userInfo.postalCode}
                      onChange={(e) => setUserInfo({ ...userInfo, postalCode: e.target.value })}
                      placeholder="e.g. 11101"
                      autoComplete="postal-code"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary w-100 btn-lg ${requestingOtp ? "is-loading" : ""}`}
                  disabled={requestingOtp}
                >
                  {requestingOtp ? "Sending code…" : "Pay now"}
                </button>
                <p
                  className="text-muted text-center mt-3 mb-0"
                  style={{ fontSize: "var(--th-fs-xs)" }}
                >
                  <i className="bi bi-shield-lock me-1" aria-hidden="true"></i>
                  We&apos;ll email a 6-digit code to confirm this purchase.
                </p>
              </form>
            </div>

            <div className="col-lg-5">
              <aside className="th-enroll-panel" aria-labelledby="summary-title">
                <h2
                  className="mb-3 pb-2"
                  id="summary-title"
                  style={{
                    fontSize: "var(--th-fs-base)",
                    borderBottom: "1px solid var(--th-line)",
                  }}
                >
                  Order summary
                </h2>

                <div className="mb-4">
                  <h3 className="mb-1" style={{ fontSize: "var(--th-fs-base)", fontWeight: 700 }}>
                    {course?.title || "Course"}
                  </h3>
                  <p className="text-muted mb-0" style={{ fontSize: "var(--th-fs-sm)" }}>
                    Cohort: {cohort?.intake_name || "—"}
                  </p>
                </div>

                <ul className="th-enroll-panel__list">
                  <li>
                    <span>Price</span>
                    <strong>{price} TZS</strong>
                  </li>
                  <li>
                    <span>Tax (0%)</span>
                    <strong>0 TZS</strong>
                  </li>
                </ul>

                <hr className="th-divider my-3" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span style={{ fontWeight: 700, color: "var(--th-ink)" }}>Total</span>
                  <span
                    style={{
                      fontFamily: "var(--th-font-display)",
                      fontSize: "var(--th-fs-xl)",
                      fontWeight: 700,
                      color: "var(--th-navy-900)",
                    }}
                  >
                    {price} TZS
                  </span>
                </div>

                <p className="text-muted mb-0" style={{ fontSize: "var(--th-fs-xs)" }}>
                  Payments are processed by PesaPal. You will receive an invoice and receipt by
                  email once payment completes.
                </p>
              </aside>
            </div>
          </div>
        </div>
      </main>

      {showOtpModal && (
        <div
          className="modal show d-block"
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-modal-title"
          style={{ background: "rgba(7, 27, 51, 0.6)", zIndex: 2000 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title" id="otp-modal-title">
                  Verify your payment
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close verification"
                  onClick={() => setShowOtpModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center">
                <p className="text-muted mb-4" style={{ fontSize: "var(--th-fs-sm)" }}>
                  We&apos;ve sent a 6-digit verification code to your email. Enter it below to
                  confirm your purchase.
                </p>
                <label className="form-label" htmlFor="checkout-otp">
                  Verification code
                </label>
                <input
                  id="checkout-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  className="form-control form-control-lg text-center fw-bold"
                  style={{ letterSpacing: "0.5em", fontSize: "var(--th-fs-xl)" }}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  autoComplete="one-time-code"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-dark"
                  onClick={() => setShowOtpModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`btn btn-primary ${isVerifying ? "is-loading" : ""}`}
                  onClick={handleVerifyAndPay}
                  disabled={otpValue.length < 6 || isVerifying}
                >
                  {isVerifying ? "Verifying…" : "Confirm & proceed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
