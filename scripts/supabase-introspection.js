// supabase-introspection.js
// This script connects to your Supabase database and performs a basic introspection
// to output the current schema structure.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing required environment variables.');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file.');
  process.exit(1);
}

// Initialize Supabase client with service key (not anon key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function getTableSchema() {
  console.log('Fetching table schema information...');
  
  try {
    // Direct SQL query to get tables and columns
    const { data, error } = await supabase.from('schema_info').select('*').limit(1);
    
    if (error) {
      console.log('Creating a query to fetch schema information...');
      
      // Get table information from information_schema
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .order('table_name');
        
      if (tablesError) {
        console.error('Error fetching tables:', tablesError);
        return null;
      }
      
      // For each table, get its columns
      const tableSchema = [];
      for (const table of tables) {
        const tableName = table.table_name;
        
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .order('ordinal_position');
          
        if (columnsError) {
          console.error(`Error fetching columns for table ${tableName}:`, columnsError);
          continue;
        }
        
        tableSchema.push({
          table_name: tableName,
          columns: columns
        });
      }
      
      return tableSchema;
    }
    
    // If we reached here, we successfully queried a view that may have already been set up
    return data;
  } catch (error) {
    console.error('Error in getTableSchema:', error);
    return null;
  }
}

async function getStorageBuckets() {
  console.log('Attempting to fetch storage bucket information...');
  
  try {
    // Try to access storage buckets (this might fail if permissions aren't properly set)
    const { data, error } = await supabase
      .storage
      .listBuckets();
    
    if (error) {
      console.error('Error fetching storage buckets:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getStorageBuckets:', error);
    return [];
  }
}

async function main() {
  try {
    // Get database schema information
    const tableSchema = await getTableSchema();
    const storageBuckets = await getStorageBuckets();
    
    const schemaInfo = {
      tables: tableSchema,
      storage: {
        buckets: storageBuckets
      },
      timestamp: new Date().toISOString()
    };
    
    // Write to file
    fs.writeFileSync(
      'supabase-schema.json', 
      JSON.stringify(schemaInfo, null, 2)
    );
    
    console.log('Schema information saved to supabase-schema.json');
    console.log('You can share this file to provide context about your database structure.');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main();