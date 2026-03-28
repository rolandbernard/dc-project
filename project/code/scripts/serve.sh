#!/usr/bin/sh
# This is a small script that serves data from an already build application.
# Some configurations are taken from the environment variables line. This is
# intended for use inside the Docker container.

if ! python -m http.server \
    -d /app/dist \
    ${PORT_FRONTEND:-8888}
then
    echo "The webserver failed."
    exit 1
fi
