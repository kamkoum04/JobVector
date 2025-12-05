variable "cluster_name" {
  description = "The name of the EKS cluster"
  type        = string
  default     = "job-vector-cluster"
}

variable "cluster_version" {
  description = "Kubernetes version to use for the EKS cluster"
  type        = string
  default     = "1.31"
}

variable "node_group_name" {
  description = "The name of the EKS node group"
  type        = string
  default     = "job-vector-nodes"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "region" {
  description = "The AWS region to deploy the resources"
  type        = string
  default     = "eu-west-3"
}

variable "vpc_id" {
  description = "The VPC ID where the EKS cluster will be deployed"
  type        = string
}

variable "cluster_subnet_ids" {
  description = "The subnet IDs for the EKS cluster control plane (public + private)"
  type        = list(string)
}

variable "node_subnet_ids" {
  description = "The subnet IDs for the EKS node groups (private only)"
  type        = list(string)
}

variable "cluster_security_group_ids" {
  description = "Additional security group IDs for the EKS cluster control plane"
  type        = list(string)
  default     = []
}