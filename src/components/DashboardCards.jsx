import React, { useEffect, useState } from "react";
import api from "../api/axio"; // Hakikisha unatumia axios instance yako
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

/* ===== STAT CARD COMPONENT (STYLE YAKO) ===== */
const StatCard = ({ title, value, icon }) => (
  <div className="col-md-3">
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted mb-1 small">{title}</p>
          <h3 className="fw-bold mb-0">{value}</h3>
        </div>
        <i
          className={`bi ${icon}`}
          style={{
            fontSize: "30px",
            color: "#6c757d",
          }}
        ></i>
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
        const res = await api.get("/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;

        // 1. Set Stat Cards
        setStats({
          totalCourses: data.totalCourses,
          cohorts: data.totalCohorts,
          enrollments: data.totalEnrollments,
          onProgress: data.ongoingTrainings,
        });

        // 2. Set Chart Data (Real data kutoka DB)
        setChartData({
          labels: data.chart.labels, // Mfano: ["Jan", "Feb", ...] au majina ya kozi
          datasets: [
            {
              label: "Enrollments",
              data: data.chart.values,
              borderColor: "rgba(13,110,253,0.9)",
              backgroundColor: "rgba(13,110,253,0.15)",
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-5 text-center">Loading Dashboard...</div>;

  return (
    <div className="container-fluid mt-4">
      {/* ===== STATS (USING REAL DATA) ===== */}
      <div className="row g-3 mb-4">
        <StatCard title="Total Courses" value={stats.totalCourses} icon="bi-journal-text" />
        <StatCard title="Total Cohorts" value={stats.cohorts} icon="bi-calendar-event" />
        <StatCard title="Enrollments" value={stats.enrollments} icon="bi-people" />
        <StatCard title="Ongoing Trainings" value={stats.onProgress} icon="bi-lightning-charge" />
      </div>

      {/* ===== CHART (USING REAL DATA) ===== */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold text-center mb-3">Training Enrollment Overview</h6>
          <div style={{ height: "260px" }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "bottom" },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}