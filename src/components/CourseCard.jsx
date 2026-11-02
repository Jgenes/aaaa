import { Link } from "react-router-dom";
import Banner1 from "../assets/ict-pic (1).jpg";
import MediaImage from "./MediaImage";
import { cohortAvailability, formatDate } from "../api/catalogue";

/**
 * Shared course tile used by the home page and the catalogue.
 *
 * Accepts a course normalised by `src/api/catalogue.js` (recommended) or a
 * raw API record. Enrolment state always comes from `cohortAvailability()` so
 * the badge here matches the button on the course detail page.
 */
export default function CourseCard({ course, className = "" }) {
  if (!course) return null;

  const cohorts = Array.isArray(course.cohorts) ? course.cohorts : [];
  const cohort =
    course.mainCohort ||
    cohorts.find((item) => cohortAvailability(item).open) ||
    cohorts[0] ||
    null;

  const isEnrolled = Boolean(course.isEnrolled ?? course.is_enrolled);
  const bannerPath = course.banner || course.image || null;
  const availability = cohortAvailability(cohort);

  let statusLabel = availability.label;
  let statusClass = "course-card__status--closed";

  if (isEnrolled) {
    statusLabel = "In your learning";
    statusClass = "course-card__status--open";
  } else if (availability.open) {
    statusClass = "course-card__status--open";
  } else if (availability.isFull) {
    statusLabel = "Cohort full";
    statusClass = "course-card__status--full";
  }

  const startDate = formatDate(cohort?.start_date, null);
  const providerName = course.provider?.name || "Verified provider";
  const price = Number(cohort?.price ?? course.price);
  const priceLabel =
    Number.isFinite(price) && price > 0 ? `TZS ${price.toLocaleString()}` : null;

  return (
    <article className={`course-card ${className}`}>
      <div className="course-card__media">
        <MediaImage path={bannerPath} fallback={Banner1} alt="" />
        {course.category && <span className="course-card__tag">{course.category}</span>}
        {isEnrolled && (
          <span
            className="course-card__tag course-card__tag--muted"
            style={{ left: "auto", right: "0.6rem" }}
          >
            Enrolled
          </span>
        )}
      </div>

      <div className="course-card__body">
        <h3 className="course-card__title">
          <Link to={isEnrolled ? `/learning/${course.id}` : `/course/${course.id}`}>
            {course.title || "Untitled training"}
          </Link>
        </h3>

        <div className="course-card__provider">
          <span className="th-avatar" aria-hidden="true">
            {course.provider?.logo ? (
              <MediaImage path={course.provider.logo} alt="" fallback={null} />
            ) : (
              providerName.charAt(0)
            )}
          </span>
          <span>{providerName}</span>
        </div>

        <div className="course-card__meta">
          {startDate && (
            <span className="course-card__meta-item">
              <i className="bi bi-calendar3" aria-hidden="true"></i>
              Starts {startDate}
            </span>
          )}
          {course.mode && (
            <span className="course-card__meta-item">
              <i className="bi bi-broadcast" aria-hidden="true"></i>
              {course.mode}
            </span>
          )}
          {priceLabel && (
            <span className="course-card__meta-item">
              <i className="bi bi-tag" aria-hidden="true"></i>
              {priceLabel}
            </span>
          )}
        </div>

        <div className="course-card__footer">
          <span className={`course-card__status ${statusClass}`}>{statusLabel}</span>
          <span className="course-card__cta" aria-hidden="true">
            {isEnrolled ? "Continue" : "View details"}
            <i className="bi bi-arrow-right"></i>
          </span>
        </div>
      </div>
    </article>
  );
}
