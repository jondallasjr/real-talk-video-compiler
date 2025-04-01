
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
    