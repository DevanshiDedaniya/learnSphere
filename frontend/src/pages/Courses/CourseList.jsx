import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../features/course/courseSlice";
import CourseCard from "../../components/CourseCard";
import "../../styles/CourseList.css";

export default function CourseList() {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.course);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchCourses(searchTerm));
  };

  if (loading) {
    return (
      <div className="course-list-container">
        <p className="loading-text">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <div>
          <h2 className="course-list-title">All Courses</h2>
        </div>

        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No courses available</p>
          <p className="empty-text">Try searching with another keyword.</p>
        </div>
      ) : (
        <div className="course-list-grid">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}