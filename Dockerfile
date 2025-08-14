# Use Node.js LTS as base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps --legacy-peer-deps

# Copy the rest of the app
COPY . .

# Create uploads directory for file uploads
RUN mkdir -p public/uploads

# Expose the port your Express app uses (from your .env: PORT=3001)
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
