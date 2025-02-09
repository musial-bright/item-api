#!/bin/sh

STAGE="Development"

if [[ "$1" == "staging" ]]
then
  STAGE="Staging"
elif  [[ "$1" == "production" ]]
then
  STAGE="Production"
fi

STACK_NAME="ItemApi${STAGE}"
echo "Delete stack '$STACK_NAME' for stage '${STAGE}'"
echo "Continue [y/N]"
read continue

if [[ "${continue}" != "y" ]]
then
  echo "Delete canceled."
  exit 1
fi

aws cloudformation delete-stack \
  --stack-name $STACK_NAME

echo "\nRun bin/stack-info.sh for status info"
