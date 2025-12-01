import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, updateProfile } from "../../features/auth/authSlice";
import "../../styles/Profile.css";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    skills: "",
  });

  useEffect(() => { dispatch(getProfile()); }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        bio: user.bio || "",
        skills: user.skills?.join(", ") || "",
      });
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
      skills: formData.skills.split(",").map((s) => s.trim()),
    };

    const result = await dispatch(updateProfile(updatedData));

    if (result.meta.requestStatus === "fulfilled") {
      // ✅ Exit edit mode
      setEditMode(false);

      // ✅ Refresh profile data to show updated values
      dispatch(getProfile());
    } else {
      alert("Failed to update profile");
    }
  };

  if (isLoading) return <p className="center-text">Loading profile...</p>;

  return (
    <div className="profile-wrapper">
      <div className="profile-box">

        {/* Profile Image */}
        <div className="profile-image-box">
          <img
            src={user?.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="profile-image"
          />
        </div>

        {!editMode ? (
          <>
            {/* Basic Info */}
            <div className="profile-info">
              <h2>{user.fullName}</h2>
              <p className="email">{user.email}</p>
              {/* <span className="role-badge">{user.role.toUpperCase()}</span> */}
            </div>

            {/* Instructor Section */}
            {user.role === "instructor" && (
              <div className="info-box">
                <p><strong>Total Courses:</strong> {user.instructorProfile?.totalCourses}</p>
                <p><strong>Total Students:</strong> {user.instructorProfile?.totalStudents}</p>
                <p><strong>Average Rating:</strong> {user.instructorProfile?.averageRating}</p>
              </div>
            )}

            {/* Student Section */}

            <div className="info-box">
              <h3>About You</h3>
              <p><strong>Bio:</strong> {user.bio || "Not added"}</p>
              <p><strong>Skills:</strong> {user.skills?.length ? user.skills.join(", ") : "Not added"}</p>
            </div>


            <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
          </>
        ) : (
          <form className="edit-form" onSubmit={handleSubmit}>
            <label>Full Name</label>
            <input name="fullName" value={formData.fullName} onChange={handleChange} className="input-field" />

            <label>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className="input-field" />

            <label>Skills (comma separated)</label>
            <input name="skills" value={formData.skills} onChange={handleChange} className="input-field" />

            <div className="btn-row">
              <button type="submit" className="save-btn">Save</button>
              <button type="button" className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
