import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/auth/authSlice";
import "../styles/Navbar.css";
import { UserCircle } from "lucide-react";


export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">

        {/* LEFT */}
        <div className="nav-logo">
          <p className="logo">LearnSphere</p>
        </div>

        {/* RIGHT */}
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/courses">Home</Link>

              {user.role === "instructor" && (
                <>
                  <Link to="/instructor/dashboard">My Courses</Link>
                  <Link to="/instructor/certificates">Certificates</Link>
                </>
              )}

              {user.role === "student" && (
                <>
                  <Link to="/student/dashboard">My Courses</Link>
                  <Link to="/student/certificates">Certificates</Link>
                </>
              )}

              <button onClick={handleLogout}>
                Logout
              </button>

              <Link to="/profile" className="profile-icon">
                <UserCircle size={24} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">
                Sign Up
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}