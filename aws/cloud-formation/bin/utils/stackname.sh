#!/bin/sh

REGEXP_PATTERN="^(development|staging|production)$"
STAGE="$1"

if [[ $STAGE =~ $REGEXP_PATTERN ]]
then
  echo "ItemApi-$STAGE"
fi
