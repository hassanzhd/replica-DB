export const TypeMapping = {
    postgres: {
        mysql: {
            common: [
                'smallint',
                'bigint',
                'text',
                'varchar',
                'numeric',
                'char'
            ],
            symmetric: {
                'boolean': 'tinyint(1)',
                'timestamp without time zone': 'datetime',
                'timestamp with time zone': 'timestamp',
                'time without time zone': 'time',
            },
            assymetric: {
                'integer': 'int',
                'uuid': 'varchar(36)',
                'bigserial': 'bigint'
            }
        }
    },
    mysql: {
        postgres: {
            assymetric: {
                'int': 'integer'
            }
        }
    }
}