import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchInstructorCourses, deleteCourse } from "../../features/course/courseSlice";
import { Link } from "react-router-dom";
import CourseCard from "../../components/CourseCard";
import "../../styles/InstructorDashboard.css";

export default function InstructorDashboard() {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.course);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?.role === "instructor") dispatch(fetchInstructorCourses());
  }, [dispatch, user]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      dispatch(deleteCourse(id));
    }
  };

  if (loading) return <p className="loading-text">Loading your courses...</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Welcome, {user?.fullName}</h2>
        <Link to="/courses/create" className="create-btn">
          + Create New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <p className="no-courses-text">You haven't created any courses yet.</p>
      ) : (
        <div className="courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onDelete={handleDelete}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
