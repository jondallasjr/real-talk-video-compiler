import express, { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import supabase from '../config/supabase';

const router = express.Router();

// Middleware for file uploads
router.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Get all videos for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        projects (title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Get videos by project ID
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const projectId = req.params.projectId;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching project videos:', error);
    return res.status(500).json({ error: 'Failed to fetch project videos' });
  }
});

// Get a single video by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const videoId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from('videos')
      .select(`
        *,
        projects (id, title)
      `)
      .eq('id', videoId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Video not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching video:', error);
    return res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// Upload a new video
router.post('/upload', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if request has files
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files were uploaded' });
    }

    const videoFile = req.files.video as fileUpload.UploadedFile;
    const { title, description, projectId } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Validate file type
    const fileExtension = path.extname(videoFile.name).toLowerCase();
    const validExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
    
    if (!validExtensions.includes(fileExtension)) {
      return res.status(400).json({ error: 'Invalid file type. Only video files are allowed' });
    }

    // Generate a unique filename
    const filename = `${uuidv4()}${fileExtension}`;
    const folderPath = `videos/${userId}`;
    const fullPath = `${folderPath}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fullPath, videoFile.data, {
        contentType: videoFile.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('videos')
      .getPublicUrl(fullPath);

    // Create database record
    const videoId = uuidv4();
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          id: videoId,
          user_id: userId,
          project_id: projectId || null,
          title,
          description,
          file_path: fullPath,
          file_url: urlData.publicUrl,
          file_size: videoFile.size,
          status: 'uploaded'
        }
      ])
      .select();

    if (error) {
      // Attempt to delete the uploaded file if database insert fails
      await supabase.storage.from('videos').remove([fullPath]);
      throw error;
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Create a new video (metadata only)
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const { title, description, projectId, file_path, file_url, file_size } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const videoId = uuidv4();
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          id: videoId,
          user_id: userId,
          project_id: projectId || null,
          title,
          description,
          file_path,
          file_url,
          file_size,
          status: 'uploaded'
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating video:', error);
    return res.status(500).json({ error: 'Failed to create video' });
  }
});

// Update a video
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const videoId = req.params.id;
    const { title, description, projectId, status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if video exists and belongs to user
    const { data: existingVideo, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Video not found' });
      }
      throw fetchError;
    }

    // Update video
    const { data, error } = await supabase
      .from('videos')
      .update({
        title: title || existingVideo.title,
        description: description !== undefined ? description : existingVideo.description,
        project_id: projectId !== undefined ? projectId : existingVideo.project_id,
        status: status || existingVideo.status,
        updated_at: new Date()
      })
      .eq('id', videoId)
      .eq('user_id', userId)
      .select();

    if (error) {
      throw error;
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Error updating video:', error);
    return res.status(500).json({ error: 'Failed to update video' });
  }
});

// Delete a video
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const videoId = req.params.id;
    
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get video details to delete the file
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Video not found' });
      }
      throw fetchError;
    }

    // Delete the file from storage if it exists
    if (video.file_path) {
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([video.file_path]);
      
      if (storageError) {
        console.error('Error deleting video file:', storageError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', videoId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({ error: 'Failed to delete video' });
  }
});

export default router;