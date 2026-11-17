
import api from "./api";



export const getListings = async () => {
  try {
    const response = await api.get("/api/listings");
    return response.data.data;
  } catch (error) {
    console.error(
      "Error fetching listings:",
      error.response?.data || error.message
    );
    return null;
  }
};


export const getListingById = async (id) => {
  try {
    const response = await api.get(`/api/listings/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(
      "Error fetching listing:",
      error.response?.data || error.message
    );
    return null;
  }
};

export const createListing = async (listingData) => {
  try {
    const response = await api.post("/api/listings", listingData);
    return response.data;
  } catch (error) {
    console.error(
      "Create listing error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to create listing",
    };
  }
};

// Fetch listings created by the logged-in user
export const getMyListings = async () => {
  try {
    const response = await api.get("/api/listings/my-listings");
    return response.data;
  } catch (error) {
    console.error(
      "Fetch my listings error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch your listings",
    };
  }
};


// Update an existing listing
export const updateListing = async (id, listingData) => {
  try {
    const response = await api.put(`/api/listings/${id}`, listingData);
    return response.data;
  } catch (error) {
    console.error(
      "Update listing error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message: error.response?.data?.message || "Failed to update listing",
    };
  }
};

// Delete an existing listing
export const deleteListing = async (id) => {
  try {
    const response = await api.delete(`/api/listings/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Delete listing error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete listing",
    };
  }
};