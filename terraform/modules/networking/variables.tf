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
    default     = 2
  
}

variable "private_subnet_count" {
    description = "Number of private subnets to create."
    type        = number
    default     = 2
  
}

variable "public_subnet_cidr" {
    description = "The CIDR block for public subnets."
    type        = List(string)
    default     = ["10.0.1.0/24","10.0.2.0/24"]


}

variable "private_subnet_cidr" {
    description = "The CIDR block for private subnets."
    type        = List(string)
    default     = ["10.0.3.0/24","10.0.4.0/24"]
}

variable "availabilty_zones" {
    description = "List of availability zones to use."
    type        = List(string)
    default     = ["us-east-1a", "us-east-1b"]
  
}


variable "enable_nat_gatway" {
    description = "Enable NAT Gateway for private subnets."
    type        = bool
    default     = true
  

}

variable "tags" {
    description = "A map of tags to assign to resources."
    type        = map(string)
    default     = {
        Environment = "dev"
        Project     = "Job-vector-network"
    }
  
}