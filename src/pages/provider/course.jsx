import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 1. Tumeongeza useNavigate
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import DataTable from "react-data-table-component";
import { FaEye, FaEdit, FaTrash, FaCogs, FaPlus } from "react-icons/fa";
import api from "../../api/axio";

export default function ProviderDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");

  const navigate = useNavigate(); // 2. Tunatengeneza 'dereva' wa kukupeleka page zingine

  // Kuvuta data kutoka Laravel
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/courses");
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setLoading(false);
    }
  };

  // Filter data kulingana na search
  const filteredData = courses.filter(
    (item) =>
      item.title?.toLowerCase().includes(filterText.toLowerCase()) ||
      item.category?.toLowerCase().includes(filterText.toLowerCase()),
  );

  // --- HAPA NDIPO MAREKEBISHO YAKO YALIPO ---

  // Kuelekea kwenye View Course Page
  const handleView = (course) => {
    navigate(`/provider/viewCourse/${course.id}`);
  };

  // Kuelekea kwenye Manage Cohorts Page
  const handleManage = (course) => {
    navigate(`/provider/cohortlist/${course.id}`);
  };

  // Kuelekea kwenye Edit Page
  const handleEdit = (course) => {
    navigate(`/provider/editCourse/${course.id}`);
  };

  const handleDelete = async (course) => {
    if (window.confirm(`Are you sure you want to delete ${course.title}?`)) {
      try {
        await api.delete(`/courses/${course.id}`);
        fetchCourses();
        alert("Deleted successfully!");
      } catch (error) {
        alert("Failed to delete course.");
      }
    }
  };

  // Columns
  const columns = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "70px" },
    { name: "Course Name", selector: (row) => row.title, sortable: true },
    { name: "Category", selector: (row) => row.category, sortable: true },
    { name: "Mode", selector: (row) => row.mode, sortable: true },
    { name: "Status", selector: (row) => row.status, sortable: true },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {/* VIEW BUTTON */}
          <button
            className="btn btn-sm btn-info"
            onClick={() => handleView(row)}
            title="View Details"
          >
            <FaEye style={{ color: "white" }} />
          </button>

          {/* MANAGE COHORTS */}
          <button
            className="btn btn-sm btn-warning"
            onClick={() => handleManage(row)}
            title="Manage Cohorts"
          >
            <FaCogs style={{ color: "white" }} />
          </button>

          {/* EDIT BUTTON */}
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleEdit(row)}
            title="Edit Course"
          >
            <FaEdit style={{ color: "white" }} />
          </button>

          {/* DELETE BUTTON */}
          <button
            className="btn btn-sm btn-danger"
            onClick={() => handleDelete(row)}
            title="Delete Course"
          >
            <FaTrash style={{ color: "white" }} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <ProviderDashboardLayout title="Courses">
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-12">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">My Courses</h5>

              <div className="d-flex gap-2">
                <input
                  type="text"
                  placeholder="Search by title or category..."
                  className="form-control w-auto"
                  style={{ minWidth: "250px" }}
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />

                <button
                  className="btn btn-sm btn-success d-flex align-items-center gap-1"
                  onClick={() => navigate("/provider/createCourse")}
                >
                  <FaPlus />
                  Create Course
                </button>
              </div>
            </div>

            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              highlightOnHover
              striped
              responsive
              progressPending={loading}
              noDataComponent="No courses found. Create your first course!"
            />
          </div>
        </div>
      </div>
    </ProviderDashboardLayout>
  );
}
