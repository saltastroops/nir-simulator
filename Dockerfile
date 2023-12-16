# Use an official Python runtime as a parent image
FROM python:3.10

# Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y nodejs npm

# Set the working directory in the container
WORKDIR /app

COPY . /app/

# Copy the React app files and build
WORKDIR /app/react
RUN npm install && npm run build

# Install Python dependencies
WORKDIR /app/backend
RUN ls /app/
RUN ls /app/backend

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Expose port 8000 for Django
EXPOSE 8000

# Start the Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
