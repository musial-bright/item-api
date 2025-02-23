# AWS infrastructure

## AWS Cloud Formation (CF)
Life-cycle commands for infrastructure such as IAM roles or lambda.

### Manage CF infrastructure
The infrastructure supports three stacks: development|staging|production. The infrastructure is defined in the `item-api-cf.yaml` config file.

```
# new infrastructure setup
bin/create-stack <stage>

# infrastructure updates
bin/update-stack <stage>

# infrastructure deletion (permanent)
bin/delete-stack <stage>
```

You can get stack information in the AWS console or in the terminal.
```
bin/stack-info.sh <stage>
```

### Application deployment and update
The application runs on lambda which can be deployed and updated (code only). 

```
bin/deploy-api <stage>
```

## AWS SAM
This is the AWS SAM part of the application architecture.

For more info read the SAM tutorial: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-hello-world.html

### initial steps
In `template.yaml` select `arm64` or `x86_64` depending on you local machine architecture.

Login to ERC
This is necessary if you use a role with MFA
```
AWS_PROFILE=ipsaasdev-team aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
```

### Build fastify app for AWS infrastructure (API Gateway + Lambda)
Install esbuild if it is not installed globally: `npm install -g esbuild`.

```
cd <project root>
sam build
```

### Deploy
`sam deploy --guided`

### Develop
Run local server with SAM including Docker + Api Gateway.
```
cd /
sam build
sam local start-api
```

### Invoke local lambda
Uncomment `registerSwagger` in `service.ts`.

```
sam build
sam local invoke RestApiFunction  --event events/event.json
```


## Dynamo DB

### Run Dynamo DB for local development
Goto `aws/dynamodb` folder and run `docker compose up`.


### List local tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

aws dynamodb scan --endpoint-url http://localhost:8000 --table-name item-api-development-item

aws dynamodb scan \
     --table-name development-item \
     --filter-expression "name = :name" \
     --expression-attribute-values '{":name":{"S":"test-item"}}'
