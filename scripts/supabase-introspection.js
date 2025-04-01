// sql-introspection.js
// A direct SQL query approach to get your Supabase database schema
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Check for required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: Missing required environment variables.');
  console.error('Make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file.');
  process.exit(1);
}

// Initialize Supabase client with service key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function main() {
  try {
    console.log('Fetching detailed schema information...');

    // Copy the working SQL query from the paste
    const query = `
    WITH table_info AS (
      SELECT
        t.table_name,
        json_agg(
          json_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'is_nullable', c.is_nullable,
            'column_default', c.column_default
          ) ORDER BY c.ordinal_position
        ) AS columns
      FROM
        information_schema.tables t
        JOIN information_schema.columns c 
          ON t.table_name = c.table_name 
          AND t.table_schema = c.table_schema
      WHERE
        t.table_schema = 'public'
      GROUP BY
        t.table_name
    ),
    foreign_key_info AS (
      SELECT
        tc.table_name,
        json_agg(
          json_build_object(
            'column_name', kcu.column_name,
            'foreign_table', ccu.table_name,
            'foreign_column', ccu.column_name
          )
        ) AS foreign_keys
      FROM
        information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      GROUP BY
        tc.table_name
    ),
    primary_key_info AS (
      SELECT
        tc.table_name,
        json_agg(kcu.column_name) AS primary_keys
      FROM
        information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
      WHERE
        tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
      GROUP BY
        tc.table_name
    )
    SELECT
      t.table_name,
      COALESCE(t.columns, '[]'::json) AS columns,
      COALESCE(p.primary_keys, '[]'::json) AS primary_keys,
      COALESCE(f.foreign_keys, '[]'::json) AS foreign_keys
    FROM
      table_info t
      LEFT JOIN foreign_key_info f ON t.table_name = f.table_name
      LEFT JOIN primary_key_info p ON t.table_name = p.table_name
    ORDER BY
      t.table_name;
    `;

    // Export the SQL to a file for manual execution
    fs.writeFileSync('schema-query.sql', query);
    console.log('SQL query saved to schema-query.sql');
    console.log('You can run this query directly in the Supabase SQL Editor to get your schema details.');

    // Try to execute directly (this might not work depending on permissions)
    console.log('Attempting to execute the query automatically...');
    
    // See if we can create and call a stored procedure
    const createProcedure = `
      CREATE OR REPLACE FUNCTION get_schema_details()
      RETURNS JSONB AS
      $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE '
          WITH table_info AS (
            SELECT
              t.table_name,
              json_agg(
                json_build_object(
                  ''column_name'', c.column_name,
                  ''data_type'', c.data_type,
                  ''is_nullable'', c.is_nullable,
                  ''column_default'', c.column_default
                ) ORDER BY c.ordinal_position
              ) AS columns
            FROM
              information_schema.tables t
              JOIN information_schema.columns c 
                ON t.table_name = c.table_name 
                AND t.table_schema = c.table_schema
            WHERE
              t.table_schema = ''public''
            GROUP BY
              t.table_name
          ),
          foreign_key_info AS (
            SELECT
              tc.table_name,
              json_agg(
                json_build_object(
                  ''column_name'', kcu.column_name,
                  ''foreign_table'', ccu.table_name,
                  ''foreign_column'', ccu.column_name
                )
              ) AS foreign_keys
            FROM
              information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
              JOIN information_schema.constraint_column_usage ccu
                ON tc.constraint_name = ccu.constraint_name
            WHERE
              tc.constraint_type = ''FOREIGN KEY''
              AND tc.table_schema = ''public''
            GROUP BY
              tc.table_name
          ),
          primary_key_info AS (
            SELECT
              tc.table_name,
              json_agg(kcu.column_name) AS primary_keys
            FROM
              information_schema.table_constraints tc
              JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE
              tc.constraint_type = ''PRIMARY KEY''
              AND tc.table_schema = ''public''
            GROUP BY
              tc.table_name
          )
          SELECT json_agg(
            json_build_object(
              ''table_name'', t.table_name,
              ''columns'', COALESCE(t.columns, ''[]''::json),
              ''primary_keys'', COALESCE(p.primary_keys, ''[]''::json),
              ''foreign_keys'', COALESCE(f.foreign_keys, ''[]''::json)
            )
          )
          FROM
            table_info t
            LEFT JOIN foreign_key_info f ON t.table_name = f.table_name
            LEFT JOIN primary_key_info p ON t.table_name = p.table_name
          ORDER BY
            t.table_name
        ' INTO result;
        
        RETURN result;
      END;
      $$
      LANGUAGE plpgsql
      SECURITY DEFINER;
    `;
    
    try {
      // Try to create the stored procedure
      const { error: createError } = await supabase.rpc('exec_sql', { 
        sql_string: createProcedure 
      });
      
      if (createError) {
        console.log('Could not create stored procedure, using alternative method');
      } else {
        console.log('Stored procedure created, calling it...');
        const { data, error } = await supabase.rpc('get_schema_details');
        
        if (error) {
          console.error('Error calling stored procedure:', error);
        } else {
          // Write the results to a file
          fs.writeFileSync(
            'supabase-schema-detailed.json', 
            JSON.stringify(data, null, 2)
          );
          
          console.log('Schema information saved to supabase-schema-detailed.json');
          return;
        }
      }
    } catch (err) {
      console.log('Error creating or calling stored procedure:', err.message);
    }
    
    // Get storage buckets (this should work regardless)
    console.log('Fetching storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error fetching storage buckets:', bucketsError);
    } else {
      // Write just the buckets information to a file
      fs.writeFileSync(
        'supabase-buckets.json', 
        JSON.stringify(buckets, null, 2)
      );
      
      console.log('Storage bucket information saved to supabase-buckets.json');
    }
    
    // Final instructions
    console.log('\nInstructions:');
    console.log('1. Go to the Supabase SQL Editor at: https://app.supabase.io/project/_/sql');
    console.log('2. Open schema-query.sql and copy its contents');
    console.log('3. Paste into the SQL Editor and run the query');
    console.log('4. Copy the results and save to a file named "supabase-schema-detailed.json"');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

main();