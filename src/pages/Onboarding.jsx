import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import api from "../api/axio";
import "react-toastify/dist/ReactToastify.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const steps = [
  "Company Identity",
  "Address & Location",
  "Primary Contact",
  "Review & Submit",
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Validate required fields per step
  const next = () => {
    if (step === 0) {
      if (!form.legal_name || !form.provider_type) {
        return toast.error("Legal Name and Provider Type are required");
      }
    }

    if (step === 1) {
      if (!form.region) {
        return toast.error("Region is required");
      }
    }

    if (step === 2) {
      if (!form.contact_name || !form.contact_phone) {
        return toast.error("Contact Name and Phone Number are required");
      }
    }

    setStep(step + 1);
  };

  const back = () => setStep(step - 1);

  const handleSubmit = async () => {
    // Final minimal validation
    const required = [
      "legal_name",
      "provider_type",
      "region",
      "contact_name",
      "contact_phone",
    ];

    const missing = required.filter((f) => !form[f]);
    if (missing.length > 0)
      return toast.error(`Please fill: ${missing.join(", ")}`);

    setLoading(true);
    try {
      const res = await api.post("/provider/onboarding", form);
      toast.success(res.data.message || "Onboarding submitted successfully!");
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
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <ToastContainer />
            <h3 className="t3">Provider Onboarding</h3>
            <hr className="h2 mb-2" />

            <div className="mb-2 mt-3">
              {steps.map((s, i) => (
                <span
                  key={i}
                  className={`me-3 ${step === i ? "fw-bold text-primary" : ""}`}
                >
                  {i + 1}. {s}
                </span>
              ))}
            </div>

            {step === 0 && (
              <>
                <input
                  className="form-control mb-2"
                  name="legal_name"
                  placeholder="Legal Name *"
                  value={form.legal_name}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="brand_name"
                  placeholder="Trading / Brand Name"
                  value={form.brand_name}
                  onChange={handleChange}
                />
                <select
                  className="form-control mb-2"
                  name="provider_type"
                  value={form.provider_type}
                  onChange={handleChange}
                >
                  <option value="">Select Provider Type *</option>
                  {providerTypes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  className="form-control mb-2"
                  name="registration_ref"
                  placeholder="Business Registration Ref (BRELA)"
                  value={form.registration_ref}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="tin"
                  placeholder="TIN"
                  value={form.tin}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="website"
                  placeholder="Website / Social Link"
                  value={form.website}
                  onChange={handleChange}
                />
              </>
            )}

            {step === 1 && (
              <>
                <select
                  className="form-control mb-2"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                >
                  <option value="">Select Region *</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <input
                  className="form-control mb-2"
                  name="district"
                  placeholder="District / City"
                  value={form.district}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="physical_address"
                  placeholder="Physical Address"
                  value={form.physical_address}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="google_maps_link"
                  placeholder="Google Maps Link"
                  value={form.google_maps_link}
                  onChange={handleChange}
                />
              </>
            )}

            {step === 2 && (
              <>
                <input
                  className="form-control mb-2"
                  name="contact_name"
                  placeholder="Contact Name *"
                  value={form.contact_name}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="contact_role"
                  placeholder="Role / Title"
                  value={form.contact_role}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="contact_phone"
                  placeholder="Phone Number *"
                  value={form.contact_phone}
                  onChange={handleChange}
                />
                <input
                  className="form-control mb-2"
                  name="contact_email"
                  placeholder="Email Address"
                  value={form.contact_email}
                  onChange={handleChange}
                />
              </>
            )}

            {step === 3 && (
              <div className="border p-3 bg-light">
                <h5>Review Details</h5>
                {Object.keys(form).map((k) => (
                  <p key={k}>
                    <b>{k.replace(/_/g, " ")}:</b> {form[k] || "-"}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-3">
              {step > 0 && (
                <button
                  style={{
                    backgroundColor: "#0a2e67",
                    fontSize: "13px",
                    borderColor: "#0a2e67",
                  }}
                  className="btn btn-secondary me-2"
                  onClick={back}
                >
                  Back
                </button>
              )}

              {step < steps.length - 1 && (
                <button
                  style={{
                    backgroundColor: "#0a2e67",
                    fontSize: "13px",
                    borderColor: "#0a2e67",
                  }}
                  className="btn btn-primary"
                  onClick={next}
                >
                  Next
                </button>
              )}

              {step === steps.length - 1 && (
                <button
                  style={{
                    backgroundColor: "#0a2e67",
                    fontSize: "13px",
                    borderColor: "#0a2e67",
                  }}
                  className="btn btn-success btnBoarding"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProviderOnboardingFull;
