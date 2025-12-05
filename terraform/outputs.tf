# VPC Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.networking.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.networking.private_subnet_ids
}

output "db_subnet_ids" {
  description = "Database subnet IDs"
  value       = module.networking.db_subnet_ids
}

output "nat_gateway_ips" {
  description = "NAT Gateway public IPs"
  value       = module.networking.nat_gateway_ips
}

# EKS Outputs
output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "eks_cluster_id" {
  description = "EKS cluster ID"
  value       = module.eks.cluster_id
}

output "eks_cluster_certificate_authority" {
  description = "EKS cluster certificate authority data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "general_node_group_id" {
  description = "General node group ID"
  value       = module.eks.general_node_group_id
}

output "ebs_csi_driver_role_arn" {
  description = "ARN of the EBS CSI driver IAM role"
  value       = module.eks.ebs_csi_driver_role_arn
}

output "oidc_provider_arn" {
  description = "ARN of the OIDC provider"
  value       = module.eks.oidc_provider_arn
}

output "eks_cluster_security_group_id" {
  description = "Security group ID of the EKS cluster"
  value       = module.eks.cluster_security_group_id
}

# RDS Outputs
output "rds_endpoint" {
  description = "RDS endpoint for database connection"
  value       = module.rds.endpoint
}

output "rds_address" {
  description = "RDS address"
  value       = module.rds.address
}

output "rds_port" {
  description = "RDS port"
  value       = module.rds.port
}

output "rds_db_name" {
  description = "RDS database name"
  value       = module.rds.db_name
}

# Nginx Proxy Outputs
output "nginx_public_ip" {
  description = "Public IP of Nginx reverse proxy"
  value       = module.nginx_proxy.nginx_public_ip
}

output "nginx_instance_id" {
  description = "EC2 instance ID of Nginx proxy"
  value       = module.nginx_proxy.nginx_instance_id
}

output "public_url" {
  description = "Public URL to access the application"
  value       = module.nginx_proxy.public_url
}

output "ssh_command" {
  description = "SSH command to connect to Nginx instance"
  value       = module.nginx_proxy.ssh_command
}

# Quick Start Guide
output "next_steps" {
  description = "Next steps after infrastructure is created"
  value       = <<-EOT
  
  ✅ Infrastructure Created Successfully!
  
  📋 Next Steps:
  
  1. Configure kubectl for EKS:
     aws eks update-kubeconfig --name ${module.eks.cluster_name} --region ${var.aws_region}
  
  2. Verify cluster access:
     kubectl get nodes
  
  3. Update Kubernetes ConfigMaps with RDS endpoint:
     RDS_ENDPOINT: ${module.rds.endpoint}
  
  4. Deploy your application:
     kubectl apply -f kubernetes/namespace/
     kubectl apply -f kubernetes/backend/
     kubectl apply -f kubernetes/frontend/
     kubectl apply -f kubernetes/embedding-service/
     kubectl apply -f kubernetes/ollama/
  
  5. Access your application via LoadBalancer service:
     kubectl get svc -n jobvector frontend
  
  📊 Resources Created:
  - VPC: ${module.networking.vpc_id}
  - EKS Cluster: ${module.eks.cluster_name} (3× m7i-flex.large nodes)
  - RDS Database: ${module.rds.endpoint} (db.t4g.micro)
  
  EOT
}
