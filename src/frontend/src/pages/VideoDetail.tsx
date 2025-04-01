import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import "./VideoDetail.css";

interface Video {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_size: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  project: { id: string; title: string } | null;
  project_id: string | null;
}

const VideoDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchVideo(id);
    }
  }, [id, user]);

  const fetchVideo = async (videoId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("videos")
        .select(`
          *,
          projects (id, title)
        `)
        .eq("id", videoId)
        .single();

      if (error) {
        throw error;
      }

      // Format the data to match our interface
      const formattedVideo = {
        ...data,
        project: data.projects,
        project_id: data.project_id
      };

      setVideo(formattedVideo);
    } catch (err) {
      console.error("Error fetching video:", err);
      setError("Failed to load video. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      // If video is part of a project, navigate to project page, otherwise to videos list
      if (video?.project_id) {
        navigate(`/projects/${video.project_id}`);
      } else {
        navigate("/videos");
      }
    } catch (err) {
      console.error("Error deleting video:", err);
      setError("Failed to delete video. Please try again.");
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(mb * 1000).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "uploaded":
        return "status-uploaded";
      case "transcribing":
        return "status-transcribing";
      case "processing":
        return "status-processing";
      case "completed":
        return "status-completed";
      case "failed":
        return "status-failed";
      default:
        return "";
    }
  };

  if (loading) {
    return <div className="loading">Loading video...</div>;
  }

  if (error || !video) {
    return (
      <div className="error-container">
        <div className="error-message">{error || "Video not found"}</div>
        <button onClick={() => navigate(-1)} className="button button-secondary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="video-detail-page">
      <div className="video-detail-header">
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back
        </button>
        
        {video.project && (
          <div className="video-project-info">
            <span>Project: </span>
            <Link to={`/projects/${video.project_id}`} className="project-link">
              {video.project.title}
            </Link>
          </div>
        )}
      </div>
      
      <div className="video-player-container">
        {video.file_url ? (
          <video 
            className="video-player" 
            src={video.file_url} 
            controls 
            poster={video.file_url ? undefined : "/video-placeholder.jpg"}
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="video-placeholder">
            <div className="video-placeholder-text">
              No video available
            </div>
          </div>
        )}
      </div>

      <div className="video-info-container">
        <div className="video-title-row">
          <h1 className="video-title">{video.title}</h1>
          <span className={`video-status ${getStatusClass(video.status)}`}>
            {video.status}
          </span>
        </div>
        
        <div className="video-meta">
          <span>Uploaded on {formatDate(video.created_at)}</span>
          {video.file_size && (
            <span className="video-size">{formatFileSize(video.file_size)}</span>
          )}
        </div>
        
        <div className="video-actions">
          <Link to={`/videos/${id}/edit`} className="button">
            Edit Video
          </Link>
          
          {video.status === "uploaded" && (
            <button className="button button-secondary">
              Start Transcription
            </button>
          )}
          
          <button 
            className="button button-danger" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Video"}
          </button>
        </div>

        {video.description && (
          <div className="video-description">
            <h2>Description</h2>
            <p>{video.description}</p>
          </div>
        )}
        
        {/* Future sections for transcripts, excerpts, etc. would go here */}
      </div>
    </div>
  );
};

export default VideoDetail;