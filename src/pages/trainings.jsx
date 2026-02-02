import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import api from "../api/axio";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";

export default function Training() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    name: "",
    category: "",
    trainer: "",
    date: "",
  });

  useEffect(() => {
    fetchCourses();
  }, [filters]);

  const fetchCourses = async () => {
    try {
      const res = await api.get("/training");
      console.log("API Response:", res.data); // <--- Add this!
      const rawData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setCourses(rawData);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    } finally {
      setLoading(false);
    }
  };

  const courseIntakes = courses.flatMap((course) =>
    (course.cohorts || []).map((cohort) => ({
      id: cohort.id,
      courseId: course.id,
      title: course.title,
      category: course.category,
      provider: course.provider?.name || "Unknown",
      providerLogo: course.provider?.logo
        ? `http://localhost:8000/storage/uploads/${course.provider.logo}`
        : "https://ui-avatars.com/api/?name=Trainer&background=6c757d&color=fff",
      // FIX: Base URL + Storage + path inayotoka kwenye DB
      img: course.banner
        ? `http://localhost:8000/storage/uploads/${course.banner}`
        : "https://via.placeholder.com/400x200",
      startDate: cohort.start_date,
      deadline: cohort.registration_deadline, // Imetolewa "Not Set"
      capacity: cohort.capacity,
      seatsTaken: cohort.seats_taken,
      remainingSeats: cohort.remaining_seats,
      mode: course.mode,
      enrollmentOpen: cohort.status === "OPEN" && cohort.remaining_seats > 0,
    })),
  );

  const filteredCourses = courseIntakes.filter((course) => {
    return (
      course.title.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.category ? course.category === filters.category : true) &&
      (filters.trainer ? course.provider === filters.trainer : true) &&
      (filters.date ? course.startDate === filters.date : true)
    );
  });

  const categories = [...new Set(courseIntakes.map((c) => c.category))];
  const trainers = [...new Set(courseIntakes.map((c) => c.provider))];

  return (
    <>
      <NavBar />
      <div className="container py-5">
        <ToastContainer />
        <div className="row">
          {/* ================= FILTER PANEL (STYLES ZAKO) ================= */}
          <div className="col-md-3 mb-4">
            <div
              className="card p-3 shadow-sm"
              style={{ position: "sticky", top: "80px" }}
            >
              <h5 className="mb-3">Filter Courses</h5>

              <div className="mb-3">
                <label className="form-label">Course</label>
                <select
                  className="form-select"
                  value={filters.name}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                >
                  <option value="">All Courses</option>
                  {[...new Set(courseIntakes.map((c) => c.title))].map(
                    (title, i) => (
                      <option key={i} value={title}>
                        {title}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
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
                <label className="form-label">Trainer</label>
                <select
                  className="form-select"
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
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
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
                  fontSize: "12px",
                }}
                className="btn btn-secondary w-100"
                onClick={() =>
                  setFilters({ name: "", category: "", trainer: "", date: "" })
                }
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* ================= COURSES LIST (STYLES ZAKO) ================= */}
          <div className="col-md-9">
            <div className="row g-4">
              {loading && (
                <p className="text-center text-muted">Loading courses...</p>
              )}

              {!loading &&
                filteredCourses.map((course) => (
                  <div
                    className="col-12 col-md-6 col-lg-4"
                    key={`${course.courseId}-${course.id}`}
                  >
                    <div className="card h-100 shadow-sm">
                      <img
                        src={course.img}
                        alt={course.title}
                        className="card-img-top"
                        style={{ height: "150px", objectFit: "cover" }}
                      />

                      <div className="card-body d-flex flex-column">
                        <h6 style={{ fontSize: "15px", fontWeight: "bold" }}>
                          {course.title}
                        </h6>

                        <small className="text-muted mb-2 d-flex align-items-center">
                          <img
                            src={course.providerLogo}
                            alt={course.provider}
                            style={{
                              width: "25px",
                              height: "25px",
                              borderRadius: "50%",
                              marginRight: "8px",
                              objectFit: "cover",
                            }}
                          />
                          {course.provider}
                        </small>

                        <p
                          className="text-muted mb-1 d-flex align-items-center"
                          style={{ fontSize: "13px" }}
                        >
                          <i className="bi bi-calendar-event me-1"></i> Start
                          Date: {course.startDate}
                        </p>

                        <p
                          className="text-danger mb-1 d-flex align-items-center"
                          style={{ fontSize: "13px", fontWeight: "bold" }}
                        >
                          <i className="bi bi-calendar-x me-1"></i> Deadline:{" "}
                          {course.deadline}
                        </p>

                        <p
                          className="text-muted mb-1 d-flex align-items-center"
                          style={{ fontSize: "13px" }}
                        >
                          <i className="bi bi-people-fill me-1"></i> Capacity:{" "}
                          {course.capacity}
                        </p>

                        <p
                          className="text-muted mb-1 d-flex align-items-center"
                          style={{ fontSize: "13px" }}
                        >
                          <i className="bi bi-person-check-fill me-1"></i>{" "}
                          Taken: {course.seatsTaken}
                        </p>

                        <p
                          className="d-flex align-items-center"
                          style={{ fontSize: "13px" }}
                        >
                          <i className="bi bi-box-seam me-1"></i> Remaining
                          Seats:{" "}
                          <strong
                            className={
                              course.remainingSeats === 0
                                ? "text-danger"
                                : "text-success"
                            }
                          >
                            {course.remainingSeats}
                          </strong>
                        </p>

                        <p style={{ fontSize: "13px" }}>
                          Mode: <strong>{course.mode}</strong>
                        </p>

                        {course.enrollmentOpen ? (
                          <a
                            href={`/course/${course.courseId}/cohort/${course.id}`}
                            className="mt-auto"
                          >
                            <button
                              className="btn btn-primary w-100"
                              style={{
                                backgroundColor: "#0a2e67",
                                borderColor: "#0a2e67",
                                fontSize: "12px",
                              }}
                            >
                              Enroll Now
                            </button>
                          </a>
                        ) : (
                          <span className="badge bg-danger mt-auto">FULL</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {!loading && filteredCourses.length === 0 && (
                <p className="text-center text-muted w-100">
                  No courses found.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
