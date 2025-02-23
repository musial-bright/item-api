#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
FILE_PATH="$PWD/$BASEDIR"

STAGE="$1"
STACK_NAME=`sh $FILE_PATH/utils/stackname.sh $1`
if [[ $STACK_NAME == "" ]]; then echo "Stage not supported. Exiting!"; exit 1; fi

aws cloudformation describe-stack-events \
  --stack-name $STACK_NAME
