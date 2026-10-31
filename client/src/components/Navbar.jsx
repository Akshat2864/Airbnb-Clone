import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    setLoggingOut(true);
    setError("");

    try {
      const response = await logout();

      if (response.success) {
        navigate("/");
      } else {
        setError(response.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">⌂</span>
        <span>airbnb</span>
      </Link>

      <div className="nav-center">
        <button className="nav-tab active">Stays</button>
        <button className="nav-tab">Experiences</button>
      </div>

      <div className="nav-actions">
        <Link to="/listings/new" className="host-button">
          Become a host
        </Link>

        {!loading &&
          (isAuthenticated ? (
            <>
              <span className="nav-user">Hi, {user.name}</span>

              <Link to="/my-listings" className="nav-auth-link">
                My Listings
              </Link>
              
              <button
                className="profile-button"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-auth-link">
                Login
              </Link>

              <Link to="/register" className="nav-auth-link signup-link">
                Sign up
              </Link>
            </>
          ))}
      </div>

      {error && <span className="nav-error">{error}</span>}
    </header>
  );
}
