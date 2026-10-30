
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";

import Navbar from "./components/Navbar";
import CategoryFilter from "./components/CategoryFilter";
import ListingCard from "./components/ListingCard";
import ListingDetails from "./pages/ListingDetails";
import { getListings } from "./services/listingService";

import "./App.css";

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All stays");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getListings();

        if (data === null) {
          setError("Unable to load listings. Please try again.");
          return;
        }

        setListings(data);
      } catch (error) {
        setError(
          error.response?.data?.message ||
          "Unable to load listings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch = [
      listing.title,
      listing.location,
      listing.country,
    ].some((value) =>
      value?.toLowerCase().includes(searchText)
    );

    const matchesCategory =
      selectedCategory === "All stays" ||
      listing.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Navbar />

      <main className="page-container">
        <div className="search-row">
          <input
            type="search"
            placeholder="Search destinations or properties"
            aria-label="Search destinations or properties"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <CategoryFilter
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        <section className="listings-section">
          <h2>Explore stays</h2>

          {loading && <p>Loading stays...</p>}

          {!loading && error && (
            <p className="error-message">{error}</p>
          )}

          {!loading && !error && filteredListings.length === 0 && (
            <p>No stays found. Try another search or category.</p>
          )}

          {!loading && !error && filteredListings.length > 0 && (
            <div className="listing-grid">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/listings/:id"
        element={<ListingDetails />}
      />
    </Routes>
  );
}

export default App;
