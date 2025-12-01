import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import CourseList from "./pages/Courses/CourseList";
import CourseDetail from "./pages/Courses/CourseDetail";
import CreateCourse from "./pages/Courses/CreateCourse";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import InstructorDashboard from "./pages/Dashboard/InstructorDashboard";
import Profile from "./pages/Dashboard/Profile";
import CertificateList from "./pages/Certificate/CertificateList";
import PaymentPage from "./pages/Payment/PaymentPage";
import EditCourse from "./pages/Dashboard/EditCourse";
import LearnCourse from "./pages/Dashboard/LearnCourse";
import InstructorCertificates from "./pages/Certificate/InstructorCertificates";
import StudentCertificates from "./pages/Certificate/StudentCertificates";


function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/courses" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/instructor/certificates" element={<ProtectedRoute role="instructor">
          <InstructorCertificates />
        </ProtectedRoute>} />
        <Route path="/student/certificates" element={<ProtectedRoute role="student">
          <StudentCertificates />
        </ProtectedRoute>} />

        <Route path="/courses" element={<CourseList />} />
        <Route
          path="/courses/:id"
          element={
            <ProtectedRoute roles={["student", "instructor"]}>
              <CourseDetail />
            </ProtectedRoute>
          }
        />
        <Route path="/courses/create" element={<CreateCourse />} />
        <Route path="/courses/update/:id" element={<EditCourse />} />

        {/* Learn Page Route ✅ */}
        <Route
          path="/learn/:courseId"
          element={
            <ProtectedRoute roles={["student"]}>
              <LearnCourse />
            </ProtectedRoute>
          }
        />

        {/* Dashboard Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/dashboard"
          element={
            <ProtectedRoute role="instructor">
              <InstructorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["student", "instructor"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/certificates"
          element={
            <ProtectedRoute roles={["student"]}>
              <CertificateList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment/:courseId"
          element={
            <ProtectedRoute roles={["student"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
