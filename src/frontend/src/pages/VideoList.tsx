import React, { useState, useEffect } from "react";
import VideoCard from "../components/VideoCard";
import "./VideoList.css";

interface Video {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  createdAt: string;
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // In a real app, this would come from an API
        // For now, we'll use dummy data
        const dummyVideos: Video[] = [
          {
            id: "1",
            title: "Introduction to Real Talk Series",
            duration: 320,
            createdAt: "2023-05-15T10:30:00Z",
          },
          {
            id: "2",
            title: "Behind the Scenes: Creating Authentic Content",
            duration: 540,
            createdAt: "2023-06-22T14:15:00Z",
          },
          {
            id: "3",
            title: "How to Connect with Your Audience",
            duration: 420,
            createdAt: "2023-07-10T09:45:00Z",
          },
          {
            id: "4",
            title: "Real Talk: Facing Challenges as a Creator",
            duration: 680,
            createdAt: "2023-08-05T16:20:00Z",
          },
        ];

        // Simulate API delay
        setTimeout(() => {
          setVideos(dummyVideos);
          setLoading(false);
        }, 1000);
      } catch (err) {
        setError("Failed to load videos. Please try again later.");
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Filter videos based on search term
  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="video-list-page">
      <h1 className="page-title">Your Videos</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Loading videos...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredVideos.length === 0 ? (
        <div className="no-videos">
          {searchTerm
            ? "No videos matching your search."
            : "No videos found. Upload your first video!"}
        </div>
      ) : (
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <VideoCard key={video.id} {...video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoList;