import React from "react";
import { Link } from "react-router-dom";
import "./VideoCard.css";

interface VideoCardProps {
  id: string;
  title: string;
  description?: string | null;
  file_url?: string | null;
  file_size?: number | null;
  status?: string;
  created_at: string;
  project?: { title: string } | null;
  project_id?: string | null;
}

const VideoCard: React.FC<VideoCardProps> = ({
  id,
  title,
  description,
  file_url,
  file_size,
  status,
  created_at,
  project,
  project_id
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "Unknown size";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(mb * 1000).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  const getStatusClass = (status?: string) => {
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

  return (
    <div className="video-card">
      <Link to={`/videos/${id}`} className="video-card-link">
        <div className="video-thumbnail">
          {file_url ? (
            <div className="has-video">
              <div className="play-icon">▶</div>
            </div>
          ) : (
            <div className="thumbnail-placeholder">
              <span>No Video</span>
            </div>
          )}
          {status && <span className={`video-status ${getStatusClass(status)}`}>{status}</span>}
        </div>
        <div className="video-info">
          <h3 className="video-title">{title}</h3>
          {description && <p className="video-description">{description}</p>}
          
          <div className="video-meta">
            {file_size && <span className="video-size">{formatFileSize(file_size)}</span>}
            <span className="video-date">Added on {formatDate(created_at)}</span>
          </div>
          
          {project && (
            <div className="video-project">
              <span className="project-label">Project:</span>
              <Link to={`/projects/${project_id}`} className="project-link" onClick={(e) => e.stopPropagation()}>
                {project.title}
              </Link>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;