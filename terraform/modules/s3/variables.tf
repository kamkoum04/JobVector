variable "bucket_name" {
    description = "The name of the S3 bucket."
    type        = string
  
}

variable "environment" {
    description = "The environment for the S3 bucket (e.g., dev, prod)."
    type        = string
  
}

variable "acl" {
    description = "The canned ACL to apply to the S3 bucket."
    type        = string
    default     = "private"
  
}

variable "versioning" {
  description = "Enable versioning for the S3 bucket"
  type        = bool
  default     = false
}

variable "tags" {
  description = "A map of tags to assign to the S3 bucket"
  type        = map(string)
  default     = {}
}