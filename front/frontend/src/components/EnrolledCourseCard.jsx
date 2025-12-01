import React from "react";
import { Link } from "react-router-dom";
import "../styles/CourseCard.css";

export default function EnrolledCourseCard({ enrollment }) {
    const course = enrollment.course || {};

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

                {/* Status + Progress */}
                <div className="mt-2 text-sm">
                    <p>
                        <b>Status:</b>{" "}
                        <span
                            className={
                                enrollment.status === "completed"
                                    ? "text-green-600"
                                    : enrollment.status === "in_progress"
                                        ? "text-blue-600"
                                        : "text-gray-600"
                            }
                        >
                            {enrollment.status.replace("_", " ")}
                        </span>
                    </p>

                    <p className="mt-1">
                        <b>Progress:</b> {enrollment.completionPercentage || 0}%
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${enrollment.completionPercentage || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* View Button */}
                <div className="course-actions mt-4">
                    <Link to={`/learn/${course._id}`} className="action-btn view-btn">
                        Continue Learning
                    </Link>
                </div>
            </div>
        </div>
    );
}
