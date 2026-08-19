import { useNavigate } from "react-router-dom";
import "./PizzaRestaurants.css";

function PizzaRestaurants() {

  const navigate = useNavigate();
    const handleBack = () => {
  navigate(-1);
};

//   const handleBack = () => {
//   navigate(-1);
// };

  const restaurants = [
    {
      id: 1,
      name: "La Pino'z Pizza",
      location: "Food Court - Ground Floor",
      image: "🍕",
    },
    {
      id: 2,
      name: "Domino's Pizza",
      location: "Food Court - First Floor",
      image: "🍕",
    },
    {
      id: 3,
      name: "Food Corner",
      location: "Food Court - Ground Floor",
      image: "🍕",
    },
  ];

  const selectRestaurant = (restaurant: any) => {

    navigate("/pizza-menu", {
      state: {
        restaurant: restaurant,
      },
    });

  };

  return (

    <div className="pizza-restaurants-page">
        {/* BACK BUTTON */}
    <button
  type="button"
  className="back-button"
  onClick={handleBack}
>
  ← Back
</button>

      <div className="pizza-header">

        <h1>
          🍕 Pizza Restaurants
        </h1>

        <p>
          Choose a restaurant for your pizza
        </p>

      </div>


      <div className="restaurant-grid">

        {restaurants.map((restaurant) => (

          <button
            key={restaurant.id}
            className="restaurant-card"
            onClick={() => selectRestaurant(restaurant)}
          >

            <div className="restaurant-icon">
              {restaurant.image}
            </div>

            <h2>
              {restaurant.name}
            </h2>

            <p>
              📍 {restaurant.location}
            </p>

            <span className="view-menu">
              View Pizza Menu →
            </span>

          </button>

        ))}

      </div>

    </div>

  );
}

export default PizzaRestaurants;