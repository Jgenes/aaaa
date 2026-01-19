// CourseContentSideBar.jsx
export default function CourseContentSidebar() {
  const lessons = [
    { title: "CHALLENGE #2: Video Solution", time: "7min", done: true },
    { title: "Introduction to Objects", time: "6min", done: true },
    { title: "Dot vs Bracket Notation", time: "19min", done: true },
    { title: "Object Methods", time: "23min", done: false },
    { title: "CHALLENGE #3: Coding Exercise", time: "", done: false },
    { title: "Iteration: The for Loop", time: "11min", done: true },
    { title: "Looping Arrays", time: "22min", done: true },
    { title: "The while Loop", time: "10min", done: false },
  ];

  return (
    <div className="course-sidebar border rounded p-3 bg-light">
      <div className="sidebar-header d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Course content</h6>
        <span className="ai-badge">✨ AI Assistant</span>
      </div>

      <ul className="lesson-list list-unstyled">
        {lessons.map((item, index) => (
          <li
            style={{ fontSize: "13px" }}
            key={index}
            className={`d-flex align-items-center mb-2 ${item.done ? "done" : ""}`}
          >
            <input
              type="checkbox"
              checked={item.done}
              readOnly
              className="me-2"
            />
            <div>
              <p className="mb-0">{item.title}</p>
              {item.time && <small className="text-muted">{item.time}</small>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
