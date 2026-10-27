import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import api from "../api/axio";

export default function Training() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    name: searchParams.get("q") || "",
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

  const courseList = useMemo(() => {
    return courses.map((course) => {
      const activeCohort =
        course.cohorts?.find((c) => c.status?.toUpperCase() === "OPEN") ||
        course.cohorts?.[0];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadline = activeCohort ? new Date(activeCohort.registration_deadline) : null;
      const isPastDeadline = deadline ? deadline < today : false;

      const isFull = activeCohort
        ? Number(activeCohort.capacity) - Number(activeCohort.seats_taken) <= 0
        : false;

      return {
        ...course,
        mainCohort: activeCohort,
        isEnrolled: course.is_enrolled || false,
        enrollmentOpen:
          Boolean(activeCohort) &&
          activeCohort.status?.toUpperCase() === "OPEN" &&
          !isPastDeadline &&
          !isFull,
        isFull,
        isPastDeadline,
      };
    });
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courseList.filter((course) => {
      const nameMatch = (course.title || "")
        .toLowerCase()
        .includes(filters.name.toLowerCase());
      const categoryMatch = filters.category ? course.category === filters.category : true;
      const trainerMatch = filters.trainer ? course.provider?.name === filters.trainer : true;
      const dateMatch = filters.date ? course.mainCohort?.start_date === filters.date : true;

      return nameMatch && categoryMatch && trainerMatch && dateMatch;
    });
  }, [courseList, filters]);

  const categories = [...new Set(courseList.map((c) => c.category).filter(Boolean))];
  const trainers = [...new Set(courseList.map((c) => c.provider?.name).filter(Boolean))];

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const resetFilters = () =>
    setFilters({ name: "", category: "", trainer: "", date: "" });

  return (
    <>
      <NavBar />

      <main id="main-content">
        <section className="th-page-hero">
          <div className="th-container-wide">
            <nav aria-label="Breadcrumb">
              <ol className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <Link to="/">Home</Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Trainings
                </li>
              </ol>
            </nav>
            <h1 className="mb-2">
              Training catalogue
            </h1>
            <p className="th-section-lead">
              Compare accredited cohorts from verified providers across Tanzania. Filter by
              category, trainer or start date to find the right fit.
            </p>
          </div>
        </section>

        <div className="th-container-wide th-section-tight">
          <div className="row g-4">
            {/* -------------------------------------------------- Filters */}
            <aside className="col-lg-3">
              <button
                type="button"
                className="btn btn-outline-dark w-100 mb-3 th-filter-toggle"
                onClick={() => setFiltersOpen((prev) => !prev)}
                aria-expanded={filtersOpen}
                aria-controls="catalogue-filters"
              >
                <i className="bi bi-sliders" aria-hidden="true"></i>
                {filtersOpen ? "Hide filters" : "Show filters"}
                {activeFilterCount > 0 && (
                  <span className="badge bg-primary-subtle text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div
                id="catalogue-filters"
                className={`th-filter-panel ${filtersOpen ? "" : "d-none d-lg-block"}`}
              >
                <div className="th-filter-panel__head">
                  <h2 className="th-filter-panel__title">Filter trainings</h2>
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      className="btn btn-link btn-sm"
                      onClick={resetFilters}
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="th-filter-group">
                  <label className="form-label" htmlFor="filter-name">
                    Search
                  </label>
                  <input
                    id="filter-name"
                    type="search"
                    className="form-control"
                    placeholder="Course name…"
                    value={filters.name}
                    onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  />
                </div>

                <div className="th-filter-group">
                  <label className="form-label" htmlFor="filter-category">
                    Category
                  </label>
                  <select
                    id="filter-category"
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">All categories</option>
                    {categories.map((cat, i) => (
                      <option key={i} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="th-filter-group">
                  <label className="form-label" htmlFor="filter-trainer">
                    Provider
                  </label>
                  <select
                    id="filter-trainer"
                    className="form-select"
                    value={filters.trainer}
                    onChange={(e) => setFilters({ ...filters, trainer: e.target.value })}
                  >
                    <option value="">All providers</option>
                    {trainers.map((t, i) => (
                      <option key={i} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="th-filter-group">
                  <label className="form-label" htmlFor="filter-date">
                    Start date
                  </label>
                  <input
                    id="filter-date"
                    type="date"
                    className="form-control"
                    value={filters.date}
                    onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  />
                </div>

                <button
                  type="button"
                  className="btn btn-outline-dark w-100"
                  onClick={resetFilters}
                >
                  <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
                  Reset filters
                </button>
              </div>
            </aside>

            {/* ---------------------------------------------------- Results */}
            <div className="col-lg-9">
              <div className="th-results-bar">
                <p className="th-results-count mb-0" aria-live="polite">
                  {loading ? (
                    "Loading trainings…"
                  ) : (
                    <>
                      Showing <strong>{filteredCourses.length}</strong>{" "}
                      {filteredCourses.length === 1 ? "training" : "trainings"}
                      {activeFilterCount > 0 && " matching your filters"}
                    </>
                  )}
                </p>
              </div>

              {loading ? (
                <div className="course-grid" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div className="course-card" key={i}>
                      <div className="course-card__media th-skeleton" />
                      <div className="course-card__body">
                        <div className="th-skeleton" style={{ height: 14, width: "70%" }} />
                        <div className="th-skeleton" style={{ height: 14, width: "45%" }} />
                        <div className="th-skeleton" style={{ height: 32, marginTop: 12 }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="th-empty">
                  <span className="th-empty__icon">
                    <i className="bi bi-search" aria-hidden="true"></i>
                  </span>
                  <p className="th-empty__title">No trainings match your filters</p>
                  <p className="th-empty__text">
                    Try a different category or provider, or reset the filters to see the full
                    catalogue.
                  </p>
                  <button type="button" className="btn btn-primary" onClick={resetFilters}>
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="course-grid">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
