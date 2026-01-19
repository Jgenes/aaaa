import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import api from "../../api/axio";

export default function ViewCourse() {
  const { id } = useParams(); // Inasoma ID kutoka URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`/courses/${id}`);
        setCourse(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course details:", error);
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading)
    return (
      <ProviderDashboardLayout title="Loading...">
        <div>Loading...</div>
      </ProviderDashboardLayout>
    );
  if (!course)
    return (
      <ProviderDashboardLayout title="Not Found">
        <div>Course not found!</div>
      </ProviderDashboardLayout>
    );

  const isOnline = course.mode?.toLowerCase() === "online";

  return (
    <ProviderDashboardLayout title="View Course">
      <div className="container mt-4">
        {/* Course Banner - Hakikisha unatumia URL sahihi kama ni storage */}
        {course.banner && (
          <img
            src={`http://localhost:8000/storage/${course.banner}`}
            alt={course.title}
            className="img-fluid rounded mb-3"
            style={{
              height: "250px", // Badilisha namba hii kulingana na unavyotaka (mfano 200px au 250px)
              width: "100%", // Inahakikisha picha inajaza upana wote
              objectFit: "cover", // Muhimu: Inazuia picha isionekane imevutwa/kubonyea
              objectPosition: "center", // Inahakikisha katikati ya picha ndiyo inaonekana
            }}
          />
        )}

        <div className="mb-4">
          <h3 className="h4A">{course.title}</h3>
          <p>
            <strong>
              <i>Category:</i>
            </strong>{" "}
            {course.category} |{" "}
            <strong>
              <i>Mode:</i>
            </strong>{" "}
            {course.mode} |{" "}
            <strong>
              <i>Status:</i>
            </strong>
            <span
              className={
                course.status === "Published" ? "text-success" : "text-warning"
              }
            >
              {course.status}
            </span>
          </p>
          <p>
            <strong>
              <i>Short Description:</i>
            </strong>{" "}
            {course.short_description}
          </p>
          <p>
            <strong>
              <i>Long Description:</i>
            </strong>{" "}
            {course.long_description}
          </p>
        </div>

        <hr />
        {/* Learning Outcomes - Kumbuka huku ni array (Casted in Model) */}
        {course.learning_outcomes?.length > 0 && (
          <div className="mb-4">
            <h3 className="h4A">What You'll Learn</h3>
            <ul>
              {course.learning_outcomes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <hr />
        {/* Skills */}
        {course.skills?.length > 0 && (
          <div className="mb-4">
            <h3 className="h4A">Skills You'll Gain</h3>
            <div className="d-flex gap-2 flex-wrap">
              {course.skills.map((skill, idx) => (
                <span key={idx} className="badge bg-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <hr />
        {/* Contents */}
        {course.contents?.length > 0 && (
          <div className="mb-4">
            <h3 className="h4A">Course Contents</h3>
            {course.contents.map((content, idx) => (
              <div key={idx} className="mb-3 p-3 border rounded shadow-sm">
                <h5 className="h5A">{content.title}</h5>
                <p className="p5A">{content.description}</p>
                {isOnline && content.link && (
                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-primary"
                  >
                    Play Content
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </ProviderDashboardLayout>
  );
}
