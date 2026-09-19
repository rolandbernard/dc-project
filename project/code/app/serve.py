#!/bin/python
# This is a small script that serves data from an already build application.
# Some configurations are taken from the environment variables line. This is
# intended for use inside the Docker container.

import os
from http.server import HTTPServer, SimpleHTTPRequestHandler


class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path)
        if os.path.exists(path):
            super().do_GET()
        else:
            self.path = "/index.html"
            super().do_GET()


if __name__ == "__main__":
    port = int(os.environ["PORT"] or 8888)
    server = HTTPServer(("0.0.0.0", port), SPAHandler)
    print(f"Serving SPA on http://localhost:{port} ...")
    server.serve_forever()
