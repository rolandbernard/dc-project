#!/bin/bash
# This is a simple script the extract the dataset files. The dataset files are
# exactly the ones provided on the teams shared files. They are initially
# compressed using gzip compression. This script simply un-gzips them.

for file in ./data/*.csv.gz ; do
    gunzip -dkf $file
done

