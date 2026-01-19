import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../App.css";

export default function Learning() {
  const courses = [
    {
      title: "JavaScript Fundamentals",
      progress: 35,
      image:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Fullstack Web Development",
      progress: 60,
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Data Science & AI",
      progress: 15,
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "PHP & MySQL Backend",
      progress: 80,
      image:
        "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <>
      <NavBar />

      {/* ===== MY LEARNING HEADER ===== */}
      <section className="learning-header">
        <div className="container">
          <h2 style={{ fontSize: "20px" }}>My learning</h2>

          <div className="learning-tabs">
            <span className="active">All courses</span>
            <span>Onprogress</span>
            <span>Finished</span>
            <span>Certifications</span>
          </div>
        </div>
      </section>

      {/* ===== STREAK SECTION ===== */}
      <section className="container mt-4">
        <div className="streak-card">
          <div>
            <h5>Start a weekly streak</h5>
            <p>Let’s chip away at your learning goals.</p>
          </div>

          <div className="streak-right">
            <div className="streak-count">
              <strong>0</strong>
              <span>weeks</span>
              <small>Current streak</small>
            </div>

            <div className="streak-progress">
              <div className="circle">✔</div>
              <small>1 / 1 visit</small>
              <small className="muted">Jan 19 – 26</small>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSES GRID ===== */}
      <section className="container mt-5 mb-5">
        <div className="row">
          {courses.map((course, index) => (
            <div className="col-md-3 mb-4" key={index}>
              <a href="/courseLearning">
                <div className="course-card">
                  <img src={course.image} alt={course.title} />

                  <div className="course-body">
                    <h6>{course.title}</h6>

                    <div className="progress mt-2">
                      <div
                        className="progress-bar"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>

                    <small className="text-muted">
                      {course.progress}% complete
                    </small>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
