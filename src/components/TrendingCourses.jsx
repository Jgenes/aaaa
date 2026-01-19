import React from "react";
import "../App.css";

const TrendingCourses = () => {
  const sections = [
    {
      title: "Most popular",
      items: [
        {
          provider: "Google",
          title: "Google Data Analytics",
          type: "Professional Certificate",
          rating: 4.8,
          image: "https://via.placeholder.com/48",
        },
        {
          provider: "DeepLearning.AI",
          title: "AI For Everyone",
          type: "Course",
          rating: 4.8,
          image: "https://via.placeholder.com/48",
        },
        {
          provider: "Google",
          title: "Crash Course on Python",
          type: "Course",
          rating: 4.8,
          image: "https://via.placeholder.com/48",
        },
      ],
    },
    {
      title: "Weekly spotlight",
      items: [
        {
          provider: "Duke University",
          title: "Financial Management",
          type: "Specialization",
          rating: 4.8,
          image: "https://via.placeholder.com/48",
        },
        {
          provider: "ADP",
          title: "ADP Entry-Level Payroll Specialist",
          type: "Professional Certificate",
          rating: 4.7,
          image: "https://via.placeholder.com/48",
        },
        {
          provider: "University of Illinois",
          title: "Financial Analysis - Skills for Success",
          type: "Specialization",
          rating: 4.7,
          image: "https://via.placeholder.com/48",
        },
      ],
    },
    {
      title: "In-demand AI skills",
      items: [
        {
          provider: "Multiple educators",
          title: "Generative AI for Growth Marketing",
          type: "Specialization",
          rating: 4.7,
          image: "https://via.placeholder.com/48",
        },
        {
          provider: "Vanderbilt University",
          title: "Generative AI Software Engineering",
          type: "Specialization",
          rating: 4.8,
          image: "https://via.placeholder.com/48",
        },
        {
          provider: "Google Cloud",
          title: "Generative AI Leader",
          type: "Professional Certificate",
          rating: 4.7,
          image: "https://via.placeholder.com/48",
        },
      ],
    },
  ];

  return (
    <div className="trending-container">
      <h3 className="mb-4 fw-bold">Trending courses</h3>

      <div className="trending-grid">
        {sections.map((section, index) => (
          <div className="trending-column" key={index}>
            <div className="column-header">
              <span>{section.title}</span>
              <span className="arrow">→</span>
            </div>

            {section.items.map((item, i) => (
              <div className="course-card" key={i}>
                <img src={item.image} alt={item.title} />
                <div className="course-info">
                  <small className="provider">{item.provider}</small>
                  <h6 style={{ fontSize: "13px" }}>{item.title}</h6>
                  <small className="meta">
                    {item.type} • ⭐ {item.rating}
                  </small>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCourses;
