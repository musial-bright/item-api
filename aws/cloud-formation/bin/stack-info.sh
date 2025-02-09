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

aws cloudformation describe-stack-events \
  --stack-name $STACK_NAME
