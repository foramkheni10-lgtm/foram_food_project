// import { useLocation } from "react-router-dom";
// import "./Browse.css";

// function Browse() {
//   const location = useLocation();

//   const customerName =
//     location.state?.customerName || "Customer";

//   return (
//     <div className="browse-page">

//       {/* Welcome Message */}
//       <div className="welcome-section">
//         <h1>
//           Welcome, {customerName}! 👋
//         </h1>

//         <p>
//           What would you like to eat today?
//         </p>
//       </div>


//       {/* Food Categories */}
//       <div className="category-section">

//         <h2>
//           Browse Food
//         </h2>

//         <div className="category-grid">

//           <button className="category-card">
//             🍕
//             <span>Pizza</span>
//           </button>

//           <button className="category-card">
//             🍔
//             <span>Burger</span>
//           </button>

//           <button className="category-card">
//             🥪
//             <span>Sandwich</span>
//           </button>

//           <button className="category-card">
//             🍜
//             <span>Chinese</span>
//           </button>

//           <button className="category-card">
//             🥤
//             <span>Drinks</span>
//           </button>

//           <button className="category-card">
//             🍰
//             <span>Dessert</span>
//           </button>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Browse;

// import { useEffect } from "react";
// import "./Browse.css";

// function Browse() {

//   // -------------------------------------------------
//   // AI Voice Greeting
//   // -------------------------------------------------

//   useEffect(() => {

//     const customerName =
//       localStorage.getItem("customer_name") || "Customer";

//     const greeting = `Welcome ${customerName}! What would you like to eat today?`;

//     const speech = new SpeechSynthesisUtterance(greeting);

//     speech.lang = "en-US";
//     speech.rate = 0.9;
//     speech.pitch = 1;
//     speech.volume = 1;

//     // Stop previous speech
//     window.speechSynthesis.cancel();

//     // Speak greeting
//     window.speechSynthesis.speak(speech);

//   }, []);


//   // -------------------------------------------------
//   // Food Categories
//   // -------------------------------------------------

//   const categories = [
//     {
//       name: "Pizza",
//       icon: "🍕",
//     },
//     {
//       name: "Burger",
//       icon: "🍔",
//     },
//     {
//       name: "Sandwich",
//       icon: "🥪",
//     },
//     {
//       name: "Chinese",
//       icon: "🍜",
//     },
//     {
//       name: "Drinks",
//       icon: "🥤",
//     },
//     {
//       name: "Dessert",
//       icon: "🍰",
//     },
//   ];


//   // -------------------------------------------------
//   // Get Customer Name
//   // -------------------------------------------------

//   const customerName =
//     localStorage.getItem("customer_name") || "Customer";


//   // -------------------------------------------------
//   // Page
//   // -------------------------------------------------

//   return (
//     <div className="browse-page">

//       {/* Greeting */}

//       <div className="browse-header">

//         <h1>
//           Welcome {customerName}! 👋
//         </h1>

//         <p>
//           What would you like to eat today?
//         </p>

//       </div>


//       {/* Food Categories */}

//       <h2 className="browse-title">
//         Browse Food
//       </h2>


//       <div className="category-grid">

//         {categories.map((category) => (

//           <div
//             className="category-card"
//             key={category.name}
//           >

//             <div className="category-icon">
//               {category.icon}
//             </div>

//             <h3>
//               {category.name}
//             </h3>

//           </div>

//         ))}

//       </div>

//     </div>
//   );
// }

// export default Browse;


// import { useEffect } from "react";
// import "./Browse.css";

// function Browse() {

//   // -------------------------------------------------
//   // Get Customer Name
//   // -------------------------------------------------

//   const customerName =
//     localStorage.getItem("customer_name") || "Customer";


//   // -------------------------------------------------
//   // AI Voice Greeting
//   // -------------------------------------------------

//   useEffect(() => {

//     const greeting =
//       `Welcome ${customerName}! What would you like to eat today?`;

//     const speech =
//       new SpeechSynthesisUtterance(greeting);

//     speech.lang = "en-US";
//     speech.rate = 0.9;
//     speech.pitch = 1;
//     speech.volume = 1;

//     // Stop previous speech
//     window.speechSynthesis.cancel();

//     // Speak greeting
//     window.speechSynthesis.speak(speech);

//   }, [customerName]);


//   // -------------------------------------------------
//   // Food Categories
//   // -------------------------------------------------

//   const categories = [
//     {
//       name: "Pizza",
//       icon: "🍕",
//     },

//     {
//       name: "Burger",
//       icon: "🍔",
//     },

//     {
//       name: "Sandwich",
//       icon: "🥪",
//     },

//     {
//       name: "Chinese",
//       icon: "🍜",
//     },

//     {
//       name: "Drinks",
//       icon: "🥤",
//     },

//     {
//       name: "Dessert",
//       icon: "🍰",
//     },
//   ];


//   // -------------------------------------------------
//   // Browse Page
//   // -------------------------------------------------

//   return (

//     <div className="browse-page">

//       {/* ------------------------------------------- */}
//       {/* Welcome Message */}
//       {/* ------------------------------------------- */}

//       <div className="welcome-section">

//         <h1>
//           Welcome {customerName}! 👋
//         </h1>

//         <p>
//           What would you like to eat today?
//         </p>

//       </div>


//       {/* ------------------------------------------- */}
//       {/* Browse Food */}
//       {/* ------------------------------------------- */}

//       <div className="category-section">

//         <h2>
//           Browse Food
//         </h2>


//         <div className="category-grid">

//           {categories.map((category) => (

//             // <button
//             //   className="category-card"
//             //   key={category.name}
//             //   type="button"
//             // >
//                 <button
//             className="category-card"
//             key={category.name}
//             type="button"
//             onClick={() => {

//     if (category.name === "Pizza") {
//       navigate("/pizza-restaurants");
//     }

//   }}
// >

//               <div className="category-icon">
//                 {category.icon}
//               </div>

//               <span>
//                 {category.name}
//               </span>

//             </button>

//           ))}

//         </div>

//       </div>

//     </div>

//   );
// }

// export default Browse;


// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// import "./Browse.css";

// function Browse() {
//   const navigate = useNavigate();

//   // -------------------------------------------------
//   // Get Customer Name
//   // -------------------------------------------------

//   const customerName =
//     localStorage.getItem("customer_name") || "Customer";


//   // -------------------------------------------------
//   // AI Voice Greeting
//   // -------------------------------------------------

//   useEffect(() => {
//     const greeting =
//       `Welcome ${customerName}! What would you like to eat today?`;

//     const speech =
//       new SpeechSynthesisUtterance(greeting);

//     speech.lang = "en-US";
//     speech.rate = 0.9;
//     speech.pitch = 1;
//     speech.volume = 1;

//     // Stop any previous speech
//     window.speechSynthesis.cancel();

//     // Speak greeting
//     window.speechSynthesis.speak(speech);

//   }, [customerName]);


//   // -------------------------------------------------
//   // Food Categories
//   // -------------------------------------------------

//   const categories = [
//     {
//       name: "Pizza",
//       icon: "🍕",
//     },
//     {
//       name: "Burger",
//       icon: "🍔",
//     },
//     {
//       name: "Sandwich",
//       icon: "🥪",
//     },
//     {
//       name: "Chinese",
//       icon: "🍜",
//     },
//     {
//       name: "Drinks",
//       icon: "🥤",
//     },
//     {
//       name: "Dessert",
//       icon: "🍰",
//     },
//   ];


//   // -------------------------------------------------
//   // Category Click
//   // -------------------------------------------------

//   const handleCategoryClick = (categoryName: string) => {

//     // Pizza
//     if (categoryName === "Pizza") {
//       navigate("/pizza-restaurants");
//       return;
//     }

//     // Other categories - coming soon
//     alert(
//       `${categoryName} section will be available soon!`
//     );
//   };


//   // -------------------------------------------------
//   // Browse Page
//   // -------------------------------------------------

//   return (
//     <div className="browse-page">

//       {/* ------------------------------------------- */}
//       {/* Welcome Section */}
//       {/* ------------------------------------------- */}

//       <div className="welcome-section">

//         <h1>
//           Welcome {customerName}! 👋
//         </h1>

//         <p>
//           What would you like to eat today?
//         </p>

//       </div>


//       {/* ------------------------------------------- */}
//       {/* Food Categories */}
//       {/* ------------------------------------------- */}

//       <div className="category-section">

//         <h2>
//           Browse Food
//         </h2>


//         <div className="category-grid">

//           {categories.map((category) => (

//             <button
//               key={category.name}
//               type="button"
//               className="category-card"
//               onClick={() =>
//                 handleCategoryClick(category.name)
//               }
//             >

//               <div className="category-icon">
//                 {category.icon}
//               </div>

//               <span>
//                 {category.name}
//               </span>

//             </button>

//           ))}

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Browse;  

// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// import "./Browse.css";

// function Browse() {
//   const navigate = useNavigate();

//   // -------------------------------------------------
//   // Get Customer Name
//   // -------------------------------------------------

//   const customerName =
//     localStorage.getItem("customer_name") || "Customer";


//   // -------------------------------------------------
//   // AI Voice Greeting - ONLY ONCE
//   // -------------------------------------------------

//   useEffect(() => {

//     // This key remembers whether greeting was already spoken
//     const greetingPlayed =
//       sessionStorage.getItem("browse_greeting_played");

//     // If already spoken, don't speak again
//     if (greetingPlayed === "true") {
//       return;
//     }

//     // Mark greeting as played
//     sessionStorage.setItem(
//       "browse_greeting_played",
//       "true"
//     );

//     const greeting =
//       `Welcome ${customerName}! What would you like to eat today?`;

//     const speech =
//       new SpeechSynthesisUtterance(greeting);

//     speech.lang = "en-US";
//     speech.rate = 0.9;
//     speech.pitch = 1;
//     speech.volume = 1;

//     // Stop previous speech
//     window.speechSynthesis.cancel();

//     // Speak greeting
//     window.speechSynthesis.speak(speech);

//   }, [customerName]);


//   // -------------------------------------------------
//   // Food Categories
//   // -------------------------------------------------

//   const categories = [
//     {
//       name: "Pizza",
//       icon: "🍕",
//     },
//     {
//       name: "Burger",
//       icon: "🍔",
//     },
//     {
//       name: "Sandwich",
//       icon: "🥪",
//     },
//     {
//       name: "Chinese",
//       icon: "🍜",
//     },
//     {
//       name: "Drinks",
//       icon: "🥤",
//     },
//     {
//       name: "Dessert",
//       icon: "🍰",
//     },
//   ];


//   // -------------------------------------------------
//   // Category Click
//   // -------------------------------------------------

//   // const handleCategoryClick = (
//   //   categoryName: string
//   // ) => {

//   //   if (categoryName === "Pizza") {

//   //     navigate("/pizza-restaurants");

//   //     return;
//   //   }

//     const handleCategoryClick = (categoryName: string) => {
//   navigate(
//     `/food-restaurants/${categoryName.toLowerCase()}`
//   );
// };


//   //   // Other categories
//   //   alert(
//   //     `${categoryName} section will be available soon!`
//   //   );
//   // };


//   // -------------------------------------------------
//   // Browse Page
//   // -------------------------------------------------

//   return (
//     <div className="browse-page">

//       {/* ------------------------------------------- */}
//       {/* Welcome Section */}
//       {/* ------------------------------------------- */}

//       <div className="welcome-section">

//         <h1>
//           Welcome {customerName}! 👋
//         </h1>

//         <p>
//           What would you like to eat today?
//         </p>

//       </div>


//       {/* ------------------------------------------- */}
//       {/* Food Categories */}
//       {/* ------------------------------------------- */}

//       <div className="category-section">

//         <h2>
//           Browse Food
//         </h2>


//         <div className="category-grid">

//           {categories.map((category) => (

//             <button
//               key={category.name}
//               type="button"
//               className="category-card"
//               onClick={() =>
//                 handleCategoryClick(
//                   category.name
//                 )
//               }
//             >

//               <div className="category-icon">
//                 {category.icon}
//               </div>

//               <span>
//                 {category.name}
//               </span>

//             </button>

//           ))}

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Browse;


// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// import "./Browse.css";

// function Browse() {
//   const navigate = useNavigate();

//   // -------------------------------------------------
//   // Get Customer Name
//   // -------------------------------------------------

//   const customerName =
//     localStorage.getItem("customer_name") || "Customer";


//   // -------------------------------------------------
//   // AI Voice Greeting - ONLY FIRST TIME
//   // -------------------------------------------------

//   useEffect(() => {
//     const greetingPlayed =
//       sessionStorage.getItem("browse_greeting_played");

//     // Don't speak again when coming back from another page
//     if (greetingPlayed === "true") {
//       return;
//     }

//     // Remember that greeting has been played
//     sessionStorage.setItem(
//       "browse_greeting_played",
//       "true"
//     );

//     const greeting =
//       `Welcome ${customerName}! What would you like to eat today?`;

//     const speech =
//       new SpeechSynthesisUtterance(greeting);

//     speech.lang = "en-US";
//     speech.rate = 0.9;
//     speech.pitch = 1;
//     speech.volume = 1;

//     window.speechSynthesis.cancel();
//     window.speechSynthesis.speak(speech);

//   }, [customerName]);


//   // -------------------------------------------------
//   // Food Categories
//   // -------------------------------------------------

//   const categories = [
//     {
//       name: "Pizza",
//       icon: "🍕",
//       path: "/pizza-restaurants",
//     },
//     {
//       name: "Burger",
//       icon: "🍔",
//       path: "/burger-restaurants",
//     },
//     {
//       name: "Sandwich",
//       icon: "🥪",
//       path: "/sandwich-restaurants",
//     },
//     {
//       name: "Chinese",
//       icon: "🍜",
//       path: "/chinese-restaurants",
//     },
//     {
//       name: "Drinks",
//       icon: "🥤",
//       path: "/drinks-restaurants",
//     },
//     {
//       name: "Dessert",
//       icon: "🍰",
//       path: "/dessert-restaurants",
//     },
//   ];


//   // -------------------------------------------------
//   // Category Click
//   // -------------------------------------------------

//   const handleCategoryClick = (
//     categoryName: string,
//     path: string
//   ) => {

//     // Pizza
//     if (categoryName === "Pizza") {
//       navigate(path);
//       return;
//     }

//     // Burger
//     if (categoryName === "Burger") {
//       navigate(path);
//       return;
//     }

//     // Other categories
//     if (
//       categoryName === "Sandwich" ||
//       categoryName === "Chinese" ||
//       categoryName === "Drinks" ||
//       categoryName === "Dessert"
//     ) {
//       alert(
//         `${categoryName} section will be available soon!`
//       );

//       // Later you can create their pages
//       // and simply remove this alert.
//       return;
//     }
//   };


//   // -------------------------------------------------
//   // Browse Page UI
//   // -------------------------------------------------

//   return (
//     <div className="browse-page">

//       {/* Welcome Section */}

//       <div className="welcome-section">

//         <h1>
//           Welcome {customerName}! 👋
//         </h1>

//         <p>
//           What would you like to eat today?
//         </p>

//       </div>


//       {/* Food Categories */}

//       <div className="category-section">

//         <h2>
//           Browse Food
//         </h2>


//         <div className="category-grid">

//           {categories.map((category) => (

//             <button
//               key={category.name}
//               type="button"
//               className="category-card"

//               onClick={() =>
//                 handleCategoryClick(
//                   category.name,
//                   category.path
//                 )
//               }
//             >

//               <div className="category-icon">
//                 {category.icon}
//               </div>

//               <span>
//                 {category.name}
//               </span>

//             </button>

//           ))}

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Browse;


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./Browse.css";

function Browse() {
  const navigate = useNavigate();

  // -------------------------------------------------
  // Get Customer Name
  // -------------------------------------------------

  const customerName =
    localStorage.getItem("customer_name") || "Customer";


  // -------------------------------------------------
  // AI Voice Greeting - ONLY FIRST TIME
  // -------------------------------------------------

  useEffect(() => {
    const greetingPlayed =
      sessionStorage.getItem("browse_greeting_played");

    // Don't speak again when coming back from another page
    if (greetingPlayed === "true") {
      return;
    }

    // Remember that greeting has been played
    sessionStorage.setItem(
      "browse_greeting_played",
      "true"
    );

    const greeting =
      `Welcome ${customerName}! What would you like to eat today?`;

    const speech =
      new SpeechSynthesisUtterance(greeting);

    speech.lang = "en-US";
    speech.rate = 0.9;
    speech.pitch = 1;
    speech.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);

  }, [customerName]);


  // -------------------------------------------------
  // Food Categories
  // -------------------------------------------------

  const categories = [
    {
      name: "Pizza",
      icon: "🍕",
      path: "/pizza-restaurants",
    },
    {
      name: "Burger",
      icon: "🍔",
      path: "/burger-restaurants",
    },
    {
      name: "Sandwich",
      icon: "🥪",
      path: "/sandwich-restaurants",
    },
    {
      name: "Chinese",
      icon: "🍜",
      path: "/chinese-restaurants",
    },
    {
      name: "Drinks",
      icon: "🥤",
      path: "/drinks-restaurants",
    },
    {
      name: "Dessert",
      icon: "🍰",
      path: "/dessert-restaurants",
    },
  ];


  // -------------------------------------------------
  // Category Click
  // -------------------------------------------------

  const handleCategoryClick = (
    categoryName: string,
    path: string
  ) => {

    // Pizza
    if (categoryName === "Pizza") {
      navigate(path);
      return;
    }

    // Burger
    if (categoryName === "Burger") {
      navigate(path);
      return;
    }

    // Other categories
    if (
      categoryName === "Sandwich" ||
      categoryName === "Chinese" ||
      categoryName === "Drinks" ||
      categoryName === "Dessert"
    ) {
      alert(
        `${categoryName} section will be available soon!`
      );

      return;
    }
  };


  // -------------------------------------------------
  // Open Cart
  // -------------------------------------------------

  const handleCart = () => {
    navigate("/cart");
  };


  // -------------------------------------------------
  // Browse Page UI
  // -------------------------------------------------

  return (
    <div className="browse-page">

      {/* ------------------------------------------- */}
      {/* Cart Button */}
      {/* ------------------------------------------- */}

      <button
        type="button"
        className="browse-cart-button"
        onClick={handleCart}
      >
        🛒 Cart
      </button>


      {/* ------------------------------------------- */}
      {/* Welcome Section */}
      {/* ------------------------------------------- */}

      <div className="welcome-section">

        <h1>
          Welcome {customerName}! 👋
        </h1>

        <p>
          What would you like to eat today?
        </p>

      </div>


      {/* ------------------------------------------- */}
      {/* Food Categories */}
      {/* ------------------------------------------- */}

      <div className="category-section">

        <h2>
          Browse Food
        </h2>


        <div className="category-grid">

          {categories.map((category) => (

            <button
              key={category.name}
              type="button"
              className="category-card"

              onClick={() =>
                handleCategoryClick(
                  category.name,
                  category.path
                )
              }
            >

              <div className="category-icon">
                {category.icon}
              </div>

              <span>
                {category.name}
              </span>

            </button>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Browse;