#!/usr/bin/env bash

set -e

if [ $(uname) == 'Darwin' ]
then
  alias replace="sed -i ''"
else
  alias replace="sed -i"
fi

rm -rf $PWD/node_modules/@i18n-chain/core
ln -s $(dirname $PWD)/core $PWD/node_modules/@i18n-chain/core
