import React from "react";
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

/* ===== STAT CARD COMPONENT ===== */
const StatCard = ({ title, value, icon }) => (
  <div className="col-md-3">
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted mb-1 small">{title}</p>
          <h3 className="fw-bold mb-0">{value}</h3>
        </div>

        {/* ICON (NO BACKGROUND) */}
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
  const stats = {
    totalCourses: 45,
    cohorts: 12,
    enrollments: 350,
    onProgress: 120,
  };

  const trainingData = {
    labels: ["Cybersecurity", "Cloud", "Python", "DevOps", "AI/ML"],
    datasets: [
      {
        label: "Enrollments",
        data: [120, 80, 90, 60, 110],
        borderColor: "rgba(13,110,253,0.9)",
        backgroundColor: "rgba(13,110,253,0.15)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="container-fluid mt-4">
      {/* ===== STATS ===== */}
      <div className="row g-3 mb-4">
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon="bi-journal-text"
        />

        <StatCard
          title="Total Cohorts"
          value={stats.cohorts}
          icon="bi-calendar-event"
        />

        <StatCard
          title="Enrollments"
          value={stats.enrollments}
          icon="bi-people"
        />

        <StatCard
          title="Ongoing Trainings"
          value={stats.onProgress}
          icon="bi-lightning-charge"
        />
      </div>

      {/* ===== CHART ===== */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h6 className="fw-bold text-center mb-3">
            Training Enrollment Overview
          </h6>

          <div style={{ height: "260px" }}>
            <Line
              data={trainingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
