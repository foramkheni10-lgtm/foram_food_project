
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";


interface Restaurant {
  _id: string;
  name?: string;
  description?: string;
  address?: string;
  image?: string;
  logo?: string;
  logo_url?: string;
  logoUrl?: string;
  restaurant_logo?: string;
  status?: string;
  rating?: number;
}

interface RestaurantResponse {
  message: string;
  total: number;
  restaurants: Restaurant[];
}

interface Food {
  _id: string;
  name?: string;
  image?: string;
  category?: string;
  availability?: boolean;
}

interface FoodResponse {
  foods: Food[];
}

interface FoodCategory {
  name: string;
  count: number;
  image?: string;
}
interface CustomerFeedback {
  customer_name?: string;
  rating: number;
  comment?: string;
  created_at?: string;

  profile_image?: string;
  profile_image_url?: string;
  customer_image?: string;
  customer_profile_image?: string;
  avatar?: string;
  avatar_url?: string;
}

interface FeedbackResponse {
  success: boolean;
  total: number;
  feedback: CustomerFeedback[];
}

const heroSlides = [
  { image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=2000&q=85", alt: "Fresh gourmet burger" },
  { image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=2000&q=85", alt: "Freshly baked pizza" },
  { image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=2000&q=85", alt: "Pizza with fresh toppings" },
  { image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=2000&q=85", alt: "Colourful fresh food bowl" },
];

function Home() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);

  const [foodLoading, setFoodLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showIntroLoader, setShowIntroLoader] = useState(true);
  const [customerFeedback, setCustomerFeedback] = useState<CustomerFeedback[]>([]);
const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);

useEffect(() => {
  const section = document.querySelector(".sf-about-stats");

  if (!section) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setStatsVisible(false);

        requestAnimationFrame(() => {
          setStatsVisible(true);
        });
      }
    },
    { threshold: 0.3 }
  );

  observer.observe(section);

  return () => observer.disconnect();
}, []);

  // Automatically change the Hero image every 4 seconds
  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 4000);
    return () => window.clearInterval(slideTimer);
  }, []);

  // Opening animation
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowIntroLoader(false);
    }, 1600);

    return () => window.clearTimeout(timer);
  }, []);

  // Fetch restaurant partners from FastAPI
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/restaurants/");
        if (!response.ok) throw new Error("Unable to fetch restaurants.");
        const data: RestaurantResponse = await response.json();
        setRestaurants(data.restaurants || []);
      } catch (err) {
        console.error("Restaurant fetching error:", err);
      }
    };

    fetchRestaurants();
  }, []);

  // Fetch foods from MongoDB
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/api/foods/"
        );

        if (!response.ok) {
          throw new Error("Unable to fetch foods.");
        }

        const data: FoodResponse = await response.json();

        setFoods(data.foods || []);
      } catch (err) {
        console.error("Food fetching error:", err);
      } finally {
        setFoodLoading(false);
      }
    };

    fetchFoods();
  }, []);
  // Fetch public customer feedback
useEffect(() => {
  const fetchCustomerFeedback = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/feedback/public"
      );

      if (!response.ok) {
        throw new Error("Unable to fetch customer feedback.");
      }

      const data: FeedbackResponse = await response.json();
      setCustomerFeedback(data.feedback || []);
    } catch (error) {
      console.error("Customer feedback error:", error);
    } finally {
      setFeedbackLoading(false);
    }
  };

  fetchCustomerFeedback();
}, []);
  // Generate categories dynamically from available foods
  const categories: FoodCategory[] = Object.values(
    foods
      .filter(
        (food) =>
          food.category?.trim() &&
          food.availability !== false
      )
      .reduce<Record<string, FoodCategory>>((result, food) => {
        const name = food.category!.trim();
        const categoryKey = name.toLowerCase();

        if (!result[categoryKey]) {
          result[categoryKey] = {
            name,
            count: 0,
            image: food.image,
          };
        }

        result[categoryKey].count += 1;

        if (!result[categoryKey].image && food.image) {
          result[categoryKey].image = food.image;
        }

        return result;
      }, {})
  );

  // Show all currently available foods
  const availableFoods = foods.filter(
    (food) => food.availability !== false
  );
  
  // Restaurant names for trusted-partners strip
  const partnerRestaurants = restaurants.slice(0, 8);
  const getCustomerImage = (item: CustomerFeedback) => {
  const image =
    item.profile_image_url ||
    item.profile_image ||
    item.customer_profile_image ||
    item.customer_image ||
    item.avatar_url ||
    item.avatar;

  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  return `http://127.0.0.1:8000/${image.replace(/^\/+/, "")}`;
};
  
  // One scroll-reveal observer for all animated homepage elements
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(
      ".home-page [data-scroll-reveal], .home-page .sf-scroll-reveal"
    );

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => {
        element.classList.add("is-visible", "sf-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible", "sf-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [restaurants.length, foods.length, foodLoading, feedbackLoading]);

  // Search form submit
const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const query = searchQuery.trim();

  if (!query) {
    alert("Please enter a food name to search.");
    return;
  }

  navigate(`/menu?search=${encodeURIComponent(query)}`);
};

  return (
    <div className="home-page">

      {/* OPENING LOADER */}
      {showIntroLoader && (
        <div className="sf-intro-loader">
          <div className="loader-content">
            <img
  src="/images/logo.png"
  alt="Smart FoodCourt"
  className="loader-logo"
/>

            <h2>
              <span>Smart</span> FoodCourt
            </h2>

            <p>Preparing something delicious...</p>

            <div className="loader-track">
              <div className="loader-progress" />
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-food-visual" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <img
              key={slide.image}
              src={slide.image}
              alt=""
              className={`hero-slide-image ${index === activeHeroSlide ? "active" : ""}`}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>

        <div className="hero-overlay" />

        <button
          type="button"
          className="hero-slide-arrow hero-slide-prev"
          aria-label="Previous hero image"
          onClick={() => setActiveHeroSlide((current) => (current - 1 + heroSlides.length) % heroSlides.length)}
        >
          &#10094;
        </button>
        <button
          type="button"
          className="hero-slide-arrow hero-slide-next"
          aria-label="Next hero image"
          onClick={() => setActiveHeroSlide((current) => (current + 1) % heroSlides.length)}
        >
          &#10095;
        </button>

        <div className="hero-slide-dots" aria-label="Choose hero image">
          {heroSlides.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              className={index === activeHeroSlide ? "active" : ""}
              aria-label={`Show hero image ${index + 1}`}
              aria-pressed={index === activeHeroSlide}
              onClick={() => setActiveHeroSlide(index)}
            />
          ))}
        </div>

        <div className="hero-content">
  <span className="hero-tag">
    ✦ THE TASTE OF INDIA
  </span>

  <h1 className="hero-title">
  Every Craving Has a
  <span className="hero-title-highlight"> Delicious Story!</span>
</h1>

  <p>
    Discover amazing restaurants and delicious flavours for every craving.
  </p>

  <form
    className="sf-search hero-search"
    onSubmit={handleSearch}
    role="search"
  >
    <input
      type="search"
      aria-label="Search restaurants and food"
      placeholder="Search for your favourite food or dishes...."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />

    <button type="submit" className="sf-search-submit">
      Search
    </button>
  </form>
</div>
      </section>

      {/* RESTAURANT PARTNERS STRIP */}
      {/* RESTAURANT PARTNERS */}
{partnerRestaurants.length > 0 && (
  
<section className="trusted-section">
 <div className="category-heading trusted-heading" data-scroll-reveal>
  <div className="category-heading-text">
    <span className="category-eyebrow">
      <span className="eyebrow-line" />
      OUR RESTAURANT PARTNERS
      <span className="eyebrow-line" />
    </span>

    <h2>
      Meet Our <span>Restaurant Partners</span>
    </h2>

    <p>
      Explore amazing restaurants and discover your next
      favourite meal with Smart FoodCourt.
    </p>
  </div>
</div>

  <div className="trusted-marquee" data-scroll-reveal>
    <div className="trusted-track">
      {[...partnerRestaurants, ...partnerRestaurants].map(
        (restaurant, index) => {
          const restaurantLogo =
            restaurant.logo ||
            restaurant.logo_url ||
            restaurant.logoUrl ||
            restaurant.restaurant_logo;

         return (
  <div
    className="trusted-partner"
    key={`${restaurant._id}-${index}`}
    title={restaurant.name || "Restaurant"}
  >
    <div className="trusted-logo-wrap">
      {restaurantLogo ? (
        <img
          src={restaurantLogo}
          alt={`${restaurant.name || "Restaurant"} logo`}
          className="trusted-logo"
          loading="lazy"
        />
      ) : (
        <span className="trusted-partner-mark">
          {(restaurant.name || "R")
            .trim()
            .charAt(0)
            .toUpperCase()}
        </span>
      )}
    </div>

    <h3>{restaurant.name || "Restaurant"}</h3>
  </div>
);
        }
      )}
    </div>
  </div>
</section>

)}

      {/* FOOD CATEGORIES */}
    <section className="categories-section">

  {/* Section Heading */}
  <div className="category-heading" data-scroll-reveal>
    <div className="category-heading-text">
      <span className="category-eyebrow">
        <span className="eyebrow-line" />
        WHAT ARE YOU CRAVING?
        <span className="eyebrow-line" />
      </span>

      <h2>
        Explore Food <span>Categories</span>
      </h2>
    </div>
  </div>

  {/* Category Cards */}
  {foodLoading ? (
    <p className="status-message">
      Preparing delicious categories...
    </p>
  ) : categories.length === 0 ? (
    <p className="status-message">
      No food categories available right now.
    </p>
  ) : (
    <div className="category-grid">
      {categories.map((category, index) => (
        <Link
          to={`/menu?category=${encodeURIComponent(category.name)}`}
          className="category-card"
          data-scroll-reveal
          key={category.name}
          style={{
            animationDelay: `${index * 0.09}s`,
          }}
        >
          <div className="category-image-area">
            <div className="category-image-glow" />

            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="category-image"
                loading="lazy"
              />
            ) : (
              <div className="category-image-placeholder">
                <span>{category.name}</span>
              </div>
            )}

            <span className="category-item-count">
              {category.count}{" "}
              {category.count === 1 ? "ITEM" : "ITEMS"}
            </span>
          </div>

          <div className="category-info">
            <div>
              <h3>{category.name}</h3>
              <p>Delicious choices waiting for you</p>
            </div>

            <span className="category-arrow">↗</span>
          </div>
        </Link>
      ))}
    </div>
  )}

  {/* Button After All Categories */}
  <div className="category-view-all-wrapper">
    <Link to="/menu" className="category-view-all">
      Explore All Menu <span>→</span>
    </Link>
  </div>

</section>

      
 
      {/* ALL AVAILABLE FOODS */}
      <section className="all-foods-section">
     <div className="category-heading">
  <div className="category-heading-text">
    <span className="category-eyebrow">
      <span className="eyebrow-line" />
      WHAT ARE YOU CRAVING?
      <span className="eyebrow-line" />
    </span>

    <h2>
      Explore Our <span>Delicious Foods</span>
    </h2>
  </div>
</div>
        {foodLoading ? (
          <p className="status-message">
            Loading delicious foods...
          </p>
        ) : availableFoods.length === 0 ? (
          <p className="status-message">
            No foods available right now.
          </p>
        ) : (
          <div
            className="all-foods-marquee"
            aria-label="Available food items scrolling horizontally"
          >
            <div className="all-foods-track">

              {/* FIRST FOOD GROUP */}
              <div className="all-foods-group">
                {availableFoods.map((food) => (
                  <article
                    className="food-pop-card"
                    key={`food-${food._id}`}
                  >
                    <div className="food-pop-image-wrap">
                      {food.image ? (
                        <img
                          src={food.image}
                          alt={food.name || "Food"}
                          className="food-pop-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="food-pop-placeholder">
                          <span>
                            {food.category || "Delicious Food"}
                          </span>
                        </div>
                      )}

                      {food.category && (
                        <span className="food-pop-category">
                          {food.category}
                        </span>
                      )}
                    </div>

                    <div className="food-pop-info">
                      <h3>
                        {food.name || "Delicious Food"}
                      </h3>
                      <span>Available now</span>
                    </div>
                  </article>
                ))}
              </div>

              {/* DUPLICATE GROUP FOR CONTINUOUS ANIMATION */}
              <div
                className="all-foods-group"
                aria-hidden="true"
              >
                {availableFoods.map((food) => (
                  <article
                    className="food-pop-card"
                    key={`food-copy-${food._id}`}
                  >
                    <div className="food-pop-image-wrap">
                      {food.image ? (
                        <img
                          src={food.image}
                          alt=""
                          className="food-pop-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="food-pop-placeholder">
                          <span>
                            {food.category || "Delicious Food"}
                          </span>
                        </div>
                      )}

                      {food.category && (
                        <span className="food-pop-category">
                          {food.category}
                        </span>
                      )}
                    </div>

                    <div className="food-pop-info">
                      <h3>
                        {food.name || "Delicious Food"}
                      </h3>
                      <span>Available now</span>
                    </div>
                  </article>
                ))}
              </div>

            </div>
          </div>
        )}
      </section>


{/* WHY CHOOSE SMART FOODCOURT */}

<section className="why-smart-section">
  <div className="category-heading">
  <div className="category-heading-text">
    <span className="category-eyebrow">
      <span className="eyebrow-line" />
      THE SMARTER WAY TO EAT
      <span className="eyebrow-line" />
    </span>

    <h2>
      Why Choose <span>Smart FoodCourt?</span>
    </h2>

    <p>
      More than food ordering. A smarter and easier way to enjoy your
      favourite meals.
    </p>
  </div>
</div>

  <div className="sf-features-grid">
    {[
      {
        icon: "🤖",
        title: "AI Food Assistant",
        description:
          "Get smart food recommendations based on your taste and preferences.",
      },
      {
        icon: "🍽️",
        title: "Multiple Restaurants",
        description:
          "Discover different restaurants and explore their delicious menus.",
      },
      {
        icon: "⚡",
        title: "Easy Ordering",
        description:
          "Order your favourite meals with a simple and convenient experience.",
      },
      {
        icon: "📍",
        title: "Live Order Tracking",
        description:
          "Stay updated and follow your order's progress in real time.",
      },
    ].map((feature, index) => (
      <div
        className="sf-feature-card sf-scroll-reveal"
        key={feature.title}
        style={{ transitionDelay: `${index * 130}ms` }}
      >
        <div className="sf-feature-icon">
          {feature.icon}
        </div>

        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
        <div className="sf-feature-line"></div>
      </div>
    ))}
  </div>
</section>


{/* HOW IT WORKS */}

<section className="sf-how-section">
 <div className="category-heading sf-scroll-reveal">
  <div className="category-heading-text">
    <span className="category-eyebrow">
      <span className="eyebrow-line" />
      JUST FOUR SIMPLE STEPS
      <span className="eyebrow-line" />
    </span>

    <h2>
      Delicious Food, <span>Made Easy</span>
    </h2>

    <p>
      Your favourite food is just a few clicks away.
    </p>
  </div>
</div>

  <div className="sf-steps-grid">
    {[
      {
        number: "01",
        icon: "🏪",
        title: "Choose Restaurant",
        description:
          "Explore our restaurant partners and find your favourite.",
      },
      {
        number: "02",
        icon: "🍕",
        title: "Select Your Food",
        description:
          "Discover delicious dishes and add them to your cart.",
      },
      {
        number: "03",
        icon: "🛒",
        title: "Place Your Order",
        description:
          "Complete checkout using your preferred payment method.",
      },
      {
        number: "04",
        icon: "🚴",
        title: "Enjoy Your Meal",
        description:
          "Track your order and get ready to enjoy your food.",
      },
    ].map((step, index) => (
      <div
        className="sf-step-card sf-scroll-reveal"
        key={step.number}
        style={{ transitionDelay: `${index * 150}ms` }}
      >
        <span className="sf-step-number">
          {step.number}
        </span>

        <div className="sf-step-icon">
          {step.icon}
        </div>

        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </div>
    ))}
  </div>
</section>

{/* ABOUT SMART FOODCOURT */}

<section className="sf-about-section">

  <div className="category-heading sf-scroll-reveal">
  <div className="category-heading-text">
    <span className="category-eyebrow">
      <span className="eyebrow-line" />
      ABOUT SMART FOODCOURT
      <span className="eyebrow-line" />
    </span>

    <h2>
      Food Ordering, <span>Reimagined.</span>
    </h2>

    <p>
      Bringing restaurants, technology and delicious food
      together for a smarter dining experience.
    </p>
  </div>
</div>

  {/* ANIMATED STAT CARDS */}

 <div className={`sf-about-stats ${statsVisible ? "stats-active" : ""}`}>

  <div className="sf-stat-card sf-scroll-reveal">
    <div className="sf-stat-circle">
      <div className="sf-stat-inner">
        <strong>{partnerRestaurants.length}</strong>
        <span>PARTNERS</span>
      </div>
    </div>
    <h3>Restaurant Partners</h3>
    <p>Explore restaurants and discover your favourite places.</p>
  </div>

  <div className="sf-stat-card sf-scroll-reveal">
    <div className="sf-stat-circle sf-stat-circle-two">
      <div className="sf-stat-inner">
        <strong>
          {categories.reduce(
            (total, category) => total + category.count,
            0
          )}
        </strong>
        <span>FOOD ITEMS</span>
      </div>
    </div>
    <h3>Delicious Food Choices</h3>
    <p>Explore a variety of meals for every craving.</p>
  </div>

  <div className="sf-stat-card sf-scroll-reveal">
    <div className="sf-stat-circle sf-stat-circle-three">
      <div className="sf-stat-inner">
        <strong>AI</strong>
        <span>POWERED</span>
      </div>
    </div>
    <h3>Smart Food Assistant</h3>
    <p>Get intelligent food recommendations based on your taste.</p>
  </div>

</div>

  {/* FOOD EXPERIENCE BANNER */}

  

</section>

{/* SMART FOODCOURT MISSION & VISION */}

<section className="sf-mission-section">

  <div className="sf-mission-left sf-scroll-reveal">
    <span className="sf-mission-eyebrow">
      WHAT WE BELIEVE IN
    </span>

    <h2>
      Our Mission &<br />
      <strong>Vision</strong>
    </h2>

    <div className="sf-mission-underline"></div>

    <p>
      Smart FoodCourt brings customers and restaurants
      together through a smarter food ordering experience.
      We believe finding and enjoying great food should
      always be simple, convenient and delightful.
    </p>

    <Link to="/menu" className="sf-mission-button">
      Explore Food <span>→</span>
    </Link>
  </div>

  <div className="sf-mission-right">

    <div className="sf-mission-cards">

      <div className="sf-mission-card sf-scroll-reveal">
        <div className="sf-mission-icon">👁️</div>
        <h3>Our Vision</h3>
        <p>
          To create a smarter food ecosystem where
          customers can discover amazing restaurants
          and enjoy delicious meals effortlessly.
        </p>
      </div>

      <div className="sf-mission-card sf-scroll-reveal">
        <div className="sf-mission-icon">🎯</div>
        <h3>Our Mission</h3>
        <p>
          To simplify food ordering through AI-powered
          recommendations, convenient ordering and
          transparent order tracking.
        </p>
      </div>

    </div>

    <div className="sf-mission-image sf-scroll-reveal">
      <img
        src="/videos/food-hero.gif"
        alt="Delicious food at Smart FoodCourt"
        loading="lazy"
      />

      
    </div>

  </div>

</section>

      {/* CUSTOMER FEEDBACK */}
<section className="customer-feedback-section">
  <div className="category-heading">
  <div className="category-heading-text">
    <span className="category-eyebrow">
      <span className="eyebrow-line" />
      CUSTOMER EXPERIENCES
      <span className="eyebrow-line" />
    </span>

    <h2>
      What Our Customers <span>Say</span>
    </h2>

    <p>
      Real experiences shared by our Smart FoodCourt customers.
    </p>
  </div>
</div>

  {feedbackLoading ? (
    <p className="status-message">Loading customer reviews...</p>
  ) : customerFeedback.length === 0 ? (
    <p className="status-message">
      No customer reviews available yet.
    </p>
  ) : (
    <div className="customer-feedback-grid">
      {customerFeedback.map((item, index) => (
        <article
  className="customer-feedback-card"
  key={`${item.created_at}-${index}`}
>
  <div className="feedback-customer">
   <div className="feedback-avatar">
  {getCustomerImage(item) ? (
    <img
      src={getCustomerImage(item)}
      alt={item.customer_name || "Customer"}
      onError={(e) => {
        e.currentTarget.style.display = "none";
        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
        if (fallback) fallback.style.display = "flex";
      }}
    />
  ) : null}

  <span
    className="feedback-avatar-fallback"
    style={{
      display: getCustomerImage(item) ? "none" : "flex",
    }}
  >
    {(item.customer_name || "C").charAt(0).toUpperCase()}
  </span>
</div>

    <h3>{item.customer_name || "Customer"}</h3>
  </div>

  <div
    className="feedback-stars"
    aria-label={`${item.rating} out of 5 stars`}
  >
    {"★".repeat(Math.max(0, Math.min(5, item.rating)))}
    <span>
      {"★".repeat(5 - Math.max(0, Math.min(5, item.rating)))}
    </span>
  </div>

  <p className="feedback-comment">
    {item.comment?.trim() || "Customer rated their experience."}
  </p>
</article>
      ))}
    </div>
  )}
</section>
    <ScrollProgressIndicator />
    </div>
  );
}

function ScrollProgressIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollable =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const current =
        scrollable > 0
          ? window.scrollY / scrollable
          : 0;

      setProgress(Math.min(1, Math.max(0, current)));
    };

    updateProgress();

    window.addEventListener("scroll", updateProgress, {
      passive: true,
    });

    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  const circumference = 2 * Math.PI * 21;

  return (
    <button
      className="sf-scroll-progress"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <svg viewBox="0 0 52 52">
        <circle
          className="sf-progress-track"
          cx="26"
          cy="26"
          r="21"
        />

        <circle
          className="sf-progress-value"
          cx="26"
          cy="26"
          r="21"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference * (1 - progress)
          }
        />
      </svg>

      <span>↑</span>
    </button>
  );
}


export default Home;
