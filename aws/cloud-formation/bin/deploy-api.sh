#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
WORK_DIR="$PWD/$BASEDIR/../../../api"

FUNCTION_NAME="item-api-development"
FUNCTION_ZIP_FILE="$WORK_DIR/dist/index.zip"

cd $WORK_DIR
npm ci
npm run build
cd dist/
zip index.zip index.cjs
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://$FUNCTION_ZIP_FILE
