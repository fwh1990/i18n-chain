#!/usr/bin/env bash

set -e

if [ $(uname) == 'Darwin' ]
then
  alias replace="sed -i ''"
else
  alias replace="sed -i"
fi

rm -rf ./build/*
# commonJS
yarn tsc
mv ./build/src ./build/lib
cp ../../README.md ../../LICENSE ./package.json ./build
# esModules
yarn tsc --module ES6
mv ./build/src ./build/es

# packages/core
replace 's@\("main": \)"src/index\.ts"@\1"lib/index.js"@' ./build/package.json
replace 's@\("types": \)"src/index\.ts"@\1"lib/index.d.ts"@' ./build/package.json
