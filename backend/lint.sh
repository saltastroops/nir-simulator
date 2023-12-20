#!/usr/bin/env bash

black . &&\
ruff --fix . &&\
mypy -p backend -p nirwals &&\
./runtests.sh
