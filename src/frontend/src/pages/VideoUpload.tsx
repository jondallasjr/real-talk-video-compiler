import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import supabase from "../utils/supabase";
import { ENDPOINTS, fetchApi, uploadFileWithProgress } from "../utils/api";
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
      if (!file || !user) {
        throw new Error(file ? "User not authenticated" : "No file selected");
      }
      
      // Use FormData to send file to the backend
      const formData = new FormData();
      formData.append('video', file);
      
      console.log("Uploading video file to backend:", file.name);
      console.log('Starting upload process...');
      
      // Log FormData contents for debugging
      const formDataLog: {key: string, value: string}[] = [];
      formData.forEach((value, key) => {
        formDataLog.push({
          key,
          value: value instanceof File ? `File: ${value.name}` : String(value)
        });
      });
      console.log('FormData contains:', formDataLog);

      // Verify server connectivity first with debug endpoint
      try {
        console.log('Checking server connectivity...');
        const debugResponse = await fetchApi(ENDPOINTS.DEBUG, {}, user.id);
        const debugData = await debugResponse.json();
        console.log('Server is connected:', debugData);
      } catch (debugError) {
        console.error('Server connectivity check failed:', debugError);
        // Continue with upload attempt even if debug check fails
      }
      
      // Declare uploadResult variable
      let uploadResult;
      
      try {
        // Try fetch API first (without progress tracking)
        console.log(`Uploading to ${ENDPOINTS.VIDEO_UPLOAD}`);
        const response = await fetchApi(
          ENDPOINTS.VIDEO_UPLOAD,
          {
            method: 'POST',
            body: formData
          },
          user.id
        );
        
        // Parse the response
        uploadResult = await response.json();
        console.log('Upload successful:', uploadResult);
      } catch (fetchError) {
        console.error('Fetch API upload failed:', fetchError);
        console.log('Falling back to XMLHttpRequest for progress tracking...');
        
        // Use XMLHttpRequest for progress tracking
        uploadResult = await uploadFileWithProgress(
          ENDPOINTS.VIDEO_UPLOAD,
          formData,
          user.id,
          (percentage) => {
            setUploadProgress(percentage);
            console.log(`Upload progress: ${percentage}%`);
          }
        );
      }
      
      console.log("Upload result:", uploadResult);
      
      // Now create the video entry using the uploaded file information
      const { file_path, public_url } = uploadResult;
      
      const videoData = {
        title,
        description,
        project_id: selectedProjectId || undefined,
        file_path,
        public_url,  // API maps this to file_url in backend
        size: file?.size || 0,
        status: 'pending'
      };
      
      console.log("Creating video record:", videoData);
      
      // Create a video record in the database through API
      const response = await fetchApi(
        ENDPOINTS.VIDEOS,
        {
          method: 'POST',
          body: JSON.stringify(videoData)
        },
        user.id
      );
      
      const videoRecord = await response.json();
      
      // Set progress to 100% to indicate completion
      setUploadProgress(100);
      
      // Delay navigation slightly to show the 100% progress state
      setTimeout(() => {
        setIsUploading(false);
        navigate("/videos");
      }, 500);
      
    } catch (error) {
      console.error("Upload error:", error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
      } else {
        console.error("Non-Error object thrown:", error);
      }
      
      // Try to extract more useful error information for the user
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Add some common error diagnoses
      if (errorMessage.includes('404')) {
        errorMessage += ' - Endpoint not found. Please check server configuration and routes.';
      } else if (errorMessage.includes('Network')) {
        errorMessage += ' - Check if the backend server is running.';
      }
      
      setErrors({ ...errors, submit: `Failed to upload video: ${errorMessage}` });
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