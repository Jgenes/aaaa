import React, { useEffect, useState } from "react";
import axios from "axios";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../App.css";
import "../index.css";

export default function Learning() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token"); // Token uliyohifadhi wakati wa login
        const response = await axios.get(
          "http://localhost:8000/api/my-learning",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Tunazibadilisha data kutoka DB kwenda kwenye format ya UI
        const formattedCourses = response.data.map((item) => ({
          id: item.id,
          title: item.course?.title || "Unknown Course",
          instructor: item.course?.instructor || "Tutor",
          progress: item.progress || 0, // Hakikisha una column ya progress
          rating: item.rating || 5,
          image: item.course?.image
            ? `http://localhost:8000/storage/${item.course.image}`
            : "https://via.placeholder.com/300",
        }));

        setCourses(formattedCourses);
      } catch (error) {
        console.error("Error fetching learning data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="learning-page">
      <NavBar />

      {/* ===== DARK HEADER ===== */}
      <section
        className="learning-header"
        style={{ backgroundColor: "#111827" }}
      >
        <div className="container">
          <h1 className="main-title" style={{ fontSize: "20px" }}>
            My learning
          </h1>
          <div className="learning-tabs">
            <span className="active">My courses</span>
            <span>Certifications</span>
          </div>
        </div>
      </section>

      {/* ===== STREAK SECTION ===== */}
      <section className="container mt-4">
        <div className="streak-card">
          <div className="streak-left">
            <h5>Start a weekly streak</h5>
            <p>Keep learning to maintain your streak!</p>
          </div>
          <div className="streak-metrics">
            <div className="metric-item">
              <div className="metric-icon">🔥</div>
              <div className="metric-info">
                <strong>0</strong> <span>weeks</span>
                <small>Current streak</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSES GRID ===== */}
      <section className="container mt-5 mb-5">
        {loading ? (
          <div className="text-center">Inapakia kozi zako...</div>
        ) : courses.length > 0 ? (
          <div className="course-grid-custom">
            {courses.map((course) => (
              <div className="course-item" key={course.id}>
                <div className="img-wrapper">
                  <img src={course.image} alt={course.title} />
                  <button className="options-btn">⋮</button>
                </div>
                <div className="course-info">
                  <h3 className="title-text">{course.title}</h3>
                  <p className="instructor-text">{course.instructor}</p>

                  {course.progress > 0 ? (
                    <div className="progress-section">
                      <div className="bar-bg">
                        <div
                          className="bar-fill"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="progress-meta">
                        <span>{course.progress}% complete</span>
                        <span className="stars">
                          {"★".repeat(course.rating)}
                        </span>
                      </div>
                      <p className="your-rating">Your rating</p>
                    </div>
                  ) : (
                    <div className="start-btn-area">
                      <div className="divider"></div>
                      <a href={`/learn/${course.id}`} className="start-link">
                        Start Training
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center">
            <p>No any training started.</p>
            <a href="/trainings" className="btn btn-primary checkOutBtn">
              Explore Trainings
            </a>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
