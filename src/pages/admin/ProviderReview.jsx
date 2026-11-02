import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import api from "../../api/axio";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import { clearStaleModalArtifacts, lockBodyScroll } from "../../lib/modalOverlay";

/**
 * Decision endpoint + copy for each administrative action.
 */
const ACTIONS = {
  APPROVED: {
    endpoint: "approve",
    verb: "approve",
    pendingLabel: "Approving...",
    requiresReason: false,
    successLabel: "Provider approved successfully.",
  },
  SUSPENDED: {
    endpoint: "suspend",
    verb: "suspend",
    pendingLabel: "Suspending...",
    requiresReason: true,
    successLabel: "Provider suspended successfully.",
  },
  REJECTED: {
    endpoint: "reject",
    verb: "reject",
    pendingLabel: "Rejecting...",
    requiresReason: true,
    successLabel: "Provider rejected successfully.",
  },
};

const STATUS_BADGE = {
  APPROVED: "bg-success",
  REJECTED: "bg-danger",
  SUSPENDED: "bg-secondary",
};

/**
 * Full profile review dialog.
 *
 * Rendered with a portal straight into <body> and driven entirely by React:
 *   - no dependency on Bootstrap's JS (window.bootstrap) or `data-bs-*`
 *     attributes, so nothing can leave an orphaned `.modal-backdrop` behind
 *     that blocks the Approve / Suspend / Reject buttons;
 *   - the dialog always paints above the backdrop, whatever stacking context
 *     the dashboard layout creates;
 *   - closing (button, backdrop click, Escape, or a finished action) always
 *     releases the scroll lock and removes every backdrop layer.
 */
function ProviderProfileModal({
  provider,
  reason,
  onReasonChange,
  actionType,
  onAction,
  onClose,
}) {
  const dialogRef = useRef(null);
  const busy = actionType !== null;

  // Lock page scrolling while the dialog is mounted.
  useEffect(() => lockBodyScroll(), []);

  // Escape closes the dialog (unless a request is in flight).
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  // Move focus into the dialog for keyboard/screen-reader users.
  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !busy) onClose();
  };

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        data-th-app-backdrop="true"
        aria-hidden="true"
        style={{ zIndex: 1040 }}
      />
      <div
        className="modal fade show d-block"
        id="providerModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="providerModalTitle"
        tabIndex={-1}
        ref={dialogRef}
        onClick={handleBackdropClick}
        style={{ zIndex: 1045 }}
      >
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-white" id="providerModalTitle">
                <i className="bi bi-shield-check me-2" aria-hidden="true"></i>
                Provider Full Profile Review
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                aria-label="Close dialog"
                onClick={onClose}
                disabled={busy}
              ></button>
            </div>

            <div className="modal-body bg-light">
              <div className="row g-4">
                {/* Business Info */}
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold" style={{ color: "var(--th-ink)" }}>
                      Business Identity
                    </div>
                    <div className="card-body">
                      <div className="detail-label">Legal Name</div>
                      <p className="fw-bold mb-3">{provider.legal_name}</p>
                      <div className="detail-label">Brand Name</div>
                      <p className="fw-bold mb-3">{provider.brand_name || "N/A"}</p>
                      <div className="detail-label">TIN Number</div>
                      <p className="fw-bold mb-3 text-danger">{provider.tin || "Not Provided"}</p>
                      <div className="detail-label">Reg Reference</div>
                      <p className="fw-bold mb-3">{provider.registration_ref || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold" style={{ color: "var(--th-ink)" }}>
                      Location Details
                    </div>
                    <div className="card-body">
                      <div className="detail-label">Country &amp; Region</div>
                      <p className="fw-bold mb-3">
                        {provider.country}, {provider.region}
                      </p>
                      <div className="detail-label">Physical Address</div>
                      <p className="fw-bold mb-3">{provider.physical_address || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="col-md-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-header bg-white fw-bold" style={{ color: "var(--th-ink)" }}>
                      Contact Person
                    </div>
                    <div className="card-body">
                      <div className="detail-label">Full Name</div>
                      <p className="fw-bold mb-3">{provider.contact_name}</p>
                      <div className="detail-label">Official Email</div>
                      <p className="fw-bold mb-3 text-primary">{provider.contact_email}</p>
                    </div>
                  </div>
                </div>

                {/* Reason Input */}
                <div className="col-12 mt-4">
                  <div className="p-3 bg-white rounded shadow-sm border-start border-primary border-4">
                    <label className="fw-bold mb-2 text-dark d-block" htmlFor="provider-decision-note">
                      Administrative Decision Note
                    </label>
                    <textarea
                      id="provider-decision-note"
                      className="form-control border-0 bg-light"
                      rows="3"
                      value={reason}
                      onChange={(event) => onReasonChange(event.target.value)}
                      placeholder="Write the reason here for rejection or suspension..."
                      disabled={busy}
                    ></textarea>
                    <p className="small text-muted mb-0 mt-2">
                      A note is required when rejecting or suspending a provider.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 bg-white">
              <button
                type="button"
                className="btn btn-light fw-bold"
                onClick={onClose}
                disabled={busy}
              >
                Close
              </button>

              <div className="ms-auto d-flex flex-wrap gap-2">
                {/* REJECT BUTTON */}
                <button
                  type="button"
                  className="btn btn-warning px-3 text-dark"
                  style={{ fontSize: "13px", transition: "0.2s" }}
                  onClick={() => onAction("REJECTED")}
                  disabled={busy}
                >
                  {actionType === "REJECTED" ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      {ACTIONS.REJECTED.pendingLabel}
                    </>
                  ) : (
                    "Reject Profile"
                  )}
                </button>

                {/* SUSPEND BUTTON */}
                <button
                  type="button"
                  className="btn btn-danger px-4 fw-bold"
                  style={{ fontSize: "13px", transition: "0.2s" }}
                  onClick={() => onAction("SUSPENDED")}
                  disabled={busy}
                >
                  {actionType === "SUSPENDED" ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      {ACTIONS.SUSPENDED.pendingLabel}
                    </>
                  ) : (
                    "Suspend"
                  )}
                </button>

                {/* APPROVE BUTTON */}
                <button
                  type="button"
                  className="btn btn-success px-4 fw-bold"
                  style={{ fontSize: "13px", transition: "0.2s" }}
                  onClick={() => onAction("APPROVED")}
                  disabled={busy}
                >
                  {actionType === "APPROVED" ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      {ACTIONS.APPROVED.pendingLabel}
                    </>
                  ) : (
                    "Approve Profile"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default function ProviderReview() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState(null); // APPROVED | SUSPENDED | REJECTED | null

  // Never leave the page with a Bootstrap backdrop on top of it: navigating
  // away from another screen while its modal was open can orphan one, and it
  // silently blocks every click on this page.
  useEffect(() => {
    clearStaleModalArtifacts();
    return clearStaleModalArtifacts;
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/providers");
      setProviders(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Failed to load providers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const closeModal = useCallback(() => {
    setSelectedProvider(null);
    setReason("");
    setActionType(null);
  }, []);

  const openModal = (provider) => {
    clearStaleModalArtifacts();
    setReason("");
    setActionType(null);
    setSelectedProvider(provider);
  };

  const handleAction = async (status) => {
    const config = ACTIONS[status];
    if (!config || actionType) return;

    if (!selectedProvider) {
      toast.error("No provider selected. Please open the profile again.");
      return;
    }

    const id = selectedProvider.id ?? selectedProvider.provider_id;
    if (!id) {
      toast.error("This provider record has no identifier, so it cannot be updated.");
      return;
    }

    const note = reason.trim();
    if (config.requiresReason && !note) {
      toast.warn(`Please provide a reason before you ${config.verb} this provider.`);
      return;
    }

    try {
      setActionType(status);
      const res = await api.post(`/providers/${id}/${config.endpoint}`, {
        reason: config.requiresReason ? note : note || "Approved",
      });

      toast.success(res?.data?.message || config.successLabel);
      closeModal();
      await fetchProviders();
    } catch (error) {
      console.error("Action Error:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Operation failed. Please try again."
      );
    } finally {
      setActionType(null);
    }
  };

  const columns = [
    { name: "Legal Name", selector: (row) => row.legal_name, sortable: true },
    { name: "TIN", selector: (row) => row.tin || "N/A", sortable: true },
    { name: "Type", selector: (row) => row.provider_type, sortable: true },
    {
      name: "Status",
      cell: (row) => (
        <span className={`badge ${STATUS_BADGE[row.status] || "bg-warning text-dark"}`}>
          {row.status || "PENDING"}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <button
          type="button"
          style={{
            backgroundColor: "var(--th-primary)",
            color: "white",
            fontSize: "13px",
            transition: "0.2s",
          }}
          className="btn btn-sm btn-outline-primary"
          onClick={() => openModal(row)}
        >
          Review Profile
        </button>
      ),
    },
  ];

  return (
    <AdminDashboardLayout title="Provider Review">
      <div className="card shadow-sm border-0 mt-3">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={providers}
            pagination
            progressPending={loading}
            highlightOnHover
          />
        </div>
      </div>

      {selectedProvider && (
        <ProviderProfileModal
          provider={selectedProvider}
          reason={reason}
          onReasonChange={setReason}
          actionType={actionType}
          onAction={handleAction}
          onClose={closeModal}
        />
      )}
    </AdminDashboardLayout>
  );
}
