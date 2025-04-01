import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import "./VideoList.css";

interface Video {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_size: number | null;
  status: string;
  created_at: string;
  project: { title: string } | null;
  project_id: string | null;
}

const VideoList: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("videos")
          .select(`
            *,
            projects (id, title)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Map the data to match the Video interface
        const formattedVideos = data.map((video: any) => ({
          ...video,
          project: video.projects,
          project_id: video.project_id
        }));

        setVideos(formattedVideos);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVideos();
    }
  }, [user]);

  // Filter videos based on search term
  const filteredVideos = videos.filter((video) =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="video-list-page">
      <div className="video-list-header">
        <h1 className="page-title">Your Videos</h1>
        <Link to="/upload" className="button upload-button">
          Upload New Video
        </Link>
      </div>
      
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
          {searchTerm ? (
            "No videos matching your search."
          ) : (
            <div className="empty-state">
              <h2>No videos found</h2>
              <p>Upload your first video to get started!</p>
              <Link to="/upload" className="button">
                Upload Video
              </Link>
            </div>
          )}
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