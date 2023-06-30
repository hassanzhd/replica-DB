SELECT
    table_column.table_name AS table_name,
    table_column.columns AS column_metadata,
    table_column_primary_key.columns AS primary_key_columns
FROM
    (
        SELECT
            table_name,
            json_agg(row_to_json(columns)) AS columns
        FROM 
            (
                SELECT
                    ic.table_name AS table_name,
                    ic.column_name AS name,
                    case
                        when domain_name is not null then domain_name
                        when data_type='character varying' THEN 'varchar('||character_maximum_length||')'
                        when data_type='numeric' THEN 'numeric('||numeric_precision||','||numeric_scale||')'
                        else data_type
                    end AS type,
                    ic.ordinal_position AS position
                FROM
                    INFORMATION_SCHEMA.COLUMNS ic 
                WHERE 
                    ic.table_schema = 'public'
            ) AS columns
        GROUP BY 
            table_name
    ) AS table_column
JOIN
    (
        SELECT
            table_name,
            json_agg(row_to_json(columns)) AS columns
        FROM 
            (
                SELECT
                    itc.table_name,
                    column_name AS name,
                    ordinal_position AS position 
                FROM 
                    information_schema.key_column_usage iku 
                JOIN 
                    information_schema.table_constraints itc 
                ON iku.constraint_name = itc.constraint_name AND iku.table_name = itc.table_name
                WHERE 
                    itc.constraint_schema = 'public' AND itc.constraint_type = 'PRIMARY KEY'
            ) AS columns
        GROUP BY 
            table_name
    ) AS table_column_primary_key
ON table_column.table_name = table_column_primary_key.table_name;