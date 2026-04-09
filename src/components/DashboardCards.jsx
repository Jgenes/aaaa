import React, { useEffect, useState } from "react";
import api from "../api/axio"; 
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/* ===== STAT CARD COMPONENT (MSIMAMO WA SQUARE + BORDER-START) ===== */
const StatCard = ({ title, value, icon, color = "#0d6efd" }) => (
  <div className="col-md-3 mb-3">
    <div 
      className="card shadow-sm border-0 h-100 border-start border-4" 
      style={{ 
        borderRadius: "0px", // Sharp corners kama ulivyoelekeza
        borderLeftColor: `${color} !important` 
      }}
    >
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted mb-1 text-uppercase fw-bold" style={{ fontSize: "10px", letterSpacing: "0.5px" }}>{title}</p>
          <h3 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>{value}</h3>
        </div>
        <div className="bg-light p-2" style={{ borderRadius: "0px" }}>
            <i className={`bi ${icon}`} style={{ fontSize: "24px", color: color }}></i>
        </div>
      </div>
    </div>
  </div>
);

/* ===== MAIN DASHBOARD ===== */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    cohorts: 0,
    enrollments: 0,
    onProgress: 0,
  });

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        // Ikiwa token haipo, hapa itashindwa, hakikisha user amelog-in
        const res = await api.get("/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        // 1. Set Stat Cards kulingana na API response yako
        setStats({
          totalCourses: data.totalCourses || 0,
          cohorts: data.totalCohorts || 0,
          enrollments: data.totalEnrollments || 0,
          onProgress: data.ongoingTrainings || 0,
        });

        // 2. Set Chart Data (Modern Line Chart)
        if (data.chart) {
            setChartData({
              labels: data.chart.labels,
              datasets: [
                {
                  label: "Enrollments",
                  data: data.chart.values,
                  borderColor: "#0a2e67", // Rangi yako ya Blue
                  backgroundColor: "rgba(10, 46, 103, 0.1)",
                  tension: 0.4, // Inafanya line iwe smooth (modern look)
                  fill: true,
                  pointBackgroundColor: "#0a2e67",
                  pointRadius: 4,
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

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
        <div className="spinner-border text-primary border-2" role="status"></div>
        <span className="ms-2 text-muted">Loading System Analytics...</span>
    </div>
  );

  return (
    <div className="container-fluid mt-4">
      <h5 className="fw-bold mb-4" style={{ color: "#0a2e67" }}>Dashboard Overview</h5>

      {/* ===== STATS (SQUARE STYLE + BORDER ACCENTS) ===== */}
      <div className="row g-3 mb-4">
        <StatCard title="Total Courses" value={stats.totalCourses} icon="bi-journal-bookmark" color="#0d6efd" />
        <StatCard title="Active Cohorts" value={stats.cohorts} icon="bi-calendar3" color="#198754" />
        <StatCard title="Total Enrollments" value={stats.enrollments} icon="bi-people" color="#0dcaf0" />
        <StatCard title="Ongoing Projects" value={stats.onProgress} icon="bi-activity" color="#6f42c1" />
      </div>

      {/* ===== CHART AREA ===== */}
      <div className="row">
        <div className="col-12">
            <div className="card shadow-sm border-0" style={{ borderRadius: "0px" }}>
                <div className="card-header bg-white border-0 pt-4 px-4">
                    <h6 className="fw-bold mb-0" style={{ color: "#0a2e67" }}>Training Enrollment Trends</h6>
                    <small className="text-muted">Visual analysis of trainee registration over time</small>
                </div>
                <div className="card-body px-4">
                    <div style={{ height: "300px" }}>
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false }, // Tunatumia title ya kadi badala ya legend
                                    tooltip: {
                                        backgroundColor: "#0a2e67",
                                        titleFont: { size: 14 },
                                        bodyFont: { size: 13 },
                                        padding: 12,
                                        cornerRadius: 0 // Sharp tooltips
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        grid: { color: "#f0f0f0" },
                                        ticks: { color: "#9ca3af" }
                                    },
                                    x: {
                                        grid: { display: false },
                                        ticks: { color: "#9ca3af" }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}