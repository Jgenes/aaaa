import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

export default function Transactions() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8000/api/my-payments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPayments(res.data);
        setFilteredPayments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = payments;
    if (activeTab === "Paid") {
      result = result.filter(
        (p) => p.status === "COMPLETED" || p.status === "PAID",
      );
    } else if (activeTab === "Pending") {
      result = result.filter((p) => p.status === "PENDING");
    }
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.course?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.reference.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    setFilteredPayments(result);
  }, [searchTerm, activeTab, payments]);

  const handleDownload = (reference) => {
    window.open(
      `http://localhost:8000/api/download-document/${reference}`,
      "_blank",
    );
  };

  return (
    <>
      <NavBar />
      <div className="container py-5" style={{ minHeight: "80vh" }}>
        <header className="mb-4">
          <h1
            className="fw-bold"
            style={{ fontSize: "20px", color: "#111827" }}
          >
            My Transactions
          </h1>
          <p
            className="text-secondary"
            style={{ fontSize: "13px", color: "#111827" }}
          >
            List of all your invoices & receipts
          </p>
        </header>

        {/* Search & Tabs Section */}
        <div className="row g-3 mb-4 align-items-center">
          <div className="col-md-6">
            <div className="btn-group shadow-sm" role="group">
              {["All", "Paid", "Pending"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`btn ${activeTab === tab ? "btnPrimary1" : "btn-outline-custom"}`}
                  style={{ transition: "all 0.3s ease" }} // Hiari: kwa ajili ya smoothness
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="col-md-4 ms-auto">
            <input
              type="text"
              placeholder="Search course or ref..."
              className="form-control shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List Section */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="card shadow-sm border-0 py-5 text-center">
            <p className="text-muted mb-0">No payment occured!</p>
          </div>
        ) : (
          <div className="row row-cols-1 g-3">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="col">
                <div className="card h-100 shadow-sm border-0 border-start border-4 leftB p-3">
                  <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                    <div className="mb-3 mb-md-0">
                      <div className="d-flex align-items-center mb-2">
                        <span
                          className={`badge me-2 ${payment.status === "COMPLETED" ? "bg-success" : "bg-danger"}`}
                        >
                          {payment.status === "COMPLETED" ||
                          payment.status === "PAID"
                            ? "PAID"
                            : "PENDING"}
                        </span>
                        <small className="text-muted fw-bold">
                          Ref: {payment.reference}
                        </small>
                      </div>
                      <h5 className="card-title fw-bold mb-1">
                        {payment.course?.title}
                      </h5>
                      <p className="card-text text-muted mb-0 small">
                        Cohort: {payment.cohort?.name}
                      </p>
                    </div>

                    <div className="text-md-end">
                      <h4
                        className="fw-black mb-3"
                        style={{ fontSize: "18px", color: "#111827" }}
                      >
                        Tsh {new Intl.NumberFormat().format(payment.amount)}
                      </h4>
                      <button
                        onClick={() => handleDownload(payment.reference)}
                        className="btn shadow-sm px-4 btnz"
                      >
                        <i className="bi bi-download me-2"></i>
                        {payment.status === "COMPLETED" ||
                        payment.status === "PAID"
                          ? "Download Receipt"
                          : "Download Invoice"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
