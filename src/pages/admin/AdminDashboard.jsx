import React from "react";
import AdminDashboardLayout from "./layouts/AdminDashboardLayout"; // Hakikisha path ni sahihi
import AdminDashboardCard from "../../components/AdminDashbiardCards";

export default function AdminDashboard() {
  return (
    // LAZIMA kadi ziwe ndani ya Layout hivi
    <AdminDashboardLayout title="Admin Insights">
      <AdminDashboardCard />
    
    </AdminDashboardLayout>
  );
}