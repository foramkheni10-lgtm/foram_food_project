import { useNavigate } from "react-router-dom";
import "./BurgerRestaurants.css";

function BurgerRestaurants() {
  const navigate = useNavigate();
    const handleBack = () => {
  navigate(-1);
};


  const restaurants = [
    {
      name: "Burger King",
      icon: "🍔",
      description: "Delicious burgers with fresh ingredients",
    },
    {
      name: "McDonald's",
      icon: "🍔",
      description: "Classic burgers and famous combos",
    },
    {
      name: "The Burger House",
      icon: "🍔",
      description: "Fresh and tasty handcrafted burgers",
    },
  ];

  const handleRestaurantClick = (restaurantName: string) => {
    navigate("/burger-menu", {
      state: {
        restaurant: restaurantName,
      },
    });
  };

  return (
    <div className="burger-restaurants-page">

       {/* BACK BUTTON */}
    <button
  type="button"
  className="back-button"
  onClick={handleBack}
>
  ← Back
</button>

      <div className="burger-header">
        <h1>🍔 Burger Restaurants</h1>

        <p>
          Select a restaurant to explore delicious burgers
        </p>
      </div>

      <div className="burger-restaurant-grid">

        {restaurants.map((restaurant) => (
          <div
            key={restaurant.name}
            className="burger-restaurant-card"
            onClick={() =>
              handleRestaurantClick(restaurant.name)
            }
          >

            <div className="burger-restaurant-icon">
              {restaurant.icon}
            </div>

            <h2>
              {restaurant.name}
            </h2>

            <p>
              {restaurant.description}
            </p>

            <button type="button">
              VIEW BURGERS →
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}

export default BurgerRestaurants;