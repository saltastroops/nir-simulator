#!/usr/bin/env bash

# deploy-simulator.py
#
# Deploy the NIRWALS Simulator on the production server.
#
# Usage: ./deploy-simulator.sh
#
# After a successful deployment the script calls Docker's system prune command to
# remove dangling images and unused containers.
#
# The script checks that the hostname is "simulator" and exits with an error if it
# isn't. You can bypass this check by setting the DEBUG variable to any value:
#
# DEBUG=1 ./deploy-simulator.sh
#
# The root directory of this project contains a script deploy.sh, which you can use to
# run this script on the production server via ssh.

# Sanity check: Are we on the right server?
if [ -z "$DEBUG" ] && [ "$HOSTNAME" != "simulator" ]; then
  echo "This script must be run on the NIRWALS Simulator server." 1>&2
  exit 1;
fi

# Go to the right directory.
cd ~/nir-simulator || {
  echo "Could not cd into the NIRWALS Simulator directory." 1>&2
  exit 1;
}

# Make sure we are on the main branch of the NIRWALS Simulator repository.
branch=$(git branch)
if [ "${branch: -4}" != "main" ]; then
    echo "You are not on the main branch of the NIRWALS Simulator repository." 1>&2
    exit 1
fi

# Stop the Simulator. We do this here already, as the docker compose on the repository
# might have changed, and the Simulator should be stopped with the same compose file
# that launched it.
docker compose down || {
  echo "The container for the NIRWALS Simulator could not be stopped." 1>&2
  exit 1
}

# Update the Simulator code.
git pull || {
  echo "The NIRWALS Simulator repository could not be pulled." 1>&2
  exit 1
}

# Go to the data directory.
cd backend/data || {
  echo "Could not cd into the data directory." 1>&2
  exit 1
}

# Make sure we are on the main branch of the data directory.
branch=$(git branch)
git checkout main || {
  echo "Could not check out the main branch of the data repository." 1>&2
  exit 1
}

# Update the data.
git pull || {
  echo "The data repository could not be pulled." 1>&2
  exit 1
}

# Launch the Simulator.
docker compose up --build -d || {
  echo "The NIRWALS Simulator could not be launched." 1>&2
  exit 1
}
