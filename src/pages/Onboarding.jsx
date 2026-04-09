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

const providerTypes = ["Company", "University", "College", "Training Center", "NGO", "Government", "Individual Trainer"];
const regions = ["Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Mbeya", "Morogoro", "Tanga", "Kilimanjaro"];

function ProviderOnboardingFull() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    legal_name: "", brand_name: "", provider_type: "", registration_ref: "",
    tin: "", website: "", country: "Tanzania", region: "", district: "",
    physical_address: "", google_maps_link: "", contact_name: "",
    contact_role: "", contact_phone: "", contact_email: "",
  });

  // State for files
  const [files, setFiles] = useState({
    brela_doc: null,
    tin_doc: null
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const next = () => {
    if (step === 0) {
      if (!form.legal_name || !form.provider_type) return toast.error("Legal Name and Provider Type are required");
      if (!files.brela_doc || !files.tin_doc) return toast.error("Please upload both BRELA and TIN documents");
    }
    if (step === 1 && !form.region) 
        return toast.error("Region is required");
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
    Object.keys(form).forEach(key => formData.append(key, form[key]));
    if (files.brela_doc) formData.append("brela_doc", files.brela_doc);
    if (files.tin_doc) formData.append("tin_doc", files.tin_doc);

    try {
      const res = await api.post("/provider/onboarding", formData, {
        headers: { "Content-Type": "multipart/form-data" }
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
      <style>{`
        .onboarding-card { border: none; border-radius: 16px; background: #fff; }
        .step-indicator { display: flex; justify-content: space-between; position: relative; margin-bottom: 40px; }
        .step-item { z-index: 2; text-align: center; flex: 1; }
        .step-icon { 
            width: 40px; height: 40px; border-radius: 50%; background: #f3f4f6; 
            display: flex; align-items: center; justify-content: center; margin: 0 auto 8px;
            color: #9ca3af; transition: all 0.3s; font-size: 16px;
        }
        .step-item.active .step-icon { background: #0a2e67; color: #fff; transform: scale(1.1); box-shadow: 0 4px 10px rgba(10, 46, 103, 0.2); }
        .step-item.completed .step-icon { background: #10b981; color: #fff; }
        .step-label { font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
        .step-item.active .step-label { color: #0a2e67; }
        .progress-line { 
            position: absolute; top: 20px; left: 10%; right: 10%; height: 2px; 
            background: #e5e7eb; z-index: 1; 
        }
        .progress-bar-fill { height: 100%; background: #0a2e67; transition: width 0.4s ease; }
        .custom-input { 
            padding: 12px; border-radius: 8px; border: 1px solid #d1d5db; font-size: 14px; transition: 0.2s;
        }
        .custom-input:focus { border-color: #0a2e67; box-shadow: 0 0 0 3px rgba(10, 46, 103, 0.1); outline: none; }
        .review-section { background: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 15px; }
        .review-title { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px; }
        .review-item { margin-bottom: 8px; font-size: 14px; }
        .review-label { color: #64748b; font-weight: 500; width: 140px; display: inline-block; }
        .review-value { color: #1e293b; font-weight: 600; }
        .btn-nav { padding: 12px 30px; border-radius: 8px; font-weight: 700; font-size: 14px; transition: all 0.2s; }
      `}</style>

      <NavBar />
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <ToastContainer position="top-center" />
            
            <div className="text-center mb-5">
              <h2 className="fw-bold" style={{ color: "#0a2e67", fontSize:"18px" }}>Provider Application</h2>
              <p className="text-muted">Fill in your organization details to join TrainingHub</p>
            </div>

            <div className="onboarding-card shadow-lg p-4 p-md-5">
              <div className="step-indicator">
                <div className="progress-line">
                  <div className="progress-bar-fill" style={{ width: `${((step) / (steps.length - 1)) * 100}%` }}></div>
                </div>
                {steps.map((s, i) => (
                  <div key={i} className={`step-item ${step === i ? "active" : ""} ${step > i ? "completed" : ""}`}>
                    <div className="step-icon">
                      {step > i ? <i className="bi bi-check-lg"></i> : <i className={`bi ${s.icon}`}></i>}
                    </div>
                    <div className="step-label d-none d-md-block">{s.title}</div>
                  </div>
                ))}
              </div>

              {/* Step 0: Identity & Files */}
              {step === 0 && (
                <div>
                  <h5 className="fw-bold mb-4" style={{fontSize:"14px"}}>1. Organization Identity</h5>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Legal Name *</label>
                      <input className="form-control custom-input" name="legal_name" placeholder="As registered with BRELA" value={form.legal_name} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Provider Type *</label>
                      <select className="form-select custom-input" name="provider_type" value={form.provider_type} onChange={handleChange}>
                        <option value="">Select Category</option>
                        {providerTypes.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Registration Ref (BRELA)</label>
                      <input className="form-control custom-input" name="registration_ref" value={form.registration_ref} onChange={handleChange} />
                    </div>
                    
                    {/* Document Uploads */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-danger">BRELA Certificate *</label>
                      <input type="file" className="form-control custom-input" name="brela_doc" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                      {files.brela_doc && <small className="text-success fw-bold">Selected: {files.brela_doc.name}</small>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-danger">TIN Certificate *</label>
                      <input type="file" className="form-control custom-input" name="tin_doc" accept=".pdf,.jpg,.png" onChange={handleFileChange} />
                      {files.tin_doc && <small className="text-success fw-bold">Selected: {files.tin_doc.name}</small>}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">TIN Number</label>
                      <input className="form-control custom-input" name="tin" value={form.tin} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Website</label>
                      <input className="form-control custom-input" name="website" value={form.website} onChange={handleChange} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Location */}
              {step === 1 && (
                <div>
                  <h5 className="fw-bold mb-4">2. Address & Location</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Region *</label>
                      <select className="form-select custom-input" name="region" value={form.region} onChange={handleChange}>
                        <option value="">Select Region</option>
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">District / City</label>
                      <input className="form-control custom-input" name="district" value={form.district} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Physical Address</label>
                      <textarea className="form-control custom-input" name="physical_address" rows="2" value={form.physical_address} onChange={handleChange}></textarea>
                    </div>
                  </div>
                </div>
              )}

             {/* Step 2: Contact */}
{step === 2 && (
  <div>
    <h5 className="fw-bold mb-4">3. Primary Contact Person</h5>
    <div className="row g-3">
      <div className="col-md-6">
        <label className="form-label fw-semibold small">Full Name *</label>
        <input className="form-control custom-input" name="contact_name" value={form.contact_name} onChange={handleChange} />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold small">Phone Number *</label>
        <input className="form-control custom-input" name="contact_phone" value={form.contact_phone} onChange={handleChange} />
      </div>
      {/* Nimeongeza hizi hapa chini zilandane na review yako */}
      <div className="col-md-6">
        <label className="form-label fw-semibold small">Contact Role</label>
        <input className="form-control custom-input" name="contact_role" placeholder="e.g. Director, Manager" value={form.contact_role} onChange={handleChange} />
      </div>
      <div className="col-md-6">
        <label className="form-label fw-semibold small">Contact Email</label>
        <input type="email" className="form-control custom-input" name="contact_email" placeholder="email@example.com" value={form.contact_email} onChange={handleChange} />
      </div>
    </div>
  </div>
)}

              {/* Step 3: Review */}
              {/* Step 3: Review */}
{step === 3 && (
  <div className="animate__animated animate__fadeIn">
    <h5 className="fw-bold mb-4">4. Final Review</h5>
    
    {/* Identity Review */}
    <div className="review-section">
      <div className="review-title"><i className="bi bi-building me-2"></i>Organization Identity</div>
      <div className="review-item"><span className="review-label">Legal Name:</span> <span className="review-value">{form.legal_name}</span></div>
      <div className="review-item"><span className="review-label">Brand Name:</span> <span className="review-value">{form.brand_name || "N/A"}</span></div>
      <div className="review-item"><span className="review-label">Provider Type:</span> <span className="review-value">{form.provider_type}</span></div>
      <div className="review-item"><span className="review-label">Registration Ref:</span> <span className="review-value">{form.registration_ref || "N/A"}</span></div>
      <div className="review-item"><span className="review-label">TIN Number:</span> <span className="review-value">{form.tin || "N/A"}</span></div>
      <div className="review-item"><span className="review-label">Website:</span> <span className="review-value">{form.website || "N/A"}</span></div>
      <div className="review-item"><span className="review-label">BRELA Doc:</span> <span className="review-value text-success">{files.brela_doc?.name}</span></div>
      <div className="review-item"><span className="review-label">TIN Doc:</span> <span className="review-value text-success">{files.tin_doc?.name}</span></div>
    </div>

    {/* Location Review */}
    <div className="review-section">
      <div className="review-title"><i className="bi bi-geo-alt me-2"></i>Location Details</div>
      <div className="review-item"><span className="review-label">Country:</span> <span className="review-value">{form.country}</span></div>
      <div className="review-item"><span className="review-label">Region:</span> <span className="review-value">{form.region}</span></div>
      <div className="review-item"><span className="review-label">District:</span> <span className="review-value">{form.district || "N/A"}</span></div>
      <div className="review-item"><span className="review-label">Physical Address:</span> <span className="review-value">{form.physical_address || "N/A"}</span></div>
      {form.google_maps_link && (
        <div className="review-item"><span className="review-label">Maps Link:</span> <span className="review-value text-truncate d-inline-block" style={{maxWidth: "200px"}}>{form.google_maps_link}</span></div>
      )}
    </div>

    {/* Contact Review */}
    <div className="review-section">
      <div className="review-title"><i className="bi bi-person-badge me-2"></i>Contact Information</div>
      <div className="review-item"><span className="review-label">Contact Name:</span> <span className="review-value">{form.contact_name}</span></div>
      <div className="review-item"><span className="review-label">Role:</span> <span className="review-value">{form.contact_role || "N/A"}</span></div>
      <div className="review-item"><span className="review-label">Phone:</span> <span className="review-value">{form.contact_phone}</span></div>
      <div className="review-item"><span className="review-label">Email:</span> <span className="review-value">{form.contact_email || "N/A"}</span></div>
    </div>
  </div>
)}

              {/* Navigation */}
              <div className="d-flex justify-content-between mt-5 pt-3 border-top">
                <button className="btn btn-outline-secondary btn-nav" onClick={back} disabled={step === 0 || loading}>
                  Back
                </button>
                {step < steps.length - 1 ? (
                  <button className="btn text-white btn-nav" style={{ backgroundColor: "#0a2e67" }} onClick={next}>
                    Continue <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button className="btn btn-success btn-nav" onClick={handleSubmit} disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-check-all me-2"></i>}
                    Submit Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProviderOnboardingFull;