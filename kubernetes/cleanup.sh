#!/bin/bash

# JobVector Kubernetes Cleanup Script - AWS EKS

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo "=========================================="
echo "JobVector Kubernetes Cleanup - AWS EKS"
echo "=========================================="
echo ""

print_warning "This will delete ALL JobVector resources from Kubernetes!"
print_warning "This includes:"
echo "  - All deployments and pods"
echo "  - All services and LoadBalancers"
echo "  - All persistent volumes and data"
echo "  - The entire jobvector namespace"
echo ""
print_info "Note: AWS RDS database will NOT be deleted (managed separately)"
echo ""

read -p "Are you sure you want to continue? (yes/no) " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    print_info "Cleanup cancelled."
    exit 0
fi

print_info "Starting cleanup..."
echo ""

# Delete namespace (this will cascade delete everything)
print_info "Deleting jobvector namespace and all resources..."
kubectl delete namespace jobvector --timeout=120s || print_warning "Namespace may have already been deleted"

echo ""
print_info "Cleanup completed!"
print_info "All JobVector resources have been removed from Kubernetes."
