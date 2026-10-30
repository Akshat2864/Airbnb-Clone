
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getListingById } from "../services/listingService";
import "./ListingDetails.css";

export default function ListingDetails() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
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

          <button
            className="reserve-button"
            onClick={() => {
              alert("Booking functionality is coming next!");
            }}
          >
            Check availability
          </button>
        </aside>
      </div>
    </main>
  );
}
