
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, UtensilsCrossed } from "lucide-react";
import "./Restaurants.css";

interface Restaurant {
  _id: string;
  name?: string;
  description?: string;
  address?: string;
  image?: string;
  status?: string;
  rating?: number;
}

interface RestaurantResponse {
  message?: string;
  total?: number;
  restaurants: Restaurant[];
}

function Restaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/api/restaurants/"
        );

        if (!response.ok) {
          throw new Error("Unable to load restaurants. Please try again.");
        }

        const data: RestaurantResponse = await response.json();
        setRestaurants(data.restaurants || []);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading restaurants."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return restaurants;

    return restaurants.filter((restaurant) =>
      [
        restaurant.name,
        restaurant.description,
        restaurant.address,
        restaurant.status,
      ].some((value) => value?.toLowerCase().includes(query))
    );
  }, [restaurants, searchQuery]);

  return (
    <div className="restaurants-page">
      {/* PAGE HERO */}
      <section className="restaurants-hero">
        <div className="restaurants-hero-content">
          <span className="restaurants-eyebrow">
            <UtensilsCrossed size={15} />
            DISCOVER GREAT FOOD
          </span>

          <h1>
            Explore Our <span>Restaurants</span>
          </h1>

          <p>
            Discover amazing restaurants and find your next
            favourite dining experience with Smart FoodCourt.
          </p>

          <div className="restaurants-search">
            <Search size={21} />

            <input
  type="text"
  placeholder="Search by restaurant...."
  aria-label="Search restaurants"
  value={searchQuery}
  onChange={(event) => setSearchQuery(event.target.value)}
/>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </section>

      {/* RESTAURANT LIST */}
      <section className="restaurants-content">
        <div className="restaurants-section-heading">
          <div>
            <span className="restaurants-section-tag">
              FIND YOUR FAVOURITE
            </span>

            <h2>
              {searchQuery.trim()
                ? "Search Results"
                : "All Restaurants"}
            </h2>

            <p>
              {loading
                ? "Finding restaurants..."
                : `${filteredRestaurants.length} ${
                    filteredRestaurants.length === 1
                      ? "restaurant"
                      : "restaurants"
                  } available`}
            </p>
          </div>
        </div>

        {loading && (
          <div className="restaurants-message">
            <div className="restaurants-spinner" />
            <p>Discovering delicious places...</p>
          </div>
        )}

        {!loading && error && (
          <div className="restaurants-message restaurants-error">
            <h3>Unable to load restaurants</h3>
            <p>{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredRestaurants.length === 0 && (
          <div className="restaurants-message">
            <Search size={38} />
            <h3>
              {searchQuery.trim()
                ? "No matching restaurants found"
                : "No restaurants available yet"}
            </h3>
            <p>
              {searchQuery.trim()
                ? "Try searching with another restaurant name or location."
                : "Please check back later for new restaurants."}
            </p>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {!loading && !error && filteredRestaurants.length > 0 && (
          <div className="restaurants-list-grid">
            {filteredRestaurants.map((restaurant) => (
              <article
                className="restaurants-list-card"
                key={restaurant._id}
              >
                <div className="restaurants-card-image">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name || "Restaurant"}
                      loading="lazy"
                    />
                  ) : (
                    <div className="restaurants-image-placeholder">
                      <UtensilsCrossed size={42} />
                      <span>Smart FoodCourt</span>
                    </div>
                  )}

                  <span className="restaurants-card-status">
                    {restaurant.status || "Available"}
                  </span>
                </div>

                <div className="restaurants-card-body">
                  <div className="restaurants-card-title-row">
                    <h3>
                      {restaurant.name || "Restaurant"}
                    </h3>

                    {restaurant.rating != null && (
                      <span className="restaurants-rating">
                        <Star size={15} fill="currentColor" />
                        {restaurant.rating}
                      </span>
                    )}
                  </div>

                  <p className="restaurants-card-description">
                    {restaurant.description ||
                      "Discover delicious food and a wonderful dining experience."}
                  </p>

                  <div className="restaurants-card-location">
                    <MapPin size={16} />
                    <span>
                      {restaurant.address || "Location unavailable"}
                    </span>
                  </div>

                  <Link
                    to={`/menu?restaurant_id=${encodeURIComponent(
                      restaurant._id
                    )}`}
                    className="restaurants-explore-button"
                  >
                    Explore Menu
                    <span>↗</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Restaurants;
