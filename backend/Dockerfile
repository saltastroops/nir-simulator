FROM python:3.10

# Create the app user
RUN addgroup --system app && adduser --system --group app --home /home/app

# Set environment variables for Python.
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy the requirements file and install the dependencies.
# This is done before copying all the code to avoid re-running the step if the
# dependencies havve not changed.
WORKDIR /app
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copy the code.
COPY . .

EXPOSE 8000

# Change to the app user
USER app

# Start the Django development server.
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
