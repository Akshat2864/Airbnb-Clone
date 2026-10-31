
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyListings, deleteListing } from "../services/listingService";
import "./MyListings.css";


export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const response = await getMyListings();

        if (response.success) {
          setListings(response.data);
        } else {
          setError(response.message);
        }
      } catch (error) {
        console.error("My listings error:", error);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  if (loading) {
    return <div className="my-listings-status">Loading your listings...</div>;
  }

  if (error) {
    return <div className="my-listings-status error">{error}</div>;
  }

  const handleDelete = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this listing?"
  );

  if (!confirmed) return;

  setDeletingId(id);
  setError("");

  try {
    const response = await deleteListing(id);

    if (response.success) {
      setListings((prev) =>
        prev.filter((listing) => listing._id !== id)
      );
    } else {
      setError(response.message);
    }
  } catch (error) {
    console.error("Delete listing error:", error);
    setError("Failed to delete listing. Please try again.");
  } finally {
    setDeletingId(null);
  }
};

  return (
    <main className="my-listings-container">
      <div className="my-listings-header">
        <div>
          <h1>My Listings</h1>
          <p>Manage the properties you've shared with travelers.</p>
        </div>

        <Link to="/listings/new" className="add-listing-button">
          + Add new listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="empty-listings">
          <h2>No listings yet</h2>
          <p>Start sharing your property with travelers.</p>
          <Link to="/listings/new" className="add-listing-button">
            Create your first listing
          </Link>
        </div>
      ) : (
        <>
          <p className="listing-count">
            {listings.length} {listings.length === 1 ? "property" : "properties"}
          </p>

          <div className="my-listings-grid">
            {listings.map((listing) => (
              <article className="my-listing-card" key={listing._id}>
                <Link to={`/listings/${listing._id}`}>
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="my-listing-image"
                  />
                </Link>

                <div className="my-listing-info">
                  <h3>{listing.title}</h3>

                  <p>
                    {listing.location}, {listing.country}
                  </p>

                  <p className="my-listing-price">
                    ₹{listing.price.toLocaleString("en-IN")} / night
                  </p>

                  <div className="my-listing-actions">
                    <Link
                      to={`/listings/${listing._id}`}
                      className="view-listing-button"
                    >
                      View
                    </Link>

                    <Link
                      to={`/listings/${listing._id}/edit`}
                      className="edit-listing-button"
                    >
                      Edit
                    </Link>
                    <button
  className="delete-listing-button"
  onClick={() => handleDelete(listing._id)}
  disabled={deletingId === listing._id}
>
  {deletingId === listing._id ? "Deleting..." : "Delete"}
</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
