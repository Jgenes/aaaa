import { useState, useEffect } from "react";
import api from "../../api/axio";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";

export default function ProviderInvoices() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    fetchProviderPayments();
  }, []);

  const fetchProviderPayments = async () => {
    try {
      const res = await api.get("/provider/payments");
      setPayments(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching provider payments:", err);
      setLoading(false);
    }
  };

  const handleDownload = (reference) => {
    const baseUrl = "http://localhost:8000/api";
    const finalUrl = `${baseUrl}/download-document/${reference}`;
    window.open(finalUrl, "_blank");
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
      name: "Course & Cohort",
      selector: (row) => row.course?.title,
      sortable: true,
      cell: (row) => (
        <div>
          <div className="text-truncate" style={{ maxWidth: "150px" }}>
            {row.course?.title}
          </div>
          <span className="badge bg-light text-dark border-0">
            {row.cohort?.name}
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
        <span
          className={`badge ${row.status === "PAID" || row.status === "COMPLETED" ? "bg-success" : "bg-warning text-dark"}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => {
        // Logic ya kubadilisha maandishi kulingana na status
        const isPaid = row.status === "PAID" || row.status === "COMPLETED";
        return (
          <button
            onClick={() => handleDownload(row.reference)}
            className="btn btn-sm text-white d-flex align-items-center"
            style={{ backgroundColor: "#0a2e67", gap: "5px", fontSize: "13px" }}
          >
            <i className="bi bi-download"></i>
            {isPaid ? "Receipt" : "Invoice"}
          </button>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "130px", // Iongeze kidogo nafasi ili icon na maandishi vikae sawa
    },
  ];

  const filteredItems = payments.filter(
    (item) =>
      item.user?.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.course?.title?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.reference?.toLowerCase().includes(filterText.toLowerCase()),
  );

  return (
    <ProviderDashboardLayout title="Invoices & Receipts">
      <div className="card border-0 shadow-sm p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>
            Transaction History
          </h5>
          <input
            type="text"
            className="form-control form-control-sm w-25"
            placeholder="Search student or course..."
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>

        <DataTable
          columns={columns}
          data={filteredItems}
          pagination
          progressPending={loading}
          highlightOnHover
          pointerOnHover
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
