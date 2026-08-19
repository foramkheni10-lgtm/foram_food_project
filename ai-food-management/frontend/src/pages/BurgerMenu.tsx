// import { useLocation, useNavigate } from "react-router-dom";
// import "./BurgerMenu.css";

// interface LocationState {
//   restaurant?: string;
// }

// function BurgerMenu() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const state = location.state as LocationState;

//   const restaurant =
//     state?.restaurant || "Burger Restaurant";

//   const burgers = [
//     {
//       name: "Classic Burger",
//       price: 149,
//       icon: "🍔",
//       description:
//         "Classic burger with crispy lettuce, tomato and cheese",
//     },

//     {
//       name: "Cheese Burger",
//       price: 179,
//       icon: "🍔",
//       description:
//         "Juicy burger with melted cheese and fresh vegetables",
//     },

//     {
//       name: "Veggie Burger",
//       price: 159,
//       icon: "🍔",
//       description:
//         "Healthy vegetable patty with lettuce and tomato",
//     },

//     {
//       name: "Double Patty Burger",
//       price: 229,
//       icon: "🍔",
//       description:
//         "Double patty burger with cheese and special sauce",
//     },

//     {
//       name: "Spicy Burger",
//       price: 189,
//       icon: "🍔",
//       description:
//         "Spicy burger with jalapeno and special spicy sauce",
//     },

//     {
//       name: "Paneer Burger",
//       price: 199,
//       icon: "🍔",
//       description:
//         "Crispy paneer patty with vegetables and cheese",
//     },
//   ];

//   const handleCustomize = (burger: typeof burgers[0]) => {
//     navigate("/burger-ingredients", {
//       state: {
//         restaurant: restaurant,
//         burger: burger,
//       },
//     });
//   };

//   return (
//     <div className="burger-menu-page">

//       <div className="burger-menu-header">

//         <h1>🍔 {restaurant}</h1>

//         <p>
//           Select your favorite burger
//         </p>

//       </div>

//       <div className="burger-menu-grid">

//         {burgers.map((burger) => (

//           <div
//             key={burger.name}
//             className="burger-menu-card"
//           >

//             <div className="burger-menu-icon">
//               {burger.icon}
//             </div>

//             <h2>
//               {burger.name}
//             </h2>

//             <p>
//               {burger.description}
//             </p>

//             <h3>
//               ₹{burger.price}
//             </h3>


//             <button
//               type="button"
//               onClick={() =>
//                 handleCustomize(burger)
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

// export default BurgerMenu;

// import { useLocation, useNavigate } from "react-router-dom";
// import "./BurgerMenu.css";

// interface Burger {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
// }

// function BurgerMenu() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const restaurantName =
//     location.state?.restaurantName || "Selected Restaurant";

//   // -------------------------------------------------
//   // Burger List
//   // -------------------------------------------------

//   const burgers: Burger[] = [
//     {
//       id: 1,
//       name: "Classic Burger",
//       description:
//         "Classic burger with fresh vegetables and special sauce",
//       price: 149,
//     },
//     {
//       id: 2,
//       name: "Cheese Burger",
//       description:
//         "Juicy burger with delicious melted cheese",
//       price: 179,
//     },
//     {
//       id: 3,
//       name: "Veggie Burger",
//       description:
//         "Healthy vegetable patty with fresh lettuce and tomato",
//       price: 159,
//     },
//     {
//       id: 4,
//       name: "Spicy Burger",
//       description:
//         "Spicy burger with jalapeño and special spicy sauce",
//       price: 189,
//     },
//     {
//       id: 5,
//       name: "Double Patty Burger",
//       description:
//         "Double patty burger for extra deliciousness",
//       price: 229,
//     },
//     {
//       id: 6,
//       name: "Mushroom Burger",
//       description:
//         "Burger loaded with fresh mushrooms and cheese",
//       price: 199,
//     },
//   ];

//   // -------------------------------------------------
//   // Direct Add To Cart
//   // -------------------------------------------------

//   const handleAddToCart = (burger: Burger) => {
//     const cartItem = {
//       category: "Burger",
//       name: burger.name,
//       restaurant: restaurantName,

//       // No customization
//       basePrice: burger.price,
//       ingredients: [],
//       extraPrice: 0,

//       // Final price remains base price
//       totalPrice: burger.price,
//     };

//     // Get existing cart
//     const existingCart = JSON.parse(
//       localStorage.getItem("cart") || "[]"
//     );

//     // Add burger
//     existingCart.push(cartItem);

//     // Save cart
//     localStorage.setItem(
//       "cart",
//       JSON.stringify(existingCart)
//     );

//     alert(
//       `${burger.name} added to cart successfully! 🛒`
//     );
//   };

//   // -------------------------------------------------
//   // Customize Burger
//   // -------------------------------------------------

//   const handleCustomize = (burger: Burger) => {
//     navigate("/burger-ingredients", {
//       state: {
//         burger: {
//           name: burger.name,
//           price: burger.price,
//           restaurant: restaurantName,
//         },
//       },
//     });
//   };

//   // -------------------------------------------------
//   // Burger Menu
//   // -------------------------------------------------

//   return (
//     <div className="burger-menu-page">

//       {/* Header */}

//       <div className="burger-menu-header">

//         <div className="burger-menu-icon">
//           🍔
//         </div>

//         <h1>
//           {restaurantName}
//         </h1>

//         <p>
//           Choose your favorite burger
//         </p>

//       </div>

//       {/* Burger List */}

//       <div className="burger-grid">

//         {burgers.map((burger) => (

//           <div
//             className="burger-card"
//             key={burger.id}
//           >

//             <div className="burger-card-icon">
//               🍔
//             </div>

//             <h2>
//               {burger.name}
//             </h2>

//             <p>
//               {burger.description}
//             </p>

//             <h3>
//               ₹{burger.price}
//             </h3>

//             {/* Buttons */}

//             <div className="burger-buttons">

//               {/* Direct Add To Cart */}

//               <button
//                 type="button"
//                 className="direct-cart-button"
//                 onClick={() =>
//                   handleAddToCart(burger)
//                 }
//               >
//                 🛒 ADD TO CART
//               </button>

//               {/* Customize */}

//               <button
//                 type="button"
//                 className="customize-button"
//                 onClick={() =>
//                   handleCustomize(burger)
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

// export default BurgerMenu;



import { useLocation, useNavigate } from "react-router-dom";
import "./BurgerMenu.css";

interface Burger {
  id: number;
  name: string;
  description: string;
  price: number;
}

function BurgerMenu() {
  const navigate = useNavigate();
    const handleBack = () => {
  navigate(-1);
};

  const location = useLocation();

  const restaurantName =
    location.state?.restaurantName || "Selected Restaurant";

  // -------------------------------------------------
  // Burger List
  // -------------------------------------------------

  const burgers: Burger[] = [
    {
      id: 1,
      name: "Classic Burger",
      description:
        "Classic burger with fresh vegetables and special sauce",
      price: 149,
    },
    {
      id: 2,
      name: "Cheese Burger",
      description:
        "Juicy burger with delicious melted cheese",
      price: 179,
    },
    {
      id: 3,
      name: "Veggie Burger",
      description:
        "Healthy vegetable patty with fresh lettuce and tomato",
      price: 159,
    },
    {
      id: 4,
      name: "Spicy Burger",
      description:
        "Spicy burger with jalapeño and special spicy sauce",
      price: 189,
    },
    {
      id: 5,
      name: "Double Patty Burger",
      description:
        "Double patty burger for extra deliciousness",
      price: 229,
    },
    {
      id: 6,
      name: "Mushroom Burger",
      description:
        "Burger loaded with fresh mushrooms and cheese",
      price: 199,
    },
  ];

  // -------------------------------------------------
  // OPEN CART
  // -------------------------------------------------

  const handleCart = () => {
    navigate("/cart");
  };

  // -------------------------------------------------
  // Direct Add To Cart
  // -------------------------------------------------

  const handleAddToCart = (burger: Burger) => {
    const cartItem = {
      id: Date.now(),

      category: "Burger",

      name: burger.name,

      restaurant: restaurantName,

      // No customization
      basePrice: burger.price,

      ingredients: [],

      extraPrice: 0,

      // Final price
      totalPrice: burger.price,

      quantity: 1,

      customized: false,
    };

    // Get existing cart
    const existingCart = JSON.parse(
      localStorage.getItem("cart") || "[]"
    );

    // Add burger
    existingCart.push(cartItem);

    // Save cart
    localStorage.setItem(
      "cart",
      JSON.stringify(existingCart)
    );

    // Success message
    alert(
      `${burger.name} added to cart successfully! 🛒`
    );

    // IMPORTANT:
    // Stay on Burger Menu page.
    // No navigate() here.
  };

  // -------------------------------------------------
  // Customize Burger
  // -------------------------------------------------

  const handleCustomize = (burger: Burger) => {
    navigate("/burger-ingredients", {
      state: {
        burger: {
          name: burger.name,
          price: burger.price,
          restaurant: restaurantName,
        },
      },
    });
  };

  // -------------------------------------------------
  // Burger Menu
  // -------------------------------------------------

  return (
    <div className="burger-menu-page">

       {/* BACK BUTTON */}
    <button
  type="button"
  className="back-button"
  onClick={handleBack}
>
  ← Back
</button>

      {/* =================================================
          SEPARATE CART BUTTON
      ================================================= */}

      <button
        type="button"
        className="burger-cart-button"
        onClick={handleCart}
      >
        🛒 Cart
      </button>

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="burger-menu-header">

        <div className="burger-menu-icon">
          🍔
        </div>

        <h1>
          {restaurantName}
        </h1>

        <p>
          Choose your favorite burger
        </p>

      </div>

      {/* =================================================
          BURGER LIST
      ================================================= */}

      <div className="burger-grid">

        {burgers.map((burger) => (

          <div
            className="burger-card"
            key={burger.id}
          >

            {/* Burger Icon */}

            <div className="burger-card-icon">
              🍔
            </div>

            {/* Burger Name */}

            <h2>
              {burger.name}
            </h2>

            {/* Description */}

            <p>
              {burger.description}
            </p>

            {/* Price */}

            <h3>
              ₹{burger.price}
            </h3>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="burger-buttons">

              {/* Direct Add To Cart */}

              <button
                type="button"
                className="direct-cart-button"
                onClick={() =>
                  handleAddToCart(burger)
                }
              >
                🛒 ADD TO CART
              </button>

              {/* Customize */}

              <button
                type="button"
                className="customize-button"
                onClick={() =>
                  handleCustomize(burger)
                }
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

export default BurgerMenu;
