# replicaDB
[![npm version](https://badge.fury.io/js/@hassanzhd%2Freplica-db.svg)](https://badge.fury.io/js/@hassanzhd%2Freplica-db)
## What is replicaDB?
replicaDB is a tool that allows you to replicate databases without:

1. 📝  Writing any SQL.
2. Ɩ  Worrying about type mapping.
3. 📖  Creating any database dumps or archives
4. 💻  Interacting with any sort of UI.


## What is required?
All you need is a `config.yaml` file and replicaDB installed as an npm package.

## Features:
1. replicaDB provides multi engine support that replicates databases even with engine differences 😱

    Following mappings are currently supported:

    | Source   | Destination |
    | -------- | ----------- |
    | mysql    | mysql       |
    | postgres | postgres    |
    | mysql    | postgres    |
    | postgres | mysql       |

2. Replicas are created on destination with:
    1. Same table names
    2. Same table schemas
    3. Records part of table

## Supported types:
### mysql->postgres, postgres->mysql mapping:
| Sno. | mysql type                  | postgres type |
| ---- | --------------------------- | ------------- |
| 1    | smallint                    | smallint      | 
| 2    | bigint                      | bigint        |
| 3    | text                        | text          |
| 4    | varchar                     | varchar       |
| 5    | numeric                     | numeric       |  
| 6    | char                        | char          |
| 7    | boolean                     | tinyint(1)    |
| 8    | timestamp without time zone | datetime      |
| 9    | timestamp with time zone    | timestamp     |
| 10    | time without time zone     | time          |

### postgres->mysql mapping:
| Sno. | postgres type | mysql type  |
| ---- | ------------- | ----------- |
| 1    | integer       | int         | 
| 2    | uuid          | varchar(36) |
| 2    | bigserial     | bigint      |

## Config file schema:
```yaml
source:
  engine: mysql
  host: HOST
  database: DATABASE_NAME
  port: PORT_NUMBER
  user: USER
  password: PASSWORD
destination:
  engine: postgres
  host: HOST
  database: DATABASE_NAME
  port: PORT_NUMBER
  user: USER
  password: PASSWORD
```

`note:` engine key can only contain `mysql` or `postgres`

## Installation:
You can install the package by the following command:
```bash
npm i @hassanzhd/replica-db
```

## Usage:
```bash
npx replica-db -f <PATH_TO_CONFIG.YAML>
```

## Limitations:
Currently replicaDB works with the following known limitations:

1. Postgres tables part of `"public"` schema can only be replicated
2. Constraints supported include: 
    1. PRIMARY KEY
3. Only tables are replicated, this doesn't include views, stored procedures, etc.

## Queries / Feedback:
For any queries, request or feedback please feel free to create an issue