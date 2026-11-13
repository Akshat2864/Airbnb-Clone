
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

  const [currentPage, setCurrentPage] = useState(1);

const bookingsPerPage = 5;

const totalPages = Math.ceil(bookings.length / bookingsPerPage);

const startIndex = (currentPage - 1) * bookingsPerPage;

useEffect(() => {
  if (currentPage > totalPages && currentPage > 1) {
    setCurrentPage(totalPages);
  }
}, [currentPage, totalPages]);

const currentBookings = bookings.slice(
  startIndex,
  startIndex + bookingsPerPage
);


  const totalBookings = bookings.length;

const confirmedBookings = bookings.filter(
  (booking) => booking.status === "confirmed"
).length;

const cancelledBookings = bookings.filter(
  (booking) => booking.status === "cancelled"
).length;

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
               ? { ...booking, ...response.data }
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

  const formatStatus = (status) => {
  if (!status) return "N/A";

  return status.charAt(0).toUpperCase() + status.slice(1);
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
        <div className="booking-summary">
  <div className="summary-card">
    <span>Total Bookings</span>
    <h2>{totalBookings}</h2>
  </div>

  <div className="summary-card">
    <span>Confirmed Stays</span>
    <h2>{confirmedBookings}</h2>
  </div>

  <div className="summary-card">
    <span>Cancelled Bookings</span>
    <h2>{cancelledBookings}</h2>
  </div>
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
          {currentBookings.map((booking) => (
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

                <div className="booking-payment-details">
  <p>
    <strong>Payment:</strong>{" "}
    <span className={`payment-status ${booking.paymentStatus}`}>
      {formatStatus(booking.paymentStatus)}
    </span>
  </p>

  {booking.refundStatus &&
    booking.refundStatus !== "none" && (
      <p>
        <strong>Refund:</strong>{" "}
        <span className={`refund-status ${booking.refundStatus}`}>
          {formatStatus(booking.refundStatus)}
        </span>
      </p>
    )}
</div>

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
                <details className="booking-extra-details">
  <summary>View booking details</summary>

  <div className="booking-extra-content">
    <p>
      <strong>Booking ID:</strong>
      <span>{booking._id}</span>
    </p>

    {booking.razorpayPaymentId && (
      <p>
        <strong>Payment ID:</strong>
        <span>{booking.razorpayPaymentId}</span>
      </p>
    )}

    {booking.razorpayRefundId && (
      <p>
        <strong>Refund ID:</strong>
        <span>{booking.razorpayRefundId}</span>
      </p>
    )}

    {booking.refundStatus &&
      booking.refundStatus !== "none" && (
        <p>
          <strong>Refund Status:</strong>
          <span>{formatStatus(booking.refundStatus)}</span>
        </p>
      )}
  </div>
</details>

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
      {totalPages > 1 && (
  <div className="pagination">
    <button
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((prev) => prev - 1)}
    >
      Previous
    </button>

    <span>
      Page {currentPage} of {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((prev) => prev + 1)}
    >
      Next
    </button>
  </div>
)}
    </main>
  );
}
