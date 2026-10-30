function formatDuration(duration) {
  if (duration === null || duration === undefined || duration === "") return "10 min";
  if (typeof duration === "number" || /^\d+(\.\d+)?$/.test(String(duration).trim())) {
    return `${duration} min`;
  }
  return String(duration);
}

export default function CourseContentSidebar({
  modules,
  onLessonSelect,
  activeLessonTitle,
  activeLessonId,
}) {
  const lessons = Array.isArray(modules) ? modules : [];
  const completed = lessons.filter((lesson) => lesson.is_completed).length;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div className="th-curriculum">
      <div className="th-curriculum__head">
        <div className="th-curriculum__head-top">
          <div>
            <p className="th-eyebrow">Curriculum</p>
            <h2 className="th-curriculum__title">Course contents</h2>
          </div>

          <div
            className="th-curriculum__ring"
            style={{ "--ring-value": percent }}
            role="img"
            aria-label={`${percent}% of sessions completed`}
          >
            <span aria-hidden="true">{percent}%</span>
          </div>
        </div>

        <p className="th-curriculum__sub">
          {completed} of {lessons.length} sessions completed
        </p>

        <div
          className="th-progress"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Course completion"
        >
          <span
            className="th-progress__fill th-progress__fill--accent"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {lessons.length === 0 ? (
        <p className="th-curriculum__empty">
          Sessions for this course have not been published yet. Check back soon.
        </p>
      ) : (
        <ol className="th-curriculum__list">
          {lessons.map((lesson, index) => {
            const isActive =
              (activeLessonId !== undefined && activeLessonId !== null
                ? lesson.id === activeLessonId
                : false) || activeLessonTitle === lesson.title;
            const hasVideo = Boolean(lesson.video_url);
            const className = [
              "th-curriculum__item",
              lesson.is_completed ? "is-done" : "",
              isActive ? "is-active" : "",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <li key={lesson.id ?? `${lesson.title}-${index}`}>
                <button
                  type="button"
                  onClick={() => onLessonSelect(lesson)}
                  aria-current={isActive ? "true" : undefined}
                  className={className}
                >
                  <span className="th-curriculum__marker" aria-hidden="true">
                    {lesson.is_completed ? (
                      <i className="bi bi-check-lg"></i>
                    ) : isActive ? (
                      <i className="bi bi-play-fill"></i>
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span className="th-curriculum__text">
                    <span className="th-curriculum__name">{lesson.title}</span>
                    <span className="th-curriculum__meta">
                      <i
                        className={`bi ${hasVideo ? "bi-camera-video" : "bi-file-text"}`}
                        aria-hidden="true"
                      ></i>
                      {hasVideo ? "Video" : "Reading"}
                      <span aria-hidden="true">·</span>
                      {formatDuration(lesson.duration)}
                    </span>
                  </span>

                  {isActive && <span className="th-curriculum__badge">Now</span>}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
