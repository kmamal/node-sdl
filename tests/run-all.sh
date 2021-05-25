#!/usr/bin/env bash

set -eEu -o pipefail

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

for testfile in $DIR/*.test.js
do
	node $testfile
done
