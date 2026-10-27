import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaTrash, FaCogs, FaPlus, FaSearch, FaBook } from "react-icons/fa";
import { MdAddCircleOutline } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";
import "react-toastify/dist/ReactToastify.css";

import { tableStyles } from "../../lib/tableStyles";
export default function ProviderDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (error) {
      toast.error("Network error: Could not load courses.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (course) => {
    if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
      try {
        await api.delete(`/courses/${course.id}`);
        toast.success("Course deleted successfully.");
        fetchCourses();
      } catch (error) {
        toast.error("Failed to delete course.");
      }
    }
  };

  const filteredData = courses.filter(
    (item) =>
      item.title?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.category?.toLowerCase().includes(filterText.toLowerCase())
  );

  // Custom Styles kufuata Design System yetu

  const columns = [
    {
      name: "Training Details",
      selector: (row) => row.title,
      sortable: true,
      cell: (row) => (
        <div className="py-3">
          <div className="fw-bold" style={{ color: "#2d3748" }}>{row.title}</div>
          <small className="text-muted">{row.category}</small>
        </div>
      ),
      grow: 2,
    },
    {
      name: "Mode",
      selector: (row) => row.mode,
      sortable: true,
      cell: (row) => (
        <span className="badge bg-light text-dark border px-2 py-1">
          {row.mode}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        const status = row.status?.toUpperCase();
        return (
          <span className="fw-bold" style={{ 
            fontSize: "12px", 
            color: status === "ACTIVE" || status === "OPEN" ? "var(--th-success)" : "#95a5a6" 
          }}>
            ● {status || "N/A"}
          </span>
        );
      },
    },
    {
      name: "Actions",
      right: true,
      cell: (row) => (
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary border-0" onClick={() => navigate(`/provider/course/${row.id}/enrollments`)} title="Enrollments">
            <MdAddCircleOutline size={20} />
          </button>
          <button className="btn btn-sm btn-outline-info border-0" onClick={() => navigate(`/provider/viewCourse/${row.id}`)} title="View">
            <FaEye size={16} />
          </button>
          <button className="btn btn-sm btn-outline-warning border-0" onClick={() => navigate(`/provider/cohorts/${row.id}`)} title="Cohorts">
            <FaCogs size={16} />
          </button>
          <button className="btn btn-sm btn-outline-primary border-0" onClick={() => navigate(`/provider/editCourse/${row.id}`)} title="Edit">
            <FaEdit size={16} />
          </button>
          <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(row)} title="Delete">
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ProviderDashboardLayout title="Training Management">
      <ToastContainer position="top-right" theme="colored" />
      

      <div>
        {/* Header Area */}
        <div className="mb-4">
          <h4 className="fw-bold" style={{ color: "var(--th-primary)" }}>My Training Programs</h4>
          <p className="text-muted small">Manage your courses, intakes, and enrollments in one place.</p>
        </div>

        {/* Action Bar (Search & Create) */}
        <div className="action-section shadow-sm">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="position-relative">
              <FaSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" size={13} />
              <input aria-label="Find training or category"
                type="text"
                className="form-control search-input"
                placeholder="Find training or category..."
                style={{ minWidth: "280px" }}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
            <button className="btn-add d-flex align-items-center gap-2" onClick={() => navigate("/provider/createCourse")}>
              <FaPlus size={12} /> New Training
            </button>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="table-container shadow-sm">
          <DataTable
            columns={columns}
            data={filteredData}
            pagination
            highlightOnHover
            responsive
            customStyles={tableStyles}
            progressPending={loading}
            noDataComponent={
              <div className="p-5 text-center text-muted">
                <FaBook size={30} className="mb-3 opacity-25" />
                <p className="small">No training programs found.</p>
              </div>
            }
          />
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}