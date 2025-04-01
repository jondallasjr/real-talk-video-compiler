// src/frontend/src/pages/Login.tsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { signIn, error, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Form validation
    if (!email.trim()) {
      setFormError("Email is required");
      return;
    }

    if (!password) {
      setFormError("Password is required");
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(email, password);
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Log In</h1>
        <p className="auth-subtitle">Sign in to your account</p>

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
          </div>

          <button 
            type="submit" 
            className="button auth-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;