import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardShell from "../../../components/DashboardShell";
import {
  clearSession,
  isAuthenticated,
  loginPathFor,
  readUser,
} from "../../../lib/session";

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
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    // Drafts and the "where you left off" marker live on, so signing back in
    // resumes the same screen instead of dumping the user on a generic home.
    const target = `${location.pathname}${location.search}`;
    clearSession();
    navigate(loginPathFor(target), { replace: true });
  };

  useEffect(() => {
    const sessionUser = readUser();

    if (!isAuthenticated() || !sessionUser) {
      clearSession();
      // Remember the page so signing back in returns here, not to a generic home.
      navigate(loginPathFor(`${location.pathname}${location.search}`), { replace: true });
      return;
    }

    setUser(sessionUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
