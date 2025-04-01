import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import { FileOptions } from "@supabase/storage-js";
import "./VideoUpload.css";

// Extended FileOptions type that includes onUploadProgress
interface ExtendedFileOptions extends FileOptions {
  onUploadProgress?: (progress: ProgressEvent) => void;
}

interface Project {
  id: string;
  title: string;
}

const VideoUpload: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || "");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch projects for dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("id, title")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setProjects(data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, [user]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
        setErrors({ ...errors, file: "" });
      } else {
        setErrors({ ...errors, file: "Please upload a valid video file." });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith("video/")) {
        setFile(selectedFile);
        setErrors({ ...errors, file: "" });
      } else {
        setErrors({ ...errors, file: "Please upload a valid video file." });
      }
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!file) {
      newErrors.file = "Please upload a video file";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      if (!file) {
        throw new Error("No file selected");
      }
      
      // Generate a unique file name to avoid collisions
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
      const filePath = `videos/${fileName}`;
      
      // Upload to Supabase Storage with progress tracking
      const uploadOptions: ExtendedFileOptions = {
        cacheControl: '3600',
        upsert: false,
        // Use XMLHttpRequest to track upload progress
        onUploadProgress: (progress: ProgressEvent) => {
          // Calculate percentage
          const percentage = (progress.loaded / progress.total) * 100;
          setUploadProgress(Math.round(percentage));
        },
      };
      
      const { error: uploadError, data } = await supabase.storage
        .from('videos')
        .upload(filePath, file, uploadOptions);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Create record in videos table
      const { error: dbError } = await supabase
        .from('videos')
        .insert([
          {
            title,
            description,
            file_path: filePath,
            status: 'uploaded'
          }
        ]);
        
      if (dbError) {
        throw dbError;
      }
      
      // Set progress to 100% to indicate completion
      setUploadProgress(100);
      
      // Delay navigation slightly to show the 100% progress state
      setTimeout(() => {
        setIsUploading(false);
        navigate("/videos");
      }, 500);
      
    } catch (error) {
      console.error("Upload error:", error);
      setErrors({ ...errors, submit: "Failed to upload video. Please try again." });
      setIsUploading(false);
    }
  };

  return (
    <div className="video-upload-page">
      <h1 className="page-title">Upload New Video</h1>
      
      <div className="card upload-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title*</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={isUploading}
            />
            {errors.title && <div className="error-message">{errors.title}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              disabled={isUploading}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="project">Project</label>
            <select
              id="project"
              className="form-control"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={isUploading || !!projectId}
            >
              <option value="">Select a project (optional)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <small className="form-text">
              {projectId ? "This video will be added to the current project" : "Select a project to add this video to, or leave blank"}
            </small>
          </div>
          
          <div className="form-group">
            <label>Video File*</label>
            <div 
              className={`upload-area ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-size">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
                  {!isUploading && (
                    <button 
                      type="button" 
                      className="remove-file" 
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ) : (
                <div className="upload-message">
                  <div className="upload-icon">📤</div>
                  <p>Drag & drop your video file here or</p>
                  <label className="file-input-label">
                    Browse Files
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="file-input"
                    />
                  </label>
                </div>
              )}
            </div>
            {errors.file && <div className="error-message">{errors.file}</div>}
          </div>
          
          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="progress-text">{uploadProgress}% Uploaded</div>
            </div>
          )}

          {errors.submit && <div className="error-message submit-error">{errors.submit}</div>}
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="button" 
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
            <button 
              type="button" 
              className="button button-secondary" 
              onClick={() => navigate(-1)}
              disabled={isUploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;