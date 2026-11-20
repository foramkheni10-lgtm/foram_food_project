
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";
import {
  ShoppingCart,
  X,
  SlidersHorizontal,
  Check,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";

interface Customization {
  group: string;
  option: string;
  additional_price: number;
}

interface CustomizationChoice {
  name: string;
  price: number;
}

interface CustomizationGroup {
  name: string;
  type: "single" | "multiple";
  choices: CustomizationChoice[];
}

interface CartItem {
  cart_item_id?: string;
  food_id: string;
  name: string;
  category: string;
  base_price?: number;
  customization_total?: number;
  price: number;
  quantity: number;
  subtotal: number;
  customizations?: Customization[];
  special_instructions?: string;
  image?: string;
  image_url?: string;
  food_image?: string;
}

interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

interface FoodRecord {
  _id?: string;
  id?: string;
  food_id?: string;
  image?: string;
  image_url?: string;
  food_image?: string;
  image_path?: string;
  photo?: string;
}

const API = "https://foram-food-project.onrender.com";

const customizationOptions: Record<string, CustomizationGroup[]> = {
  pizza: [
    {
      name: "Size",
      type: "single",
      choices: [
        { name: "Regular", price: 0 },
        { name: "Medium", price: 60 },
        { name: "Large", price: 120 },
      ],
    },
    {
      name: "Crust",
      type: "single",
      choices: [
        { name: "Classic Crust", price: 0 },
        { name: "Thin Crust", price: 20 },
        { name: "Cheese Burst", price: 60 },
      ],
    },
    {
      name: "Cheese",
      type: "single",
      choices: [
        { name: "Regular Cheese", price: 0 },
        { name: "Extra Cheese", price: 35 },
      ],
    },
    {
      name: "Toppings",
      type: "multiple",
      choices: [
        { name: "Mushrooms", price: 25 },
        { name: "Olives", price: 20 },
        { name: "Jalapenos", price: 20 },
        { name: "Capsicum", price: 15 },
        { name: "Sweet Corn", price: 20 },
      ],
    },
  ],

  burger: [
    {
      name: "Patty",
      type: "single",
      choices: [
        { name: "Veg Patty", price: 0 },
        { name: "Paneer Patty", price: 35 },
        { name: "Crispy Patty", price: 25 },
      ],
    },
    {
      name: "Bun",
      type: "single",
      choices: [
        { name: "Regular Bun", price: 0 },
        { name: "Whole Wheat Bun", price: 15 },
      ],
    },
    {
      name: "Cheese",
      type: "single",
      choices: [
        { name: "No Extra Cheese", price: 0 },
        { name: "Extra Cheese", price: 25 },
      ],
    },
    {
      name: "Extras",
      type: "multiple",
      choices: [
        { name: "Extra Patty", price: 40 },
        { name: "Extra Onion", price: 10 },
        { name: "Extra Lettuce", price: 10 },
        { name: "Extra Sauce", price: 15 },
      ],
    },
  ],

  sandwich: [
    {
      name: "Bread",
      type: "single",
      choices: [
        { name: "White Bread", price: 0 },
        { name: "Brown Bread", price: 15 },
        { name: "Multigrain Bread", price: 25 },
      ],
    },
    {
      name: "Fillings",
      type: "multiple",
      choices: [
        { name: "Extra Paneer", price: 30 },
        { name: "Extra Cheese", price: 25 },
        { name: "Mushrooms", price: 20 },
      ],
    },
    {
      name: "Sauces",
      type: "multiple",
      choices: [
        { name: "Mint Mayo", price: 10 },
        { name: "Peri Peri Sauce", price: 10 },
        { name: "Cheese Sauce", price: 20 },
      ],
    },
  ],

  dosa: [
    {
      name: "Size",
      type: "single",
      choices: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 35 },
      ],
    },
    {
      name: "Filling",
      type: "single",
      choices: [
        { name: "Regular", price: 0 },
        { name: "Extra Masala", price: 25 },
        { name: "Paneer Filling", price: 40 },
      ],
    },
    {
      name: "Chutneys",
      type: "multiple",
      choices: [
        { name: "Extra Coconut Chutney", price: 15 },
        { name: "Extra Tomato Chutney", price: 15 },
        { name: "Extra Sambar", price: 20 },
      ],
    },
    {
      name: "Spice Level",
      type: "single",
      choices: [
        { name: "Mild", price: 0 },
        { name: "Medium", price: 0 },
        { name: "Spicy", price: 0 },
      ],
    },
  ],

  south: [
    {
      name: "Sambar",
      type: "single",
      choices: [
        { name: "Regular Sambar", price: 0 },
        { name: "Extra Sambar", price: 20 },
      ],
    },
    {
      name: "Chutneys",
      type: "multiple",
      choices: [
        { name: "Coconut Chutney", price: 15 },
        { name: "Tomato Chutney", price: 15 },
        { name: "Mint Chutney", price: 15 },
      ],
    },
    {
      name: "Add-ons",
      type: "multiple",
      choices: [
        { name: "Extra Idli", price: 20 },
        { name: "Extra Vada", price: 25 },
        { name: "Extra Podi", price: 15 },
      ],
    },
  ],

  north: [
    {
      name: "Spice Level",
      type: "single",
      choices: [
        { name: "Mild", price: 0 },
        { name: "Medium", price: 0 },
        { name: "Spicy", price: 0 },
      ],
    },
    {
      name: "Gravy",
      type: "single",
      choices: [
        { name: "Regular Gravy", price: 0 },
        { name: "Extra Gravy", price: 30 },
      ],
    },
    {
      name: "Add-ons",
      type: "multiple",
      choices: [
        { name: "Butter Roti", price: 20 },
        { name: "Butter Naan", price: 35 },
        { name: "Jeera Rice", price: 50 },
        { name: "Extra Paneer", price: 40 },
      ],
    },
  ],

  chinese: [
    {
      name: "Spice Level",
      type: "single",
      choices: [
        { name: "Mild", price: 0 },
        { name: "Medium", price: 0 },
        { name: "Hot", price: 0 },
      ],
    },
    {
      name: "Sauces",
      type: "multiple",
      choices: [
        { name: "Extra Schezwan Sauce", price: 20 },
        { name: "Extra Manchurian Sauce", price: 20 },
        { name: "Chilli Sauce", price: 15 },
      ],
    },
    {
      name: "Add-ons",
      type: "multiple",
      choices: [
        { name: "Extra Vegetables", price: 25 },
        { name: "Extra Paneer", price: 40 },
        { name: "Extra Noodles", price: 35 },
      ],
    },
  ],

  frankie: [
    {
      name: "Filling",
      type: "single",
      choices: [
        { name: "Regular Filling", price: 0 },
        { name: "Paneer Filling", price: 35 },
        { name: "Cheese Filling", price: 30 },
      ],
    },
    {
      name: "Sauces",
      type: "multiple",
      choices: [
        { name: "Mint Sauce", price: 10 },
        { name: "Mayo", price: 10 },
        { name: "Schezwan Sauce", price: 15 },
      ],
    },
    {
      name: "Extras",
      type: "multiple",
      choices: [
        { name: "Extra Cheese", price: 25 },
        { name: "Extra Vegetables", price: 20 },
        { name: "Extra Filling", price: 35 },
      ],
    },
  ],

  biryani: [
    {
      name: "Portion",
      type: "single",
      choices: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 60 },
      ],
    },
    {
      name: "Spice Level",
      type: "single",
      choices: [
        { name: "Mild", price: 0 },
        { name: "Medium", price: 0 },
        { name: "Spicy", price: 0 },
      ],
    },
    {
      name: "Add-ons",
      type: "multiple",
      choices: [
        { name: "Extra Raita", price: 20 },
        { name: "Boiled Egg", price: 20 },
        { name: "Extra Gravy", price: 25 },
      ],
    },
  ],

  dessert: [
    {
      name: "Size",
      type: "single",
      choices: [
        { name: "Regular", price: 0 },
        { name: "Large", price: 40 },
      ],
    },
    {
      name: "Toppings",
      type: "multiple",
      choices: [
        { name: "Chocolate Sauce", price: 20 },
        { name: "Choco Chips", price: 20 },
        { name: "Nuts", price: 25 },
        { name: "Whipped Cream", price: 25 },
      ],
    },
  ],

  beverage: [
    {
      name: "Size",
      type: "single",
      choices: [
        { name: "Regular", price: 0 },
        { name: "Medium", price: 20 },
        { name: "Large", price: 35 },
      ],
    },
    {
      name: "Ice",
      type: "single",
      choices: [
        { name: "Regular Ice", price: 0 },
        { name: "Less Ice", price: 0 },
        { name: "No Ice", price: 0 },
      ],
    },
    {
      name: "Sugar",
      type: "single",
      choices: [
        { name: "Regular Sugar", price: 0 },
        { name: "Less Sugar", price: 0 },
        { name: "No Sugar", price: 0 },
      ],
    },
    {
      name: "Extras",
      type: "multiple",
      choices: [
        { name: "Extra Cream", price: 20 },
        { name: "Chocolate Syrup", price: 15 },
      ],
    },
  ],
};

const defaultOptions: CustomizationGroup[] = [
  {
    name: "Spice Level",
    type: "single",
    choices: [
      { name: "Mild", price: 0 },
      { name: "Medium", price: 0 },
      { name: "Spicy", price: 0 },
    ],
  },
  {
    name: "Add-ons",
    type: "multiple",
    choices: [
      { name: "Extra Cheese", price: 25 },
      { name: "Extra Paneer", price: 40 },
      { name: "Extra Sauce", price: 15 },
    ],
  },
];

function getCustomizationGroups(item: CartItem): CustomizationGroup[] {
  const value = `${item.category} ${item.name}`.toLowerCase();

  if (value.includes("pizza")) return customizationOptions.pizza;
  if (value.includes("burger")) return customizationOptions.burger;
  if (value.includes("sandwich")) return customizationOptions.sandwich;
  if (value.includes("dosa")) return customizationOptions.dosa;

  if (
    value.includes("south indian") ||
    value.includes("idli") ||
    value.includes("vada") ||
    value.includes("uttapam")
  ) {
    return customizationOptions.south;
  }

  if (
    value.includes("north indian") ||
    value.includes("paneer") ||
    value.includes("naan") ||
    value.includes("roti") ||
    value.includes("paratha")
  ) {
    return customizationOptions.north;
  }

  if (
    value.includes("chinese") ||
    value.includes("noodles") ||
    value.includes("manchurian") ||
    value.includes("fried rice")
  ) {
    return customizationOptions.chinese;
  }

  if (
    value.includes("frankie") ||
    value.includes("roll") ||
    value.includes("wrap")
  ) {
    return customizationOptions.frankie;
  }

  if (
    value.includes("biryani") ||
    value.includes("rice") ||
    value.includes("pulao")
  ) {
    return customizationOptions.biryani;
  }

  if (
    value.includes("dessert") ||
    value.includes("sweet") ||
    value.includes("cake") ||
    value.includes("brownie") ||
    value.includes("ice cream") ||
    value.includes("gulab jamun")
  ) {
    return customizationOptions.dessert;
  }

  if (
    value.includes("drink") ||
    value.includes("beverage") ||
    value.includes("juice") ||
    value.includes("shake") ||
    value.includes("coffee") ||
    value.includes("tea") ||
    value.includes("cola")
  ) {
    return customizationOptions.beverage;
  }

  return defaultOptions;
}

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState<CartResponse>({
    items: [],
    total_items: 0,
    total_price: 0,
  });

  const [foodImages, setFoodImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customizingItem, setCustomizingItem] = useState<CartItem | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Customization[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [savingCustomization, setSavingCustomization] = useState(false);

  const token = localStorage.getItem("smartfoodcourt_token");

  const getImageUrl = (image?: string) => {
    if (!image || typeof image !== "string") return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    return `${API}/${image.replace(/^\/+/, "")}`;
  };

  const fetchFoodImages = async () => {
    try {
      const response = await axios.get(`${API}/api/foods/`);

      const data = response.data;
      const foods: FoodRecord[] = Array.isArray(data)
        ? data
        : data.foods || data.items || data.data || [];

      const imageMap: Record<string, string> = {};

      foods.forEach((food) => {
        const foodId = String(food._id || food.id || food.food_id || "");

        const image =
          food.image_url ||
          food.image ||
          food.food_image ||
          food.image_path ||
          food.photo;

        if (foodId && image) {
          imageMap[foodId] = getImageUrl(image);
        }
      });

      setFoodImages(imageMap);
    } catch (err) {
      console.error("Unable to load food images:", err);
    }
  };

  const fetchCart = async () => {
    if (!token) {
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API}/api/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart(response.data);
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchFoodImages();
  }, []);

  const getCartItemId = (item: CartItem) =>
    item.cart_item_id || item.food_id;

  const updateQuantity = async (item: CartItem, quantity: number) => {
    if (quantity < 1 || quantity > 99) return;

    try {
      const itemId = getCartItemId(item);

      await axios.patch(
        `${API}/api/cart/items/${encodeURIComponent(itemId)}?quantity=${quantity}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to update quantity.");
    }
  };

  const removeItem = async (item: CartItem) => {
    try {
      const itemId = getCartItemId(item);

      await axios.delete(
        `${API}/api/cart/items/${encodeURIComponent(itemId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to remove item.");
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      await axios.delete(`${API}/api/cart/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to clear cart.");
    }
  };

  const openCustomization = (item: CartItem) => {
    setCustomizingItem(item);
    setSelectedOptions(item.customizations || []);
    setSpecialInstructions(item.special_instructions || "");
  };

  const closeCustomization = () => {
    if (savingCustomization) return;

    setCustomizingItem(null);
    setSelectedOptions([]);
    setSpecialInstructions("");
  };

  const toggleOption = (
    group: CustomizationGroup,
    choice: CustomizationChoice
  ) => {
    setSelectedOptions((previous) => {
      const alreadySelected = previous.some(
        (option) =>
          option.group === group.name && option.option === choice.name
      );

      if (group.type === "single") {
        return [
          ...previous.filter((option) => option.group !== group.name),
          ...(alreadySelected
            ? []
            : [
                {
                  group: group.name,
                  option: choice.name,
                  additional_price: choice.price,
                },
              ]),
        ];
      }

      if (alreadySelected) {
        return previous.filter(
          (option) =>
            !(
              option.group === group.name &&
              option.option === choice.name
            )
        );
      }

      return [
        ...previous,
        {
          group: group.name,
          option: choice.name,
          additional_price: choice.price,
        },
      ];
    });
  };

  const saveCustomization = async () => {
    if (!customizingItem) return;

    try {
      setSavingCustomization(true);

      const itemId = getCartItemId(customizingItem);

      await axios.patch(
        `${API}/api/cart/items/${encodeURIComponent(itemId)}/customize`,
        {
          customizations: selectedOptions,
          special_instructions: specialInstructions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCustomizingItem(null);
      setSelectedOptions([]);
      setSpecialInstructions("");

      await fetchCart();
    } catch (err: any) {
      alert(
        err.response?.data?.detail ||
          "Unable to save your customization. Please try again."
      );
    } finally {
      setSavingCustomization(false);
    }
  };

  const customizationTotal = selectedOptions.reduce(
    (total, option) => total + Number(option.additional_price || 0),
    0
  );

  const customizationGroups = customizingItem
    ? getCustomizationGroups(customizingItem)
    : [];

  if (loading) {
    return <div className="cart-status">Loading your cart...</div>;
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <span className="cart-heading-eyebrow">
          <ShoppingCart size={15} />
          SMART FOODCOURT
        </span>

        <h1>
          My Shopping <span>Cart</span>
        </h1>

        <p>Review your delicious choices before checkout.</p>
      </div>

      {error && <div className="cart-error">{error}</div>}

      {cart.items.length === 0 ? (
        <section className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Explore our menu and add your favourite food.</p>
          <button onClick={() => navigate("/menu")}>
            Explore Menu
          </button>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {cart.items.map((item) => {
              const imageUrl = getImageUrl(
                item.image_url ||
                  item.image ||
                  item.food_image ||
                  foodImages[item.food_id]
              );

              const itemId = getCartItemId(item);

              return (
                <article className="cart-item" key={itemId}>
                  <div className="cart-item-image">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          const fallback =
                            event.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}

                    <span
                      className="cart-image-fallback"
                      style={{ display: imageUrl ? "none" : "flex" }}
                    >
                      🍽️
                    </span>
                  </div>

                  <div className="cart-item-info">
                    <span>{item.category}</span>
                    <h3>{item.name}</h3>

                    <p>₹{Number(item.price).toFixed(2)} each</p>

                    {item.customizations &&
                      item.customizations.length > 0 && (
                        <div className="cart-customizations">
                          <strong>Your customizations</strong>
                          {item.customizations.map((option, index) => (
                            <p key={`${option.group}-${index}`}>
                              {option.group}: {option.option}
                              {option.additional_price > 0 &&
                                ` (+₹${Number(
                                  option.additional_price
                                ).toFixed(2)})`}
                            </p>
                          ))}
                        </div>
                      )}

                    {item.special_instructions && (
                      <div className="cart-special-instructions">
                        <strong>Special instructions:</strong>
                        <p>{item.special_instructions}</p>
                      </div>
                    )}

                    <div className="cart-item-actions">
                      <button
                        className="customize-button"
                        onClick={() => openCustomization(item)}
                      >
                        <SlidersHorizontal size={15} />
                        {item.customizations?.length
                          ? "Edit Customization"
                          : "Customize"}
                      </button>

                      <span className="customize-hint">
                        Optional · Make it your way
                      </span>
                    </div>

                    <div className="cart-quantity">
                      <button
                        onClick={() =>
                          updateQuantity(item, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>

                      <strong>{item.quantity}</strong>

                      <button
                        onClick={() =>
                          updateQuantity(item, item.quantity + 1)
                        }
                        disabled={item.quantity >= 99}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <strong>₹{Number(item.subtotal).toFixed(2)}</strong>

                    <button
                      className="remove-cart-item"
                      onClick={() => removeItem(item)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div>
              <span>Total Items</span>
              <strong>{cart.total_items}</strong>
            </div>

            <div>
              <span>Subtotal</span>
              <strong>₹{Number(cart.total_price).toFixed(2)}</strong>
            </div>

            <div className="cart-total">
              <span>Total</span>
              <strong>₹{Number(cart.total_price).toFixed(2)}</strong>
            </div>

            <button
              className="checkout-button"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </button>

            <button className="clear-cart-button" onClick={clearCart}>
              Clear Cart
            </button>
          </aside>
        </div>
      )}

      {customizingItem && (
        <div
          className="customize-modal-overlay"
          onClick={closeCustomization}
        >
          <section
            className="customize-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="customize-modal-header">
              <div>
                <span className="customize-modal-eyebrow">
                  SMART FOODCOURT
                </span>
                <h2>Customize your food</h2>
                <p>{customizingItem.name}</p>
              </div>

              <button
                className="customize-close"
                onClick={closeCustomization}
                aria-label="Close customization"
              >
                <X size={21} />
              </button>
            </div>

            <div className="customize-modal-body">
              <div className="customize-intro">
                <SlidersHorizontal size={18} />
                <span>
                  Choose your preferences. All options are optional.
                </span>
              </div>

              {customizationGroups.map((group) => (
                <div className="customize-group" key={group.name}>
                  <div className="customize-group-heading">
                    <h3>{group.name}</h3>
                    <span>
                      {group.type === "single"
                        ? "Choose one"
                        : "Choose multiple"}
                    </span>
                  </div>

                  <div className="customize-choices">
                    {group.choices.map((choice) => {
                      const checked = selectedOptions.some(
                        (option) =>
                          option.group === group.name &&
                          option.option === choice.name
                      );

                      return (
                        <label
                          className={`customize-choice ${
                            checked ? "selected" : ""
                          }`}
                          key={choice.name}
                        >
                          <input
                            type={
                              group.type === "single"
                                ? "radio"
                                : "checkbox"
                            }
                            name={`customize-${group.name}`}
                            checked={checked}
                            onChange={() =>
                              toggleOption(group, choice)
                            }
                          />

                          <span className="customize-choice-indicator">
                            {checked && <Check size={13} />}
                          </span>

                          <span className="customize-choice-name">
                            {choice.name}
                          </span>

                          <strong>
                            {choice.price > 0
                              ? `+₹${choice.price}`
                              : "Free"}
                          </strong>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="customize-instructions">
                <label htmlFor="special-instructions">
                  Special cooking instructions
                </label>
                <textarea
                  id="special-instructions"
                  value={specialInstructions}
                  onChange={(event) =>
                    setSpecialInstructions(event.target.value)
                  }
                  maxLength={500}
                  placeholder="Example: Make it less spicy, no onion..."
                  rows={3}
                />
                <span>{specialInstructions.length}/500</span>
              </div>
            </div>

            <div className="customize-modal-footer">
              <div className="customize-price">
                <span>Extra charges</span>
                <strong>₹{customizationTotal.toFixed(2)}</strong>
              </div>

              <div className="customize-modal-buttons">
                <button
                  className="customize-reset-button"
                  onClick={() => {
                    setSelectedOptions([]);
                    setSpecialInstructions("");
                  }}
                  disabled={savingCustomization}
                >
                  <RotateCcw size={15} />
                  Reset
                </button>

                <button
                  className="customize-save-button"
                  onClick={saveCustomization}
                  disabled={savingCustomization}
                >
                  {savingCustomization
                    ? "Saving..."
                    : "Save Customization"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default Cart;
