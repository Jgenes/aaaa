import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import CourseContentSidebar from "../components/CourseContentSideBar";
import ReviewModal from "../components/ReviewModal"; // Hakikisha umetengeneza hii component
import api from "../api/axio";
import { toast } from "react-toastify";

export default function CourseLearning() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false); // State mpya ya modal

  const fetchCourseDetails = async (showLoading = true) => {
    if (!courseId || courseId === "undefined") return;
    try {
      if (showLoading) setLoading(true);
      const token = localStorage.getItem("token");
      const res = await api.get(`/courses/${courseId}/learning`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCourse(res.data);

      if (!activeLesson && res.data?.modules?.[0]) {
        setActiveLesson(res.data.modules[0]);
      }
    } catch (error) {
      console.error("Error:", error);
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const handleMarkAsComplete = async (lessonId) => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      await api.post(
        `/courses/${courseId}/complete-lesson`,
        { lesson_id: lessonId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success("Somo limekamilika!");

      // Vuta data upya
      const res = await api.get(`/courses/${courseId}/learning`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(res.data);

      // Kitaalamu: Kama amefikisha 100%, trigger modal ya review
      if (res.data.progress_percentage === 100) {
        setShowReviewModal(true);
      }
    } catch (error) {
      toast.error("Imeshindwa kuhifadhi maendeleo yako.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  return (
    <div className="bg-light min-vh-100">
      <NavBar />

      {/* HEADER SECTION */}
      <div
        className="bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center sticky-top shadow"
        style={{ zIndex: 1020 }}
      >
        <div className="d-flex align-items-center">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-sm btn-outline-light me-3"
          >
            <i className="bi bi-arrow-left"></i>
          </button>
          <div>
            <span className="fw-bold d-block">{course?.title}</span>
            {/* Button ya hiari kutoa review muda wowote */}
            <button 
              className="btn btn-sm p-0 text-warning border-0" 
              onClick={() => setShowReviewModal(true)}
              style={{ fontSize: '12px' }}
            >
              <i className="bi bi-star-fill me-1"></i> Rate this course
            </button>
          </div>
        </div>
        <div className="w-25 d-none d-md-block">
          <small className="text-secondary small">
            Course Progress: {course?.progress_percentage || 0}%
          </small>
          <div className="progress mt-1" style={{ height: "6px" }}>
            <div
              className="progress-bar bg-success progress-bar-striped progress-bar-animated"
              style={{ width: `${course?.progress_percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="container-fluid p-0">
        <div className="row g-0">
          <div className="col-lg-8 bg-black">
            {/* VIDEO PLAYER AREA */}
            <div className="ratio ratio-16x9 shadow-lg bg-dark">
              {activeLesson?.video_url ? (
                <video
                  key={activeLesson.video_url}
                  controls
                  controlsList="nodownload"
                  autoPlay
                  className="w-100 h-100"
                >
                  <source src={activeLesson.video_url} type="video/mp4" />
                </video>
              ) : (
                <div className="d-flex flex-column align-items-center justify-content-center text-white p-5 h-100">
                  <i className="bi bi-file-earmark-text display-1 mb-3 text-secondary"></i>
                  <h4>Reading Material Only</h4>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-bottom min-vh-50">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h4 className="fw-bold">
                  {activeLesson?.title || "Chagua Somo"}
                </h4>

                {activeLesson && (
                  <button
                    onClick={() => handleMarkAsComplete(activeLesson.id)}
                    disabled={activeLesson.is_completed || isUpdating}
                    className={`btn btn-sm ${activeLesson.is_completed ? "btn-success" : "btn-outline-success"}`}
                  >
                    {isUpdating ? (
                      <span className="spinner-border spinner-border-sm me-1"></span>
                    ) : activeLesson.is_completed ? (
                      <i className="bi bi-check-all me-1"></i>
                    ) : null}
                    {activeLesson.is_completed
                      ? "Completed"
                      : "Mark as Complete"}
                  </button>
                )}
              </div>

              <ul className="nav nav-tabs mb-4 border-0">
                {["overview", "resources", "links"].map((tab) => (
                  <li className="nav-item" key={tab}>
                    <button
                      className={`nav-link border-0 border-bottom border-3 text-capitalize px-4 ${
                        activeTab === tab
                          ? "border-primary text-primary fw-bold"
                          : "text-muted border-transparent"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="tab-content">
                {activeTab === "overview" && (
                  <div className="animate__animated animate__fadeIn">
                    <p className="text-secondary mb-4">
                      {activeLesson?.description}
                    </p>
                    <div className="bg-light p-4 rounded border-start border-4 border-primary">
                      <h6 className="fw-bold">Lesson Notes</h6>
                      <div style={{ whiteSpace: "pre-wrap" }}>
                        {activeLesson?.notes || "No notes."}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div
            className="col-lg-4 border-start bg-white shadow-sm overflow-auto"
            style={{ height: "calc(100vh - 65px)" }}
          >
            <CourseContentSidebar
              modules={course?.modules}
              onLessonSelect={(lesson) => {
                setActiveLesson(lesson);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              activeLessonTitle={activeLesson?.title}
            />
          </div>
        </div>
      </div>
      <Footer />

      {/* MODAL YA REVIEW - Inaonekana pale tu showReviewModal inapokuwa true */}
      {showReviewModal && (
        <ReviewModal 
          courseId={courseId} 
          onClose={() => setShowReviewModal(false)} 
        />
      )}
    </div>
  );
}