"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./admin-dashboard.module.css";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

interface Product {
  id: string;
  name: string;
  price: number;
  imageurl: string;
  description?: string;
  category: string;
}

interface Booking {
  id: string;
  service: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  vehicle_model: string;
  message: string;
  created_at: string;
}

interface WorkerProfile {
  id: string;
  name: string;
  email?: string;
  role: string;
}

interface Coupon {
  id: string;
  code: string;
  coins: number;
  description?: string;
  expires_at?: string;
  created_at: string;
}

interface Merchandise {
  id: string;
  name: string;
  imageurl: string;
  description?: string;
  coins: number;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const SIDEBAR_SECTIONS = [
  { key: "workers", label: "Verify Workers" },
  { key: "products", label: "Products" },
  { key: "coupons", label: "Coupons" },
  { key: "merchandise", label: "Merchandise" },
  { key: "bookings", label: "Bookings" },
  { key: "contact", label: "Contact Messages" },
];

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sidebar section state
  const [section, setSection] = useState("workers");

  // Products & Bookings
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Add product form
  const [form, setForm] = useState({
    name: "",
    price: "",
    imageurl: "",
    description: "",
    category: "",
  });
  const [addStatus, setAddStatus] = useState("");

  // Worker verification
  const [pendingWorkers, setPendingWorkers] = useState<WorkerProfile[]>([]);
  const [approveStatus, setApproveStatus] = useState("");

  // Coupons (for coins)
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    coins: "",
    description: "",
    expires_at: "",
  });
  const [couponStatus, setCouponStatus] = useState("");

  // Merchandise
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [merchForm, setMerchForm] = useState({
    name: "",
    imageurl: "",
    description: "",
    coins: "",
  });
  const [merchStatus, setMerchStatus] = useState("");

  // Contact messages
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactLoading, setContactLoading] = useState(false);

  // Check auth and role on mount
  useEffect(() => {
    const getUserAndRole = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (!data.user) {
        router.replace("/login");
        return;
      }
      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();
      if (profile?.role !== "admin") {
        router.replace("/login");
        return;
      }
      setLoading(false);
    };
    getUserAndRole();
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.replace("/login");
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // Fetch products
  useEffect(() => {
    if (user) {
      supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setProducts(data ?? []));
    }
  }, [user, addStatus]);

  // Fetch bookings
  useEffect(() => {
    if (user) {
      supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setBookings(data ?? []));
    }
  }, [user]);

  // Fetch pending workers (select all columns)
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "pending")
        .then(({ data }) => setPendingWorkers(data ?? []));
    }
  }, [user, approveStatus]);

  // Fetch coupons (for coins)
  useEffect(() => {
    if (user) {
      supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setCoupons(data ?? []));
    }
  }, [user, couponStatus]);

  // Fetch merchandise
  useEffect(() => {
    if (user) {
      supabase
        .from("merchandise")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setMerchandise(data ?? []));
    }
  }, [user, merchStatus]);

  // Fetch contact messages
  useEffect(() => {
    if (user && section === "contact") {
      setContactLoading(true);
      supabase
        .from("contact")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setContactMessages(data ?? []);
          setContactLoading(false);
        });
    }
  }, [user, section]);

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/login");
  };

  // Add Product
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStatus("");
    if (!form.name || !form.price || !form.imageurl || !form.category) {
      setAddStatus("Please fill all required fields.");
      return;
    }
    const { error } = await supabase.from("products").insert([
      {
        name: form.name,
        price: parseFloat(form.price),
        imageurl: form.imageurl,
        description: form.description,
        category: form.category,
      },
    ]);
    if (error) {
      setAddStatus("Failed to add product: " + error.message);
    } else {
      setAddStatus("Product added successfully!");
      setForm({ name: "", price: "", imageurl: "", description: "", category: "" });
    }
  };
  const handleRemoveProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      setAddStatus("Failed to remove product: " + error.message);
    } else {
      setAddStatus("Product removed successfully!");
      setProducts(products.filter((product) => product.id !== id));
    }
  };

  // Worker Approvals
  const handleApproveWorker = async (id: string) => {
    setApproveStatus("");
    const { error } = await supabase
      .from("profiles")
      .update({ role: "worker" })
      .eq("id", id);
    if (error) {
      setApproveStatus("Failed to approve: " + error.message);
    } else {
      setApproveStatus("Worker approved!");
      setPendingWorkers(pendingWorkers.filter((w) => w.id !== id));
    }
  };
  const handleRejectWorker = async (id: string) => {
    setApproveStatus("");
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) {
      setApproveStatus("Failed to reject: " + error.message);
    } else {
      setApproveStatus("Worker rejected and deleted!");
      setPendingWorkers(pendingWorkers.filter((w) => w.id !== id));
    }
  };

  // Coupon handlers (for coins)
  const handleCouponChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCouponForm({ ...couponForm, [e.target.name]: e.target.value });
  };
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponStatus("");
    if (!couponForm.code || !couponForm.coins) {
      setCouponStatus("Please fill all required fields.");
      return;
    }
    const { error } = await supabase.from("coupons").insert([
      {
        code: couponForm.code,
        coins: parseInt(couponForm.coins),
        description: couponForm.description,
        expires_at: couponForm.expires_at ? new Date(couponForm.expires_at) : null,
      },
    ]);
    if (error) {
      setCouponStatus("Failed to add coupon: " + error.message);
    } else {
      setCouponStatus("Coupon for coins added successfully!");
      setCouponForm({ code: "", coins: "", description: "", expires_at: "" });
    }
  };
  const handleRemoveCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      setCouponStatus("Failed to remove coupon: " + error.message);
    } else {
      setCouponStatus("Coupon removed successfully!");
      setCoupons(coupons.filter((coupon) => coupon.id !== id));
    }
  };

  // Merchandise handlers
  const handleMerchChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMerchForm({ ...merchForm, [e.target.name]: e.target.value });
  };
  const handleAddMerch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMerchStatus("");
    if (!merchForm.name || !merchForm.imageurl || !merchForm.coins) {
      setMerchStatus("Please fill all required fields.");
      return;
    }
    const { error } = await supabase.from("merchandise").insert([
      {
        name: merchForm.name,
        imageurl: merchForm.imageurl,
        description: merchForm.description,
        coins: parseInt(merchForm.coins),
      },
    ]);
    if (error) {
      setMerchStatus("Failed to add merchandise: " + error.message);
    } else {
      setMerchStatus("Merchandise added successfully!");
      setMerchForm({ name: "", imageurl: "", description: "", coins: "" });
    }
  };
  const handleRemoveMerch = async (id: string) => {
    const { error } = await supabase.from("merchandise").delete().eq("id", id);
    if (error) {
      setMerchStatus("Failed to remove merchandise: " + error.message);
    } else {
      setMerchStatus("Merchandise removed successfully!");
      setMerchandise(merchandise.filter((m) => m.id !== id));
    }
  };

  // Booking delete
  const handleRemoveBooking = async (id: string) => {
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      alert("Failed to remove booking: " + error.message);
    } else {
      setBookings(bookings.filter((booking) => booking.id !== id));
    }
  };

  // Contact message delete (optional)
  const handleDeleteContactMessage = async (id: string) => {
    const { error } = await supabase.from("contact").delete().eq("id", id);
    if (!error) {
      setContactMessages((msgs) => msgs.filter((msg) => msg.id !== id));
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.adminPageWrapper}>
          <div className={styles.container}>
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className={styles.adminDashboardWrapper}>
        {/* SIDEBAR + MAIN LAYOUT */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Admin</h2>
          </div>
          <ul className={styles.sidebarList}>
            {SIDEBAR_SECTIONS.map((s) => (
              <li
                key={s.key}
                className={
                  section === s.key
                    ? `${styles.sidebarItem} ${styles.sidebarItemActive}`
                    : styles.sidebarItem
                }
                onClick={() => setSection(s.key)}
              >
                {s.label}
              </li>
            ))}
            <li
              className={styles.sidebarItem}
              onClick={handleLogout}
              style={{ marginTop: "auto", color: "#e53e3e" }}
            >
              Logout
            </li>
          </ul>
        </div>

        <div className={styles.mainContent}>
          {/* Workers */}
          {section === "workers" && (
            <section className={styles.sectionBox}>
              <h3>Verify Workers</h3>
              {approveStatus && (
                <p
                  className={
                    approveStatus.includes("approved")
                      ? styles.successMsg
                      : styles.errorMsg
                  }
                  style={{ marginBottom: 10 }}
                >
                  {approveStatus}
                </p>
              )}
              <div>
                {pendingWorkers.length === 0 ? (
                  <p>No pending worker registrations.</p>
                ) : (
                  pendingWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className={styles.workerCard}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div>
                        <b>{worker.name}</b>
                        <div style={{ fontSize: "0.96em", color: "#888" }}>
                          {worker.email || "No email"}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className={styles.button}
                          style={{ background: "#22c55e", fontSize: "0.93em" }}
                          onClick={() => handleApproveWorker(worker.id)}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.removeButton}
                          style={{ fontSize: "0.93em" }}
                          onClick={() => handleRejectWorker(worker.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* Products */}
          {section === "products" && (
            <>
              <section className={styles.sectionBox}>
                <h3>Add Product</h3>
                <form className={styles.uploadForm} onSubmit={handleAddProduct}>
                  <div className={styles.formRow}>
                    <input
                      name="name"
                      type="text"
                      placeholder="Product Name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                    <input
                      name="price"
                      type="number"
                      placeholder="Price"
                      value={form.price}
                      onChange={handleChange}
                      required
                    />
                    <input
                      name="imageurl"
                      type="text"
                      placeholder="Image URL"
                      value={form.imageurl}
                      onChange={handleChange}
                      required
                    />
                    <input
                      name="category"
                      type="text"
                      placeholder="Category"
                      value={form.category}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleChange}
                    rows={2}
                    className={styles.textarea}
                  />
                  <button type="submit" className={styles.button}>
                    Add Product
                  </button>
                  {addStatus && (
                    <p
                      className={
                        addStatus.includes("success")
                          ? styles.successMsg
                          : styles.errorMsg
                      }
                    >
                      {addStatus}
                    </p>
                  )}
                </form>
              </section>
              <section className={styles.sectionBox}>
                <h3>Current Products</h3>
                <div className={styles.grid}>
                  {products.length === 0 && <p>No products yet.</p>}
                  {products.map((product) => (
                    <div key={product.id} className={styles.card}>
                      {isExternal(product.imageurl) ? (
                        <img
                          src={product.imageurl}
                          alt={product.name}
                          className={styles.image}
                        />
                      ) : (
                        <Image
                          src={product.imageurl || "/placeholder.png"}
                          alt={product.name}
                          className={styles.image}
                          width={200}
                          height={150}
                          style={{ objectFit: "cover" }}
                          priority={false}
                        />
                      )}
                      <h3>{product.name}</h3>
                      <p className={styles.description}>{product.description}</p>
                      <strong className={styles.price}>₹{product.price}</strong>
                      <div className={styles.category}>
                        <b>Category:</b> {product.category}
                      </div>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveProduct(product.id)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Coupons */}
          {section === "coupons" && (
            <section className={styles.sectionBox}>
              <h3>Coupons (for Coins)</h3>
              <form className={styles.uploadForm} onSubmit={handleAddCoupon}>
                <div className={styles.formRow}>
                  <input
                    name="code"
                    type="text"
                    placeholder="Coupon Code"
                    value={couponForm.code}
                    onChange={handleCouponChange}
                    required
                  />
                  <input
                    name="coins"
                    type="number"
                    placeholder="Coins"
                    value={couponForm.coins}
                    onChange={handleCouponChange}
                    required
                    min={1}
                  />
                  <input
                    name="expires_at"
                    type="date"
                    placeholder="Expiration Date"
                    value={couponForm.expires_at}
                    onChange={handleCouponChange}
                  />
                </div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={couponForm.description}
                  onChange={handleCouponChange}
                  rows={2}
                  className={styles.textarea}
                />
                <button type="submit" className={styles.button}>
                  Add Coupon
                </button>
                {couponStatus && (
                  <p
                    className={
                      couponStatus.includes("success")
                        ? styles.successMsg
                        : styles.errorMsg
                    }
                  >
                    {couponStatus}
                  </p>
                )}
              </form>
              <div className={styles.grid}>
                {coupons.length === 0 && <p>No coupons yet.</p>}
                {coupons.map((coupon) => (
                  <div key={coupon.id} className={styles.card}>
                    <h3>{coupon.code}</h3>
                    <p className={styles.description}>{coupon.description}</p>
                    <strong className={styles.price}>{coupon.coins} coins</strong>
                    {coupon.expires_at && (
                      <div className={styles.category}>
                        <b>Expires:</b>{" "}
                        {new Date(coupon.expires_at).toLocaleDateString()}
                      </div>
                    )}
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveCoupon(coupon.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Merchandise */}
          {section === "merchandise" && (
            <section className={styles.sectionBox}>
              <h3>Merchandise (for Worker Dashboard)</h3>
              <form className={styles.uploadForm} onSubmit={handleAddMerch}>
                <div className={styles.formRow}>
                  <input
                    name="name"
                    type="text"
                    placeholder="Merchandise Name"
                    value={merchForm.name}
                    onChange={handleMerchChange}
                    required
                  />
                  <input
                    name="imageurl"
                    type="text"
                    placeholder="Image URL"
                    value={merchForm.imageurl}
                    onChange={handleMerchChange}
                    required
                  />
                  <input
                    name="coins"
                    type="number"
                    placeholder="Coins to Redeem"
                    value={merchForm.coins}
                    onChange={handleMerchChange}
                    required
                    min={1}
                  />
                </div>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={merchForm.description}
                  onChange={handleMerchChange}
                  rows={2}
                  className={styles.textarea}
                />
                <button type="submit" className={styles.button}>
                  Add Merchandise
                </button>
                {merchStatus && (
                  <p
                    className={
                      merchStatus.includes("success")
                        ? styles.successMsg
                        : styles.errorMsg
                    }
                  >
                    {merchStatus}
                  </p>
                )}
              </form>
              <div className={styles.grid}>
                {merchandise.length === 0 && <p>No merchandise yet.</p>}
                {merchandise.map((m) => (
                  <div key={m.id} className={styles.card}>
                    {isExternal(m.imageurl) ? (
                      <img
                        src={m.imageurl}
                        alt={m.name}
                        className={styles.image}
                      />
                    ) : (
                      <Image
                        src={m.imageurl || "/placeholder.png"}
                        alt={m.name}
                        className={styles.image}
                        width={200}
                        height={150}
                        style={{ objectFit: "cover" }}
                        priority={false}
                      />
                    )}
                    <h3>{m.name}</h3>
                    <p className={styles.description}>{m.description}</p>
                    <strong className={styles.price}>{m.coins} coins</strong>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveMerch(m.id)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bookings */}
          {section === "bookings" && (
            <section className={styles.sectionBox}>
              <h3>Latest Bookings</h3>
              <div className={styles.grid}>
                {bookings.length === 0 && <p>No bookings yet.</p>}
                {bookings.map((booking) => (
                  <div key={booking.id} className={styles.card}>
                    <div>
                      <b>Service:</b> {booking.service === "car-wash" ? "Car Wash" : "Car Repair"}
                    </div>
                    <div>
                      <b>Name:</b> {booking.name}
                    </div>
                    <div>
                      <b>Email:</b> {booking.email}
                    </div>
                    <div>
                      <b>Phone:</b> {booking.phone}
                    </div>
                    <div>
                      <b>Vehicle:</b> {booking.vehicle_model}
                    </div>
                    <div>
                      <b>Date:</b> {booking.date}
                    </div>
                    <div>
                      <b>Time:</b> {booking.time}
                    </div>
                    {booking.message && (
                      <div>
                        <b>Notes:</b> {booking.message}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "0.85em",
                        color: "#aaa",
                        marginTop: "6px",
                      }}
                    >
                      {new Date(booking.created_at).toLocaleString()}
                    </div>
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveBooking(booking.id)}
                      type="button"
                      style={{ marginTop: 10 }}
                    >
                      Delete Booking
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Contact Messages */}
          {section === "contact" && (
            <section className={styles.sectionBox}>
              <h3>Contact Messages</h3>
              {contactLoading ? (
                <p>Loading messages...</p>
              ) : contactMessages.length === 0 ? (
                <p>No messages received yet.</p>
              ) : (
                <div className={styles.grid}>
                  {contactMessages.map((msg) => (
                    <div key={msg.id} className={styles.card} style={{ alignItems: "flex-start" }}>
                      <div style={{ marginBottom: 8 }}>
                        <b>Name:</b> {msg.name}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <b>Email:</b> {msg.email}
                      </div>
                      <div style={{ marginBottom: 8 }}>
                        <b>Subject:</b> {msg.subject}
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <b>Message:</b>
                        <div className={styles.description} style={{ marginTop: 4, textAlign: "left" }}>
                          {msg.message}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "0.9em",
                          color: "#aaa",
                          marginBottom: "10px",
                        }}
                      >
                        {new Date(msg.created_at).toLocaleString()}
                      </div>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleDeleteContactMessage(msg.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
