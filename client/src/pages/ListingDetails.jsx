
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getListingById } from "../services/listingService";
import { createBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import "./ListingDetails.css";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getListingById(id);

        if (!data) {
          setError("Unable to load this property.");
          return;
        }

        setListing(data);
      } catch (error) {
        console.error("Fetch listing error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const getLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const today = getLocalDate(new Date());

  const getNights = () => {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(`${checkIn}T00:00:00`);
    const end = new Date(`${checkOut}T00:00:00`);

    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  };

  const nights = getNights();
  const totalPrice = listing ? nights * listing.price : 0;

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingError("Please select both check-in and check-out dates.");
      return;
    }

    if (nights <= 0) {
      setBookingError("Check-out must be after check-in.");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await createBooking({
        listingId: id,
        checkIn,
        checkOut,
        guests: Number(guests),
      });

      if (response.success) {
        setBookingSuccess("Your booking has been confirmed!");
        setCheckIn("");
        setCheckOut("");
        setGuests(1);
      } else {
        setBookingError(response.message);
      }
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError("Something went wrong. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading || authLoading) {
    return <p className="details-message">Loading property...</p>;
  }

  if (error || !listing) {
    return (
      <main className="details-message">
        <p>{error || "Property not found."}</p>
        <Link to="/">Back to explore stays</Link>
      </main>
    );
  }

  return (
    <main className="details-container">
      <Link to="/" className="back-link">
        ← Back to all stays
      </Link>

      <h1>{listing.title}</h1>

      <p className="details-location">
        {listing.location}, {listing.country}
      </p>

      <img
        className="details-image"
        src={listing.image}
        alt={listing.title}
      />

      <div className="details-layout">
        <section className="details-description">
          <h2>About this place</h2>
          <p>{listing.description}</p>
          <p>Category: {listing.category}</p>
        </section>

        <aside className="booking-preview">
          <h2>
            ₹{listing.price.toLocaleString("en-IN")}
            <span> / night</span>
          </h2>

          <p>Plan your next stay in {listing.location}.</p>

          <form onSubmit={handleBooking}>
            <div className="booking-form-group">
              <label htmlFor="checkIn">Check-in</label>
              <input
                id="checkIn"
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value);
                  setBookingError("");
                  setBookingSuccess("");
                }}
                required
              />
            </div>

            <div className="booking-form-group">
              <label htmlFor="checkOut">Check-out</label>
              <input
                id="checkOut"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setBookingError("");
                  setBookingSuccess("");
                }}
                required
              />
            </div>

            <div className="booking-form-group">
              <label htmlFor="guests">Guests</label>
              <input
                id="guests"
                type="number"
                min="1"
                value={guests}
                onChange={(e) => {
                  setGuests(e.target.value);
                  setBookingError("");
                }}
                required
              />
            </div>

            {nights > 0 && (
              <div className="booking-price-summary">
                <p>
                  ₹{listing.price.toLocaleString("en-IN")} × {nights}{" "}
                  {nights === 1 ? "night" : "nights"}
                </p>
                <h3>
                  Total: ₹{totalPrice.toLocaleString("en-IN")}
                </h3>
              </div>
            )}

            {bookingError && (
              <p className="form-error" role="alert">
                {bookingError}
              </p>
            )}

            {bookingSuccess && (
              <p className="booking-success" role="status">
                {bookingSuccess}
              </p>
            )}

            <button
              className="reserve-button"
              type="submit"
              disabled={bookingLoading}
            >
              {bookingLoading
                ? "Processing..."
                : "Reserve"}
            </button>
          </form>
        </aside>
      </div>
    </main>
  );
}
