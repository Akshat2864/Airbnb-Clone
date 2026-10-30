
import { Link } from "react-router";

export default function ListingCard({ listing }) {
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
          className="favorite-button"
          aria-label="Add to favorites"
          onClick={() => alert("Favorites coming soon!")}
        >
          ♡
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
