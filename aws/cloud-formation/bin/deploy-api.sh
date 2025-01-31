#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
WORK_DIR="$PWD/$BASEDIR/../../../api"
BUCKET_NAME="cf-item-api-deployment"

cd $WORK_DIR
npm ci
npm run build
cd dist/
zip index.zip index.cjs
aws s3 cp index.zip "s3://${BUCKET_NAME}"