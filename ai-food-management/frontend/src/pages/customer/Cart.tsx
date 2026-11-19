
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

interface CartItem {
  food_id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface CartResponse {
  items: CartItem[];
  total_items: number;
  total_price: number;
}

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse>({
    items: [],
    total_items: 0,
    total_price: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("smartfoodcourt_token");

  const fetchCart = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/cart/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
  }, []);

  const updateQuantity = async (foodId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      await axios.patch(
        `http://127.0.0.1:8000/api/cart/items/${foodId}?quantity=${quantity}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to update quantity.");
    }
  };

  const removeItem = async (foodId: string) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/cart/items/${foodId}`,
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
      await axios.delete(
        "http://127.0.0.1:8000/api/cart/",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchCart();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Unable to clear cart.");
    }
  };

  if (loading) {
    return <div className="cart-status">Loading your cart...</div>;
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <span>SMART FOODCOURT</span>
        <h1>My Shopping Cart</h1>
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
            {cart.items.map((item) => (
              <article className="cart-item" key={item.food_id}>
                <div className="cart-item-image">🍽️</div>

                <div className="cart-item-info">
                  <span>{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>₹{item.price.toFixed(2)} each</p>

                  <div className="cart-quantity">
                    <button
                      onClick={() =>
                        updateQuantity(item.food_id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <strong>{item.quantity}</strong>
                    <button
                      onClick={() =>
                        updateQuantity(item.food_id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-item-right">
                  <strong>₹{item.subtotal.toFixed(2)}</strong>
                  <button
                    className="remove-cart-item"
                    onClick={() => removeItem(item.food_id)}
                  >
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>
            <div>
              <span>Total Items</span>
              <strong>{cart.total_items}</strong>
            </div>
            <div>
              <span>Subtotal</span>
              <strong>₹{cart.total_price.toFixed(2)}</strong>
            </div>
            <div className="cart-total">
              <span>Total</span>
              <strong>₹{cart.total_price.toFixed(2)}</strong>
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
    </main>
  );
}

export default Cart;
