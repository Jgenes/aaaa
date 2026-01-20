import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../App.css";
import "../index.css";
export default function Learning() {
  const courses = [
    {
      title: "The Complete JavaScript Course 2025: From Zero to Expert!",
      instructor: "Jonas Schmedtmann",
      progress: 18,
      rating: 5,
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Try Django 2.2 - Web Development with Python 3.6+",
      instructor: "Justin Mitchel",
      progress: 36,
      rating: 0,
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Forex Trading made easy as ABC - With LIVE Examples",
      instructor: "Joseph Siaw",
      progress: 0,
      rating: null,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "PHP for Beginners: The Complete PHP MySQL PDO Course",
      instructor: "Web Coding",
      progress: 0,
      rating: null,
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="learning-page">
      <NavBar />

      {/* ===== DARK HEADER ===== */}
      <section
        className="learning-header"
        style={{ backgroundColor: "#eef6ff" }}
      >
        <div className="container">
          <h1 className="main-title">My learning</h1>
          <div className="learning-tabs">
            <span className="active">All courses</span>
            <span>My Lists</span>
            <span>Wishlist</span>
            <span>Certifications</span>
            <span>Archived</span>
            <span>Learning tools</span>
          </div>
        </div>
      </section>

      {/* ===== STREAK SECTION ===== */}
      <section className="container mt-4">
        <div className="streak-card">
          <div className="streak-left">
            <h5>Start a weekly streak</h5>
            <p>One ring down! Now, watch your course(s).</p>
          </div>

          <div className="streak-metrics">
            <div className="metric-item">
              <div className="metric-icon">🔥</div>
              <div className="metric-info">
                <strong>0</strong> <span>weeks</span>
                <small>Current streak</small>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-progress-circle">
                <div className="inner-circle"></div>
              </div>
              <div className="metric-info">
                <div className="dot-info">
                  <span className="dot orange"></span> 0/30 course min
                </div>
                <div className="dot-info">
                  <span className="dot green"></span> 1/1 visit
                </div>
                <small>Jan 18 - 25</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSES GRID ===== */}
      <section className="container mt-5 mb-5">
        <div className="course-grid-custom">
          {" "}
          {/* This activates your CSS Grid */}
          {courses.map((course, index) => (
            <div className="course-item" key={index}>
              {" "}
              {/* Matches .course-item */}
              <div className="img-wrapper">
                {" "}
                {/* Matches .img-wrapper */}
                <img src={course.image} alt={course.title} />
                <button className="options-btn">⋮</button>{" "}
                {/* Matches .options-btn */}
              </div>
              <div className="course-info">
                {" "}
                {/* Matches .course-info */}
                <h3 className="title-text">{course.title}</h3>{" "}
                {/* Matches .title-text */}
                <p className="instructor-text">{course.instructor}</p>
                {course.progress > 0 ? (
                  <div className="progress-section">
                    <div className="bar-bg">
                      {" "}
                      {/* Matches .bar-bg */}
                      <div
                        className="bar-fill"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-meta">
                      <span>{course.progress}% complete</span>
                      <span className="stars">
                        {"★".repeat(course.rating || 5)}
                      </span>
                    </div>
                    <p className="your-rating">Your rating</p>
                  </div>
                ) : (
                  <div className="start-btn-area">
                    <div className="divider"></div>
                    <a href="#" className="start-link">
                      START COURSE
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
