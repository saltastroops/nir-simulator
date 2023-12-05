#!/usr/bin/env bash

# Author: Christian Hettlage (SAAO/SALT)
# Created At: 5 December 2023
# Modified At: 5 December 2023

# Description:
# Run various tests for the NIRWALS Simulator backend.

# Usage:
# ./runtests.sh [-g|-n]
#
# -g: Generate the baseline images when running pytest.
# -n: Do not test images.

mpl_options="--mpl --mpl-baseline-path=baseline"

while getopts "ghn" opt; do
  case "$opt" in
  g) mpl_options="--mpl-generate-path=baseline";;
  h) echo "Usage: ./runtests.sh [-g]"; exit 0;;
  n) mpl_options="";;
  ?) echo "Unknown option found"; exit 1;;
  esac
done

FILE_BASE_DIR="$(pwd)"/data pytest $mpl_options
