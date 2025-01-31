#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
FILE_PATH="$PWD/$BASEDIR"

TEMPLATE_PATH="file://$FILE_PATH/../item-api-cf.yaml"
PARAMETERS_PATH="file://$FILE_PATH/../parameters-development.json"

aws cloudformation update-stack \
  --stack-name ItemApiDevelopment \
  --template-body "$TEMPLATE_PATH" \
  --parameters "$PARAMETERS_PATH" \
  --capabilities CAPABILITY_IAM

echo "\nRun bin/stack-info.sh for status info"
