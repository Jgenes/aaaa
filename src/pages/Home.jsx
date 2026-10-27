import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axio";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CourseCard from "../components/CourseCard";
import HeroImage from "../assets/banner0.jpg";

const LOGO_VOLKSWAGEN =
  "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg";
const LOGO_SAMSUNG =
  "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg";
const LOGO_CISCO =
  "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg";
const LOGO_VIMEO = "https://upload.wikimedia.org/wikipedia/commons/9/9c/Vimeo_logo.svg";
const LOGO_PG =
  "https://upload.wikimedia.org/wikipedia/commons/8/85/Procter_%26_Gamble_logo.svg";
const LOGO_ERICSSON =
  "https://upload.wikimedia.org/wikipedia/commons/0/0e/Ericsson_logo.svg";

const PARTNER_LOGOS = [
  { src: LOGO_VOLKSWAGEN, alt: "Volkswagen" },
  { src: LOGO_SAMSUNG, alt: "Samsung" },
  { src: LOGO_CISCO, alt: "Cisco" },
  { src: LOGO_VIMEO, alt: "Vimeo" },
  { src: LOGO_PG, alt: "Procter & Gamble" },
  { src: LOGO_ERICSSON, alt: "Ericsson" },
];

const LEARNING_PATHS = [
  {
    title: "Software Engineering",
    text: "Full-stack, mobile and quality engineering tracks",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=70",
  },
  {
    title: "Microsoft Excel",
    text: "Data analysis, reporting and automation",
    image:
      "https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&w=600&q=70",
  },
  {
    title: "Large Language Models",
    text: "Applied AI and prompt engineering foundations",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=70",
  },
  {
    title: "Cloud Computing",
    text: "Cloud fundamentals, DevOps and infrastructure",
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=70",
  },
];

const FAQS = [
  {
    id: "faq-1",
    question: "Can I try TrainHub first, to make sure it's right for me?",
    answer:
      "Yes, we provide demo sessions and course outlines to help you decide which path fits your career goals perfectly.",
  },
  {
    id: "faq-2",
    question: "What is included in the Professional Track?",
    answer:
      "You get full access to live sessions, recorded materials, hands-on projects, and a verified industry certificate.",
  },
  {
    id: "faq-3",
    question: "How do I get my certificate?",
    answer:
      "Once you complete all modules and pass the final assessment, your certificate will be generated instantly in your profile.",
  },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState([]);
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

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
              <span className="hero__badge">
                <span className="hero__badge-star">
                  <i className="bi bi-star-fill" aria-hidden="true"></i>
                  4.8
                </span>
                Most trusted professional training platform in Tanzania
              </span>

              <h1 className="hero__title" id="hero-title">
                Elevate your career with{" "}
                <span className="hero__title-accent">industry-standard</span> training.
              </h1>

              <p className="hero__lead">
                Join over 5,000 professionals mastering new skills through expert-led
                courses, verified providers and real-world projects — delivered across
                Tanzania.
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
                  className="btn btn-outline-dark"
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

              <div className="hero__float hero__float--top">
                <span className="hero__float-icon">
                  <i className="bi bi-patch-check-fill" aria-hidden="true"></i>
                </span>
                <div>
                  <strong>Verified providers</strong>
                  <small>NACTE · VETA · TCU aligned</small>
                </div>
              </div>

              <div className="hero__float hero__float--bottom">
                <span className="hero__float-icon hero__float-icon--orange">
                  <i className="bi bi-mortarboard-fill" aria-hidden="true"></i>
                </span>
                <div>
                  <strong>Industry certificate</strong>
                  <small>Issued on completion</small>
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

        {/* ------------------------------------------------------- Partners */}
        <section className="th-section-tight th-surface-alt">
          <div className="th-container-wide text-center">
            <p className="th-eyebrow justify-content-center mb-4">
              Partnering with world-class organisations
            </p>
            <div className="th-logos">
              {PARTNER_LOGOS.map((logo) => (
                <img key={logo.alt} src={logo.src} alt={logo.alt} loading="lazy" />
              ))}
            </div>
            {providers.length > 0 && (
              <p className="text-muted mt-4 mb-0" style={{ fontSize: "var(--th-fs-sm)" }}>
                Trusted by {providers.length} accredited training provider
                {providers.length === 1 ? "" : "s"} across Tanzania.
              </p>
            )}
          </div>
        </section>

        {/* -------------------------------------------------- Testimonials */}
        <section className="th-section" aria-labelledby="testimonials-title">
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
                  <>
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
                  </>
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

        {/* --------------------------------------------------- Learning paths */}
        <section className="th-section th-surface-alt" aria-labelledby="paths-title">
          <div className="th-container-wide">
            <div className="th-section-head">
              <div>
                <p className="th-eyebrow">Career and life skills</p>
                <h2 className="th-section-title" id="paths-title">
                  Learn essential career and life skills
                </h2>
                <p className="th-section-lead">
                  TrainingHub helps you build in-demand skills fast and advance your career.
                </p>
              </div>
            </div>

            <div className="course-grid">
              {LEARNING_PATHS.map((path) => (
                <Link
                  key={path.title}
                  to="/trainings"
                  className="th-path-card"
                  aria-label={`Explore ${path.title} trainings`}
                >
                  <img src={path.image} alt="" loading="lazy" />
                  <div className="th-path-card__body">
                    <h3 className="th-path-card__title">{path.title}</h3>
                    <p className="th-path-card__text">{path.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- FAQ */}
        <section className="th-section" aria-labelledby="faq-title">
          <div className="th-container-wide">
            <div className="row g-5">
              <div className="col-lg-4">
                <p className="th-eyebrow">Support</p>
                <h2 className="th-section-title" id="faq-title">
                  Frequently asked questions
                </h2>
                <p className="th-section-lead mb-4">
                  Everything you need to know about enrolling, learning and getting certified.
                </p>
                <Link to="/contact" className="btn btn-outline-dark">
                  Talk to our team
                  <i className="bi bi-chat-dots" aria-hidden="true"></i>
                </Link>
              </div>

              <div className="col-lg-8">
                <div className="accordion th-faq" id="homeFaq">
                  {FAQS.slice(0, showAllFaqs ? FAQS.length : 2).map((faq, index) => (
                    <div className="accordion-item" key={faq.id}>
                      <h3 className="accordion-header" id={`${faq.id}-heading`}>
                        <button
                          className={`accordion-button ${index > 0 ? "collapsed" : ""}`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#${faq.id}`}
                          aria-expanded={index === 0 ? "true" : "false"}
                          aria-controls={faq.id}
                        >
                          {faq.question}
                        </button>
                      </h3>
                      <div
                        id={faq.id}
                        className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`}
                        aria-labelledby={`${faq.id}-heading`}
                        data-bs-parent="#homeFaq"
                      >
                        <div className="accordion-body">{faq.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn btn-link mt-2"
                  onClick={() => setShowAllFaqs((prev) => !prev)}
                  aria-expanded={showAllFaqs}
                >
                  {showAllFaqs ? "Show fewer questions" : `Show all ${FAQS.length} questions`}
                  <i
                    className={`bi bi-chevron-${showAllFaqs ? "up" : "down"}`}
                    aria-hidden="true"
                  ></i>
                </button>
              </div>
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
