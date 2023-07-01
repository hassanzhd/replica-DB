# replicaDB
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

## Limitations:
Currently replicaDB works with the following known limitations:

1. Postgres tables part of `"public"` schema can only be replicated
2. Constraints supported include: 
    1. PRIMARY KEY
3. Only tables are replicated, this doesn't include views, stored procedures, etc.

## Queries / Feedback:
For any queries, request or feedback please feel free to create an issue