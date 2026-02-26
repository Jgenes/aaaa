import React from "react";
import "../App.css";

const TrendingCourses = () => {
  // Helper function to generate avatar from provider name
  const getAvatarUrl = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=48&background=0366d6&color=fff`;

  const sections = [
    {
      title: "Most popular",
      items: [
        {
          provider: "Google",
          title: "Google Data Analytics",
          type: "Professional Certificate",
          rating: 4.8,
          image: getAvatarUrl("Google"),
        },
        {
          provider: "DeepLearning.AI",
          title: "AI For Everyone",
          type: "Course",
          rating: 4.8,
          image: getAvatarUrl("DeepLearning"),
        },
        {
          provider: "Google",
          title: "Crash Course on Python",
          type: "Course",
          rating: 4.8,
          image: getAvatarUrl("Google"),
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
          image: getAvatarUrl("Duke"),
        },
        {
          provider: "ADP",
          title: "ADP Entry-Level Payroll Specialist",
          type: "Professional Certificate",
          rating: 4.7,
          image: getAvatarUrl("ADP"),
        },
        {
          provider: "University of Illinois",
          title: "Financial Analysis - Skills for Success",
          type: "Specialization",
          rating: 4.7,
          image: getAvatarUrl("UofI"),
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
          image: getAvatarUrl("AI"),
        },
        {
          provider: "Vanderbilt University",
          title: "Generative AI Software Engineering",
          type: "Specialization",
          rating: 4.8,
          image: getAvatarUrl("Vanderbilt"),
        },
        {
          provider: "Google Cloud",
          title: "Generative AI Leader",
          type: "Professional Certificate",
          rating: 4.7,
          image: getAvatarUrl("GCP"),
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

            <div className="cards-wrapper">
              {section.items.map((item, i) => (
                <div className="course-card" key={i}>
                  <img
                    className="course-img"
                    src={item.image}
                    alt={item.title}
                  />
                  <div className="course-info">
                    <small className="provider">{item.provider}</small>
                    <h6 style={{ fontSize: "12px" }} className="course-title">
                      {item.title}
                    </h6>
                    <small className="meta">
                      {item.type} • ⭐ {item.rating}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingCourses;
