# JobVector Kubernetes Deployment - AWS EKS

This directory contains Kubernetes manifests for deploying the JobVector application on AWS EKS.

## Directory Structure

```
kubernetes/
├── namespace/          # Namespace configuration
├── embedding-service/  # Embedding Service Deployment, Service
├── ollama/            # Ollama StatefulSet, Service
├── backend/           # Backend Deployment, Service, ConfigMap, Secret, PVCs
├── frontend/          # Frontend Deployment, Service, ConfigMap
├── deploy.sh          # Automated deployment script
└── cleanup.sh         # Cleanup script
```

## Prerequisites

- AWS EKS cluster (Kubernetes v1.24+)
- kubectl configured for EKS cluster
- AWS RDS PostgreSQL database running
- StorageClass `gp2` available (default on EKS)
- AWS LoadBalancer Controller installed on EKS cluster

## Architecture

### Managed Services (AWS)
- **Database**: AWS RDS PostgreSQL (`jobvector-db.cjuy2asg2xaj.eu-west-3.rds.amazonaws.com`)
- **Load Balancer**: AWS Application/Network Load Balancer (provisioned automatically)
- **Storage**: AWS EBS volumes via gp2 StorageClass

### In-Cluster Components
- **Backend**: Spring Boot application (Java 21)
- **Frontend**: Next.js application
- **Embedding Service**: Python FastAPI service
- **Ollama**: LLM inference service (StatefulSet)

## Quick Start

### 1. Automated Deployment

```bash
# Deploy all components in correct order
./deploy.sh
```

The script will:
1. Create namespace
2. Deploy Embedding Service
3. Deploy Ollama StatefulSet
4. Deploy Backend with init containers
5. Deploy Frontend
6. Wait for all pods to be ready
7. Display access information

### 2. Manual Deployment

```bash
# Create namespace
kubectl apply -f namespace/

# Deploy Embedding Service
kubectl apply -f embedding-service/

# Deploy Ollama
kubectl apply -f ollama/

# Deploy Backend
kubectl apply -f backend/

# Deploy Frontend
kubectl apply -f frontend/
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

# Get LoadBalancer URLs
kubectl get svc -n jobvector
```

## View Logs

```bash
# Backend logs
kubectl logs -f deployment/backend -n jobvector

# Frontend logs
kubectl logs -f deployment/frontend -n jobvector

# Ollama logs
kubectl logs -f statefulset/ollama -n jobvector

# Embedding Service logs
kubectl logs -f deployment/embeddingservice -n jobvector
```

## Access Application

### Via AWS Load Balancer (Production)

```bash
# Get Frontend LoadBalancer URL
kubectl get svc frontend -n jobvector
# Access via EXTERNAL-IP (AWS LoadBalancer DNS)

# Access backend API
kubectl get svc backend -n jobvector
# Access via EXTERNAL-IP:8080/actuator/health
```

### Via Port-Forward (Development)

```bash
# Access frontend locally
kubectl port-forward svc/frontend 3000:80 -n jobvector
# Open: http://localhost:3000

# Access backend API locally

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
   - Change `DB_PASSWORD` to match your AWS RDS password
   - Change `JWT_SECRET` to a strong random string (minimum 256 bits)

2. Consider using AWS Secrets Manager integration:
   - AWS Secrets Store CSI Driver
   - External Secrets Operator with AWS backend
   - HashiCorp Vault

3. Update database connection in `backend/configmap.yaml`:
   - Ensure RDS endpoint is correct
   - Verify database name and username

## Storage

The manifests use `storageClassName: gp2` (default AWS EBS storage). 

```bash
# List available storage classes
kubectl get storageclass

# Available storage classes on EKS:
# - gp2 (General Purpose SSD - default)
# - gp3 (Newer General Purpose SSD)
# - io1 (Provisioned IOPS SSD)
```

### Storage used by:
- **Backend**: PVC for uploads/cvs and temp directories (10Gi)
- **Ollama**: StatefulSet PVC for model storage (20Gi)

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
# Test RDS connectivity from backend pod
kubectl exec -it deployment/backend -n jobvector -- nc -zv jobvector-db.cjuy2asg2xaj.eu-west-3.rds.amazonaws.com 5432

# Check backend logs for database errors
kubectl logs deployment/backend -n jobvector | grep -i "database\|postgres\|sql"

# Verify security group allows EKS to RDS connection
# - Check RDS security group allows inbound 5432 from EKS cluster
# - Verify RDS is accessible from VPC
```

### Ollama model not loading

```bash
# Check Ollama logs
kubectl logs statefulset/ollama -n jobvector

# Manually pull model (phi3:mini is pre-configured)
kubectl exec -it ollama-0 -n jobvector -- ollama pull phi3:mini

# List installed models
kubectl exec -it ollama-0 -n jobvector -- ollama list
```

### LoadBalancer not getting External IP

```bash
# Check LoadBalancer service status
kubectl describe svc frontend -n jobvector
kubectl describe svc backend -n jobvector

# Verify AWS LoadBalancer Controller is installed
kubectl get deployment -n kube-system aws-load-balancer-controller

# Check controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller
```

## Resource Requirements

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit | Storage |
|-----------|-------------|-----------|----------------|--------------|---------|
| Ollama | 2000m | 4000m | 4Gi | 8Gi | 20Gi |
| Backend | 500m | 2000m | 1Gi | 2Gi | 10Gi (uploads) |
| Frontend | 250m | 500m | 256Mi | 512Mi | - |
| Embedding | 500m | 2000m | 512Mi | 2Gi | - |

**Total Minimum Requirements:**
- CPU: ~4 cores
- Memory: ~8GB RAM
- Storage: ~30GB EBS persistent storage
- AWS RDS PostgreSQL (managed separately)

**Recommended EKS Node Configuration:**
- Node Instance Type: t3.xlarge or larger (4 vCPU, 16GB RAM)
- Minimum Nodes: 2 (for high availability)
- Storage: gp2 or gp3 EBS volumes

## Cleanup

### Automated Cleanup

```bash
# Run cleanup script (deletes namespace and all resources)
./cleanup.sh
```

### Manual Cleanup

```bash
# Delete all resources (keeps AWS RDS database)
kubectl delete namespace jobvector

# Or delete individually
kubectl delete -f frontend/
kubectl delete -f backend/
kubectl delete -f ollama/
kubectl delete -f embedding-service/
kubectl delete -f namespace/
```

**Note:** AWS RDS database and LoadBalancers will be managed separately and are not deleted by these commands.

## Production Considerations

### AWS-Specific Considerations

1. **Database (RDS):**
   - Use Multi-AZ deployment for high availability
   - Enable automated backups
   - Configure Performance Insights
   - Use appropriate instance size (db.t3.medium or larger)

2. **Load Balancing:**
   - AWS ALB is provisioned automatically by services
   - Configure health checks appropriately
   - Use AWS ACM for SSL/TLS certificates
   - Set up Route53 for custom domain

3. **Storage (EBS):**
   - Use gp3 for better performance and cost
   - Enable EBS snapshots for backups
   - Consider using EFS for shared storage needs

4. **Networking:**
   - Ensure EKS cluster and RDS are in same VPC
   - Configure security groups properly
   - Use private subnets for database
   - Public subnets for LoadBalancers

5. **Monitoring:**
   - Enable CloudWatch Container Insights
   - Set up CloudWatch alarms
   - Use AWS X-Ray for tracing
   - Deploy Prometheus + Grafana for detailed metrics

### High Availability

- Increase replicas for backend and frontend
- Use pod anti-affinity rules for better distribution
- Deploy across multiple AZs
- Use Horizontal Pod Autoscaler (HPA)

### Security

- Use AWS Secrets Manager or Parameter Store for secrets
- Enable IRSA (IAM Roles for Service Accounts)
- Use network policies to restrict pod communication
- Scan container images (AWS ECR scanning)
- Enable pod security policies/standards
- Use private ECR registry

### Backup & Disaster Recovery

- Automated RDS backups (point-in-time recovery)
- EBS volume snapshots
- Velero for cluster-level backups
- Test restore procedures regularly
- Document recovery procedures

### Performance Optimization

- Use AWS-optimized AMIs for EKS nodes
- Configure appropriate resource requests/limits
- Enable cluster autoscaler
- Use Horizontal Pod Autoscaler
- Optimize database queries and indexes
- Consider RDS read replicas for read-heavy workloads

## Cost Optimization

1. Use Spot instances for non-critical workloads
2. Right-size RDS instance based on actual usage
3. Use gp3 EBS volumes (better cost/performance)
4. Enable EKS cluster autoscaler to scale down when not needed
5. Use AWS Savings Plans or Reserved Instances
6. Monitor and optimize data transfer costs

## Support

For issues or questions:
