#!/usr/bin/env bash

npx lerna run build
npx lerna bootstrap
npx lerna publish