import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import Dashboard from "../../components/DashboardCards";

export default function ProviderDashboard() {
  return (
    <ProviderDashboardLayout title="Dashboard">
      <Dashboard />
    </ProviderDashboardLayout>
  );
}
