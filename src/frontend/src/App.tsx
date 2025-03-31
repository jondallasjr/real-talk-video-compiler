import React from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import VideoUpload from "./pages/VideoUpload";
import VideoList from "./pages/VideoList";
import VideoDetail from "./pages/VideoDetail";
import NotFound from "./pages/NotFound";

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<VideoUpload />} />
          <Route path="/videos" element={<VideoList />} />
          <Route path="/videos/:id" element={<VideoDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;