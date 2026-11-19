import { Routes, Route } from "react-router-dom";

import CustomerLayout from "./pages/customer/CustomerLayout";

import Home from "./pages/customer/Home";
import Login from "./pages/customer/Login";
import Register from "./pages/customer/Register";
import Profile from "./pages/customer/Profile";
import Menu from "./pages/customer/Menu";
import Restaurants from "./pages/customer/Restaurants";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import MyOrders from "./pages/customer/MyOrders";
import Feedback from "./pages/customer/Feedback";
import TermsAndConditions from "./pages/customer/TermsAndConditions";
import PrivacyPolicy from "./pages/customer/PrivacyPolicy";
import BestSellers from "./pages/customer/BestSellers";

import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/best-sellers" element={<BestSellers />} />

          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditions />}
          />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicy />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;