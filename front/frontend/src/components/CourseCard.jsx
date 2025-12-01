import React from "react";
import { Link } from "react-router-dom";
import "../styles/CourseCard.css";

export default function CourseCard({ course, onDelete, showActions = false }) {
  return (
    <div className="course-card">
      <img
        src={course.thumbnail || "https://via.placeholder.com/400x200"}
        alt={course.title}
        className="course-thumbnail"
      />

      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>

        <div className="course-info">
          <p>👨‍🎓 <b>Students:</b> {course.totalStudents || 0}</p>
          <p>⭐ <b>Rating:</b> {course.rating || "N/A"}</p>
          <p>📘 <b>Level:</b> {course.level || "Beginner"}</p>
        </div>

        <div className="course-actions">
          <Link to={`/courses/${course._id}`} className="action-btn view-btn">
            View
          </Link>

          {showActions && (
            <>
              <Link to={`/courses/update/${course._id}`} className="action-btn edit-btn">
                Edit
              </Link>

              <button
                className="action-btn delete-btn"
                onClick={() => onDelete && onDelete(course._id)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
