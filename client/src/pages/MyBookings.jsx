
import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  getMyBookings,
  cancelBooking,
} from "../services/bookingService";
import "./MyBookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getMyBookings();

        if (response.success) {
          setBookings(response.data);
        } else {
          setError(response.message);
        }
      } catch (error) {
        console.error("Fetch bookings error:", error);
        setError("Failed to load your bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancellingId(bookingId);
    setError("");

    try {
      const response = await cancelBooking(bookingId);

      if (response.success) {
        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      setError("Failed to cancel booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="my-bookings-status">
        Loading your bookings...
      </div>
    );
  }

  return (
    <main className="my-bookings-container">
      <div className="my-bookings-header">
        <div>
          <h1>My Bookings</h1>
          <p>Manage your upcoming and previous stays.</p>
        </div>

        <Link to="/" className="explore-button">
          Explore stays
        </Link>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {bookings.length === 0 ? (
        <div className="empty-bookings">
          <h2>No bookings yet</h2>
          <p>Your next adventure is waiting for you.</p>
          <Link to="/" className="explore-button">
            Find a place to stay
          </Link>
        </div>
      ) : (
        <div className="my-bookings-list">
          {bookings.map((booking) => (
            <article className="my-booking-card" key={booking._id}>
              <img
                src={booking.listing?.image}
                alt={booking.listing?.title || "Property"}
                className="my-booking-image"
              />

              <div className="my-booking-info">
                <div className="my-booking-title-row">
                  <h2>
                    {booking.listing?.title || "Property unavailable"}
                  </h2>

                  <span
                    className={`booking-status ${booking.status}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <p className="my-booking-location">
                  {booking.listing?.location},{" "}
                  {booking.listing?.country}
                </p>

                <p>
                  <strong>Check-in:</strong>{" "}
                  {formatDate(booking.checkIn)}
                </p>

                <p>
                  <strong>Check-out:</strong>{" "}
                  {formatDate(booking.checkOut)}
                </p>

                <p>
                  <strong>Guests:</strong> {booking.guests}
                </p>

                <h3>
                  ₹{booking.totalPrice.toLocaleString("en-IN")}
                </h3>

                <div className="my-booking-actions">
                  {booking.listing?._id && (
                    <Link
                      to={`/listings/${booking.listing._id}`}
                      className="view-booking-button"
                    >
                      View property
                    </Link>
                  )}

                  {booking.status === "confirmed" && (
                    <button
                      className="cancel-booking-button"
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancellingId === booking._id}
                    >
                      {cancellingId === booking._id
                        ? "Cancelling..."
                        : "Cancel booking"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
