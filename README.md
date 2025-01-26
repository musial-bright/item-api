# Item API
Serverless item API for flexible data storage.

Copyright Adam Musial-Bright, more at [LICENSE.md](LICENSE.md)

There are two ways to build and deploy the Item API:
- sam: a AWS framework to deploy an manage AWS infrastructure and maintenance of the app.
- Lambda only: build and deploy the app from the `api` folder.


# General Config

## Local architecture
In `template.yaml` select `arm64` or `x86_64` depending on you local machine architecture.

# SAM
This is the AWS SAM part of the application architecture.

SAM tutorial: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-hello-world.html

## Login to ERC
This is necessary if you use a role with MFA
```
AWS_PROFILE=ipsaasdev-team aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
```

## Build fastify app for AWS infrastructure (API Gateway + Lambda)
Install esbuild if it is not installed globally: `npm install -g esbuild`.

```
cd <project root>
sam build
```

## Deploy
`sam deploy --guided`

## Develop
Run local server with SAM including Docker + Api Gateway.
```
cd /
sam build
sam local start-api
```

## Invoke local lambda
Uncomment `registerSwagger` in `service.ts`.

```
sam build
sam local invoke RestApiFunction  --event events/event.json
```



# Lambda API only

## Build fastify app for AWS Lambda only
The build will create a `api/build` and `api/dist` folder.
```
cd api
npm run build
```

## Deploy
Build the fastify app by as described above (`npm run build`).
In the `api/dist` distribution folder there ist a `index.cjs` that can be deployed to AWS Lambda. I.e. upload it directly to the `Code` section or S3.


## Develop
Run a Fastify server
```
cd api
node install
npm run server
```


# Setup Dynamo DB
A guide for the Dynamo DB setup is located in `aws/dynamodb` and described in `aws/README.md`.


# Open local app
Open in browser (http://localhost:3000/api/info)[http://localhost:3000/api/info] or play with CURL:
```
curl -X GET 'http://localhost:3000/api/info'
curl -X <POST|GET|PUT|PATCH|DELETE> 'http://localhost:3000/api/item/:name/:id'
```

Example:
```
curl -X POST http://localhost:3000/api/item/test-item \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json' \
     -d '{ "content": { "desc": "hello item", "items": [1]} }'

curl -X PATCH http://localhost:3000/api/item/test-item/<ID> \
     -H 'Content-Type: application/json' \
     -H 'Accept: application/json' \
     -d '{ "content": { "desc": "some object data", "items": [1, 2, 3, "four"]} }'

curl -X GET http://localhost:3000/api/item/test-item
```

The API swagger documentation is available at http://localhost:3000/docs

