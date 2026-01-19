// src/api/courseService.js
import api from "./axio";

// Courses
export const getCourses = async () => api.get("/courses");
export const createCourse = async (data) => api.post("/courses", data);
export const updateCourse = async (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = async (id) => api.delete(`/courses/${id}`);

// Cohorts
export const getCohorts = async (courseId) =>
  api.get(`/courses/${courseId}/cohorts`);
export const createCohort = async (courseId, data) =>
  api.post(`/courses/${courseId}/cohorts`, data);
export const updateCohort = async (courseId, cohortId, data) =>
  api.put(`/courses/${courseId}/cohorts/${cohortId}`, data);
export const deleteCohort = async (courseId, cohortId) =>
  api.delete(`/courses/${courseId}/cohorts/${cohortId}`);
export const updateCohortStatus = async (courseId, cohortId, status) =>
  api.patch(`/courses/${courseId}/cohorts/${cohortId}/status`, { status });
export const refreshCohortStatuses = async (courseId) =>
  api.post(`/courses/${courseId}/cohorts/refresh-statuses`);

// Enrollment
export const startCheckout = async (data) => api.post("/checkout", data);
export const confirmPayment = async (enrollmentId) =>
  api.post(`/checkout/${enrollmentId}/confirm`);
export const myEnrollments = async () => api.get("/my-enrollments");
