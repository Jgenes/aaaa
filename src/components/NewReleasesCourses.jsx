import React from "react";
import "../app.css";

const courses = [
  {
    title: "Web Development",
    remainingSeats: 5,
    mode: "Online",
    enrollmentOpen: true,
    img: "https://images.unsplash.com/photo-1581092580496-3e78f4f3f1ee?auto=format&fit=crop&w=400&q=80",
    provider: "Tech Academy",
    providerLogo:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&q=80",
    startDate: "2026-02-01",
  },
  {
    title: "Networking Basics",
    remainingSeats: 0,
    mode: "Offline",
    enrollmentOpen: false,
    img: "https://images.unsplash.com/photo-1581091870621-48d3d05c47fa?auto=format&fit=crop&w=400&q=80",
    provider: "NetPro Institute",
    providerLogo:
      "https://images.unsplash.com/photo-1596495577886-d920f1fb0f12?auto=format&fit=crop&w=100&q=80",
    startDate: "2026-02-10",
  },
  {
    title: "Cyber Security",
    remainingSeats: 10,
    mode: "Online",
    enrollmentOpen: true,
    img: "https://images.unsplash.com/photo-1581092334679-1d7f59df5ffb?auto=format&fit=crop&w=400&q=80",
    provider: "SecureLearn",
    providerLogo:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=100&q=80",
    startDate: "2026-03-01",
  },
  {
    title: "Data Analysis",
    remainingSeats: 2,
    mode: "Offline",
    enrollmentOpen: true,
    img: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=400&q=80",
    provider: "DataHub Academy",
    providerLogo:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=100&q=80",
    startDate: "2026-03-15",
  },
];

function NewReleaseCourses() {
  return (
    <div className="container my-5 newrelease">
      <h3 className="mb-4">New Training</h3>
      <div className="row g-4">
        {courses.map((course, index) => (
          <div className="col-12 col-md-6 col-lg-3" key={index}>
            <div className="card h-100 shadow-sm">
              <img
                src={course.img}
                className="card-img-top"
                alt={course.title}
                style={{ height: "150px", objectFit: "cover" }}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{course.title}</h5>
                <div className="d-flex align-items-center mb-2">
                  <img
                    src={course.providerLogo}
                    alt={course.provider}
                    style={{
                      width: "30px",
                      height: "30px",
                      objectFit: "cover",
                      marginRight: "8px",
                      borderRadius: "50%",
                    }}
                  />
                  <small className="text-muted">{course.provider}</small>
                </div>
                <p style={{ fontSize: "13px" }} className="mb-2 text-muted">
                  Start Date: {course.startDate}
                </p>
                <p style={{ fontSize: "13px" }} className="mb-2 text-muted">
                  Remaining Seats: {course.remainingSeats}
                </p>
                <p style={{ fontSize: "13px" }} className="mb-3">
                  Mode: <strong>{course.mode}</strong>
                </p>
                {course.enrollmentOpen ? (
                  <a href="/course">
                    <button
                      style={{
                        backgroundColor: "#0a2e67",
                        borderColor: "#0a2e67",
                        fontSize: "12px",
                      }}
                      className="btn btn-primary mt-auto enrollmentButton"
                    >
                      Enroll Now
                    </button>
                  </a>
                ) : (
                  <span className="badge bg-danger mt-auto">
                    End of Enrollment
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NewReleaseCourses;
