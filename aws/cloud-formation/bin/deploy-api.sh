#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
FILE_PATH="$PWD/$BASEDIR"
WORK_DIR="$FILE_PATH/../../../api"

STAGE="$1"
STACK_NAME=`sh $FILE_PATH/utils/stackname.sh $1`
if [[ $STACK_NAME == "" ]]; then echo "Stage not supported. Exiting!"; exit 1; fi

FUNCTION_ZIP_FILE="$WORK_DIR/dist/index.zip"

FUNCTION_NAME="item-api-${STAGE}"
echo "Update lambda function code for '$FUNCTION_NAME'"
echo "Continue [y/N]"
read continue
if [[ "${continue}" != "y" ]]; then echo "Deployment canceled."; exit 1; fi

echo "Updating lambda function code..."

cd $WORK_DIR
npm ci
npm run build
cd dist/
zip index.zip index.cjs
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --zip-file fileb://$FUNCTION_ZIP_FILE
npm run build-cleanup
