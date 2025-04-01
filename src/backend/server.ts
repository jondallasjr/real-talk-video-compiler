import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import cors from 'cors';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
}));


// API routes
import videoRoutes from './routes/video.routes';
import projectRoutes from './routes/project.routes';

app.use('/api/videos', videoRoutes);
app.use('/api/projects', projectRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

// Default route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Real Talk Video Compiler API' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;