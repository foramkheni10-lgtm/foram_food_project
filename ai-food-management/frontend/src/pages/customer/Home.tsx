
import { useEffect, useState } from "react";
import "./Home.css";
import AIFoodAssistant from "./AIFoodAssistant";

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
  message: string;
  total: number;
  restaurants: Restaurant[];
}

function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/restaurants/"
        );

        if (!response.ok) {
          throw new Error("Unable to fetch restaurants");
        }

        const data: RestaurantResponse = await response.json();

        setRestaurants(data.restaurants || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="home-page">

      {/* HEADER */}
      <header className="sf-header">
        <a href="/" className="sf-brand">
          <span>Smart</span> FoodCourt
        </a>

<div className="sf-header-actions">
  <div className="sf-search">
    <input
      type="text"
      placeholder="Search for food, restaurants..."
    />
    <button type="button">Search</button>
  </div>

  <AIFoodAssistant />
</div>

        <a href="/login" className="sf-login-button">
          Login
        </a>
      </header>

      {/* NAVIGATION */}
      <nav className="sf-navbar">
        <a href="/">Home</a>
        <a href="/restaurants">Restaurants</a>
        <a href="/menu">Menu</a>
        <a href="/best-sellers">Best Sellers</a>
        <a href="/cart">Cart</a>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="hero-tag">
            WELCOME TO SMART FOODCOURT
          </p>

          <h1>
            Delicious Food,
            <br />
            Delivered With Intelligence!
          </h1>

          <p>
            Explore restaurants, discover your favourite meals
            and enjoy a smarter food ordering experience.
          </p>

          <a href="/restaurants" className="hero-button">
            Explore Restaurants
          </a>
        </div>
      </section>

      {/* RESTAURANTS SECTION */}
      <section className="restaurants-section">
        <div className="section-heading">
          <div>
            <p className="section-tag">
              EXPLORE PLACES
            </p>

            <h2>Popular Restaurants</h2>
          </div>

          <a href="/restaurants" className="view-all">
            View All →
          </a>
        </div>

        {loading && (
          <p className="status-message">
            Loading restaurants...
          </p>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}

        {!loading && !error && restaurants.length === 0 && (
          <p className="status-message">
            No restaurants available right now.
          </p>
        )}

        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <article
              className="restaurant-card"
              key={restaurant._id}
            >
              {restaurant.image ? (
                <img
                  src={restaurant.image}
                  alt={restaurant.name || "Restaurant"}
                  className="restaurant-image"
                />
              ) : (
                <div className="restaurant-image image-placeholder">
                  Restaurant
                </div>
              )}

              <div className="restaurant-info">
                <h3>
                  {restaurant.name || "Restaurant"}
                </h3>

                <p className="restaurant-description">
                  {restaurant.description ||
                    "Discover delicious food here."}
                </p>

                <div className="restaurant-details">
                  <span>
                    {restaurant.address || "Location unavailable"}
                  </span>

                  {restaurant.rating != null && (
                    <span className="restaurant-rating">
                      ★ {restaurant.rating}
                    </span>
                  )}
                </div>

                <span className="restaurant-status">
                  {restaurant.status || "Available"}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <h3>
          <span>Smart</span> FoodCourt
        </h3>

        <p>
          Your smart destination for delicious food.
        </p>
      </footer>

      {/* AI FOOD ASSISTANT */}
      {/* <AIFoodAssistant /> */}

    </div>
  );
}

export default Home;
