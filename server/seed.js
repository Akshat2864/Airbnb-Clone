
require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./src/models/Listing");

const sampleListings = [
  {
    title: "Cozy Mountain Cabin",
    description: "A peaceful cabin surrounded by beautiful mountains.",
    image: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
    price: 3500,
    location: "Manali",
    country: "India",
    category: "Amazing views",
  },
  {
    title: "Modern City Apartment",
    description: "A stylish apartment close to cafes and city attractions.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    price: 2800,
    location: "Mumbai",
    country: "India",
    category: "Iconic cities",
  },
  {
    title: "Beachside Escape",
    description: "Relax in a bright stay near the beach.",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2",
    price: 4200,
    location: "Goa",
    country: "India",
    category: "Beachfront",
  },
];

async function seedListings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Clear existing listings before inserting demo data.
    await Listing.deleteMany({});

    await Listing.insertMany(sampleListings);

    console.log("Sample listings inserted successfully");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedListings();
