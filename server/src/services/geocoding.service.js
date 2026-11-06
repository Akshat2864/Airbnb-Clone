const geocodeAddress = async (address, location, country) => {
  try {
    const query = `${address}, ${location}, ${country}`;

    const url = new URL(
      "https://nominatim.openstreetmap.org/search"
    );

    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "1");

    console.log("Geocoding query:", query);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "WanderLustAirbnbClone/1.0 (akshatagrawal2864@gmail.com)",
      },
    });

    if (!response.ok) {
      console.error("Nominatim status:", response.status);
      throw new Error("Geocoding service unavailable");
    }

    const data = await response.json();

    console.log("Geocoding response:", data);

    if (!data || data.length === 0) {
      return null;
    }

    return {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
    };

  } catch (error) {
    console.error("Geocoding error:", error.message);
    throw error;
  }
};

module.exports = geocodeAddress;