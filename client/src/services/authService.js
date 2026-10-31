import api from "./api";

// Register user
export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

// Get currently logged-in user
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error) {
    return {
      success: false,
      unauthorized: error.response?.status === 401,
      message: error.response?.data?.message || "Unable to fetch user",
    };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Logout failed",
    };
  }
};