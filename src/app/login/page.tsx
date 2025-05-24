"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import styles from "./login.module.css";

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isRegister) {
      // SIGNUP
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpErr || !data.user) {
        setError(signUpErr?.message || JSON.stringify(signUpErr) || "Failed to register.");
        setLoading(false);
        return;
      }

      // Check if profile already exists
      const { data: existing, error: existError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();
      if (existError) {
        setError(
          existError.message +
            (existError.details ? " | Details: " + existError.details : "") +
            (existError.code ? " | Code: " + existError.code : "") +
            (existError.hint ? " | Hint: " + existError.hint : "")
        );
        setLoading(false);
        return;
      }
      if (existing) {
        setError("A user profile already exists for this account.");
        setLoading(false);
        return;
      }

      // Insert profile with role: "pending"
      const { error: profileError } = await supabase.from("profiles").insert([
        { id: data.user.id, name, role: "pending", email, coins: 0 }
      ]);
      if (profileError) {
        console.error("Supabase profile insert error:", profileError);
        setError(
          (profileError.message ? profileError.message + " | " : "") +
          (profileError.details ? "Details: " + profileError.details + " | " : "") +
          (profileError.code ? "Code: " + profileError.code + " | " : "") +
          (profileError.hint ? "Hint: " + profileError.hint : "") ||
          JSON.stringify(profileError) ||
          "Database error saving new user"
        );
        setLoading(false);
        return;
      }

      setLoading(false);
      alert("Registration successful! Please wait for admin approval before logging in.");
      setIsRegister(false);
      setEmail("");
      setPassword("");
      setName("");
    } else {
      // LOGIN
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr || !data.user) {
        setError(signInErr?.message || JSON.stringify(signInErr) || "Login failed.");
        setLoading(false);
        return;
      }
      // Fetch profile for the logged-in user (handle no profile gracefully)
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id);

      if (profileErr) {
        setError(
          (profileErr.message ? profileErr.message + " | " : "") +
          (profileErr.details ? "Details: " + profileErr.details + " | " : "") +
          (profileErr.code ? "Code: " + profileErr.code + " | " : "") +
          (profileErr.hint ? "Hint: " + profileErr.hint : "") ||
          JSON.stringify(profileErr) ||
          "No profile/role found."
        );
        setLoading(false);
        return;
      }
      if (!profiles || profiles.length === 0) {
        setError("No profile/role found for this user. Please contact support or register again.");
        setLoading(false);
        return;
      }
      const profile = profiles[0];

      setLoading(false);
      if (profile.role === "admin") {
        router.push("/admin");
      } else if (profile.role === "worker") {
        router.push("/worker");
      } else if (profile.role === "pending") {
        setError("Your registration is pending approval by the admin. Please wait.");
        await supabase.auth.signOut();
      } else {
        setError("Unknown role. Contact admin.");
      }
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      <form onSubmit={handleAuth} className={styles.formWrapper}>
        <h2 className={styles.formTitle}>{isRegister ? "Worker Registration" : "Login"}</h2>
        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className={styles.input}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className={styles.input}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={loading}
        >
          {loading ? "Processing..." : isRegister ? "Register as Worker" : "Login"}
        </button>
        {error && (
          <>
            <div className={styles.errorMsg}>
              {error}
            </div>
            {/* Development: show raw error if needed */}
            {/* <pre style={{ color: "red", fontSize: "0.85em" }}>{JSON.stringify(error, null, 2)}</pre> */}
          </>
        )}
        <div className={styles.switchText}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <span
                className={styles.linkText}
                onClick={() => setIsRegister(false)}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Worker?{" "}
              <span
                className={styles.linkText}
                onClick={() => setIsRegister(true)}
              >
                Register
              </span>
            </>
          )}
        </div>
        {isRegister && (
          <div style={{ color: "#888", fontSize: "0.93rem", marginTop: "8px", textAlign: "center" }}>
            <b>Note:</b> Admin registration is not allowed here.<br />
            Worker accounts must be approved by admin before login is possible.
          </div>
        )}
      </form>
    </div>
  );
}