import { useState } from "react";
import { toast } from "react-toastify";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const CONTACT_EMAIL = "info@traininghub.co.tz";

const INFO = [
  { icon: "bi-envelope-at", label: "Email support", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: "bi-telephone", label: "Direct call", value: "+255 712 345 678", href: "tel:+255712345678" },
  { icon: "bi-geo-alt", label: "Office location", value: "Upanga, Dar es Salaam" },
];

const SOCIALS = [
  { icon: "bi-linkedin", label: "LinkedIn" },
  { icon: "bi-twitter-x", label: "X (Twitter)" },
  { icon: "bi-instagram", label: "Instagram" },
];

export default function About() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Enter your full name.";
    if (!form.email.trim()) next.email = "Enter your email address.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address.";
    if (!form.subject.trim()) next.subject = "Add a short subject.";
    if (!form.message.trim()) next.message = "Let us know how we can help.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Please check the highlighted fields.");
      return;
    }

    const body = `Name: ${form.name}%0D%0AEmail: ${form.email}%0D%0A%0D%0A${encodeURIComponent(
      form.message
    )}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      form.subject
    )}&body=${body}`;
    toast.success("Opening your email app to send the message.");
  };

  return (
    <>
      <NavBar />

      <main id="main-content">
        <section className="th-page-hero">
          <div className="th-container-wide">
            <nav aria-label="Breadcrumb">
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Contact
                </li>
              </ol>
            </nav>
            <h1 className="mb-2" style={{ fontSize: "clamp(1.7rem, 1.35rem + 1.5vw, 2.25rem)" }}>
              Get in touch
            </h1>
            <p className="th-section-lead">
              Have a question or want to partner? Our team is here to help you navigate your
              learning or provider journey.
            </p>
          </div>
        </section>

        <div className="th-container-wide th-section-tight">
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="th-panel">
                <h2 className="mb-1">
                  Send a message
                </h2>
                <p className="text-muted mb-4">
                  Fill in the form and we will get back to you within one business day.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="contact-name">
                        Full name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        autoComplete="name"
                        className={`form-control ${errors.name ? "is-invalid" : ""}`}
                        placeholder="e.g. Adamu Omari"
                        value={form.name}
                        onChange={update("name")}
                        aria-invalid={Boolean(errors.name)}
                      />
                      {errors.name && <p className="invalid-feedback d-block">{errors.name}</p>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="contact-email">
                        Email address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        autoComplete="email"
                        className={`form-control ${errors.email ? "is-invalid" : ""}`}
                        placeholder="name@example.com"
                        value={form.email}
                        onChange={update("email")}
                        aria-invalid={Boolean(errors.email)}
                      />
                      {errors.email && <p className="invalid-feedback d-block">{errors.email}</p>}
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="contact-subject">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        className={`form-control ${errors.subject ? "is-invalid" : ""}`}
                        placeholder="How can we help you?"
                        value={form.subject}
                        onChange={update("subject")}
                        aria-invalid={Boolean(errors.subject)}
                      />
                      {errors.subject && (
                        <p className="invalid-feedback d-block">{errors.subject}</p>
                      )}
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="contact-message">
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        rows="5"
                        className={`form-control ${errors.message ? "is-invalid" : ""}`}
                        placeholder="Tell us a bit more…"
                        value={form.message}
                        onChange={update("message")}
                        aria-invalid={Boolean(errors.message)}
                      ></textarea>
                      {errors.message && (
                        <p className="invalid-feedback d-block">{errors.message}</p>
                      )}
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        Send message
                        <i className="bi bi-send" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className="col-lg-5">
              <div
                className="th-panel h-100"
                style={{
                  background: "linear-gradient(160deg, var(--th-navy-900) 0%, #124a8f 100%)",
                  border: "none",
                  color: "#fff",
                }}
              >
                <h2 className="mb-4" style={{ fontSize: "var(--th-fs-lg)", color: "#fff" }}>
                  Contact information
                </h2>

                <ul className="list-unstyled d-flex flex-column gap-3 mb-4">
                  {INFO.map((item) => (
                    <li key={item.label} className="d-flex align-items-start gap-3">
                      <span
                        style={{
                          width: 38,
                          height: 38,
                          background: "rgba(255,255,255,0.12)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        <i className={`bi ${item.icon}`}></i>
                      </span>
                      <span>
                        <span
                          className="d-block"
                          style={{ fontSize: "var(--th-fs-xs)", color: "rgba(255,255,255,0.65)" }}
                        >
                          {item.label}
                        </span>
                        {item.href ? (
                          <a
                            href={item.href}
                            style={{ color: "#fff", fontWeight: 600, fontSize: "var(--th-fs-sm)" }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <span style={{ fontWeight: 600, fontSize: "var(--th-fs-sm)" }}>
                            {item.value}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="d-flex gap-2">
                  {SOCIALS.map((social) => (
                    <a
                      key={social.icon}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      aria-label={social.label}
                      style={{
                        width: 36,
                        height: 36,
                        border: "1px solid rgba(255,255,255,0.24)",
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className={`bi ${social.icon}`} aria-hidden="true"></i>
                    </a>
                  ))}
                </div>

                <hr style={{ borderColor: "rgba(255,255,255,0.16)", marginBlock: "1.5rem" }} />

                <p className="mb-0" style={{ fontSize: "var(--th-fs-sm)", color: "rgba(255,255,255,0.75)" }}>
                  Office hours: Monday – Friday, 08:00 – 17:00 EAT.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
