
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getMyWishlist, removeFromWishlist } from "../services/wishlistService";
import "./MyWishlist.css";

export default function MyWishlist() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await getMyWishlist();

        if (response.success) {
          setListings(response.data);
        } else {
          setError(response.message);
        }
      } catch (error) {
        console.error("Wishlist error:", error);
        setError("Failed to load your wishlist.");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (listingId) => {
    setRemovingId(listingId);
    setError("");

    try {
      const response = await removeFromWishlist(listingId);

      if (response.success) {
        setListings((prev) =>
          prev.filter((listing) => listing._id !== listingId)
        );
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Remove wishlist error:", error);
      setError("Failed to remove property.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <p className="wishlist-status">Loading your wishlist...</p>;
  }

  return (
    <main className="wishlist-container">
      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p>Your favorite places, all in one place.</p>
        </div>

        <Link to="/" className="wishlist-explore-button">
          Explore stays
        </Link>
      </div>

      {error && <p className="form-error">{error}</p>}

      {listings.length === 0 ? (
        <div className="wishlist-empty">
          <h2>Your wishlist is empty ♡</h2>
          <p>Save properties you love and find them here later.</p>
          <Link to="/" className="wishlist-explore-button">
            Discover properties
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {listings.map((listing) => (
            <article className="wishlist-card" key={listing._id}>
              <Link to={`/listings/${listing._id}`}>
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="wishlist-image"
                />
              </Link>

              <div className="wishlist-info">
                <h3>{listing.title}</h3>

                <p>
                  {listing.location}, {listing.country}
                </p>

                <p className="wishlist-price">
                  ₹{listing.price.toLocaleString("en-IN")} / night
                </p>

                <div className="wishlist-actions">
                  <Link
                    to={`/listings/${listing._id}`}
                    className="wishlist-view-button"
                  >
                    View property
                  </Link>

                  <button
                    className="wishlist-remove-button"
                    onClick={() => handleRemove(listing._id)}
                    disabled={removingId === listing._id}
                  >
                    {removingId === listing._id ? "Removing..." : "♥ Remove"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
