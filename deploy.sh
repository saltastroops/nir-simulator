#!/usr/bin/env bash

# Deployment script for the NIR Simulator.
#
# The script requires that the NIR Simulator has been cloned to the remote server, as
# explained in the README file.
#
# Usage: ./deploy.sh

ssh nirwals@simulator.salt.ac.za /usr/bin/env bash < deployment/deploy-simulator.sh
