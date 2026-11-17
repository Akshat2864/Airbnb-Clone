
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getOwnerReservations } from "../services/bookingService";
import "./MyReservations.css";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await getOwnerReservations();

        if (response.success) {
          setReservations(response.data);
        } else {
          setError(response.message);
        }
      } catch (error) {
        console.error("Fetch reservations error:", error);
        setError("Failed to load reservations.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

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
      <div className="reservations-status">
        Loading reservations...
      </div>
    );
  }

  return (
    <main className="reservations-container">
      <div className="reservations-header">
        <div>
          <h1>My Reservations</h1>
          <p>Manage bookings made on your properties.</p>
        </div>

        <Link to="/my-listings" className="reservations-explore-button">
          My Listings
        </Link>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {reservations.length === 0 ? (
        <div className="empty-reservations">
          <h2>No reservations yet</h2>
          <p>
            When guests book your properties, their reservations
            will appear here.
          </p>

          <Link to="/my-listings" className="reservations-explore-button">
            View my listings
          </Link>
        </div>
      ) : (
        <div className="reservations-list">
          {reservations.map((booking) => (
            <article
              className="reservation-card"
              key={booking._id}
            >
              <img
                src={booking.listing?.image}
                alt={booking.listing?.title || "Property"}
                className="reservation-image"
              />

              <div className="reservation-info">
                <div className="reservation-title-row">
                  <h2>
                    {booking.listing?.title || "Property unavailable"}
                  </h2>

                  <span
                    className={`reservation-status ${booking.status}`}
                  >
                    {formatStatus(booking.status)}
                  </span>
                </div>

                <p className="reservation-location">
                  {booking.listing?.location},{" "}
                  {booking.listing?.country}
                </p>

                <div className="reservation-guest">
                  <h3>Guest details</h3>
                  <p>
                    <strong>Name:</strong>{" "}
                    {booking.user?.name || "Guest"}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {booking.user?.email || "Unavailable"}
                  </p>
                </div>

                <div className="reservation-dates">
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
                </div>

                <div className="reservation-payment">
                  <p>
                    <strong>Payment:</strong>{" "}
                    {formatStatus(booking.paymentStatus)}
                  </p>

                  {booking.refundStatus &&
                    booking.refundStatus !== "none" && (
                      <p>
                        <strong>Refund:</strong>{" "}
                        {formatStatus(booking.refundStatus)}
                      </p>
                    )}
                </div>

                <h3 className="reservation-price">
                  ₹{booking.totalPrice?.toLocaleString("en-IN")}
                </h3>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
