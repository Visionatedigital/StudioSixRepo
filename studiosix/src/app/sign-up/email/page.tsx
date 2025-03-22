"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpEmailPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("firstName") + " " + formData.get("lastName");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const termsAccepted = formData.get("terms") === "on";

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!termsAccepted) {
      setError("Please accept the terms of use");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error creating account");
      }

      // Redirect to sign-in page after successful registration
      router.push("/sign-in");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error creating account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sign-up-container">
      <div className="sign-up-email-card">
        <div className="logo-group">
          <svg width="64" height="71" viewBox="0 0 64 71" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.2392 0H45.311L15.8458 36.2457C15.8458 36.2457 -2.09404 32.5845 9.25563 14.2786L20.2392 0Z" fill="#76B3F8"/>
            <path d="M35.6205 39.5399L22.0741 56.3814C22.0741 56.3814 -16.4598 50.1427 8.29709 15.918C8.29709 15.918 0.839256 32.9498 15.8501 36.2449L35.6205 39.5399Z" fill="#A0EAF6"/>
            <path d="M43.7437 70.4781H18.6719L48.1371 34.2324C48.1371 34.2324 66.0769 37.8936 54.7272 56.1995L43.7437 70.4781Z" fill="#965BF9"/>
            <path d="M28.3594 30.9391L41.9058 14.0977C41.9058 14.0977 80.4397 20.3363 55.6828 54.5611C55.6828 54.5611 63.1406 37.5292 48.1298 34.2342L28.3594 30.9391Z" fill="#DA7AD4"/>
          </svg>
        </div>
        
        <div className="content-wrapper">
          <h1>Sign Up</h1>
          <p className="subtitle">Sign up to start rendering</p>
          
          <form onSubmit={handleSubmit}>
            <div className="form-container">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName"
                  className="input-field" 
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName"
                  className="input-field" 
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  className="input-field" 
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password"
                  className="input-field" 
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  className="input-field" 
                  required
                />
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="terms-checkbox">
              <input type="checkbox" id="terms" name="terms" required />
              <label htmlFor="terms">By checking I agree to the terms of use</label>
            </div>

            <button type="submit" className="register-button" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register"}
            </button>

            <div className="back-to-home">
              <span className="arrow">←</span>
              <Link href="/">Back to home</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 