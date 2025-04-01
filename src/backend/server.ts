import express, { Request, Response } from 'express';
import path from 'path';
import fileUpload from 'express-fileupload';
import cors from 'cors';
import serverConfig from './config/server.config';

const app = express();
const PORT = serverConfig.port;

// Middleware
app.use(cors({
  origin: serverConfig.corsOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure file upload middleware
console.log("Configuring fileUpload middleware...");
app.use(fileUpload({
  createParentPath: true,
  limits: { 
    fileSize: serverConfig.maxFileSize
  },
  debug: serverConfig.uploadDebug,
}));

// Log middleware configuration
console.log("Express middleware configuration complete");


// API routes
import videoRoutes from './routes/video.routes';
import projectRoutes from './routes/project.routes';

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Default route
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Real Talk Video Compiler API' });
});

// Debug route to check if the server is running and accessible
app.get('/api/debug', (req: Request, res: Response) => {
  console.log("Debug endpoint hit at", new Date().toISOString());
  res.json({ 
    status: 'ok', 
    message: 'Server is running correctly',
    time: new Date().toISOString(),
    routes: {
      video_upload: '/api/videos/upload',
      videos: '/api/videos',
      projects: '/api/projects'
    }
  });
});

// Mount API routes
app.use('/api/videos', videoRoutes);
app.use('/api/projects', projectRoutes);

// Add a 404 handler for API routes - this must come AFTER all API routes are defined
app.use('/api/*', (req, res) => {
  console.log(`[404] Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;