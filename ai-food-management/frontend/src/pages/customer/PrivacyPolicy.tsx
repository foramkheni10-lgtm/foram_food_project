
import { Link } from "react-router-dom";
import "./Policy.css";

function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <div className="policy-card">
        <span className="policy-label">SMART FOODCOURT</span>
        <h1>Privacy Policy</h1>
        <p className="policy-updated">Last updated: November 2026</p>

        <p>
          Smart FoodCourt respects your privacy. This policy explains
          how we collect, use and protect your personal information
          when you use our platform.
        </p>

        <h2>1. Information We Collect</h2>
        <p>
          We may collect your full name, email address, mobile number,
          password (stored in hashed form), delivery address and
          order-related information.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>
          Your information is used to create and manage your account,
          process food orders, arrange delivery, communicate order
          updates and improve our services.
        </p>

        <h2>3. Password Security</h2>
        <p>
          Account passwords are stored in hashed form. Customers
          should never share their passwords with others.
        </p>

        <h2>4. Delivery Information</h2>
        <p>
          Delivery address and contact details are used when necessary
          to process and deliver customer orders.
        </p>

        <h2>5. Information Sharing</h2>
        <p>
          Relevant order and delivery information may be shared with
          participating restaurants and delivery providers when needed
          to fulfil an order.
        </p>

        <h2>6. Data Security</h2>
        <p>
          We take reasonable measures to protect customer information
          against unauthorized access, alteration or disclosure.
        </p>

        <h2>7. Your Choices</h2>
        <p>
          Customers can request updates to their personal information
          and may request account deletion, subject to applicable
          legal and record-retention requirements.
        </p>

        <h2>8. Policy Updates</h2>
        <p>
          This Privacy Policy may be updated as our services evolve.
          Changes will be published on this page.
        </p>

        <h2>9. Contact</h2>
        <p>
          For questions about your personal information, contact
          the Smart FoodCourt support team through the available
          support channels.
        </p>

        <Link to="/register" className="policy-back-button">
          Back to Registration
        </Link>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
