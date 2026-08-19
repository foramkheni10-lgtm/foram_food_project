// // import { useLocation, useNavigate } from "react-router-dom";
// // import "./PizzaIngredients.css";

// // function PizzaIngredients() {

// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   const restaurant = location.state?.restaurant;
// //   const pizza = location.state?.pizza;


// //   if (!restaurant || !pizza) {

// //     return (

// //       <div className="ingredients-page">

// //         <h1>
// //           Pizza information not found
// //         </h1>

// //         <button
// //           onClick={() => navigate("/browse")}
// //         >
// //           Go Back
// //         </button>

// //       </div>

// //     );

// //   }


// //   const ingredients = [
// //     {
// //       name: "Mozzarella Cheese",
// //       icon: "🧀",
// //     },

// //     {
// //       name: "Onion",
// //       icon: "🧅",
// //     },

// //     {
// //       name: "Capsicum",
// //       icon: "🫑",
// //     },

// //     {
// //       name: "Tomato",
// //       icon: "🍅",
// //     },

// //     {
// //       name: "Mushroom",
// //       icon: "🍄",
// //     },

// //     {
// //       name: "Pizza Sauce",
// //       icon: "🍅",
// //     },

// //   ];


// //   return (

// //     <div className="ingredients-page">

// //       <div className="ingredients-header">

// //         <h1>
// //           {pizza.name}
// //         </h1>

// //         <p>
// //           {restaurant.name}
// //         </p>

// //         <h2>
// //           🍕 Ingredients
// //         </h2>

// //         <p>
// //           Customize your pizza by choosing ingredients
// //         </p>

// //       </div>


// //       <div className="ingredients-grid">

// //         {ingredients.map((ingredient) => (

// //           <div
// //             className="ingredient-card"
// //             key={ingredient.name}
// //           >

// //             <div className="ingredient-icon">
// //               {ingredient.icon}
// //             </div>

// //             <h3>
// //               {ingredient.name}
// //             </h3>

// //           </div>

// //         ))}

// //       </div>


// //       <div className="pizza-summary">

// //         <h2>
// //           {pizza.name}
// //         </h2>

// //         <p>
// //           Restaurant: {restaurant.name}
// //         </p>

// //         <h3>
// //           Price: ₹{pizza.price}
// //         </h3>

// //         <button className="add-cart-button">
// //           Add to Cart
// //         </button>

// //       </div>

// //     </div>

// //   );
// // }

// // export default PizzaIngredients;

// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// import "./PizzaIngredients.css";

// interface Ingredient {
//   id: number;
//   name: string;
//   icon: string;
//   price: number;
//   included: boolean;
// }

// function PizzaIngredients() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const restaurant = location.state?.restaurant;
//   const pizza = location.state?.pizza;

//   // -------------------------------------------------
//   // Check Pizza Information
//   // -------------------------------------------------

//   if (!restaurant || !pizza) {
//     return (
//       <div className="ingredients-page">
//         <h1>Pizza information not found</h1>

//         <button
//           onClick={() => navigate("/pizza-restaurants")}
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   // -------------------------------------------------
//   // All Available Ingredients
//   // -------------------------------------------------

//   const allIngredients: Ingredient[] = [
//     {
//       id: 1,
//       name: "Mozzarella Cheese",
//       icon: "🧀",
//       price: 0,
//       included: true,
//     },

//     {
//       id: 2,
//       name: "Onion",
//       icon: "🧅",
//       price: 0,
//       included: true,
//     },

//     {
//       id: 3,
//       name: "Capsicum",
//       icon: "🫑",
//       price: 0,
//       included: true,
//     },

//     {
//       id: 4,
//       name: "Tomato",
//       icon: "🍅",
//       price: 0,
//       included: true,
//     },

//     {
//       id: 5,
//       name: "Mushroom",
//       icon: "🍄",
//       price: 0,
//       included: true,
//     },

//     {
//       id: 6,
//       name: "Pizza Sauce",
//       icon: "🍅",
//       price: 0,
//       included: true,
//     },

//     // -----------------------------------------------
//     // Extra Ingredients
//     // -----------------------------------------------

//     {
//       id: 7,
//       name: "Black Olives",
//       icon: "🫒",
//       price: 30,
//       included: false,
//     },

//     {
//       id: 8,
//       name: "Jalapeño",
//       icon: "🌶️",
//       price: 25,
//       included: false,
//     },

//     {
//       id: 9,
//       name: "Sweet Corn",
//       icon: "🌽",
//       price: 25,
//       included: false,
//     },

//     {
//       id: 10,
//       name: "Paneer",
//       icon: "🧀",
//       price: 40,
//       included: false,
//     },

//     {
//       id: 11,
//       name: "Extra Cheese",
//       icon: "🧀",
//       price: 50,
//       included: false,
//     },

//     {
//       id: 12,
//       name: "Chicken",
//       icon: "🍗",
//       price: 60,
//       included: false,
//     },

//     {
//       id: 13,
//       name: "Green Chilli",
//       icon: "🌶️",
//       price: 15,
//       included: false,
//     },

//     {
//       id: 14,
//       name: "Garlic",
//       icon: "🧄",
//       price: 15,
//       included: false,
//     },

//     {
//       id: 15,
//       name: "Pineapple",
//       icon: "🍍",
//       price: 30,
//       included: false,
//     },
//   ];

//   // -------------------------------------------------
//   // Selected Ingredients
//   // -------------------------------------------------

//   const [selectedIngredients, setSelectedIngredients] =
//     useState<number[]>(
//       allIngredients
//         .filter((ingredient) => ingredient.included)
//         .map((ingredient) => ingredient.id)
//     );

//   // -------------------------------------------------
//   // Select / Remove Ingredient
//   // -------------------------------------------------

//   const handleIngredientChange = (
//     ingredient: Ingredient
//   ) => {
//     setSelectedIngredients((previous) => {

//       if (previous.includes(ingredient.id)) {
//         return previous.filter(
//           (id) => id !== ingredient.id
//         );
//       }

//       return [
//         ...previous,
//         ingredient.id,
//       ];
//     });
//   };

//   // -------------------------------------------------
//   // Calculate Extra Price
//   // -------------------------------------------------

//   const extraPrice = allIngredients
//     .filter(
//       (ingredient) =>
//         selectedIngredients.includes(ingredient.id) &&
//         !ingredient.included
//     )
//     .reduce(
//       (total, ingredient) =>
//         total + ingredient.price,
//       0
//     );

//   // -------------------------------------------------
//   // Total Price
//   // -------------------------------------------------

//   const basePrice = pizza.price;

//   const totalPrice = basePrice + extraPrice;

//   // -------------------------------------------------
//   // Add To Cart
//   // -------------------------------------------------

//   const handleAddToCart = () => {

//     const selected = allIngredients.filter(
//       (ingredient) =>
//         selectedIngredients.includes(ingredient.id)
//     );

//     const cartItem = {
//       restaurant: restaurant,
//       pizza: pizza,
//       ingredients: selected,
//       basePrice: basePrice,
//       extraPrice: extraPrice,
//       totalPrice: totalPrice,
//     };

//     console.log(
//       "Cart Item:",
//       cartItem
//     );

//     alert(
//       `${pizza.name} added to cart!\nTotal: ₹${totalPrice}`
//     );
//   };

//   // -------------------------------------------------
//   // UI
//   // -------------------------------------------------

//   return (
//     <div className="ingredients-page">

//       {/* ------------------------------------------- */}
//       {/* Header */}
//       {/* ------------------------------------------- */}

//       <div className="ingredients-header">

//         <div className="pizza-main-icon">
//           🍕
//         </div>

//         <h1>
//           Customize {pizza.name}
//         </h1>

//         <p>
//           Restaurant: {restaurant.name}
//         </p>

//         <p className="customize-description">
//           Choose the ingredients you want on your pizza
//         </p>

//       </div>


//       {/* ------------------------------------------- */}
//       {/* Ingredients */}
//       {/* ------------------------------------------- */}

//       <div className="ingredients-container">

//         <h2>
//           🍕 Choose Your Ingredients
//         </h2>

//         <p className="ingredient-info">
//           Ingredients marked as included are part of
//           the base pizza.
//         </p>


//         <div className="ingredients-grid">

//           {allIngredients.map((ingredient) => {

//             const isSelected =
//               selectedIngredients.includes(
//                 ingredient.id
//               );

//             return (

//               <label
//                 key={ingredient.id}
//                 className={
//                   `ingredient-card ${
//                     isSelected
//                       ? "selected"
//                       : ""
//                   }`
//                 }
//               >

//                 {/* Checkbox */}

//                 <input
//                   type="checkbox"
//                   checked={isSelected}
//                   onChange={() =>
//                     handleIngredientChange(
//                       ingredient
//                     )
//                   }
//                 />


//                 {/* Icon */}

//                 <div className="ingredient-icon">
//                   {ingredient.icon}
//                 </div>


//                 {/* Name */}

//                 <h3>
//                   {ingredient.name}
//                 </h3>


//                 {/* Price */}

//                 {ingredient.included ? (

//                   <span className="included">
//                     Included
//                   </span>

//                 ) : (

//                   <span className="extra-price">
//                     +₹{ingredient.price}
//                   </span>

//                 )}

//               </label>

//             );

//           })}

//         </div>

//       </div>


//       {/* ------------------------------------------- */}
//       {/* Price Summary */}
//       {/* ------------------------------------------- */}

//       <div className="price-summary">

//         <h2>
//           Your Pizza
//         </h2>

//         <p>
//           {pizza.name}
//         </p>

//         <div className="price-row">

//           <span>
//             Base Price
//           </span>

//           <strong>
//             ₹{basePrice}
//           </strong>

//         </div>


//         <div className="price-row">

//           <span>
//             Extra Ingredients
//           </span>

//           <strong>
//             ₹{extraPrice}
//           </strong>

//         </div>


//         <hr />


//         <div className="total-row">

//           <span>
//             Total
//           </span>

//           <strong>
//             ₹{totalPrice}
//           </strong>

//         </div>


//         <button
//           className="add-cart-button"
//           onClick={handleAddToCart}
//         >
//           🛒 ADD TO CART — ₹{totalPrice}
//         </button>

//       </div>

//     </div>
//   );
// }

// export default PizzaIngredients;


// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// import "./PizzaIngredients.css";

// interface PizzaData {
//   name: string;
//   price: number;
//   restaurant: string;
//   description?: string;
// }

// interface Ingredient {
//   name: string;
//   icon: string;
//   price: number;
// }

// function PizzaIngredients() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // -------------------------------------------------
//   // Get Pizza Information
//   // -------------------------------------------------

//   const pizza = location.state?.pizza as PizzaData | undefined;

//   // -------------------------------------------------
//   // If Pizza Information Is Missing
//   // -------------------------------------------------

//   if (!pizza) {
//     return (
//       <div className="pizza-error-page">
//         <h1>Pizza information not found</h1>

//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   // -------------------------------------------------
//   // Ingredients
//   // -------------------------------------------------

//   const ingredients: Ingredient[] = [
//     {
//       name: "Mozzarella Cheese",
//       icon: "🧀",
//       price: 20,
//     },
//     {
//       name: "Onion",
//       icon: "🧅",
//       price: 10,
//     },
//     {
//       name: "Tomato",
//       icon: "🍅",
//       price: 10,
//     },
//     {
//       name: "Capsicum",
//       icon: "🫑",
//       price: 10,
//     },
//     {
//       name: "Mushroom",
//       icon: "🍄",
//       price: 20,
//     },
//     {
//       name: "Jalapeño",
//       icon: "🌶️",
//       price: 15,
//     },
//     {
//       name: "Olives",
//       icon: "🫒",
//       price: 15,
//     },
//     {
//       name: "Sweet Corn",
//       icon: "🌽",
//       price: 15,
//     },
//     {
//       name: "Paneer",
//       icon: "🧀",
//       price: 25,
//     },
//   ];

//   // -------------------------------------------------
//   // Selected Ingredients
//   // -------------------------------------------------

//   const [selectedIngredients, setSelectedIngredients] =
//     useState<string[]>([]);

//   // -------------------------------------------------
//   // Select / Remove Ingredient
//   // -------------------------------------------------

//   const handleIngredientClick = (
//     ingredient: Ingredient
//   ) => {
//     setSelectedIngredients((previous) => {
//       if (previous.includes(ingredient.name)) {
//         return previous.filter(
//           (item) => item !== ingredient.name
//         );
//       }

//       return [
//         ...previous,
//         ingredient.name,
//       ];
//     });
//   };

//   // -------------------------------------------------
//   // Extra Price
//   // -------------------------------------------------

//   const extraPrice = ingredients
//     .filter((ingredient) =>
//       selectedIngredients.includes(
//         ingredient.name
//       )
//     )
//     .reduce(
//       (total, ingredient) =>
//         total + ingredient.price,
//       0
//     );

//   const totalPrice =
//     pizza.price + extraPrice;

//   // -------------------------------------------------
//   // Add Customized Pizza To Cart
//   // -------------------------------------------------

//   const handleAddToCart = () => {
//     const cartItem = {
//       id: Date.now(),

//       name: pizza.name,

//       restaurant:
//         pizza.restaurant,

//       basePrice:
//         pizza.price,

//       extraPrice:
//         extraPrice,

//       totalPrice:
//         totalPrice,

//       ingredients:
//         selectedIngredients,
//     };

//     const existingCart =
//       JSON.parse(
//         localStorage.getItem("cart_items") || "[]"
//       );

//     existingCart.push(cartItem);

//     localStorage.setItem(
//       "cart_items",
//       JSON.stringify(existingCart)
//     );

//     alert(
//       `${pizza.name} added to cart!`
//     );

//     navigate("/cart");
//   };

//   // -------------------------------------------------
//   // Open Cart
//   // -------------------------------------------------

//   const handleCartClick = () => {
//     navigate("/cart");
//   };

//   // -------------------------------------------------
//   // UI
//   // -------------------------------------------------

//   return (
//     <div className="pizza-ingredients-page">

//       {/* ------------------------------------------ */}
//       {/* Cart Button */}
//       {/* ------------------------------------------ */}

//       <button
//         type="button"
//         className="pizza-cart-button"
//         onClick={handleCartClick}
//       >
//         🛒 Cart
//       </button>

//       {/* ------------------------------------------ */}
//       {/* Header */}
//       {/* ------------------------------------------ */}

//       <div className="pizza-ingredients-header">

//         <div className="pizza-large-icon">
//           🍕
//         </div>

//         <h1>
//           Customize Your Pizza
//         </h1>

//         <p>
//           Choose your favorite ingredients
//         </p>

//         <h2>
//           {pizza.name}
//         </h2>

//       </div>

//       {/* ------------------------------------------ */}
//       {/* Ingredients Title */}
//       {/* ------------------------------------------ */}

//       <h3 className="choose-ingredients-title">
//         Choose Ingredients
//       </h3>

//       {/* ------------------------------------------ */}
//       {/* Ingredient Grid */}
//       {/* ------------------------------------------ */}

//       <div className="pizza-ingredients-grid">

//         {ingredients.map(
//           (ingredient) => {

//             const isSelected =
//               selectedIngredients.includes(
//                 ingredient.name
//               );

//             return (
//               <div
//                 key={ingredient.name}
//                 className={`pizza-ingredient-card ${
//                   isSelected
//                     ? "selected"
//                     : ""
//                 }`}
//                 onClick={() =>
//                   handleIngredientClick(
//                     ingredient
//                   )
//                 }
//               >

//                 <div className="ingredient-icon">
//                   {ingredient.icon}
//                 </div>

//                 <h4>
//                   {ingredient.name}
//                 </h4>

//                 <p>
//                   +₹{ingredient.price}
//                 </p>

//                 <button
//                   type="button"
//                   className={
//                     isSelected
//                       ? "ingredient-selected-button"
//                       : "ingredient-select-button"
//                   }
//                   onClick={(event) => {
//                     event.stopPropagation();

//                     handleIngredientClick(
//                       ingredient
//                     );
//                   }}
//                 >
//                   {isSelected
//                     ? "SELECTED ✓"
//                     : "SELECT"}
//                 </button>

//               </div>
//             );
//           }
//         )}

//       </div>

//       {/* ------------------------------------------ */}
//       {/* Price Summary */}
//       {/* ------------------------------------------ */}

//       <div className="pizza-price-summary">

//         <div className="pizza-summary-row">

//           <span>
//             Base Price
//           </span>

//           <strong>
//             ₹{pizza.price}
//           </strong>

//         </div>

//         <div className="pizza-summary-row">

//           <span>
//             Extra Ingredients
//           </span>

//           <strong>
//             ₹{extraPrice}
//           </strong>

//         </div>

//         <div className="pizza-summary-line" />

//         <div className="pizza-total-row">

//           <span>
//             Total
//           </span>

//           <strong>
//             ₹{totalPrice}
//           </strong>

//         </div>

//         <button
//           type="button"
//           className="pizza-add-cart-button"
//           onClick={handleAddToCart}
//         >
//           🛒 ADD TO CART — ₹{totalPrice}
//         </button>

//       </div>

//     </div>
//   );
// }

// export default PizzaIngredients;

// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// import "./PizzaIngredients.css";

// // =====================================================
// // Pizza Data Type
// // =====================================================

// interface PizzaData {
//   id?: number;
//   name: string;
//   price: number;
//   restaurant: string;
//   category?: string;
//   description?: string;
// }

// // =====================================================
// // Ingredient Type
// // =====================================================

// interface Ingredient {
//   name: string;
//   icon: string;
//   price: number;
// }

// // =====================================================
// // Component
// // =====================================================

// function PizzaIngredients() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // ===================================================
//   // Get Pizza Information
//   // ===================================================

//   const pizza = location.state?.pizza as PizzaData | undefined;

//   // ===================================================
//   // Ingredients
//   // ===================================================

//   const ingredients: Ingredient[] = [
//     {
//       name: "Mozzarella Cheese",
//       icon: "🧀",
//       price: 20,
//     },
//     {
//       name: "Onion",
//       icon: "🧅",
//       price: 10,
//     },
//     {
//       name: "Tomato",
//       icon: "🍅",
//       price: 10,
//     },
//     {
//       name: "Capsicum",
//       icon: "🫑",
//       price: 10,
//     },
//     {
//       name: "Mushroom",
//       icon: "🍄",
//       price: 20,
//     },
//     {
//       name: "Jalapeño",
//       icon: "🌶️",
//       price: 15,
//     },
//     {
//       name: "Olives",
//       icon: "🫒",
//       price: 15,
//     },
//     {
//       name: "Sweet Corn",
//       icon: "🌽",
//       price: 15,
//     },
//     {
//       name: "Paneer",
//       icon: "🧀",
//       price: 25,
//     },
//   ];

//   // ===================================================
//   // Selected Ingredients
//   // ===================================================

//   const [selectedIngredients, setSelectedIngredients] =
//     useState<string[]>([]);

//   // ===================================================
//   // If Pizza Information Is Missing
//   // ===================================================

//   if (!pizza) {
//     return (
//       <div className="pizza-error-page">
//         <h1>Pizza information not found</h1>

//         <button
//           type="button"
//           onClick={() => navigate(-1)}
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   // ===================================================
//   // Select / Remove Ingredient
//   // ===================================================

//   const handleIngredientClick = (
//     ingredient: Ingredient
//   ) => {
//     setSelectedIngredients((previous) => {
//       if (previous.includes(ingredient.name)) {
//         return previous.filter(
//           (item) => item !== ingredient.name
//         );
//       }

//       return [
//         ...previous,
//         ingredient.name,
//       ];
//     });
//   };

//   // ===================================================
//   // Calculate Extra Ingredient Price
//   // ===================================================

//   const extraPrice = ingredients
//     .filter((ingredient) =>
//       selectedIngredients.includes(
//         ingredient.name
//       )
//     )
//     .reduce(
//       (total, ingredient) =>
//         total + ingredient.price,
//       0
//     );

//   // ===================================================
//   // Final Pizza Price
//   // ===================================================

//   const totalPrice =
//     pizza.price + extraPrice;

//   // ===================================================
//   // ADD CUSTOMIZED PIZZA TO CART
//   // ===================================================

//   const handleAddToCart = () => {
//     // -----------------------------------------------
//     // Get Existing Cart
//     // -----------------------------------------------

//     const existingCart = JSON.parse(
//       localStorage.getItem("cart") || "[]"
//     );

//     // -----------------------------------------------
//     // Get Selected Ingredient Objects
//     // -----------------------------------------------

//     const selectedItems = ingredients.filter(
//       (ingredient) =>
//         selectedIngredients.includes(
//           ingredient.name
//         )
//     );

//     // -----------------------------------------------
//     // Create Customized Pizza Cart Item
//     // -----------------------------------------------

//     const cartItem = {
//       id: Date.now(),

//       name: pizza.name,

//       description:
//         pizza.description || "",

//       category: "Pizza",

//       restaurant:
//         pizza.restaurant,

//       price:
//         totalPrice,

//       basePrice:
//         pizza.price,

//       extraPrice:
//         extraPrice,

//       totalPrice:
//         totalPrice,

//       quantity: 1,

//       ingredients:
//         selectedItems,

//       customized: true,
//     };

//     // -----------------------------------------------
//     // Add Item To Existing Cart
//     // -----------------------------------------------

//     existingCart.push(cartItem);

//     // -----------------------------------------------
//     // Save Cart
//     // -----------------------------------------------

//     localStorage.setItem(
//       "cart",
//       JSON.stringify(existingCart)
//     );

//     // -----------------------------------------------
//     // Success Message
//     // -----------------------------------------------

//     alert(
//       `${pizza.name} added to cart successfully! 🛒`
//     );

//     // -----------------------------------------------
//     // IMPORTANT:
//     // Do NOT navigate to /cart
//     //
//     // Same behavior as Burger customization
//     // -----------------------------------------------

//     navigate("/browse");
//   };

//   // ===================================================
//   // OPEN CART
//   // ===================================================

//   const handleCartClick = () => {
//     navigate("/cart");
//   };

//   // ===================================================
//   // UI
//   // ===================================================

//   return (
//     <div className="pizza-ingredients-page">

//       {/* =================================================
//           CART BUTTON
//       ================================================= */}

//       <button
//         type="button"
//         className="pizza-cart-button"
//         onClick={handleCartClick}
//       >
//         🛒 Cart
//       </button>


//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <div className="pizza-ingredients-header">

//         <div className="pizza-large-icon">
//           🍕
//         </div>

//         <h1>
//           Customize Your Pizza
//         </h1>

//         <p>
//           Choose your favorite ingredients
//         </p>

//         <h2>
//           {pizza.name}
//         </h2>

//       </div>


//       {/* =================================================
//           INGREDIENTS TITLE
//       ================================================= */}

//       <h3 className="choose-ingredients-title">
//         Choose Ingredients
//       </h3>


//       {/* =================================================
//           INGREDIENT GRID
//       ================================================= */}

//       <div className="pizza-ingredients-grid">

//         {ingredients.map(
//           (ingredient) => {

//             const isSelected =
//               selectedIngredients.includes(
//                 ingredient.name
//               );

//             return (
//               <div
//                 key={ingredient.name}
//                 className={`pizza-ingredient-card ${
//                   isSelected
//                     ? "selected"
//                     : ""
//                 }`}
//                 onClick={() =>
//                   handleIngredientClick(
//                     ingredient
//                   )
//                 }
//               >

//                 {/* Ingredient Icon */}

//                 <div className="ingredient-icon">
//                   {ingredient.icon}
//                 </div>


//                 {/* Ingredient Name */}

//                 <h4>
//                   {ingredient.name}
//                 </h4>


//                 {/* Ingredient Price */}

//                 <p>
//                   +₹{ingredient.price}
//                 </p>


//                 {/* Select Button */}

//                 <button
//                   type="button"
//                   className={
//                     isSelected
//                       ? "ingredient-selected-button"
//                       : "ingredient-select-button"
//                   }
//                   onClick={(event) => {
//                     event.stopPropagation();

//                     handleIngredientClick(
//                       ingredient
//                     );
//                   }}
//                 >
//                   {isSelected
//                     ? "SELECTED ✓"
//                     : "SELECT"}
//                 </button>

//               </div>
//             );
//           }
//         )}

//       </div>


//       {/* =================================================
//           PRICE SUMMARY
//       ================================================= */}

//       <div className="pizza-price-summary">

//         {/* Base Price */}

//         <div className="pizza-summary-row">

//           <span>
//             Base Price
//           </span>

//           <strong>
//             ₹{pizza.price}
//           </strong>

//         </div>


//         {/* Extra Ingredients */}

//         <div className="pizza-summary-row">

//           <span>
//             Extra Ingredients
//           </span>

//           <strong>
//             ₹{extraPrice}
//           </strong>

//         </div>


//         {/* Divider */}

//         <div className="pizza-summary-line" />


//         {/* Total */}

//         <div className="pizza-total-row">

//           <span>
//             Total
//           </span>

//           <strong>
//             ₹{totalPrice}
//           </strong>

//         </div>


//         {/* =================================================
//             ADD TO CART
//         ================================================= */}

//         <button
//           type="button"
//           className="pizza-add-cart-button"
//           onClick={handleAddToCart}
//         >
//           🛒 ADD TO CART — ₹{totalPrice}
//         </button>

//       </div>

//     </div>
//   );
// }

// export default PizzaIngredients;



import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./PizzaIngredients.css";

interface PizzaData {
  id: number;
  name: string;
  price: number;
  restaurant: string;
  description?: string;
  category?: string;
}

interface Ingredient {
  name: string;
  icon: string;
  price: number;
}

function PizzaIngredients() {
  const navigate = useNavigate();
    const handleBack = () => {
  navigate(-1);
};

  const location = useLocation();

  // -------------------------------------------------
  // Get Pizza Information
  // -------------------------------------------------

  const pizza = location.state?.pizza as PizzaData | undefined;

  // -------------------------------------------------
  // If Pizza Information Is Missing
  // -------------------------------------------------

  if (!pizza) {
    return (
      <div className="pizza-error-page">
        <h1>Pizza information not found</h1>

        <button
          type="button"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  // -------------------------------------------------
  // Ingredients
  // -------------------------------------------------

  const ingredients: Ingredient[] = [
    {
      name: "Mozzarella Cheese",
      icon: "🧀",
      price: 20,
    },
    {
      name: "Onion",
      icon: "🧅",
      price: 10,
    },
    {
      name: "Tomato",
      icon: "🍅",
      price: 10,
    },
    {
      name: "Capsicum",
      icon: "🫑",
      price: 10,
    },
    {
      name: "Mushroom",
      icon: "🍄",
      price: 20,
    },
    {
      name: "Jalapeño",
      icon: "🌶️",
      price: 15,
    },
    {
      name: "Olives",
      icon: "🫒",
      price: 15,
    },
    {
      name: "Sweet Corn",
      icon: "🌽",
      price: 15,
    },
    {
      name: "Paneer",
      icon: "🧀",
      price: 25,
    },
  ];

  // -------------------------------------------------
  // Selected Ingredients
  // -------------------------------------------------

  const [selectedIngredients, setSelectedIngredients] =
    useState<string[]>([]);

  // -------------------------------------------------
  // Select / Remove Ingredient
  // -------------------------------------------------

  const handleIngredientClick = (
    ingredient: Ingredient
  ) => {
    setSelectedIngredients((previous) => {
      if (previous.includes(ingredient.name)) {
        return previous.filter(
          (item) => item !== ingredient.name
        );
      }

      return [
        ...previous,
        ingredient.name,
      ];
    });
  };

  // -------------------------------------------------
  // Extra Price
  // -------------------------------------------------

  const extraPrice = ingredients
    .filter((ingredient) =>
      selectedIngredients.includes(
        ingredient.name
      )
    )
    .reduce(
      (total, ingredient) =>
        total + ingredient.price,
      0
    );

  const totalPrice =
    pizza.price + extraPrice;

  // -------------------------------------------------
  // ADD CUSTOMIZED PIZZA TO CART
  // -------------------------------------------------

  const handleAddToCart = () => {

    const selectedItems = ingredients.filter(
      (ingredient) =>
        selectedIngredients.includes(
          ingredient.name
        )
    );

    const cartItem = {
      id: Date.now(),

      category: "Pizza",

      name: pizza.name,

      description: pizza.description || "",

      restaurant: pizza.restaurant,

      basePrice: pizza.price,

      price: totalPrice,

      extraPrice: extraPrice,

      totalPrice: totalPrice,

      quantity: 1,

      ingredients: selectedItems,

      customized: true,
    };

    // -------------------------------------------------
    // Get Existing Cart
    // -------------------------------------------------

    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    // -------------------------------------------------
    // Add New Pizza To Cart
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
    // SUCCESS MESSAGE
    // IMPORTANT:
    // DO NOT NAVIGATE AFTER THIS
    // -------------------------------------------------

    alert(
      `${pizza.name} added to cart successfully! 🛒`
    );

    // -------------------------------------------------
    // Clear selected ingredients
    // Customer stays on SAME PAGE
    // -------------------------------------------------

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
    <div className="pizza-ingredients-page">

       {/* BACK BUTTON */}
    <button
  type="button"
  className="back-button"
  onClick={handleBack}
>
  ← Back
</button>

      {/* ------------------------------------------ */}
      {/* Cart Button */}
      {/* ------------------------------------------ */}

      <button
        type="button"
        className="pizza-cart-button"
        onClick={handleCartClick}
      >
        🛒 Cart
      </button>

      {/* ------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------ */}

      <div className="pizza-ingredients-header">

        <div className="pizza-large-icon">
          🍕
        </div>

        <h1>
          Customize Your Pizza
        </h1>

        <p>
          Choose your favorite ingredients
        </p>

        <h2>
          {pizza.name}
        </h2>

      </div>

      {/* ------------------------------------------ */}
      {/* Ingredients Title */}
      {/* ------------------------------------------ */}

      <h3 className="choose-ingredients-title">
        Choose Ingredients
      </h3>

      {/* ------------------------------------------ */}
      {/* Ingredient Grid */}
      {/* ------------------------------------------ */}

      <div className="pizza-ingredients-grid">

        {ingredients.map(
          (ingredient) => {

            const isSelected =
              selectedIngredients.includes(
                ingredient.name
              );

            return (
              <div
                key={ingredient.name}
                className={`pizza-ingredient-card ${
                  isSelected
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  handleIngredientClick(
                    ingredient
                  )
                }
              >

                <div className="ingredient-icon">
                  {ingredient.icon}
                </div>

                <h4>
                  {ingredient.name}
                </h4>

                <p>
                  +₹{ingredient.price}
                </p>

                <button
                  type="button"
                  className={
                    isSelected
                      ? "ingredient-selected-button"
                      : "ingredient-select-button"
                  }
                  onClick={(event) => {
                    event.stopPropagation();

                    handleIngredientClick(
                      ingredient
                    );
                  }}
                >
                  {isSelected
                    ? "SELECTED ✓"
                    : "SELECT"}
                </button>

              </div>
            );
          }
        )}

      </div>

      {/* ------------------------------------------ */}
      {/* Price Summary */}
      {/* ------------------------------------------ */}

      <div className="pizza-price-summary">

        <div className="pizza-summary-row">

          <span>
            Base Price
          </span>

          <strong>
            ₹{pizza.price}
          </strong>

        </div>

        <div className="pizza-summary-row">

          <span>
            Extra Ingredients
          </span>

          <strong>
            ₹{extraPrice}
          </strong>

        </div>

        <div className="pizza-summary-line" />

        <div className="pizza-total-row">

          <span>
            Total
          </span>

          <strong>
            ₹{totalPrice}
          </strong>

        </div>

        {/* -------------------------------------- */}
        {/* ADD TO CART */}
        {/* -------------------------------------- */}

        <button
          type="button"
          className="pizza-add-cart-button"
          onClick={handleAddToCart}
        >
          🛒 ADD TO CART — ₹{totalPrice}
        </button>

      </div>

    </div>
  );
}

export default PizzaIngredients;