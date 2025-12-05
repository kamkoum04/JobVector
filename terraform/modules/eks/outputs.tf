output "cluster_name" {
  description = "The name of the EKS cluster"
  value       = aws_eks_cluster.this.name
}

output "cluster_id" {
  description = "The ID of the EKS cluster"
  value       = aws_eks_cluster.this.id
}

output "cluster_endpoint" {
  description = "The endpoint for the EKS cluster"
  value       = aws_eks_cluster.this.endpoint
}

output "cluster_certificate_authority_data" {
  description = "The certificate authority data for the EKS cluster"
  value       = aws_eks_cluster.this.certificate_authority[0].data
  sensitive   = true
}

output "cluster_security_group_id" {
  description = "The security group ID of the EKS cluster"
  value       = aws_eks_cluster.this.vpc_config[0].cluster_security_group_id
}

output "cluster_version" {
  description = "The Kubernetes version of the EKS cluster"
  value       = aws_eks_cluster.this.version
}

output "general_node_group_id" {
  description = "The ID of the general EKS node group"
  value       = aws_eks_node_group.general.id
}

output "general_node_group_arn" {
  description = "The ARN of the general EKS node group"
  value       = aws_eks_node_group.general.arn
}

output "general_node_group_status" {
  description = "The status of the general EKS node group"
  value       = aws_eks_node_group.general.status
}

output "cluster_iam_role_arn" {
  description = "The ARN of the EKS cluster IAM role"
  value       = aws_iam_role.eks_cluster_role.arn
}

output "node_group_iam_role_arn" {
  description = "The ARN of the EKS node group IAM role"
  value       = aws_iam_role.eks_node_group_role.arn
}

output "oidc_provider_arn" {
  description = "The ARN of the OIDC provider for EKS"
  value       = aws_iam_openid_connect_provider.eks.arn
}

output "oidc_provider_url" {
  description = "The URL of the OIDC provider for EKS"
  value       = aws_iam_openid_connect_provider.eks.url
}

output "ebs_csi_driver_role_arn" {
  description = "The ARN of the EBS CSI driver IAM role"
  value       = aws_iam_role.ebs_csi_driver.arn
}
