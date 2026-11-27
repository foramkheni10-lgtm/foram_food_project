
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/restaurant/RestaurantMenu.css";
import RestaurantSidebar from "../../pages/restaurant/RestaurantSidebar";

const API = "http://127.0.0.1:8000";

type PriceOption = {
  name: string;
  price: string;
  quantity?: number;
  inches?: number;
  enabled: boolean;
};

type Customization = {
  spice_levels?: string[];
  patty_types?: string[];
  bun_types?: string[];
  cheese_options?: string[];
  toppings?: string[];

  burger_quantities?: PriceOption[];
  pizza_sizes?: PriceOption[];

  crust_options?: string[];

  flavour_options?: string[];
  sugar_levels?: string[];
  ice_levels?: string[];
  temperatures?: string[];
  beverage_sizes?: string[];

  food_types?: string[];
  serving_sizes?: string[];

  egg_options?: string[];
  bakery_sizes?: string[];
  filling_options?: string[];

  scoop_sizes?: string[];
};

interface Food {
  _id: string;
  restaurant_id: string;
  food_name: string;
  food_type?: string;
  category: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  available: boolean;
  preparation_time?: number;
  ingredients?: string[];
  customization?: Customization;

  is_todays_special?: boolean;
  is_bestseller?: boolean;
  is_chef_special?: boolean;
  is_restaurant_special?: boolean;

  discount?: {
    enabled: boolean;
    percentage: number;
    start_date: string;
    end_date: string;
  };
}

interface FoodForm {
  food_name: string;
  food_type: string;
  category: string;
  description: string;
  price: string;
  available: boolean | null;
  preparation_time: string;
  ingredients: string;

  images: string[];

  is_todays_special: boolean;
  is_bestseller: boolean;
  is_chef_special: boolean;
  is_restaurant_special: boolean;

  discount_enabled: boolean;
  discount_percentage: string;
  discount_start_date: string;
  discount_end_date: string;

  customization: Customization;
}

const foodTypeOptions = [
  "Burger",
  "Pizza",
  "Cold Drinks",
  "Beverages",
  "Chinese Food",
  "Indian Food",
  "South Indian Food",
  "Biryani",
  "Bakery",
  "Pastry",
  "Sweets & Desserts",
  "Sandwich",
  "Ice Cream",
  "Other"
];

const categoryOptions = [
  "Starter",
  "Main Course",
  "Rice",
  "Biryani",
  "Bread",
  "Snacks",
  "Pizza",
  "Burger",
  "Sandwich",
  "Beverage",
  "Bakery",
  "Pastry",
  "Dessert",
  "Ice Cream",
  "Other"
];

const spiceOptions = [
  "Non-Spicy",
  "Mild",
  "Medium",
  "Spicy"
];

const flavourOptions = [
  "Chocolate",
  "Vanilla",
  "Strawberry",
  "Mango",
  "Lemon",
  "Mint",
  "Blueberry",
  "Butterscotch",
  "Coffee",
  "Other"
];

const toppingOptions = [
  "Cheese",
  "Onion",
  "Tomato",
  "Capsicum",
  "Olives",
  "Jalapeno",
  "Corn",
  "Chocolate Chips",
  "Nuts",
  "Whipped Cream"
];

const emptyForm: FoodForm = {
  food_name: "",
  food_type: "",
  category: "",
  description: "",
  price: "",
  available: null,
  preparation_time: "15",
  ingredients: "",

  images: [],

  is_todays_special: false,
  is_bestseller: false,
  is_chef_special: false,
  is_restaurant_special: false,

  discount_enabled: false,
  discount_percentage: "",
  discount_start_date: "",
  discount_end_date: "",

  customization: {}
};

const defaultBurgerQuantities: PriceOption[] = [
  { name: "1 Burger", quantity: 1, price: "", enabled: false },
  { name: "2 Burgers", quantity: 2, price: "", enabled: false },
  { name: "3 Burgers", quantity: 3, price: "", enabled: false }
];

const defaultPizzaSizes: PriceOption[] = [
  { name: "Small", inches: 7, price: "", enabled: false },
  { name: "Regular", inches: 9, price: "", enabled: false },
  { name: "Medium", inches: 11, price: "", enabled: false },
  { name: "Large", inches: 13, price: "", enabled: false }
];

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function isDiscountActive(discount?: Food["discount"]) {
  if (!discount?.enabled || !discount.percentage) return false;

  const today = getTodayDate();

  if (discount.start_date && today < discount.start_date) return false;
  if (discount.end_date && today > discount.end_date) return false;

  return true;
}

function getFinalPrice(food: Food) {
  if (isDiscountActive(food.discount)) {
    return food.price -
      (food.price * (food.discount!.percentage / 100));
  }

  return food.price;
}

function formatCustomizationValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "object" && item !== null) {
        const option = item as PriceOption;
        return `${option.name} - ₹${option.price}`;
      }

      return String(item);
    }).join(", ");
  }

  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }

  return String(value ?? "");
}

function getInitialCustomization(foodType: string): Customization {
  if (foodType === "Burger") {
    return {
      spice_levels: [],
      patty_types: [],
      bun_types: [],
      cheese_options: [],
      toppings: [],
      burger_quantities: defaultBurgerQuantities.map((item) => ({ ...item }))
    };
  }

  if (foodType === "Pizza") {
    return {
      spice_levels: [],
      crust_options: [],
      cheese_options: [],
      toppings: [],
      pizza_sizes: defaultPizzaSizes.map((item) => ({ ...item }))
    };
  }

  if (
    foodType === "Cold Drinks" ||
    foodType === "Beverages"
  ) {
    return {
      flavour_options: [],
      sugar_levels: [],
      ice_levels: [],
      temperatures: [],
      beverage_sizes: []
    };
  }

  if (foodType === "Bakery" || foodType === "Pastry") {
    return {
      flavour_options: [],
      egg_options: [],
      bakery_sizes: [],
      filling_options: [],
      toppings: []
    };
  }

  if (
    foodType === "Sweets & Desserts" ||
    foodType === "Ice Cream"
  ) {
    return {
      flavour_options: [],
      serving_sizes: [],
      scoop_sizes: [],
      toppings: []
    };
  }

  return {
    food_types: [],
    spice_levels: [],
    serving_sizes: [],
    toppings: []
  };
}

function normalizeCustomization(
  foodType: string,
  oldCustomization?: Customization
): Customization {
  const defaults = getInitialCustomization(foodType);

  if (!oldCustomization) return defaults;

  const old = { ...oldCustomization } as Record<string, unknown>;
  const result = { ...defaults, ...old } as Customization;

  // Support records created using the older single-choice fields.
  const oldSpice = old["spice_level"];
  if (!result.spice_levels?.length && typeof oldSpice === "string" && oldSpice) {
    result.spice_levels = [oldSpice];
  }

  const oldToppings = old["toppings"];
  if (typeof oldToppings === "string") {
    result.toppings = oldToppings
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return result;
}

export default function RestaurantMenu() {
  const navigate = useNavigate();

  const restaurantId = localStorage.getItem("restaurantId");
  const restaurantName = localStorage.getItem("restaurantName") || "Restaurant";

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FoodForm>({ ...emptyForm });

  useEffect(() => {
    if (!restaurantId) {
      navigate("/login");
      return;
    }

    fetchFoods();
  }, [restaurantId]);

  async function fetchFoods() {
    if (!restaurantId) return;

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/api/restaurants/${restaurantId}/foods`
      );

      setFoods(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load menu items. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(
    field: keyof FoodForm,
    value: string | boolean | boolean[] | null
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function updateCustomization(
    field: keyof Customization,
    value: unknown
  ) {
    setForm((previous) => ({
      ...previous,
      customization: {
        ...previous.customization,
        [field]: value
      }
    }));
  }

  function toggleOption(
    field: keyof Customization,
    option: string,
    checked: boolean
  ) {
    const current = (form.customization[field] as string[]) || [];

    const updated = checked
      ? [...current, option]
      : current.filter((item) => item !== option);

    updateCustomization(field, updated);
  }

  function togglePriceOption(
    field: "burger_quantities" | "pizza_sizes",
    index: number,
    key: "enabled" | "price",
    value: boolean | string
  ) {
    const current = [
      ...(form.customization[field] || [])
    ];

    current[index] = {
      ...current[index],
      [key]: value
    };

    updateCustomization(field, current);
  }

  function handleFoodTypeChange(foodType: string) {
    setForm((previous) => ({
      ...previous,
      food_type: foodType,
      customization: getInitialCustomization(foodType)
    }));
  }

  function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (form.images.length + files.length > 4) {
      alert("You can upload maximum 4 images.");
      event.target.value = "";
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        alert("Please select image files only.");
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        const image = reader.result as string;

        setForm((previous) => ({
          ...previous,
          images: [...previous.images, image].slice(0, 4)
        }));
      };

      reader.readAsDataURL(file);
    });

    event.target.value = "";
  }

  function removeImage(index: number) {
    setForm((previous) => ({
      ...previous,
      images: previous.images.filter((_, i) => i !== index)
    }));
  }

  function openAddForm() {
    setEditingFoodId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setError("");
  }

  function handleEditClick(food: Food) {
    const foodType = food.food_type || "Other";

    setEditingFoodId(food._id);

    setForm({
      food_name: food.food_name || "",
      food_type: foodType,
      category: food.category || "",
      description: food.description || "",
      price: String(food.price ?? ""),
      available: food.available ?? true,
      preparation_time: String(food.preparation_time ?? 15),
      ingredients: (food.ingredients || []).join(", "),

      images: food.images?.length
        ? food.images
        : food.image
          ? [food.image]
          : [],

      is_todays_special: food.is_todays_special ?? false,
      is_bestseller: food.is_bestseller ?? false,
      is_chef_special: food.is_chef_special ?? false,
      is_restaurant_special: food.is_restaurant_special ?? false,

      discount_enabled: food.discount?.enabled ?? false,
      discount_percentage: String(food.discount?.percentage ?? ""),
      discount_start_date: food.discount?.start_date ?? "",
      discount_end_date: food.discount?.end_date ?? "",

      customization: normalizeCustomization(
        foodType,
        food.customization
      )
    });

    setShowForm(true);
    setError("");
  }

  function buildCustomization(): Customization {
    const result: Customization = {
      ...form.customization
    };

    if (result.burger_quantities) {
      result.burger_quantities = result.burger_quantities
        .filter((item) => item.enabled && Number(item.price) > 0)
        .map((item) => ({
          ...item,
          price: String(Number(item.price))
        }));
    }

    if (result.pizza_sizes) {
      result.pizza_sizes = result.pizza_sizes
        .filter((item) => item.enabled && Number(item.price) > 0)
        .map((item) => ({
          ...item,
          price: String(Number(item.price))
        }));
    }

    return result;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!restaurantId) {
      navigate("/login");
      return;
    }

    if (!form.food_name.trim()) {
      alert("Please enter food name.");
      return;
    }

    if (!form.food_type) {
      alert("Please select food type.");
      return;
    }

    if (!form.category) {
      alert("Please select category.");
      return;
    }

    if (!form.price || Number(form.price) <= 0) {
      alert("Please enter a valid food price.");
      return;
    }

    if (form.available === null) {
      alert("Please select Available or Unavailable.");
      return;
    }

    const percentage = Number(form.discount_percentage || 0);

    if (
      form.discount_enabled &&
      (percentage <= 0 || percentage > 100)
    ) {
      alert("Discount percentage must be between 1 and 100.");
      return;
    }

    const customization = buildCustomization();

    const payload = {
      food_name: form.food_name.trim(),
      food_type: form.food_type,
      category: form.category,
      description: form.description,
      price: Number(form.price),
      image: form.images[0] || "",
      images: form.images,
      available: form.available,
      preparation_time: Number(form.preparation_time || 15),
      ingredients: form.ingredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),

      customization,

      is_todays_special: form.is_todays_special,
      is_bestseller: form.is_bestseller,
      is_chef_special: form.is_chef_special,
      is_restaurant_special: form.is_restaurant_special,

      discount: {
        enabled: form.discount_enabled,
        percentage: form.discount_enabled ? percentage : 0,
        start_date: form.discount_start_date,
        end_date: form.discount_end_date
      }
    };

    try {
      setSaving(true);
      setError("");

      if (editingFoodId) {
        await axios.put(
          `${API}/api/restaurants/foods/${editingFoodId}`,
          payload
        );
        alert("Food updated successfully.");
      } else {
        await axios.post(
          `${API}/api/restaurants/${restaurantId}/foods`,
          payload
        );
        alert("Food added successfully.");
      }

      setShowForm(false);
      setEditingFoodId(null);
      setForm({ ...emptyForm });

      await fetchFoods();
    } catch (err: any) {
      console.error(err);
      const message =
        err.response?.data?.detail ||
        "Unable to save food. Please check your backend.";
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteFood(foodId: string) {
    if (!window.confirm("Are you sure you want to delete this food?")) {
      return;
    }

    try {
      await axios.delete(
        `${API}/api/restaurants/foods/${foodId}`
      );

      alert("Food deleted successfully.");
      await fetchFoods();
    } catch (err) {
      console.error(err);
      alert("Unable to delete food.");
    }
  }

  function renderCheckboxOptions(
    title: string,
    field: keyof Customization,
    options: string[]
  ) {
    const selected = (form.customization[field] as string[]) || [];

    return (
      <div className="dynamic-option-section">
        <h4>{title}</h4>

        <div className="dynamic-option-grid">
          {options.map((option) => (
            <label className="dynamic-option" key={option}>
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={(event) =>
                  toggleOption(field, option, event.target.checked)
                }
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  function renderPriceOptions(
    title: string,
    field: "burger_quantities" | "pizza_sizes"
  ) {
    const options = form.customization[field] || [];

    return (
      <div className="dynamic-option-section">
        <h4>{title}</h4>

        {options.map((option, index) => (
          <div className="price-option-row" key={option.name}>
            <label>
              <input
                type="checkbox"
                checked={option.enabled}
                onChange={(event) =>
                  togglePriceOption(
                    field,
                    index,
                    "enabled",
                    event.target.checked
                  )
                }
              />
              <span>
                {option.name}
                {option.inches ? ` (${option.inches}")` : ""}
              </span>
            </label>

            <input
              type="number"
              min="1"
              placeholder="Price ₹"
              value={option.price}
              disabled={!option.enabled}
              onChange={(event) =>
                togglePriceOption(
                  field,
                  index,
                  "price",
                  event.target.value
                )
              }
            />
          </div>
        ))}
      </div>
    );
  }

  function renderDynamicFields() {
    const type = form.food_type;

    if (!type) return null;

    return (
      <div className="dynamic-customization">
        <h3>Food Customization Options</h3>
        <p>Select all options that your restaurant provides.</p>

        {type === "Burger" && (
          <>
            {renderPriceOptions("Burger Quantity and Price", "burger_quantities")}

            {renderCheckboxOptions(
              "Patty Type",
              "patty_types",
              ["Veg", "Aloo Tikki", "Paneer", "Cheese", "Chicken", "Other"]
            )}

            {renderCheckboxOptions(
              "Bun Type",
              "bun_types",
              ["Regular Bun", "Whole Wheat Bun", "Multigrain Bun"]
            )}

            {renderCheckboxOptions(
              "Cheese Options",
              "cheese_options",
              ["No Cheese", "Cheddar", "Mozzarella", "Extra Cheese"]
            )}

            {renderCheckboxOptions("Spice Levels", "spice_levels", spiceOptions)}
            {renderCheckboxOptions("Available Toppings", "toppings", toppingOptions)}
          </>
        )}

        {type === "Pizza" && (
          <>
            {renderPriceOptions("Pizza Sizes and Prices", "pizza_sizes")}

            {renderCheckboxOptions(
              "Crust Options",
              "crust_options",
              ["Thin Crust", "Regular Crust", "Thick Crust", "Cheese Burst"]
            )}

            {renderCheckboxOptions(
              "Cheese Options",
              "cheese_options",
              ["Regular Cheese", "Extra Cheese", "Mozzarella", "Cheese Burst"]
            )}

            {renderCheckboxOptions("Spice Levels", "spice_levels", spiceOptions)}
            {renderCheckboxOptions("Available Toppings", "toppings", toppingOptions)}
          </>
        )}

        {(type === "Cold Drinks" || type === "Beverages") && (
          <>
            {renderCheckboxOptions("Flavours", "flavour_options", flavourOptions)}

            {renderCheckboxOptions(
              "Sugar Level",
              "sugar_levels",
              ["No Sugar", "Less Sugar", "Regular Sugar", "Extra Sugar"]
            )}

            {renderCheckboxOptions(
              "Ice Level",
              "ice_levels",
              ["No Ice", "Less Ice", "Regular Ice", "Extra Ice"]
            )}

            {renderCheckboxOptions(
              "Temperature",
              "temperatures",
              ["Cold", "Room Temperature", "Hot"]
            )}

            {renderCheckboxOptions(
              "Drink Sizes",
              "beverage_sizes",
              ["Small", "Medium", "Large"]
            )}
          </>
        )}

        {(type === "Bakery" || type === "Pastry") && (
          <>
            {renderCheckboxOptions("Flavours", "flavour_options", flavourOptions)}

            {renderCheckboxOptions(
              "Egg Options",
              "egg_options",
              ["Egg", "Eggless"]
            )}

            {renderCheckboxOptions(
              "Size / Weight",
              "bakery_sizes",
              ["Small", "Medium", "Large", "250g", "500g", "1kg"]
            )}

            {renderCheckboxOptions(
              "Filling Options",
              "filling_options",
              ["Chocolate", "Vanilla Cream", "Strawberry", "Fruit", "None"]
            )}

            {renderCheckboxOptions("Toppings", "toppings", toppingOptions)}
          </>
        )}

        {(type === "Sweets & Desserts" || type === "Ice Cream") && (
          <>
            {renderCheckboxOptions("Flavours", "flavour_options", flavourOptions)}

            {renderCheckboxOptions(
              "Serving Sizes",
              "serving_sizes",
              ["Single", "Regular", "Family Pack"]
            )}

            {renderCheckboxOptions(
              "Scoop Sizes",
              "scoop_sizes",
              ["1 Scoop", "2 Scoops", "3 Scoops"]
            )}

            {renderCheckboxOptions("Toppings", "toppings", toppingOptions)}
          </>
        )}

        {type === "Sandwich" && (
          <>
            {renderCheckboxOptions(
              "Food Types",
              "food_types",
              ["Veg", "Jain", "Vegan", "Cheese", "Non-Veg"]
            )}

            {renderCheckboxOptions("Spice Levels", "spice_levels", spiceOptions)}
            {renderCheckboxOptions("Toppings", "toppings", toppingOptions)}

            {renderCheckboxOptions(
              "Serving Sizes",
              "serving_sizes",
              ["Regular", "Large"]
            )}
          </>
        )}

        {[
          "Chinese Food",
          "Indian Food",
          "South Indian Food",
          "Biryani",
          "Other"
        ].includes(type) && (
          <>
            {renderCheckboxOptions(
              "Food Types",
              "food_types",
              ["Veg", "Jain", "Vegan", "Non-Veg", "Egg"]
            )}

            {renderCheckboxOptions("Spice Levels", "spice_levels", spiceOptions)}

            {renderCheckboxOptions(
              "Serving Sizes",
              "serving_sizes",
              ["Half", "Full", "Regular", "Large"]
            )}

            {renderCheckboxOptions("Toppings / Add-ons", "toppings", toppingOptions)}
          </>
        )}
      </div>
    );
  }

  const activeFoods = foods.filter((food) => food.available);
  const unavailableFoods = foods.filter((food) => !food.available);

return (
  <>
    <RestaurantSidebar />

    <div className="restaurant-content-area">
      <div className="restaurant-menu-page">

        {/* HEADER */}
        <div className="menu-header">
          <div>
            <h1>Menu Management</h1>
            <p>{restaurantName}</p>
          </div>

          <button className="add-food-btn" onClick={openAddForm}>
            + Add Food
          </button>
        </div>

        {error && <div className="menu-error">{error}</div>}

        {/* ADD / EDIT FOOD FORM */}
        {showForm && (
          <div className="food-form-container">
            <div className="food-form-header">
              <h2>{editingFoodId ? "Edit Food" : "Add New Food"}</h2>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="close-form-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Food Name *</label>
                  <input
                    type="text"
                    value={form.food_name}
                    onChange={(e) => updateField("food_name", e.target.value)}
                    placeholder="Example: Paneer Pizza"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Food Type *</label>
                  <select
                    value={form.food_type}
                    onChange={(e) => handleFoodTypeChange(e.target.value)}
                    required
                  >
                    <option value="">Select Food Type</option>
                    {foodTypeOptions.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Base Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    placeholder="Enter price"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Preparation Time (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.preparation_time}
                    onChange={(e) => updateField("preparation_time", e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Availability *</label>
                  <select
                    value={form.available === null ? "" : String(form.available)}
                    onChange={(e) =>
                      updateField(
                        "available",
                        e.target.value === "" ? null : e.target.value === "true"
                      )
                    }
                    required
                  >
                    <option value="">Select Availability</option>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Enter food description"
                  rows={3}
                />
              </div>

              {renderDynamicFields()}

              <div className="form-group">
                <label>Ingredients (comma separated)</label>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => updateField("ingredients", e.target.value)}
                  placeholder="Example: Cheese, Tomato, Onion"
                  rows={2}
                />
              </div>

              {/* DISCOUNT */}
              <div className="discount-section">
                <h3>Discount Details</h3>

                <label className="special-option">
                  <input
                    type="checkbox"
                    checked={form.discount_enabled}
                    onChange={(e) => updateField("discount_enabled", e.target.checked)}
                  />
                  Enable Discount
                </label>

                {form.discount_enabled && (
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Discount Percentage *</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={form.discount_percentage}
                        onChange={(e) =>
                          updateField("discount_percentage", e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Start Date</label>
                      <input
                        type="date"
                        value={form.discount_start_date}
                        onChange={(e) =>
                          updateField("discount_start_date", e.target.value)
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date</label>
                      <input
                        type="date"
                        min={form.discount_start_date || undefined}
                        value={form.discount_end_date}
                        onChange={(e) =>
                          updateField("discount_end_date", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}

                {form.discount_enabled &&
                  Number(form.price) > 0 &&
                  Number(form.discount_percentage) > 0 &&
                  Number(form.discount_percentage) <= 100 && (
                    <p>
                      Discounted Price: ₹
                      {(
                        Number(form.price) -
                        Number(form.price) * Number(form.discount_percentage) / 100
                      ).toFixed(2)}
                    </p>
                  )}
              </div>

              {/* FOOD IMAGES */}
              <div className="form-group">
                <label>Food Images (Maximum 4)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={form.images.length >= 4}
                />

                <div className="food-image-preview">
                  {form.images.map((image, index) => (
                    <div className="food-image-preview-item" key={index}>
                      <img src={image} alt={`Food ${index + 1}`} />
                      <button type="button" onClick={() => removeImage(index)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPECIAL LABELS */}
              <div className="special-labels">
                <h3>Special Labels</h3>

                <label className="special-option">
                  <input
                    type="checkbox"
                    checked={form.is_todays_special}
                    onChange={(e) => updateField("is_todays_special", e.target.checked)}
                  />
                  Today's Special
                </label>

                <label className="special-option">
                  <input
                    type="checkbox"
                    checked={form.is_bestseller}
                    onChange={(e) => updateField("is_bestseller", e.target.checked)}
                  />
                  Bestseller
                </label>

                <label className="special-option">
                  <input
                    type="checkbox"
                    checked={form.is_chef_special}
                    onChange={(e) => updateField("is_chef_special", e.target.checked)}
                  />
                  Chef Special
                </label>

                <label className="special-option">
                  <input
                    type="checkbox"
                    checked={form.is_restaurant_special}
                    onChange={(e) => updateField("is_restaurant_special", e.target.checked)}
                  />
                  Restaurant Special
                </label>
              </div>

              {/* FORM BUTTONS */}
              <div className="form-actions">
                <button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingFoodId
                      ? "Update Food"
                      : "Add Food"}
                </button>

                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* AVAILABLE FOODS */}
        <div className="menu-food-section">
          <h2>Available Foods ({activeFoods.length})</h2>

          {loading ? (
            <p>Loading menu...</p>
          ) : activeFoods.length === 0 ? (
            <p>No available food items yet.</p>
          ) : (
            <div className="food-card-grid">
              {activeFoods.map((food) => (
                <div className="food-card" key={food._id}>
                  {(food.images?.[0] || food.image) && (
                    <img
                      className="food-card-image"
                      src={food.images?.[0] || food.image}
                      alt={food.food_name}
                    />
                  )}

                  <div className="food-card-content">
                    <h3>{food.food_name}</h3>

                    <p><strong>Type:</strong> {food.food_type || "Other"}</p>
                    <p><strong>Category:</strong> {food.category}</p>
                    <p>{food.description}</p>

                    <p>
                      <strong>Price:</strong>{" "}
                      {isDiscountActive(food.discount) ? (
                        <>
                          <del>₹{food.price}</del>{" "}
                          <strong>₹{getFinalPrice(food).toFixed(2)}</strong>
                          {" "}({food.discount?.percentage}% off)
                        </>
                      ) : (
                        `₹${food.price}`
                      )}
                    </p>

                    {food.preparation_time && (
                      <p>Preparation: {food.preparation_time} minutes</p>
                    )}

                    {food.ingredients?.length ? (
                      <p>
                        <strong>Ingredients:</strong>{" "}
                        {food.ingredients.join(", ")}
                      </p>
                    ) : null}

                    {food.customization &&
                      Object.entries(food.customization).map(([key, value]) => {
                        if (
                          value === undefined ||
                          value === null ||
                          (Array.isArray(value) && value.length === 0)
                        ) {
                          return null;
                        }

                        return (
                          <p key={key}>
                            <strong>{key.replaceAll("_", " ")}:</strong>{" "}
                            {formatCustomizationValue(value)}
                          </p>
                        );
                      })}

                    <div className="food-badges">
                      {food.is_todays_special && <span>Today's Special</span>}
                      {food.is_bestseller && <span>Bestseller</span>}
                      {food.is_chef_special && <span>Chef Special</span>}
                      {food.is_restaurant_special && <span>Restaurant Special</span>}
                    </div>

                    <div className="food-card-actions">
                      <button onClick={() => handleEditClick(food)}>Edit</button>
                      <button onClick={() => handleDeleteFood(food._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* UNAVAILABLE FOODS */}
          <h2 className="unavailable-heading">
            Unavailable Foods ({unavailableFoods.length})
          </h2>

          {unavailableFoods.length > 0 && (
            <div className="food-card-grid">
              {unavailableFoods.map((food) => (
                <div className="food-card unavailable-food-card" key={food._id}>
                  {(food.images?.[0] || food.image) && (
                    <img
                      className="food-card-image"
                      src={food.images?.[0] || food.image}
                      alt={food.food_name}
                    />
                  )}

                  <div className="food-card-content">
                    <h3>{food.food_name}</h3>
                    <p>{food.food_type || "Other"} · {food.category}</p>
                    <p>₹{food.price}</p>
                    <strong>Currently Unavailable</strong>

                    <div className="food-card-actions">
                      <button onClick={() => handleEditClick(food)}>Edit</button>
                      <button onClick={() => handleDeleteFood(food._id)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  </>
);
}