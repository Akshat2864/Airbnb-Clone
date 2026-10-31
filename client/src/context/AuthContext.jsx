
import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether the user already has an active session
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getCurrentUser();

        if (response.success) {
          setUser(response.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login
  const login = async (credentials) => {
    const response = await loginUser(credentials);

    if (response.success) {
      setUser(response.data);
    }

    return response;
  };

  // Register
  const register = async (userData) => {
    const response = await registerUser(userData);

    if (response.success) {
      setUser(response.data);
    }

    return response;
  };

  // Logout
  const logout = async () => {
    const response = await logoutUser();

    if (response.success) {
      setUser(null);
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};
