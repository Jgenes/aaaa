import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DataTable from "react-data-table-component";
import { toast } from "react-toastify";
import api from "../../api/axio";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout";
import { tableStyles } from "../../lib/tableStyles";
import { clearStaleModalArtifacts, lockBodyScroll } from "../../lib/modalOverlay";

/* ------------------------------------------------------------
   Decision configuration
   ------------------------------------------------------------ */
const ACTIONS = {
  APPROVED: {
    endpoint: "approve",
    verb: "approve",
    pendingLabel: "Approving…",
    requiresReason: false,
    successLabel: "Provider approved successfully.",
  },
  SUSPENDED: {
    endpoint: "suspend",
    verb: "suspend",
    pendingLabel: "Suspending…",
    requiresReason: true,
    successLabel: "Provider suspended successfully.",
  },
  REJECTED: {
    endpoint: "reject",
    verb: "reject",
    pendingLabel: "Rejecting…",
    requiresReason: true,
    successLabel: "Provider rejected successfully.",
  },
};

const STATUS_META = {
  APPROVED: { label: "Approved", pill: "th-pill--approved" },
  PENDING: { label: "Pending review", pill: "th-pill--pending" },
  SUSPENDED: { label: "Suspended", pill: "th-pill--suspended" },
  REJECTED: { label: "Rejected", pill: "th-pill--rejected" },
};

const FILTERS = [
  { id: "ALL", label: "All" },
  { id: "PENDING", label: "Pending" },
  { id: "APPROVED", label: "Approved" },
  { id: "SUSPENDED", label: "Suspended" },
  { id: "REJECTED", label: "Rejected" },
];

const normaliseStatus = (status) => {
  const value = String(status || "PENDING").toUpperCase();
  return STATUS_META[value] ? value : "PENDING";
};

const statusMeta = (status) => STATUS_META[normaliseStatus(status)];

const initialsOf = (value = "") =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("") || "PR";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function StatusPill({ status }) {
  const meta = statusMeta(status);
  return <span className={`th-pill ${meta.pill}`}>{meta.label}</span>;
}

/* ------------------------------------------------------------
   Profile review dialog
   ------------------------------------------------------------ */
function ProviderProfileModal({ provider, reason, onReasonChange, actionType, onAction, onClose }) {
  const dialogRef = useRef(null);
  const busy = actionType !== null;
  const status = normaliseStatus(provider.status);

  useEffect(() => lockBodyScroll(), []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  useEffect(() => {
    dialogRef.current?.focus({ preventScroll: true });
  }, []);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !busy) onClose();
  };

  const facts = (rows) => (
    <dl className="mb-0">
      {rows.map(([label, value]) => (
        <div className="th-fact" key={label}>
          <dt>{label}</dt>
          <dd className={value ? undefined : "is-missing"}>{value || "Not provided"}</dd>
        </div>
      ))}
    </dl>
  );

  const submitted = formatDate(provider.created_at || provider.submitted_at);

  return createPortal(
    <>
      <div
        className="modal-backdrop fade show"
        data-th-app-backdrop="true"
        aria-hidden="true"
        style={{ zIndex: 1040 }}
      />
      <div
        className="modal fade show d-block th-review-dialog"
        id="providerModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="providerModalTitle"
        tabIndex={-1}
        ref={dialogRef}
        onClick={handleBackdropClick}
        style={{ zIndex: 1045 }}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="th-review-dialog__head">
              <span className="th-review-dialog__avatar" aria-hidden="true">
                {initialsOf(provider.legal_name || provider.brand_name)}
              </span>
              <div className="min-w-0">
                <h2 className="th-review-dialog__title" id="providerModalTitle">
                  {provider.legal_name || "Unnamed provider"}
                </h2>
                <p className="th-review-dialog__meta">
                  {[provider.provider_type, provider.region, submitted && `Submitted ${submitted}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="d-none d-sm-flex ms-auto align-items-center gap-2">
                <StatusPill status={status} />
              </div>
              <button
                type="button"
                className={`th-review-dialog__close ${status !== "PENDING" ? "" : "ms-2"}`}
                aria-label="Close profile review"
                onClick={onClose}
                disabled={busy}
              >
                <i className="bi bi-x-lg" aria-hidden="true"></i>
              </button>
            </div>

            <div className="modal-body th-review-dialog__body">
              <div className="row g-3">
                <div className="col-lg-4">
                  <section className="th-review-section">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-building" aria-hidden="true"></i>
                      Business identity
                    </h3>
                    {facts([
                      ["Legal name", provider.legal_name],
                      ["Brand name", provider.brand_name],
                      ["Provider type", provider.provider_type],
                      ["Registration no.", provider.registration_ref],
                      ["TIN", provider.tin],
                      ["Website", provider.website],
                    ])}
                  </section>
                </div>

                <div className="col-lg-4">
                  <section className="th-review-section">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-geo-alt" aria-hidden="true"></i>
                      Location
                    </h3>
                    {facts([
                      [
                        "Country",
                        [provider.country, provider.region].filter(Boolean).join(", "),
                      ],
                      ["District", provider.district],
                      ["Physical address", provider.physical_address],
                    ])}
                    {provider.google_maps_link && (
                      <a
                        className="btn btn-sm btn-outline-dark mt-3"
                        href={provider.google_maps_link}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <i className="bi bi-pin-map me-2" aria-hidden="true"></i>
                        Open in Maps
                      </a>
                    )}
                  </section>
                </div>

                <div className="col-lg-4">
                  <section className="th-review-section">
                    <h3 className="th-review-section__title">
                      <i className="bi bi-person-badge" aria-hidden="true"></i>
                      Primary contact
                    </h3>
                    {facts([
                      ["Full name", provider.contact_name],
                      ["Role", provider.contact_role],
                      ["Phone", provider.contact_phone],
                      ["Email", provider.contact_email],
                    ])}
                    {provider.contact_email && (
                      <a
                        className="btn btn-sm btn-outline-dark mt-3"
                        href={`mailto:${provider.contact_email}`}
                      >
                        <i className="bi bi-envelope me-2" aria-hidden="true"></i>
                        Email contact
                      </a>
                    )}
                  </section>
                </div>
              </div>

              <div className="th-decision">
                <label className="th-decision__title d-block" htmlFor="provider-decision-note">
                  Administrative decision note
                </label>
                <p className="th-decision__hint">
                  Required before rejecting or suspending. The provider receives this note by
                  email, so keep it factual and actionable.
                </p>
                <textarea
                  id="provider-decision-note"
                  className="form-control"
                  rows="3"
                  value={reason}
                  onChange={(event) => onReasonChange(event.target.value)}
                  placeholder="e.g. TIN certificate is unreadable — please re-upload a clear scan."
                  disabled={busy}
                ></textarea>
              </div>
            </div>

            <div className="th-review-dialog__foot">
              <p className="th-review-dialog__note">
                <i className="bi bi-info-circle me-1" aria-hidden="true"></i>
                Decisions apply immediately and are recorded in the audit trail.
              </p>

              <div className="th-review-dialog__actions">
                <button
                  type="button"
                  className="btn th-btn-reject"
                  onClick={() => onAction("REJECTED")}
                  disabled={busy}
                >
                  {actionType === "REJECTED" ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      {ACTIONS.REJECTED.pendingLabel}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle me-2" aria-hidden="true"></i>
                      Reject
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn th-btn-suspend"
                  onClick={() => onAction("SUSPENDED")}
                  disabled={busy || status === "SUSPENDED"}
                >
                  {actionType === "SUSPENDED" ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      {ACTIONS.SUSPENDED.pendingLabel}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-pause-circle me-2" aria-hidden="true"></i>
                      Suspend
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="btn th-btn-approve"
                  onClick={() => onAction("APPROVED")}
                  disabled={busy || status === "APPROVED"}
                >
                  {actionType === "APPROVED" ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      {ACTIONS.APPROVED.pendingLabel}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check2-circle me-2" aria-hidden="true"></i>
                      Approve profile
                    </>
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

/* ------------------------------------------------------------
   Page
   ------------------------------------------------------------ */
export default function ProviderReview() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [reason, setReason] = useState("");
  const [actionType, setActionType] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

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
      toast.error("We couldn't load the provider queue. Please retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const counts = useMemo(() => {
    const base = { ALL: providers.length, PENDING: 0, APPROVED: 0, SUSPENDED: 0, REJECTED: 0 };
    providers.forEach((provider) => {
      base[normaliseStatus(provider.status)] += 1;
    });
    return base;
  }, [providers]);

  const visibleProviders = useMemo(() => {
    const term = query.trim().toLowerCase();
    return providers.filter((provider) => {
      const matchesStatus =
        statusFilter === "ALL" || normaliseStatus(provider.status) === statusFilter;
      if (!matchesStatus) return false;
      if (!term) return true;

      return [
        provider.legal_name,
        provider.brand_name,
        provider.tin,
        provider.registration_ref,
        provider.contact_name,
        provider.contact_email,
        provider.provider_type,
        provider.region,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [providers, query, statusFilter]);

  const closeModal = useCallback(() => {
    setSelectedProvider(null);
    setReason("");
    setActionType(null);
  }, []);

  const openModal = (provider) => {
    clearStaleModalArtifacts();
    setReason(provider.decision_reason || "");
    setActionType(null);
    setSelectedProvider(provider);
  };

  const handleAction = async (status) => {
    const config = ACTIONS[status];
    if (!config || actionType) return;

    if (!selectedProvider) {
      toast.error("No provider selected. Open the profile again.");
      return;
    }

    const id = selectedProvider.id ?? selectedProvider.provider_id;
    if (!id) {
      toast.error("This provider record has no identifier, so it cannot be updated.");
      return;
    }

    const note = reason.trim();
    if (config.requiresReason && !note) {
      toast.warn(`Add a decision note before you ${config.verb} this provider.`);
      return;
    }

    try {
      setActionType(status);
      const res = await api.post(`/providers/${id}/${config.endpoint}`, {
        reason: config.requiresReason ? note : note || "Approved",
      });

      toast.success(res?.data?.message || config.successLabel);

      // Reflect the new status immediately instead of waiting for the refetch.
      setProviders((current) =>
        current.map((item) =>
          (item.id ?? item.provider_id) === id ? { ...item, status } : item
        )
      );

      closeModal();
      await fetchProviders();
    } catch (error) {
      console.error("Action Error:", error);
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "That action didn't go through. Please try again."
      );
    } finally {
      setActionType(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Provider",
        selector: (row) => row.legal_name || "",
        sortable: true,
        grow: 2.2,
        cell: (row) => (
          <div className="th-identity">
            <span className="th-identity__avatar" aria-hidden="true">
              {initialsOf(row.legal_name || row.brand_name)}
            </span>
            <span className="min-w-0">
              <span className="th-cell-title">{row.legal_name || "Unnamed provider"}</span>
              <span className="th-cell-sub">
                {row.brand_name || row.contact_email || "No brand name"}
              </span>
            </span>
          </div>
        ),
      },
      {
        name: "TIN",
        selector: (row) => row.tin || "",
        sortable: true,
        cell: (row) =>
          row.tin ? (
            <span className="th-cell-title" style={{ fontVariantNumeric: "tabular-nums" }}>
              {row.tin}
            </span>
          ) : (
            <span className="th-cell-sub">Not provided</span>
          ),
      },
      {
        name: "Type",
        selector: (row) => row.provider_type || "",
        sortable: true,
        cell: (row) => (
          <span className="th-cell-sub" style={{ fontSize: "var(--th-fs-sm)" }}>
            {row.provider_type || "—"}
          </span>
        ),
      },
      {
        name: "Location",
        selector: (row) => row.region || "",
        sortable: true,
        cell: (row) => <span className="th-cell-sub">{row.region || "—"}</span>,
      },
      {
        name: "Status",
        selector: (row) => normaliseStatus(row.status),
        sortable: true,
        cell: (row) => <StatusPill status={row.status} />,
      },
      {
        name: "",
        button: true,
        right: true,
        cell: (row) => (
          <button
            type="button"
            className="btn btn-sm btn-outline-dark"
            onClick={() => openModal(row)}
            aria-label={`Review profile for ${row.legal_name || "provider"}`}
          >
            Review profile
          </button>
        ),
      },
    ],
    // Column definitions only depend on the helpers above, which are pure.
    []
  );

  const kpis = [
    { id: "PENDING", label: "Awaiting review", icon: "bi-hourglass-split", tone: "warning" },
    { id: "APPROVED", label: "Approved", icon: "bi-patch-check", tone: "success" },
    { id: "SUSPENDED", label: "Suspended", icon: "bi-pause-circle", tone: "" },
    { id: "REJECTED", label: "Rejected", icon: "bi-x-octagon", tone: "danger" },
  ];

  return (
    <AdminDashboardLayout
      title="Provider review"
      subtitle="Verify business documents and decide who may publish trainings on TrainHub TZ."
    >
      <header className="th-intro">
        <div>
          <p className="th-intro__eyebrow">Verification queue</p>
          <h2 className="th-intro__title">Provider applications</h2>
          <p className="th-intro__sub">
            Every decision is recorded with its note. Open a profile to inspect identity,
            location and contact details before approving, suspending or rejecting.
          </p>
        </div>

        <div className="th-intro__actions">
          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={fetchProviders}
            disabled={loading}
          >
            <i className={`bi bi-arrow-clockwise me-2 ${loading ? "th-spin" : ""}`} aria-hidden="true"></i>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <div className="th-kpi-grid">
        {kpis.map((kpi) => (
          <button
            type="button"
            key={kpi.id}
            className={`th-kpi ${kpi.tone ? `th-kpi--${kpi.tone}` : ""} ${
              statusFilter === kpi.id ? "is-active" : ""
            }`}
            onClick={() => setStatusFilter((current) => (current === kpi.id ? "ALL" : kpi.id))}
            aria-pressed={statusFilter === kpi.id}
          >
            <span className="th-kpi__label">
              <i className={`bi ${kpi.icon}`} aria-hidden="true"></i>
              {kpi.label}
            </span>
            <span className="th-kpi__value">{counts[kpi.id] ?? 0}</span>
            <span className="th-kpi__hint">
              {statusFilter === kpi.id ? "Filtering — click to clear" : "Click to filter"}
            </span>
          </button>
        ))}
      </div>

      <section className="th-panel th-table-panel" aria-label="Providers awaiting verification">
        <div className="th-toolbar-row">
          <div className="th-search">
            <i className="bi bi-search" aria-hidden="true"></i>
            <input
              type="search"
              className="form-control"
              placeholder="Search name, TIN, contact or region"
              aria-label="Search providers"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="th-toolbar-row__chips" role="group" aria-label="Filter by status">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={`th-chip ${statusFilter === filter.id ? "is-active" : ""}`}
                onClick={() => setStatusFilter(filter.id)}
                aria-pressed={statusFilter === filter.id}
              >
                {filter.label}
                <span className="th-cell-sub" style={{ display: "inline" }}>
                  {counts[filter.id] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <p className="th-toolbar-row__meta mb-0" role="status">
            {visibleProviders.length} of {providers.length} shown
          </p>
        </div>

        <DataTable
          columns={columns}
          data={visibleProviders}
          pagination
          paginationPerPage={10}
          paginationRowsPerPageOptions={[10, 20, 50]}
          progressPending={loading}
          highlightOnHover
          responsive
          customStyles={tableStyles}
          noDataComponent={
            <div className="th-table-empty">
              <span className="th-table-empty__icon">
                <i className="bi bi-inbox" aria-hidden="true"></i>
              </span>
              <p className="th-table-empty__title">
                {providers.length === 0 ? "The queue is clear" : "No providers match this view"}
              </p>
              <p className="th-table-empty__text">
                {providers.length === 0
                  ? "New provider applications will appear here as soon as they are submitted."
                  : "Try a different search term or clear the status filter."}
              </p>
              {providers.length > 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark mt-2"
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          }
        />
      </section>

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
