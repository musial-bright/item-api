# Item API
Serverless item API for flexible data storage or any other service.

Copyright Adam Musial-Bright, more at [LICENSE.md](LICENSE.md)

There are two ways to build and deploy the Item API:
- AWS Cloud Formation: build and deploy the app via cloud formation -> folder `/aws/cloud-formation` (recommended)
- AWS SAM: use the SAM framework to deploy an manage the application -> folder `/aws/sam`


References:
- [SNet API swagger](../../docs/item-api/swagger-item-api.md)
- [Fastify framework](https://fastify.dev/)
- [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [AWS DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)


## Installation & Development
The servierless fastify application resides int the `api` folder.
```
cd api
node install
```


## Config
For _local development_ copy the env file and fill it up. You will find all the values in 1Password.

```
# copy and fill out the .env config
cp .env.example .env
```

For _AWS Lambda configuration_ you need so configure the environment variables in the AWS Lambda console *Configuration/Environment variables*. 

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
npm run testlocal # requires local dynamo db

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


## Endpoints
All endpoint are documented in [SNet API swagger](../../docs/item-api/swagger-item-api.md).

Here are a couple of practival __curl__ calls.

### Open local app
Open in browser (http://localhost:3000/item-api/info)[http://localhost:3000/item-api/info] or with CURL:
```
curl -X GET 'http://localhost:3000/item-api/info'
curl -X <POST|GET|PUT|PATCH|DELETE> 'http://localhost:3000/item-api/item/:name/:id'
```

### Swagger
First activate swagger on localhost by commenting in registerSwagger at `/src/service.ts` and activation of authroizer bypass at `src/hooks/authHook.ts`.
Open in browser http://localhost:3000/item-api/docs 

### Health checks
```
curl -X GET http://localhost:3000/item-api/health-check
```

### Info endpoint
```
curl -X GET http://localhost:3000/item-api/info \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>'
```


### /upload-file-url
```
# request upload-file-url (local):
curl -X POST http://localhost:3000/item-api/upload-file-url \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --header 'Referer: http://localhost:3000' \
  --data '{                      
  "path": "/",
  "filename": "landscape.png",
  "content_type": "image/png"
  }'

# request upload-file-url (develop):
curl -X POST http://localhost:3000/item-api/upload-file-url \
  --header 'Content-Type: application/json' \
  --header 'Authorization: Bearer <TOKEN>' \
  --header 'Referer: http://localhost:3000' \
  --data '{                      
  "path": "email-download",
  "filename": "landscape.png",
  "content_type": "image/png"
  }'

# upload with upload-file-url
curl -X PUT \ 
  -T "./Landscape3.png" \
  -H "Content-Type: image/png" \
  ...<upload file url>...
```


### /item
```
curl -X GET http://localhost:3000/item-api/item/test-item \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer <TOKEN>' \
     -H 'Referer: http://localhost:3000' 

curl -X POST http://localhost:3000/item-api/item/test-item \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer <TOKEN>' \
     -H 'Referer: http://localhost:3000' \
     -d '{ "content": { "desc": "hello item", "items": [1]}, "info": "adam" }'

curl -X <PUT|PATCH> http://localhost:3000/item-api/item/test-item/<some item id> \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer <TOKEN>' \
     -H 'Referer: http://localhost:3000' \
     -d '{ "content": { "desc": "hello item", "items": [1]}, "info": "adam" }'

curl -X DELETE http://localhost:3000/item-api/item/test-item/<some item id> \
     -H 'Authorization: Bearer <TOKEN>' \
     -H 'Referer: http://localhost:3000' 

curl -X POST http://localhost:3000/item-api/item/test-item \
     -H 'Content-Type: application/json' \
     -H 'Authorization: Bearer <TOKEN>' \
     -H 'Referer: http://localhost:3000' \
     -d '{ "content": { "desc": "hello item", "items": [1]}, "info": "adam" }'
```
