import { useState, useEffect } from "react";
import api from "../../api/axio";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProviderProfile() {
  const [formData, setFormData] = useState({
    legal_name: "",
    brand_name: "",
    provider_type: "",
    tin: "",
    website: "",
    region: "",
    district: "",
    physical_address: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
     status: "PENDING",
    country: "",
    map: "",
    role: "",
    contact_role: "",
    google_map_links: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/provider/profile");
      // Kama Laravel inarudisha data moja kwa moja au ndani ya { data: ... }
      const profileData = res.data.data ? res.data.data : res.data;

      setFormData({
        legal_name: profileData.legal_name || "",
        brand_name: profileData.brand_name || "",
        provider_type: profileData.provider_type || "",
        tin: profileData.tin || "",
        website: profileData.website || "",
        country: profileData.country || profileData.country_name || "",
        region: profileData.region || "",
        district: profileData.district || "",
        physical_address: profileData.physical_address || profileData.address || "",
        google_map_links: profileData.google_map_links || profileData.map || profileData.location_map || profileData.map_url || "",
        map: profileData.google_map_links || profileData.map || profileData.location_map || profileData.map_url || "",
        contact_name: profileData.contact_name || profileData.contact?.name || "",
        contact_phone: profileData.contact_phone || profileData.contact?.phone || "",
        contact_email: profileData.contact_email || profileData.contact?.email || profileData.email || "",
        role: profileData.role || profileData.user_role || "",
        contact_role: profileData.contact_role || profileData.role || profileData.user_role || "",
        status: profileData.status || "PENDING",
      });
      setLoading(false);
    } catch (err) {
      console.error("Profile fetch error:", err);
      toast.error("Haikuweza kupata profile!");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/provider/profile/update", formData);
      toast.success("Profile imesasishwa kikamilifu! 🚀", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Imefeli kuhifadhi!";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <ProviderDashboardLayout title="Profile">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Inapakia profile yako...</p>
        </div>
      </ProviderDashboardLayout>
    );

  return (
    <ProviderDashboardLayout title="Manage Profile">
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Section 1: Business Identity */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0" style={{ color: "var(--th-primary)" }}>
                  Business Identity & Registration
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted" htmlFor="legal_name">
                      LEGAL NAME
                    </label>
                    <input id="legal_name"
                      type="text"
                      className="form-control"
                      value={formData.legal_name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, legal_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted" htmlFor="brand_name">
                      BRAND NAME
                    </label>
                    <input id="brand_name"
                      type="text"
                      className="form-control"
                      value={formData.brand_name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, brand_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted" htmlFor="provider_type">
                      PROVIDER TYPE
                    </label>
                    <input id="provider_type"
                      type="text"
                      className="form-control bg-light"
                      value={formData.provider_type || ""}
                      disabled
                    />
                    <small className="text-muted">Provider type is set from your account and cannot be changed here.</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted" htmlFor="tin_number">
                      TIN NUMBER
                    </label>
                    <input id="tin_number"
                      type="text"
                      className="form-control"
                      value={formData.tin || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, tin: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted" htmlFor="website_url">
                      WEBSITE URL
                    </label>
                    <input id="website_url"
                      type="url"
                      className="form-control"
                      placeholder="https://example.com"
                      value={formData.website || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Location */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0" style={{ color: "var(--th-primary)" }}>
                  Location Details
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted" htmlFor="country">
                      COUNTRY
                    </label>
                    <input id="country"
                      type="text"
                      className="form-control"
                      value={formData.country || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted" htmlFor="region">
                      REGION
                    </label>
                    <input id="region"
                      type="text"
                      className="form-control"
                      value={formData.region || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, region: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted" htmlFor="district">
                      DISTRICT
                    </label>
                    <input id="district"
                      type="text"
                      className="form-control"
                      value={formData.district || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted" htmlFor="physical_address">
                      PHYSICAL ADDRESS
                    </label>
                    <textarea id="physical_address"
                      className="form-control"
                      rows="2"
                      value={formData.physical_address || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          physical_address: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted" htmlFor="location_map_url_or_embed">
                      LOCATION MAP (URL or embed)
                    </label>
                    <input id="location_map_url_or_embed"
                      type="text"
                      className="form-control"
                      placeholder="https://maps.example.com/..."
                      value={formData.google_map_links || formData.map || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, google_map_links: e.target.value, map: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Contact Person & Action */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4 border-top border-primary border-4">
              <div className="card-header bg-white py-3">
                <h6 className="fw-bold mb-0" style={{ color: "var(--th-primary)" }}>
                  Primary Contact Person
                </h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted" htmlFor="full_name">
                    FULL NAME
                  </label>
                  <input id="full_name"
                    type="text"
                    className="form-control bg-light"
                    value={formData.contact_name || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted" htmlFor="role">ROLE</label>
                  <input id="role"
                    type="text"
                    className="form-control bg-light"
                    value={formData.contact_role || ""}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted" htmlFor="phone_number">
                    PHONE NUMBER
                  </label>
                  <input id="phone_number"
                    type="text"
                    className="form-control bg-light"
                    value={formData.contact_phone || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted" htmlFor="official_email">
                    OFFICIAL EMAIL
                  </label>
                  <input id="official_email"
                    type="email"
                    className="form-control bg-light"
                    value={formData.contact_email || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_email: e.target.value,
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold vvb" 
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving Changes...
                    </>
                  ) : (
                    "Update Profile"
                  )}
                </button>
              </div>
            </div>

            {/* Status Indicator */}
            <div
              className={`card border-0 shadow-sm p-3 text-center ${formData.status === "APPROVED" ? "bg-success-subtle" : "bg-warning-subtle"}`}
            >
              <small className="fw-bold d-block text-muted small">
                ACCOUNT STATUS
              </small>
              <span
                className={`badge ${formData.status === "APPROVED" ? "bg-success" : "bg-warning"} mt-1`}
              >
                {formData.status}
              </span>
            </div>
          </div>
        </div>
      </form>
    </ProviderDashboardLayout>
  );
}
