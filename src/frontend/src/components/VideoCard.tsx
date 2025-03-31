import React from "react";
import { Link } from "react-router-dom";
import "./VideoCard.css";

interface VideoCardProps {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  createdAt: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  thumbnail,
  duration,
  createdAt,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="video-card">
      <Link to={`/videos/${id}`} className="video-card-link">
        <div className="video-thumbnail">
          {thumbnail ? (
            <img src={thumbnail} alt={title} />
          ) : (
            <div className="thumbnail-placeholder">
              <span>No Preview</span>
            </div>
          )}
          {duration && <span className="video-duration">{formatDuration(duration)}</span>}
        </div>
        <div className="video-info">
          <h3 className="video-title">{title}</h3>
          <p className="video-date">Added on {formatDate(createdAt)}</p>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;