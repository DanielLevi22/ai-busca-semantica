#!/bin/bash

PROJECT_DIR=~/Documents/projetos/classificacao
DATA_DIR="$PROJECT_DIR/data"
TMP_ZIP="$DATA_DIR/ml-latest-small.zip"

mkdir -p "$DATA_DIR"

# Baixa o zip do MovieLens
echo "Baixando MovieLens..."
curl -L -o "$TMP_ZIP" https://files.grouplens.org/datasets/movielens/ml-latest-small.zip

# Descompacta no data
echo "Descompactando..."
unzip -o "$TMP_ZIP" -d "$DATA_DIR"

# Remove zip
rm "$TMP_ZIP"

echo "Arquivos prontos em: $DATA_DIR"
