import React from "react";
import { Link } from "react-router-dom";
import "../styles/CourseCard.css";

export default function EnrolledCourseCard({ enrollment }) {
  const course = enrollment.course || {};
  const progress = enrollment.completionPercentage || 0;

  return (
    <div className="course-card enrolled-card">
      <div className="course-image-wrapper">
        <img
          src={course.thumbnail || "https://placehold.co/400x200"}
          alt={course.title}
          className="course-thumbnail"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        <span
          className={`status-badge ${
            enrollment.status === "completed"
              ? "status-completed"
              : enrollment.status === "in_progress"
              ? "status-progress"
              : "status-pending"
          }`}
        >
          {enrollment.status?.replace("_", " ") || "not started"}
        </span>
      </div>

      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>

        <div className="enrollment-summary">
          <div className="summary-row">
            <span className="summary-label">Progress</span>
            <span className="summary-value">{progress}%</span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="course-actions one-action">
          <Link to={`/learn/${course._id}`} className="action-btn view-btn">
            Continue Learning
          </Link>
        </div>
      </div>
    </div>
  );
}