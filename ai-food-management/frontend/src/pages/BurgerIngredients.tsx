
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import "./BurgerIngredients.css";

interface Ingredient {
  id: number;
  name: string;
  icon: string;
  price: number;
}

interface Burger {
  name: string;
  price: number;
  restaurant: string;
}

function BurgerIngredients() {
  const location = useLocation();
  const navigate = useNavigate();
    const handleBack = () => {
  navigate(-1);
};


  // -------------------------------------------------
  // Get selected burger from BurgerMenu
  // -------------------------------------------------

  const burger: Burger = location.state?.burger || {
    name: "Classic Burger",
    price: 149,
    restaurant: "Food Restaurant",
  };

  // -------------------------------------------------
  // All Burger Ingredients
  // -------------------------------------------------

  const ingredients: Ingredient[] = [
    {
      id: 1,
      name: "Cheese",
      icon: "🧀",
      price: 20,
    },
    {
      id: 2,
      name: "Onion",
      icon: "🧅",
      price: 10,
    },
    {
      id: 3,
      name: "Tomato",
      icon: "🍅",
      price: 10,
    },
    {
      id: 4,
      name: "Lettuce",
      icon: "🥬",
      price: 10,
    },
    {
      id: 5,
      name: "Jalapeño",
      icon: "🌶️",
      price: 15,
    },
    {
      id: 6,
      name: "Mushroom",
      icon: "🍄",
      price: 20,
    },
    {
      id: 7,
      name: "Extra Patty",
      icon: "🍖",
      price: 50,
    },
    {
      id: 8,
      name: "Special Sauce",
      icon: "🥫",
      price: 15,
    },
    {
      id: 9,
      name: "Pickles",
      icon: "🥒",
      price: 15,
    },
  ];

  // -------------------------------------------------
  // Selected Ingredients
  // -------------------------------------------------

  const [selectedIngredients, setSelectedIngredients] =
    useState<number[]>([]);

  // -------------------------------------------------
  // Select / Remove Ingredient
  // -------------------------------------------------

  const handleIngredientClick = (ingredientId: number) => {
    setSelectedIngredients((previous) => {
      if (previous.includes(ingredientId)) {
        return previous.filter(
          (id) => id !== ingredientId
        );
      }

      return [...previous, ingredientId];
    });
  };

  // -------------------------------------------------
  // Extra Ingredients Price
  // -------------------------------------------------

  const extraIngredientsPrice = ingredients
    .filter((ingredient) =>
      selectedIngredients.includes(
        ingredient.id
      )
    )
    .reduce(
      (total, ingredient) =>
        total + ingredient.price,
      0
    );

  // -------------------------------------------------
  // Final Price
  // -------------------------------------------------

  const finalPrice =
    burger.price + extraIngredientsPrice;

  // -------------------------------------------------
  // Add To Cart
  // -------------------------------------------------

  const handleAddToCart = () => {
    // Get selected ingredient objects
    const selectedItems = ingredients.filter(
      (ingredient) =>
        selectedIngredients.includes(
          ingredient.id
        )
    );

    // Create cart item
    const cartItem = {
      id: Date.now(),

      category: "Burger",

      name: burger.name,

      restaurant: burger.restaurant,

      basePrice: burger.price,

      price: finalPrice,

      ingredients: selectedItems,

      extraPrice: extraIngredientsPrice,

      totalPrice: finalPrice,

      quantity: 1,

      customized: true,
    };

    // -------------------------------------------------
    // Get Existing Cart
    // -------------------------------------------------

    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    // -------------------------------------------------
    // Add New Burger
    // -------------------------------------------------

    existingCart.push(cartItem);

    // -------------------------------------------------
    // Save Cart
    // -------------------------------------------------

    localStorage.setItem(
      "cart",
      JSON.stringify(existingCart)
    );

    // -------------------------------------------------
    // Success Message
    // -------------------------------------------------

    alert(
      `${burger.name} added to cart successfully! 🛒`
    );

    // -------------------------------------------------
    // IMPORTANT:
    // Stay on SAME PAGE
    // Do NOT use navigate("/browse")
    // Do NOT use navigate("/cart")
    // -------------------------------------------------

    // Clear selected ingredients so customer
    // can customize/add another fresh burger.
    setSelectedIngredients([]);
  };

  // -------------------------------------------------
  // Open Cart
  // -------------------------------------------------

  const handleCartClick = () => {
    navigate("/cart");
  };

  // -------------------------------------------------
  // UI
  // -------------------------------------------------

  return (
    <div className="burger-ingredients-page">

       {/* BACK BUTTON */}
    <button
  type="button"
  className="back-button"
  onClick={handleBack}
>
  ← Back
</button>

      {/* ------------------------------------------- */}
      {/* Cart Button */}
      {/* ------------------------------------------- */}

      <button
        type="button"
        className="burger-cart-button"
        onClick={handleCartClick}
      >
        🛒 Cart
      </button>

      {/* ------------------------------------------- */}
      {/* Header */}
      {/* ------------------------------------------- */}

      <div className="burger-header">

        <div className="burger-icon">
          🍔
        </div>

        <h1>
          Customize Your Burger
        </h1>

        <p>
          Choose your favorite ingredients
        </p>

        <h2>
          {burger.name}
        </h2>

      </div>

      {/* ------------------------------------------- */}
      {/* Ingredients */}
      {/* ------------------------------------------- */}

      <div className="ingredients-section">

        <h2>
          Choose Ingredients
        </h2>

        <div className="ingredients-grid">

          {ingredients.map((ingredient) => {

            const isSelected =
              selectedIngredients.includes(
                ingredient.id
              );

            return (
              <button
                key={ingredient.id}
                type="button"
                className={`ingredient-card ${
                  isSelected
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleIngredientClick(
                    ingredient.id
                  )
                }
              >

                <div className="ingredient-icon">
                  {ingredient.icon}
                </div>

                <h3>
                  {ingredient.name}
                </h3>

                <p>
                  +₹{ingredient.price}
                </p>

                <span>
                  {isSelected
                    ? "✓ SELECTED"
                    : "SELECT"}
                </span>

              </button>
            );

          })}

        </div>

      </div>

      {/* ------------------------------------------- */}
      {/* Burger Summary */}
      {/* ------------------------------------------- */}

      <div className="burger-summary">

        <h2>
          Your Burger
        </h2>

        <h3>
          {burger.name}
        </h3>

        {/* Base Price */}

        <div className="price-row">

          <span>
            Base Price
          </span>

          <strong>
            ₹{burger.price}
          </strong>

        </div>

        {/* Extra Ingredients */}

        <div className="price-row">

          <span>
            Extra Ingredients
          </span>

          <strong>
            ₹{extraIngredientsPrice}
          </strong>

        </div>

        <hr />

        {/* Total */}

        <div className="total-row">

          <span>
            Total
          </span>

          <strong>
            ₹{finalPrice}
          </strong>

        </div>

        {/* --------------------------------------- */}
        {/* ADD TO CART */}
        {/* --------------------------------------- */}

        <button
          type="button"
          className="add-cart-button"
          onClick={handleAddToCart}
        >
          🛒 ADD TO CART — ₹{finalPrice}
        </button>

      </div>

    </div>
  );
}

export default BurgerIngredients;
