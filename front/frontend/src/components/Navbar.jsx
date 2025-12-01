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
    <nav className="bg-[#050d53] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        <p className="font-bold text-xl">
          LearnSphere
        </p>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link to="/courses" className="hover:underline">Home</Link>
              {user.role === "instructor" && (
                <>
                  <Link to="/instructor/dashboard" className="hover:underline">My Courses</Link>
                  <Link to="/instructor/certificates" className="hover:underline">Certificates</Link>
                </>
              )}
              {user.role === "student" && (
                <>
                  <Link to="/student/dashboard" className="hover:underline">My Courses</Link>
                  <Link to="/student/certificates" className="hover:underline">Certificates</Link>
                </>
              )}

              <button onClick={handleLogout} className="hover:underline">
                Logout
              </button>
              <Link to="/profile" className="flex items-center gap-2 hover:underline">
                <UserCircle size={24} />
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/signup" className="hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
