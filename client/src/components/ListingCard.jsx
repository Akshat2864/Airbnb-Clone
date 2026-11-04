
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  checkWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlistService";

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Check whether this listing is already saved
  useEffect(() => {
    const fetchWishlistStatus = async () => {
      if (authLoading || !isAuthenticated) {
        setIsSaved(false);
        return;
      }

      const response = await checkWishlist(listing._id);

      if (response.success) {
        setIsSaved(response.isSaved);
      }
    };

    fetchWishlistStatus();
  }, [listing._id, isAuthenticated, authLoading]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const response = isSaved
        ? await removeFromWishlist(listing._id)
        : await addToWishlist(listing._id);

      if (response.success) {
        setIsSaved(!isSaved);
      } else {
        alert(response.message);
      }
    } catch (error) {
      console.error("Favorite error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="listing-card">
      <div className="listing-image-wrapper">
        <Link to={`/listings/${listing._id}`}>
          <img
            className="listing-image"
            src={listing.image}
            alt={listing.title}
            loading="lazy"
          />
        </Link>

        <span className="guest-favorite">Guest favorite</span>

        <button
          type="button"
          className={`favorite-button ${isSaved ? "saved" : ""}`}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isSaved}
          onClick={handleFavorite}
          disabled={saving || authLoading}
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="listing-info">
        <div className="listing-heading">
          <h3>
            {listing.location}, {listing.country}
          </h3>
          <span>★ 4.9</span>
        </div>

        <Link
          to={`/listings/${listing._id}`}
          className="listing-title-link"
        >
          {listing.title}
        </Link>

        <p className="listing-description">
          {listing.description}
        </p>

        <p className="listing-price">
          <strong>
            ₹{listing.price.toLocaleString("en-IN")}
          </strong>{" "}
          night
        </p>
      </div>
    </article>
  );
}
