import { Link } from "react-router-dom";
import Banner1 from "../assets/ict-pic (1).jpg";

const MEDIA_BASE = "http://localhost:8000";

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Shared course tile used by the home page and the catalogue.
 * Accepts the raw API course plus the derived fields computed by each page
 * (`isEnrolled`, `mainCohort`, `enrollmentOpen`, `isFull`, `isPastDeadline`).
 */
export default function CourseCard({ course, className = "" }) {
  const cohort = course.mainCohort || course.cohorts?.find((c) => c.status?.toUpperCase() === "OPEN");
  const isEnrolled = Boolean(course.isEnrolled);
  const image = course.banner
    ? `${MEDIA_BASE}/${course.banner}`
    : course.image || Banner1;

  const remainingSeats =
    cohort?.remaining_seats !== undefined
      ? Number(cohort.remaining_seats)
      : cohort?.capacity !== undefined
        ? Number(cohort.capacity) - Number(cohort.seats_taken || 0)
        : null;

  const deadline = cohort?.registration_deadline ? new Date(cohort.registration_deadline) : null;
  const deadlinePassed = deadline ? deadline < new Date() : false;
  const isFull = course.isFull ?? (remainingSeats !== null && remainingSeats <= 0);
  const isOpen =
    course.enrollmentOpen ??
    (cohort ? cohort.status?.toUpperCase() === "OPEN" && !deadlinePassed && !isFull : false);

  let statusLabel = "Cohort dates coming soon";
  let statusClass = "course-card__status--closed";

  if (isEnrolled) {
    statusLabel = "In your learning";
    statusClass = "course-card__status--open";
  } else if (isOpen) {
    statusLabel = remainingSeats !== null ? `${remainingSeats} seats left` : "Enrolment open";
    statusClass = "course-card__status--open";
  } else if (isFull) {
    statusLabel = "Cohort full";
    statusClass = "course-card__status--full";
  } else if (deadlinePassed) {
    statusLabel = "Enrolment closed";
  }

  const startDate = formatDate(cohort?.start_date);
  const providerName = course.provider?.name || "Verified provider";

  return (
    <article className={`course-card ${className}`}>
      <div className="course-card__media">
        <img
          src={image}
          alt=""
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = Banner1;
          }}
        />
        {course.category && <span className="course-card__tag">{course.category}</span>}
        {isEnrolled && (
          <span className="course-card__tag course-card__tag--muted" style={{ left: "auto", right: "0.6rem" }}>
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
              <img src={`${MEDIA_BASE}/storage/uploads/${course.provider.logo}`} alt="" />
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
