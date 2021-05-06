FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Copy all package requirement files
COPY package*.json ./

# Restore dependancies
RUN npm install

# Copy all source codes from local
COPY . .

RUN apt-get update && apt-get install telnet
RUN apt-get install -y net-tools
RUN apt-get install -y vim

# Expose port 8080 to outside docker container
EXPOSE 8080

# Run the node js server
CMD [ "node", "server.js" ]