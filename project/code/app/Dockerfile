# Build web application
FROM node:25-trixie-slim AS build-web
WORKDIR /app
COPY . ./
RUN npm install
RUN npm run build

FROM python:3.14.2-slim-trixie
WORKDIR /app
# Copy the entrypoint script.
COPY serve.py .
# Copy build output for the web application.
COPY --from=build-web /app/dist ./dist
# Move working directory into dist.
WORKDIR /app/dist
