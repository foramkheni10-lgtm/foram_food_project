// import { useNavigate } from "react-router-dom";
// import "./Home.css";

// function Home() {
//   const navigate = useNavigate();

//   const handleOrderNow = () => {
//     navigate("/register");
//   };

//   return (
//     <div className="home-page">
//       <div className="home-content">
//         <h1>AI Food Management System</h1>

//         <h2>Your Smart AI Food Ordering Assistant</h2>

//         <p>
//           Welcome to our AI-powered food ordering system!
//         </p>

//         <button className="order-button" onClick={handleOrderNow}>
//           Order Now
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Home;

// import { useNavigate } from "react-router-dom";
// import "./Home.css";

// function Home() {
//   const navigate = useNavigate();

//   const handleOrderNow = () => {
//     navigate("/register");
//   };

//   return (
//     <div className="home-page">
//       <div className="home-content">
//         <h1>AI Food Management System</h1>

//         <h2>Your Smart AI Food Ordering Assistant</h2>

//         <p>
//           Welcome to our AI-powered food ordering system!
//         </p>

//         <button
//           type="button"
//           className="order-button"
//           onClick={handleOrderNow}
//         >
//           Order Now
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Home;


import { useNavigate } from "react-router-dom";
import "./Home.css";


function Home() {

  const navigate = useNavigate();


  const handleOrderNow = () => {

    navigate("/register");

  };


  return (

    <div className="home-page">

      <div className="home-content">

        <h1>
          AI Food Management System
        </h1>

        <h2>
          Your Smart AI Food Ordering Assistant
        </h2>

        <p>
          Welcome to our AI-powered food ordering system!
        </p>

        <button
          className="order-button"
          onClick={handleOrderNow}
        >
          Order Now
        </button>

      </div>

    </div>

  );
}


export default Home;