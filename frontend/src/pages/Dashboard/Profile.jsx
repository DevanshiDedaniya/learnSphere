import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, updateProfile } from "../../features/auth/authSlice";
import axios from "axios";
import "../../styles/Profile.css";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, token, isLoading } = useSelector((state) => state.auth);

  const [editMode, setEditMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    skills: "",
  });

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        bio: user.bio || "",
        skills: user.skills?.join(", ") || "",
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append("profileImage", file);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/profile/image", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
         dispatch(getProfile());
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload image. Please ensure it is an image file under 2MB.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
      ...formData,
      skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()) : [],
    };

    const result = await dispatch(updateProfile(updatedData));

    if (result.meta?.requestStatus === "fulfilled" || !result.error) {
      setEditMode(false);
      dispatch(getProfile());
    } else {
      alert("Failed to update profile");
    }
  };

  if (isLoading) return <p className="center-text">Loading profile...</p>;

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-box">
          <div className="profile-top">
            <div className="profile-image-box">
              <img
                src={
                  user?.profileImage
                    ? user.profileImage.startsWith("/profiles")
                      ? `http://localhost:5000${user.profileImage}`
                      : user.profileImage
                    : "https://placehold.co/400x400?text=Avatar"
                }
                alt="Profile"
                className="profile-image"
              />
            </div>

            <div className="profile-info">
              <h2>{user?.fullName}</h2>
              <p className="email">{user?.email}</p>
              <span className="role-badge">{user?.role}</span>
            </div>
          </div>

          <div className="profile-content">
            {!editMode ? (
              <>
                {user?.role === "instructor" && (
                  <div className="info-box">
                    <h3>Instructor Overview</h3>
                    <p>
                      <strong>Total Courses:</strong>{" "}
                      {user.instructorProfile?.totalCourses || 0}
                    </p>
                    <p>
                      <strong>Total Students:</strong>{" "}
                      {user.instructorProfile?.totalStudents || 0}
                    </p>
                    <p>
                      <strong>Average Rating:</strong>{" "}
                      {user.instructorProfile?.averageRating || 0}
                    </p>
                  </div>
                )}

                <div className="info-box">
                  <h3>About You</h3>
                  <p>
                    <strong>Bio:</strong> {user?.bio || "Not added"}
                  </p>
                  <p>
                    <strong>Skills:</strong>{" "}
                    {user?.skills?.length ? user.skills.join(", ") : "Not added"}
                  </p>
                </div>

                <button className="edit-btn" onClick={() => setEditMode(true)}>
                  Edit Profile
                </button>
              </>
            ) : (
              <form className="edit-form" onSubmit={handleSubmit}>
                <div>
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Upload Profile Image</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <small>Uploading...</small>}
                </div>

                <div>
                  <label>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label>Skills (comma separated)</label>
                  <input
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>

                <div className="btn-row">
                  <button type="submit" className="save-btn" disabled={uploadingImage}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}