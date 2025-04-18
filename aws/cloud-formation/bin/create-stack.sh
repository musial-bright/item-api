#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
FILE_PATH="$PWD/$BASEDIR"

STAGE="$1"
STACK_NAME=`sh $FILE_PATH/utils/stackname.sh $1`
if [[ $STACK_NAME == "" ]]; then echo "Stage not supported. Exiting!"; exit 1; fi

TEMPLATE_PATH="file://$FILE_PATH/../item-api-cf.yaml"
PARAMETERS_PATH="file://$FILE_PATH/../parameters-$STAGE.json"

echo "create CF stack '$STACK_NAME' for stage '${STAGE}'"
echo "Continue [y/N]"
read continue
if [[ "${continue}" != "y" ]]; then echo "Deployment canceled."; exit 1; fi
echo "Creating CF stack..."

aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body "$TEMPLATE_PATH" \
  --parameters "$PARAMETERS_PATH" \
  --capabilities CAPABILITY_IAM

echo "\nRun 'bin/stack-info.sh $STAGE' for status info"
