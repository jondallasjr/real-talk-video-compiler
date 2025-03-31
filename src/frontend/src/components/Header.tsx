import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">Real Talk Video Compiler</Link>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/" className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/videos" className="nav-link">Videos</Link>
            </li>
            <li className="nav-item">
              <Link to="/upload" className="nav-link">Upload</Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;