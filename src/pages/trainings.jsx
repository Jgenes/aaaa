import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import api from "../api/axio";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Training() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    name: "",
    category: "",
    trainer: "",
    date: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/training");
      const rawData = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setCourses(rawData);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  const courseList = courses.map((course) => {
    const activeCohort =
      course.cohorts?.find((c) => c.status?.toUpperCase() === "OPEN") || course.cohorts?.[0];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = activeCohort
      ? new Date(activeCohort.registration_deadline)
      : null;
    
    const isPastDeadline = deadline ? deadline < today : false;
    
    const isFull = activeCohort
      ? (Number(activeCohort.capacity) - Number(activeCohort.seats_taken)) <= 0
      : false;

    return {
      ...course,
      mainCohort: activeCohort,
      isEnrolled: course.is_enrolled || false,
      enrollmentOpen:
        activeCohort &&
        activeCohort.status?.toUpperCase() === "OPEN" &&
        !isPastDeadline &&
        !isFull,
      isFull: isFull,
      isPastDeadline: isPastDeadline
    };
  });

  const filteredCourses = courseList.filter((course) => {
    const nameMatch = (course.title || "")
      .toLowerCase()
      .includes(filters.name.toLowerCase());
    const categoryMatch = filters.category
      ? course.category === filters.category
      : true;
    const trainerMatch = filters.trainer
      ? course.provider?.name === filters.trainer
      : true;
    const dateMatch = filters.date
      ? course.mainCohort?.start_date === filters.date
      : true;
    
    return nameMatch && categoryMatch && trainerMatch && dateMatch;
  });

  const categories = [
    ...new Set(courseList.map((c) => c.category).filter(Boolean)),
  ];
  const trainers = [
    ...new Set(courseList.map((c) => c.provider?.name).filter(Boolean)),
  ];

  // ================= COURSE ITEM COMPONENT (STYLE KAMA YA HOME) =================
  const CourseItem = ({ course }) => {
    const finalImageUrl = course.banner 
      ? `http://localhost:8000/${course.banner}` 
      : "https://via.placeholder.com/400x200?text=No+Image";
    
    const isEnrolled = course.isEnrolled;

    return (
      <div className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm border-0 course-card-animated" style={{ borderRadius: "15px", overflow: "hidden" }}>
          <img 
            src={finalImageUrl} 
            className="card-img-top" 
            style={{ height: "160px", objectFit: "cover" }} 
            alt={course.title} 
          />
          <div className="card-body d-flex flex-column p-3">
            <h6 className="fw-bold mb-2" style={{ fontSize: "14px", height: "40px", overflow: "hidden" }}>
              {course.title}
            </h6>
            
            <div className="d-flex align-items-center mb-3">
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: "30px", height: "30px", fontSize: "12px", border: "1px solid #ddd", overflow: "hidden" }}>
                {course.provider?.logo ? (
                  <img src={`http://localhost:8000/storage/uploads/${course.provider.logo}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="L" />
                ) : (
                  course.provider?.name?.charAt(0) || "T"
                )}
              </div>
              <small className="text-muted text-truncate">{course.provider?.name || "Instructor"}</small>
            </div>
            
            <div className="mt-auto">
              <button 
                onClick={() => {
                  if (isEnrolled) {
                    navigate(`/learning/${course.id}`);
                  } else {
                    navigate(`/course/${course.id}`);
                  }
                }} 
                className="btn w-100 d-flex align-items-center justify-content-center custom-enroll-btn" 
                style={{ 
                  backgroundColor: "#f8f9fa", 
                  color: "#000", 
                  fontSize: "12px", 
                  borderRadius: "8px", 
                  padding: "10px", 
                  border: "1px solid #ddd",
                  transition: "all 0.3s ease",
                  fontWeight: "bold"
                }}
              >
                {isEnrolled ? "Continue learning" : "Enroll Now"} <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .course-card-animated {
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          cursor: pointer;
        }
        .course-card-animated:hover {
          transform: translateY(-10px);
          box-shadow: 0 14px 28px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.08) !important;
        }
        .custom-enroll-btn:hover {
          background-color: #0a2e67 !important;
          color: #ffffff !important;
          border-color: #0a2e67 !important;
        }
      `}</style>

      <NavBar />
      <div className="container py-5">
        <ToastContainer />
        <div className="row">
          {/* ================= FILTER PANEL ================= */}
          <div className="col-md-3 mb-4">
            <div
              className="card p-3 shadow-sm border-0"
              style={{ position: "sticky", top: "80px", borderRadius: "12px", background: "#fff" }}
            >
              <h5 className="mb-3 fw-bold" style={{ fontSize: "18px" }}>Filter Courses</h5>

              <div className="mb-3">
                <label className="form-label small fw-bold">Search Course</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Type name..."
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Category</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Trainer</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.trainer}
                  onChange={(e) => setFilters({ ...filters, trainer: e.target.value })}
                >
                  <option value="">All Trainers</option>
                  {trainers.map((t, i) => (
                    <option key={i} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Start Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                />
              </div>

              <button
                style={{ backgroundColor: "#0a2e67", borderColor: "#0a2e67", color: "#fff" }}
                className="btn btn-sm w-100 mt-2 fw-bold"
                onClick={() => setFilters({ name: "", category: "", trainer: "", date: "" })}
              >
                <i className="bi bi-arrow-counterclockwise"></i> Reset Filters
              </button>
            </div>
          </div>

          {/* ================= COURSES LIST ================= */}
          <div className="col-md-9">
            <div className="row g-4">
              {loading ? (
                <div className="text-center w-100 py-5">
                  <div className="spinner-border text-primary"></div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-5 w-100">
                  <p className="text-muted">No courses found matching your filters.</p>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <CourseItem key={course.id} course={course} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}