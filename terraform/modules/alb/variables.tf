variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "jobvector"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "vpc_id" {
  description = "VPC ID where ALB will be created"
  type        = string
}

variable "public_subnet_ids" {
  description = "Public subnet IDs for ALB (should span multiple AZs)"
  type        = list(string)
}

variable "alb_security_group_id" {
  description = "Security group ID for ALB from networking module"
  type        = string
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for ALB"
  type        = bool
  default     = true
}

variable "enable_https" {
  description = "Enable HTTPS listener (requires certificate_arn)"
  type        = bool
  default     = false
}

variable "certificate_arn" {
  description = "ARN of ACM certificate for HTTPS (required if enable_https = true)"
  type        = string
  default     = ""
}
