import express, { Request, Response } from 'express';
import fileUpload from 'express-fileupload';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase';
import path from 'path';

// Create a router
const router = express.Router();

// Log that this module is being loaded
console.log("*** Loading video routes module ***");

// Test route to confirm the videos router is working
router.get('/test', (req: Request, res: Response) => {
  console.log('Video test route hit');
  res.json({ 
    status: 'ok',
    message: 'Video routes are working',
    routes: {
      'GET /': 'Get all videos',
      'GET /project/:projectId': 'Get videos for a project',
      'GET /:id': 'Get a single video',
      'POST /upload': 'Upload a video file',
      'POST /': 'Create a video record',
      'PUT /:id': 'Update a video',
      'DELETE /:id': 'Delete a video'
    }
  });
});

// Get all videos
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('videos')
      .select('*')
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

// Get videos for a specific project
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const { projectId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
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
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
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

// Upload a video file
console.log("*** Registering POST /upload route for video uploads ***");
router.post('/upload', async (req: Request, res: Response) => {
  try {
    console.log('Video upload route hit');
    const userId = req.headers['user-id'] as string;
    console.log('User ID from headers:', userId);
    
    if (!userId) {
      console.log('No user ID found in headers');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const reqWithFiles = req as Request & { files?: fileUpload.FileArray };
    console.log('Files in request:', reqWithFiles.files ? Object.keys(reqWithFiles.files) : 'No files');
    
    if (!reqWithFiles.files || Object.keys(reqWithFiles.files).length === 0) {
      console.log('No files were uploaded');
      return res.status(400).json({ error: 'No files were uploaded' });
    }
    
    // Access the uploaded file
    console.log('Available files:', Object.keys(reqWithFiles.files));
    const videoFile = reqWithFiles.files.video as fileUpload.UploadedFile;
    
    if (!videoFile) {
      console.log('Video file not found in request');
      return res.status(400).json({ error: 'Video file is required' });
    }
    
    console.log('Video file details:', {
      name: videoFile.name,
      size: videoFile.size,
      mimetype: videoFile.mimetype
    });
    
    const fileId = uuidv4();
    const fileExt = path.extname(videoFile.name);
    const fileName = `${fileId}${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    console.log('Generated file path:', filePath);
    
    console.log('Starting Supabase upload...');
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('videos')
      .upload(filePath, videoFile.data, {
        contentType: videoFile.mimetype,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }
    
    console.log('Upload successful:', data);
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);
    
    console.log('Public URL:', publicUrlData.publicUrl);
    
    const response = { 
      file_id: fileId,
      file_name: fileName,
      file_path: filePath,
      public_url: publicUrlData.publicUrl,
      content_type: videoFile.mimetype,
      size: videoFile.size
    };
    console.log('Sending response:', response);
    
    return res.status(201).json(response);
  } catch (error) {
    console.error('Error uploading video:', error);
    console.log('Error details:', error);
    return res.status(500).json({ 
      error: 'Failed to upload video', 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

// Create a new video record
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.headers['user-id'] as string;
    const { title, description, project_id, file_path, public_url, duration, status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!title || !file_path) {
      return res.status(400).json({ error: 'Title and file_path are required' });
    }
    
    // Verify project exists and belongs to user if project_id is provided
    if (project_id) {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project_id)
        .eq('user_id', userId)
        .single();
      
      if (projectError) {
        if (projectError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Project not found' });
        }
        throw projectError;
      }
    }
    
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          id: uuidv4(),
          user_id: userId,
          project_id,
          title,
          description,
          file_path,
          public_url,
          duration: duration || 0,
          status: status || 'pending',
          processing_status: 'pending'
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
    const { id } = req.params;
    const { title, description, project_id, status, processing_status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if video exists and belongs to user
    const { data: existingVideo, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Video not found' });
      }
      throw fetchError;
    }
    
    // Update fields
    const updateData: any = {
      updated_at: new Date()
    };
    
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (project_id) updateData.project_id = project_id;
    if (status) updateData.status = status;
    if (processing_status) updateData.processing_status = processing_status;
    
    const { data, error } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', id)
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
    const { id } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if video exists and belongs to user
    const { data: existingVideo, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Video not found' });
      }
      throw fetchError;
    }
    
    // Delete from storage if file_path exists
    if (existingVideo.file_path) {
      const { error: storageError } = await supabase.storage
        .from('videos')
        .remove([existingVideo.file_path]);
      
      if (storageError) {
        console.error('Error removing video file:', storageError);
        // Continue with DB deletion even if storage deletion fails
      }
    }
    
    // Delete from database
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id)
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