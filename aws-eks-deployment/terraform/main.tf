module "networking" {
  source = "./modules/networking"
  
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  public_subnet_count  = var.public_subnet_count
  private_subnet_count = var.private_subnet_count
  project_name         = var.project_name
}

module "eks" {
  source = "./modules/eks"
  
  cluster_name       = var.cluster_name
  node_group_name    = var.node_group_name
  vpc_id             = module.networking.vpc_id
  subnet_ids         = module.networking.private_subnet_ids
  node_instance_type = var.node_instance_type
  desired_capacity   = var.desired_capacity
  desired_size       = var.desired_size
  max_size           = var.max_size
  min_size           = var.min_size
}

module "rds" {
  source = "./modules/rds"
  
  db_name                = var.db_name
  db_username            = var.db_username
  db_password            = var.db_password
  db_instance_class      = var.db_instance_class
  vpc_security_group_ids = [module.eks.cluster_security_group_id]
  subnet_ids             = module.networking.private_subnet_ids
}

module "s3" {
  source = "./modules/s3"
  
  bucket_name = var.bucket_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "s3_bucket_name" {
  value = module.s3.bucket_name
}