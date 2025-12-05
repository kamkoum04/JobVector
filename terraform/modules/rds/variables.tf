variable "db_identifier" {
  description = "The identifier for the RDS instance (max 63 chars)"
  type        = string
  default     = "jobvector-db"
}

variable "db_name" {
  description = "The name of the database to create (max 63 chars for PostgreSQL)"
  type        = string
  default     = "jobvector"
}

variable "db_username" {
  description = "The username for the database"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "The password for the database"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "The instance class for the RDS instance"
  type        = string
  default     = "db.t4g.micro"
}

variable "db_allocated_storage" {
  description = "The allocated storage for the RDS instance in gigabytes"
  type        = number
  default     = 30
}

variable "db_engine" {
  description = "The database engine to use"
  type        = string
  default     = "postgres"
}

variable "db_engine_version" {
  description = "The version of the database engine"
  type        = string
  default     = "15.10"
}

variable "db_subnet_ids" {
  description = "The subnet IDs for the DB subnet group (should be database subnets)"
  type        = list(string)
}

variable "rds_security_group_id" {
  description = "The security group ID from networking module for RDS"
  type        = string
}

variable "multi_az" {
  description = "Specifies if the DB instance is a Multi-AZ deployment"
  type        = bool
  default     = false
}

variable "backup_retention_period" {
  description = "The number of days to retain backups"
  type        = number
  default     = 0
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when destroying (true for dev/test, false for production)"
  type        = bool
  default     = false
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}