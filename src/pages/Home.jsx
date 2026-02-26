import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import PromoCards from "../components/PromoCards";
import api from "../api/axio";
import NavBar from "../components/NavBar";
import Banner1 from "../assets/ict-pic (1).jpg";
import Banner0 from "../assets/banner0.jpg"; 
import Footer from "../components/Footer";
import '../App.css'

// Logos asilia
const LOGO_VOLKSWAGEN = "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg";
const LOGO_SAMSUNG = "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg";
const LOGO_CISCO = "https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg";
const LOGO_VIMEO = "https://upload.wikimedia.org/wikipedia/commons/9/9c/Vimeo_logo.svg";
const LOGO_PG = "https://upload.wikimedia.org/wikipedia/commons/8/85/Procter_%26_Gamble_logo.svg";
const LOGO_ERICSSON = "https://upload.wikimedia.org/wikipedia/commons/0/0e/Ericsson_logo.svg";

export default function Home() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]); 
  const [reviews, setReviews] = useState([]); 
  const [activeTab, setActiveTab] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await api.get("/public-courses").catch(() => ({data: []}));
        const providerRes = await api.get("/top-providers").catch(() => ({data: []}));
        const reviewRes = await api.get("/public-reviews").catch(() => ({data: []}));

        if (courseRes.data) {
          const processed = courseRes.data.map(c => {
            // HAPA NDIO LOGIC YA KU-CHECK ENROLLMENT STATUS
            const hasCompletedEnrollment = c.enrollments?.some(
              (enrol) => enrol.status?.toLowerCase() === "completed"
            );

            return {
              ...c,
              isEnrolled: hasCompletedEnrollment, // Tunaongeza hii flag
              mainCohort: c.cohorts?.find(coh => coh.status?.toUpperCase() === "OPEN") || c.cohorts?.[0]
            };
          });

          setCourses(processed);
          const uniqueCats = [...new Set(processed.map(c => c.category))].filter(Boolean);
          if (uniqueCats.length > 0) setActiveTab(uniqueCats[0]);
          setCategories(uniqueCats);
        }
        
        setProviders(providerRes.data || []);
        setReviews(reviewRes.data || []);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const CourseItem = ({ course }) => {
    const cohort = course.mainCohort;
    const remainingSeats = cohort ? (parseInt(cohort.capacity) - parseInt(cohort.seats_taken || 0)) : 0;
    const finalImageUrl = course.banner ? `http://localhost:8000/${course.banner}` : Banner1;
    
    // Tunatumia flag tuliyotengeneza kwenye useEffect
    const isEnrolled = course.isEnrolled || false; 

    return (
      <div className="col-lg-3 col-md-4 col-sm-6 col-12">
        <div className="card h-100 shadow-sm border-0" style={{ borderRadius: "15px", overflow: "hidden" }}>
          <img src={finalImageUrl} className="card-img-top" style={{ height: "160px", objectFit: "cover" }} alt={course.title} onError={(e) => { e.target.src = Banner1; }} />
          <div className="card-body d-flex flex-column p-3">
            <h6 className="fw-bold mb-2" style={{ fontSize: "15px", height: "40px", overflow: "hidden" }}>{course.title}</h6>
            <div className="d-flex align-items-center mb-3">
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: "30px", height: "30px", fontSize: "12px", border: "1px solid #ddd" }}>
                {course.provider?.name?.charAt(0) || "T"}
              </div>
              <small className="text-muted text-truncate">{course.provider?.name || "Instructor"}</small>
            </div>
            <div className="mb-3 small text-muted">
              <div className="mb-1 text-truncate"><i className="bi bi-calendar-event me-2"></i>Starts: {cohort?.start_date ? new Date(cohort.start_date).toLocaleDateString() : "TBA"}</div>
              <div className="mb-1 text-danger fw-bold text-truncate"><i className="bi bi-calendar-x me-2"></i>Deadline: {cohort?.registration_deadline ? new Date(cohort.registration_deadline).toLocaleDateString() : "TBA"}</div>
              <div className="text-truncate"><i className="bi bi-people me-2"></i>Remaining: <span className="text-success fw-bold">{cohort ? remainingSeats : 0}</span></div>
            </div>
            <div className="mt-auto">
              <p 
                onClick={() => {
                  // Ikiwa tayari ame-enroll (completed), mpeleke learning, vinginevyo mpeleke course detail
                  if (isEnrolled) {
                    navigate(`/learning/${course.id}`);
                  } else {
                    navigate(`/course/${course.id}`);
                  }
                }} 
                className="d-flex align-items-center cursor-pointer" 
                style={{ color: "#0a2e67", fontSize: "13px", borderRadius: "8px", padding: "10px", fontWeight: 'bold', cursor: 'pointer', marginBottom: 0 }}
              >
                {isEnrolled ? "Continue learning" : "Enroll now"} <i className="bi bi-arrow-right ms-2"></i>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{`
        .provider-carousel-wrapper { position: relative; overflow: hidden; padding: 10px 0; }
        .provider-carousel { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
        .provider-card { border-radius: 15px; overflow: hidden; position: relative; min-width: 250px; max-width: 300px; height: 220px; flex: 0 0 auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1); }
        .provider-card img { width: 100%; height: 100%; object-fit: cover; }
        .provider-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px; background: rgba(0,0,0,0.6); color: white; display: flex; justify-content: space-between; align-items: center; font-size: 14px; }
        .provider-carousel::-webkit-scrollbar { display: none; }
        
        .hero-wrapper { position: relative; min-height: 500px; height: auto; padding: 60px 0; overflow: hidden; display: flex; align-items: center; color: white; }
        .hero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(90deg, #0a2e67 0%, rgba(10, 46, 103, 0.8) 30%, rgba(10, 46, 103, 0.2) 60%, transparent 100%), url(${Banner0}); background-size: cover; background-position: center; z-index: -1; animation: slowZoom 20s infinite alternate; }
        @keyframes slowZoom { from { transform: scale(1); } to { transform: scale(1.05); } }
        .hero-title-text { font-size: clamp(26px, 5vw, 42px); }
        .hero-p-text { font-size: clamp(14px, 2vw, 17px); }

        @media (max-width: 768px) {
          .hero-wrapper { text-align: center; height: auto; padding: 40px 0; }
          .hero-bg { background: linear-gradient(180deg, #0a2e67 40%, rgba(10, 46, 103, 0.7) 100%), url(${Banner0}); }
          .text-start { text-align: center !important; }
          .d-flex.gap-4 { justify-content: center; flex-wrap: wrap; }
          .stat-card { min-width: 120px; padding: 10px; }
          .nav-tabs-custom { display: flex; flex-wrap: nowrap; overflow-x: auto; white-space: nowrap; -webkit-overflow-scrolling: touch; }
          .nav-tabs-custom::-webkit-scrollbar { display: none; }
          .provider-card { height: 240px !important; }
          .provider-label { padding: 10px !important; bottom: 10px !important; }
        }

        .hero-badge { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(5px); padding: 6px 15px; border-radius: 50px; font-size: 13px; border: 1px solid rgba(255, 255, 255, 0.3); display: inline-block; }
        .stat-card { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 15px; min-width: 140px; }
        .btn-explore { background-color: #ffffff; color: #0a2e67; border-radius: 8px; padding: 12px 35px; transition: all 0.3s ease; }
        .btn-explore:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); background-color: #f8f9fa; }

        .nav-tabs-custom .nav-link { color: #6a6f73; font-weight: 700; border: none; cursor: pointer; background: none; margin-right: 15px; }
        .nav-tabs-custom .nav-link.active { color: #2d2f31 !important; border-bottom: 2px solid #2d2f31 !important; }
        .trusted-section { background-color: #f8f9fa; padding: 60px 0; border-top: 1px solid #e8ebed; border-bottom: 1px solid #e8ebed; }
        
        .testimonial-card { border: 1px solid #d1d7dc; padding: 24px; background: #fff; height: 100%; text-align: left; display: flex; flex-direction: column; overflow: hidden; }
        .quote-icon { font-size: 44px; font-family: Georgia, serif; line-height: 1; margin-bottom: 10px; display: block; color: #000; }
        .user-info { display: flex; align-items: center; margin-top: auto; }
        .user-text-avatar { width: 44px; height: 44px; background: #2d2f31; color: #fff; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; flex-shrink: 0; margin-right: 12px; }
        
        .carousel-control-prev-icon, .carousel-control-next-icon { background-color: #0a2e67; border-radius: 50%; padding: 12px; background-size: 60%; }

        .faq-card { border: 1px solid #d1d7dc; border-radius: 8px; padding: 40px; background: #fff; width: 100%; margin: 0 auto; text-align: left; }
        .faq-title { font-size: 32px; font-weight: 700; color: #2d2f31; margin-bottom: 24px; }
        .accordion-item { border: none; border-bottom: 1px solid #d1d7dc !important; }
        .accordion-item:last-child { border-bottom: none !important; }
        .accordion-button { font-weight: 700; color: #2d2f31 !important; background-color: transparent !important; box-shadow: none !important; padding: 24px 0 !important; font-size: 16px; }
        .accordion-button::after { background-size: 1rem; }
        .accordion-body { padding: 0 0 24px 0 !important; color: #2d2f31; font-size: 16px; line-height: 1.5; }
        .btn-show-faqs { background: none; border: none; font-weight: 700; color: #2d2f31; padding: 20px 0; display: flex; align-items: center; gap: 8px; font-size: 15px; }
        .btn-show-faqs:hover { text-decoration: underline; }
      `}</style>

      <NavBar />

      <section className="hero-wrapper">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="row">
            <div className="col-lg-7 text-start">
              <div className="hero-badge mb-3"><i className="bi bi-star-fill text-warning me-2"></i>Most Trusted Professional Training Platform</div>
              <h1 className="fw-bold mb-3 hero-title-text" style={{ lineHeight: "1.2" }}>Elevate Your Career with <br /> <span style={{ color: "#4cc9f0" }}>Industry-Standard</span> Training</h1>
              <p className="lead mb-4 opacity-90 hero-p-text" style={{ maxWidth: "550px", fontWeight: "400" }}>Join over 5,000+ professionals mastering new skills through expert-led courses and real-world projects.</p>
              <div className="d-flex flex-wrap gap-3 mb-5 justify-content-center justify-content-md-start">
                <button className="btn btn-explore fw-bold" onClick={() => document.getElementById("courses-list")?.scrollIntoView({ behavior: "smooth" })}>Browse All Trainings</button>
                <button className="btn btn-outline-light px-4 border-2" style={{ borderRadius: "8px" }}>View Schedule</button>
              </div>
              <div className="d-flex gap-2 gap-md-4">
                <div className="stat-card flex-fill text-center text-md-start"><h4 className="fw-bold mb-0">150+</h4><small className="opacity-75">Expert Courses</small></div>
                <div className="stat-card flex-fill text-center text-md-start"><h4 className="fw-bold mb-0">4.8/5</h4><small className="opacity-75">Learner Rating</small></div>
                <div className="stat-card flex-fill text-center text-md-start"><h4 className="fw-bold mb-0">12k+</h4><small className="opacity-75">Graduates</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mt-5 mb-5" id="courses-list">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{fontSize:"clamp(18px, 4vw, 22px)"}}>Skills to transform your career</h3>
            <p className="text-muted mb-0" style={{fontSize:"14px"}}>Explore our wide range of technical and professional categories.</p>
          </div>
         <a href='/trainings'> 
         <button className="btn btn-link text-decoration-none fw-bold text-dark p-0 text-start viewall">View all</button>
         </a>
        </div>
        <ul className="nav nav-tabs nav-tabs-custom mb-4 border-0">
          {categories.map((cat) => (
            <li className="nav-item" key={cat}>
              <button className={`nav-link ${activeTab === cat ? "active" : ""}`} onClick={() => setActiveTab(cat)}>{cat}</button>
            </li>
          ))}
        </ul>
        <div className="row g-4 mb-5">
            {!loading && courses.filter(c => c.category === activeTab).map(course => (
                <CourseItem key={course.id} course={course} />
            ))}
        </div>
      </div>

      <div className="trusted-section">
        <div className="container text-center">
          <p className="text-muted small mb-5 fw-bold text-uppercase">Partnering with world-class organizations</p>
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 gap-md-5 logo-container px-3 grayscale-logos" style={{ opacity: "0.7" }}>
            <img src={LOGO_VOLKSWAGEN} alt="VW" style={{ height: "30px" }} /><img src={LOGO_SAMSUNG} alt="Samsung" style={{ height: "18px" }} /><img src={LOGO_CISCO} alt="Cisco" style={{ height: "25px" }} />
            <img src={LOGO_VIMEO} alt="Vimeo" style={{ height: "18px" }} /><img src={LOGO_PG} alt="PG" style={{ height: "25px" }} /><img src={LOGO_ERICSSON} alt="Ericsson" style={{ height: "20px" }} />
          </div>
        </div>
      </div>

      <div className="container mt-5 mb-5">
        <h3 className="fw-bold mb-4" style={{fontSize:"16px"}}>How learners like you are achieving their goals</h3>
        <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
          <div className="carousel-inner">
            {reviews.length > 0 ? (
              [...Array(Math.ceil(reviews.length / 3))].map((_, idx) => (
                <div className={`carousel-item ${idx === 0 ? "active" : ""}`} key={idx}>
                  <div className="row g-4">
                    {reviews.slice(idx * 3, idx * 3 + 3).map((review) => (
                      <div className="col-12 col-md-4" key={review.id}>
                        <div className="testimonial-card">
                          <span className="quote-icon">“</span>
                          <p style={{ fontSize:"14px", overflowWrap: "break-word", wordBreak: "break-word", hyphens: "auto" }}>
                            {review.review}
                          </p>
                          <div className="user-info">
                            <div className="user-text-avatar">
                              {review.user?.name?.charAt(0) || "U"}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <h6 className="mb-0 fw-bold text-truncate" style={{fontSize:"14px"}}>{review.user?.name || "Anonymous"}</h6>
                              <div className="d-flex gap-1 text-warning mb-1" style={{fontSize: "10px"}}>
                                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                              </div>
                              <small className="text-muted text-truncate d-block">{review.course?.title || "Learner"}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="carousel-item active">
                <div className="text-center p-5">Loading testimonials...</div>
              </div>
            )}
          </div>
          <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev" style={{width: "5%"}}><span className="carousel-control-prev-icon" aria-hidden="true"></span></button>
          <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next" style={{width: "5%"}}><span className="carousel-control-next-icon" aria-hidden="true"></span></button>
        </div>
      </div>

      <div className="container mt-5 mb-5">
        <h3 className="fw-bold mb-4" style={{fontSize:"16px"}}>Trending courses</h3>
        <div className="row g-4">
          {!loading && courses.sort((a,b) => b.id - a.id).slice(0, 4).map(course => (
            <CourseItem key={`trend-${course.id}`} course={course} />
          ))}
        </div>
      </div>

      <div className="container mt-5 pt-4 mb-5">
        <div className="row align-items-center mb-4 gap-4 gap-md-0">
          <div className="col-md-4">
             <h2 className="fw-bold" style={{fontSize:"clamp(22px, 4vw, 28px)", lineHeight:"1.2"}}>Learn <span className="fst-italic fw-normal">essential</span> career and <span className="fw-bold">life skills</span></h2>
             <p className="text-muted" style={{fontSize:"14px"}}>Traininghub helps you build in-demand skills fast and advance your career.</p>
          </div>
          <div className="col-md-8">
            <div className="provider-carousel-wrapper">
              <div className="provider-carousel d-flex overflow-auto">
                <div className="provider-card me-3 flex-shrink-0"><img src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=500" alt="Tech" /><div className="provider-label"><span>Joseph Genes</span><i className="bi bi-arrow-right-short fs-4"></i></div></div>
                <div className="provider-card me-3 flex-shrink-0"><img src="https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&w=500" alt="Data" /><div className="provider-label"><span>Microsoft Excel</span><i className="bi bi-arrow-right-short fs-4"></i></div></div>
                <div className="provider-card me-3 flex-shrink-0"><img src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=500" alt="AI" /><div className="provider-label"><span>Large Language Models</span><i className="bi bi-arrow-right-short fs-4"></i></div></div>
                <div className="provider-card me-3 flex-shrink-0"><img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500" alt="Cloud" /><div className="provider-label"><span>Cloud Computing</span><i className="bi bi-arrow-right-short fs-4"></i></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mb-5 pb-5 mt-5">
        <div className="">
          <div className="accordion accordion-flush" id="homeFaq">
            <h2 className="faq-title" style={{fontSize:'18px'}}>Frequently asked questions</h2>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button style={{ fontSize:'14px' }} className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#q1">
                  Can I try TrainingHub first, to make sure it's right for me?
                </button>
              </h2>
              <div id="q1" className="accordion-collapse collapse show" data-bs-parent="#homeFaq">
                <div style={{ fontSize:'14px' }} className="accordion-body">
                  Yes, we provide demo sessions and course outlines to help you decide which path fits your career goals perfectly.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button style={{ fontSize:'13px' }} className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q2">
                  What is included in the Professional Track?
                </button>
              </h2>
              <div id="q2" className="accordion-collapse collapse" data-bs-parent="#homeFaq">
                <div style={{ fontSize:'13px' }} className="accordion-body">
                  You get full access to live sessions, recorded materials, hands-on projects, and a verified industry certificate.
                </div>
              </div>
            </div>
            {showAllFaqs && (
              <div className="accordion-item">
                <h2 className="accordion-header">
                  <button style={{ fontSize:'13px' }} className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q4">
                    How do I get my certificate?
                  </button>
                </h2>
                <div id="q4" className="accordion-collapse collapse" data-bs-parent="#homeFaq">
                  <div style={{ fontSize:'14px' }} className="accordion-body">
                    Once you complete all modules and pass the final assessment, your certificate will be generated instantly in your profile.
                  </div>
                </div>
              </div>
            )}
          </div>
          <button style={{ fontSize:'13px' }} className="btn-show-faqs" onClick={() => setShowAllFaqs(!showAllFaqs)}>
            {showAllFaqs ? "Show less" : "Show all 8 frequently asked questions"} 
            <i className={`bi bi-chevron-${showAllFaqs ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}