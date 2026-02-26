import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import "../App.css";

export default function Learning() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:8000/api/my-learning",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const formattedCourses = response.data.map((item) => ({
          id: item.course?.id,
          title: item.course?.title || "Untitled Course",
          // HAPA NDIPO MABADILIKO YALIPO: Tunachukua jina la Provider
          providerName: item.course?.provider?.name || "Official Provider",
          progress: item.progress || 0,
          rating: item.rating || 5,
          image: item.course?.banner
            ? `http://localhost:8000/${item.course.banner}`
            : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='180'%3E%3Crect fill='%23ccc' width='300' height='180'/%3E%3Ctext x='50%25' y='50%25' fill='%23999' text-anchor='middle' dy='.3em' font-size='14'%3ENo Preview%3C/text%3E%3C/svg%3E",
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
    <div className="learning-page bg-light min-vh-100">
      <NavBar />

      <section
        className="learning-header text-white"
        style={{ backgroundColor: "#1c1d1f", padding: "40px 0" }}
      >
        <div className="container">
          <h1 className="fw-bold mb-3" style={{ fontSize: "28px" }}>
            My learning
          </h1>
          <div className="d-flex gap-4 border-bottom border-secondary">
            <span className="pb-2 border-bottom border-4 border-white fw-bold">
              My courses
            </span>
            <span className="pb-2 text-secondary">Certifications</span>
          </div>
        </div>
      </section>

      <section className="container mt-5 mb-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : courses.length > 0 ? (
          // ... sehemu nyingine za code ...

<div className="course-grid-custom">
  {courses.map((course) => (
    <div className="prof-card" key={course.id}>
      {/* Image Section with Overlay */}
      <div className="prof-card-img">
        <img src={course.image} alt={course.title} />
        <div className="prof-overlay">
          {/* IMEBADILISHWA: Kutoka /learn/ kwenda /learning/ */}
          <Link to={`/learning/${course.id}`} className="prof-play-btn">
            <i className="bi bi-play-fill"></i>
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="prof-card-content">
        <h3 className="prof-course-title" title={course.title}>
          {course.title}
        </h3>
        <p className="prof-provider-name">{course.providerName}</p>

        <div className="prof-card-footer">
          {course.progress > 0 ? (
            <div className="prof-prog-container">
              <div className="prof-prog-bar">
                <div
                  className="prof-prog-fill"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-1">
                <span className="small fw-bold text-muted">
                  {course.progress}% done
                </span>
                {/* IMEBADILISHWA: Link ya kuendelea (Optional but professional) */}
                <Link to={`/learning/${course.id}`} className="text-decoration-none small fw-bold text-primary">
                  Continue
                </Link>
              </div>
            </div>
          ) : (
            /* IMEBADILISHWA: Kutoka /learn/ kwenda /learning/ */
            <Link
              to={`/learning/${course.id}`}
              // className="prof-btn-start"
            >
                <button
                              className="btn btn-success w-100 fw-bold shadow-sm"
                              style={{ fontSize: "13px", borderRadius: "8px" }}
                            >
                              <i className="bi bi-play-circle me-2"></i>
                              Continue Learning
                            </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  ))}
</div>

// ... baki ya code ...
        ) : (
          <div className="text-center py-5">
            <p className="text-muted">You have not started any training!</p>
            <Link to="/trainings" className="btn btn-primary vvb">
              Browse Trainings
            </Link>
          </div>
        )}
      </section>

      <Footer />

      <style>{`
        .course-grid-custom {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }
        .prof-card {
          background: #fff;
          border: 1px solid #d1d7dc;
          transition: 0.3s;
        }
        .prof-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .prof-card-img { position: relative; height: 135px; overflow: hidden; }
        .prof-card-img img { width: 100%; height: 100%; object-fit: cover; }
        .prof-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.4); display: flex; justify-content: center;
          align-items: center; opacity: 0; transition: 0.3s;
        }
        .prof-card:hover .prof-overlay { opacity: 1; }
        .prof-play-btn {
          background: #fff; color: #000; width: 45px; height: 45px;
          border-radius: 50%; display: flex; justify-content: center;
          align-items: center; text-decoration: none; font-size: 20px;
        }
        .prof-card-content { padding: 12px; }
        .prof-course-title {
          font-size: 15px; font-weight: 700; color: #1c1d1f;
          height: 40px; overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-bottom: 4px;
        }
        .prof-provider-name { font-size: 12px; color: #6a6f73; margin-bottom: 8px; }
        .prof-prog-bar { background: #d1d7dc; height: 2px; border-radius: 2px; }
        .prof-prog-fill { background: #5624d0; height: 100%; }
        .prof-btn-start {
          display: block; width: 100%; padding: 6px; border: 1px solid #1c1d1f;
          color: #1c1d1f; text-align: center; text-decoration: none;
          font-weight: 700; font-size: 13px;
        }
        .prof-btn-start:hover { background: #f7f9fa; }
      `}</style>
    </div>
  );
}
