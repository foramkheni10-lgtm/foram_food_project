
import { useEffect, useState } from "react";
import axios from "axios";
import "./Menu.css";
import { useNavigate, useSearchParams } from "react-router-dom";

interface Food {
  _id?: string;
  id?: string;
  name?: string;
  food_name?: string;
  description?: string;
  category?: string;
  price?: number;
  image?: string;
  available?: boolean;
  availability?: boolean;
  restaurant_id?: string;
  restaurant_name?: string;
}

interface Restaurant {
  _id: string;
  name?: string;
}

function Menu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read category from Home page URL
  const categoryFromUrl = searchParams.get("category");

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl?.trim() || "All"
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const matchedCategory = foods.find((food) =>
  food.name?.toLowerCase().includes(search.trim().toLowerCase())
)?.category;

  useEffect(() => {
  const searchValue = searchParams.get("search") || "";
  setSearch(searchValue);
}, [searchParams]);
  // Update selected category whenever URL changes
  useEffect(() => {
    const category = searchParams.get("category");
    setSelectedCategory(category?.trim() || "All");
  }, [searchParams]);

  // Fetch foods and restaurants
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const [foodResponse, restaurantResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/foods/"),
          axios
            .get("http://127.0.0.1:8000/api/restaurants/")
            .catch((error) => {
              console.error("Unable to load restaurant names:", error);
              return { data: { restaurants: [] } };
            }),
        ]);

        const foodData = foodResponse.data;
        const foodList: Food[] = Array.isArray(foodData)
          ? foodData
          : foodData.foods || [];

        const restaurantData = restaurantResponse.data;
        const restaurantList: Restaurant[] = Array.isArray(restaurantData)
          ? restaurantData
          : restaurantData.restaurants || [];

        const restaurantMap = new Map<string, string>();

        restaurantList.forEach((restaurant) => {
          if (restaurant._id && restaurant.name) {
            restaurantMap.set(String(restaurant._id), restaurant.name);
          }
        });

        const foodsWithRestaurant = foodList.map((food) => ({
          ...food,
          restaurant_name: food.restaurant_id
            ? restaurantMap.get(String(food.restaurant_id)) ||
              "Restaurant details unavailable"
            : "Restaurant details unavailable",
        }));

        setFoods(foodsWithRestaurant);

        const uniqueCategories = Array.from(
          new Set(
            foodsWithRestaurant
              .map((food) => food.category?.trim())
              .filter((category): category is string => Boolean(category))
          )
        );

        setCategories(["All", ...uniqueCategories]);
      } catch (error) {
        console.error("Unable to load menu:", error);
        setMessage("Unable to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // Add food to cart
  const addToCart = async (food: Food) => {
    const token = localStorage.getItem("smartfoodcourt_token");

    if (!token) {
      alert("Please login first to add items to your cart.");
      navigate("/login");
      return;
    }

    const foodId = food.id || food._id;

    if (!foodId) {
      alert("Food ID is missing. Please contact support.");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/cart/items",
        {
          food_id: foodId,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(`${food.name || food.food_name} added to cart!`);
      setTimeout(() => setMessage(""), 2500);
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
          "Unable to add item to cart. Please try again."
      );
    }
  };

  // Apply category, search and availability filters
  const filteredFoods = foods.filter((food) => {
    const name = food.name || food.food_name || "";

    const matchesCategory =
      selectedCategory === "All" ||
      (food.category || "").trim().toLowerCase() ===
        selectedCategory.trim().toLowerCase();

    const matchesSearch = [
      name,
      food.description || "",
      food.restaurant_name || "",
    ].some((value) =>
      value.toLowerCase().includes(search.toLowerCase())
    );

    const isAvailable =
      food.available !== false && food.availability !== false;

    return matchesCategory && matchesSearch && isAvailable;
  });

  return (
    <main className="menu-page">
      {/* MENU EXPLORER */}
      <section className="menu-controls">
        <div className="menu-section-intro">
          <span className="menu-section-eyebrow">
            FRESHLY PICKED
          </span>

          <h2>Explore the Menu</h2>

          <p>Find something delicious for every mood.</p>
        </div>

        <div className="menu-search-wrapper">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="m16 16 4 4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="text"
            placeholder="Search food or restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search food or restaurant"
          />

          {search && (
            <button
              className="menu-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* CATEGORY FILTERS */}
        <div className="menu-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category === "All" ? "All Food" : category}
            </button>
          ))}
        </div>
      </section>

      {/* SUCCESS MESSAGE */}
      {message && !message.startsWith("Unable") && (
        <div className="menu-message">{message}</div>
      )}

      {/* FOOD RESULTS */}
      <section className="menu-results">
        {!loading && (
          <div className="menu-results-heading">
            <h2>
              {selectedCategory === "All"
                ? "Our Delicious Selection"
                : selectedCategory}
            </h2>

            <span>
              {filteredFoods.length}{" "}
              {filteredFoods.length === 1 ? "item" : "items"}
            </span>
          </div>
        )}

        {loading ? (
          <div className="menu-status">
            <div className="menu-loader"></div>
            <p>Preparing something delicious...</p>
          </div>
        ) : message.startsWith("Unable") && foods.length === 0 ? (
          <p className="menu-status">{message}</p>
        ) : filteredFoods.length === 0 ? (
          <div className="menu-empty-state">
            <span>🍽️</span>
            <h3>
              No {selectedCategory === "All" ? "food items" : selectedCategory + " items"} found
            </h3>
            <p>Try another search or choose a different category.</p>

            <button
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
            >
              View All Food
            </button>
          </div>
        ) : (
          <div className="menu-grid">
            {filteredFoods.map((food) => {
              const name = food.name || food.food_name || "Food Item";
              const id = food.id || food._id || name;

              return (
                <article className="menu-card" key={id}>
                  <div className="menu-image-wrapper">
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={name}
                        className="menu-food-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="menu-image-placeholder">
                        <span>🍽️</span>
                        <small>Deliciously prepared</small>
                      </div>
                    )}

                    <span className="menu-image-category">
                      {food.category || "Food"}
                    </span>
                  </div>

                  <div className="menu-card-content">
                    <div className="menu-food-title-row">
                      <h3>{name}</h3>
                    </div>

                    <p className="menu-food-description">
                      {food.description ||
                        "A delicious choice, freshly prepared for you."}
                    </p>

                    <div className="menu-restaurant-name">
                      <span className="menu-restaurant-icon">⌂</span>

                      <div>
                        <span className="menu-restaurant-label">
                          PREPARED BY
                        </span>
                        <strong>{food.restaurant_name}</strong>
                      </div>
                    </div>

                    <div className="menu-card-bottom">
                      <div className="menu-price">
                        <span>PRICE</span>
                        <strong>
                          ₹{Number(food.price || 0).toFixed(2)}
                        </strong>
                      </div>

                      <button
                        className="menu-add-button"
                        onClick={() => addToCart(food)}
                      >
                        <span>+</span> Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Menu;
