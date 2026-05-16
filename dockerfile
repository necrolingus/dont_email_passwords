FROM node:24-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Default app and MCP ports (can be overridden by env vars)
EXPOSE 8080 8090
CMD [ "node", "index.js" ]
