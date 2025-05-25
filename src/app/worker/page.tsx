"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./worker-dashboard.module.css";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";

// Sidebar sections
const SIDEBAR_SECTIONS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "coupons", label: "My Coupons" },
  { key: "merchandise", label: "Merchandise" }
];

interface Coupon {
  id: string;
  code: string;
  description: string;
  coins: number;
  is_active: boolean;
  created_at: string;
  redeemed_by?: string[];
}

interface Merchandise {
  id: string;
  name: string;
  imageurl: string;
  description?: string;
  coins: number;
  created_at: string;
  redeemed_by?: string[];
}

interface Profile {
  id: string;
  name: string;
  coins: number;
  role: string;
  [key: string]: any;
}

function isExternal(url: string) {
  return /^https?:\/\//.test(url);
}

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [coins, setCoins] = useState<number>(0);
  const [myCoupons, setMyCoupons] = useState<Coupon[]>([]);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemStatus, setRedeemStatus] = useState("");

  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [merchRedeemStatus, setMerchRedeemStatus] = useState<string>("");

  // Sidebar state
  const [section, setSection] = useState("dashboard");

  // Fetch user and profile
  useEffect(() => {
    const getUserAndProfile = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (!data.user) {
        router.replace("/login");
        return;
      }
      // Get worker profile
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (error || !profile || profile.role !== "worker") {
        router.replace("/login");
        return;
      }
      setProfile(profile);
      setCoins(profile.coins ?? 0);
      setLoading(false);
    };
    getUserAndProfile();
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) router.replace("/login");
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // Fetch redeemed coupons and merchandise
  useEffect(() => {
    if (user) {
      // Fetch redeemed coupons for this user only
      supabase
        .from("coupons")
        .select("*")
        .contains("redeemed_by", [user.id])
        .order("created_at", { ascending: false })
        .then(({ data }) => setMyCoupons(data ?? []));

      // Fetch all merchandise
      supabase
        .from("merchandise")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data }) => setMerchandise(data ?? []));
    }
  }, [user, redeemStatus, merchRedeemStatus]);

  // Handle Redeem Coupon (NO coins needed to redeem, just code)
  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemStatus("");
    if (!redeemCode.trim()) {
      setRedeemStatus("Please enter a coupon code.");
      return;
    }
    // Find coupon by code and active
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", redeemCode.trim())
      .eq("is_active", true)
      .single();
    if (error || !coupon) {
      setRedeemStatus("Invalid or inactive coupon code.");
      return;
    }
    // Check if already redeemed
    if (coupon.redeemed_by && coupon.redeemed_by.includes(user!.id)) {
      setRedeemStatus("You have already redeemed this coupon.");
      return;
    }
    // Mark as redeemed: add user.id to redeemed_by
    const { error: updateCouponErr } = await supabase
      .from("coupons")
      .update({
        redeemed_by: coupon.redeemed_by
          ? [...coupon.redeemed_by, user!.id]
          : [user!.id],
      })
      .eq("id", coupon.id);
    if (updateCouponErr) {
      setRedeemStatus("Failed to redeem coupon. Try again.");
      return;
    }
    // Add coins to worker profile
    const { error: updateProfileErr } = await supabase
      .from("profiles")
      .update({ coins: (profile?.coins ?? 0) + coupon.coins })
      .eq("id", user!.id);
    if (updateProfileErr) {
      setRedeemStatus("Failed to update coins. Contact admin.");
      return;
    }
    setCoins((prev) => prev + coupon.coins);
    setRedeemStatus(
      `Coupon "${coupon.code}" redeemed successfully!${coupon.description ? " (" + coupon.description + ")" : ""}`
    );
    setRedeemCode("");
  };

  // Handle Merchandise Redemption (atomic and robust)
  const handleRedeemMerchandise = async (merch: Merchandise) => {
    setMerchRedeemStatus("");
    // Refetch latest profile and merchandise (to avoid race conditions)
    const { data: latestProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();

    if (profileError || !latestProfile) {
      setMerchRedeemStatus("Failed to fetch latest profile. Try again.");
      return;
    }

    const { data: latestMerch, error: merchError } = await supabase
      .from("merchandise")
      .select("*")
      .eq("id", merch.id)
      .single();

    if (merchError || !latestMerch) {
      setMerchRedeemStatus("Failed to fetch merchandise. Try again.");
      return;
    }

    // Check if user already redeemed this merchandise
    if (latestMerch.redeemed_by && latestMerch.redeemed_by.includes(user!.id)) {
      setMerchRedeemStatus("You have already redeemed this merchandise.");
      return;
    }

    // Check coins
    if ((latestProfile.coins ?? 0) < latestMerch.coins) {
      setMerchRedeemStatus("Not enough coins to redeem this merchandise.");
      return;
    }

    // Start transaction-like update
    // 1. Update merchandise's redeemed_by atomically
    const { error: updateMerchErr } = await supabase
      .from("merchandise")
      .update({
        redeemed_by: latestMerch.redeemed_by
          ? [...latestMerch.redeemed_by, user!.id]
          : [user!.id],
      })
      .eq("id", merch.id);

    if (updateMerchErr) {
      setMerchRedeemStatus("Failed to redeem merchandise. Try again.");
      return;
    }

    // 2. Deduct coins from worker (use latestProfile)
    const { error: updateProfileErr } = await supabase
      .from("profiles")
      .update({ coins: (latestProfile.coins ?? 0) - latestMerch.coins })
      .eq("id", user!.id);

    if (updateProfileErr) {
      // Rollback: remove user from redeemed_by array (best-effort, optional)
      await supabase
        .from("merchandise")
        .update({
          redeemed_by: latestMerch.redeemed_by ? latestMerch.redeemed_by : [],
        })
        .eq("id", merch.id);
      setMerchRedeemStatus("Failed to update coins. Contact admin.");
      return;
    }

    setCoins((prev) => prev - latestMerch.coins);
    setMerchRedeemStatus("Congratulations! You have successfully redeemed this merchandise.");
    // Optionally, refresh merchandise state
    supabase
      .from("merchandise")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setMerchandise(data ?? []));
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.replace("/login");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className={styles.workerPageWrapper}>
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
      <div className={styles.workerDashboardWrapper}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <h2 className={styles.sidebarHeader}>Worker</h2>
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
              style={{ marginTop: "auto", color: "#e53e3e" }}
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Dashboard Section */}
          {section === "dashboard" && (
            <>
              <div className={styles.dashboardHeader}>
                <h2>Worker Dashboard</h2>
              </div>
              <section className={styles.sectionBox}>
                <h3>Hello, {profile?.name}!</h3>
                <div className={styles.coinsSection}>
                  <span className={styles.coinsLabel}>Your Coins:</span>
                  <span className={styles.coinsValue}>{coins}</span>
                </div>
              </section>
            </>
          )}

          {/* Coupons Section */}
          {section === "coupons" && (
            <section className={styles.sectionBox}>
              <h3>Redeem Coupon</h3>
              <form className={styles.redeemForm} onSubmit={handleRedeem}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value)}
                  className={styles.input}
                />
                <button type="submit" className={styles.button}>
                  Redeem
                </button>
              </form>
              {redeemStatus && (
                <p
                  className={
                    redeemStatus.toLowerCase().includes("success")
                      ? styles.successMsg
                      : styles.errorMsg
                  }
                >
                  {redeemStatus}
                </p>
              )}
              {/* Only show redeemed coupons */}
              <div className={styles.myCouponsBox}>
                <h4>My Redeemed Coupons</h4>
                {myCoupons.length === 0 ? (
                  <p>You have not redeemed any coupons yet.</p>
                ) : (
                  <ul className={styles.couponList}>
                    {myCoupons.map((coupon) => (
                      <li key={coupon.id}>
                        <b>{coupon.code}</b>
                        {coupon.description && <> - {coupon.description}</>}
                        <br />
                        <span style={{ color: "#253858" }}>
                          Redeemed: {new Date(coupon.created_at).toLocaleDateString()}
                        </span>
                        <br />
                        <span style={{ color: "#22c55e", fontWeight: 600 }}>
                          +{coupon.coins} coins
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          )}

          {/* Merchandise Section */}
          {section === "merchandise" && (
            <section className={styles.sectionBox}>
              <h3>Merchandise</h3>
              {merchRedeemStatus && (
                <p
                  className={
                    merchRedeemStatus.toLowerCase().includes("congratulations")
                      ? styles.successMsg
                      : styles.errorMsg
                  }
                >
                  {merchRedeemStatus}
                </p>
              )}
              <div className={styles.grid}>
                {merchandise.length === 0 && <p>No merchandise available.</p>}
                {merchandise.map((m) => (
                  <div key={m.id} className={styles.card}>
                    {isExternal(m.imageurl) ? (
                      <img
                        src={m.imageurl}
                        alt={m.name}
                        className={styles.image}
                        style={{ maxHeight: 100, marginBottom: 12 }}
                      />
                    ) : (
                      <Image
                        src={m.imageurl || "/placeholder.png"}
                        alt={m.name}
                        className={styles.image}
                        width={120}
                        height={100}
                        style={{ marginBottom: 12, objectFit: "cover" }}
                        priority={false}
                      />
                    )}
                    <h4 style={{ fontWeight: 700, marginBottom: 10 }}>{m.name}</h4>
                    <p className={styles.description}>{m.description}</p>
                    <div style={{ fontWeight: 700, fontSize: "1.13rem", margin: "10px 0 18px 0" }}>
                      <span style={{ fontWeight: 700 }}>Coins required: </span>
                      <span style={{ fontWeight: 500 }}>{m.coins}</span>
                    </div>
                    <button
                      className={styles.button}
                      disabled={coins < m.coins || (m.redeemed_by && m.redeemed_by.includes(user!.id))}
                      onClick={() => handleRedeemMerchandise(m)}
                      style={{
                        marginTop: 10,
                        background: coins < m.coins ? "#ccc" : "#22c55e",
                        color: "#fff",
                        border: coins < m.coins ? "2px solid #ccc" : "2px solid #22c55e",
                        cursor: coins < m.coins ? "not-allowed" : "pointer",
                        fontWeight: 700,
                        fontSize: "1.13rem",
                        minWidth: "120px"
                      }}
                    >
                      {m.redeemed_by && m.redeemed_by.includes(user!.id)
                        ? "Redeemed"
                        : coins < m.coins
                        ? "Not enough coins"
                        : "Redeem"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
