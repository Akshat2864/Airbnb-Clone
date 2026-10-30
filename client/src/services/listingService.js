
import api from "./api";



export const getListings = async () => {
  try {
    const response = await api.get("/listings");
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
    const response = await api.get(`/listings/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(
      "Error fetching listing:",
      error.response?.data || error.message
    );
    return null;
  }
};