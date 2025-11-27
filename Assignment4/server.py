#!/usr/bin/env python3
# A simple HTTP server for testing the WebGL application locally
# Run this script and then open http://localhost:8000 in your browser

import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()
