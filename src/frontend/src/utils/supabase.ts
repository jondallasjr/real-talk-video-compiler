import { createClient } from "@supabase/supabase-js";

// These values should be stored in environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Log configuration for debugging (remove in production)
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseKey ? "Key exists" : "No key found");

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;