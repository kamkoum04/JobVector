# JobVector AWS Architecture Diagram

## Complete Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    AWS Cloud (eu-west-1)                                 │
│                                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐│
│  │                          VPC: 10.0.0.0/16                                            ││
│  │                                                                                       ││
│  │  ┌────────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                    Availability Zone: eu-west-1a                                │ ││
│  │  │                                                                                  │ ││
│  │  │  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐    │ ││
│  │  │  │  Public Subnet      │  │  Private Subnet     │  │  Database Subnet    │    │ ││
│  │  │  │  10.0.1.0/24        │  │  10.0.10.0/24       │  │  10.0.20.0/24       │    │ ││
│  │  │  │                     │  │                     │  │                     │    │ ││
│  │  │  │  ┌──────────────┐  │  │  ┌──────────────┐  │  │                     │    │ ││
│  │  │  │  │              │  │  │  │              │  │  │                     │    │ ││
│  │  │  │  │ NAT Gateway  │  │  │  │  EKS Node    │  │  │                     │    │ ││
│  │  │  │  │   + EIP      │  │  │  │  (t3.micro)  │  │  │                     │    │ ││
│  │  │  │  │              │  │  │  │              │  │  │                     │    │ ││
│  │  │  │  └──────┬───────┘  │  │  └──────┬───────┘  │  │                     │    │ ││
│  │  │  │         │          │  │         │          │  │                     │    │ ││
│  │  │  └─────────┼──────────┘  └─────────┼──────────┘  └─────────────────────┘    │ ││
│  │  │            │                       │                                          │ ││
│  │  └────────────┼───────────────────────┼──────────────────────────────────────────┘ ││
│  │               │                       │                                            ││
│  │  ┌────────────┼───────────────────────┼──────────────────────────────────────────┐ ││
│  │  │            │  Availability Zone: eu-west-1b          │                        │ ││
│  │  │            │                       │                 │                        │ ││
│  │  │  ┌─────────┼──────────┐  ┌────────┼─────────┐  ┌────┼────────────────┐      │ ││
│  │  │  │  Public │ Subnet   │  │  Private Subnet  │  │  Database Subnet   │      │ ││
│  │  │  │  10.0.2.0/24       │  │  10.0.11.0/24    │  │  10.0.21.0/24      │      │ ││
│  │  │  │         │          │  │        │         │  │     │               │      │ ││
│  │  │  │         │          │  │  ┌─────┼──────┐ │  │  ┌──┼────────────┐  │      │ ││
│  │  │  │         │          │  │  │     │      │ │  │  │  │            │  │      │ ││
│  │  │  │         │          │  │  │  EKS Node  │ │  │  │  RDS         │  │      │ ││
│  │  │  │         │          │  │  │  (t3.micro)│ │  │  │  PostgreSQL  │  │      │ ││
│  │  │  │         │          │  │  │            │ │  │  │  15.3        │  │      │ ││
│  │  │  │         │          │  │  │            │ │  │  │  db.t3.micro │  │      │ ││
│  │  │  │         │          │  │  │            │ │  │  │  20GB        │  │      │ ││
│  │  │  │         │          │  │  └─────┬──────┘ │  │  │              │  │      │ ││
│  │  │  │         │          │  │        │        │  │  └──┬───────────┘  │      │ ││
│  │  │  └─────────┼──────────┘  └────────┼────────┘  └─────┼──────────────┘      │ ││
│  │  │            │                      │                  │                      │ ││
│  │  └────────────┼──────────────────────┼──────────────────┼──────────────────────┘ ││
│  │               │                      │                  │                        ││
│  │               │                      │                  │                        ││
│  │  ┌────────────┼──────────────────────┼──────────────────┼──────────────────────┐ ││
│  │  │            │    Route Tables      │                  │                      │ ││
│  │  │  ┌─────────┼─────────┐  ┌────────┼─────────┐  ┌─────┼──────────┐          │ ││
│  │  │  │         ▼         │  │        ▼         │  │     ▼          │          │ ││
│  │  │  │  Public Route    │  │  Private Route   │  │  DB Route       │          │ ││
│  │  │  │  0.0.0.0/0       │  │  0.0.0.0/0       │  │  0.0.0.0/0      │          │ ││
│  │  │  │  → IGW           │  │  → NAT GW        │  │  → NAT GW       │          │ ││
│  │  │  └──────────────────┘  └──────────────────┘  └─────────────────┘          │ ││
│  │  └───────────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                                 ││
│  │  ┌───────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                          Security Groups                                   │ ││
│  │  │                                                                             │ ││
│  │  │  ┌─────────────────────┐           ┌─────────────────────┐               │ ││
│  │  │  │  EKS Cluster SG     │  Port     │  RDS Security Group │               │ ││
│  │  │  │                     │  5432     │                     │               │ ││
│  │  │  │  (Auto-created)     │  ───────> │  Allows:            │               │ ││
│  │  │  │                     │           │  - Port 5432 (TCP)  │               │ ││
│  │  │  │                     │           │  - From EKS SG      │               │ ││
│  │  │  └─────────────────────┘           └─────────────────────┘               │ ││
│  │  └───────────────────────────────────────────────────────────────────────────┘ ││
│  │                                                                                 ││
│  │  ┌───────────────────────────────────────────────────────────────────────────┐ ││
│  │  │                     Internet Gateway (IGW)                                 │ ││
│  │  │                     - Attached to VPC                                      │ ││
│  │  │                     - Routes public subnet traffic                         │ ││
│  │  └────────────────────────────────┬──────────────────────────────────────────┘ ││
│  │                                   │                                            ││
│  └───────────────────────────────────┼────────────────────────────────────────────┘│
│                                      │                                              │
│  ┌───────────────────────────────────┼────────────────────────────────────────────┐│
│  │                     EKS Control Plane                                          ││
│  │                                   │                                            ││
│  │  ┌────────────────────────────────┼──────────────────────────────────────────┐││
│  │  │  Cluster: job-vector-cluster   │                                          │││
│  │  │  Version: 1.33+                │                                          │││
│  │  │  Endpoint: Public + Private    │                                          │││
│  │  │                                │                                          │││
│  │  │  IAM Roles:                    │                                          │││
│  │  │  - eks-cluster-role            │                                          │││
│  │  │    └─ AmazonEKSClusterPolicy   │                                          │││
│  │  │                                │                                          │││
│  │  │  Node Group: job-vector-node-group                                        │││
│  │  │  - Desired: 2 nodes            │                                          │││
│  │  │  - Min: 1, Max: 3              │                                          │││
│  │  │  - Instance Type: t3.micro     │                                          │││
│  │  │                                │                                          │││
│  │  │  IAM Role: eks-node-group-role │                                          │││
│  │  │  - AmazonEKSWorkerNodePolicy   │                                          │││
│  │  │  - AmazonEKS_CNI_Policy        │                                          │││
│  │  │  - AmazonEC2ContainerRegistryReadOnly                                     │││
│  │  └────────────────────────────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐│
│  │                              S3 Bucket (Regional)                                ││
│  │                                                                                   ││
│  │  ┌────────────────────────────────────────────────────────────────────────────┐ ││
│  │  │  Bucket: job-vector-cv-uploads                                             │ ││
│  │  │                                                                              │ ││
│  │  │  Configuration:                                                             │ ││
│  │  │  - Versioning: Disabled                                                     │ ││
│  │  │  - Public Access: BLOCKED                                                   │ ││
│  │  │    • block_public_acls = true                                              │ ││
│  │  │    • block_public_policy = true                                            │ ││
│  │  │    • ignore_public_acls = true                                             │ ││
│  │  │    • restrict_public_buckets = true                                        │ ││
│  │  │                                                                              │ ││
│  │  │  Purpose: CV/Resume file uploads                                           │ ││
│  │  └────────────────────────────────────────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────────────────────────────────────┘│
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │   Internet   │
                                    └──────┬───────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │   Internet Gateway     │
                              └────────────┬───────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
            │ Public Subnet │     │ Public Subnet │     │  NAT Gateway  │
            │   10.0.1.0    │     │   10.0.2.0    │     │   (eu-west-1a)│
            └───────┬───────┘     └───────────────┘     └───────┬───────┘
                    │                                            │
                    └────────────────────┬───────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
            ┌───────────────┐    ┌───────────────┐   ┌───────────────┐
            │ Private Subnet│    │ Private Subnet│   │  EKS Nodes    │
            │   10.0.10.0   │    │   10.0.11.0   │   │  - Node 1     │
            │               │    │               │   │  - Node 2     │
            │  EKS Node 1   │    │  EKS Node 2   │   │  (t3.micro)   │
            └───────┬───────┘    └───────┬───────┘   └───────┬───────┘
                    │                    │                    │
                    └────────────────────┼────────────────────┘
                                         │ Port 5432
                                         │ (PostgreSQL)
                                         ▼
                    ┌────────────────────────────────────────┐
                    │         Database Subnets               │
                    │  ┌──────────────────────────────────┐  │
                    │  │  RDS PostgreSQL 15.3             │  │
                    │  │  Instance: jobvectordb           │  │
                    │  │  Class: db.t3.micro              │  │
                    │  │  Storage: 20GB                   │  │
                    │  │  Multi-AZ: Disabled (dev)        │  │
                    │  │  Username: dbadmin               │  │
                    │  │  Subnets: 10.0.20.0, 10.0.21.0   │  │
                    │  └──────────────────────────────────┘  │
                    └────────────────────────────────────────┘
```

## Resource Summary

### Total Resources: 36

| Category | Count | Resources |
|----------|-------|-----------|
| **Networking** | 11 | VPC, 6 Subnets, Internet Gateway, NAT Gateway, Elastic IP, 3 Route Tables |
| **EKS** | 7 | Cluster, Node Group, 2 IAM Roles, 4 IAM Policy Attachments |
| **Database** | 3 | RDS Instance, DB Subnet Group, Security Group |
| **Storage** | 3 | S3 Bucket, Versioning Config, Public Access Block |
| **Routing** | 12 | 3 Route Tables, 6 Route Table Associations, 3 Routes |

## Network Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Traffic Flows                                │
└─────────────────────────────────────────────────────────────────────┘

1. INBOUND (Internet → EKS):
   Internet → IGW → Public Subnet → Load Balancer → Private Subnet → EKS Pods

2. OUTBOUND (EKS → Internet):
   EKS Nodes → Private Subnet → NAT Gateway → Public Subnet → IGW → Internet

3. EKS → RDS:
   EKS Nodes (Private) → Database Subnet → RDS PostgreSQL (Port 5432)
   ✓ Secured by Security Group

4. EKS → S3:
   EKS Nodes → NAT Gateway → Internet → S3 (via AWS backbone)
   Alternative: VPC Endpoint (future optimization)

5. Database Connectivity:
   RDS → NAT Gateway → Internet (for updates/patches)
```

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      Security Layers                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer 1: Network Isolation                                  │
│  ├─ Public Subnets: Internet-facing resources                │
│  ├─ Private Subnets: EKS worker nodes (no direct internet)   │
│  └─ Database Subnets: RDS isolated from public               │
│                                                               │
│  Layer 2: Security Groups                                    │
│  ├─ EKS Cluster SG: Auto-managed by AWS                      │
│  └─ RDS SG: Only allows port 5432 from EKS SG               │
│                                                               │
│  Layer 3: IAM Roles & Policies                               │
│  ├─ EKS Cluster Role: AmazonEKSClusterPolicy                 │
│  ├─ EKS Node Role:                                           │
│  │   ├─ AmazonEKSWorkerNodePolicy                           │
│  │   ├─ AmazonEKS_CNI_Policy                                │
│  │   └─ AmazonEC2ContainerRegistryReadOnly                  │
│                                                               │
│  Layer 4: S3 Security                                        │
│  ├─ Block all public access                                  │
│  ├─ No public ACLs                                           │
│  └─ Access via IAM roles only                                │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## High Availability Setup

```
┌────────────────────────────────────────────────────────┐
│         Availability Zone: eu-west-1a                   │
├────────────────────────────────────────────────────────┤
│  • Public Subnet (10.0.1.0/24)                         │
│  • Private Subnet (10.0.10.0/24) → EKS Node 1         │
│  • Database Subnet (10.0.20.0/24)                      │
│  • NAT Gateway + Elastic IP                            │
└────────────────────────────────────────────────────────┘
                         ↕
┌────────────────────────────────────────────────────────┐
│         Availability Zone: eu-west-1b                   │
├────────────────────────────────────────────────────────┤
│  • Public Subnet (10.0.2.0/24)                         │
│  • Private Subnet (10.0.11.0/24) → EKS Node 2         │
│  • Database Subnet (10.0.21.0/24) → RDS Primary       │
└────────────────────────────────────────────────────────┘

Benefits:
✓ Multi-AZ subnet distribution
✓ EKS nodes spread across 2 AZs
✓ Auto-scaling group handles node distribution
✓ Database subnets in both AZs (ready for Multi-AZ RDS)
```

## Cost Optimization (Free Tier Eligible)

```
┌───────────────────────────────────────────────────────────┐
│              Resource            │  Cost (Dev Environment) │
├──────────────────────────────────┼─────────────────────────┤
│ VPC, Subnets, IGW                │  FREE                   │
│ NAT Gateway                      │  ~$32/month*            │
│ Elastic IP (attached)            │  FREE                   │
│ EKS Control Plane                │  $73/month              │
│ 2x t3.micro (EKS nodes)          │  FREE (750h/month)      │
│ RDS db.t3.micro                  │  FREE (750h/month)      │
│ S3 Storage (first 5GB)           │  FREE                   │
│ IAM Roles/Policies               │  FREE                   │
├──────────────────────────────────┼─────────────────────────┤
│ ESTIMATED TOTAL                  │  ~$105/month            │
└───────────────────────────────────────────────────────────┘

* NAT Gateway is the main cost - consider VPC endpoints for S3/ECR
  to reduce NAT Gateway data transfer costs
```

## Deployment Outputs

After `terraform apply`, you'll receive:

```yaml
Outputs:
  vpc_id: vpc-xxxxxxxxx
  
  cluster_name: job-vector-cluster
  cluster_endpoint: https://XXXXX.eks.eu-west-1.amazonaws.com
  cluster_security_group_id: sg-xxxxxxxxx
  
  rds_endpoint: jobvectordb.xxxxxxxx.eu-west-1.rds.amazonaws.com:5432
  rds_address: jobvectordb.xxxxxxxx.eu-west-1.rds.amazonaws.com
  
  s3_bucket_name: job-vector-cv-uploads
  s3_bucket_arn: arn:aws:s3:::job-vector-cv-uploads
  
  nat_gateway_ip: X.X.X.X
  
  public_subnet_ids: [subnet-xxx, subnet-yyy]
  private_subnet_ids: [subnet-aaa, subnet-bbb]
  db_subnet_ids: [subnet-ccc, subnet-ddd]
```

## Next Steps After Deployment

1. **Configure kubectl**
   ```bash
   aws eks update-kubeconfig --name job-vector-cluster --region eu-west-1
   ```

2. **Deploy Application**
   - Build Docker images (frontend, backend, embedding service)
   - Push to ECR or Docker Hub
   - Apply Kubernetes manifests

3. **Setup Load Balancer**
   - Install AWS Load Balancer Controller
   - Create Ingress resource

4. **Configure Application**
   - Create Kubernetes Secrets for RDS credentials
   - Create ConfigMaps for environment variables
   - Mount S3 bucket credentials

---

**Architecture Version:** 1.0  
**Last Updated:** November 15, 2025  
**Terraform Version:** >= 1.0  
**AWS Provider:** ~> 5.0
