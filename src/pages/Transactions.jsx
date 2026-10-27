import { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const TABS = ["All", "Paid", "Pending"];

const isPaid = (status) => status === "COMPLETED" || status === "PAID";

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
        const data = res.data?.data || res.data;
        const list = Array.isArray(data) ? data : [];
        setPayments(list);
        setFilteredPayments(list);
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
      result = result.filter((p) => isPaid(p.status));
    } else if (activeTab === "Pending") {
      result = result.filter((p) => p.status === "PENDING");
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const title = (p.course?.title || p.course?.name || "").toString().toLowerCase();
        const ref = (p.reference || "").toString().toLowerCase();
        return title.includes(q) || ref.includes(q);
      });
    }
    setFilteredPayments(result);
  }, [searchTerm, activeTab, payments]);

  const handleDownload = (reference) => {
    window.open(`http://localhost:8000/api/download-document/${reference}`, "_blank");
  };

  return (
    <>
      <NavBar />

      <main id="main-content">
        <section className="th-page-hero">
          <div className="th-container-wide">
            <nav aria-label="Breadcrumb">
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Transactions
                </li>
              </ol>
            </nav>
            <h1 className="mb-2" style={{ fontSize: "clamp(1.6rem, 1.3rem + 1.3vw, 2.1rem)" }}>
              My transactions
            </h1>
            <p className="th-section-lead">
              A record of every invoice and receipt for your TrainHub TZ enrolments.
            </p>
          </div>
        </section>

        <div className="th-container-wide th-section-tight">
          <div className="th-toolbar">
            <div className="th-segmented" role="group" aria-label="Filter transactions">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={activeTab === tab}
                  className={activeTab === tab ? "is-active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="th-search-field">
              <i className="bi bi-search" aria-hidden="true"></i>
              <label htmlFor="transaction-search" className="visually-hidden">
                Search transactions
              </label>
              <input
                id="transaction-search"
                type="search"
                placeholder="Search course or reference…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="d-flex align-items-center gap-2 text-muted py-5" role="status">
              <span className="spinner-border" aria-hidden="true"></span>
              Loading your transactions…
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="th-empty">
              <span className="th-empty__icon">
                <i className="bi bi-receipt" aria-hidden="true"></i>
              </span>
              <p className="th-empty__title">No transactions to show</p>
              <p className="th-empty__text">
                Once you enrol in a training, your invoices and receipts will appear here.
              </p>
              <a href="/trainings" className="btn btn-primary">
                Browse trainings
              </a>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="table-responsive d-none d-lg-block">
                <table className="table table-hover align-middle">
                  <caption className="visually-hidden">
                    Your invoices and receipts, newest first
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Status</th>
                      <th scope="col">Training</th>
                      <th scope="col">Cohort</th>
                      <th scope="col">Reference</th>
                      <th scope="col" className="text-end">
                        Amount
                      </th>
                      <th scope="col" className="text-end">
                        Document
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => {
                      const paid = isPaid(payment.status);
                      return (
                        <tr key={payment.id}>
                          <td>
                            <span
                              className={`th-status ${
                                paid ? "th-status--success" : "th-status--warning"
                              }`}
                            >
                              {paid ? "Paid" : "Pending"}
                            </span>
                          </td>
                          <td style={{ minWidth: 200 }}>
                            {payment.course?.title ||
                              payment.course?.name ||
                              payment.course?.course_title ||
                              "N/A"}
                          </td>
                          <td className="text-muted">
                            {payment.cohort?.intake_name ||
                              payment.cohort?.name ||
                              payment.cohort?.intake?.name ||
                              "N/A"}
                          </td>
                          <td>
                            <code>
                              {payment.reference}
                            </code>
                          </td>
                          <td className="text-end fw-semibold">
                            Tsh {new Intl.NumberFormat().format(payment.amount)}
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-outline-dark btn-sm"
                              onClick={() => handleDownload(payment.reference)}
                            >
                              <i className="bi bi-download" aria-hidden="true"></i>
                              {paid ? "Receipt" : "Invoice"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="d-lg-none d-flex flex-column gap-3">
                {filteredPayments.map((payment) => {
                  const paid = isPaid(payment.status);
                  return (
                    <article className="th-panel" key={payment.id}>
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <span
                          className={`th-status ${
                            paid ? "th-status--success" : "th-status--warning"
                          }`}
                        >
                          {paid ? "Paid" : "Pending"}
                        </span>
                        <strong>
                          Tsh {new Intl.NumberFormat().format(payment.amount)}
                        </strong>
                      </div>
                      <h2
                        className="mb-1"
                        style={{ fontSize: "var(--th-fs-sm)", fontWeight: 700 }}
                      >
                        {payment.course?.title ||
                          payment.course?.name ||
                          payment.course?.course_title ||
                          "N/A"}
                      </h2>
                      <p
                        className="text-muted mb-1"
                      >
                        Cohort:{" "}
                        {payment.cohort?.intake_name ||
                          payment.cohort?.name ||
                          payment.cohort?.intake?.name ||
                          "N/A"}
                      </p>
                      <p className="text-muted mb-3">
                        Ref: {payment.reference}
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-dark btn-sm w-100"
                        onClick={() => handleDownload(payment.reference)}
                      >
                        <i className="bi bi-download" aria-hidden="true"></i>
                        Download {paid ? "receipt" : "invoice"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
