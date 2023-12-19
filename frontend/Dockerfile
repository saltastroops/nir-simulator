FROM node:18 as build

# Install the required dependencies.
# This is done before copying all the code to avoid re-running the step if the
# dependencies havve not changed.
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

# Copy all the code.
COPY . .

# Build the website.
RUN npm run build

FROM nginx:1.25

# Copy the built website.
COPY --from=build /app/dist/ /frontend
RUN ls /frontend

# Create the server configuration.
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/
