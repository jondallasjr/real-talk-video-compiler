import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Create Compelling Real Talk Videos</h1>
          <p>
            Upload, compile, and edit your real talk videos in one place.
            Perfect for content creators, educators, and influencers.
          </p>
          <div className="hero-buttons">
            <Link to="/projects/new" className="button">
              Create New Project
            </Link>
            <Link to="/projects" className="button button-secondary">
              Browse Projects
            </Link>
          </div>
        </div>
      </section>

      <section className="features section">
        <h2 className="section-title">Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📤</div>
            <h3>Easy Upload</h3>
            <p>Upload your video files with a simple drag-and-drop interface.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✂️</div>
            <h3>Smart Compilation</h3>
            <p>Automatically compile your videos into engaging real talk content.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎬</div>
            <h3>Advanced Editing</h3>
            <p>Edit and refine your videos with our intuitive tools.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>Get insights on your video performance and viewer engagement.</p>
          </div>
        </div>
      </section>

      <section className="cta section">
        <div className="cta-content">
          <h2>Ready to Start Your Real Talk Project?</h2>
          <p>Get started now and take your content to the next level.</p>
          <Link to="/projects/new" className="button">
            Create Project
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;