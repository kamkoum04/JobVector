# JobVector AWS Architecture - Simple & Production-Ready

## Overview
This is a **production-ready AWS architecture** for your JobVector application with high availability across 3 Availability Zones.

---

## 🏗️ Architecture Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AWS Region: eu-west-1                               │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        VPC: 10.0.0.0/16                               │ │
│  │                                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────────────┐ │ │
│  │  │              Availability Zone: eu-west-1a                      │ │ │
│  │  │                                                                 │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │ │ │
│  │  │  │Public Subnet │  │Private Subnet│  │ Database Subnet    │  │ │ │
│  │  │  │10.0.1.0/24   │  │10.0.10.0/24  │  │ 10.0.20.0/24       │  │ │ │
│  │  │  │              │  │              │  │                    │  │ │ │
│  │  │  │  ┌────────┐  │  │ ┌─────────┐ │  │  ┌──────────────┐ │  │ │ │
│  │  │  │  │  ALB   │  │  │ │EKS Node │ │  │  │RDS Primary   │ │  │ │ │
│  │  │  │  │        │  │  │ │t3.medium│ │  │  │db.t3.small   │ │  │ │ │
│  │  │  │  └────┬───┘  │  │ │Backend  │ │  │  └──────────────┘ │  │ │ │
│  │  │  │       │      │  │ │Embedding│ │  │                    │  │ │ │
│  │  │  │  ┌────┴───┐  │  │ └─────────┘ │  │                    │  │ │ │
│  │  │  │  │  NAT   │◄─┼──┼─────────────┼──┼────────────────────┤  │ │ │
│  │  │  │  │Gateway │  │  │             │  │                    │  │ │ │
│  │  │  │  └────────┘  │  │             │  │                    │  │ │ │
│  │  │  └──────────────┘  └─────────────┘  └────────────────────┘  │ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │              Availability Zone: eu-west-1b                  │ │ │
│  │  │                                                             │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐│ │ │
│  │  │  │Public Subnet │  │Private Subnet│  │ Database Subnet    ││ │ │
│  │  │  │10.0.2.0/24   │  │10.0.11.0/24  │  │ 10.0.21.0/24       ││ │ │
│  │  │  │              │  │              │  │                    ││ │ │
│  │  │  │  ┌────────┐  │  │ ┌─────────┐ │  │  ┌──────────────┐ ││ │ │
│  │  │  │  │  ALB   │  │  │ │EKS Node │ │  │  │RDS Standby   │ ││ │ │
│  │  │  │  │        │  │  │ │t3.large │ │  │  │(Multi-AZ)    │ ││ │ │
│  │  │  │  └────────┘  │  │ │Ollama   │ │  │  └──────────────┘ ││ │ │
│  │  │  │              │  │ │Frontend │ │  │                    ││ │ │
│  │  │  │  ┌────────┐  │  │ └─────────┘ │  │                    ││ │ │
│  │  │  │  │  NAT   │◄─┼──┼─────────────┼──┼────────────────────┤│ │ │
│  │  │  │  │Gateway │  │  │             │  │                    ││ │ │
│  │  │  │  └────────┘  │  │             │  │                    ││ │ │
│  │  │  └──────────────┘  └─────────────┘  └────────────────────┘│ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │              Availability Zone: eu-west-1c                  │ │ │
│  │  │                                                             │ │ │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐│ │ │
│  │  │  │Public Subnet │  │Private Subnet│  │ Database Subnet    ││ │ │
│  │  │  │10.0.3.0/24   │  │10.0.12.0/24  │  │ 10.0.22.0/24       ││ │ │
│  │  │  │              │  │              │  │                    ││ │ │
│  │  │  │  ┌────────┐  │  │ ┌─────────┐ │  │                    ││ │ │
│  │  │  │  │  ALB   │  │  │ │EKS Node │ │  │  (Reserved for    ││ │ │
│  │  │  │  │        │  │  │ │t3.medium│ │  │   RDS failover)   ││ │ │
│  │  │  │  └────────┘  │  │ │         │ │  │                    ││ │ │
│  │  │  │              │  │ │         │ │  │                    ││ │ │
│  │  │  │  ┌────────┐  │  │ └─────────┘ │  │                    ││ │ │
│  │  │  │  │  NAT   │◄─┼──┼─────────────┼──┼────────────────────┤│ │ │
│  │  │  │  │Gateway │  │  │             │  │                    ││ │ │
│  │  │  │  └────────┘  │  │             │  │                    ││ │ │
│  │  │  └──────────────┘  └─────────────┘  └────────────────────┘│ │ │
│  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │                                                                   │ │
│  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │                   Internet Gateway                           │ │ │
### 1. **VPC (Virtual Private Cloud)**
```
CIDR: 10.0.0.0/16
Region: eu-west-1
Availability Zones: 3 (eu-west-1a, eu-west-1b, eu-west-1c)
```│  • jobvector-uploads (5GB)                                         │ │
│  │  • jobvector-ollama-models (10GB)                                  │ │
### 2. **Subnets (9 Total - 3 per AZ)**
| Subnet | AZ | CIDR | Type | Purpose |
|--------|-----|------|------|---------||
| Public-1a | eu-west-1a | 10.0.1.0/24 | Public | ALB + NAT Gateway |
| Public-1b | eu-west-1b | 10.0.2.0/24 | Public | ALB + NAT Gateway |
| Public-1c | eu-west-1c | 10.0.3.0/24 | Public | ALB + NAT Gateway |
| Private-1a | eu-west-1a | 10.0.10.0/24 | Private | EKS Node 1 |
| Private-1b | eu-west-1b | 10.0.11.0/24 | Private | EKS Node 2 |
| Private-1c | eu-west-1c | 10.0.12.0/24 | Private | EKS Node 3 |
| Database-1a | eu-west-1a | 10.0.20.0/24 | Private | RDS Primary |
| Database-1b | eu-west-1b | 10.0.21.0/24 | Private | RDS Standby |
| Database-1c | eu-west-1c | 10.0.22.0/24 | Private | RDS Reserved |ternet
```

---

## 📋 Simple Component List

### 4. **NAT Gateway (3 Total - High Availability)**
- 1 NAT Gateway per AZ (3 total)
- Each NAT in respective public subnet
- Allows EKS nodes to access internet (for updates, pulling images)
- Provides redundancy if one AZ fails
- **Cost**: ~$96/month ($32 × 3) + data transfer
Availability Zones: 1 (eu-west-1a only)
```

### 2. **Subnets (3 Total)**
| Subnet | CIDR | Type | Purpose |
|--------|------|------|---------|
| Public | 10.0.1.0/24 | Public | ALB + NAT Gateway |
| Private | 10.0.10.0/24 | Private | EKS Nodes (2 nodes) |
### 6. **EKS Cluster (3 Nodes - High Availability)**

**Node 1: t3.medium (AZ-1a) - 2 vCPU, 4GB RAM**
- Backend pod (500m CPU, 1Gi RAM)
- Embedding Service pod (500m CPU, 512Mi RAM)
- **Cost**: ~$30/month

**Node 2: t3.large (AZ-1b) - 2 vCPU, 8GB RAM**
- Ollama pod (2500m CPU, 5Gi RAM)
- Frontend pod (250m CPU, 256Mi RAM)
- **Cost**: ~$60/month

**Node 3: t3.medium (AZ-1c) - 2 vCPU, 4GB RAM**
- Standby/overflow capacity
- Can run replicas for HA
- **Cost**: ~$30/month

**Total Cluster**:
- 3 nodes across 3 AZs
- 6 vCPUs, 16GB RAM total
- **EKS Control Plane**: $72/month
- **Worker Nodes**: $120/monthrtificate
- Routes to frontend/backend services
### 7. **RDS PostgreSQL (Multi-AZ - High Availability)**
```
Engine: PostgreSQL 15.3
Instance: db.t3.small (2 vCPU, 2GB RAM)
Storage: 30GB gp3
Multi-AZ: Yes (Primary in AZ-1a, Standby in AZ-1b)
Automatic Failover: Yes
Backup: 7 days retention
Encryption: Yes (KMS at rest, TLS in transit)
```
- **Cost**: ~$80/month (Multi-AZ doubles cost)
- **Benefit**: Automatic failover if primary AZ failsM)**
- Ollama pod (2500m CPU, 5Gi RAM)
- Frontend pod (250m CPU, 256Mi RAM)
- **Cost**: ~$60/month

**Total Cluster**:
- 2 nodes, 4 vCPUs, 12GB RAM
- **EKS Control Plane**: $72/month
- **Worker Nodes**: $90/month

### 7. **RDS PostgreSQL (Simple Setup)**
```
Engine: PostgreSQL 15.3
Instance: db.t3.small (2 vCPU, 2GB RAM)
Storage: 30GB gp3
Single-AZ (no standby for cost savings)
Backup: 7 days
Encryption: Yes
```
- **Cost**: ~$40/month (Single-AZ)

### 8. **S3 Buckets (2 Total)**

**Bucket 1: jobvector-uploads**
- User CV uploads
- 5-10GB storage
- Versioning enabled
- **Cost**: ~$0.23/month

**Bucket 2: jobvector-ollama-models**
- AI model storage
- 10GB storage
- **Cost**: ~$0.23/month

### 9. **Security Groups (4 Simple Rules)**

**ALB Security Group**:
```
Ingress: Port 80, 443 from 0.0.0.0/0
Egress: All to EKS Node SG
```

**EKS Node Security Group**:
```
Ingress: From ALB SG, From same SG
Egress: All traffic
```

**RDS Security Group**:
```
Ingress: Port 5432 from EKS Node SG only
## 💰 Total Monthly Cost (High Availability)

| Component | Cost |
|-----------|------|
| EKS Control Plane | $72 |
| 3 EKS Nodes (2× t3.medium + 1× t3.large) | $120 |
| RDS PostgreSQL (Multi-AZ) | $80 |
| 3 NAT Gateways (1 per AZ) | $96 |
| ALB | $16 |
| S3 Storage (15GB) | $0.50 |
| Data Transfer | $8 |
| CloudWatch Logs | $5 |
| Route53 | $0.50 |
| **TOTAL** | **~$398/month** |

**High Availability Benefits**:
- ✅ 3 Availability Zones (survives AZ failure)
- ✅ RDS Multi-AZ with automatic failover
- ✅ 3 NAT Gateways (redundant internet access)
- ✅ EKS nodes distributed across 3 AZs
- ✅ ALB distributes traffic across all AZs
## 💰 Total Monthly Cost (Simplified)

| Component | Cost |
## 🚀 Why This Architecture is Production-Ready

### ✅ What We HAVE (Production Grade)
1. **VPC** - Your private network
2. **3 Availability Zones** - High availability
3. **9 Subnets** - 3 per AZ (Public, Private, Database)
4. **IGW** - Internet access
5. **3 NAT Gateways** - Redundant outbound internet
6. **ALB** - Multi-AZ load balancer (HTTPS)
7. **3 EKS Nodes** - Distributed across 3 AZs
8. **RDS Multi-AZ** - Automatic failover database
9. **2 S3 Buckets** - File storage

### ❌ What We DON'T HAVE (Optional)
1. ❌ **API Gateway** - Not needed, ALB handles routing
2. ❌ **CloudFront** - Add later for CDN if needed
3. ❌ **Bastion Host** - Use AWS Systems Manager instead
4. ❌ **WAF** - Add later for security if needed
5. ❌ **Auto Scaling** - Can add when traffic grows
6. ❌ **ElastiCache** - Add Redis if needed later
1. **VPC** - Your private network
2. **1 Availability Zone** - Simpler, cheaper
3. **3 Subnets** - Public, Private, Database
4. **IGW** - Internet access
5. **1 NAT Gateway** - Outbound internet for nodes
6. **ALB** - Load balancer (required for HTTPS)
7. **2 EKS Nodes** - Just enough for your app
8. **RDS Single-AZ** - Managed database
9. **2 S3 Buckets** - File storage

### ❌ What We DON'T HAVE (Not Needed)
1. ❌ **Multi-AZ** - Saves $40/month, still reliable
2. ❌ **Second NAT Gateway** - Saves $32/month
3. ❌ **API Gateway** - Not needed, ALB handles routing
4. ❌ **CloudFront** - Not needed for simple app
5. ❌ **Bastion Host** - Use AWS Systems Manager
### AWS EKS Distribution (3 Nodes - High Availability):
```
Node 1 (t3.medium - AZ-1a - 2 vCPU, 4GB):
  - Backend:     500m CPU, 1Gi RAM
  - Embedding:   500m CPU, 512Mi RAM
  - System pods: ~300m CPU, 500Mi RAM
  ──────────────────────────────────
  TOTAL:         1300m CPU, 2Gi RAM
  Available:     700m CPU, 2GB RAM

Node 2 (t3.large - AZ-1b - 2 vCPU, 8GB):
  - Ollama:      2500m CPU, 5Gi RAM
  - Frontend:    250m CPU, 256Mi RAM
  - System pods: ~300m CPU, 500Mi RAM
  ──────────────────────────────────
  TOTAL:         3050m CPU, 5.75Gi RAM
  Available:     -1050m CPU (burst), 2.25GB RAM

Node 3 (t3.medium - AZ-1c - 2 vCPU, 4GB):
  - Standby capacity for HA
  - System pods: ~300m CPU, 500Mi RAM
  ──────────────────────────────────
  TOTAL:         300m CPU, 500Mi RAM
  Available:     1700m CPU, 3.5GB RAM (ready for failover)
```

**Benefits**:
- If any AZ fails, workloads can move to Node 3
- Can run backend/frontend replicas for zero-downtime deployments
- t3 instances can burst above 100% CPU temporarily
```
Node 1 (t3.medium - 2 vCPU, 4GB):
  - Backend:     500m CPU, 1Gi RAM
  - Embedding:   500m CPU, 512Mi RAM
  - System pods: ~300m CPU, 500Mi RAM
  ──────────────────────────────────
  TOTAL:         1300m CPU, 2Gi RAM
  Available:     700m CPU, 2GB RAM (headroom)

Node 2 (t3.large - 2 vCPU, 8GB):
  - Ollama:      2500m CPU, 5Gi RAM
  - Frontend:    250m CPU, 256Mi RAM
  - System pods: ~300m CPU, 500Mi RAM
  ──────────────────────────────────
  TOTAL:         3050m CPU, 5.75Gi RAM
  Available:     -1050m CPU (80% burst), 2.25GB RAM
```

**Note**: t3 instances can burst above 100% CPU for short periods.

---

## 🔒 Security (Simple but Secure)

### Network Security:
- RDS in private subnet (no internet access)
- EKS nodes in private subnet
- Only ALB is public-facing
- All data encrypted at rest (RDS, S3)
- TLS/SSL in transit (ALB → Nodes → RDS)

### Access Control:
- Security Groups restrict traffic
- IAM roles for EKS pods (no credentials in code)
- S3 bucket policies (private by default)

---

## 📝 What You Need to Create

### Infrastructure (Terraform):
1. VPC + Subnets
## 🎯 Summary

**This is a PRODUCTION-READY High Availability architecture:**

- **1 VPC** in 1 region (eu-west-1)
- **3 Availability Zones** (eu-west-1a, 1b, 1c)
- **9 Subnets** (3 public, 3 private, 3 database)
- **3 EKS Nodes** (2× t3.medium + 1× t3.large)
- **1 RDS Multi-AZ** (PostgreSQL with automatic failover)
- **2 S3 Buckets** (replicated across AZs automatically)
- **1 ALB** (multi-AZ load balancing)
- **3 NAT Gateways** (1 per AZ for redundancy)
- **NO** API Gateway, CloudFront, WAF, Bastion (can add later)

**Total Cost**: ~$398/month

**High Availability Benefits**:
- ✅ Survives complete AZ failure
- ✅ RDS automatic failover (< 2 min downtime)
- ✅ EKS nodes distributed for redundancy
- ✅ Multiple NAT gateways (no single point of failure)
- ✅ ALB health checks and automatic routing
- ✅ 99.99% uptime SLA possible

**Trade-offs vs Single-AZ**:
- ⚠️ 54% more expensive (~$398 vs $258)
- ⚠️ More complex networking
- ✅ Production-grade reliability
- ✅ No downtime during AZ failures
- ✅ Better for business continuity

**Recommendation**: Use this for production. The extra $140/month buys you peace of mind and business continuity!
- **1 Availability Zone** (eu-west-1a)
- **3 Subnets** (public, private, database)
- **2 EKS Nodes** (t3.medium + t3.large)
- **1 RDS** (Single-AZ PostgreSQL)
- **2 S3 Buckets**
- **1 ALB** for load balancing
- **1 NAT Gateway** for outbound traffic
- **NO** API Gateway, CloudFront, WAF, Multi-AZ, Bastion

**Total Cost**: ~$258/month (vs $342 multi-AZ setup)

**Trade-offs**:
- ✅ 24% cheaper than multi-AZ
- ✅ Simpler to manage
- ✅ Still production-ready
- ⚠️ No automatic failover (RDS Single-AZ)
- ⚠️ If AZ-1a goes down, app is down (rare)

For a startup/small business, this is **perfect**. You can always add Multi-AZ later when traffic grows!
