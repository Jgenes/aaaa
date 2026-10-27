import { useEffect, useState } from "react";
import DashboardShell from "../../../components/DashboardShell";

const SECTIONS = [
  {
    items: [
      { to: "/provider/dashboard", label: "Overview", icon: "bi-speedometer2" },
      { to: "/provider/course", label: "Trainings", icon: "bi-journal-text" },
      { to: "/provider/all-cohorts", label: "Cohorts", icon: "bi-people" },
      { to: "/provider/all-enrollments", label: "Enrollments", icon: "bi-person-lines-fill" },
      { to: "/provider/invoices", label: "Invoices & receipts", icon: "bi-receipt" },
    ],
  },
  {
    heading: "Insights",
    items: [
      { to: "/provider/reports", label: "Reports", icon: "bi-file-earmark-text" },
      { to: "/provider/review", label: "Reviews", icon: "bi-star" },
      { to: "/provider/social-engagement", label: "Engagement", icon: "bi-graph-up" },
    ],
  },
  {
    heading: "Account",
    items: [
      { to: "/provider/profile", label: "Profile", icon: "bi-person" },
      { to: "/provider/settings", label: "Settings", icon: "bi-gear" },
    ],
  },
];

export default function ProviderDashboardLayout({ title, subtitle, children }) {
  const [user, setUser] = useState(null);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) {
      window.location.href = "/login";
      return;
    }

    try {
      setUser(JSON.parse(savedUser));
    } catch (error) {
      console.error("Imeshindwa kusoma data za user", error);
      logout();
    }
  }, []);

  return (
    <DashboardShell
      eyebrow="Provider workspace"
      title={title}
      subtitle={subtitle}
      sections={SECTIONS}
      user={user}
      onLogout={logout}
    >
      {children}
    </DashboardShell>
  );
}
