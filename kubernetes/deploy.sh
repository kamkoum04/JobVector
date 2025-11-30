#!/bin/bash

# JobVector Kubernetes Deployment Script
# This script deploys all components in the correct order

set -e

echo "=========================================="
echo "JobVector Kubernetes Deployment"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

print_info "Checking kubectl configuration..."
if ! kubectl cluster-info &> /dev/null; then
    print_error "kubectl is not configured properly or cluster is not accessible."
    exit 1
fi

print_info "Kubernetes cluster is accessible."
echo ""

# Deploy namespace
print_info "Creating namespace..."
kubectl apply -f namespace/
sleep 2

# Deploy PostgreSQL
print_info "Deploying PostgreSQL StatefulSet..."
kubectl apply -f postgres/
print_info "Waiting for PostgreSQL to be ready (this may take a minute)..."
kubectl wait --for=condition=ready pod -l app=postgres -n jobvector --timeout=120s || print_warning "PostgreSQL pods may still be initializing"
echo ""

# Deploy Embedding Service
print_info "Deploying Embedding Service..."
kubectl apply -f embedding-service/
print_info "Waiting for Embedding Service to be ready..."
kubectl wait --for=condition=ready pod -l app=embeddingservice -n jobvector --timeout=120s || print_warning "Embedding Service pods may still be initializing"
echo ""

# Deploy Ollama
print_info "Deploying Ollama StatefulSet..."
kubectl apply -f ollama/
print_info "Waiting for Ollama to be ready (this may take a few minutes)..."
kubectl wait --for=condition=ready pod -l app=ollama -n jobvector --timeout=180s || print_warning "Ollama pods may still be pulling the model"
echo ""

# Deploy Backend
print_info "Deploying Backend..."
kubectl apply -f backend/
print_info "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n jobvector --timeout=120s || print_warning "Backend pods may still be initializing"
echo ""

# Deploy Frontend
print_info "Deploying Frontend..."
kubectl apply -f frontend/
print_info "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n jobvector --timeout=120s || print_warning "Frontend pods may still be initializing"
echo ""

# Optional: Deploy Ingress
read -p "Do you want to deploy Ingress? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deploying Ingress..."
    kubectl apply -f ingress/
    echo ""
fi

echo ""
print_info "Deployment completed!"
echo ""

print_info "Checking deployment status..."
kubectl get all -n jobvector

echo ""
print_info "Checking persistent volumes..."
kubectl get pvc -n jobvector

echo ""
echo "=========================================="
echo "Deployment Summary"
echo "=========================================="
echo ""
echo "To access the application:"
echo ""
echo "1. Port-forward to frontend:"
echo "   kubectl port-forward svc/frontend 3000:3000 -n jobvector"
echo "   Then open: http://localhost:3000"
echo ""
echo "2. Port-forward to backend:"
echo "   kubectl port-forward svc/backend 8080:8080 -n jobvector"
echo "   Then open: http://localhost:8080/actuator/health"
echo ""
echo "To view logs:"
echo "   kubectl logs -f deployment/backend -n jobvector"
echo "   kubectl logs -f deployment/frontend -n jobvector"
echo ""
echo "To delete deployment:"
echo "   kubectl delete namespace jobvector"
echo ""
print_info "Deployment complete! 🚀"
