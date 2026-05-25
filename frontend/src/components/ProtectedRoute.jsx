import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useSelector((state) => state.auth);
  if (user === null) {
    return <p>Loading...</p>; // wait for auth to load
  }
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
