
import { Link } from "react-router-dom";
import "./Policy.css";

function TermsAndConditions() {
  return (
    <div className="policy-page">
      <div className="policy-card">
        <span className="policy-label">SMART FOODCOURT</span>
        <h1>Terms & Conditions</h1>
        <p className="policy-updated">Last updated: November 2026</p>

        <p>
          Welcome to Smart FoodCourt. By creating an account or using
          our platform, you agree to the following Terms & Conditions.
        </p>

        <h2>1. Account Registration</h2>
        <p>
          Customers must provide accurate information, including their
          name, email address and mobile number. Customers are responsible
          for maintaining the security of their account credentials.
        </p>

        <h2>2. Food Ordering</h2>
        <p>
          Customers can browse available food items, add products to
          their cart and place orders. Food availability, prices and
          descriptions are subject to change.
        </p>

        <h2>3. Order Types</h2>
        <p>
          Smart FoodCourt may provide delivery, pickup and dine-in
          ordering options depending on restaurant availability.
        </p>

        <h2>4. Payments</h2>
        <p>
          Customers must select an available payment method during
          checkout. Orders are subject to successful payment confirmation
          where online payment is required.
        </p>

        <h2>5. Cancellations and Refunds</h2>
        <p>
          Order cancellation and refund requests are subject to the
          applicable restaurant and platform policies. Any applicable
          charges will be communicated to customers.
        </p>

        <h2>6. Customer Responsibilities</h2>
        <p>
          Customers must provide correct contact and delivery details
          and must not misuse the platform or attempt unauthorized access.
        </p>

        <h2>7. Changes to These Terms</h2>
        <p>
          Smart FoodCourt may update these terms when its services or
          policies change. Updated terms will be published on this page.
        </p>

        <h2>8. Contact</h2>
        <p>
          For questions about these terms, please contact the
          Smart FoodCourt support team through the available support
          channels.
        </p>

        <Link to="/register" className="policy-back-button">
          Back to Registration
        </Link>
      </div>
    </div>
  );
}

export default TermsAndConditions;
