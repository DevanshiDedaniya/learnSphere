import React from "react";
import { Link } from "react-router-dom";
import "../styles/CourseCard.css";

export default function CourseCard({ course, onDelete, showActions = false }) {
  return (
    <div className="course-card">
      <div className="course-image-wrapper">
        <img
          src={course.thumbnail || "https://placehold.co/400x200"}
          alt={course.title}
          className="course-thumbnail"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <span className="course-badge">{course.level || "Beginner"}</span>
      </div>

      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>

        <div className="course-info">
          <div className="info-item">
            <span className="info-label">Students</span>
            <span className="info-value">{course.totalStudents || 0}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Rating</span>
            <span className="info-value">{course.rating || "N/A"}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Level</span>
            <span className="info-value">{course.level || "Beginner"}</span>
          </div>
        </div>

        <div className={`course-actions ${showActions ? "three-actions" : "one-action"}`}>
          <Link to={`/courses/${course._id}`} className="action-btn view-btn">
            View Details
          </Link>

          {showActions && (
            <>
              <Link
                to={`/courses/update/${course._id}`}
                className="action-btn edit-btn"
              >
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