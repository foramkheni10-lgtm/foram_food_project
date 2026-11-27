
import { useState, type FormEvent, type ChangeEvent } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  Headphones,
  ArrowRight,
} from "lucide-react";

import "./Contact.css";

// Smart FoodCourt contact details
const contactDetails = {
  email: "smartfoodcourt01@gmail.com",
  phone: "+91 78620 18689",
  address: "Surat, Gujarat, India",
};

// Animation settings
const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut" as const,
    },
  },
};

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setSubmitted(false);
  };

  // Handle contact form submission
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailSubject = encodeURIComponent(formData.subject);

    const emailBody = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n\n` +
      `Message:\n${formData.message}`
    );

    const mailtoLink =
      `mailto:${contactDetails.email}` +
      `?subject=${emailSubject}&body=${emailBody}`;

    window.location.href = mailtoLink;

    setSubmitted(true);
  };

  return (
    <div className="contact-page">

      {/* HERO SECTION */}
      <section className="contact-hero">

        <motion.div
          className="contact-hero-content"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="contact-label">
            GET IN TOUCH
          </span>

          <h1>
            We'd Love to
            <span> Hear From You!</span>
          </h1>

          <p>
            Have a question, suggestion or need assistance?
            Contact the Smart FoodCourt team. We're happy to
            help you with your food management experience.
          </p>

          <a
            href="#contact-form"
            className="contact-hero-btn"
          >
            Contact Us
            <ArrowRight size={18} />
          </a>
        </motion.div>

        <motion.div
          className="contact-hero-art"
          initial={{
            opacity: 0,
            scale: 0.6,
            rotate: -15,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          transition={{
            duration: 0.9,
            delay: 0.2,
          }}
        >
          <div className="contact-hero-circle">
            <MessageCircle size={85} strokeWidth={1.5} />
            <span>We're Here to Help!</span>
          </div>
        </motion.div>

      </section>

      {/* CONTACT INFORMATION */}
      <section className="contact-info-section">

        <motion.div
          className="contact-heading"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <span>CONTACT INFORMATION</span>

          <h2>Let's Connect Together</h2>

          <p>
            Reach out to us through any of the following
            contact details.
          </p>
        </motion.div>

        <div className="contact-info-grid">

          {/* EMAIL CARD */}
          <motion.a
            href={`mailto:${contactDetails.email}`}
            className="contact-info-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
          >
            <div className="contact-info-icon">
              <Mail />
            </div>

            <h3>Email Us</h3>

            <p>{contactDetails.email}</p>
          </motion.a>

          {/* PHONE CARD */}
          <motion.a
            href={`tel:${contactDetails.phone.replace(/\s/g, "")}`}
            className="contact-info-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
          >
            <div className="contact-info-icon">
              <Phone />
            </div>

            <h3>Call Us</h3>

            <p>{contactDetails.phone}</p>
          </motion.a>

          {/* LOCATION CARD */}
          <motion.a
            href="https://www.google.com/maps/search/?api=1&query=Surat%2C+Gujarat%2C+India"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-info-card"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
          >
            <div className="contact-info-icon">
              <MapPin />
            </div>

            <h3>Our Location</h3>

            <p>{contactDetails.address}</p>
          </motion.a>

        </div>
      </section>

      {/* CONTACT FORM SECTION */}
      <section
        className="contact-form-section"
        id="contact-form"
      >

        <motion.div
          className="contact-form-intro"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="contact-form-intro-icon">
            <Headphones size={45} />
          </div>

          <span>WE ARE READY TO HELP</span>

          <h2>Send Us a Message</h2>

          <p>
            Your feedback and questions are important to us.
            Fill out the contact form and get in touch with
            our Smart FoodCourt team.
          </p>

          <div className="contact-form-note">
            <MessageCircle size={20} />

            <span>
              We appreciate your interest in Smart FoodCourt.
            </span>
          </div>
        </motion.div>

        {/* CONTACT FORM */}
        <motion.div
          className="contact-form-box"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <form onSubmit={handleSubmit}>

            <div className="contact-input-row">

              <div className="contact-field">
                <label htmlFor="contact-name">
                  Your Name *
                </label>

                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="contact-email">
                  Email Address *
                </label>

                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="contact-field">
              <label htmlFor="contact-subject">
                Subject *
              </label>

              <input
                id="contact-subject"
                type="text"
                name="subject"
                placeholder="Enter message subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-message">
                Your Message *
              </label>

              <textarea
                id="contact-message"
                name="message"
                placeholder="Write your message here..."
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="contact-submit-btn"
            >
              Send Message
              <Send size={17} />
            </button>

            {submitted && (
              <p className="contact-submit-note">
                Your email application should open with
                your message prepared. Send the email there
                to complete your submission.
              </p>
            )}

          </form>
        </motion.div>

      </section>

      {/* BOTTOM SECTION */}
      <motion.section
        className="contact-bottom"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="contact-bottom-icon">
          <MessageCircle size={35} />
        </div>

        <h2>
          Thank You for Connecting With Us!
        </h2>

        <p>
          Smart FoodCourt is committed to making food ordering
          and food management smarter and easier.
        </p>

        <a href="/" className="contact-home-btn">
          Back to Home
          <ArrowRight size={18} />
        </a>

      </motion.section>

    </div>
  );
}

export default Contact;
