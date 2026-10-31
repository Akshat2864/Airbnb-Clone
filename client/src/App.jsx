import { useEffect, useState } from "react";
import { Routes, Route } from "react-router";

import Navbar from "./components/Navbar";
import CategoryFilter from "./components/CategoryFilter";
import ListingCard from "./components/ListingCard";
import ListingDetails from "./pages/ListingDetails";
import { getListings } from "./services/listingService";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListings"
import "./App.css";
import EditListing from "./pages/EditListing";

function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  console.log("Auth Loading:", authLoading);
  console.log("Authenticated:", isAuthenticated);
  console.log("Current User:", user);

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All stays");

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
            "Unable to load listings. Please try again.",
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
    ].some((value) => value?.toLowerCase().includes(searchText));

    const matchesCategory =
      selectedCategory === "All stays" || listing.category === selectedCategory;

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

          {!loading && error && <p className="error-message">{error}</p>}

          {!loading && !error && filteredListings.length === 0 && (
            <p>No stays found. Try another search or category.</p>
          )}

          {!loading && !error && filteredListings.length > 0 && (
            <div className="listing-grid">
              {filteredListings.map((listing) => (
                <ListingCard key={listing._id} listing={listing} />
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
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/listings/:id" element={<ListingDetails />} />

     
      <Route element={<ProtectedRoute />}>
        <Route path="/listings/new" element={<CreateListing />} />
        <Route path="/listings/:id/edit" element={<EditListing/>}/>
        <Route path="/my-listings" element={<MyListings/>}/>
      </Route>
    </Routes>
  );
}

export default App;
