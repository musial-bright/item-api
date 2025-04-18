# Item API
Serverless item API for flexible data storage or any other service.

Copyright Adam Musial-Bright, more at [LICENSE.md](LICENSE.md)

There are two ways to build and deploy the Item API:
- AWS Cloud Formation: build and deploy the app via cloud formation -> folder `/aws/cloud-formation` (recommended)
- AWS SAM: use the SAM framework to deploy an manage the application -> folder `/aws/sam`


## Installation & Development
The servierless fastify application resides int the `api` folder.
```
cd api
node install
```

## Build fastify app for AWS Lambda only
The build will create a `api/build` and `api/dist` folder.
```
npm run build
```

## Deploy
You have three options here for the stage development|staging|production:
1. use `aws/cloud-formation/bin/deploy-api <stage>`
2. use `sam deploy --guided`
3. copy the `api/dist/index.cjs` to lambda. For that run `npm run build` first.

## Development
Run a Fastify server
```
# run local server
npm run server

# run tests
npm run test

# run linter
npm run lint
npm run lint -- --fix
```

### Local Dynamo DB

Local installation for development is located in the folder `aws/dynamodb`.
```
cd aws/dynamodb

# install dynamo on docker
npm run db-start

# reset db
npm run db-reset

```
Maintain tables in `aws/dynamodb/src/createTable/*`.

DynamoDB admin view
```
cd aws/dynamodb
npm run dynamodb-admin

# open in browser: http://localhost:8001
```

## Infrastructure management
You will find more details on infrastructure management (AWS Cloud Formation, AWS SAM, Dynamo DB, local infrastructure) in the AWS-[README](aws/README.md).

Gist for the preferred AWS cloud formation infrastructure:
```
# new infrastructure setup
bin/create-stack <stage>

# infrastructure updates
bin/update-stack <stage>

# deploy api
bin/deploy-api <stage>

# infrastructure deletion (permanent)
bin/delete-stack <stage>
```


## Open local app
Open in browser (http://localhost:3000/item-api/info)[http://localhost:3000/item-api/info] or with CURL:
```
curl -X GET 'http://localhost:3000/item-api/info'
curl -X <POST|GET|PUT|PATCH|DELETE> 'http://localhost:3000/item-api/item/:name/:id'
```

Example:
```
curl -X POST http://localhost:3000/item-api/item/test-item \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json' \
     -H 'Authorization: <auth token>' \
     -d '{ "content": { "desc": "hello item", "items": [1]} }'

curl -X PATCH http://localhost:3000/item-api/item/test-item/<ID> \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json' \
     -H 'Authorization: <auth token>' \
     -d '{ "content": { "desc": "some object data", "items": [1, 2, 3, "four"]} }'

curl -X GET http://localhost:3000/item-api/item/test-item \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json' \
     -H 'Authorization: <auth token>'
     
```

The API swagger documentation is available at http://localhost:3000/docs

