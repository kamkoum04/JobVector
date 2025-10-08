# Use lightweight Python image
FROM python:3.10-slim

# Avoid interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Copy dependencies file and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the actual script
COPY embedding_service.py .

# Expose Flask app port
EXPOSE 5002

# Run the service
CMD ["python", "embedding_service.py"]
