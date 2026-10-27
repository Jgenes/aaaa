import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

const PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180'%3E%3Crect fill='%23eef2f7' width='300' height='180'/%3E%3Ctext x='50%25' y='50%25' fill='%239aa6b6' text-anchor='middle' dy='.3em' font-size='14'%3ENo preview%3C/text%3E%3C/svg%3E";

export default function Learning() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8000/api/my-learning", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedCourses = response.data.map((item) => ({
          id: item.course?.id,
          title: item.course?.title || "Untitled Course",
          providerName: item.course?.provider?.name || "Official Provider",
          progress: item.progress || 0,
          rating: item.rating || 5,
          image: item.course?.banner
            ? `http://localhost:8000/${item.course.banner}`
            : PLACEHOLDER,
        }));

        setCourses(formattedCourses);
      } catch (err) {
        console.error("Error fetching learning data:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const stats = useMemo(() => {
    const inProgress = courses.filter((c) => Number(c.progress) > 0 && Number(c.progress) < 100);
    const completed = courses.filter((c) => Number(c.progress) >= 100);
    return {
      total: courses.length,
      inProgress: inProgress.length,
      completed: completed.length,
    };
  }, [courses]);

  return (
    <div className="learning-page">
      <NavBar />

      <main id="main-content">
        <section className="th-learning-hero">
          <div className="th-container-wide">
            <h1>My learning</h1>
            <p>Pick up where you left off and keep your streak going.</p>

            <div className="th-learning-tabs">
              <span className="is-active" aria-current="page">
                My courses
              </span>
              <span>Certifications</span>
            </div>

            <div className="th-learning-stats">
              <span className="th-learning-stat">
                <i className="bi bi-collection-play" aria-hidden="true"></i>
                <strong>{stats.total}</strong> enrolled
              </span>
              <span className="th-learning-stat">
                <i className="bi bi-hourglass-split" aria-hidden="true"></i>
                <strong>{stats.inProgress}</strong> in progress
              </span>
              <span className="th-learning-stat">
                <i className="bi bi-patch-check" aria-hidden="true"></i>
                <strong>{stats.completed}</strong> completed
              </span>
            </div>
          </div>
        </section>

        <section className="th-container-wide th-section-tight">
          <div className="th-content-head">
            <div>
              <h2 className="th-content-head__title">Continue learning</h2>
              <p className="th-content-head__sub">
                Your active cohorts, progress and next lessons in one place.
              </p>
            </div>
            <Link to="/trainings" className="btn btn-outline-dark btn-sm">
              <i className="bi bi-plus-lg" aria-hidden="true"></i>
              Find a new training
            </Link>
          </div>

          {loading ? (
            <div className="course-grid" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div className="prof-card" key={i}>
                  <div className="prof-card-img th-skeleton" />
                  <div className="prof-card-content">
                    <div className="th-skeleton" style={{ height: 14, width: "80%" }} />
                    <div className="th-skeleton" style={{ height: 12, width: "45%" }} />
                    <div className="th-skeleton" style={{ height: 36, marginTop: 12 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="course-grid">
              {courses.map((course) => (
                <article className="prof-card" key={course.id}>
                  <div className="prof-card-img">
                    <img src={course.image} alt="" loading="lazy" />
                    <div className="prof-overlay">
                      <Link
                        to={`/learning/${course.id}`}
                        className="prof-play-btn"
                        aria-label={`Continue ${course.title}`}
                      >
                        <i className="bi bi-play-fill" aria-hidden="true"></i>
                      </Link>
                    </div>
                  </div>

                  <div className="prof-card-content">
                    <h3 className="prof-course-title" title={course.title}>
                      {course.title}
                    </h3>
                    <p className="prof-provider-name">{course.providerName}</p>

                    <div className="prof-card-footer">
                      {course.progress > 0 ? (
                        <div className="prof-prog-container">
                          <div
                            className="prof-prog-bar"
                            role="progressbar"
                            aria-valuenow={course.progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${course.title} progress`}
                          >
                            <div
                              className="prof-prog-fill"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                            <span
                              className="text-muted"
                              style={{ fontSize: "var(--th-fs-xs)", fontWeight: 600 }}
                            >
                              {course.progress}% complete
                            </span>
                            <Link
                              to={`/learning/${course.id}`}
                              className="course-card__cta"
                            >
                              Continue
                              <i className="bi bi-arrow-right" aria-hidden="true"></i>
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <Link to={`/learning/${course.id}`} className="btn btn-secondary w-100">
                          <i className="bi bi-play-circle" aria-hidden="true"></i>
                          Start learning
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="th-empty">
              <span className="th-empty__icon">
                <i className="bi bi-mortarboard" aria-hidden="true"></i>
              </span>
              <p className="th-empty__title">
                {error ? "We could not load your trainings" : "You have not started any training"}
              </p>
              <p className="th-empty__text">
                {error
                  ? "Please check your connection and refresh the page, or sign in again."
                  : "Browse the catalogue and enrol in a cohort to see it appear here."}
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
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
