    // import { useState } from "react";
    // import { useNavigate } from "react-router-dom";

    // import "./Login.css";


    // function Login() {

    //   const navigate = useNavigate();

    //   const [email, setEmail] = useState("");
    //   const [password, setPassword] = useState("");

    //   const [loading, setLoading] = useState(false);


    //   // -------------------------------------------------
    //   // AI Voice Greeting
    //   // -------------------------------------------------

    //   const speakGreeting = (customerName: string) => {

    //     const speech = new SpeechSynthesisUtterance(
    //       `Welcome ${customerName}`
    //     );

    //     speech.rate = 0.9;
    //     speech.pitch = 1;

    //     window.speechSynthesis.cancel();

    //     window.speechSynthesis.speak(speech);
    //   };


    //   // -------------------------------------------------
    //   // Login
    //   // -------------------------------------------------

    //   const handleLogin = async (
    //     event: React.FormEvent<HTMLFormElement>
    //   ) => {

    //     event.preventDefault();

    //     setLoading(true);


    //     try {

    //       const response = await fetch(
    //         "http://127.0.0.1:8000/customer/login",
    //         {
    //           method: "POST",

    //           headers: {
    //             "Content-Type": "application/json",
    //           },

    //           body: JSON.stringify({
    //             email: email,
    //             password: password,
    //           }),
    //         }
    //       );


    //       const data = await response.json();


    //       // -------------------------------------------------
    //       // Login failed
    //       // -------------------------------------------------

    //       if (!response.ok) {

    //         alert(
    //           data.detail || "Invalid email or password"
    //         );

    //         return;
    //       }


    //       // -------------------------------------------------
    //       // Login successful
    //       // -------------------------------------------------

    //       alert("Login successful!");

    //       // AI speaks customer's name
    //       speakGreeting(data.customer_name);


    //     } catch (error) {

    //       console.error(
    //         "Login error:",
    //         error
    //       );

    //       alert(
    //         "Unable to connect to server. Please make sure backend is running."
    //       );

    //     } finally {

    //       setLoading(false);

    //     }

    //   };


    //   return (

    //     <div className="login-page">

    //       <div className="login-container">

    //         <h1>
    //           Customer Login
    //         </h1>

    //         <p>
    //           Login to continue your food order
    //         </p>


    //         <form onSubmit={handleLogin}>

    //           {/* Email */}

    //           <label>
    //             Email
    //           </label>

    //           <input
    //             type="email"
    //             value={email}
    //             onChange={(event) =>
    //               setEmail(event.target.value)
    //             }
    //             placeholder="Enter your email"
    //             required
    //           />


    //           {/* Password */}

    //           <label>
    //             Password
    //           </label>

    //           <input
    //             type="password"
    //             value={password}
    //             onChange={(event) =>
    //               setPassword(event.target.value)
    //             }
    //             placeholder="Enter your password"
    //             required
    //           />


    //           {/* Login button */}

    //           <button
    //             type="submit"
    //             disabled={loading}
    //           >

    //             {loading
    //               ? "LOGGING IN..."
    //               : "LOGIN"
    //             }

    //           </button>

    //         </form>


    //         <div className="register-link">

    //           <span>
    //             Don't have an account?
    //           </span>

    //           {/* <button
    //             type="button"
    //             onClick={() => navigate("/register")}
    //           >
    //             Register Now
    //           </button> */}

    //           <button
    //   type="button"
    //   onClick={() => {
    //     const speech = new SpeechSynthesisUtterance("Welcome Drashti");
    //     speech.lang = "en-US";
    //     speech.rate = 0.9;
    //     speech.volume = 1;
    //     window.speechSynthesis.cancel();
    //     window.speechSynthesis.speak(speech);
    //   }}    
    // >
    //   {/* 🔊 Test Voice */}
    // </button>

    //         </div>

    //       </div>

    //     </div>

    //   );
    // }


    // export default Login;

//     import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// import "./Login.css";

// function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);

//   // -------------------------------------------------
//   // AI Voice Greeting
//   // -------------------------------------------------

//   const speakGreeting = (customerName: string) => {
// //     const speech = new SpeechSynthesisUtterance(
// //       `Welcome ${customerName}`
// //     );

// //     speech.lang = "en-US";
// //     speech.rate = 0.9;
// //     speech.pitch = 1;
// //     speech.volume = 1;

// //     // Stop any previous speech
// //     window.speechSynthesis.cancel();

// //     // Speak greeting
// //     window.speechSynthesis.speak(speech);
// //   };

//   // -------------------------------------------------
//   // Login
//   // -------------------------------------------------

//   const handleLogin = async (
//     event: React.FormEvent<HTMLFormElement>
//   ) => {
//     event.preventDefault();

//     setLoading(true);

//     try {
//       const response = await fetch(
//         "http://127.0.0.1:8000/customer/login",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type": "application/json",
//           },

//           body: JSON.stringify({
//             email: email,
//             password: password,
//           }),
//         }
//       );

//       const data = await response.json();

//       // -------------------------------------------------
//       // Login failed
//       // -------------------------------------------------

//       if (!response.ok) {
//         alert(
//           data.detail || "Invalid email or password"
//         );

//         return;
//       }

//       // -------------------------------------------------
//       // Login successful
//       // -------------------------------------------------

//       alert("Login successful!");

//       // AI speaks customer's name
//       if (data.customer_name) {
//         speakGreeting(data.customer_name);
//       } else {
//         console.error(
//           "Customer name was not returned by backend."
//         );
//       }

//     } catch (error) {
//       console.error(
//         "Login error:",
//         error
//       );

//       alert(
//         "Unable to connect to server. Please make sure backend is running."
//       );

//     } finally {
//       setLoading(false);
//     }
//   };

//   // -------------------------------------------------
//   // Open Registration Page
//   // -------------------------------------------------

//   const handleRegister = () => {
//     navigate("/register");
//   };

//   // -------------------------------------------------
//   // Login Page UI
//   // -------------------------------------------------

//   return (
//     <div className="login-page">

//       <div className="login-container">

//         {/* Title */}

//         <h1>
//           Customer Login
//         </h1>

//         <p>
//           Login to continue your food order
//         </p>


//         {/* Login Form */}

//         <form onSubmit={handleLogin}>

//           {/* Email */}

//           <label>
//             Email
//           </label>

//           <input
//             type="email"
//             value={email}
//             onChange={(event) =>
//               setEmail(event.target.value)
//             }
//             placeholder="Enter your email"
//             required
//           />


//           {/* Password */}

//           <label>
//             Password
//           </label>

//           <input
//             type="password"
//             value={password}
//             onChange={(event) =>
//               setPassword(event.target.value)
//             }
//             placeholder="Enter your password"
//             required
//           />


//           {/* Login Button */}

//           <button
//             type="submit"
//             disabled={loading}
//           >
//             {loading
//               ? "LOGGING IN..."
//               : "LOGIN"
//             }
//           </button>

//         </form>


//         {/* Registration Link */}

//         <div className="register-link">

//           <span>
//             Don't have an account?
//           </span>

//           <button
//             type="button"
//             onClick={handleRegister}
//           >
//             Register Now
//           </button>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Login;


import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // -------------------------------------------------
  // Login
  // -------------------------------------------------

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/customer/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      );

      const data = await response.json();

      // -------------------------------------------------
      // Login failed
      // -------------------------------------------------

      if (!response.ok) {
        alert(
          data.detail || "Invalid email or password"
        );

        return;
      }

      // -------------------------------------------------
      // Login successful
      // -------------------------------------------------

    //   alert("Login successful!");

    //   // Open Browse page
    //   // Send customer name to Browse page
    //   navigate("/browse", {
    //     state: {
    //       customerName: data.customer_name,
    //     },
    //   });


    alert("Login successful!");

if (data.customer_name) {

  // Save customer name
  localStorage.setItem(
    "customer_name",
    data.customer_name
  );

  sessionStorage.removeItem(
  "browse_greeting_played"
);

  // Open Browse page
  navigate("/browse");

}

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure backend is running."
      );

    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // Open Registration Page
  // -------------------------------------------------

  const handleRegister = () => {
    navigate("/register");
  };

  // -------------------------------------------------
  // Login Page UI
  // -------------------------------------------------

  return (
    <div className="login-page">

      <div className="login-container">

        {/* Title */}

        <h1>
          Customer Login
        </h1>

        <p>
          Login to continue your food order
        </p>


        {/* Login Form */}

        <form onSubmit={handleLogin}>

          {/* Email */}

          <label>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="Enter your email"
            required
          />


          {/* Password */}

          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
            required
          />


          {/* Login Button */}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "LOGGING IN..."
              : "LOGIN"
            }
          </button>

        </form>


        {/* Registration Link */}

        <div className="register-link">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={handleRegister}
          >
            Register Now
          </button>

        </div>

      </div>

    </div>
  );
}

export default Login;