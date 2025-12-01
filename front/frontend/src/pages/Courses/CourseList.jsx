import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCourses } from "../../features/course/courseSlice";
import CourseCard from "../../components/CourseCard";
import "../../styles/CourseList.css";

export default function CourseList() {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector((state) => state.course);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(fetchCourses(searchTerm));
  };

  if (isLoading) return <p className="text-center mt-10">Loading courses...</p>;

  return (
    <div className="course-list-container">
      <h2 className="course-list-title">All Courses</h2>

      {/* 🔍 Compact Search Bar */}
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          🔍
        </button>
      </form>

      {courses.length === 0 ? (
        <p>No courses available</p>
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
