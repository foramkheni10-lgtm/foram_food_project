
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Star, MapPin } from "lucide-react";
import "./BestSellers.css";

interface Restaurant {
  _id: string;
  name?: string;
  description?: string;
  address?: string;
  image?: string;
  status?: string;
  rating?: number | string;
}

interface RestaurantResponse {
  message?: string;
  total?: number;
  restaurants: Restaurant[];
}

function BestSellers() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/restaurants/"
        );

        if (!response.ok) {
          throw new Error("Unable to load restaurants.");
        }

        const data: RestaurantResponse = await response.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Sort restaurants by highest rating
  const topRatedRestaurants = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return [...restaurants]
      .filter((restaurant) => {
        const matchesSearch =
          !query ||
          restaurant.name?.toLowerCase().includes(query) ||
          restaurant.description?.toLowerCase().includes(query) ||
          restaurant.address?.toLowerCase().includes(query);

        return matchesSearch;
      })
      .sort((a, b) => {
        const ratingA = Number(a.rating) || 0;
        const ratingB = Number(b.rating) || 0;

        return ratingB - ratingA;
      });
  }, [restaurants, searchTerm]);

  return (
    <div className="best-sellers-page">

      {/* HERO */}
      <section className="best-sellers-hero">
        <span className="best-sellers-eyebrow">
          <Star size={15} />
          TOP RATED RESTAURANTS
        </span>

        <h1>
          Discover Our <span>Best Restaurants</span>
        </h1>

        <p>
          Explore highly rated restaurants and discover
          amazing food experiences on Smart FoodCourt.
        </p>

        <div className="best-sellers-search">
          <Search size={19} />

          <input
            type="search"
            placeholder="Search restaurants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search restaurants"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* RESTAURANTS */}
      <section className="best-sellers-content">

        <div className="best-sellers-heading">
          <div>
            <span className="best-sellers-section-tag">
              CUSTOMER FAVOURITES
            </span>

            <h2>Highest Rated Restaurants</h2>
          </div>

          <span className="best-sellers-count">
            {topRatedRestaurants.length} restaurants
          </span>
        </div>

        {loading ? (
          <div className="best-sellers-status">
            Loading top-rated restaurants...
          </div>
        ) : error ? (
          <div className="best-sellers-status">
            {error}
          </div>
        ) : topRatedRestaurants.length === 0 ? (
          <div className="best-sellers-empty">
            <div className="best-sellers-empty-icon">
              <Search size={30} />
            </div>

            <h3>No restaurants found</h3>

            <p>
              Try searching with another restaurant name or location.
            </p>
          </div>
        ) : (
          <div className="best-sellers-grid">
            {topRatedRestaurants.map((restaurant, index) => (
              <article
                className="best-seller-card"
                key={restaurant._id}
              >
                <div className="best-seller-image-wrapper">

                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name || "Restaurant"}
                      className="best-seller-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="best-seller-image-placeholder">
                      {restaurant.name || "Restaurant"}
                    </div>
                  )}

                  <span className="best-seller-rank">
                    #{index + 1} Rated
                  </span>

                </div>

                <div className="best-seller-card-content">

                  <div className="best-seller-title-row">
                    <h3>
                      {restaurant.name || "Restaurant"}
                    </h3>

                    <span className="best-seller-rating">
                      <Star size={15} fill="currentColor" />
                      {Number(restaurant.rating) > 0
                        ? Number(restaurant.rating).toFixed(1)
                        : "N/A"}
                    </span>
                  </div>

                  <p className="best-seller-description">
                    {restaurant.description ||
                      "Discover delicious food and enjoy a wonderful dining experience."}
                  </p>

                  <div className="best-seller-location">
                    <MapPin size={15} />
                    <span>
                      {restaurant.address || "Location unavailable"}
                    </span>
                  </div>

                  <div className="best-seller-card-bottom">
                    <span className="best-seller-status">
                      {restaurant.status || "Available"}
                    </span>

                    <Link
                      to={`/menu?restaurant_id=${encodeURIComponent(
                        restaurant._id
                      )}`}
                      className="best-seller-explore-button"
                    >
                      Explore Menu →
                    </Link>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default BestSellers;
