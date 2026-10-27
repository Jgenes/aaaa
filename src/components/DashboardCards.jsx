import { useEffect, useState } from "react";
import api from "../api/axio";
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
import { Line } from "react-chartjs-2";

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

const StatTile = ({ label, value, icon, tone = "" }) => (
  <div className="th-stat">
    <div>
      <p className="th-stat__label">{label}</p>
      <p className="th-stat__value">{value}</p>
    </div>
    <span className={`th-stat__icon ${tone}`} aria-hidden="true">
      <i className={`bi ${icon}`}></i>
    </span>
  </div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    cohorts: 0,
    enrollments: 0,
    onProgress: 0,
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

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
          cohorts: data.totalCohorts || 0,
          enrollments: data.totalEnrollments || 0,
          onProgress: data.ongoingTrainings || 0,
        });

        if (data.chart) {
          setChartData({
            labels: data.chart.labels,
            datasets: [
              {
                label: "Enrolments",
                data: data.chart.values,
                borderColor: "#0b1d33",
                backgroundColor: "rgba(11, 29, 51, 0.08)",
                tension: 0.35,
                fill: true,
                pointBackgroundColor: "#0b1d33",
                pointBorderColor: "#ffffff",
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
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
        Loading system analytics…
      </div>
    );
  }

  return (
    <>
      <div className="th-stat-grid">
        <StatTile label="Total trainings" value={stats.totalCourses} icon="bi-journal-bookmark" />
        <StatTile label="Active cohorts" value={stats.cohorts} icon="bi-calendar3" tone="th-stat__icon--green" />
        <StatTile label="Enrolments" value={stats.enrollments} icon="bi-people" tone="th-stat__icon--orange" />
        <StatTile label="Ongoing projects" value={stats.onProgress} icon="bi-activity" tone="th-stat__icon--violet" />
      </div>

      <section className="th-chart-card" aria-labelledby="trend-title">
        <div className="th-chart-card__head">
          <div>
            <h3 className="th-chart-card__title" id="trend-title">
              Enrolment trends
            </h3>
            <p className="th-chart-card__sub">
              Trainee registrations over time across your cohorts.
            </p>
          </div>
        </div>

        <div style={{ height: 300 }}>
          <Line
            data={chartData}
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
    </>
  );
}
