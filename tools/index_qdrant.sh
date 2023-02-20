#!/usr/bin/env bash

QDRANT_PATH=$1

QDRANT_PATH=$(realpath $QDRANT_PATH)

# Get path to this script
SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
ROOT_PATH=$SCRIPT_PATH/..


rustup run stable rust-analyzer -v lsif $QDRANT_PATH > $ROOT_PATH/data/index.lsif

python -m code_search.index.convert_lsif_index

python -m code_search.index.upload_code

docker run --rm -it -v $QDRANT_PATH:/source qdrant/rust-parser ./rust_parser /source > $ROOT_PATH/data/structures.json

python -m code_search.index.upload_structures
