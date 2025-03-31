import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VideoDetail.css";

interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: number;
  createdAt: string;
}

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        // In a real app, this would fetch from an API
        // For now, we'll use dummy data
        const dummyVideos: { [key: string]: Video } = {
          "1": {
            id: "1",
            title: "Introduction to Real Talk Series",
            description: "This video introduces the Real Talk series, explaining the purpose and what viewers can expect from future episodes. We dive into the philosophy behind authentic content creation and how it connects with audiences.",
            videoUrl: "https://example.com/videos/intro.mp4",
            duration: 320,
            createdAt: "2023-05-15T10:30:00Z",
          },
          "2": {
            id: "2",
            title: "Behind the Scenes: Creating Authentic Content",
            description: "Go behind the scenes to see how authentic content is created. This episode covers everything from planning to execution, focusing on maintaining authenticity throughout the creative process.",
            videoUrl: "https://example.com/videos/behind-scenes.mp4",
            duration: 540,
            createdAt: "2023-06-22T14:15:00Z",
          },
          "3": {
            id: "3",
            title: "How to Connect with Your Audience",
            description: "Learn strategies for connecting with your audience on a deeper level. This video discusses the importance of vulnerability, storytelling, and creating meaningful engagement.",
            videoUrl: "https://example.com/videos/connect.mp4",
            duration: 420,
            createdAt: "2023-07-10T09:45:00Z",
          },
          "4": {
            id: "4",
            title: "Real Talk: Facing Challenges as a Creator",
            description: "A candid discussion about the challenges creators face and strategies to overcome them. Topics include burnout, creative blocks, dealing with negative feedback, and maintaining motivation.",
            videoUrl: "https://example.com/videos/challenges.mp4",
            duration: 680,
            createdAt: "2023-08-05T16:20:00Z",
          },
        };

        // Simulate API delay
        setTimeout(() => {
          if (id && dummyVideos[id]) {
            setVideo(dummyVideos[id]);
            setLoading(false);
          } else {
            setError("Video not found");
            setLoading(false);
          }
        }, 1000);
      } catch (err) {
        setError("Failed to load video. Please try again later.");
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="loading">Loading video...</div>;
  }

  if (error || !video) {
    return (
      <div className="error-container">
        <div className="error-message">{error || "Video not found"}</div>
        <button onClick={handleBack} className="button button-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="video-detail-page">
      <button onClick={handleBack} className="back-button">
        &larr; Back to Videos
      </button>
      
      <div className="video-player-container">
        <div className="video-player">
          {/* In a real app, this would be a video player component */}
          <div className="video-placeholder">
            <div className="video-placeholder-text">
              Video Player: {video.title}
            </div>
          </div>
        </div>
      </div>

      <div className="video-info-container">
        <h1 className="video-title">{video.title}</h1>
        <p className="video-meta">Uploaded on {formatDate(video.createdAt)}</p>
        
        <div className="video-actions">
          <button className="button">Edit Video</button>
          <button className="button button-secondary">Share</button>
          <button className="button button-danger">Delete</button>
        </div>

        <div className="video-description">
          <h2>Description</h2>
          <p>{video.description}</p>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;