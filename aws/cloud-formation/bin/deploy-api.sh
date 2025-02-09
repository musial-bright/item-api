#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
WORK_DIR="$PWD/$BASEDIR/../../../api"

FUNCTION_ZIP_FILE="$WORK_DIR/dist/index.zip"

STAGE_SUFFIX="-development"

if [[ "$1" == "staging" ]]
then
  STAGE_SUFFIX="-staging"
elif  [[ "$1" == "production" ]]
then
  STAGE_SUFFIX="production"
fi

FUNCTION_NAME="item-api${STAGE_SUFFIX}"
echo "Deploying lambda function '$FUNCTION_NAME'"
echo "Continue [y/N]"
read continue

if [[ "${continue}" != "y" ]]
then
  echo "Deployment canceled."
  exit 1
fi

echo "Starting lambda function deployment..."

cd $WORK_DIR
npm ci
npm run build
cd dist/
zip index.zip index.cjs
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://$FUNCTION_ZIP_FILE
npm run build-cleanup
