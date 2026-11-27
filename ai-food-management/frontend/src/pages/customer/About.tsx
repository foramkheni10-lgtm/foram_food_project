
import {
  ShoppingBag,
  ChefHat,
  Truck,
  BrainCircuit,
  BarChart3,
  Users,
  Target,
  Eye,
  Heart,
  Utensils,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import "./About.css";

const features = [
  {
    icon: <ShoppingBag />,
    title: "Easy Food Ordering",
    description:
      "Browse restaurants, explore menus and order your favourite food easily.",
  },
  {
    icon: <ChefHat />,
    title: "Smart Kitchen Management",
    description:
      "Manage kitchen orders, food preparation, tokens and order status efficiently.",
  },
  {
    icon: <Truck />,
    title: "Live Delivery Tracking",
    description:
      "Track delivery progress and view the delivery person's latest location.",
  },
  {
    icon: <BrainCircuit />,
    title: "AI-Powered Recommendations",
    description:
      "Get intelligent food suggestions and business insights using AI.",
  },
  {
    icon: <BarChart3 />,
    title: "Business Analytics",
    description:
      "Monitor sales, popular foods, peak hours and restaurant performance.",
  },
  {
    icon: <ShieldCheck />,
    title: "Inventory Management",
    description:
      "Manage ingredients, stock levels, suppliers and low-stock information.",
  },
];

const team = [
  {
    number: "01",
    title: "Customer & Customer AI",
    description: "Customer registration, food browsing, ordering and AI recommendations.",
  },
  {
    number: "02",
    title: "Restaurant & Menu Management",
    description: "Restaurant profiles, food menus, pricing and offers.",
  },
  {
    number: "03",
    title: "Kitchen & Inventory Management",
    description: "Kitchen operations, stock, suppliers and inventory management.",
  },
  {
    number: "04",
    title: "Orders, Delivery & Admin",
    description: "Order management, delivery tracking, analytics and business AI.",
  },
];

function About() {
  return (
    <div className="about-page">

      {/* HERO SECTION */}
      <motion.section
  className="about-hero"
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
        <div className="about-hero-content">
          <span className="about-label">WELCOME TO SMART FOODCOURT</span>

          <h1>
            Making Food Management
            <span> Smarter & Easier</span>
          </h1>

          <p>
            A smart, AI-powered food management platform that connects
            customers, restaurants, kitchens and delivery services in
            one convenient system.
          </p>

          <a href="#about-story" className="about-hero-btn">
            Discover Our Story
          </a>
        </div>

        <div className="about-hero-icon">
          <motion.div
  className="about-food-circle"
  animate={{ y: [0, -12, 0] }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  }}
>
            <Utensils size={85} strokeWidth={1.5} />
            <span>Smart FoodCourt</span>
</motion.div>       
 </div>
</motion.section>
      {/* WHO WE ARE */}
      <section className="about-story" id="about-story">
        <div className="about-section-heading">
          <span>WHO WE ARE</span>
          <h2>About Smart FoodCourt</h2>
          <p>Technology and food come together to create a smarter experience.</p>
        </div>

        <div className="about-story-content">
          <div className="about-story-icon">
            <ShoppingBag size={75} />
          </div>

          <div>
            <h3>A Complete Food Management Solution</h3>
            <p>
              Smart FoodCourt is an AI-powered food management system
              designed to simplify the complete food ordering and
              restaurant management process.
            </p>
            <p>
              Our platform brings customers, restaurants, kitchen staff,
              delivery services and administrators together. It helps
              customers order food conveniently while allowing restaurants
              to manage orders, menus, inventory and business activities.
            </p>
            <p>
              By integrating artificial intelligence and modern technology,
              Smart FoodCourt aims to make food management more efficient,
              organized and user-friendly.
            </p>
          </div>
        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="about-mission">
        <div className="about-section-heading">
          <span>OUR PURPOSE</span>
          <h2>Mission & Vision</h2>
        </div>

        <div className="about-purpose-grid">
          <div className="about-purpose-card">
            <div className="about-purpose-icon">
              <Target size={32} />
            </div>
            <h3>Our Mission</h3>
            <p>
              To provide a simple and intelligent food management
              platform that improves food ordering, restaurant operations,
              kitchen coordination and delivery management.
            </p>
          </div>

          <div className="about-purpose-card">
            <div className="about-purpose-icon">
              <Eye size={32} />
            </div>
            <h3>Our Vision</h3>
            <p>
              To create a smarter food ecosystem where AI and technology
              help businesses make better decisions and provide customers
              with a convenient food experience.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="about-features">
        <div className="about-section-heading">
          <span>WHAT WE OFFER</span>
          <h2>Our Smart Features</h2>
          <p>Everything needed to manage a modern food court in one platform.</p>
        </div>

        <div className="about-feature-grid">
          {features.map((feature, index) => (
            <div className="about-feature-card" key={index}>
              <div className="about-feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="about-why">
        <div className="about-section-heading">
          <span>OUR ADVANTAGES</span>
          <h2>Why Choose Smart FoodCourt?</h2>
        </div>

        <div className="about-why-grid">
          <div>
            <Clock />
            <h3>Save Time</h3>
            <p>Make food ordering and management more convenient.</p>
          </div>

          <div>
            <BrainCircuit />
            <h3>AI-Powered Insights</h3>
            <p>Use intelligent predictions and recommendations.</p>
          </div>

          <div>
            <Heart />
            <h3>Customer Friendly</h3>
            <p>Enjoy a simple and smooth food ordering experience.</p>
          </div>

          <div>
            <Users />
            <h3>Connected System</h3>
            <p>Bring customers, restaurants and delivery teams together.</p>
          </div>
        </div>
      </section>

      {/* OUR TEAM */}
      <section className="about-team">
        <div className="about-section-heading">
          <span>MEET OUR TEAM</span>
          <h2>Four Members, One Vision</h2>
          <p>Working together to build a smarter food management system.</p>
        </div>

        <div className="about-team-grid">
          {team.map((member) => (
            <div className="about-team-card" key={member.number}>
              <div className="about-team-number">{member.number}</div>
              <h3>{member.title}</h3>
              <p>{member.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="about-cta">
        <h2>Experience the Future of Food Management</h2>
        <p>
          Smart technology, better management and a convenient food experience.
        </p>
        <a href="/" className="about-cta-btn">
          Explore Smart FoodCourt
        </a>
      </section>

    </div>
  );
}

export default About;
