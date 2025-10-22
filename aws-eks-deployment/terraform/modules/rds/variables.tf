variable "db_instance_class" {
  description = "The instance class for the RDS instance."
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "The name of the database to create."
  type        = string
  default     = "mydatabase"
}

variable "db_username" {
  description = "The username for the database."
  type        = string
}

variable "db_password" {
  description = "The password for the database."
  type        = string
  sensitive   = true
}

variable "db_allocated_storage" {
  description = "The allocated storage for the RDS instance in gigabytes."
  type        = number
  default     = 20
}

variable "db_engine" {
  description = "The database engine to use."
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "The version of the database engine."
  type        = string
  default     = "15"
}

variable "vpc_security_group_ids" {
  description = "The VPC security group IDs to associate with the RDS instance."
  type        = list(string)
}

variable "subnet_ids" {
  description = "The subnet IDs for the DB subnet group."
  type        = list(string)
}

variable "db_subnet_group_name" {
  description = "The name of the DB subnet group."
  type        = string
  default     = ""
}

variable "multi_az" {
  description = "Specifies if the DB instance is a Multi-AZ deployment."
  type        = bool
  default     = false
}