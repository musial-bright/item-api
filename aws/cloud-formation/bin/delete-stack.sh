#!/bin/sh

aws cloudformation delete-stack \
  --stack-name ItemApiDevelopment

echo "\nRun bin/stack-info.sh for status info"
