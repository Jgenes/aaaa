import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axio";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import HeroImage from "../assets/banner0.jpg";
import LogoNacte from "../assets/NACTE.png";
import LogoVeta from "../assets/VETA.png";
import LogoTcu from "../assets/TCU.png";
import LogoOsha from "../assets/OSHA.png";

const ACCREDITATION_LOGOS = [
  { src: LogoNacte, alt: "NACTE" },
  { src: LogoVeta, alt: "VETA" },
  { src: LogoTcu, alt: "Tanzania Commission for Universities" },
  { src: LogoOsha, alt: "OSHA Tanzania" },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get("/public-courses").catch(() => ({ data: [] }));
        const providerRes = await api.get("/top-providers").catch(() => ({ data: [] }));
        const reviewRes = await api.get("/public-reviews").catch(() => ({ data: [] }));

        if (courseRes.data) {
          const processed = courseRes.data.map((c) => {
            const hasCompletedEnrollment = c.enrollments?.some(
              (enrol) => enrol.status?.toLowerCase() === "completed"
            );

            return {
              ...c,
              isEnrolled: hasCompletedEnrollment,
              mainCohort:
                c.cohorts?.find((coh) => coh.status?.toUpperCase() === "OPEN") ||
                c.cohorts?.[0],
            };
          });

          setCourses(processed);
          const uniqueCats = [...new Set(processed.map((c) => c.category))].filter(Boolean);
          if (uniqueCats.length > 0) setActiveTab(uniqueCats[0]);
          setCategories(uniqueCats);
        }

        setProviders(providerRes.data || []);
        setReviews(reviewRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const visibleCourses = useMemo(
    () => courses.filter((c) => (activeTab ? c.category === activeTab : true)),
    [courses, activeTab]
  );

  const latestCourses = useMemo(
    () => [...courses].sort((a, b) => b.id - a.id).slice(0, 4),
    [courses]
  );

  const reviewSlides = useMemo(() => {
    const slides = [];
    for (let i = 0; i < reviews.length; i += 3) slides.push(reviews.slice(i, i + 3));
    return slides;
  }, [reviews]);

  const scrollTo = (id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <NavBar />

      <main id="main-content">
        {/* ---------------------------------------------------------- Hero */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="th-container-wide hero__grid">
            <div>
              <p className="th-eyebrow">Accredited training · Tanzania</p>

              <h1 className="hero__title" id="hero-title">
                Skills that move careers <span className="hero__title-accent">forward</span>
              </h1>

              <p className="hero__lead">
                Compare accredited cohorts from verified Tanzanian training providers,
                enrol in minutes and learn with practitioners who do the work every day.
              </p>

              <div className="hero__actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => scrollTo("courses-list")}
                >
                  Browse all trainings
                  <i className="bi bi-arrow-right" aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => scrollTo("top-training")}
                >
                  Latest trainings
                </button>
              </div>

              <dl className="hero__stats">
                <div className="hero__stat">
                  <dt>150+</dt>
                  <dd>Expert courses</dd>
                </div>
                <div className="hero__stat">
                  <dt>4.8/5</dt>
                  <dd>Learner rating</dd>
                </div>
                <div className="hero__stat">
                  <dt>12k+</dt>
                  <dd>Graduates</dd>
                </div>
              </dl>
            </div>

            <div className="hero__visual">
              <figure className="hero__figure m-0">
                <img
                  src={HeroImage}
                  alt="Participants taking notes during a TrainHub TZ professional development session in Tanzania"
                  width="1200"
                  height="700"
                />
                <figcaption className="hero__figure-caption">
                  <i className="bi bi-geo-alt-fill" aria-hidden="true"></i>
                  Live cohort training · Dar es Salaam
                </figcaption>
              </figure>

              <div className="hero__float hero__float--bottom">
                <span className="hero__float-icon hero__float-icon--orange">
                  <i className="bi bi-patch-check-fill" aria-hidden="true"></i>
                </span>
                <div>
                  <strong>Verified providers</strong>
                  <small>NACTE · VETA · TCU aligned</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- Course catalogue */}
        <section className="th-section" id="courses-list" aria-labelledby="courses-title">
          <div className="th-container-wide">
            <div className="th-section-head">
              <div>
                <p className="th-eyebrow">Explore by category</p>
                <h2 className="th-section-title" id="courses-title">
                  Skills to transform your career
                </h2>
                <p className="th-section-lead">
                  Explore our wide range of technical and professional categories, curated
                  with accredited training providers.
                </p>
              </div>
              <Link to="/trainings" className="btn btn-outline-dark">
                View all trainings
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </Link>
            </div>

            {categories.length > 0 && (
              <div className="th-category-bar" role="group" aria-label="Filter courses by category">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={activeTab === cat}
                    className={`th-chip ${activeTab === cat ? "is-active" : ""}`}
                    onClick={() => setActiveTab(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="course-grid" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
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
            ) : loadError ? (
              <div className="th-empty">
                <span className="th-empty__icon">
                  <i className="bi bi-cloud-slash" aria-hidden="true"></i>
                </span>
                <p className="th-empty__title">We couldn&apos;t load the catalogue</p>
                <p className="th-empty__text">
                  Please check your connection and refresh the page. If the problem
                  continues, contact our support team.
                </p>
                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => window.location.reload()}
                  >
                    Refresh page
                  </button>
                  <Link to="/contact" className="btn btn-outline-dark">
                    Contact support
                  </Link>
                </div>
              </div>
            ) : visibleCourses.length > 0 ? (
              <div className="course-grid">
                {visibleCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="th-empty">
                <span className="th-empty__icon">
                  <i className="bi bi-journal-x" aria-hidden="true"></i>
                </span>
                <p className="th-empty__title">No trainings in this category yet</p>
                <p className="th-empty__text">
                  New cohorts are published weekly. Browse the full catalogue or pick another
                  category to keep exploring.
                </p>
                <Link to="/trainings" className="btn btn-primary">
                  Browse all trainings
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------ Accreditation strip */}
        <section className="th-section-tight" aria-labelledby="accreditation-title">
          <div className="th-container-wide">
            <div className="th-section-head th-section-head--plain">
              <div>
                <h2 className="th-eyebrow mb-0" id="accreditation-title">
                  Recognised accreditation bodies
                </h2>
              </div>
              {providers.length > 0 && (
                <p className="th-results-count mb-0">
                  {providers.length} accredited training provider
                  {providers.length === 1 ? "" : "s"} publishing on TrainHub
                </p>
              )}
            </div>
            <div className="th-logos">
              {ACCREDITATION_LOGOS.map((logo) => (
                <img key={logo.alt} src={logo.src} alt={logo.alt} loading="lazy" />
              ))}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- Testimonials */}
        <section className="th-section th-surface-alt" aria-labelledby="testimonials-title">
          <div className="th-container-wide">
            <div className="th-section-head">
              <div>
                <p className="th-eyebrow">Learner stories</p>
                <h2 className="th-section-title" id="testimonials-title">
                  How learners like you are achieving their goals
                </h2>
              </div>
            </div>

            {reviews.length > 0 ? (
              <div
                id="testimonialCarousel"
                className="carousel slide th-carousel"
                data-bs-ride="carousel"
                data-bs-interval="6000"
              >
                <div className="carousel-inner">
                  {reviewSlides.map((slide, idx) => (
                    <div className={`carousel-item ${idx === 0 ? "active" : ""}`} key={idx}>
                      <div className="th-quote-grid" style={{ paddingBottom: "0.25rem" }}>
                        {slide.map((review) => (
                          <figure className="th-quote m-0" key={review.id}>
                            <span className="th-quote__mark" aria-hidden="true">
                              &ldquo;
                            </span>
                            <blockquote className="th-quote__text m-0">
                              {review.review}
                            </blockquote>
                            <figcaption className="th-quote__person">
                              <span className="th-avatar th-avatar--lg" aria-hidden="true">
                                {review.user?.name?.charAt(0) || "U"}
                              </span>
                              <div style={{ minWidth: 0 }}>
                                <span className="th-quote__name">
                                  {review.user?.name || "Anonymous"}
                                </span>
                                <span className="th-quote__meta">
                                  {review.course?.title || "Learner"}
                                </span>
                                <span className="th-stars" aria-label="Rated 5 out of 5">
                                  {[0, 1, 2, 3, 4].map((star) => (
                                    <i className="bi bi-star-fill" key={star} aria-hidden="true" />
                                  ))}
                                </span>
                              </div>
                            </figcaption>
                          </figure>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {reviewSlides.length > 1 && (
                  <div className="th-carousel-controls">
                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target="#testimonialCarousel"
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Previous testimonials</span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target="#testimonialCarousel"
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      <span className="visually-hidden">Next testimonials</span>
                    </button>
                    <div className="carousel-indicators">
                      {reviewSlides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          data-bs-target="#testimonialCarousel"
                          data-bs-slide-to={idx}
                          className={idx === 0 ? "active" : ""}
                          aria-label={`Go to testimonial group ${idx + 1}`}
                        ></button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="th-empty">
                <span className="th-empty__icon">
                  <i className="bi bi-chat-quote" aria-hidden="true"></i>
                </span>
                <p className="th-empty__title">Learner reviews are on the way</p>
                <p className="th-empty__text">
                  Reviews appear here as soon as learners complete their first cohort.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------ Latest trainings */}
        <section className="th-section-tight" id="top-training" aria-labelledby="latest-title">
          <div className="th-container-wide">
            <div className="th-section-head">
              <div>
                <p className="th-eyebrow">New on TrainHub</p>
                <h2 className="th-section-title" id="latest-title">
                  Latest trainings
                </h2>
              </div>
              <Link to="/trainings" className="btn btn-ghost btn-sm">
                See everything
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </Link>
            </div>

            {latestCourses.length > 0 ? (
              <div className="course-grid">
                {latestCourses.map((course) => (
                  <CourseCard key={`latest-${course.id}`} course={course} />
                ))}
              </div>
            ) : (
              <div className="th-empty">
                <span className="th-empty__icon">
                  <i className="bi bi-calendar-plus" aria-hidden="true"></i>
                </span>
                <p className="th-empty__title">New cohorts are being scheduled</p>
                <p className="th-empty__text">
                  Check back shortly, or browse the catalogue to find an open cohort.
                </p>
                <Link to="/trainings" className="btn btn-primary">
                  Browse catalogue
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* ------------------------------------------------------- Why TrainHub */}
        <section className="th-section th-surface-alt" aria-labelledby="why-title">
          <div className="th-container-wide">
            <div className="th-section-head">
              <div>
                <p className="th-eyebrow">Why TrainHub</p>
                <h2 className="th-section-title" id="why-title">
                  A clearer way to choose training
                </h2>
                <p className="th-section-lead">
                  Every provider is verified before publishing, so you compare real
                  cohorts, real schedules and real prices in one place.
                </p>
              </div>
              <Link to="/contact" className="btn btn-ghost btn-sm">
                Talk to our team
                <i className="bi bi-arrow-right" aria-hidden="true"></i>
              </Link>
            </div>

            <div className="th-feature-grid">
              <article className="th-feature">
                <span className="th-feature__icon">
                  <i className="bi bi-patch-check" aria-hidden="true"></i>
                </span>
                <h3 className="th-feature__title">Verified providers</h3>
                <p className="th-feature__text">
                  Institutions submit registration and accreditation documents before a
                  single cohort goes live on the platform.
                </p>
              </article>
              <article className="th-feature">
                <span className="th-feature__icon th-feature__icon--green">
                  <i className="bi bi-calendar3" aria-hidden="true"></i>
                </span>
                <h3 className="th-feature__title">Transparent cohorts</h3>
                <p className="th-feature__text">
                  Start dates, schedules, venues and seat counts come straight from the
                  provider — no brochures, no guesswork.
                </p>
              </article>
              <article className="th-feature">
                <span className="th-feature__icon th-feature__icon--orange">
                  <i className="bi bi-shield-check" aria-hidden="true"></i>
                </span>
                <h3 className="th-feature__title">Secure enrolment</h3>
                <p className="th-feature__text">
                  Pay through PesaPal, keep your receipts in one place and track progress
                  from your learning dashboard.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- CTA */}
        <section className="th-container-wide" style={{ paddingBottom: "var(--th-section-y)" }}>
          <div className="th-cta">
            <div>
              <h2 className="th-cta__title">Bring accredited training to your team</h2>
              <p className="th-cta__text">
                Publish cohorts, manage enrolments and issue verifiable certificates. Join
                Tanzania&apos;s growing network of training providers.
              </p>
            </div>
            <div className="th-cta__actions">
              <Link to="/tenant-register" className="btn btn-light">
                Join as provider
              </Link>
              <Link to="/trainings" className="btn btn-outline-light">
                Explore trainings
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
