import { useState } from "react";
import api from "../../api/axio";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import { toast, ToastContainer } from "react-toastify";

export default function ProviderSettings() {
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/provider/settings/password", passwords);
      toast.success("Password imebadilishwa!");
      setPasswords({
        current_password: "",
        password: "",
        password_confirmation: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Imefeli kubadili password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProviderDashboardLayout title="Account Settings">
      <ToastContainer />
      <div className="row">
        {/* Password Update Card */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm p-4">
            <h6 className="fw-bold mb-3">Change Password</h6>
            <form onSubmit={handlePasswordUpdate}>
              <div className="mb-3">
                <label className="form-label small text-muted fw-bold">
                  CURRENT PASSWORD
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={passwords.current_password}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      current_password: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label small text-muted fw-bold">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={passwords.password}
                  onChange={(e) =>
                    setPasswords({ ...passwords, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label small text-muted fw-bold">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  className="form-control"
                  value={passwords.password_confirmation}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      password_confirmation: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100 fw-bold vvb"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>

        {/* Account Info/Safety Tip */}
        <div className="col-md-6 mt-4 mt-md-0">
          <div className="card border-0 shadow-sm p-4 h-100 bg-light">
            <h6 className="fw-bold text-dark">Security Tips</h6>
            <ul className="small text-muted mt-3">
              <li>
                Use a strong password with a mix of letters, numbers, and
                special characters.
              </li>
              <li>
                Avoid using the same password that you use for your social media
                accounts.
              </li>
              <li>
                Ensure your email address is valid to receive important system
                notifications and updates.
              </li>
            </ul>
            <div className="mt-auto p-3 border rounded bg-white">
              <small className="d-block text-muted">
                Two-Factor Authentication
              </small>
              <span className="badge bg-secondary-subtle text-secondary">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}
