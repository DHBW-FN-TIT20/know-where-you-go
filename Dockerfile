# Define default arguments. These can be overridden at build time.
ARG ENVIORMENT=production
ARG PORT=80
ARG NODE_VERSION=16-bullseye

###### Create node_modules ######
FROM node:${NODE_VERSION} AS build
WORKDIR /tmp

# Update container and install dependencies
RUN apt-get update && apt-get install -y \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json
COPY ["package.json", "package-lock.json*", "./"]

# Install dependencies
RUN npm run build


###### Final container ######
FROM node:${NODE_VERSION}
ARG ENVIORMENT
ARG PORT

# Set ENV Variables
ENV NODE_ENV=${ENVIORMENT}
ENV PORT=${PORT}


# Update Container for security
RUN apt-get update && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

# Create user and group for more security (not root user)
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs

# Copy App
COPY --chown=nodejs:nodejs ./app /app

# Set working directory
WORKDIR /app

# Copy node_modules from build container
COPY --from=build --chown=nodejs:nodejs /tmp/node_modules ./node_modules

# Expose default port
EXPOSE ${PORT}

# Create Volumes for DB and uploaded Images
VOLUME [ "/app/public/images/upload" ]

# Change user to nodejs
USER nodejs

# Command to be excecuted then the container start
CMD [ "node", "bin/www" ]