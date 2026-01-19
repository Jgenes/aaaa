import { useState } from "react";

const options = [
  { label: "Start my career", icon: "bi-rocket" },
  { label: "Change my career", icon: "bi-shuffle" },
  { label: "Grow in my current role", icon: "bi-graph-up" },
  { label: "Explore topics outside of work", icon: "bi-binoculars" },
];

export default function CourseraChoices() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="bg-light p-5 rounded-4 text-center">
      <h4 className="mb-4 fw-semibold">What brings you to Coursera today?</h4>

      <div className="d-flex flex-wrap justify-content-center gap-3">
        {options.map((o, index) => (
          <div
            key={index}
            className={`d-flex align-items-center px-3 py-2 rounded-pill shadow-sm choice-card ${
              selected === index ? "choice-selected" : ""
            }`}
            onClick={() => setSelected(index)}
          >
            <span className="choice-icon me-2">
              <i className={`bi ${o.icon}`}></i>
            </span>
            <span className="fw-medium">{o.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
