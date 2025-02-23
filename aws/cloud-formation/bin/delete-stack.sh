#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
FILE_PATH="$PWD/$BASEDIR"

STAGE="$1"
STACK_NAME=`sh $FILE_PATH/utils/stackname.sh $1`
if [[ $STACK_NAME == "" ]]; then echo "Stage not supported. Exiting!"; exit 1; fi

echo "Delete CF stack '$STACK_NAME' for stage '${STAGE}'"
echo "Continue [y/N]"
read continue
if [[ "${continue}" != "y" ]]; then echo "Delete canceled."; exit 1; fi
echo "Deleting CF stack '$STACK_NAME'..."

aws cloudformation delete-stack \
  --stack-name $STACK_NAME

echo "\nRun 'bin/stack-info.sh $STAGE' for status info"