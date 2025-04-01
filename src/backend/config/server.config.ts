import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ServerConfig {
  port: number;
  env: string;
  corsOrigins: string[];
  maxFileSize: number;
  uploadDebug: boolean;
}

// Default configuration
const config: ServerConfig = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: process.env.NODE_ENV || 'development',
  corsOrigins: ['http://localhost:3000', 'http://localhost:4000', 'http://localhost:8000'], 
  maxFileSize: 50 * 1024 * 1024, // 50MB max file size
  uploadDebug: process.env.NODE_ENV === 'development',
};

// Add any environment-specific configuration overrides
if (config.env === 'production') {
  // In production, only allow specific origins
  config.corsOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['https://yourdomain.com'];
  
  config.uploadDebug = false;
}

// Log configuration in non-production environments
if (config.env !== 'production') {
  console.log('Server config:', {
    ...config,
    // Redact sensitive information if any
  });
}

export default config;