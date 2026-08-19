// import { useLocation, useNavigate } from "react-router-dom";
// import "./PizzaMenu.css";

// function PizzaMenu() {

//   const location = useLocation();
//   const navigate = useNavigate();

//   const restaurant = location.state?.restaurant;


//   // If restaurant information is missing
//   if (!restaurant) {

//     return (

//       <div className="pizza-menu-page">

//         <h1>
//           Restaurant not selected
//         </h1>

//         <button
//           onClick={() => navigate("/pizza-restaurants")}
//         >
//           Go Back
//         </button>

//       </div>

//     );

//   }


//   const pizzas = [
//     {
//       id: 1,
//       name: "Farmhouse",
//       price: 299,
//       image: "🍕",
//       description:
//         "Loaded with onion, capsicum, tomato and mushroom",
//     },

//     {
//       id: 2,
//       name: "Margherita",
//       price: 199,
//       image: "🍕",
//       description:
//         "Classic cheese and tomato pizza",
//     },

//     {
//       id: 3,
//       name: "Cheese Burst",
//       price: 349,
//       image: "🍕",
//       description:
//         "Extra cheese with a delicious cheese burst",
//     },

//     {
//       id: 4,
//       name: "Veggie Paradise",
//       price: 279,
//       image: "🍕",
//       description:
//         "Loaded with fresh vegetables and cheese",
//     },
//   ];


//   const selectPizza = (pizza: any) => {

//     navigate("/pizza-ingredients", {

//       state: {
//         restaurant: restaurant,
//         pizza: pizza,
//       },

//     });

//   };


//   return (

//     <div className="pizza-menu-page">

//       <div className="pizza-menu-header">

//         <h1>
//           {restaurant.name}
//         </h1>

//         <p>
//           Choose your favourite pizza
//         </p>

//       </div>


//       <div className="pizza-grid">

//         {pizzas.map((pizza) => (

//           <button
//             key={pizza.id}
//             className="pizza-card"
//             onClick={() => selectPizza(pizza)}
//           >

//             <div className="pizza-image">
//               {pizza.image}
//             </div>

//             <h2>
//               {pizza.name}
//             </h2>

//             <p>
//               {pizza.description}
//             </p>

//             <div className="pizza-price">
//               ₹{pizza.price}
//             </div>

//             <span className="customize-button">
//               Customize →
//             </span>

//           </button>

//         ))}

//       </div>

//     </div>

//   );
// }

// export default PizzaMenu;


// import { useNavigate } from "react-router-dom";
// import "./PizzaMenu.css";

// interface Pizza {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
// }

// function PizzaMenu() {
//   const navigate = useNavigate();

//   // -------------------------------------------------
//   // Pizza List
//   // -------------------------------------------------

//   const pizzas: Pizza[] = [
//     {
//       id: 1,
//       name: "Margherita Pizza",
//       description:
//         "Classic pizza with fresh tomato, mozzarella cheese and basil",
//       price: 149,
//     },
//     {
//       id: 2,
//       name: "Farmhouse Pizza",
//       description:
//         "Loaded with onion, capsicum, tomato and mushrooms",
//       price: 299,
//     },
//     {
//       id: 3,
//       name: "Cheese Burst Pizza",
//       description:
//         "Delicious pizza with extra cheese and creamy cheese burst",
//       price: 349,
//     },
//     {
//       id: 4,
//       name: "Paneer Pizza",
//       description:
//         "Soft paneer with fresh vegetables and mozzarella cheese",
//       price: 279,
//     },
//     {
//       id: 5,
//       name: "Veggie Delight Pizza",
//       description:
//         "Fresh vegetables with delicious pizza sauce and cheese",
//       price: 249,
//     },
//     {
//       id: 6,
//       name: "Spicy Pizza",
//       description:
//         "Spicy pizza with jalapeno, capsicum and special sauce",
//       price: 269,
//     },
//   ];

//   // -------------------------------------------------
//   // Restaurant
//   // -------------------------------------------------

//   const restaurantName =
//     localStorage.getItem("selected_restaurant") ||
//     "La Pino'z Pizza";

//   // -------------------------------------------------
//   // ADD TO CART WITHOUT CUSTOMIZATION
//   // -------------------------------------------------

//   const handleAddToCart = (pizza: Pizza) => {
//     const existingCart = localStorage.getItem("cart");

//     let cart: any[] = [];

//     if (existingCart) {
//       try {
//         cart = JSON.parse(existingCart);
//       } catch {
//         cart = [];
//       }
//     }

//     // Check whether same pizza already exists
//     const existingItemIndex = cart.findIndex(
//       (item) =>
//         item.name === pizza.name &&
//         item.restaurant === restaurantName
//     );

//     if (existingItemIndex !== -1) {
//       // Increase quantity
//       cart[existingItemIndex].quantity += 1;

//       cart[existingItemIndex].total =
//         cart[existingItemIndex].price *
//         cart[existingItemIndex].quantity;
//     } else {
//       // Add new item
//       cart.push({
//         id: Date.now(),
//         name: pizza.name,
//         description: pizza.description,
//         price: pizza.price,
//         quantity: 1,
//         total: pizza.price,
//         restaurant: restaurantName,
//         customized: false,
//         ingredients: [],
//       });
//     }

//     // Save cart
//     localStorage.setItem(
//       "cart",
//       JSON.stringify(cart)
//     );

//     // Notify other pages/components
//     window.dispatchEvent(
//       new Event("cartUpdated")
//     );

//     alert(
//       `${pizza.name} added to cart!`
//     );
//   };

//   // -------------------------------------------------
//   // CUSTOMIZE PIZZA
//   // -------------------------------------------------

//   const handleCustomize = (pizza: Pizza) => {
//     // Save selected pizza
//     localStorage.setItem(
//       "selected_pizza",
//       JSON.stringify({
//         ...pizza,
//         restaurant: restaurantName,
//       })
//     );

//     // Open Pizza Ingredients page
//     navigate("/pizza-ingredients");
//   };

//   // -------------------------------------------------
//   // Pizza Menu UI
//   // -------------------------------------------------

//   return (
//     <div className="pizza-menu-page">

//       {/* Header */}

//       <div className="pizza-menu-header">

//         <div className="pizza-menu-icon">
//           🍕
//         </div>

//         <h1>
//           {restaurantName}
//         </h1>

//         <p>
//           Choose your favorite pizza
//         </p>

//       </div>


//       {/* Pizza Grid */}

//       <div className="pizza-grid">

//         {pizzas.map((pizza) => (

//           <div
//             className="pizza-card"
//             key={pizza.id}
//           >

//             {/* Pizza Image */}

//             <div className="pizza-icon">
//               🍕
//             </div>


//             {/* Pizza Name */}

//             <h2>
//               {pizza.name}
//             </h2>


//             {/* Description */}

//             <p>
//               {pizza.description}
//             </p>


//             {/* Price */}

//             <div className="pizza-price">
//               ₹{pizza.price}
//             </div>


//             {/* ADD TO CART */}

//             <button
//               type="button"
//               className="add-cart-btn"
//               onClick={() =>
//                 handleAddToCart(pizza)
//               }
//             >
//               🛒 ADD TO CART
//             </button>


//             {/* CUSTOMIZE */}

//             <button
//               type="button"
//               className="customize-btn"
//               onClick={() =>
//                 handleCustomize(pizza)
//               }
//             >
//               CUSTOMIZE →
//             </button>

//           </div>

//         ))}

//       </div>

//     </div>
//   );
// }

// export default PizzaMenu;


// import { useNavigate } from "react-router-dom";
// import "./PizzaMenu.css";

// interface Pizza {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
// }

// function PizzaMenu() {
//   const navigate = useNavigate();

//   const restaurantName =
//     localStorage.getItem("selected_restaurant") ||
//     "La Pino'z Pizza";

//   const pizzas: Pizza[] = [
//     {
//       id: 1,
//       name: "Margherita Pizza",
//       description:
//         "Classic pizza with fresh tomato, mozzarella cheese and basil",
//       price: 149,
//     },
//     {
//       id: 2,
//       name: "Farmhouse Pizza",
//       description:
//         "Loaded with onion, capsicum, tomato and mushrooms",
//       price: 299,
//     },
//     {
//       id: 3,
//       name: "Cheese Burst Pizza",
//       description:
//         "Delicious pizza with extra cheese and creamy cheese burst",
//       price: 349,
//     },
//     {
//       id: 4,
//       name: "Paneer Pizza",
//       description:
//         "Soft paneer with fresh vegetables and mozzarella cheese",
//       price: 279,
//     },
//     {
//       id: 5,
//       name: "Veggie Delight Pizza",
//       description:
//         "Fresh vegetables with delicious pizza sauce and cheese",
//       price: 249,
//     },
//     {
//       id: 6,
//       name: "Spicy Pizza",
//       description:
//         "Spicy pizza with jalapeno, capsicum and special sauce",
//       price: 269,
//     },
//   ];

//   // ---------------------------------------------
//   // ADD TO CART
//   // ---------------------------------------------

//   const handleAddToCart = (pizza: Pizza) => {
//     const existingCart = localStorage.getItem("cart");

//     let cart: any[] = [];

//     if (existingCart) {
//       try {
//         cart = JSON.parse(existingCart);
//       } catch {
//         cart = [];
//       }
//     }

//     const existingItemIndex = cart.findIndex(
//       (item) =>
//         item.name === pizza.name &&
//         item.restaurant === restaurantName &&
//         item.customized === false
//     );

//     if (existingItemIndex !== -1) {
//       cart[existingItemIndex].quantity += 1;

//       cart[existingItemIndex].total =
//         cart[existingItemIndex].price *
//         cart[existingItemIndex].quantity;
//     } else {
//       cart.push({
//         id: Date.now(),
//         name: pizza.name,
//         description: pizza.description,
//         price: pizza.price,
//         quantity: 1,
//         total: pizza.price,
//         restaurant: restaurantName,
//         customized: false,
//         ingredients: [],
//       });
//     }

//     localStorage.setItem(
//       "cart",
//       JSON.stringify(cart)
//     );

//     window.dispatchEvent(
//       new Event("cartUpdated")
//     );

//     alert(`${pizza.name} added to cart!`);
//   };

//   // ---------------------------------------------
//   // CUSTOMIZE
//   // ---------------------------------------------

//   const handleCustomize = (pizza: Pizza) => {
//     localStorage.setItem(
//       "selected_pizza",
//       JSON.stringify({
//         ...pizza,
//         restaurant: restaurantName,
//       })
//     );

//     navigate("/pizza-ingredients");
//   };

//   // ---------------------------------------------
//   // OPEN CART
//   // ---------------------------------------------

//   const handleCart = () => {
//     navigate("/cart");
//   };

//   return (
//     <div className="pizza-menu-page">

//       {/* =========================================
//           CART BUTTON
//       ========================================= */}

//       <button
//         type="button"
//         className="pizza-cart-button"
//         onClick={handleCart}
//       >
//         🛒 Cart
//       </button>


//       {/* =========================================
//           HEADER
//       ========================================= */}

//       <div className="pizza-menu-header">

//         <div className="pizza-menu-icon">
//           🍕
//         </div>

//         <h1>
//           {restaurantName}
//         </h1>

//         <p>
//           Choose your favorite pizza
//         </p>

//       </div>


//       {/* =========================================
//           PIZZA GRID
//       ========================================= */}

//       <div className="pizza-grid">

//         {pizzas.map((pizza) => (

//           <div
//             className="pizza-card"
//             key={pizza.id}
//           >

//             <div className="pizza-icon">
//               🍕
//             </div>

//             <h2>
//               {pizza.name}
//             </h2>

//             <p>
//               {pizza.description}
//             </p>

//             <div className="pizza-price">
//               ₹{pizza.price}
//             </div>


//             {/* ADD TO CART */}

//             <button
//               type="button"
//               className="add-cart-btn"
//               onClick={() =>
//                 handleAddToCart(pizza)
//               }
//             >
//               🛒 ADD TO CART
//             </button>


//             {/* CUSTOMIZE */}

//             <button
//               type="button"
//               className="customize-btn"
//               onClick={() =>
//                 handleCustomize(pizza)
//               }
//             >
//               CUSTOMIZE →
//             </button>

//           </div>

//         ))}

//       </div>

//     </div>
//   );
// }

// export default PizzaMenu;



 


 
 
// import { useNavigate } from "react-router-dom"; 
// import "./PizzaMenu.css"; 
 
 
// // ===================================================== 
// // Pizza Type 
// // ===================================================== 
 
// interface Pizza { 
//   id: number; 
//   name: string; 
//   description: string; 
//   price: number; 
// } 
 
 
// // ===================================================== 
// // Pizza Data 
// // ===================================================== 
 
// const pizzas: Pizza[] = [ 
//   { 
//     id: 1, 
//     name: "Margherita Pizza", 
//     description: 
//       "Classic pizza with fresh tomato, mozzarella cheese and basil", 
//     price: 149, 
//   }, 
 
//   { 
//     id: 2, 
//     name: "Farmhouse Pizza", 
//     description: 
//       "Loaded with onion, capsicum, tomato and mushrooms", 
//     price: 299, 
//   }, 
 
//   { 
//     id: 3, 
//     name: "Cheese Burst Pizza", 
//     description: 
//       "Delicious pizza with extra cheese and creamy cheese burst", 
//     price: 349, 
//   }, 
 
//   { 
//     id: 4, 
//     name: "Paneer Pizza", 
//     description: 
//       "Soft paneer with fresh vegetables and mozzarella cheese", 
//     price: 279, 
//   }, 
 
//   { 
//     id: 5, 
//     name: "Veggie Delight Pizza", 
//     description: 
//       "Fresh vegetables with cheese and delicious pizza sauce", 
//     price: 249, 
//   }, 
 
//   { 
//     id: 6, 
//     name: "Mexican Green Wave Pizza", 
//     description: 
//       "Spicy Mexican pizza with capsicum, jalapeno and onion", 
//     price: 269, 
//   }, 
// ]; 
 
 
// // ===================================================== 
// // Component 
// // ===================================================== 
 
// function PizzaMenu() { 
 
//   const navigate = useNavigate(); 
 
 
//   // =================================================== 
//   // ADD DIRECTLY TO CART 
//   // =================================================== 
 
//   const handleAddToCart = (pizza: Pizza) => { 
 
//     // Get existing cart 
//     const existingCart = localStorage.getItem("cart"); 
 
//     let cart: any[] = []; 
 
//     if (existingCart) { 
//       try { 
//         cart = JSON.parse(existingCart); 
//       } catch { 
//         cart = []; 
//       } 
//     } 
 
 
//     // Check whether same pizza already exists 
//     const existingItemIndex = cart.findIndex( 
//       (item) => 
//         item.id === pizza.id && 
//         item.name === pizza.name && 
//         item.restaurant === "La Pino'z Pizza" 
//     ); 
 
 
//     // If already in cart → increase quantity 
//     if (existingItemIndex !== -1) { 
 
//       cart[existingItemIndex].quantity = 
//         (cart[existingItemIndex].quantity || 1) + 1; 
 
//     } 
 
//     // Otherwise add new item 
//     else { 
 
//       cart.push({ 
//         id: pizza.id, 
 
//         name: pizza.name, 
 
//         description: pizza.description, 
 
//         price: pizza.price, 
 
//         quantity: 1, 
 
//         category: "Pizza", 
 
//         restaurant: "La Pino'z Pizza", 
 
//         ingredients: [], 
 
//         customized: false, 
//       }); 
 
//     } 
 
 
//     // Save cart 
//     localStorage.setItem( 
//       "cart", 
//       JSON.stringify(cart) 
//     ); 
 
 
//     // Small confirmation 
//     alert(`${pizza.name} added to cart!`); 
 
//   }; 
 
 
//   // =================================================== 
//   // CUSTOMIZE PIZZA 
//   // =================================================== 
 
//   const handleCustomize = (pizza: Pizza) => { 
 
//     navigate("/pizza-ingredients", { 
//       state: { 
//         pizza: { 
//           id: pizza.id, 
 
//           name: pizza.name, 
 
//           description: pizza.description, 
 
//           price: pizza.price, 
 
//           restaurant: "La Pino'z Pizza", 
 
//           category: "Pizza", 
//         }, 
//       }, 
//     }); 
 
//   }; 
 
 
//   // =================================================== 
//   // OPEN CART 
//   // =================================================== 
 
//   const handleCart = () => { 
 
//     navigate("/cart"); 
 
//   }; 
 
 
//   // =================================================== 
//   // UI 
//   // =================================================== 
 
//   return ( 
 
//     <div className="pizza-menu-page"> 
 
 
//       {/* ================================================= 
//           CART BUTTON 
//       ================================================= */} 
 
//       <button 
//         type="button" 
//         className="pizza-cart-button" 
//         onClick={handleCart} 
//       > 
//         🛒 Cart 
//       </button> 
 
 
 
//       {/* ================================================= 
//           HEADER 
//       ================================================= */} 
 
//       <div className="pizza-header"> 
 
//         <div className="pizza-header-icon"> 
//           🍕 
//         </div> 
 
//         <h1> 
//           La Pino'z Pizza 
//         </h1> 
 
//         <p> 
//           Choose your favorite pizza 
//         </p> 
 
//       </div> 
 
 
 
//       {/* ================================================= 
//           PIZZA GRID 
//       ================================================= */} 
 
//       <div className="pizza-grid"> 
 
//         {pizzas.map((pizza) => ( 
 
//           <div 
//             className="pizza-card" 
//             key={pizza.id} 
//           > 
 
 
//             {/* Pizza Icon */} 
 
//             <div className="pizza-card-icon"> 
//               🍕 
//             </div> 
 
 
 
//             {/* Pizza Name */} 
 
//             <h2> 
//               {pizza.name} 
//             </h2> 
 
 
 
//             {/* Description */} 
 
//             <p className="pizza-card-description"> 
//               {pizza.description} 
//             </p> 
 
 
 
//             {/* Price */} 
 
//             <div className="pizza-card-price"> 
//               ₹{pizza.price} 
//             </div> 
 
 
 
//             {/* ================================================= 
//                 BUTTONS 
//             ================================================= */} 
 
//             <div className="pizza-card-buttons"> 
 
 
//               {/* ADD TO CART */} 
 
//               <button 
//                 type="button" 
//                 className="pizza-add-cart" 
//                 onClick={() => 
//                   handleAddToCart(pizza) 
//                 } 
//               > 
//                 🛒 ADD TO CART 
//               </button> 
 
 
 
//               {/* CUSTOMIZE */} 
 
//               <button 
//                 type="button" 
//                 className="pizza-customize" 
//                 onClick={() => 
//                   handleCustomize(pizza) 
//                 } 
//               > 
//                 CUSTOMIZE → 
//               </button> 
 
 
//             </div> 
 
//           </div> 
 
//         ))} 
 
//       </div> 
 
//     </div> 
 
//   ); 
// } 
 
 
// export default PizzaMenu;   



// import { useNavigate } from "react-router-dom";
// import "./PizzaMenu.css";

// interface Pizza {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
// }

// const pizzas: Pizza[] = [
//   {
//     id: 1,
//     name: "Margherita Pizza",
//     description:
//       "Classic pizza with fresh tomato, mozzarella cheese and basil",
//     price: 149,
//   },
//   {
//     id: 2,
//     name: "Farmhouse Pizza",
//     description:
//       "Loaded with onion, capsicum, tomato and mushrooms",
//     price: 299,
//   },
//   {
//     id: 3,
//     name: "Cheese Burst Pizza",
//     description:
//       "Delicious pizza with extra cheese and creamy cheese burst",
//     price: 349,
//   },
//   {
//     id: 4,
//     name: "Paneer Pizza",
//     description:
//       "Soft paneer with fresh vegetables and mozzarella cheese",
//     price: 279,
//   },
//   {
//     id: 5,
//     name: "Veggie Delight Pizza",
//     description:
//       "Fresh vegetables with cheese and delicious pizza sauce",
//     price: 249,
//   },
//   {
//     id: 6,
//     name: "Mexican Green Wave Pizza",
//     description:
//       "Spicy Mexican pizza with capsicum, jalapeno and onion",
//     price: 269,
//   },
// ];

// interface CartItem {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   quantity: number;
//   category: string;
//   restaurant: string;
//   ingredients: any[];
//   customized: boolean;
// }

// function PizzaMenu() {
//   const navigate = useNavigate();

//   // =====================================================
//   // ADD PIZZA DIRECTLY TO CART
//   // =====================================================

//   const handleAddToCart = (pizza: Pizza) => {
//     let cart: CartItem[] = [];

//     const savedCart = localStorage.getItem("cart");

//     if (savedCart) {
//       try {
//         cart = JSON.parse(savedCart);
//       } catch {
//         cart = [];
//       }
//     }

//     const existingIndex = cart.findIndex(
//       (item) =>
//         item.id === pizza.id &&
//         item.name === pizza.name &&
//         item.restaurant === "La Pino'z Pizza" &&
//         item.customized === false
//     );

//     if (existingIndex !== -1) {
//       cart[existingIndex].quantity =
//         (cart[existingIndex].quantity || 1) + 1;
//     } else {
//       const newItem: CartItem = {
//         id: pizza.id,
//         name: pizza.name,
//         description: pizza.description,
//         price: pizza.price,
//         quantity: 1,
//         category: "Pizza",
//         restaurant: "La Pino'z Pizza",
//         ingredients: [],
//         customized: false,
//       };

//       cart.push(newItem);
//     }

//     localStorage.setItem("cart", JSON.stringify(cart));

//     alert(`${pizza.name} added to cart!`);
//   };

//   // =====================================================
//   // CUSTOMIZE PIZZA
//   // =====================================================

//   const handleCustomize = (pizza: Pizza) => {
//     navigate("/pizza-ingredients", {
//       state: {
//         pizza: {
//           id: pizza.id,
//           name: pizza.name,
//           description: pizza.description,
//           price: pizza.price,
//           restaurant: "La Pino'z Pizza",
//           category: "Pizza",
//         },
//       },
//     });
//   };

//   // =====================================================
//   // OPEN CART
//   // =====================================================

//   const handleCart = () => {
//     navigate("/cart");
//   };

//   // =====================================================
//   // PIZZA MENU UI
//   // =====================================================

//   return (
//     <div className="pizza-menu-page">

//       {/* =================================================
//           CART BUTTON - TOP RIGHT
//       ================================================= */}

//       <button
//         type="button"
//         className="pizza-cart-button"
//         onClick={handleCart}
//       >
//         🛒 Cart
//       </button>

//       {/* =================================================
//           HEADER
//       ================================================= */}

//       <header className="pizza-header">

//         <div className="pizza-header-icon">
//           🍕
//         </div>

//         <h1>La Pino'z Pizza</h1>

//         <p>Choose your favorite pizza</p>

//       </header>

//       {/* =================================================
//           PIZZA GRID
//       ================================================= */}

//       <main className="pizza-grid">

//         {pizzas.map((pizza) => (
//           <div
//             className="pizza-card"
//             key={pizza.id}
//           >

//             {/* Pizza Icon */}

//             <div className="pizza-card-icon">
//               🍕
//             </div>

//             {/* Pizza Name */}

//             <h2>
//               {pizza.name}
//             </h2>

//             {/* Description */}

//             <p className="pizza-card-description">
//               {pizza.description}
//             </p>

//             {/* Price */}

//             <div className="pizza-card-price">
//               ₹{pizza.price}
//             </div>

//             {/* Buttons */}

//             <div className="pizza-card-buttons">

//               {/* ADD TO CART */}

//               <button
//                 type="button"
//                 className="pizza-add-cart"
//                 onClick={() => handleAddToCart(pizza)}
//               >
//                 🛒 ADD TO CART
//               </button>

//               {/* CUSTOMIZE */}

//               <button
//                 type="button"
//                 className="pizza-customize"
//                 onClick={() => handleCustomize(pizza)}
//               >
//                 CUSTOMIZE →
//               </button>

//             </div>

//           </div>
//         ))}

//       </main>

//     </div>
//   );
// }

// export default PizzaMenu;

import { useNavigate } from "react-router-dom";
import "./PizzaMenu.css";

// =====================================================
// Pizza Type
// =====================================================

interface Pizza {
  id: number;
  name: string;
  description: string;
  price: number;
}

// =====================================================
// Pizza Data
// =====================================================

const pizzas: Pizza[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    description:
      "Classic pizza with fresh tomato, mozzarella cheese and basil",
    price: 149,
  },
  {
    id: 2,
    name: "Farmhouse Pizza",
    description:
      "Loaded with onion, capsicum, tomato and mushrooms",
    price: 299,
  },
  {
    id: 3,
    name: "Cheese Burst Pizza",
    description:
      "Delicious pizza with extra cheese and creamy cheese burst",
    price: 349,
  },
  {
    id: 4,
    name: "Paneer Pizza",
    description:
      "Soft paneer with fresh vegetables and mozzarella cheese",
    price: 279,
  },
  {
    id: 5,
    name: "Veggie Delight Pizza",
    description:
      "Fresh vegetables with cheese and delicious pizza sauce",
    price: 249,
  },
  {
    id: 6,
    name: "Mexican Green Wave Pizza",
    description:
      "Spicy Mexican pizza with capsicum, jalapeno and onion",
    price: 269,
  },
];

// =====================================================
// Component
// =====================================================

function PizzaMenu() {
  const navigate = useNavigate();
  const handleBack = () => {
  navigate(-1);
};

  // ===================================================
  // ADD DIRECTLY TO CART
  // ===================================================

  const handleAddToCart = (pizza: Pizza) => {
    const existingCart = localStorage.getItem("cart");

    let cart: any[] = [];

    if (existingCart) {
      try {
        cart = JSON.parse(existingCart);
      } catch {
        cart = [];
      }
    }

    // Check if same pizza from same restaurant exists
    const existingItemIndex = cart.findIndex(
      (item) =>
        item.id === pizza.id &&
        item.name === pizza.name &&
        item.restaurant === "La Pino'z Pizza"
    );

    // Increase quantity
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity =
        (cart[existingItemIndex].quantity || 1) + 1;
    }

    // Add new pizza
    else {
      cart.push({
        id: pizza.id,
        name: pizza.name,
        description: pizza.description,
        price: pizza.price,
        quantity: 1,
        category: "Pizza",
        restaurant: "La Pino'z Pizza",
        ingredients: [],
        customized: false,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    alert(`${pizza.name} added to cart!`);
  };

  // ===================================================
  // CUSTOMIZE PIZZA
  // ===================================================

  const handleCustomize = (pizza: Pizza) => {
    navigate("/pizza-ingredients", {
      state: {
        pizza: {
          id: pizza.id,
          name: pizza.name,
          description: pizza.description,
          price: pizza.price,
          restaurant: "La Pino'z Pizza",
          category: "Pizza",
        },
      },
    });
  };

  // ===================================================
  // OPEN CART
  // ===================================================

  const handleCart = () => {
    navigate("/cart");
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="pizza-menu-page">

        {/* BACK BUTTON */}
    <button
      type="button"
      className="back-button"
      onClick={handleBack}
    >
      ← Back
    </button>

      {/* =================================================
          CART BUTTON
      ================================================= */}

      <button
        type="button"
        className="pizza-cart-button"
        onClick={handleCart}
      >
        🛒 Cart
      </button>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="pizza-header">

        <div className="pizza-header-icon">
          🍕
        </div>

        <h1>La Pino'z Pizza</h1>

        <p>Choose your favorite pizza</p>

      </div>

      {/* =================================================
          PIZZA GRID
      ================================================= */}

      <div className="pizza-grid">

        {pizzas.map((pizza) => (
          <div
            className="pizza-card"
            key={pizza.id}
          >

            {/* Pizza Icon */}

            <div className="pizza-card-icon">
              🍕
            </div>

            {/* Pizza Name */}

            <h2>{pizza.name}</h2>

            {/* Description */}

            <p className="pizza-card-description">
              {pizza.description}
            </p>

            {/* Price */}

            <div className="pizza-card-price">
              ₹{pizza.price}
            </div>

            {/* Buttons */}

            <div className="pizza-card-buttons">

              {/* ADD TO CART */}

              <button
                type="button"
                className="pizza-add-cart"
                onClick={() => handleAddToCart(pizza)}
              >
                🛒 ADD TO CART
              </button>

              {/* CUSTOMIZE */}

              <button
                type="button"
                className="pizza-customize"
                onClick={() => handleCustomize(pizza)}
              >
                CUSTOMIZE →
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default PizzaMenu;