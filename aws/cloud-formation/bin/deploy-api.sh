#!/bin/sh

BASEDIR=$(dirname "$0")
PWD=$(pwd)
WORK_DIR="$PWD/$BASEDIR/../../../api"

cd $WORK_DIR
npm ci
npm run build
