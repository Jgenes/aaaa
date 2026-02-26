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

  // 1. Logic ya kuandaa data ya Kozi (Hapa ndipo tunahakikisha haziondoki)
  const courseList = courses.map((course) => {
    // Tunachukua cohort iliyo OPEN, kama hakuna, tunachukua yoyote iliyopo (ya kwanza) ili kozi ionekane
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
      // Hii inatumika kule kwenye Button pekee
      enrollmentOpen:
        activeCohort &&
        activeCohort.status?.toUpperCase() === "OPEN" &&
        !isPastDeadline &&
        !isFull,
      isFull: isFull,
      isPastDeadline: isPastDeadline
    };
  });

  // 2. Filter Logic (Nimeondoa kizuizi cha 'isPublished' au 'enrollmentOpen' ili zisiondoke)
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
    
    // Hapa tunaruhusu zote zipite kulingana na filters za mtumiaji tu
    return nameMatch && categoryMatch && trainerMatch && dateMatch;
  });

  const categories = [
    ...new Set(courseList.map((c) => c.category).filter(Boolean)),
  ];
  const trainers = [
    ...new Set(courseList.map((c) => c.provider?.name).filter(Boolean)),
  ];

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <ToastContainer />
        <div className="row">
          {/* ================= FILTER PANEL ================= */}
          <div className="col-md-3 mb-4">
            <div
              className="card p-3 shadow-sm border-0"
              style={{ position: "sticky", top: "80px", borderRadius: "12px" }}
            >
              <h5 className="mb-3 fw-bold">Filter Courses</h5>

              <div className="mb-3">
                <label className="form-label small fw-bold">Search Course</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Type name..."
                  value={filters.name}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Category</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value })
                  }
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Trainer</label>
                <select
                  className="form-select form-select-sm"
                  value={filters.trainer}
                  onChange={(e) =>
                    setFilters({ ...filters, trainer: e.target.value })
                  }
                >
                  <option value="">All Trainers</option>
                  {trainers.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Start Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={filters.date}
                  onChange={(e) =>
                    setFilters({ ...filters, date: e.target.value })
                  }
                />
              </div>

              <button
                style={{
                  backgroundColor: "#0a2e67",
                  borderColor: "#0a2e67",
                  color: "#fff",
                }}
                className="btn btn-sm w-100 mt-2"
                onClick={() =>
                  setFilters({ name: "", category: "", trainer: "", date: "" })
                }
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
                  <div className="col-12 col-md-6 col-lg-4" key={course.id}>
                    <div
                      className="card h-100 shadow-sm border-0"
                      style={{ borderRadius: "15px", overflow: "hidden" }}
                    >
                      <img
                        src={
                          course.banner
                            ? `http://localhost:8000/${course.banner}`
                            : "https://via.placeholder.com/400x200?text=No+Image"
                        }
                        className="card-img-top"
                        style={{ height: "160px", objectFit: "cover" }}
                        alt={course.title}
                      />
                      <div className="card-body d-flex flex-column p-3">
                        <h6 className="fw-bold mb-2">{course.title}</h6>

                        <div className="d-flex align-items-center mb-3">
                          <img
                            src={
                              course.provider?.logo
                                ? `http://localhost:8000/storage/uploads/${course.provider.logo}`
                                : "https://ui-avatars.com/api/?name=T"
                            }
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              marginRight: "8px",
                              objectFit: "cover",
                            }}
                            alt="logo"
                          />
                          <small className="text-muted">
                            {course.provider?.name || "Provider"}
                          </small>
                        </div>

                        <div className="mb-3 small text-muted">
                          <div className="mb-1">
                            <i className="bi bi-calendar-event me-2"></i>Starts:{" "}
                            {course.mainCohort?.start_date || "TBA"}
                          </div>
                          <div className="mb-1 text-danger fw-bold">
                            <i className="bi bi-calendar-x me-2"></i>Deadline:{" "}
                            {course.mainCohort?.registration_deadline || "TBA"}
                          </div>
                          <div>
                            <i className="bi bi-people me-2"></i>Remaining:
                            <span
                              className={
                                (Number(course.mainCohort?.capacity || 0) - Number(course.mainCohort?.seats_taken || 0)) <= 0
                                  ? "text-danger ms-1"
                                  : "text-success ms-1"
                              }
                            >
                              {Math.max(0, (Number(course.mainCohort?.capacity || 0) - Number(course.mainCohort?.seats_taken || 0)))}
                            </span>
                          </div>
                        </div>

                        <div className="mt-auto">
                          {course.is_enrolled ? (
                            <button
                              onClick={() => navigate(`/learning/${course.id}`)}
                              className="btn btn-success w-100 fw-bold shadow-sm"
                              style={{ fontSize: "13px", borderRadius: "8px" }}
                            >
                              <i className="bi bi-play-circle me-2"></i>
                              Continue Learning
                            </button>
                          ) : (
                            <>
                              {course.enrollmentOpen ? (
                                <button
                                  onClick={() => navigate(`/course/${course.id}`)}
                                  className="btn btn-primary w-100 fw-bold shadow-sm"
                                  style={{
                                    backgroundColor: "#0a2e67",
                                    borderColor: "#0a2e67",
                                    fontSize: "13px",
                                    borderRadius: "8px",
                                  }}
                                >
                                  Enroll Now
                                </button>
                              ) : (
                                // Hapa: Kozi bado inaonekana lakini Button imefungwa
                                <button className="btn btn-secondary w-100 fw-bold shadow-sm disabled" style={{ fontSize: "13px", borderRadius: "8px" }}>
                                  <i className="bi bi-lock-fill me-2"></i>
                                  {course.isFull ? "Cohort Full" : course.isPastDeadline ? "Deadline Passed" : "Enrollment Closed"}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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