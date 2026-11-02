/* ============================================================
   Learning (learner workspace) data layer.

   Endpoints
   ---------
     GET  /my-learning                  the learner's paid enrolments
                                        (Payment rows with `course` + `cohort`)
     GET  /courses/:id/learning         curriculum + per-lesson progress
     POST /courses/:id/complete-lesson  { lesson_id }

   The API names a lesson's completion flag `completed` and its external
   links `links`; the classroom UI historically expected `is_completed` and
   `video_links`. Everything is reconciled here so pages stay dumb.
   ============================================================ */

import api from "./axio";
import { extractList, extractRecord, normaliseCourse, normaliseCohort } from "./catalogue";

/** Normalise one lesson/module from GET /courses/:id/learning. */
export function normaliseModule(module, index = 0) {
  if (!module || typeof module !== "object") return null;

  const links = Array.isArray(module.links)
    ? module.links
    : Array.isArray(module.video_links)
      ? module.video_links
      : [];

  return {
    ...module,
    id: module.id !== undefined && module.id !== null ? String(module.id) : String(index + 1),
    title: module.title || `Session ${index + 1}`,
    description: module.description || "",
    notes: module.notes ?? module.notes_text ?? "",
    video_url: module.video_url || module.video || null,
    links: links.filter(Boolean),
    video_links: links.filter(Boolean),
    handouts: Array.isArray(module.handouts) ? module.handouts.filter(Boolean) : [],
    is_completed: Boolean(module.completed ?? module.is_completed),
    completed: Boolean(module.completed ?? module.is_completed),
  };
}

/** Normalise the whole classroom payload. */
export function normaliseLearningPayload(payload) {
  const record = extractRecord(payload) || payload || {};
  const modules = extractList(record.modules ?? record.contents ?? [])
    .map(normaliseModule)
    .filter(Boolean);

  const completed = modules.filter((module) => module.is_completed).length;
  const progress =
    record.progress_percentage !== undefined && record.progress_percentage !== null
      ? Number(record.progress_percentage)
      : modules.length
        ? Math.round((completed / modules.length) * 100)
        : 0;

  return {
    ...record,
    id: record.id ?? record.course_id ?? null,
    title: record.title || record.course?.title || "Untitled course",
    short_description: record.short_description || record.description || "",
    modules,
    progress_percentage: Number.isFinite(progress) ? Math.min(100, Math.max(0, Math.round(progress))) : 0,
  };
}

/** GET /courses/:id/learning */
export async function fetchLearningContent(courseId) {
  const res = await api.get(`/courses/${courseId}/learning`);
  return normaliseLearningPayload(res.data);
}

/** POST /courses/:courseId/complete-lesson */
export async function completeLesson(courseId, lessonId) {
  const res = await api.post(`/courses/${courseId}/complete-lesson`, {
    lesson_id: lessonId,
  });
  return res.data;
}

/**
 * Normalise one row of GET /my-learning.
 *
 * The endpoint returns payments, so the course lives under `course` and the
 * intake under `cohort` (`intake_name`, not `name`).
 */
export function normaliseEnrolment(payment) {
  if (!payment || typeof payment !== "object") return null;

  const course = normaliseCourse(payment.course) || {};
  const cohort = normaliseCohort(payment.cohort);

  return {
    paymentId: payment.id,
    reference: payment.reference,
    status: payment.status,
    amount: Number(payment.amount || 0),
    courseId: course.id ?? payment.course_id,
    title: course.title || "Untitled course",
    banner: course.banner || null,
    mode: course.mode || null,
    level: course.category || null,
    providerName: course.provider?.name || course.provider?.brand_name || "Verified provider",
    cohortName: cohort?.intake_name || "",
    cohort,
    modulesCount: Array.isArray(course.curriculum) ? course.curriculum.length : 0,
    progress: 0,
    completedLessons: 0,
    totalLessons: Array.isArray(course.curriculum) ? course.curriculum.length : 0,
  };
}

/** GET /my-learning → normalised enrolments (newest first). */
export async function fetchMyLearning() {
  const res = await api.get("/my-learning");
  return extractList(res.data)
    .map(normaliseEnrolment)
    .filter((item) => item && item.courseId !== undefined && item.courseId !== null);
}

/**
 * Enrich enrolments with real progress.
 *
 * `/my-learning` only returns payment rows, so progress comes from
 * `/courses/:id/learning` (which is also the access check). Failures are
 * ignored: a learner without an active payment simply keeps 0%.
 */
export async function attachProgress(enrolments, { limit = 12 } = {}) {
  const targets = enrolments.slice(0, limit);

  const enriched = await Promise.all(
    targets.map(async (enrolment) => {
      try {
        const data = await fetchLearningContent(enrolment.courseId);
        const total = data.modules.length || enrolment.totalLessons;
        return {
          ...enrolment,
          progress: data.progress_percentage,
          totalLessons: total,
          completedLessons: data.modules.filter((module) => module.is_completed).length,
        };
      } catch {
        return enrolment;
      }
    })
  );

  return [...enriched, ...enrolments.slice(limit)];
}
