#!/bin/sh

TS_FILE=$(realpath $(dirname -- "$0")"/../src/run-task.ts" 2>/dev/null)
JS_FILE=$(realpath $(dirname -- "$0")"/../run-task.js" 2>/dev/null)

if [ -f "$TS_FILE" ]
then
  echo tsx $TS_FILE "$@"
  npx tsx $TS_FILE "$@"
else if [ -f "$JS_FILE" ]
  then
    # experimental-specifier-resolution is necessary for db.init task that dynamically import database
    echo tsx $TS_FILE "$@"
    node --experimental-specifier-resolution=node $JS_FILE "$@"
  else
    echo "No run-task.ts nor run-task.js found"
    exit 1
  fi
fi
