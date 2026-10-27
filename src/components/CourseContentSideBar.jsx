export default function CourseContentSidebar({
  modules,
  onLessonSelect,
  activeLessonTitle,
}) {
  const lessons = modules || [];
  const completed = lessons.filter((lesson) => lesson.is_completed).length;
  const percent = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div className="course-sidebar">
      <div className="p-3 border-bottom bg-white sticky-top" style={{ zIndex: 2 }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h2 className="mb-0" style={{ fontSize: "var(--th-fs-base)", fontWeight: 700 }}>
            Course contents
          </h2>
          <span
            className="badge bg-primary-subtle text-primary"
            aria-label={`${lessons.length} sessions`}
          >
            {lessons.length} sessions
          </span>
        </div>

        <div
          className="progress"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Course completion"
        >
          <div
            className="progress-bar"
            style={{ width: `${percent}%`, backgroundColor: "var(--th-accent)" }}
          ></div>
        </div>
        <p className="text-muted mb-0 mt-2" style={{ fontSize: "var(--th-fs-xs)" }}>
          {completed} of {lessons.length} sessions completed
        </p>
      </div>

      <ul className="list-unstyled mb-0">
        {lessons.map((item, index) => {
          const isActive = activeLessonTitle === item.title;
          const hasVideo = Boolean(item.video_url);

          return (
            <li key={index} className="border-bottom">
              <button
                type="button"
                onClick={() => onLessonSelect(item)}
                aria-current={isActive ? "true" : undefined}
                className="w-100 text-start border-0 bg-transparent d-flex align-items-start gap-3 p-3"
                style={{
                  background: isActive ? "var(--th-blue-50)" : "transparent",
                  boxShadow: isActive ? "inset 3px 0 0 var(--th-primary)" : "none",
                  transition: "background-color 120ms ease",
                }}
              >
                <span
                  className="flex-shrink-0 d-inline-flex align-items-center justify-content-center"
                  style={{
                    width: 26,
                    height: 26,
                    background: item.is_completed ? "var(--th-success-soft)" : "#fff",
                    border: "1px solid var(--th-line)",
                    color: item.is_completed ? "var(--th-success)" : "var(--th-muted)",
                    fontSize: 12,
                  }}
                  aria-hidden="true"
                >
                  {item.is_completed ? (
                    <i className="bi bi-check-lg"></i>
                  ) : isActive ? (
                    <i className="bi bi-play-fill"></i>
                  ) : (
                    index + 1
                  )}
                </span>

                <span className="flex-grow-1" style={{ minWidth: 0 }}>
                  <span
                    className="d-block"
                    style={{
                      fontSize: "var(--th-fs-sm)",
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--th-primary)" : "var(--th-ink)",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="d-flex align-items-center gap-2 mt-1 text-muted"
                    style={{ fontSize: "var(--th-fs-2xs)" }}
                  >
                    <i
                      className={`bi ${hasVideo ? "bi-camera-video" : "bi-file-text"}`}
                      aria-hidden="true"
                    ></i>
                    {hasVideo ? "Video" : "Reading"}
                    <span aria-hidden="true">·</span>
                    {item.duration || "10 min"}
                  </span>
                </span>

                {isActive && (
                  <span className="badge bg-primary-subtle text-primary flex-shrink-0">Now</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
