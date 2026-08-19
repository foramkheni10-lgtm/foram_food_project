// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import "./Cart.css";

// interface CartIngredient {
//   name: string;
//   price: number;
// }

// interface CartItem {
//   category: string;
//   name: string;
//   restaurant: string;
//   basePrice: number;
//   ingredients?: CartIngredient[];
//   extraPrice: number;
//   totalPrice: number;
// }

// function Cart() {
//   const navigate = useNavigate();

//   const [cartItems, setCartItems] = useState<CartItem[]>([]);

//   // -------------------------------------------------
//   // Load Cart
//   // -------------------------------------------------

//   useEffect(() => {
//     const savedCart = JSON.parse(
//       localStorage.getItem("cart") || "[]"
//     );

//     setCartItems(savedCart);
//   }, []);

//   // -------------------------------------------------
//   // Remove Item
//   // -------------------------------------------------

//   const handleRemove = (index: number) => {
//     const updatedCart = cartItems.filter(
//       (_, itemIndex) => itemIndex !== index
//     );

//     setCartItems(updatedCart);

//     localStorage.setItem(
//       "cart",
//       JSON.stringify(updatedCart)
//     );
//   };

//   // -------------------------------------------------
//   // Clear Cart
//   // -------------------------------------------------

//   const handleClearCart = () => {
//     localStorage.removeItem("cart");

//     setCartItems([]);
//   };

//   // -------------------------------------------------
//   // Total
//   // -------------------------------------------------

//   const grandTotal = cartItems.reduce(
//     (total, item) =>
//       total + Number(item.totalPrice),
//     0
//   );

//   return (
//     <div className="cart-page">

//       {/* Header */}

//       <div className="cart-header">

//         <div className="cart-icon">
//           🛒
//         </div>

//         <h1>
//           Your Cart
//         </h1>

//         <p>
//           Review all your selected food items
//         </p>

//       </div>

//       {/* Empty Cart */}

//       {cartItems.length === 0 ? (

//         <div className="empty-cart">

//           <div className="empty-cart-icon">
//             🛒
//           </div>

//           <h2>
//             Your cart is empty
//           </h2>

//           <p>
//             Add some delicious food to continue.
//           </p>

//           <button
//             type="button"
//             onClick={() => navigate("/browse")}
//           >
//             🍴 Browse Food
//           </button>

//         </div>

//       ) : (

//         <>

//           {/* Cart Items */}

//           <div className="cart-items">

//             {cartItems.map((item, index) => (

//               <div
//                 className="cart-item"
//                 key={index}
//               >

//                 <div className="cart-item-icon">

//                   {item.category === "Pizza"
//                     ? "🍕"
//                     : item.category === "Burger"
//                     ? "🍔"
//                     : item.category === "Sandwich"
//                     ? "🥪"
//                     : item.category === "Chinese"
//                     ? "🍜"
//                     : item.category === "Drinks"
//                     ? "🥤"
//                     : item.category === "Dessert"
//                     ? "🍰"
//                     : "🍴"}

//                 </div>

//                 <div className="cart-item-details">

//                   <span className="cart-category">
//                     {item.category}
//                   </span>

//                   <h2>
//                     {item.name}
//                   </h2>

//                   <p>
//                     Restaurant:{" "}
//                     {item.restaurant}
//                   </p>

//                   <p>
//                     Base Price: ₹
//                     {item.basePrice}
//                   </p>

//                   {item.ingredients &&
//                     item.ingredients.length > 0 && (

//                       <div className="selected-ingredients">

//                         <strong>
//                           Extra Ingredients:
//                         </strong>

//                         <ul>

//                           {item.ingredients.map(
//                             (ingredient, ingredientIndex) => (

//                               <li
//                                 key={
//                                   ingredientIndex
//                                 }
//                               >
//                                 {ingredient.name}
//                                 {" "}(
//                                 ₹
//                                 {
//                                   ingredient.price
//                                 }
//                                 )
//                               </li>

//                             )
//                           )}

//                         </ul>

//                       </div>

//                     )}

//                   {item.extraPrice > 0 && (

//                     <p>
//                       Extra Price: ₹
//                       {item.extraPrice}
//                     </p>

//                   )}

//                 </div>

//                 <div className="cart-item-right">

//                   <strong>
//                     ₹{item.totalPrice}
//                   </strong>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       handleRemove(index)
//                     }
//                   >
//                     Remove
//                   </button>

//                 </div>

//               </div>

//             ))}

//           </div>

//           {/* Cart Summary */}

//           <div className="cart-summary">

//             <div className="summary-row">

//               <span>
//                 Items
//               </span>

//               <strong>
//                 {cartItems.length}
//               </strong>

//             </div>

//             <div className="summary-row total">

//               <span>
//                 Total
//               </span>

//               <strong>
//                 ₹{grandTotal}
//               </strong>

//             </div>

//             <button
//               type="button"
//               className="checkout-button"
//             >
//               PROCEED TO CHECKOUT — ₹
//               {grandTotal}
//             </button>

//             <button
//               type="button"
//               className="continue-button"
//               onClick={() =>
//                 navigate("/browse")
//               }
//             >
//               ← Continue Shopping
//             </button>

//             <button
//               type="button"
//               className="clear-cart-button"
//               onClick={handleClearCart}
//             >
//               Clear Cart
//             </button>

//           </div>

//         </>

//       )}

//     </div>
//   );
// }

// export default Cart;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Cart.css";


// -------------------------------------------------
// Cart Item Type
// -------------------------------------------------

interface CartItem {
  id?: string | number;
  name: string;
  restaurant?: string;
  price: number;
  quantity: number;
  icon?: string;
  ingredients?: string[];
  customizations?: string[];
}


// -------------------------------------------------
// Cart Component
// -------------------------------------------------

function Cart() {

  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);


  // -------------------------------------------------
  // Load Cart
  // -------------------------------------------------

  useEffect(() => {

    loadCart();

  }, []);


  // -------------------------------------------------
  // Load items from localStorage
  // -------------------------------------------------

  const loadCart = () => {

    try {

      const savedCart =
        localStorage.getItem("cart");

      if (!savedCart) {

        setCartItems([]);

        return;
      }


      const parsedCart = JSON.parse(savedCart);


      if (Array.isArray(parsedCart)) {

        setCartItems(parsedCart);

      } else {

        setCartItems([]);

      }

    } catch (error) {

      console.error(
        "Error loading cart:",
        error
      );

      setCartItems([]);

    }

  };


  // -------------------------------------------------
  // Save Cart
  // -------------------------------------------------

  const saveCart = (items: CartItem[]) => {

    localStorage.setItem(
      "cart",
      JSON.stringify(items)
    );

    setCartItems(items);

  };


  // -------------------------------------------------
  // Increase Quantity
  // -------------------------------------------------

  const increaseQuantity = (
    index: number
  ) => {

    const updatedCart = [...cartItems];

    updatedCart[index].quantity += 1;

    saveCart(updatedCart);

  };


  // -------------------------------------------------
  // Decrease Quantity
  // -------------------------------------------------

  const decreaseQuantity = (
    index: number
  ) => {

    const updatedCart = [...cartItems];


    if (
      updatedCart[index].quantity > 1
    ) {

      updatedCart[index].quantity -= 1;

    } else {

      updatedCart.splice(index, 1);

    }


    saveCart(updatedCart);

  };


  // -------------------------------------------------
  // Remove Item
  // -------------------------------------------------

  const removeItem = (
    index: number
  ) => {

    const updatedCart =
      cartItems.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

    saveCart(updatedCart);

  };


  // -------------------------------------------------
  // Clear Cart
  // -------------------------------------------------

  const clearCart = () => {

    const confirmClear =
      window.confirm(
        "Are you sure you want to clear your cart?"
      );

    if (!confirmClear) {
      return;
    }


    localStorage.removeItem("cart");

    setCartItems([]);

  };


  // -------------------------------------------------
  // Calculate Total
  // -------------------------------------------------

  const totalAmount =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price) *
        Number(item.quantity || 1),
      0
    );


  // -------------------------------------------------
  // Total Items
  // -------------------------------------------------

  const totalItems =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 1),
      0
    );


  // -------------------------------------------------
  // Continue Shopping
  // -------------------------------------------------

  const continueShopping = () => {

    navigate("/browse");

  };


  // -------------------------------------------------
  // Proceed to Order
  // -------------------------------------------------

  const proceedToOrder = () => {

    if (cartItems.length === 0) {

      alert(
        "Your cart is empty."
      );

      return;

    }


    navigate("/order");

  };


  // -------------------------------------------------
  // Empty Cart
  // -------------------------------------------------

  if (cartItems.length === 0) {

    return (

      <div className="cart-page">

        <div className="cart-header">

          <button
            className="back-button"
            onClick={() =>
              navigate("/browse")
            }
          >
            ← Back
          </button>

          <h1>
            🛒 Your Cart
          </h1>

        </div>


        <div className="empty-cart">

          <div className="empty-cart-icon">
            🛒
          </div>

          <h2>
            Your cart is empty
          </h2>

          <p>
            Looks like you haven't added
            any delicious food yet.
          </p>


          <button
            className="continue-shopping-button"
            onClick={continueShopping}
          >
            🍴 Browse Food
          </button>

        </div>

      </div>

    );

  }


  // -------------------------------------------------
  // Cart UI
  // -------------------------------------------------

  return (

    <div className="cart-page">


      {/* ------------------------------------------- */}
      {/* Header */}
      {/* ------------------------------------------- */}

      <div className="cart-header">

        <button
          className="back-button"
          onClick={() =>
            navigate("/browse")
          }
        >
          ← Back
        </button>


        <div className="cart-title">

          <h1>
            🛒 Your Cart
          </h1>

          <p>
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "items"}{" "}
            in your cart
          </p>

        </div>


        <button
          className="clear-cart-button"
          onClick={clearCart}
        >
          Clear Cart
        </button>

      </div>


      {/* ------------------------------------------- */}
      {/* Main Content */}
      {/* ------------------------------------------- */}

      <div className="cart-content">


        {/* ----------------------------------------- */}
        {/* Cart Items */}
        {/* ----------------------------------------- */}

        <div className="cart-items-section">

          {cartItems.map(
            (item, index) => (

              <div
                className="cart-item"
                key={
                  item.id ??
                  `${item.name}-${index}`
                }
              >


                {/* Food Icon */}

                <div className="cart-item-icon">

                  {item.icon ||
                    (
                      item.name
                        .toLowerCase()
                        .includes("burger")
                        ? "🍔"
                        : item.name
                            .toLowerCase()
                            .includes("pizza")
                        ? "🍕"
                        : "🍴"
                    )}

                </div>


                {/* Food Details */}

                <div className="cart-item-details">

                  <h2>
                    {item.name}
                  </h2>


                  {item.restaurant && (

                    <p className="restaurant-name">
                      🏪 {item.restaurant}
                    </p>

                  )}


                  {/* Ingredients */}

                  {item.ingredients &&
                    item.ingredients.length >
                      0 && (

                      <div className="ingredient-list">

                        <strong>
                          Ingredients:
                        </strong>

                        <span>
                          {item.ingredients.join(
                            ", "
                          )}
                        </span>

                      </div>

                    )}


                  {/* Customizations */}

                  {item.customizations &&
                    item.customizations.length >
                      0 && (

                      <div className="customization-list">

                        <strong>
                          Customizations:
                        </strong>

                        <span>
                          {item.customizations.join(
                            ", "
                          )}
                        </span>

                      </div>

                    )}


                  <div className="item-price">

                    ₹
                    {Number(
                      item.price
                    ).toFixed(0)}

                    {" "}each

                  </div>

                </div>


                {/* Quantity */}

                <div className="quantity-section">

                  <span>
                    Quantity
                  </span>

                  <div className="quantity-control">

                    <button
                      onClick={() =>
                        decreaseQuantity(
                          index
                        )
                      }
                    >
                      −
                    </button>

                    <strong>
                      {item.quantity || 1}
                    </strong>

                    <button
                      onClick={() =>
                        increaseQuantity(
                          index
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                </div>


                {/* Item Total */}

                <div className="item-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹
                    {(
                      Number(item.price) *
                      Number(
                        item.quantity || 1
                      )
                    ).toFixed(0)}
                  </strong>

                </div>


                {/* Remove */}

                <button
                  className="remove-item-button"
                  onClick={() =>
                    removeItem(index)
                  }
                  title="Remove item"
                >
                  ✕
                </button>

              </div>

            )
          )}

        </div>


        {/* ----------------------------------------- */}
        {/* Order Summary */}
        {/* ----------------------------------------- */}

        <div className="order-summary">

          <h2>
            Order Summary
          </h2>


          <div className="summary-row">

            <span>
              Items
            </span>

            <span>
              {totalItems}
            </span>

          </div>


          <div className="summary-row">

            <span>
              Subtotal
            </span>

            <span>
              ₹{totalAmount.toFixed(0)}
            </span>

          </div>


          <div className="summary-row">

            <span>
              Taxes
            </span>

            <span>
              ₹0
            </span>

          </div>


          <div className="summary-line" />


          <div className="summary-total">

            <span>
              Total
            </span>

            <strong>
              ₹{totalAmount.toFixed(0)}
            </strong>

          </div>


          {/* Continue Shopping */}

          <button
            className="continue-button"
            onClick={continueShopping}
          >
            ← Continue Shopping
          </button>


          {/* Proceed */}

          <button
            className="proceed-button"
            onClick={proceedToOrder}
          >
            Proceed to Order →
          </button>

        </div>

      </div>

    </div>

  );

}

export default Cart;