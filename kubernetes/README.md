# JobVector Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the JobVector application.

## Directory Structure

```
kubernetes/
├── namespace/          # Namespace configuration
├── postgres/           # PostgreSQL StatefulSet, Service, PVC
├── embedding-service/  # Embedding Service Deployment, Service
├── ollama/            # Ollama StatefulSet, Service
├── backend/           # Backend Deployment, Service, ConfigMap, Secret, PVCs
├── frontend/          # Frontend Deployment, Service, ConfigMap
└── ingress/           # Ingress configuration (optional)
```

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- StorageClass named `standard` available
- (Optional) NGINX Ingress Controller for Ingress

## Quick Start

### 1. Deploy All Components

```bash
# Create namespace
kubectl apply -f namespace/

# Deploy PostgreSQL
kubectl apply -f postgres/

# Deploy Embedding Service
kubectl apply -f embedding-service/

# Deploy Ollama
kubectl apply -f ollama/

# Deploy Backend
kubectl apply -f backend/

# Deploy Frontend
kubectl apply -f frontend/

# (Optional) Deploy Ingress
kubectl apply -f ingress/
```

### 2. Deploy in One Command

```bash
kubectl apply -f namespace/ -f postgres/ -f embedding-service/ -f ollama/ -f backend/ -f frontend/
```

## Verify Deployment

```bash
# Check all resources
kubectl get all -n jobvector

# Check persistent volumes
kubectl get pvc -n jobvector

# Check StatefulSets
kubectl get statefulset -n jobvector

# Check pods status
kubectl get pods -n jobvector -w
```

## View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n jobvector

# Frontend logs
kubectl logs -f deployment/frontend -n jobvector

# PostgreSQL logs
kubectl logs -f statefulset/postgres -n jobvector

# Ollama logs
kubectl logs -f statefulset/ollama -n jobvector

# Embedding Service logs
kubectl logs -f deployment/embeddingservice -n jobvector
```

## Access Application

### Using Port-Forward

```bash
# Access frontend
kubectl port-forward svc/frontend 3000:3000 -n jobvector
# Open: http://localhost:3000

# Access backend API
kubectl port-forward svc/backend 8080:8080 -n jobvector
# Open: http://localhost:8080/actuator/health
```

### Using LoadBalancer (if available)

```bash
# Get external IP
kubectl get svc frontend -n jobvector

# Access using the EXTERNAL-IP shown
```

### Using Ingress (if deployed)

Add to `/etc/hosts`:
```
<INGRESS-IP> jobvector.local
```

Access: http://jobvector.local

## Scaling

```bash
# Scale backend
kubectl scale deployment/backend --replicas=3 -n jobvector

# Scale frontend
kubectl scale deployment/frontend --replicas=3 -n jobvector
```

## Update Images

```bash
# Update backend image
kubectl set image deployment/backend backend=jobvector-backend:v2 -n jobvector

# Update frontend image
kubectl set image deployment/frontend frontend=jobvector-frontend:v2 -n jobvector

# Update embedding service image
kubectl set image deployment/embeddingservice embeddingservice=embeddingservice:v2 -n jobvector
```

## Secrets Management

**⚠️ IMPORTANT:** Before deploying to production:

1. Update secrets in `backend/secret.yaml`:
   - Change `DB_PASSWORD`
   - Change `JWT_SECRET` to a strong random string (minimum 256 bits)

2. Consider using Kubernetes Secrets management tools:
   - Sealed Secrets
   - External Secrets Operator
   - HashiCorp Vault

## Storage Classes

The manifests use `storageClassName: standard`. If your cluster uses a different storage class:

```bash
# List available storage classes
kubectl get storageclass

# Update the storageClassName in:
# - postgres/statefulset.yaml
# - ollama/statefulset.yaml
# - backend/pvc-uploads.yaml
# - backend/pvc-temp.yaml
```

## Troubleshooting

### Pods not starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n jobvector

# Check pod logs
kubectl logs <pod-name> -n jobvector
```

### PVC not binding

```bash
# Check PVC status
kubectl get pvc -n jobvector

# Check PVC events
kubectl describe pvc <pvc-name> -n jobvector

# Check available storage classes
kubectl get storageclass
```

### Database connection issues

```bash
# Test PostgreSQL connectivity
kubectl exec -it deployment/backend -n jobvector -- nc -zv postgres 5432

# Check PostgreSQL logs
kubectl logs statefulset/postgres -n jobvector
```

### Ollama model not loading

```bash
# Check Ollama logs
kubectl logs statefulset/ollama -n jobvector

# Manually pull model
kubectl exec -it ollama-0 -n jobvector -- ollama pull llama3
```

## Resource Requirements

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit | Storage |
|-----------|-------------|-----------|----------------|--------------|---------|
| PostgreSQL | 500m | 1000m | 512Mi | 1Gi | 10Gi |
| Ollama | 2000m | 4000m | 4Gi | 8Gi | 10Gi |
| Backend | 500m | 2000m | 1Gi | 2Gi | 7Gi (uploads+temp) |
| Frontend | 250m | 500m | 256Mi | 512Mi | - |
| Embedding | 500m | 2000m | 512Mi | 2Gi | - |

**Total Minimum Requirements:**
- CPU: ~4 cores
- Memory: ~8GB RAM
- Storage: ~30GB persistent storage

## Cleanup

```bash
# Delete all resources
kubectl delete namespace jobvector

# Or delete individually
kubectl delete -f frontend/
kubectl delete -f backend/
kubectl delete -f ollama/
kubectl delete -f embedding-service/
kubectl delete -f postgres/
kubectl delete -f namespace/
```

## Production Considerations

1. **High Availability:**
   - Increase replicas for backend and frontend
   - Consider multi-replica PostgreSQL with replication
   - Use pod anti-affinity rules

2. **Monitoring:**
   - Deploy Prometheus + Grafana
   - Enable metrics endpoints
   - Set up alerting

3. **Security:**
   - Use network policies
   - Enable RBAC
   - Scan images for vulnerabilities
   - Use private container registry

4. **Backup:**
   - Set up automated PostgreSQL backups
   - Backup PersistentVolumes regularly
   - Test restore procedures

5. **Performance:**
   - Configure resource limits based on load testing
   - Use HorizontalPodAutoscaler
   - Optimize database queries

## Support

For issues or questions, please refer to the main project documentation.
