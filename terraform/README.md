# 🚀 JobVector AWS Infrastructure Deployment

This Terraform configuration deploys a production-ready 3-AZ AWS infrastructure for the JobVector application.

## 📋 Architecture Overview

- **Region**: eu-west-3 (Paris)
- **VPC**: 10.0.0.0/16 across 3 Availability Zones
- **EKS**: Kubernetes 1.31 with 2 node groups (general + ai)
- **RDS**: PostgreSQL 15.3 Multi-AZ
- **ALB**: Application Load Balancer for routing
- **Cost**: ~$398/month

## 🛠️ Prerequisites

1. **AWS CLI** configured with credentials:
   ```bash
   aws configure
   ```

2. **Terraform** installed (v1.0+):
   ```bash
   terraform --version
   ```

3. **kubectl** installed:
   ```bash
   kubectl version --client
   ```

4. **eksctl** installed (for Load Balancer Controller):
   ```bash
   eksctl version
   ```

5. **Helm** installed:
   ```bash
   helm version
   ```

## 📁 File Structure

```
terraform/
├── main.tf              # Module orchestration
├── variables.tf         # Input variables
├── outputs.tf          # Output values
├── providers.tf        # AWS provider config
├── backend.tf          # Terraform state backend
├── terraform.tfvars    # Your secret values (create this)
└── modules/
    ├── networking/     # VPC, subnets, security groups
    ├── eks/           # EKS cluster & node groups
    ├── rds/           # PostgreSQL database
    └── alb/           # Application Load Balancer
```

## 🔐 Setup Credentials

1. Copy the example file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. Edit `terraform.tfvars` and set secure passwords:
   ```hcl
   db_username = "jobvector_admin"
   db_password = "YourSecurePassword123!"
   ```

⚠️ **Never commit `terraform.tfvars` to git** - it's already in `.gitignore`

## 🚀 Deployment Steps

### 1. Initialize Terraform
```bash
cd terraform
terraform init
```

### 2. Review the Plan
```bash
terraform plan
```

This will show you all resources that will be created.

### 3. Apply the Configuration
```bash
terraform apply
```

Type `yes` when prompted. This will take **15-20 minutes**.

### 4. Save the Outputs
```bash
terraform output -json > infrastructure-outputs.json
```

## 📊 What Gets Created

### Networking (9 subnets)
- 3 Public subnets (ALB + NAT Gateways)
- 3 Private subnets (EKS nodes)
- 3 Database subnets (RDS)
- 3 NAT Gateways (one per AZ)
- 1 Internet Gateway
- Security groups for ALB, EKS, RDS

### EKS Cluster
- Control plane: Kubernetes 1.31
- General node group: 2× t3.medium
- AI node group: 1× t3.large (tainted for Ollama)

### RDS Database
- Engine: PostgreSQL 15.3
- Instance: db.t3.small
- Storage: 30GB gp3 encrypted
- Multi-AZ: Enabled
- Backups: 7 days retention

### Application Load Balancer
- Internet-facing
- HTTP listener (port 80)
- 2 Target groups (frontend + backend)
- Path-based routing

## 🔍 Verify Deployment

### Check AWS Resources
```bash
# VPC
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=jobvector-vpc" --region eu-west-3

# EKS Cluster
aws eks describe-cluster --name job-vector-cluster --region eu-west-3

# RDS Instance
aws rds describe-db-instances --region eu-west-3 | grep jobvector

# ALB
aws elbv2 describe-load-balancers --region eu-west-3 | grep jobvector
```

### Configure kubectl
```bash
aws eks update-kubeconfig --name job-vector-cluster --region eu-west-3
kubectl get nodes
```

You should see 3 nodes (2× t3.medium + 1× t3.large)

## 📝 Important Outputs

After `terraform apply` completes, note these values:

```bash
# ALB DNS (your application URL)
terraform output alb_dns_name

# RDS endpoint (for ConfigMap)
terraform output rds_endpoint

# EKS cluster name
terraform output eks_cluster_name
```

## 🎯 Next Steps

1. **Install AWS Load Balancer Controller**:
   ```bash
   cd ../kubernetes/aws-load-balancer-controller
   ./install.sh job-vector-cluster eu-west-3
   ```

2. **Update Kubernetes ConfigMaps** with RDS endpoint

3. **Deploy Application**:
   ```bash
   kubectl apply -f ../kubernetes/namespace/
   kubectl apply -f ../kubernetes/backend/
   kubectl apply -f ../kubernetes/frontend/
   ```

4. **Access Application**:
   ```bash
   # Get ALB DNS
   terraform output alb_dns_name
   # Open in browser: http://[alb-dns-name]
   ```

## 🧹 Cleanup (Destroy Resources)

⚠️ **WARNING**: This will delete all resources and data!

```bash
# 1. Delete Kubernetes resources first
kubectl delete all --all -n jobvector

# 2. Destroy Terraform infrastructure
terraform destroy
```

## 💰 Cost Breakdown

| Resource | Type | Quantity | Monthly Cost |
|----------|------|----------|-------------|
| EKS Control Plane | - | 1 | $73 |
| EC2 (t3.medium) | Node | 2 | $60 |
| EC2 (t3.large) | Node | 1 | $60 |
| NAT Gateway | - | 3 | $99 |
| RDS (db.t3.small) | Multi-AZ | 1 | $58 |
| ALB | - | 1 | $23 |
| Storage & Data | - | - | $25 |
| **Total** | | | **~$398/month** |

## 🔧 Customization

### Change Region
Edit `variables.tf`:
```hcl
variable "aws_region" {
  default = "eu-west-3"  # Change to your region
}
```

### Reduce Costs (Non-Production)
Edit `terraform.tfvars`:
```hcl
# Single AZ deployment
skip_final_snapshot = true
rds_multi_az = false
alb_enable_deletion_protection = false
```

### Enable HTTPS
1. Create ACM certificate in AWS
2. Edit `terraform.tfvars`:
   ```hcl
   alb_enable_https = true
   alb_certificate_arn = "arn:aws:acm:eu-west-3:ACCOUNT:certificate/ID"
   ```

## 🐛 Troubleshooting

### Issue: `terraform init` fails
```bash
rm -rf .terraform .terraform.lock.hcl
terraform init
```

### Issue: Quota errors
Check your AWS service quotas:
```bash
aws service-quotas list-service-quotas --service-code ec2 --region eu-west-3
```

### Issue: EKS nodes not showing
```bash
# Check node group status
aws eks describe-nodegroup --cluster-name job-vector-cluster \
  --nodegroup-name job-vector-nodes-general --region eu-west-3
```

### Issue: Can't connect to RDS
- Verify security group allows EKS node SG
- Check RDS is in private subnets
- Ensure Multi-AZ is working

## 📚 Additional Resources

- [AWS EKS Best Practices](https://aws.github.io/aws-eks-best-practices/)
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/)

## 🔒 Security Notes

1. **Never commit secrets** to git
2. Use **AWS Secrets Manager** for production passwords
3. Enable **CloudTrail** for audit logs
4. Use **IAM roles** instead of access keys where possible
5. Regularly **rotate credentials**
6. Enable **GuardDuty** for threat detection

## 📞 Support

If you encounter issues:
1. Check Terraform outputs: `terraform output`
2. Review CloudWatch logs
3. Check EKS cluster events: `kubectl get events -A`
4. Review RDS logs in AWS Console
