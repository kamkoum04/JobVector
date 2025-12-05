# Networking Module - VPC, Subnets, NAT, IGW, Security Groups
module "networking" {
  source = "./modules/networking"

  project_name         = var.project_name
  vpc_cidr             = var.vpc_cidr
  availabilty_zones    = var.availability_zones
  public_subnet_cidr   = var.public_subnet_cidrs
  private_subnet_cidr  = var.private_subnet_cidrs
  db_subnet_cidr       = var.db_subnet_cidrs
  public_subnet_count  = var.public_subnet_count
  private_subnet_count = var.private_subnet_count
}

# EKS Module - Kubernetes Cluster with 2 Node Groups
module "eks" {
  source = "./modules/eks"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version
  environment     = var.environment
  region          = var.aws_region

  vpc_id = module.networking.vpc_id
  cluster_subnet_ids = concat(
    module.networking.public_subnet_ids,
    module.networking.private_subnet_ids
  )
  node_subnet_ids            = module.networking.private_subnet_ids
  cluster_security_group_ids = [module.networking.eks_node_security_group_id]

  node_group_name = var.node_group_name

  depends_on = [module.networking]
}

# RDS Module - PostgreSQL Multi-AZ Database
module "rds" {
  source = "./modules/rds"

  db_identifier        = var.db_identifier
  db_name              = var.db_name
  db_username          = var.db_username
  db_password          = var.db_password
  db_instance_class    = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_engine            = var.db_engine
  db_engine_version    = var.db_engine_version

  db_subnet_ids         = module.networking.db_subnet_ids
  rds_security_group_id = module.networking.rds_security_group_id

  multi_az                = var.rds_multi_az
  backup_retention_period = var.backup_retention_period
  skip_final_snapshot     = var.skip_final_snapshot
  environment             = var.environment

  depends_on = [module.networking]
}

# ============================================================================
# Cross-Module Security Group Rules
# ============================================================================
# These rules require resources from multiple modules, so they must be
# defined at the root level to avoid circular dependencies.

# Allow EKS cluster pods to access RDS database
resource "aws_security_group_rule" "rds_from_eks_cluster" {
  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = module.networking.rds_security_group_id
  source_security_group_id = module.eks.cluster_security_group_id
  description              = "PostgreSQL from EKS cluster security group"

  depends_on = [module.networking, module.eks]
}

# Allow Nginx to access frontend NodePort on EKS cluster security group
resource "aws_security_group_rule" "frontend_nodeport_from_nginx_cluster" {
  type                     = "ingress"
  from_port                = 30080
  to_port                  = 30080
  protocol                 = "tcp"
  security_group_id        = module.eks.cluster_security_group_id
  source_security_group_id = module.nginx_proxy.nginx_security_group_id
  description              = "Allow Nginx to access frontend NodePort"

  depends_on = [module.eks, module.nginx_proxy]
}

# Allow Nginx to access backend NodePort on EKS cluster security group
resource "aws_security_group_rule" "backend_nodeport_from_nginx_cluster" {
  type                     = "ingress"
  from_port                = 30081
  to_port                  = 30081
  protocol                 = "tcp"
  security_group_id        = module.eks.cluster_security_group_id
  source_security_group_id = module.nginx_proxy.nginx_security_group_id
  description              = "Allow Nginx to access backend NodePort"

  depends_on = [module.eks, module.nginx_proxy]
}

# Allow Nginx to access frontend NodePort on EKS node security group
resource "aws_security_group_rule" "frontend_nodeport_from_nginx_node" {
  type                     = "ingress"
  from_port                = 30080
  to_port                  = 30080
  protocol                 = "tcp"
  security_group_id        = module.networking.eks_node_security_group_id
  source_security_group_id = module.nginx_proxy.nginx_security_group_id
  description              = "Allow Nginx to access frontend NodePort"

  depends_on = [module.networking, module.nginx_proxy]
}

# Allow Nginx to access backend NodePort on EKS node security group
resource "aws_security_group_rule" "backend_nodeport_from_nginx_node" {
  type                     = "ingress"
  from_port                = 30081
  to_port                  = 30081
  protocol                 = "tcp"
  security_group_id        = module.networking.eks_node_security_group_id
  source_security_group_id = module.nginx_proxy.nginx_security_group_id
  description              = "Allow Nginx to access backend NodePort"

  depends_on = [module.networking, module.nginx_proxy]
}

# ============================================================================
# Nginx Reverse Proxy Module
# ============================================================================
# EC2 instance with Nginx to proxy frontend and backend services from EKS

module "nginx_proxy" {
  source = "./modules/nginx-proxy"

  project_name     = var.project_name
  environment      = var.environment
  vpc_id           = module.networking.vpc_id
  subnet_id        = module.networking.public_subnet_ids[0]  # eu-west-3a
  instance_type    = "t3.micro"
  eks_cluster_name = module.eks.cluster_name
  
  # SSH key for EC2 access (generated locally)
  ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCcLTCiMRpBZXuzoWo38K6g0l7pROf+rwRin00EtfELNu8i4Ua/jZfRgwCyaGBOB8pG0KGVFeLUGmQGICtWqyIEAPsEMW5n2PaH2RdDDviMR5QPscF2KmDVoTJ81b2vTHEoZrAl1Qr+tK60+1ov00Ca5mmVfDOMSDzUa3afmw82p11Pnuie3YlyyX87ZC8CJCnhtSDnkHayAPPQd7COqmQNKSgFAROx2GTieLRZYTFLURrguT8j0kVGosZqJQ3vqGGwZqEslA4sI59a39d6AmsaZ/1ScOz0o/dtjh60xbJOELAsVtiaYh9gi6WXwFXiIWJKwmtf+8D9j1ipKgcVKsk2NxL81k9qRNPzbO2jOTPuEBzG5bxXETgQJftjL8Vj9agi63ROabfthvxvDVGWI4tTOiVIsrtGta1mkiGEDuXRYW9rKKg9yPY/a+N2K1uWgk1CIaSk4CSLQBvf1MdFrG1YnoP3j939lvWhCSNmQWNb8KmIlcZqEHjpWyjH/sRoLGfQ7g/MYGKF/ju8l+OdkzfesGdicz0paUrfIHBPd9Fck4x3L4bCdjzVYpgEWNUItFSS0ID9APuPy36mo575G76sZY+ucKDnKsNk9AkRVy1zEBICXmsk9515xODOTlrHhbSRbHcH0U84GpvsNtOspHjifaS+OaG+ULvhK5m1cz9Yaw== jobvector-nginx-proxy"
  
  # Allow SSH from anywhere (restrict this in production)
  ssh_allowed_cidrs = ["0.0.0.0/0"]
  
  # NodePort configuration for services
  frontend_nodeport = 30080
  backend_nodeport  = 30081
  
  # EKS node private IPs for upstream configuration
  eks_node_ips = [
    "10.0.10.97",
    "10.0.11.147",
    "10.0.12.231"
  ]

  depends_on = [module.eks, module.networking]
}
