# Define default arguments. These can be overridden at build time.
ARG ENVIORMENT=production
ARG PORT=80
ARG NODE_VERSION=16
ARG APACHE_VERSION=bullseye

###### Create app ######
FROM node:${NODE_VERSION} AS build

# Set working direcory
WORKDIR /tmp

# Update container and install dependencies
RUN apt-get update \
    && apt-get upgrade -y \
#    && apt-get install -y {PACKAGES HERE} \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY ["package.json", "package-lock.json*", "./"]

# Copy the app
COPY src ./src
COPY public ./public
COPY design ./design
COPY assets-src ./assets-src
COPY framework7.json .
COPY postcss.config.js .
COPY vite.config.js .
COPY workbox-config.js .

# Install dependencies
RUN npm install -g npm@latest \
    && npm install

# Build the App
RUN npm run build


###### Final container ######
FROM httpd:${APACHE_VERSION}
ARG PORT

# Set ENV Variables
ENV PORT=${PORT}


# Update Container for security
RUN apt-get update && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

# Copy App
COPY --from=build /tmp/www /usr/local/apache2/htdocs

# Set working directory
WORKDIR /usr/local/apache2/htdocs/www

# Expose default port
EXPOSE ${PORT}
