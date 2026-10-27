import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/axio";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const steps = [
  { title: "Identity", icon: "bi-building" },
  { title: "Location", icon: "bi-geo-alt" },
  { title: "Contact", icon: "bi-person-badge" },
  { title: "Submit", icon: "bi-check-circle" },
];

const providerTypes = [
  "Company",
  "University",
  "College",
  "Training Center",
  "NGO",
  "Government",
  "Individual Trainer",
];
const regions = [
  "Dar es Salaam",
  "Arusha",
  "Dodoma",
  "Mwanza",
  "Mbeya",
  "Morogoro",
  "Tanga",
  "Kilimanjaro",
];

const reviewSections = (form, files) => [
  {
    title: "Organization identity",
    icon: "bi-building",
    rows: [
      ["Legal name", form.legal_name],
      ["Brand name", form.brand_name || "N/A"],
      ["Provider type", form.provider_type],
      ["Registration ref", form.registration_ref || "N/A"],
      ["TIN number", form.tin || "N/A"],
      ["Website", form.website || "N/A"],
      ["BRELA document", files.brela_doc?.name],
      ["TIN document", files.tin_doc?.name],
    ],
  },
  {
    title: "Location details",
    icon: "bi-geo-alt",
    rows: [
      ["Country", form.country],
      ["Region", form.region],
      ["District", form.district || "N/A"],
      ["Physical address", form.physical_address || "N/A"],
      ...(form.google_maps_link ? [["Maps link", form.google_maps_link]] : []),
    ],
  },
  {
    title: "Contact information",
    icon: "bi-person-badge",
    rows: [
      ["Contact name", form.contact_name],
      ["Role", form.contact_role || "N/A"],
      ["Phone", form.contact_phone],
      ["Email", form.contact_email || "N/A"],
    ],
  },
];

function ProviderOnboardingFull() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    legal_name: "",
    brand_name: "",
    provider_type: "",
    registration_ref: "",
    tin: "",
    website: "",
    country: "Tanzania",
    region: "",
    district: "",
    physical_address: "",
    google_maps_link: "",
    contact_name: "",
    contact_role: "",
    contact_phone: "",
    contact_email: "",
  });

  // State for files
  const [files, setFiles] = useState({
    brela_doc: null,
    tin_doc: null,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const next = () => {
    if (step === 0) {
      if (!form.legal_name || !form.provider_type)
        return toast.error("Legal Name and Provider Type are required");
      if (!files.brela_doc || !files.tin_doc)
        return toast.error("Please upload both BRELA and TIN documents");
    }
    if (step === 1 && !form.region) return toast.error("Region is required");
    if (step === 2 && (!form.contact_name || !form.contact_phone))
      return toast.error("Primary contact details are required");

    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const back = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);

    // Prepare Multi-part Form Data for files
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (files.brela_doc) formData.append("brela_doc", files.brela_doc);
    if (files.tin_doc) formData.append("tin_doc", files.tin_doc);

    try {
      await api.post("/provider/onboarding", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Application submitted successfully!");
      navigate("/provider/verification");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <main className="th-onboarding">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <ToastContainer position="top-center" />

              <header className="th-onboarding__head">
                <p className="th-eyebrow">Partner with us</p>
                <h1>Provider application</h1>
                <p className="th-onboarding__lead">
                  Tell us about your organisation so we can verify it and publish
                  your trainings on TrainingHub TZ.
                </p>
              </header>

              <div className="th-panel th-onboarding__card">
                <ol className="th-steps" aria-label="Application progress">
                  {steps.map((s, i) => {
                    const state =
                      step === i ? "is-active" : step > i ? "is-done" : "";
                    return (
                      <li
                        key={s.title}
                        className={`th-steps__item ${state}`}
                        aria-current={step === i ? "step" : undefined}
                      >
                        <span className="th-steps__marker" aria-hidden="true">
                          {step > i ? (
                            <i className="bi bi-check-lg"></i>
                          ) : (
                            <i className={`bi ${s.icon}`}></i>
                          )}
                        </span>
                        <span className="th-steps__label">{s.title}</span>
                        <span className="visually-hidden">
                          {step > i
                            ? "(completed)"
                            : step === i
                            ? "(current step)"
                            : "(not started)"}
                        </span>
                      </li>
                    );
                  })}
                  <span className="th-steps__track" aria-hidden="true">
                    <span
                      className="th-steps__progress"
                      style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                    ></span>
                  </span>
                </ol>

                {/* Step 0: Identity & Files */}
                {step === 0 && (
                  <section aria-labelledby="step-identity">
                    <h2 id="step-identity" className="th-onboarding__title">
                      Organization identity
                    </h2>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label" htmlFor="legal_name">
                          Legal name <span className="th-required">*</span>
                        </label>
                        <input
                          id="legal_name"
                          className="form-control"
                          name="legal_name"
                          autoComplete="organization"
                          placeholder="As registered with BRELA"
                          value={form.legal_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="provider_type">
                          Provider type <span className="th-required">*</span>
                        </label>
                        <select
                          id="provider_type"
                          className="form-select"
                          name="provider_type"
                          value={form.provider_type}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select category</option>
                          {providerTypes.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="registration_ref">
                          Registration ref (BRELA)
                        </label>
                        <input
                          id="registration_ref"
                          className="form-control"
                          name="registration_ref"
                          value={form.registration_ref}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Document Uploads */}
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="brela_doc">
                          BRELA certificate <span className="th-required">*</span>
                        </label>
                        <input
                          id="brela_doc"
                          type="file"
                          className="form-control"
                          name="brela_doc"
                          accept=".pdf,.jpg,.png"
                          aria-describedby="brela_doc_hint"
                          onChange={handleFileChange}
                          required
                        />
                        <p id="brela_doc_hint" className="form-text">
                          {files.brela_doc
                            ? `Selected: ${files.brela_doc.name}`
                            : "PDF, JPG or PNG."}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="tin_doc">
                          TIN certificate <span className="th-required">*</span>
                        </label>
                        <input
                          id="tin_doc"
                          type="file"
                          className="form-control"
                          name="tin_doc"
                          accept=".pdf,.jpg,.png"
                          aria-describedby="tin_doc_hint"
                          onChange={handleFileChange}
                          required
                        />
                        <p id="tin_doc_hint" className="form-text">
                          {files.tin_doc
                            ? `Selected: ${files.tin_doc.name}`
                            : "PDF, JPG or PNG."}
                        </p>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label" htmlFor="tin">
                          TIN number
                        </label>
                        <input
                          id="tin"
                          className="form-control"
                          name="tin"
                          value={form.tin}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="website">
                          Website
                        </label>
                        <input
                          id="website"
                          type="url"
                          className="form-control"
                          name="website"
                          placeholder="https://"
                          value={form.website}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Step 1: Location */}
                {step === 1 && (
                  <section aria-labelledby="step-location">
                    <h2 id="step-location" className="th-onboarding__title">
                      Address &amp; location
                    </h2>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="region">
                          Region <span className="th-required">*</span>
                        </label>
                        <select
                          id="region"
                          className="form-select"
                          name="region"
                          value={form.region}
                          onChange={handleChange}
                          required
                        >
                          <option value="">Select region</option>
                          {regions.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="district">
                          District / city
                        </label>
                        <input
                          id="district"
                          className="form-control"
                          name="district"
                          value={form.district}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label" htmlFor="physical_address">
                          Physical address
                        </label>
                        <textarea
                          id="physical_address"
                          className="form-control"
                          name="physical_address"
                          rows="2"
                          value={form.physical_address}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>
                  </section>
                )}

                {/* Step 2: Contact */}
                {step === 2 && (
                  <section aria-labelledby="step-contact">
                    <h2 id="step-contact" className="th-onboarding__title">
                      Primary contact person
                    </h2>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="contact_name">
                          Full name <span className="th-required">*</span>
                        </label>
                        <input
                          id="contact_name"
                          className="form-control"
                          name="contact_name"
                          autoComplete="name"
                          value={form.contact_name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="contact_phone">
                          Phone number <span className="th-required">*</span>
                        </label>
                        <input
                          id="contact_phone"
                          type="tel"
                          className="form-control"
                          name="contact_phone"
                          autoComplete="tel"
                          value={form.contact_phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="contact_role">
                          Contact role
                        </label>
                        <input
                          id="contact_role"
                          className="form-control"
                          name="contact_role"
                          placeholder="e.g. Director, Manager"
                          value={form.contact_role}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" htmlFor="contact_email">
                          Contact email
                        </label>
                        <input
                          id="contact_email"
                          type="email"
                          className="form-control"
                          name="contact_email"
                          autoComplete="email"
                          placeholder="email@example.com"
                          value={form.contact_email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <section aria-labelledby="step-review">
                    <h2 id="step-review" className="th-onboarding__title">
                      Final review
                    </h2>
                    <p className="th-onboarding__lead mb-4">
                      Check the details below. Use Back to correct anything before
                      submitting.
                    </p>
                    {reviewSections(form, files).map((section) => (
                      <div key={section.title} className="th-review">
                        <h3 className="th-review__title">
                          <i className={`bi ${section.icon}`} aria-hidden="true"></i>
                          {section.title}
                        </h3>
                        <dl className="th-review__list">
                          {section.rows.map(([label, value]) => (
                            <div key={label} className="th-review__row">
                              <dt>{label}</dt>
                              <dd title={typeof value === "string" ? value : undefined}>
                                {value || "—"}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    ))}
                  </section>
                )}

                {/* Navigation */}
                <div className="th-onboarding__actions">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={back}
                    disabled={step === 0 || loading}
                  >
                    Back
                  </button>
                  {step < steps.length - 1 ? (
                    <button type="button" className="btn btn-primary" onClick={next}>
                      Continue <i className="bi bi-arrow-right ms-2" aria-hidden="true"></i>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading && (
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        ></span>
                      )}
                      <i className="bi bi-check-all me-2" aria-hidden="true"></i>
                      Submit application
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ProviderOnboardingFull;
