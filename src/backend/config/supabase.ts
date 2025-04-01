import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from project root .env
const rootEnvPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(rootEnvPath)) {
  console.log('Loading .env from:', rootEnvPath);
  dotenv.config({ path: rootEnvPath });
} else {
  console.log('Root .env file not found at:', rootEnvPath);
  dotenv.config(); // Try default location
}

// Hard-coded values for backup
const HARDCODED_URL = 'https://rlsjvammbsgnfbwrjwco.supabase.co';
const HARDCODED_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsc2p2YW1tYnNnbmZid3Jqd2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzQ3NDI2OCwiZXhwIjoyMDU5MDUwMjY4fQ.URyQSph127sVF-OOnBzfOQkg8Zyxr1l_kFZlTqfUT3M';

// Debug environment variables
console.log('Supabase Environment Variables:', {
  SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not Set',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Not Set',
});

// Configure supabase client - prioritize environment variables
const supabaseUrl = process.env.SUPABASE_URL || HARDCODED_URL;
// Use service key for server-side operations (has more permissions)
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || HARDCODED_SERVICE_KEY;

console.log('Using Supabase URL:', supabaseUrl);
// Don't log the full key for security, just a portion to verify
console.log('Using Supabase Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;