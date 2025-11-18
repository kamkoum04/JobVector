# terraform {
#   backend "s3" {
#     bucket = "job-vector-state-bucket"
#     key    = "path/to/my/terraform.tfstate"
#     region = "us-east-1"
#     encrypt = true
#   }
# }