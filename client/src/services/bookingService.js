
import api from "./api";

export const createBooking = async (bookingData) => {
  try {
    const response = await api.post("/bookings", bookingData);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error(
      "Create booking error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to create booking",
    };
  }
};

export const getMyBookings = async () => {
  try {
    const response = await api.get("/bookings/my-bookings");

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error(
      "Fetch bookings error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch bookings",
    };
  }
};

export const cancelBooking = async (bookingId) => {
  try {
    const response = await api.patch(
      `/bookings/${bookingId}/cancel`
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error(
      "Cancel booking error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to cancel booking",
    };
  }
};

export const verifyBookingPayment = async (paymentData) => {
  try {
    const response = await api.post(
      "/bookings/verify-payment",
      paymentData
    );

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Payment verification failed",
    };
  }
};
