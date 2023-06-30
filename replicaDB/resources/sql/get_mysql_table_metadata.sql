SELECT
    table_column.table_name AS table_name,
    table_column.columns AS column_metadata,
    table_column_primary_key.columns AS primary_key_columns
FROM
    (
        SELECT
            ic.TABLE_NAME,
            COALESCE(JSON_ARRAYAGG(JSON_OBJECT("name", ic.COLUMN_NAME, "type", ic.COLUMN_TYPE, "position", ic.ORDINAL_POSITION)), JSON_ARRAY()) AS columns
        FROM
            INFORMATION_SCHEMA.COLUMNS ic
        WHERE
            ic.TABLE_SCHEMA = ?
        GROUP BY
            ic.TABLE_NAME
    ) AS table_column
LEFT JOIN 
        (
            SELECT
                itc.table_name,
                COALESCE(JSON_ARRAYAGG(JSON_OBJECT('name', column_name, 'position', ordinal_position)), JSON_ARRAY()) AS columns
            FROM 
                information_schema.key_column_usage iku 
            JOIN 
                information_schema.table_constraints itc 
            ON iku.constraint_name = itc.constraint_name AND
                iku.table_name = itc.table_name
            WHERE itc.constraint_schema = ? AND
            itc.constraint_type = 'PRIMARY KEY'
            GROUP BY
                itc.table_name
        ) AS table_column_primary_key
ON table_column.table_name = table_column_primary_key.table_name;