import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import "./ProjectList.css";

interface Project {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this project?")) {
        return;
      }

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        throw error;
      }

      // Update the projects list after deletion
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (err) {
      console.error("Error deleting project:", err);
      setError("Failed to delete project. Please try again.");
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "active":
        return "status-active";
      case "completed":
        return "status-completed";
      case "archived":
        return "status-archived";
      default:
        return "";
    }
  };

  return (
    <div className="project-list-container">
      <div className="project-list-header">
        <h1>My Projects</h1>
        <Link to="/projects/new" className="button create-project-button">
          Create Project
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-indicator">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <h2>No projects yet</h2>
          <p>Create your first project to get started</p>
          <Link to="/projects/new" className="button">
            Create Project
          </Link>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h2 className="project-title">
                  <Link to={`/projects/${project.id}`}>{project.title}</Link>
                </h2>
                <span className={`project-status ${getStatusClass(project.status)}`}>
                  {project.status}
                </span>
              </div>
              
              <p className="project-description">
                {project.description || "No description provided"}
              </p>
              
              <div className="project-card-footer">
                <span className="project-date">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </span>
                
                <div className="project-actions">
                  <Link 
                    to={`/projects/${project.id}`} 
                    className="button button-small"
                  >
                    View
                  </Link>
                  <Link 
                    to={`/projects/${project.id}/edit`}
                    className="button button-small button-outline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="button button-small button-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;