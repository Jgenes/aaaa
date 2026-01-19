export default function CoursePublishBar({ course, cohorts, onPublish }) {
  // RULE CHECKS
  const hasCohort = cohorts.length > 0;
  const openPricedCohort = cohorts.some(
    (c) => c.status === "Open" && Number(c.price) > 0
  );

  const canPublish =
    course.provider_status === "APPROVED" &&
    course.title &&
    course.category &&
    hasCohort &&
    openPricedCohort;

  return (
    <div style={{ border: "1px solid #ddd", padding: 15, marginBottom: 20 }}>
      <h4>Publishing Status</h4>

      <ul>
        <li>
          Provider Approved:{" "}
          {course.provider_status === "APPROVED" ? "✅" : "❌"}
        </li>
        <li>
          Course Details Complete:{" "}
          {course.title && course.category ? "✅" : "❌"}
        </li>
        <li>Has Cohort: {hasCohort ? "✅" : "❌"}</li>
        <li>Open & Priced Cohort: {openPricedCohort ? "✅" : "❌"}</li>
      </ul>

      {course.status === "Published" ? (
        <button onClick={() => onPublish(false)}>Unpublish</button>
      ) : (
        <button disabled={!canPublish} onClick={() => onPublish(true)}>
          Publish Course
        </button>
      )}
    </div>
  );
}
