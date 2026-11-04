
import api from "./api";

export const checkWishlist = async (listingId) => {
  try {
    const response = await api.get(`/wishlist/check/${listingId}`);

    return {
      success: true,
      isSaved: response.data.isSaved,
    };
  } catch (error) {
    console.error("Wishlist check error:", error.response?.data || error.message);

    return {
      success: false,
      isSaved: false,
    };
  }
};

export const addToWishlist = async (listingId) => {
  try {
    const response = await api.post(`/wishlist/${listingId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Add wishlist error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to add to wishlist",
    };
  }
};

export const removeFromWishlist = async (listingId) => {
  try {
    const response = await api.delete(`/wishlist/${listingId}`);

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Remove wishlist error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to remove from wishlist",
    };
  }
};

export const getMyWishlist = async () => {
  try {
    const response = await api.get("/wishlist");

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Fetch wishlist error:", error.response?.data || error.message);

    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch wishlist",
    };
  }
};