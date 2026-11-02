import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardShell from "../../../components/DashboardShell";
import api from "../../../api/axio";
import {
  clearSession,
  isAuthenticated,
  loginPathFor,
  readUser,
} from "../../../lib/session";

export default function AdminDashboardLayout({ title, subtitle, children }) {
  const [user, setUser] = useState(null);
  const [counts, setCounts] = useState({
    providers: 0,
    courses: 0,
    transactions: 0,
    reports: 0,
    logs: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    const target = `${location.pathname}${location.search}`;
    clearSession();
    navigate(loginPathFor(target), { replace: true });
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
    const sessionUser = readUser();

    if (!isAuthenticated() || !sessionUser) {
      clearSession();
      // Come back to this exact screen after signing in again.
      navigate(loginPathFor(`${location.pathname}${location.search}`), { replace: true });
      return;
    }

    setUser(sessionUser);
    fetchCounts();
    const interval = setInterval(fetchCounts, 120000);
    return () => clearInterval(interval);
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
