// src/frontend/src/pages/Register.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { signUp, error, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form validation
    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    if (!password) {
      setFormError("Password is required");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp(email, password);
      
      if (!error) {
        setSuccess(true);
        // Clear form fields
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Registration error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Sign up for a new account</p>

        {success ? (
          <div className="auth-success">
            <h3>Registration successful!</h3>
            <p>Please check your email to confirm your account.</p>
            <Link to="/login" className="button auth-button">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {(formError || error) && (
              <div className="auth-error">
                {formError || error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                placeholder="Enter your password"
                disabled={isSubmitting}
              />
              <small className="form-text">Password must be at least 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-control"
                placeholder="Confirm your password"
                disabled={isSubmitting}
              />
            </div>

            <button 
              type="submit" 
              className="button auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;