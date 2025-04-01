import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VideoUpload from "./pages/VideoUpload";
import VideoList from "./pages/VideoList";
import VideoDetail from "./pages/VideoDetail";
import NotFound from "./pages/NotFound";
import { useAuth } from "./context/AuthContext";

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Home />} />
            <Route path="upload" element={<VideoUpload />} />
            <Route path="videos" element={<VideoList />} />
            <Route path="videos/:id" element={<VideoDetail />} />
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;