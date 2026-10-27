import { useEffect, useState } from "react";
import api from "../api/axio";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatTile = ({ label, value, icon, tone = "" }) => (
  <div className="th-stat">
    <div style={{ minWidth: 0 }}>
      <p className="th-stat__label">{label}</p>
      <p className="th-stat__value">{value}</p>
    </div>
    <span className={`th-stat__icon ${tone}`} aria-hidden="true">
      <i className={`bi ${icon}`}></i>
    </span>
  </div>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalProviders: 0,
    totalRevenue: 0,
    topCourse: "N/A",
  });
  const [revenueData, setRevenueData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        setStats({
          totalCourses: data.totalCourses || 0,
          totalUsers: data.totalUsers || 0,
          totalProviders: data.totalProviders || 0,
          totalRevenue: data.totalRevenue || 0,
          topCourse: data.topEnrolledCourse || "N/A",
        });

        if (data.revenueChart) {
          setRevenueData({
            labels: data.revenueChart.labels,
            datasets: [
              {
                label: "Revenue (TZS)",
                data: data.revenueChart.values,
                borderColor: "#e07a1f",
                backgroundColor: "rgba(224, 122, 31, 0.12)",
                tension: 0.35,
                fill: true,
                pointBackgroundColor: "#e07a1f",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 4,
                borderWidth: 2,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted py-5" role="status">
        <span className="spinner-border" aria-hidden="true"></span>
        Loading platform insights…
      </div>
    );
  }

  return (
    <>
      <div className="th-stat-grid">
        <StatTile label="Total users" value={stats.totalUsers} icon="bi-people-fill" />
        <StatTile
          label="Service providers"
          value={stats.totalProviders}
          icon="bi-building-check"
          tone="th-stat__icon--violet"
        />
        <StatTile
          label="Total courses"
          value={stats.totalCourses}
          icon="bi-journal-bookmark"
          tone="th-stat__icon--orange"
        />
        <StatTile
          label="Total revenue"
          value={`TSh ${stats.totalRevenue.toLocaleString()}`}
          icon="bi-cash-stack"
          tone="th-stat__icon--green"
        />
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <section className="th-chart-card h-100" aria-labelledby="revenue-title">
            <div className="th-chart-card__head">
              <div>
                <h3 className="th-chart-card__title" id="revenue-title">
                  Revenue analytics
                </h3>
                <p className="th-chart-card__sub">Platform revenue collected over time.</p>
              </div>
            </div>
            <div style={{ height: 300 }}>
              <Line
                data={revenueData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "var(--th-navy-900)",
                      titleFont: { family: "Inter", size: 13, weight: "600" },
                      bodyFont: { family: "Inter", size: 12 },
                      padding: 10,
                      cornerRadius: 4,
                      displayColors: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: "#eceae4" },
                      border: { display: false },
                      ticks: { color: "#5f6b7c", font: { family: "Inter", size: 11 } },
                    },
                    x: {
                      grid: { display: false },
                      border: { display: false },
                      ticks: { color: "#5f6b7c", font: { family: "Inter", size: 11 } },
                    },
                  },
                }}
              />
            </div>
          </section>
        </div>

        <div className="col-lg-4">
          <section
            className="h-100 d-flex flex-column justify-content-center text-center"
            style={{
              background: "linear-gradient(160deg, var(--th-navy-900) 0%, #124a8f 100%)",
              color: "#fff",
              padding: "clamp(1.5rem, 1.2rem + 1vw, 2rem)",
            }}
            aria-labelledby="top-course-title"
          >
            <i
              className="bi bi-trophy mb-3"
              style={{ fontSize: 44, color: "#ffd591" }}
              aria-hidden="true"
            ></i>
            <p
              className="mb-1 text-uppercase"
              style={{ fontSize: "var(--th-fs-2xs)", letterSpacing: "0.08em", opacity: 0.75 }}
            >
              Most popular course
            </p>
            <h3
              className="mb-2"
              id="top-course-title"
              style={{ color: "#fff", fontSize: "var(--th-fs-lg)" }}
            >
              {stats.topCourse}
            </h3>
            <p className="mb-0" style={{ fontSize: "var(--th-fs-sm)", opacity: 0.75 }}>
              Highest enrolment rate this month
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
