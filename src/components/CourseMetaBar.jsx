// src/components/CourseMetaBar.jsx
import React, { useEffect, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";
import api from "../api/axio";

const CourseMetaBar = ({ courseId, cohortId }) => {
  const [cohort, setCohort] = useState(null);

  useEffect(() => {
    if (courseId && cohortId) {
      fetchCohort();
    }
  }, [courseId, cohortId]);

  const fetchCohort = async () => {
    try {
      const res = await api.get(`/training/${courseId}`);
      const found = res.data?.cohorts?.find((c) => c.id === Number(cohortId));

      if (!found) {
        console.error("Cohort not found");
        return;
      }

      setCohort(found);
    } catch (err) {
      console.error("Failed to load cohort", err);
    }
  };

  if (!cohort) {
    return <p className="text-center py-3">Loading course info...</p>;
  }

  return (
    <div className="course-meta-wrapper">
      <div className="container">
        <div className="row text-center text-md-start">
          {/* INTAKE */}
          <div className="col-md-3 meta-item">
            <h6>Intake</h6>
            <p>{cohort.intake_name}</p>
          </div>

          {/* MODE */}
          <div className="col-md-2 meta-item">
            <h6>Mode</h6>
            <p>{cohort.online_link ? "Online" : "Physical"}</p>
          </div>

          {/* LOCATION */}
          <div className="col-md-2 meta-item">
            <h6>
              Location <FaInfoCircle />
            </h6>
            <p>{cohort.venue}</p>
          </div>

          {/* DURATION */}
          <div className="col-md-2 meta-item">
            <h6>Duration</h6>
            <p>
              {cohort.start_date} - {cohort.end_date}
            </p>
          </div>

          {/* SCHEDULE */}
          <div className="col-md-3 meta-item">
            <h6>Schedule</h6>
            <p>{cohort.schedule_text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseMetaBar;
