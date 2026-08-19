// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Register.css";

// function Register() {
//   const navigate = useNavigate();

//   const [customerName, setCustomerName] = useState("");
//   const [mobileNo, setMobileNo] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       const response = await fetch(
//         "http://127.0.0.1:8000/customer/register",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             customer_name: customerName,
//             mobileno: mobileNo,
//             email: email,
//             password: password,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         alert(data.detail || "Registration failed");
//         return;
//       }

//       alert("Registration successful!");

//       // Open Login Page after registration
//       navigate("/login");

//     } catch (error) {
//       console.error(error);
//       alert("Unable to connect to server");
//     }
//   };

//   return (
//     <div className="register-page">

//       <div className="register-card">

//         <h1>Customer Registration</h1>

//         <p className="register-subtitle">
//           Create your account to start ordering
//         </p>

//         <form onSubmit={handleRegister}>

//           {/* Customer Name */}
//           <div className="form-group">
//             <label>Customer Name</label>

//             <input
//               type="text"
//               placeholder="Enter your name"
//               value={customerName}
//               onChange={(e) => setCustomerName(e.target.value)}
//               required
//             />
//           </div>

//           {/* Mobile Number */}
//           <div className="form-group">
//             <label>Mobile No</label>

//             <input
//               type="tel"
//               placeholder="Enter your mobile number"
//               value={mobileNo}
//               onChange={(e) => setMobileNo(e.target.value)}
//               required
//             />
//           </div>

//           {/* Email */}
//           <div className="form-group">
//             <label>Email</label>

//             <input
//               type="email"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           {/* Password */}
//           <div className="form-group">
//             <label>Password</label>

//             <input
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           {/* Register Button */}
//           <button
//             type="submit"
//             className="register-button"
//           >
//             REGISTER NOW
//           </button>

//         </form>

//         {/* Login */}
//         <div className="login-link">

//           <span>Already registered?</span>

//           <button
//             type="button"
//             onClick={() => navigate("/login")}
//           >
//             Login
//           </button>

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Register;

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Register.css";


function Register() {

  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);


  // -------------------------------------------------
  // Register customer
  // -------------------------------------------------

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setLoading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/customer/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            customer_name: customerName,
            mobileno: mobileNo,
            email: email,
            password: password,
          }),
        }
      );


      const data = await response.json();


      // -------------------------------------------------
      // Registration failed
      // -------------------------------------------------

      if (!response.ok) {

        alert(
          data.detail || "Registration failed"
        );

        return;
      }


      // -------------------------------------------------
      // Registration successful
      // -------------------------------------------------

      alert(
        "Customer registered successfully!"
      );


      // Open Login page
      navigate("/login");

    }

    catch (error) {

      console.error(
        "Registration error:",
        error
      );

      alert(
        "Unable to connect to server. Please make sure the backend is running."
      );

    }

    finally {

      setLoading(false);

    }

  };


  return (

    <div className="register-page">

      <div className="register-container">

        <h1>
          Customer Registration
        </h1>


        <p>
          Create your account to start ordering
        </p>


        <form onSubmit={handleRegister}>


          {/* Customer Name */}

          <label>
            Customer Name
          </label>

          <input
            type="text"
            value={customerName}
            onChange={(event) =>
              setCustomerName(event.target.value)
            }
            placeholder="Enter customer name"
            required
          />


          {/* Mobile Number */}

          <label>
            Mobile No
          </label>

          <input
            type="tel"
            value={mobileNo}
            onChange={(event) =>
              setMobileNo(event.target.value)
            }
            placeholder="Enter mobile number"
            required
          />


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
            placeholder="Enter email"
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
            placeholder="Enter password"
            required
          />


          {/* Register Button */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "REGISTERING..."
              : "REGISTER NOW"
            }

          </button>

        </form>


        {/* Login */}

        <div className="login-link">

          <span>
            Already registered?
          </span>

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

        </div>

      </div>

    </div>

  );
}


export default Register;