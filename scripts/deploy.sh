#!/usr/bin/env sh

set -e

yarn run build

cp dist/index.html dist/404.html

yarn run deploy:gh-pages
