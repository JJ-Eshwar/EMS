// src/app/login/page.tsx
"use client"; // This needs to be a client component to use hooks and handle form submission

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false, // Prevent NextAuth from automatically redirecting
        email: email,
        password: password,
      });

      if (result?.error) {
        // Handle specific errors if needed, otherwise show a generic message
        console.error("Sign-in error:", result.error);
        setError("Invalid email or password. Please try again."); // Provide user-friendly error
        setIsLoading(false);
      } else if (result?.ok) {
        // Sign-in successful, redirect to the dashboard
        console.log("Sign-in successful, redirecting...");
        router.push("/dashboard"); // Redirect to your dashboard page
        // No need to setIsLoading(false) here as we are navigating away
      } else {
         // Handle unexpected cases where result is null or not ok without error
         setError("An unexpected error occurred. Please try again.");
         setIsLoading(false);
      }
    } catch (err) {
      console.error("Caught exception during sign-in:", err);
      setError("An error occurred during sign-in.");
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      {/* Optional: Add link to registration page */}
      {/* <p>Don't have an account? <a href="/register">Sign Up</a></p> */}
    </div>
  );
};

export default LoginPage;
