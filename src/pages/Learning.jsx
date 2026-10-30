import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axio";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect fill='%23efece4' width='640' height='360'/%3E%3Cpath d='M320 140l46 26v52l-46 26-46-26v-52z' fill='none' stroke='%23cdc7bb' stroke-width='6'/%3E%3Ctext x='50%25' y='63%25' fill='%23596274' text-anchor='middle' font-family='Inter, sans-serif' font-size='15'%3ENo preview available%3C/text%3E%3C/svg%3E";

const API_ORIGIN = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

/** Absolute banner URLs pass through; stored paths are joined to the API origin. */
function resolveAsset(path) {
  if (!path) return PLACEHOLDER;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${API_ORIGIN}/${String(path).replace(/^\/+/, "")}`;
}

const TABS = [
  { id: "all", label: "All courses" },
  { id: "in-progress", label: "In progress" },
  { id: "completed", label: "Completed" },
];

const SECTION_TITLES = {
  all: "All courses",
  "in-progress": "In progress",
  completed: "Completed",
};

const STATE_LABELS = {
  "in-progress": "In progress",
  completed: "Completed",
  "not-started": "Not started",
};

function statusOf(progress) {
  const value = Number(progress) || 0;
  if (value >= 100) return "completed";
  if (value > 0) return "in-progress";
  return "not-started";
}

function toCourse(item, index) {
  const course = item?.course || {};
  const progress = Math.min(100, Math.max(0, Math.round(Number(item?.progress) || 0)));
  const totalLessons = Number(item?.total_lessons ?? course.lessons_count) || 0;
  const completedLessons = Number(item?.completed_lessons) || 0;

  return {
    id: course.id ?? item?.course_id ?? index,
    title: course.title || "Untitled course",
    providerName: course.provider?.name || "Verified provider",
    progress,
    image: resolveAsset(course.banner),
    cohort: item?.cohort?.name || course?.cohort?.name || "",
    totalLessons,
    completedLessons: Math.min(completedLessons, totalLessons || completedLessons),
    state: statusOf(progress),
  };
}

function ProgressBar({ value, tone = "default", label }) {
  return (
    <div
      className="th-progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <span
        className={`th-progress__fill${tone === "success" ? " th-progress__fill--success" : ""}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function CourseCardSkeleton() {
  return (
    <li className="th-lcard th-lcard--skeleton" aria-hidden="true">
      <div className="th-lcard__media th-skeleton" />
      <div className="th-lcard__skeleton-body">
        <div className="th-skeleton" style={{ height: 10, width: "38%" }} />
        <div className="th-skeleton" style={{ height: 15, width: "88%" }} />
        <div className="th-skeleton" style={{ height: 15, width: "62%" }} />
        <div className="th-skeleton" style={{ height: 6, marginTop: 18 }} />
        <div
          className="th-skeleton"
          style={{ height: 36, marginTop: 14, borderRadius: "var(--th-radius-sm)" }}
        />
      </div>
    </li>
  );
}

export default function Learning() {
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");

  const loadCourses = useCallback(async () => {
    setStatus("loading");
    try {
      const response = await api.get("/my-learning");
      const payload = Array.isArray(response.data) ? response.data : response.data?.data;
      const list = Array.isArray(payload) ? payload : [];
      setCourses(list.map(toCourse));
      setStatus("ready");
    } catch (error) {
      console.error("Error fetching learning data:", error);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const stats = useMemo(() => {
    const inProgress = courses.filter((course) => course.state === "in-progress");
    const completed = courses.filter((course) => course.state === "completed");
    const average = courses.length
      ? Math.round(courses.reduce((total, course) => total + course.progress, 0) / courses.length)
      : 0;

    return {
      total: courses.length,
      inProgress: inProgress.length,
      completed: completed.length,
      average,
    };
  }, [courses]);

  const counts = useMemo(
    () => ({
      all: courses.length,
      "in-progress": stats.inProgress,
      completed: stats.completed,
    }),
    [courses.length, stats.inProgress, stats.completed]
  );

  const resumeCourse = useMemo(
    () => courses.find((course) => course.state === "in-progress") || null,
    [courses]
  );

  const visibleCourses = useMemo(() => {
    const term = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesTab = activeTab === "all" || course.state === activeTab;
      const matchesTerm =
        !term ||
        course.title.toLowerCase().includes(term) ||
        course.providerName.toLowerCase().includes(term);
      return matchesTab && matchesTerm;
    });
  }, [courses, activeTab, query]);

  const isLoading = status === "loading";
  const hasCourses = courses.length > 0;
  const statValue = (value) => (isLoading ? "—" : value);

  return (
    <div className="th-learning">
      <NavBar />

      <main id="main-content">
        <header className="th-learning__masthead">
          <div className="th-container-wide">
            <div className="th-learning__masthead-grid">
              <div>
                <p className="th-eyebrow">Learner workspace</p>
                <h1 className="th-learning__title">My learning</h1>
                <p className="th-learning__lead">
                  Every training you are enrolled in, your progress and the exact session to pick
                  up next — all in one place.
                </p>
              </div>

              <div className="th-learning__actions">
                <Link to="/trainings" className="btn btn-primary">
                  <i className="bi bi-search" aria-hidden="true"></i>
                  Browse trainings
                </Link>
                <Link to="/transactions" className="btn btn-outline-dark">
                  <i className="bi bi-receipt" aria-hidden="true"></i>
                  Transactions
                </Link>
              </div>
            </div>

            <div className="th-learning__stats">
              <div className="th-learning-stat">
                <div>
                  <span className="th-learning-stat__value">{statValue(stats.total)}</span>
                  <span className="th-learning-stat__label">Enrolled</span>
                </div>
                <span className="th-learning-stat__icon" aria-hidden="true">
                  <i className="bi bi-collection-play"></i>
                </span>
              </div>

              <div className="th-learning-stat">
                <div>
                  <span className="th-learning-stat__value">{statValue(stats.inProgress)}</span>
                  <span className="th-learning-stat__label">In progress</span>
                </div>
                <span className="th-learning-stat__icon" aria-hidden="true">
                  <i className="bi bi-hourglass-split"></i>
                </span>
              </div>

              <div className="th-learning-stat">
                <div>
                  <span className="th-learning-stat__value">{statValue(stats.completed)}</span>
                  <span className="th-learning-stat__label">Completed</span>
                </div>
                <span className="th-learning-stat__icon" aria-hidden="true">
                  <i className="bi bi-patch-check"></i>
                </span>
              </div>

              <div className="th-learning-stat">
                <div>
                  <span className="th-learning-stat__value">
                    {isLoading ? "—" : `${stats.average}%`}
                  </span>
                  <span className="th-learning-stat__label">Average progress</span>
                </div>
                <span className="th-learning-stat__icon" aria-hidden="true">
                  <i className="bi bi-graph-up-arrow"></i>
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="th-container-wide th-learning__body">
          {resumeCourse && !isLoading && (
            <section className="th-resume" aria-labelledby="resume-title">
              <div className="th-resume__media">
                <img src={resumeCourse.image} alt="" loading="lazy" />
              </div>

              <div className="th-resume__body">
                <p className="th-resume__eyebrow">
                  <i className="bi bi-play-circle" aria-hidden="true"></i>
                  Jump back in
                </p>
                <h2 className="th-resume__title" id="resume-title">
                  {resumeCourse.title}
                </h2>
                <p className="th-resume__provider">
                  {resumeCourse.providerName}
                  {resumeCourse.cohort ? ` · ${resumeCourse.cohort}` : ""}
                </p>

                <div className="th-resume__progress">
                  <ProgressBar
                    value={resumeCourse.progress}
                    label={`${resumeCourse.title} progress`}
                  />
                  <span className="th-resume__pct">{resumeCourse.progress}%</span>
                </div>

                <Link
                  to={`/learning/${resumeCourse.id}`}
                  className="btn th-resume__cta"
                >
                  Continue learning
                  <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </Link>
              </div>
            </section>
          )}

          <div className="th-learning__filters">
            <div className="th-filters" role="group" aria-label="Filter courses by status">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`th-filter${activeTab === tab.id ? " is-active" : ""}`}
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  <span className="th-filter__count">{counts[tab.id]}</span>
                </button>
              ))}
            </div>

            <div className="th-learning__search">
              <label htmlFor="learning-search" className="visually-hidden">
                Search your courses
              </label>
              <i className="bi bi-search" aria-hidden="true"></i>
              <input
                id="learning-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses or providers"
                autoComplete="off"
              />
            </div>
          </div>

          {!isLoading && hasCourses && (
            <div className="th-learning__list-head">
              <h2 id="course-list-heading">{SECTION_TITLES[activeTab]}</h2>
              <p>
                {visibleCourses.length}{" "}
                {visibleCourses.length === 1 ? "course" : "courses"}
                {query ? ` matching “${query.trim()}”` : ""}
              </p>
            </div>
          )}

          {isLoading ? (
            <ul className="th-course-grid" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </ul>
          ) : status === "error" ? (
            <div className="th-empty th-learning__empty">
              <span className="th-empty__icon">
                <i className="bi bi-cloud-slash" aria-hidden="true"></i>
              </span>
              <p className="th-empty__title">We could not load your trainings</p>
              <p className="th-empty__text">
                Your connection may have dropped. Check your network and try again — your progress
                is safe.
              </p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <button type="button" className="btn btn-primary" onClick={loadCourses}>
                  <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
                  Try again
                </button>
                <Link to="/trainings" className="btn btn-outline-dark">
                  Browse trainings
                </Link>
              </div>
            </div>
          ) : !hasCourses ? (
            <div className="th-empty th-learning__empty">
              <span className="th-empty__icon">
                <i className="bi bi-mortarboard" aria-hidden="true"></i>
              </span>
              <p className="th-empty__title">You have not started any training yet</p>
              <p className="th-empty__text">
                Browse the catalogue, enrol in a cohort and your sessions will appear here with
                progress tracking.
              </p>
              <div className="d-flex gap-2 justify-content-center flex-wrap">
                <Link to="/trainings" className="btn btn-primary">
                  Browse trainings
                </Link>
                <Link to="/transactions" className="btn btn-outline-dark">
                  View transactions
                </Link>
              </div>
            </div>
          ) : visibleCourses.length === 0 ? (
            <div className="th-empty th-learning__empty">
              <span className="th-empty__icon">
                <i className="bi bi-funnel" aria-hidden="true"></i>
              </span>
              <p className="th-empty__title">No courses match this view</p>
              <p className="th-empty__text">
                Try a different status filter or clear your search to see all of your trainings.
              </p>
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={() => {
                  setActiveTab("all");
                  setQuery("");
                }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <ul className="th-course-grid" aria-labelledby="course-list-heading">
              {visibleCourses.map((course) => {
                const ctaLabel =
                  course.state === "completed"
                    ? "Review course"
                    : course.state === "not-started"
                      ? "Start learning"
                      : "Continue learning";

                return (
                  <li key={course.id}>
                    <article className="th-lcard">
                      <div className="th-lcard__media">
                        <img
                          src={course.image}
                          alt=""
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = PLACEHOLDER;
                          }}
                        />
                        <span className={`th-lcard__status is-${course.state}`}>
                          {STATE_LABELS[course.state]}
                        </span>
                        <span className="th-lcard__pct">{course.progress}%</span>
                      </div>

                      <div className="th-lcard__body">
                        <p className="th-lcard__provider">{course.providerName}</p>
                        <h3 className="th-lcard__title">
                          <Link to={`/learning/${course.id}`}>{course.title}</Link>
                        </h3>

                        <div className="th-lcard__progress">
                          <ProgressBar
                            value={course.progress}
                            tone={course.state === "completed" ? "success" : "default"}
                            label={`${course.title} progress`}
                          />
                          <p className="th-lcard__meta">
                            <span>
                              <strong>{course.progress}%</strong> complete
                            </span>
                            {course.totalLessons > 0 && (
                              <span>
                                {course.completedLessons} of {course.totalLessons} sessions
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="th-lcard__actions">
                        <Link
                          to={`/learning/${course.id}`}
                          className="btn btn-sm btn-outline-dark th-lcard__cta"
                          aria-label={`${ctaLabel}: ${course.title}`}
                        >
                          <span>{ctaLabel}</span>
                          <i className="bi bi-arrow-right" aria-hidden="true"></i>
                        </Link>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
