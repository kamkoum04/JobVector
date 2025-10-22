terraform {
  backend "s3" {
    bucket = "job-vector-terraform-state"
    key = "job-vector/terraform.tfstate"
    region = "eu-west-3"
    encrypt = true
    use_lockfile = true
    
  }
}