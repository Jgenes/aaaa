import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import RegisterTenant from "./pages/tenantRegister";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Course from "./pages/Course";
import TrainingHubCheckout from "./pages/TrainingHubCheckout";
import ProviderDashboard from "./pages/provider/dashboard.jsx";
import ProviderCourse from "./pages/provider/course.jsx";
import ProviderCohorts from "./pages/provider/ProviderCohort.jsx";
import ProviderEnrollments from "./pages/provider/ProviderEnrollment.jsx";
import OtpVerification from "./pages/otpVerification.jsx";
import ProviderVerification from "./pages/ProviderVerification.jsx";
import ProviderCourseView from "./pages/provider/viewCoure.jsx";
import CreateCourse from "./pages/provider/createCourse.jsx";
import ProviderCohort from "./pages/provider/ProviderCohort.jsx";
import CreateCohort from "./pages/provider/createCohort.jsx";
import CohortList from "./pages/provider/cohortList.jsx";
import Training from "./pages/trainings.jsx";
import Learning from "./pages/Learning.jsx";
import CourseLearning from "./pages/CourseLearning.jsx";
// import MyLearning from "./pages/My
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/tenant-register" element={<RegisterTenant />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tenant/onboarding" element={<Onboarding />} />
        <Route path="/course" element={<Course />} />
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<TrainingHubCheckout />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/course" element={<ProviderCourse />} />
        <Route path="/provider/cohorts" element={<ProviderCohorts />} />
        <Route path="/provider/enrollments" element={<ProviderEnrollments />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/courseLearning" element={<CourseLearning />} />
        <Route
          path="/provider/verification"
          element={<ProviderVerification />}
        />
        <Route path="/provider/createCourse" element={<CreateCourse />} />
        <Route
          path="/provider/viewCourse/:id"
          element={<ProviderCourseView />}
        />{" "}
        <Route
          path="/provider/cohorts/:courseId"
          element={<ProviderCohort />}
        />
        <Route
          path="/provider/cohorts/create/:courseId"
          element={<CreateCohort />}
        />
        <Route path="/provider/cohortlist/:courseId" element={<CohortList />} />{" "}
        <Route path="/trainings" element={<Training />} />
      </Routes>
    </Router>
  );
}

export default App;
