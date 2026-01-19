import { useState } from "react";
import "../App.css";
import CourseDescription from "./CourseDescription";

export default function ProgramTabs() {
  const [previewVideo, setPreviewVideo] = useState(null);

  const curriculum = [
    {
      sectionTitle: "Course Introduction",
      lectures: 5,
      duration: "17min",
      unlocked: true,
      lessons: [
        {
          title: "Introduction",
          time: "2:03",
          video: "/videos/intro.mp4",
          preview: true,
        },
        {
          title: "Course Overview Don't Skip this Lecture!",
          time: "8:00",
          preview: true,
        },
        {
          title: "FAQ - Frequently Asked Questions",
          time: "0:26",
          preview: true,
        },
        {
          title: "Course Set-Up and Installation",
          time: "5:42",
          preview: true,
        },
        {
          title: "Notes on Updates Versions of Django",
          time: "1:17",
          preview: true,
        },
      ],
    },
    {
      sectionTitle: "Front-End Introduction",
      lectures: 1,
      duration: "7min",
      unlocked: true,
      lessons: [
        {
          title: "What is the Web?",
          time: "6:43",
          preview: true,
          video: "/videos/web.mp4",
        },
      ],
    },
    {
      sectionTitle: "HTML Level One - Basics",
      lectures: 8,
      duration: "50min",
      unlocked: false,
      lessons: [
        { title: "HTML Introduction", time: "6:10" },
        { title: "HTML Tags", time: "7:20" },
      ],
    },
    {
      sectionTitle: "HTML Level Two - Advanced",
      lectures: 9,
      duration: "1hr 9min",
      unlocked: false,
      lessons: [
        { title: "Forms & Inputs", time: "9:15" },
        { title: "Semantic HTML", time: "8:30" },
      ],
    },
    {
      sectionTitle: "CSS Level One - Basics",
      lectures: 9,
      duration: "1hr 3min",
      unlocked: false,
      lessons: [
        { title: "CSS Syntax", time: "7:00" },
        { title: "Selectors & Colors", time: "8:40" },
      ],
    },
  ];

  return (
    <div className="container mt-5">
      {/* COURSE CONTENT */}
      <h5>Course content</h5>
      <div className="accordion mt-3" id="curriculumAccordion">
        {curriculum.map((section, index) => (
          <div className="accordion-item mb-2" key={index}>
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed d-flex justify-content-between"
                type="button"
                data-bs-toggle={section.unlocked ? "collapse" : ""}
                data-bs-target={section.unlocked ? `#section${index}` : ""}
                style={{
                  cursor: section.unlocked ? "pointer" : "not-allowed",
                  backgroundColor: "#f8f9fa",
                }}
                title={!section.unlocked ? "Complete enrollment to unlock" : ""}
              >
                <span>
                  {section.unlocked ? "▼ " : "🔒 "}
                  {section.sectionTitle}
                </span>
                <small className="text-muted">
                  {section.lectures} lectures • {section.duration}
                </small>
              </button>
            </h2>

            {section.unlocked && (
              <div
                id={`section${index}`}
                className="accordion-collapse collapse"
                data-bs-parent="#curriculumAccordion"
              >
                <div className="accordion-body p-0">
                  {section.lessons.map((lesson, i) => (
                    <div
                      key={i}
                      className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
                      style={{
                        fontSize: "13px",
                        cursor: lesson.preview ? "pointer" : "default",
                      }}
                      onClick={() => {
                        if (lesson.preview && lesson.video)
                          setPreviewVideo(lesson.video);
                      }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span>▶</span>
                        <span>{lesson.title}</span>
                        {lesson.preview && (
                          <span className="text-primary">Preview</span>
                        )}
                      </div>
                      <div className="text-muted">{lesson.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* REQUIREMENTS */}
      <div className="mt-5">
        <h5 style={{ fontSize: "15px" }}>Requirements</h5>
        <ul style={{ fontSize: "13px" }}>
          <li>Basic programming knowledge</li>
          <li>Familiarity with JavaScript</li>
          <li>Willingness to learn AI concepts</li>
        </ul>
      </div>

      {/* DESCRIPTION */}
      <div className="mt-5">
        <h5 style={{ fontSize: "15px" }}>Description</h5>
        <CourseDescription />
      </div>

      {/* VIDEO PREVIEW MODAL */}
      {previewVideo && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.7)" }}
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="modal-dialog modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title">Preview Lesson</h6>
                <button
                  className="btn-close"
                  onClick={() => setPreviewVideo(null)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <video
                  width="100%"
                  height="auto"
                  controls
                  autoPlay
                  onEnded={() => setPreviewVideo(null)}
                >
                  <source src={previewVideo} type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
