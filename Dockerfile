FROM node:alpine 

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install nodemon -g

# Copy the remaining application code to the working directory
COPY . .

# Expose port 5000
EXPOSE 5000

# Command to run the backend server
CMD ["nodemon", "index.mjs"]