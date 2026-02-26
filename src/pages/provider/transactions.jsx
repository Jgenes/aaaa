import { useState, useEffect } from "react";
import api from "../../api/axio";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";

export default function ProviderInvoices() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchProviderPayments();
  }, []);

  const fetchProviderPayments = async () => {
    try {
      const res = await api.get("/provider/payments");
      const normalized = (res.data || []).map((p) => {
        const cohortObj = p.cohort || null;
        const cohortName =
          cohortObj?.name || cohortObj?.intake_name || cohortObj?.intakeName ||
          (p.cohort_id ? `Cohort #${p.cohort_id}` : null);

        return {
          ...p,
          cohort: cohortObj
            ? { ...cohortObj, displayName: cohortName }
            : cohortName ? { displayName: cohortName } : null,
        };
      });
      setPayments(normalized);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setLoading(false);
    }
  };

  const handleDownload = (reference) => {
    const baseUrl = "http://localhost:8000/api";
    window.open(`${baseUrl}/download-document/${reference}`, "_blank");
  };

  const handleToggleStatus = async (payment) => {
    const newStatus = payment.status === "PENDING" ? "COMPLETED" : "PENDING";
    setUpdatingId(payment.id);
    try {
      // HAPA NDIPO PAMEBADILIKA: Tumetumia .post badala ya .put
await api.post(`/provider/payments/${payment.id}/status`, { status: newStatus });      
      setPayments(payments.map((p) =>
        p.id === payment.id ? { ...p, status: newStatus } : p
      ));
    } catch (err) {
      console.error("Update Error:", err);
      alert("Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      name: "Student Name",
      selector: (row) => row.user?.name || "Unknown",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="fw-bold">{row.user?.name}</div>
          <small className="text-muted">{row.email}</small>
        </div>
      ),
    },
    {
      name: "Course",
      selector: (row) => row.course?.title,
      sortable: true,
      cell: (row) => (
        <div className="text-truncate" style={{ maxWidth: "200px" }}>
          {row.course?.title || "—"}
        </div>
      ),
    },
    {
      name: "Cohort",
      selector: (row) => row.cohort?.displayName,
      sortable: true,
      cell: (row) => (
        <div>
          <span className="badge bg-light text-dark border-0">
            {row.cohort?.displayName || "—"}
          </span>
        </div>
      ),
    },
    {
      name: "Amount",
      selector: (row) => row.amount,
      sortable: true,
      cell: (row) => `Tsh ${new Intl.NumberFormat().format(row.amount)}`,
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => (
        <span className={`badge ${row.status === "PAID" || row.status === "COMPLETED" ? "bg-success" : "bg-warning text-dark"}`}>
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => {
        const isPaid = row.status === "PAID" || row.status === "COMPLETED";
        const isUpdating = updatingId === row.id;
        return (
          <div className="d-flex gap-2 align-items-center">
            <button
              onClick={() => handleDownload(row.reference)}
              className="btn btn-sm text-white d-flex align-items-center"
              style={{ backgroundColor: "#0a2e67", gap: "5px", fontSize: "13px" }}
            >
              <i className="bi bi-download"></i>
              {isPaid ? "Receipt" : "Invoice"}
            </button>
            {(row.status === "PENDING" || row.status === "COMPLETED") && (
              <button
                onClick={() => handleToggleStatus(row)}
                className="btn btn-sm text-white d-flex align-items-center"
                style={{ backgroundColor: row.status === "PENDING" ? "#28a745" : "#dc3545", gap: "5px", fontSize: "13px" }}
                disabled={isUpdating}
              >
                <i className="bi bi-check-circle"></i>
                {isUpdating ? "..." : row.status === "PENDING" ? "Mark Complete" : "Mark Pending"}
              </button>
            )}
          </div>
        );
      },
      width: "280px",
    },
  ];

  const filteredItems = payments.filter((item) =>
    item.user?.name?.toLowerCase().includes(filterText.toLowerCase()) ||
    item.course?.title?.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <ProviderDashboardLayout title="Invoices & Receipts">
      <div className="card border-0 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            className="form-control form-control-sm w-25"
            placeholder="Search..."
            onChange={(e) => setFilterText(e.target.value)}
          />
          
        </div>
        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          progressPending={loading}
          highlightOnHover
          responsive
          customStyles={{
            headCells: {
              style: {
                backgroundColor: "#f8f9fa",
                color: "#0a2e67",
                fontWeight: "bold",
                fontSize: "14px",
              },
            },
          }}
        />
      </div>
    </ProviderDashboardLayout>
  );
}