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
import OtpVerification from "./pages/otpVerification.jsx";
import ProviderVerification from "./pages/ProviderVerification.jsx";
import ProviderCourseView from "./pages/provider/viewCoure.jsx";
import CreateCourse from "./pages/provider/createCourse.jsx";
import EditCourse from "./pages/provider/editCourse.jsx";
import CreateCohort from "./pages/provider/createCohort.jsx";
import EditCohort from "./pages/provider/editCohort.jsx";
import CohortList from "./pages/provider/cohortList.jsx";
import Training from "./pages/trainings.jsx";
import Learning from "./pages/Learning.jsx";
import CourseLearning from "./pages/CourseLearning.jsx";
import ManageCourseExtras from "./pages/provider/ManageCourseExra.jsx";
import ProviderInvoices from "./pages/provider/transactions.jsx";
import Transactions from "./pages/Transactions.jsx";
import ProviderProfile from "./pages/provider/Profile.jsx";
import ProviderSettings from "./pages/provider/Settings.jsx";
import ProviderReports from "./pages/provider/Reports.jsx";
import PesaPalGateway from "./pages/PesaPalGateway.jsx";
import ActivateAccount from "./pages/ActivateAccount.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

// Imebadilishwa jina kuzuia mgongano
import AdminProviderReview from "./pages/admin/ProviderReview.jsx"; 
import AdminCourses from "./pages/admin/Admincourses.jsx";
import AdminTransactions from "./pages/admin/AdminTransactions.jsx";
import AdminReports from "./pages/admin/Reports.jsx";
import Penrollments from "./pages/provider/Enrollments.jsx";
import SocialEngagement from "./pages/provider/SocialEngagement.jsx";
import ProviderReview from "./pages/provider/ProviderReview.jsx";
import AllEnrollments from "./pages/provider/AllEnrollments.jsx";
import AllCohort from "./pages/provider/AllCohort.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/tenant-register" element={<RegisterTenant />} />
        <Route path="/tenant/onboarding" element={<Onboarding />} />
        <Route path="/trainings" element={<Training />} />
        <Route path="/course/:courseId" element={<Course />} />
        <Route path="/course/:courseId/cohort/:cohortId" element={<Course />} />
        <Route path="/checkout/:courseId/:cohortId" element={<TrainingHubCheckout />} />
        <Route path="/pesapal-gateway" element={<PesaPalGateway />} />

        {/* Student/User Routes */}
        <Route path="/learning" element={<Learning />} />
        <Route path="/learning/:courseId" element={<CourseLearning />} />
        <Route path="/transactions" element={<Transactions />} />

        {/* Provider Routes */}
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route path="/provider/settings" element={<ProviderSettings />} />
        <Route path="/provider/verification" element={<ProviderVerification />} />
        
        {/* Provider Course Management */}
        <Route path="/provider/course" element={<ProviderCourse />} />
        <Route path="/provider/createCourse" element={<CreateCourse />} />
        <Route path="/provider/editCourse/:id" element={<EditCourse />} />
        <Route path="/provider/viewCourse/:id" element={<ProviderCourseView />} />
        <Route path="/provider/courses/:courseId/manage" element={<ManageCourseExtras />} />
        
        {/* Provider Cohort Management */}
        <Route path="/provider/cohorts" element={<ProviderCohorts />} />
        <Route path="/provider/cohorts/:courseId" element={<CohortList />} />
        <Route path="/provider/cohorts/create/:courseId" element={<CreateCohort />} />
        <Route path="/provider/cohorts/:courseId/:cohortId/edit" element={<EditCohort />} />
        
        {/* Provider Reports & Engagement */}
        <Route path="/provider/enrollments" element={<Penrollments />} />
        <Route path="/provider/course/:courseId/enrollments" element={<Penrollments />} />
        <Route path="/provider/invoices" element={<ProviderInvoices />} />
        <Route path="/provider/reports" element={<ProviderReports />} />
        <Route path="/provider/social-engagement" element={<SocialEngagement />} />
        <Route path="/provider/review" element={<ProviderReview />} />
        <Route path="/provider/all-enrollments" element={<AllEnrollments />} />
        <Route path="/provider/all-cohorts" element={<AllCohort />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/providers" element={<AdminProviderReview />} />
        <Route path="/admin/courses" element={<AdminCourses />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        
      </Routes>
    </Router>
  );
}

export default App;