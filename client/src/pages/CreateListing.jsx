
import { useState } from "react";
import { useNavigate } from "react-router";
import { createListing } from "../services/listingService";
import "./CreateListing.css";

export default function CreateListing() {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLoading(true);

    try {
      const response = await createListing({
        ...formData,
        price: Number(formData.price),
      });

      if (response.success) {
        navigate(`/listings/${response.data._id}`);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error("Create listing error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-listing-container">
      <div className="create-listing-header">
        <h1>List your property</h1>
        <p>Share your place with travelers around the world.</p>
      </div>

      <form className="create-listing-form" onSubmit={handleSubmit}>
        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="listing-form-group">
          <label htmlFor="title">Property title</label>
          <input
            id="title"
            type="text"
            name="title"
            placeholder="Cozy apartment near the beach"
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
            placeholder="Describe what makes your place special..."
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
            placeholder="https://example.com/property.jpg"
            value={formData.image}
            onChange={handleChange}
            required
          />
          <small>For now, use a publicly accessible image URL.</small>
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
              step="1"
              placeholder="2500"
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
              type="text"
              name="location"
              placeholder="Manali"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="listing-form-group">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              name="country"
              placeholder="India"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button
          className="create-listing-submit"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating listing..." : "Publish listing"}
        </button>
      </form>
    </main>
  );
}
