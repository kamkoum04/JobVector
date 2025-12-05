variable "project_name" {
  description = "Project name for resource naming"
  type        = string
}

variable "environment" {
  description = "Environment (dev, staging, production)"
  type        = string
  default     = "production"
}

variable "vpc_id" {
  description = "VPC ID where Nginx will be deployed"
  type        = string
}

variable "subnet_id" {
  description = "Public subnet ID for Nginx EC2"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
}

variable "ssh_allowed_cidrs" {
  description = "CIDR blocks allowed to SSH into Nginx instance"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "eks_cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "frontend_nodeport" {
  description = "NodePort for frontend service"
  type        = number
  default     = 30080
}

variable "backend_nodeport" {
  description = "NodePort for backend service"
  type        = number
  default     = 30081
}

variable "eks_node_ips" {
  description = "List of EKS node private IPs for upstream configuration"
  type        = list(string)
}
