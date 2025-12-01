import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchEnrollments } from "../../features/enrollment/enrollmentSlice";
import EnrolledCourseCard from "../../components/EnrolledCourseCard";

export default function StudentDashboard() {
  const dispatch = useDispatch();
  const { enrollments, loading } = useSelector((state) => state.enrollment);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchEnrollments()).then((res) => {
        console.log("✅ Enrollments from API:", res.payload);
      });
    }
  }, [dispatch, user]);

  if (loading)
    return <p className="text-center mt-10">Loading enrollments...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600">
        Welcome, {user?.fullName}
      </h2>

      {enrollments.length === 0 ? (
        <p>You haven't enrolled in any course yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enroll) => (
            <EnrolledCourseCard key={enroll._id} enrollment={enroll} />
          ))}
        </div>
      )}
    </div>
  );
}
