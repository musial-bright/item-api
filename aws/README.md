# Dynamo DB

## Run Dynamo DB for local development
Goto `aws/dynamodb` folder and run `docker compose up`.


## List local tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

aws dynamodb scan --endpoint-url http://localhost:8000 --table-name item-api-development-item

aws dynamodb scan \
     --table-name development-item \
     --filter-expression "name = :name" \
     --expression-attribute-values '{":name":{"S":"test-item"}}'