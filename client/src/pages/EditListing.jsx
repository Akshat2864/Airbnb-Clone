
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  getListingById,
  updateListing,
} from "../services/listingService";
import { uploadImage } from "../services/uploadService";
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

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  // Handle replacement image
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB");
      return;
    }

    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      // Keep the existing image unless a replacement is selected
      let imageUrl = formData.image;

      if (imageFile) {
        setUploading(true);

        const uploadResponse = await uploadImage(imageFile);

        if (!uploadResponse.success) {
          setError(uploadResponse.message);
          return;
        }

        imageUrl = uploadResponse.data.url;
      }

      setUploading(false);

      const response = await updateListing(id, {
        ...formData,
        image: imageUrl,
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
      setUploading(false);
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
          <label htmlFor="image">Replace property image (optional)</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          <small>Upload a new image only if you want to replace the existing one. Maximum 5 MB.</small>
        </div>

        {(imagePreview || formData.image) && (
          <div className="listing-image-preview">
            <img
              src={imagePreview || formData.image}
              alt="Property preview"
            />
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
          {uploading
            ? "Uploading image..."
            : saving
              ? "Saving changes..."
              : "Save changes"}
        </button>
      </form>
    </main>
  );
}
