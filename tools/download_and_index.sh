#!/usr/bin/env bash

# Ensure current path is project root
cd "$(dirname "$0")/../"

git clone https://github.com/qdrant/qdrant.git /tmp/qdrant

QDRANT_PATH=/tmp/qdrant bash -x tools/index_qdrant.sh

rm -rf /tmp/qdrant

