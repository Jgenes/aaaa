import React, { useEffect, useState } from "react";
import api from "../api/axio"; 
import { Line, Bar } from "react-chartjs-2";
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

/* ===== STAT CARD COMPONENT ===== */
const StatCard = ({ title, value, icon, color = "#6c757d" }) => (
  <div className="col-md-3 mb-3">
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted mb-1 small fw-bold">{title}</p>
          <h3 className="fw-bold mb-0">{value}</h3>
        </div>
        <i className={`bi ${icon}`} style={{ fontSize: "28px", color: color }}></i>
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalProviders: 0,
    totalRevenue: 0,
    topCourse: "N/A"
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

        // 1. Set Stat Cards (User status, Providers, etc.)
        setStats({
          totalCourses: data.totalCourses,
          totalUsers: data.totalUsers, // Users wenye status ya 'user'
          totalProviders: data.totalProviders, // Tenants wenye role ya 'provider'
          totalRevenue: data.totalRevenue,
          topCourse: data.topEnrolledCourse // Jina la kozi yenye enrollment kubwa
        });

        // 2. Set Revenue Chart Data
        setRevenueData({
          labels: data.revenueChart.labels, 
          datasets: [
            {
              label: "Revenue (TZS)",
              data: data.revenueChart.values,
              borderColor: "#198754",
              backgroundColor: "rgba(25, 135, 84, 0.1)",
              tension: 0.3,
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
      <a href="/admin/providers">Providers</a>
            <a href="/admin/courses">Courses & Cohorts</a>
            <a href="/admin/transactions">Transactions</a>
<a href="/admin/reports">Reports</a>
      {/* ===== STATS ROW 1 ===== */}
      <div className="row g-3 mb-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon="bi-people-fill" color="#0d6efd" />
        <StatCard title="Service Providers" value={stats.totalProviders} icon="bi-building-check" color="#6610f2" />
        <StatCard title="Total Courses" value={stats.totalCourses} icon="bi-journal-bookmark" color="#fd7e14" />
        <StatCard title="Total Revenue" value={`TSh ${stats.totalRevenue.toLocaleString()}`} icon="bi-cash-stack" color="#198754" />
      </div>

      <div className="row">
        {/* ===== REVENUE ANALYTICS ===== */}
        <div className="col-lg-8 mb-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Revenue Analytics</h6>
              <div style={{ height: "300px" }}>
                <Line
                  data={revenueData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ===== TOP ENROLLMENT INFO ===== */}
        <div className="col-lg-4 mb-4">
          <div className="card shadow-sm border-0 h-100 bg-primary text-white">
            <div className="card-body d-flex flex-column justify-content-center align-items-center text-center">
              <i className="bi bi-trophy mb-3" style={{ fontSize: "50px" }}></i>
              <h6 className="text-uppercase small">Most Popular Course</h6>
              <h4 className="fw-bold">{stats.topCourse}</h4>
              <p className="mb-0 mt-2 opacity-75">Highest enrollment rate this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}