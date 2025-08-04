"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaCar, FaMotorcycle } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { supabase } from "@/lib/supabase";
import "./services.css";
import { SERVICES } from "./servicesData";

type VehicleType = "car" | "bike" | null;

interface BookingForm {
  group: string;
  service: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  vehicleModel: string;
  message: string;
}

export default function ServicesPage() {
  const [vehicleType, setVehicleType] = useState<VehicleType>(null);
  const [bookingForm, setBookingForm] = useState<BookingForm>({
    group: "",
    service: "",
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    vehicleModel: "",
    message: ""
  });
  const [submitStatus, setSubmitStatus] = useState<null | string>(null);

  // Filter relevant services
  const servicesData = SERVICES.find(s => s.vehicleType === vehicleType);

  // All group options
  const groupOptions = servicesData?.groups || [];

  // All services under selected group
  const serviceOptions =
    groupOptions.find(g => g.label === bookingForm.group)?.items || [];

  const handleVehicleTypeSelect = (type: VehicleType) => {
    setVehicleType(type);
    setBookingForm({
      group: "",
      service: "",
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      vehicleModel: "",
      message: ""
    });
    setSubmitStatus(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle group change
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBookingForm(prev => ({
      ...prev,
      group: e.target.value,
      service: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus(null);

    const selectedService =
      serviceOptions.find(s => s.value === bookingForm.service);

    const { error } = await supabase.from("bookings").insert([
      {
        vehicle_type: vehicleType,
        group: bookingForm.group,
        service: bookingForm.service,
        service_label: selectedService?.label,
        service_description: selectedService?.description,
        service_price: selectedService?.price,
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        date: bookingForm.date,
        time: bookingForm.time,
        vehicle_model: bookingForm.vehicleModel,
        message: bookingForm.message
      }
    ]);

    if (error) {
      setSubmitStatus("There was an error submitting your booking. Please try again.");
      return;
    }

    setSubmitStatus("Booking submitted! We will contact you soon.");
    setBookingForm({
      group: bookingForm.group,
      service: bookingForm.service,
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      vehicleModel: "",
      message: ""
    });
  };

  return (
    <div className="services-page">
      <Navbar />

      <main className="services-main">
        {!vehicleType && (
          <section className="vehicle-type-section">
            <div className="container vehicle-type-container" style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "3rem" }}>
              <motion.div
                className="vehicle-card"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleVehicleTypeSelect("bike")}
                style={{
                  cursor: "pointer",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "2px solid #d1d1d1",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  textAlign: "center",
                  background: "#f7fafc",
                  flex: 1,
                  maxWidth: "320px",
                  color: "#111"
                }}
              >
                <FaMotorcycle size={50} color="#2e86de" />
                <h2 style={{ marginTop: "1rem", color: "#111" }}>Bike</h2>
                <p style={{ color: "#111" }}>Choose for bike services and repairs.</p>
              </motion.div>
              <motion.div
                className="vehicle-card"
                whileHover={{ scale: 1.05 }}
                onClick={() => handleVehicleTypeSelect("car")}
                style={{
                  cursor: "pointer",
                  padding: "2rem",
                  borderRadius: "12px",
                  border: "2px solid #d1d1d1",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                  textAlign: "center",
                  background: "#f7fafc",
                  flex: 1,
                  maxWidth: "320px",
                  color: "#111"
                }}
              >
                <FaCar size={50} color="#16a085" />
                <h2 style={{ marginTop: "1rem", color: "#111" }}>Car</h2>
                <p style={{ color: "#111" }}>Choose for car services and repairs.</p>
              </motion.div>
            </div>
          </section>
        )}

        {vehicleType && (
          <section className="booking-section">
            <div className="container">
              <motion.div
                className="booking-form-container"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2>Book Your {vehicleType === "car" ? "Car" : "Bike"} Service</h2>
                <form onSubmit={handleSubmit} className="booking-form">
                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label htmlFor="group">Service Category</label>
                      <select
                        id="group"
                        name="group"
                        value={bookingForm.group}
                        onChange={handleGroupChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {groupOptions.map(option => (
                          <option key={option.label} value={option.label}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group full-width">
                      <label htmlFor="service">Service</label>
                      <select
                        id="service"
                        name="service"
                        value={bookingForm.service}
                        onChange={handleInputChange}
                        required
                        disabled={!bookingForm.group}
                      >
                        <option value="">Select Service</option>
                        {serviceOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Description and Pricing */}
                  <div className="service-details" style={{ margin: "1.5rem 0" }}>
                    {bookingForm.service && (
                      <motion.div
                        className="service-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <h3>
                          {serviceOptions.find(s => s.value === bookingForm.service)?.label}
                        </h3>
                        <p>
                          {serviceOptions.find(s => s.value === bookingForm.service)?.description}
                        </p>
                        <p style={{ fontWeight: 700, marginTop: 8 }}>
                          Price: ₹{serviceOptions.find(s => s.value === bookingForm.service)?.price}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="name">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={bookingForm.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={bookingForm.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={bookingForm.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="vehicleModel">{vehicleType === "car" ? "Car Model" : "Bike Model"}</label>
                      <input
                        type="text"
                        id="vehicleModel"
                        name="vehicleModel"
                        value={bookingForm.vehicleModel}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="date">Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={bookingForm.date}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="time">Time</label>
                      <input
                        type="time"
                        id="time"
                        name="time"
                        value={bookingForm.time}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="message">Additional Notes</label>
                    <textarea
                      id="message"
                      name="message"
                      value={bookingForm.message}
                      onChange={handleInputChange}
                      rows={4}
                    ></textarea>
                  </div>
                  <button type="submit" className="submit-btn">
                    Book Appointment
                  </button>
                  {submitStatus && (
                    <div
                      style={{
                        marginTop: "12px",
                        color: submitStatus.startsWith("Booking submitted") ? "green" : "red",
                        textAlign: "center",
                        fontWeight: 500
                      }}
                    >
                      {submitStatus}
                    </div>
                  )}
                </form>
              </motion.div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
