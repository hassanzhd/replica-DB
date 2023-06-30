SELECT
    table_name,
    json_agg(row_to_json(columns)) AS column_metadata
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
    ic.table_schema='public'
) AS columns
GROUP BY 
    table_name