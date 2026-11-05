
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { getListingById } from "../services/listingService";
import { createBooking } from "../services/bookingService";
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../services/reviewService";
import { useAuth } from "../context/AuthContext";
import "./ListingDetails.css";

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking states
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Fetch listing
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

  // Fetch reviews
  const fetchReviews = async () => {
    setReviewsLoading(true);

    try {
      const response = await getReviews(id);

      if (response.success) {
        setReviews(response.data);
        setAverageRating(response.averageRating);
        setReviewCount(response.count);
      } else {
        setReviewError(response.message);
      }
    } catch (error) {
      console.error("Fetch reviews error:", error);
      setReviewError("Failed to load reviews.");
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Booking date helpers
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

  // Create booking
  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingError("");
    setBookingSuccess("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut || nights <= 0) {
      setBookingError("Please select valid check-in and check-out dates.");
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

  // Submit or update review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    setReviewError("");
    setReviewSuccess("");

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!comment.trim() || comment.trim().length < 3) {
      setReviewError("Please write at least 3 characters.");
      return;
    }

    setReviewLoading(true);

    try {
      const reviewData = {
        rating: Number(rating),
        comment: comment.trim(),
      };

      const response = editingReviewId
        ? await updateReview(editingReviewId, reviewData)
        : await createReview(id, reviewData);

      if (response.success) {
        setComment("");
        setRating(5);
        setEditingReviewId(null);
        setReviewSuccess(
          editingReviewId
            ? "Review updated successfully!"
            : "Review submitted successfully!"
        );

        await fetchReviews();
      } else {
        setReviewError(response.message);
      }
    } catch (error) {
      console.error("Review submission error:", error);
      setReviewError("Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  // Edit review
  const handleEditReview = (review) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    setReviewError("");
    setReviewSuccess("");

    document.getElementById("review-form")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
    setReviewError("");
    setReviewSuccess("");
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?"
    );

    if (!confirmed) return;

    setDeletingReviewId(reviewId);
    setReviewError("");

    try {
      const response = await deleteReview(reviewId);

      if (response.success) {
        if (editingReviewId === reviewId) {
          handleCancelEdit();
        }

        setReviewSuccess("Review deleted successfully!");
        await fetchReviews();
      } else {
        setReviewError(response.message);
      }
    } catch (error) {
      console.error("Delete review error:", error);
      setReviewError("Failed to delete review.");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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

          <div className="property-rating-summary">
            <h2>Guest reviews</h2>
            <p>
              <span className="rating-stars">★</span>{" "}
              <strong>{averageRating.toFixed(1)}</strong>
              {" "}({reviewCount}{" "}
              {reviewCount === 1 ? "review" : "reviews"})
            </p>
          </div>
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
              {bookingLoading ? "Processing..." : "Reserve"}
            </button>
          </form>
        </aside>
      </div>

      {/* Reviews section */}
      <section className="reviews-section">
        <h2>Reviews & Ratings</h2>

        <div className="reviews-overview">
          <span className="rating-stars">★</span>
          <strong>{averageRating.toFixed(1)}</strong>
          <span>
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        </div>

        {/* Review form */}
        <div className="review-form-container" id="review-form">
          <h3>
            {editingReviewId ? "Edit your review" : "Write a review"}
          </h3>

          {isAuthenticated ? (
            <form onSubmit={handleReviewSubmit}>
              <label>Your rating</label>

              <div className="star-rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= rating ? "star active" : "star"}
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} out of 5`}
                    aria-pressed={rating === star}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label htmlFor="reviewComment">Your experience</label>

              <textarea
                id="reviewComment"
                rows="4"
                minLength="3"
                maxLength="1000"
                placeholder="Share your experience with this property..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              />

              <p className="review-character-count">
                {comment.length}/1000 characters
              </p>

              {reviewError && (
                <p className="form-error" role="alert">
                  {reviewError}
                </p>
              )}

              {reviewSuccess && (
                <p className="booking-success" role="status">
                  {reviewSuccess}
                </p>
              )}

              <div className="review-form-actions">
                <button
                  type="submit"
                  className="review-submit-button"
                  disabled={reviewLoading}
                >
                  {reviewLoading
                    ? "Submitting..."
                    : editingReviewId
                      ? "Update review"
                      : "Submit review"}
                </button>

                {editingReviewId && (
                  <button
                    type="button"
                    className="review-cancel-button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          ) : (
            <p>
              <Link to="/login">Login</Link> to write a review.
            </p>
          )}
        </div>

        {/* Review list */}
        <div className="reviews-list">
          {reviewsLoading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet. Be the first to share your experience!</p>
          ) : (
            reviews.map((review) => {
              const isOwner =
                user?._id &&
                review.user?._id &&
                user._id === review.user._id;

              return (
                <article className="review-card" key={review._id}>
                  <div className="review-card-header">
                    <div>
                      <h3>{review.user?.name || "Guest"}</h3>
                      <p>{formatDate(review.createdAt)}</p>
                    </div>

                    <div className="review-card-rating">
                      {"★".repeat(review.rating)}
                      {"☆".repeat(5 - review.rating)}
                    </div>
                  </div>

                  <p className="review-comment">{review.comment}</p>

                  {isOwner && (
                    <div className="review-actions">
                      <button
                        type="button"
                        onClick={() => handleEditReview(review)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={deletingReviewId === review._id}
                      >
                        {deletingReviewId === review._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}
