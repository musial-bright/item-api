#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
FILE_PATH="$PWD/$BASEDIR"

TEMPLATE_PATH="file://$FILE_PATH/../item-api-cf.yaml"
PARAMETERS_PATH="file://$FILE_PATH/../parameters-development.json"

STAGE="Development"

if [[ "$1" == "staging" ]]
then
  STAGE="Staging"
  PARAMETERS_PATH="file://$FILE_PATH/../parameters-staging.json"
elif  [[ "$1" == "production" ]]
then
  STAGE="Production"
  PARAMETERS_PATH="file://$FILE_PATH/../parameters-production.json"
fi

STACK_NAME="ItemApi${STAGE}"
echo "Deploying stack '$STACK_NAME' for stage '${STAGE}'"
echo "Continue [y/N]"
read continue

if [[ "${continue}" != "y" ]]
then
  echo "Deployment canceled."
  exit 1
fi

echo "Starting cloud formation deployment..."


aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body "$TEMPLATE_PATH" \
  --parameters "$PARAMETERS_PATH" \
  --capabilities CAPABILITY_IAM

echo "\nRun bin/stack-info.sh for status info"