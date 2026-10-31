
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getListingById,
  updateListing,
} from "../services/listingService";
import "./CreateListing.css";

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    price: "",
    location: "",
    country: "",
    category: "Amazing views",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listing = await getListingById(id);

        if (!listing) {
          setError("Listing not found");
          return;
        }

        setFormData({
          title: listing.title || "",
          description: listing.description || "",
          image: listing.image || "",
          price: listing.price ?? "",
          location: listing.location || "",
          country: listing.country || "",
          category: listing.category || "Amazing views",
        });
      } catch (error) {
        console.error("Fetch listing error:", error);
        setError("Failed to fetch listing details");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const response = await updateListing(id, {
        ...formData,
        price: Number(formData.price),
      });

      if (response.success) {
        navigate(`/listings/${id}`);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Update listing error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading listing details...</div>;
  }

  if (error && !formData.title) {
    return <div className="page-loading">{error}</div>;
  }

  return (
    <main className="create-listing-container">
      <div className="create-listing-header">
        <h1>Edit your listing</h1>
        <p>Update your property information.</p>
      </div>

      <form className="create-listing-form" onSubmit={handleSubmit}>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="listing-form-group">
          <label htmlFor="title">Property title</label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="listing-form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="listing-form-group">
          <label htmlFor="image">Image URL</label>
          <input
            id="image"
            type="url"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
          />
        </div>

        {formData.image && (
          <div className="listing-image-preview">
            <img src={formData.image} alt="Property preview" />
          </div>
        )}

        <div className="listing-form-row">
          <div className="listing-form-group">
            <label htmlFor="price">Price per night (₹)</label>
            <input
              id="price"
              type="number"
              name="price"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="listing-form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Amazing views">Amazing views</option>
              <option value="Mountains">Mountains</option>
              <option value="Beachfront">Beachfront</option>
              <option value="Cabins">Cabins</option>
              <option value="Countryside">Countryside</option>
              <option value="City">City</option>
            </select>
          </div>
        </div>

        <div className="listing-form-row">
          <div className="listing-form-group">
            <label htmlFor="location">City / Location</label>
            <input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="listing-form-group">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button
          className="create-listing-submit"
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving changes..." : "Save changes"}
        </button>
      </form>
    </main>
  );
}
