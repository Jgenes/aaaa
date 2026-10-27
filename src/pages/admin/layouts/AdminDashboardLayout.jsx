import { useEffect, useState } from "react";
import DashboardShell from "../../../components/DashboardShell";
import api from "../../../api/axio";

export default function AdminDashboardLayout({ title, subtitle, children }) {
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({
    providers: 0,
    courses: 0,
    transactions: 0,
    reports: 0,
    logs: 0,
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const fetchCounts = async () => {
    try {
      const res = await api.get("/admin/notifications/count");
      if (res.data) setCounts(res.data);
    } catch (error) {
      console.error("Notification fetch error", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      const userData = JSON.parse(savedUser);
      setUser(userData);

      fetchCounts();
      const interval = setInterval(fetchCounts, 120000);
      return () => clearInterval(interval);
    } catch (error) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sections = [
    {
      items: [
        { to: "/admin/dashboard", label: "Overview", icon: "bi-speedometer2" },
        { to: "/admin/providers", label: "Providers", icon: "bi-building", badge: counts.providers },
        { to: "/admin/courses", label: "Courses", icon: "bi-book", badge: counts.courses },
        {
          to: "/admin/transactions",
          label: "Transactions",
          icon: "bi-credit-card",
          badge: counts.transactions,
        },
      ],
    },
    {
      heading: "Reports",
      items: [
        { to: "/admin/reports", label: "Reports", icon: "bi-bar-chart", badge: counts.reports },
        { label: "Logs", icon: "bi-terminal", disabled: true },
      ],
    },
    {
      heading: "Account",
      items: [{ to: "/provider/settings", label: "Settings", icon: "bi-gear" }],
    },
  ];

  return (
    <DashboardShell
      eyebrow="Administration"
      title={title}
      subtitle={subtitle}
      sections={sections}
      user={user}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}
