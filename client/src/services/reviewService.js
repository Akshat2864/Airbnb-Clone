
import api from "./api";

export const getReviews = async (listingId) => {
  try {
    const response = await api.get(`/api/reviews/${listingId}`);

    return {
      success: true,
      data: response.data.data,
      averageRating: response.data.averageRating,
      count: response.data.count,
    };
  } catch (error) {
    console.error("Fetch reviews error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch reviews",
    };
  }
};

export const createReview = async (listingId, reviewData) => {
  try {
    const response = await api.post(`/api/reviews/${listingId}`, reviewData);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Create review error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to submit review",
    };
  }
};

export const updateReview = async (reviewId, reviewData) => {
  try {
    const response = await api.put(`/api/reviews/${reviewId}`, reviewData);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Update review error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to update review",
    };
  }
};

export const deleteReview = async (reviewId) => {
  try {
    const response = await api.delete(`/api/reviews/${reviewId}`);

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Delete review error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete review",
    };
  }
};
