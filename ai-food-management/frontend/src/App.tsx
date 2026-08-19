// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <section id="center">
//         <div className="hero">
//           <img src={heroImg} className="base" width="170" height="179" alt="" />
//           <img src={reactLogo} className="framework" alt="React logo" />
//           <img src={viteLogo} className="vite" alt="Vite logo" />
//         </div>
//         <div>
//           <h1>Get started</h1>
//           <p>
//             Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
//           </p>
//         </div>
//         <button
//           type="button"
//           className="counter"
//           onClick={() => setCount((count) => count + 1)}
//         >
//           Count is {count}
//         </button>
//       </section>

//       <div className="ticks"></div>

//       <section id="next-steps">
//         <div id="docs">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#documentation-icon"></use>
//           </svg>
//           <h2>Documentation</h2>
//           <p>Your questions, answered</p>
//           <ul>
//             <li>
//               <a href="https://vite.dev/" target="_blank">
//                 <img className="logo" src={viteLogo} alt="" />
//                 Explore Vite
//               </a>
//             </li>
//             <li>
//               <a href="https://react.dev/" target="_blank">
//                 <img className="button-icon" src={reactLogo} alt="" />
//                 Learn more
//               </a>
//             </li>
//           </ul>
//         </div>
//         <div id="social">
//           <svg className="icon" role="presentation" aria-hidden="true">
//             <use href="/icons.svg#social-icon"></use>
//           </svg>
//           <h2>Connect with us</h2>
//           <p>Join the Vite community</p>
//           <ul>
//             <li>
//               <a href="https://github.com/vitejs/vite" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#github-icon"></use>
//                 </svg>
//                 GitHub
//               </a>
//             </li>
//             <li>
//               <a href="https://chat.vite.dev/" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#discord-icon"></use>
//                 </svg>
//                 Discord
//               </a>
//             </li>
//             <li>
//               <a href="https://x.com/vite_js" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#x-icon"></use>
//                 </svg>
//                 X.com
//               </a>
//             </li>
//             <li>
//               <a href="https://bsky.app/profile/vite.dev" target="_blank">
//                 <svg
//                   className="button-icon"
//                   role="presentation"
//                   aria-hidden="true"
//                 >
//                   <use href="/icons.svg#bluesky-icon"></use>
//                 </svg>
//                 Bluesky
//               </a>
//             </li>
//           </ul>
//         </div>
//       </section>

//       <div className="ticks"></div>
//       <section id="spacer"></section>
//     </>
//   )
// }

// export default App


// import { useNavigate } from "react-router-dom";
// import "./App.css";

// function App() {
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

// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";

// function Register() {
//   return (
//     <div>
//       <h1>Registration Page</h1>
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />

//         <Route
//           path="/register"
//           element={<Register />}
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";

// function Register() {
//   return (
//     <div>
//       <h1>Registration Page</h1>
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/register" element={<Register />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Home from "./pages/Home";
// import Register from "./pages/Register";

// function Login() {
//   return (
//     <div>
//       <h1>Login Page</h1>
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>

//       <Routes>

//         {/* Home */}
//         <Route path="/" element={<Home />} />

//         {/* Registration */}
//         <Route path="/register" element={<Register />} />

//         {/* Login - temporary for now */}
//         <Route path="/login" element={<Login />} />

//       </Routes>

//     </BrowserRouter>
//   );
// }

// export default App;


// import { Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
// import Register from "./pages/Register";


// function Login() {
//   return (
//     <div>
//       <h1>Login Page</h1>
//     </div>
//   );
// }


// function App() {
//   return (
//     <Routes>

//       {/* Home Page */}
//       <Route
//         path="/"
//         element={<Home />}
//       />

//       {/* Registration Page */}
//       <Route
//         path="/register"
//         element={<Register />}
//       />

//       {/* Login Page */}
//       <Route
//         path="/login"
//         element={<Login />}
//       />

//     </Routes>
//   );
// }


// export default App;

// import { Routes, Route } from "react-router-dom";

// import Browse from "./pages/Browse";
// import Home from "./pages/Home";
// import Register from "./pages/Register";
// import Login from "./pages/Login";


// function App() {

//   return (

//     <Routes>

//       {/* Home */}

//       <Route
//         path="/"
//         element={<Home />}
//       />


//       {/* Registration */}

//       <Route
//         path="/register"
//         element={<Register />}
//       />


//       {/* Login */}

//       <Route
//         path="/login"
//         element={<Login />}
//       />

//     </Routes>

//   );

// }


// export default App;


// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Home from "./pages/Home";
// import Browse from "./pages/Browse";
// import Login from "./pages/Login";

// function Register() {
//   return (
//     <div>
//       <h1>Registration Page</h1>
//     </div>
//   );
// }

// function App() {
//   return (
//     <BrowserRouter>

//       <Routes>

//         {/* Home */}
//         <Route
//           path="/"
//           element={<Home />}
//         />

//         {/* Registration */}
//         <Route
//           path="/register"
//           element={<Register />}
//         />

//         {/* Login */}
//         <Route
//           path="/login"
//           element={<Login />}
//         />

//         {/* Browse */}
//         <Route
//           path="/browse"
//           element={<Browse />}
//         />

//       </Routes>

//     </BrowserRouter>
//   );
// }

// export default App;

import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Browse from "./pages/Browse";
import PizzaRestaurants from "./pages/PizzaRestaurants";
import PizzaMenu from "./pages/PizzaMenu";
import PizzaIngredients from "./pages/PizzaIngredients";
import BurgerRestaurants from "./pages/BurgerRestaurants";
import BurgerMenu from "./pages/BurgerMenu";
import BurgerIngredients from "./pages/BurgerIngredients";
import Cart from "./pages/Cart";

function App() {
  return (
    <Routes>

      {/* Home Page */}
      <Route
        path="/"
        element={<Home />}
      />

      {/* Registration Page */}
      <Route
        path="/register"
        element={<Register />}
      />

      {/* Login Page */}
      <Route
        path="/login"
        element={<Login />}
      />

      {/* Browse Page */}
      <Route
        path="/browse"
        element={<Browse />}
      />

<Route
  path="/pizza-restaurants"
  element={<PizzaRestaurants />}
/>

<Route
  path="/pizza-menu"
  element={<PizzaMenu />}
/>

<Route
  path="/pizza-ingredients"
  element={<PizzaIngredients />}
/>

<Route
  path="/burger-restaurants"
  element={<BurgerRestaurants />}
/>

<Route
  path="/burger-menu"
  element={<BurgerMenu />}
/>

<Route
  path="/burger-ingredients"
  element={<BurgerIngredients />}
/>

<Route
  path="/cart"
  element={<Cart />}
/>
    </Routes>



  );
}

export default App;