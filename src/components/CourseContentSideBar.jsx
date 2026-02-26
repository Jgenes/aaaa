import React from "react";

export default function CourseContentSidebar({
  modules,
  onLessonSelect,
  activeLessonTitle,
}) {
  return (
    <div className="course-sidebar p-0">
      <div className="p-3 border-bottom bg-light sticky-top">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">Masomo ya Kozi</h6>
          <span className="badge bg-dark text-white">
            {modules?.length || 0} Sessions
          </span>
        </div>
      </div>

      <ul className="list-unstyled mb-0">
        {modules?.map((item, index) => {
          const isActive = activeLessonTitle === item.title;
          const hasVideo = !!item.video_url;

          return (
            <li
              key={index}
              className={`p-3 border-bottom d-flex align-items-center transition-all ${
                isActive
                  ? "bg-primary-subtle border-start border-primary border-4"
                  : "hover-bg-light"
              }`}
              style={{ cursor: "pointer", fontSize: "13.5px" }}
              onClick={() => onLessonSelect(item)}
            >
              {/* Checkbox Icon */}
              <div className="me-3">
                {isActive ? (
                  <i className="bi bi-play-circle-fill text-primary h5"></i>
                ) : (
                  <i className="bi bi-circle text-muted"></i>
                )}
              </div>

              <div className="flex-grow-1">
                <p
                  className={`mb-0 ${isActive ? "fw-bold text-primary" : "text-dark"}`}
                >
                  {index + 1}. {item.title}
                </p>
                <div className="d-flex align-items-center mt-1">
                  <span className="badge bg-light text-muted fw-normal me-2 border">
                    {hasVideo ? (
                      <i className="bi bi-camera-video me-1"></i>
                    ) : (
                      <i className="bi bi-file-text me-1"></i>
                    )}
                    {hasVideo ? "Video" : "Notes"}
                  </span>
                  <small className="text-muted">
                    {item.duration || "10 min"}
                  </small>
                </div>
              </div>

              {isActive && (
                <div className="ms-auto">
                  <span className="badge bg-primary">Now</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa; }
        .transition-all { transition: all 0.2s ease; }
      `}</style>
    </div>
  );
}
