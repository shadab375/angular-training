# Stage 1: Build the Angular app
FROM node:18 AS build

# Set the working directory
WORKDIR /myapp

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the Angular project files
COPY . .

# Build the Angular app
RUN npm run build --prod

# Check the output of the build
RUN ls -al /myapp/dist

# Stage 2: Serve the Angular app with Nginx
FROM nginx:1.13.3-alpine

#Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy the built Angular files to Nginx's HTML directory
COPY --from=build /myapp/dist/frontend /usr/share/nginx/html

# Expose port 80 (or your desired port)
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
