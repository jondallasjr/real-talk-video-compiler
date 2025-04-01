import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import "./ProjectDetail.css";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Video {
  id: string;
  title: string;
  description: string | null;
  file_path: string | null;
  status: string;
  created_at: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchProject(id);
      fetchVideos(id);
    }
  }, [id, user]);

  const fetchProject = async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        throw error;
      }

      setProject(data);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError("Failed to load project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setVideos(data || []);
    } catch (err) {
      console.error("Error fetching videos:", err);
      // We don't set the main error state here to avoid blocking project display
    }
  };

  const handleDeleteProject = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete this project? This will also delete all videos in this project.")) {
        return;
      }

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      navigate("/projects");
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. Please try again.");
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "status-badge-active";
      case "completed":
        return "status-badge-completed";
      case "archived":
        return "status-badge-archived";
      default:
        return "";
    }
  };

  if (loading) {
    return <div className="loading">Loading project...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!project) {
    return <div className="error-message">Project not found</div>;
  }

  return (
    <div className="project-detail-container">
      <div className="project-detail-header">
        <div className="project-detail-title">
          <h1>{project.title}</h1>
          <span className={`status-badge ${getStatusClass(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <div className="project-actions">
          <Link to={`/projects/${id}/edit`} className="button">
            Edit Project
          </Link>
          <button onClick={handleDeleteProject} className="button button-danger">
            Delete Project
          </button>
        </div>
      </div>

      <div className="project-detail-content">
        <div className="project-detail-info">
          <h2>Project Details</h2>
          
          <div className="info-group">
            <h3>Description</h3>
            <p>{project.description || "No description provided"}</p>
          </div>
          
          <div className="info-group">
            <h3>Created</h3>
            <p>{new Date(project.created_at).toLocaleString()}</p>
          </div>
          
          <div className="info-group">
            <h3>Last Updated</h3>
            <p>{new Date(project.updated_at).toLocaleString()}</p>
          </div>
        </div>

        <div className="project-videos">
          <div className="videos-header">
            <h2>Videos</h2>
            <Link to={`/projects/${id}/videos/upload`} className="button">
              Upload Video
            </Link>
          </div>

          {videos.length === 0 ? (
            <div className="empty-videos">
              <p>No videos in this project yet</p>
              <Link to={`/projects/${id}/videos/upload`} className="button">
                Upload Your First Video
              </Link>
            </div>
          ) : (
            <div className="videos-list">
              {videos.map((video) => (
                <div key={video.id} className="video-card">
                  <div className="video-card-header">
                    <h3 className="video-title">
                      <Link to={`/videos/${video.id}`}>{video.title}</Link>
                    </h3>
                    <span className={`video-status status-${video.status}`}>
                      {video.status}
                    </span>
                  </div>
                  
                  <p className="video-description">
                    {video.description || "No description provided"}
                  </p>
                  
                  <div className="video-card-footer">
                    <span className="video-date">
                      Added: {new Date(video.created_at).toLocaleDateString()}
                    </span>
                    
                    <div className="video-actions">
                      <Link 
                        to={`/videos/${video.id}`} 
                        className="button button-small"
                      >
                        View
                      </Link>
                      <Link 
                        to={`/videos/${video.id}/edit`}
                        className="button button-small button-outline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="back-link">
        <Link to="/projects">← Back to Projects</Link>
      </div>
    </div>
  );
};

export default ProjectDetail;