import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import RegisterTenant from "./pages/tenantRegister";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import ActivateAccount from "./pages/ActivateAccount.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";

// Imebadilishwa jina kuzuia mgongano
import AdminProviderReview from "./pages/admin/ProviderReview.jsx"; 
import AdminCourses from "./pages/admin/AdminCourses.jsx";
import AdminTransactions from "./pages/admin/AdminTransactions.jsx";
import AdminReports from "./pages/admin/Reports.jsx";
import Penrollments from "./pages/provider/Enrollments.jsx";
import SocialEngagement from "./pages/provider/SocialEngagement.jsx";
import ProviderReview from "./pages/provider/ProviderReview.jsx";
import AllEnrollments from "./pages/provider/AllEnrollments.jsx";
import AllCohort from "./pages/provider/AllCohort.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import ChatWidget from "./components/ChatWidget";
import ScrollToTop from "./components/ScrollToTop";
import SkipLink from "./components/SkipLink";
import OverlayGuard from "./components/OverlayGuard";
import { RequireAdmin, RequireLearner, RequireProvider } from "./components/RequireAuth";

function App() {
  return (
    <Router>
      <SkipLink />
      <OverlayGuard />
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/otp-verification" element={<OtpVerification />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/tenant-register" element={<RegisterTenant />} />
        <Route
          path="/tenant/onboarding"
          element={<RequireProvider><Onboarding /></RequireProvider>}
        />
        <Route path="/trainings" element={<Training />} />
        <Route path="/course/:courseId" element={<Course />} />
        <Route path="/course/:courseId/cohort/:cohortId" element={<Course />} />
        <Route path="/pesapal-gateway" element={<PesaPalGateway />} />
        {/* PesaPal return URL — PaymentController::callback redirects here. */}
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/contact" element={<About />} />

        {/* Student/User Routes — any signed-in account */}
        <Route path="/learning" element={<RequireLearner><Learning /></RequireLearner>} />
        <Route
          path="/learning/:courseId"
          element={<RequireLearner><CourseLearning /></RequireLearner>}
        />
        <Route
          path="/transactions"
          element={<RequireLearner><Transactions /></RequireLearner>}
        />
        <Route
          path="/checkout/:courseId/:cohortId"
          element={<RequireLearner><TrainingHubCheckout /></RequireLearner>}
        />

        {/* Provider Routes */}
        <Route path="/provider/dashboard" element={<RequireProvider><ProviderDashboard /></RequireProvider>} />
        <Route path="/provider/profile" element={<RequireProvider><ProviderProfile /></RequireProvider>} />
        <Route path="/provider/settings" element={<RequireProvider><ProviderSettings /></RequireProvider>} />
        <Route path="/provider/verification" element={<RequireProvider><ProviderVerification /></RequireProvider>} />
        
        {/* Provider Course Management */}
        <Route path="/provider/course" element={<RequireProvider><ProviderCourse /></RequireProvider>} />
        <Route path="/provider/createCourse" element={<RequireProvider><CreateCourse /></RequireProvider>} />
        <Route path="/provider/editCourse/:id" element={<RequireProvider><EditCourse /></RequireProvider>} />
        <Route path="/provider/viewCourse/:id" element={<RequireProvider><ProviderCourseView /></RequireProvider>} />
        <Route path="/provider/courses/:courseId/manage" element={<RequireProvider><ManageCourseExtras /></RequireProvider>} />
        
        {/* Provider Cohort Management */}
        <Route path="/provider/cohorts" element={<RequireProvider><ProviderCohorts /></RequireProvider>} />
        <Route path="/provider/cohorts/:courseId" element={<RequireProvider><CohortList /></RequireProvider>} />
        <Route path="/provider/cohorts/create/:courseId" element={<RequireProvider><CreateCohort /></RequireProvider>} />
        <Route path="/provider/cohorts/:courseId/:cohortId/edit" element={<RequireProvider><EditCohort /></RequireProvider>} />
        
        {/* Provider Reports & Engagement */}
        <Route path="/provider/enrollments" element={<RequireProvider><Penrollments /></RequireProvider>} />
        <Route path="/provider/course/:courseId/enrollments" element={<RequireProvider><Penrollments /></RequireProvider>} />
        <Route path="/provider/invoices" element={<RequireProvider><ProviderInvoices /></RequireProvider>} />
        <Route path="/provider/reports" element={<RequireProvider><ProviderReports /></RequireProvider>} />
        <Route path="/provider/social-engagement" element={<RequireProvider><SocialEngagement /></RequireProvider>} />
        <Route path="/provider/review" element={<RequireProvider><ProviderReview /></RequireProvider>} />
        <Route path="/provider/all-enrollments" element={<RequireProvider><AllEnrollments /></RequireProvider>} />
        <Route path="/provider/all-cohorts" element={<RequireProvider><AllCohort /></RequireProvider>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/providers" element={<RequireAdmin><AdminProviderReview /></RequireAdmin>} />
        <Route path="/admin/courses" element={<RequireAdmin><AdminCourses /></RequireAdmin>} />
        <Route path="/admin/transactions" element={<RequireAdmin><AdminTransactions /></RequireAdmin>} />
        <Route path="/admin/reports" element={<RequireAdmin><AdminReports /></RequireAdmin>} />

        {/* Anything else */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <ChatWidget />
    </Router>
  );
}

export default App;