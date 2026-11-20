
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Menu.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Heart,
  Utensils,
  X,
  Plus,
  Minus,
  ShoppingBag,
  ChefHat,
} from "lucide-react";

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

interface CustomOption {
  label: string;
  price: number;
}

interface CustomGroup {
  name: string;
  required?: boolean;
  options: CustomOption[];
}

interface SelectedCustomization {
  name: string;
  option: string;
  additional_price: number;
}

const API = "https://foram-food-project.onrender.com";

const customizationGroups: Record<string, CustomGroup[]> = {
  pizza: [
    {
      name: "Pizza Size",
      required: true,
      options: [
        { label: "Regular", price: 0 },
        { label: "Medium", price: 60 },
        { label: "Large", price: 120 },
      ],
    },
    {
      name: "Crust",
      options: [
        { label: "Classic Crust", price: 0 },
        { label: "Thin Crust", price: 20 },
        { label: "Cheese Burst", price: 60 },
        { label: "Wheat Crust", price: 30 },
      ],
    },
    {
      name: "Cheese",
      options: [
        { label: "Regular Cheese", price: 0 },
        { label: "Extra Cheese", price: 35 },
        { label: "Double Cheese", price: 60 },
      ],
    },
    {
      name: "Toppings",
      options: [
        { label: "No Extra Toppings", price: 0 },
        { label: "Extra Vegetables", price: 25 },
        { label: "Jalapenos", price: 20 },
        { label: "Olives", price: 25 },
      ],
    },
  ],

  burger: [
    {
      name: "Patty",
      required: true,
      options: [
        { label: "Regular Patty", price: 0 },
        { label: "Crispy Patty", price: 25 },
        { label: "Double Patty", price: 55 },
        { label: "Paneer Patty", price: 35 },
      ],
    },
    {
      name: "Bun",
      options: [
        { label: "Regular Bun", price: 0 },
        { label: "Whole Wheat Bun", price: 20 },
        { label: "Sesame Bun", price: 15 },
      ],
    },
    {
      name: "Cheese",
      options: [
        { label: "No Extra Cheese", price: 0 },
        { label: "Cheese Slice", price: 20 },
        { label: "Extra Cheese", price: 35 },
      ],
    },
    {
      name: "Sauce",
      options: [
        { label: "Regular Sauce", price: 0 },
        { label: "Extra Mayonnaise", price: 15 },
        { label: "Peri Peri Sauce", price: 20 },
      ],
    },
  ],

  sandwich: [
    {
      name: "Bread",
      required: true,
      options: [
        { label: "White Bread", price: 0 },
        { label: "Brown Bread", price: 15 },
        { label: "Multigrain Bread", price: 25 },
        { label: "Grilled Bread", price: 20 },
      ],
    },
    {
      name: "Filling",
      options: [
        { label: "Regular Filling", price: 0 },
        { label: "Extra Paneer", price: 40 },
        { label: "Extra Cheese", price: 30 },
        { label: "Extra Vegetables", price: 20 },
      ],
    },
    {
      name: "Sauce",
      options: [
        { label: "Regular Sauce", price: 0 },
        { label: "Mint Chutney", price: 10 },
        { label: "Peri Peri Sauce", price: 15 },
      ],
    },
  ],

  dosa: [
    {
      name: "Dosa Size",
      required: true,
      options: [
        { label: "Regular", price: 0 },
        { label: "Large", price: 30 },
      ],
    },
    {
      name: "Filling",
      options: [
        { label: "Plain", price: 0 },
        { label: "Masala Filling", price: 25 },
        { label: "Paneer Filling", price: 45 },
        { label: "Cheese Filling", price: 40 },
      ],
    },
    {
      name: "Chutney",
      options: [
        { label: "Regular Chutney", price: 0 },
        { label: "Extra Coconut Chutney", price: 15 },
        { label: "Extra Tomato Chutney", price: 15 },
      ],
    },
    {
      name: "Spice Level",
      options: [
        { label: "Mild", price: 0 },
        { label: "Medium", price: 0 },
        { label: "Spicy", price: 0 },
      ],
    },
  ],

  south_indian: [
    {
      name: "Spice Level",
      options: [
        { label: "Mild", price: 0 },
        { label: "Medium", price: 0 },
        { label: "Spicy", price: 0 },
      ],
    },
    {
      name: "Sambar",
      options: [
        { label: "Regular Sambar", price: 0 },
        { label: "Extra Sambar", price: 20 },
      ],
    },
    {
      name: "Chutneys",
      options: [
        { label: "Regular Chutneys", price: 0 },
        { label: "Extra Coconut Chutney", price: 15 },
        { label: "Extra Tomato Chutney", price: 15 },
      ],
    },
    {
      name: "Add-ons",
      options: [
        { label: "No Add-ons", price: 0 },
        { label: "Extra Idli", price: 25 },
        { label: "Extra Vada", price: 30 },
      ],
    },
  ],

  north_indian: [
    {
      name: "Spice Level",
      options: [
        { label: "Mild", price: 0 },
        { label: "Medium", price: 0 },
        { label: "Spicy", price: 0 },
      ],
    },
    {
      name: "Gravy",
      options: [
        { label: "Regular Gravy", price: 0 },
        { label: "Extra Gravy", price: 25 },
        { label: "Less Gravy", price: 0 },
      ],
    },
    {
      name: "Bread / Rice Add-on",
      options: [
        { label: "No Add-on", price: 0 },
        { label: "Butter Roti", price: 20 },
        { label: "Butter Naan", price: 40 },
        { label: "Jeera Rice", price: 50 },
      ],
    },
  ],

  chinese: [
    {
      name: "Spice Level",
      options: [
        { label: "Mild", price: 0 },
        { label: "Medium", price: 0 },
        { label: "Spicy", price: 0 },
        { label: "Extra Spicy", price: 0 },
      ],
    },
    {
      name: "Sauce",
      options: [
        { label: "Regular Sauce", price: 0 },
        { label: "Extra Schezwan Sauce", price: 20 },
        { label: "Extra Manchurian Sauce", price: 20 },
      ],
    },
    {
      name: "Add-ons",
      options: [
        { label: "No Add-ons", price: 0 },
        { label: "Extra Vegetables", price: 25 },
        { label: "Extra Paneer", price: 40 },
      ],
    },
  ],

  rolls: [
    {
      name: "Filling",
      required: true,
      options: [
        { label: "Regular Filling", price: 0 },
        { label: "Extra Paneer", price: 40 },
        { label: "Extra Vegetables", price: 25 },
      ],
    },
    {
      name: "Sauce",
      options: [
        { label: "Regular Sauce", price: 0 },
        { label: "Mint Sauce", price: 15 },
        { label: "Peri Peri Sauce", price: 20 },
      ],
    },
    {
      name: "Cheese",
      options: [
        { label: "No Extra Cheese", price: 0 },
        { label: "Extra Cheese", price: 30 },
      ],
    },
  ],

  biryani: [
    {
      name: "Portion Size",
      required: true,
      options: [
        { label: "Regular", price: 0 },
        { label: "Large", price: 60 },
      ],
    },
    {
      name: "Spice Level",
      options: [
        { label: "Mild", price: 0 },
        { label: "Medium", price: 0 },
        { label: "Spicy", price: 0 },
      ],
    },
    {
      name: "Add-ons",
      options: [
        { label: "No Add-ons", price: 0 },
        { label: "Extra Raita", price: 20 },
        { label: "Extra Gravy", price: 25 },
        { label: "Boiled Egg", price: 20 },
      ],
    },
  ],

  desserts: [
    {
      name: "Portion Size",
      required: true,
      options: [
        { label: "Regular", price: 0 },
        { label: "Large", price: 40 },
      ],
    },
    {
      name: "Toppings",
      options: [
        { label: "No Extra Toppings", price: 0 },
        { label: "Chocolate Sauce", price: 20 },
        { label: "Extra Nuts", price: 25 },
        { label: "Whipped Cream", price: 25 },
      ],
    },
    {
      name: "Flavour",
      options: [
        { label: "Original", price: 0 },
        { label: "Chocolate", price: 20 },
        { label: "Strawberry", price: 20 },
      ],
    },
  ],

  beverages: [
    {
      name: "Size",
      required: true,
      options: [
        { label: "Regular", price: 0 },
        { label: "Medium", price: 20 },
        { label: "Large", price: 35 },
      ],
    },
    {
      name: "Ice",
      options: [
        { label: "Regular Ice", price: 0 },
        { label: "Less Ice", price: 0 },
        { label: "No Ice", price: 0 },
      ],
    },
    {
      name: "Sugar",
      options: [
        { label: "Regular Sugar", price: 0 },
        { label: "Less Sugar", price: 0 },
        { label: "No Sugar", price: 0 },
      ],
    },
    {
      name: "Extras",
      options: [
        { label: "No Extras", price: 0 },
        { label: "Extra Cream", price: 20 },
        { label: "Extra Topping", price: 20 },
      ],
    },
  ],

  general: [
    {
      name: "Spice Level",
      options: [
        { label: "Mild", price: 0 },
        { label: "Medium", price: 0 },
        { label: "Spicy", price: 0 },
      ],
    },
    {
      name: "Add-ons",
      options: [
        { label: "No Add-ons", price: 0 },
        { label: "Extra Cheese", price: 30 },
        { label: "Extra Vegetables", price: 20 },
      ],
    },
  ],
};

function getCustomizationCategory(food: Food): string {
  const category = (food.category || "").toLowerCase();
  const name = (food.name || food.food_name || "").toLowerCase();
  const value = `${category} ${name}`;

  if (/pizza/.test(value)) return "pizza";
  if (/burger/.test(value)) return "burger";
  if (/sandwich|sub\b/.test(value)) return "sandwich";
  if (/dosa|uttapam/.test(value)) return "dosa";
  if (/south indian|idli|vada|sambar|rasam/.test(value)) {
    return "south_indian";
  }
  if (/north indian|paneer tikka|paneer butter|naan|roti|paratha|dal makhani/.test(value)) {
    return "north_indian";
  }
  if (/chinese|noodle|manchurian|fried rice|momos|schezwan/.test(value)) {
    return "chinese";
  }
  if (/frankie|roll|wrap|kathi/.test(value)) return "rolls";
  if (/biryani|pulao|rice/.test(value)) return "biryani";
  if (/dessert|sweet|cake|brownie|ice cream|gulab jamun|pastry|halwa/.test(value)) {
    return "desserts";
  }
  if (/beverage|drink|juice|shake|coffee|tea|lassi|soda|cola|water/.test(value)) {
    return "beverages";
  }

  return "general";
}

function Menu() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const restaurantId = searchParams.get("restaurant_id");
  const categoryFromUrl = searchParams.get("category");

  const [foods, setFoods] = useState<Food[]>([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    categoryFromUrl?.trim() || "All"
  );
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteLoading, setFavoriteLoading] = useState<string | null>(null);

  const [customizingFood, setCustomizingFood] = useState<Food | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, CustomOption>
  >({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    setSelectedCategory(categoryFromUrl?.trim() || "All");
  }, [categoryFromUrl]);

  // Load foods and restaurants.
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setMessage("");

        const [foodResponse, restaurantResponse] = await Promise.all([
          axios.get(`${API}/api/foods/`),
          axios.get(`${API}/api/restaurants/`),
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

        if (restaurantId) {
          const selectedRestaurant = restaurantList.find(
            (restaurant) => String(restaurant._id) === String(restaurantId)
          );

          setRestaurantName(selectedRestaurant?.name || "Selected Restaurant");
        } else {
          setRestaurantName("");
        }

        setFoods(
          foodList.map((food) => ({
            ...food,
            restaurant_name: food.restaurant_id
              ? restaurantMap.get(String(food.restaurant_id)) ||
                "Restaurant details unavailable"
              : "Restaurant details unavailable",
          }))
        );
      } catch (error) {
        console.error("Unable to load menu:", error);
        setMessage("Unable to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [restaurantId]);

  // Load favourites.
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("smartfoodcourt_token");

      if (!token) {
        setFavoriteIds(new Set());
        return;
      }

      try {
        const response = await axios.get(`${API}/api/favorites/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const items: Food[] = response.data.items || [];

        setFavoriteIds(
          new Set(
            items
              .map((food) => food._id || food.id)
              .filter((id): id is string => Boolean(id))
          )
        );
      } catch (error) {
        console.error("Unable to load favourites:", error);
      }
    };

    fetchFavorites();
  }, []);

  const restaurantFoods = useMemo(() => {
    if (!restaurantId) return foods;

    return foods.filter(
      (food) => String(food.restaurant_id) === String(restaurantId)
    );
  }, [foods, restaurantId]);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        restaurantFoods
          .map((food) => food.category?.trim())
          .filter((category): category is string => Boolean(category))
      )
    );

    return ["All", ...uniqueCategories];
  }, [restaurantFoods]);

  const filteredFoods = restaurantFoods.filter((food) => {
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
      value.toLowerCase().includes(search.trim().toLowerCase())
    );

    const isAvailable =
      food.available !== false && food.availability !== false;

    return matchesCategory && matchesSearch && isAvailable;
  });
  
const addToCart = async (food: Food) => {
  const token = localStorage.getItem("smartfoodcourt_token");

  if (!token) {
    alert("Please login first to add items to your cart.");
    navigate("/login");
    return;
  }

  const foodId = food._id || food.id;

  if (!foodId) {
    alert("Food ID is missing.");
    return;
  }

  try {
    await axios.post(
      `${API}/api/cart/items`,
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

    const foodName = food.name || food.food_name || "Food item";
    setMessage(`${foodName} added to your cart!`);

    window.setTimeout(() => setMessage(""), 3000);
  } catch (error: any) {
    alert(
      error.response?.data?.detail ||
        "Unable to add item to cart. Please try again."
    );
  }
};

 

  const closeCustomization = () => {
    if (addingToCart) return;

    setCustomizingFood(null);
    setSelectedOptions({});
    setSpecialInstructions("");
    setQuantity(1);
  };

  const currentGroups = customizingFood
    ? customizationGroups[getCustomizationCategory(customizingFood)]
    : [];

  const basePrice = Number(customizingFood?.price || 0);

  const customizationTotal = Object.values(selectedOptions).reduce(
    (total, option) => total + option.price,
    0
  );

  const unitPrice = basePrice + customizationTotal;
  const grandTotal = unitPrice * quantity;

  const selectOption = (group: CustomGroup, option: CustomOption) => {
    setSelectedOptions((previous) => ({
      ...previous,
      [group.name]: option,
    }));
  };

  const addCustomizedToCart = async () => {
    const token = localStorage.getItem("smartfoodcourt_token");

    if (!token) {
      alert("Please login first to add items to your cart.");
      navigate("/login");
      return;
    }

    if (!customizingFood) return;

    const foodId = customizingFood.id || customizingFood._id;

    if (!foodId) {
      alert("Food ID is missing. Please contact support.");
      return;
    }

    const missingRequired = currentGroups.find(
      (group) => group.required && !selectedOptions[group.name]
    );

    if (missingRequired) {
      alert(`Please select ${missingRequired.name}.`);
      return;
    }

    const customizations: SelectedCustomization[] = Object.entries(
      selectedOptions
    ).map(([name, option]) => ({
      name,
      option: option.label,
      additional_price: option.price,
    }));

    try {
      setAddingToCart(true);

      await axios.post(
        `${API}/api/cart/items`,
        {
          food_id: foodId,
          quantity,
          customizations,
          special_instructions: specialInstructions.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const foodName =
        customizingFood.name || customizingFood.food_name || "Food item";

      setCustomizingFood(null);
      setSelectedOptions({});
      setSpecialInstructions("");
      setQuantity(1);

      setMessage(`${foodName} added to your cart!`);
      window.setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
          "Unable to add customized item to cart. Please try again."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // Add or remove favourites.
  const toggleFavorite = async (food: Food) => {
    const token = localStorage.getItem("smartfoodcourt_token");

    if (!token) {
      alert("Please login to save your favourite food.");
      navigate("/login");
      return;
    }

    const foodId = food._id || food.id;

    if (!foodId) {
      alert("Food ID is missing.");
      return;
    }

    if (favoriteLoading === foodId) return;

    setFavoriteLoading(foodId);

    try {
      const isFavorite = favoriteIds.has(foodId);

      if (isFavorite) {
        await axios.delete(`${API}/api/favorites/${foodId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFavoriteIds((previous) => {
          const updated = new Set(previous);
          updated.delete(foodId);
          return updated;
        });

        setMessage("Removed from your favourites.");
      } else {
        await axios.post(
          `${API}/api/favorites/${foodId}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setFavoriteIds((previous) => {
          const updated = new Set(previous);
          updated.add(foodId);
          return updated;
        });

        setMessage("Added to your favourites!");
      }

      window.setTimeout(() => setMessage(""), 2500);
    } catch (error: any) {
      alert(
        error.response?.data?.detail ||
          "Unable to update favourites. Please try again."
      );
    } finally {
      setFavoriteLoading(null);
    }
  };

  return (
    <main className="menu-page">
      <section className="menu-controls">
        <section className="best-sellers-hero menu-hero">
          <span className="best-sellers-eyebrow">
            <Utensils size={15} />
            FRESHLY PICKED
          </span>

          <h1>
            {restaurantId ? (
              restaurantName
            ) : (
              <>
                Explore the <span>Menu</span>
              </>
            )}
          </h1>

          <p>
            {restaurantId
              ? `Discover delicious food from ${restaurantName}.`
              : "Find something delicious for every mood."}
          </p>
        </section>

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
              type="button"
              className="menu-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="menu-categories">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              className={selectedCategory === category ? "active" : ""}
              onClick={() => setSelectedCategory(category)}
            >
              {category === "All" ? "All Food" : category}
            </button>
          ))}
        </div>
      </section>

      {message && <div className="menu-message">{message}</div>}

      <section className="menu-results">
        {!loading && (
          <div className="menu-results-heading">
            <h2>
              {selectedCategory === "All"
                ? restaurantId
                  ? `${restaurantName} Menu`
                  : "Our Delicious Selection"
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
              {search
                ? "No matching food items found"
                : `No ${
                    selectedCategory === "All"
                      ? "food items"
                      : selectedCategory + " items"
                  } found`}
            </h3>

            <p>
              {restaurantId
                ? "This restaurant has no matching food items. Try another category or search."
                : "Try another search or choose a different category."}
            </p>

            <button
              type="button"
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
              const id = food._id || food.id || name;
              const isFavorite = favoriteIds.has(id);

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

                    <button
                      type="button"
                      className={`menu-favorite-button ${
                        isFavorite ? "is-favorite" : ""
                      }`}
                      onClick={() => toggleFavorite(food)}
                      disabled={favoriteLoading === id}
                      aria-label={
                        isFavorite
                          ? `Remove ${name} from favourites`
                          : `Add ${name} to favourites`
                      }
                      title={
                        isFavorite
                          ? "Remove from favourites"
                          : "Add to favourites"
                      }
                    >
                      <Heart
                        size={20}
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                    </button>
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

                        <strong>
                          {food.restaurant_name ||
                            "Restaurant details unavailable"}
                        </strong>
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
  type="button"
  className="menu-add-button"
  onClick={() => addToCart(food)}
>
  <ShoppingBag size={16} />
  Add to Cart
</button>

                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FOOD CUSTOMIZATION MODAL */}
      {customizingFood && (
        <div
          className="food-customize-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCustomization();
            }
          }}
        >
          <section
            className="food-customize-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customize-title"
          >
            <div className="customize-header">
              <div>
                <span className="customize-eyebrow">
                  <ChefHat size={15} />
                  MAKE IT YOUR WAY
                </span>
                <h2 id="customize-title">Customize Your Food</h2>
                <p>
                  {customizingFood.name ||
                    customizingFood.food_name ||
                    "Food Item"}
                </p>
              </div>

              <button
                type="button"
                className="customize-close"
                onClick={closeCustomization}
                aria-label="Close customization"
                disabled={addingToCart}
              >
                <X size={22} />
              </button>
            </div>

            <div className="customize-body">
              <div className="customize-base-price">
                <span>Base Price</span>
                <strong>₹{basePrice.toFixed(2)}</strong>
              </div>

              {currentGroups.map((group) => (
                <div className="customize-group" key={group.name}>
                  <div className="customize-group-heading">
                    <h3>{group.name}</h3>
                    <span>
                      {group.required ? "Required" : "Optional"}
                    </span>
                  </div>

                  <div className="customize-options">
                    {group.options.map((option) => {
                      const selected =
                        selectedOptions[group.name]?.label === option.label;

                      return (
                        <button
                          type="button"
                          key={option.label}
                          className={`customize-option ${
                            selected ? "selected" : ""
                          }`}
                          onClick={() => selectOption(group, option)}
                        >
                          <span className="customize-radio">
                            {selected && <span />}
                          </span>

                          <span className="customize-option-name">
                            {option.label}
                          </span>

                          <strong>
                            {option.price > 0
                              ? `+₹${option.price.toFixed(2)}`
                              : "Included"}
                          </strong>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="customize-instructions">
                <label htmlFor="specialInstructions">
                  Special Cooking Instructions
                </label>

                <textarea
                  id="specialInstructions"
                  rows={3}
                  maxLength={300}
                  value={specialInstructions}
                  onChange={(event) =>
                    setSpecialInstructions(event.target.value)
                  }
                  placeholder="Example: Make it less spicy, no onion, extra crispy..."
                />

                <small>
                  {specialInstructions.length}/300 characters
                </small>
              </div>

              <div className="customize-quantity">
                <div>
                  <strong>Quantity</strong>
                  <span>Select how many you want</span>
                </div>

                <div className="customize-quantity-controls">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((previous) => Math.max(1, previous - 1))
                    }
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>

                  <strong>{quantity}</strong>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((previous) => Math.min(99, previous + 1))
                    }
                    disabled={quantity >= 99}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="customize-price-breakdown">
                <div>
                  <span>Base Price</span>
                  <span>₹{basePrice.toFixed(2)}</span>
                </div>

                <div>
                  <span>Customization Charges</span>
                  <span>₹{customizationTotal.toFixed(2)}</span>
                </div>

                <div>
                  <span>Price per item</span>
                  <strong>₹{unitPrice.toFixed(2)}</strong>
                </div>

                <div className="customize-final-total">
                  <strong>Total Amount</strong>
                  <strong>₹{grandTotal.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            <div className="customize-footer">
              <button
                type="button"
                className="customize-cancel-button"
                onClick={closeCustomization}
                disabled={addingToCart}
              >
                Cancel
              </button>

              <button
                type="button"
                className="customize-add-button"
                onClick={addCustomizedToCart}
                disabled={addingToCart}
              >
                <ShoppingBag size={17} />
                {addingToCart
                  ? "Adding..."
                  : `Add to Cart • ₹${grandTotal.toFixed(2)}`}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Menu;
