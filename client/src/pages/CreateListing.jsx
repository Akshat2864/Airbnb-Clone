
import { useState } from "react";
import { useNavigate } from "react-router";
import { createListing } from "../services/listingService";
import "./CreateListing.css";
import {uploadImage} from "../services/uploadService"

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

  const [imageFile, setImageFile] = useState(null);
const [imagePreview, setImagePreview] = useState("");
const [uploading, setUploading] = useState(false);

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

  if (!imageFile) {
    setError("Please select a property image");
    return;
  }

  setLoading(true);
  setUploading(true);

  try {
    // First upload image to ImageKit
    const uploadResponse = await uploadImage(imageFile);

    if (!uploadResponse.success) {
      setError(uploadResponse.message);
      return;
    }

    setUploading(false);

    // Get ImageKit URL
    const imageUrl = uploadResponse.data.url;

    // Create listing with uploaded image URL
    const response = await createListing({
      ...formData,
      image: imageUrl,
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
    setUploading(false);
  }
};


  const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  // Validate file type
  if (!file.type.startsWith("image/")) {
    setError("Please select a valid image");
    return;
  }

  // Maximum file size: 5 MB
  if (file.size > 5 * 1024 * 1024) {
    setError("Image size must be less than 5 MB");
    return;
  }

  setError("");
  setImageFile(file);
  setImagePreview(URL.createObjectURL(file));
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
  <label htmlFor="image">Property Image</label>

  <input
    type="file"
    id="image"
    accept="image/*"
    onChange={handleImageChange}
    required
  />

  <small>Upload a property image (maximum 5 MB).</small>
</div>

{imagePreview && (
  <div className="listing-image-preview">
    <img src={imagePreview} alt="Property preview" />
  </div>
)}

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
  {uploading
    ? "Uploading image..."
    : loading
      ? "Creating listing..."
      : "Publish listing"}
</button>
      </form>
    </main>
  );
}
