variable "vpc_cidr" {
  description = "The CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"

}

variable "project_name" {
  description = "The name of the project."
  type        = string
  default     = "Job-vector"

}

variable "public_subnet_count" {
  description = "Number of public subnets to create."
  type        = number
  default     = 3

}

variable "private_subnet_count" {
  description = "Number of private subnets to create."
  type        = number
  default     = 3

}

variable "public_subnet_cidr" {
  description = "The CIDR block for public subnets."
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]


}

variable "private_subnet_cidr" {
  description = "The CIDR block for private subnets."
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

variable "db_subnet_cidr" {
  description = "The CIDR block for database subnets."
  type        = list(string)
  default     = ["10.0.20.0/24", "10.0.21.0/24", "10.0.22.0/24"]

}

variable "availabilty_zones" {
  description = "List of availability zones to use."
  type        = list(string)
  default     = ["eu-west-3a", "eu-west-3b", "eu-west-3c"]
}


variable "enable_nat_gatway" {
  description = "Enable NAT Gateway for private subnets."
  type        = bool
  default     = true


}

variable "tags" {
  description = "A map of tags to assign to resources."
  type        = map(string)
  default = {
    Environment = "dev"
    Project     = "Job-vector-network"
  }

}
variable "eks_cluster_security_group_id" {
  description = "The security group ID of the EKS cluster (for RDS access)"
  type        = string
  default     = ""
}
