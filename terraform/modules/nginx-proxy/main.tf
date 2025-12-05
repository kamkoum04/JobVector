# Data source to get latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# SSH Key Pair for EC2 access
resource "aws_key_pair" "nginx_key" {
  key_name   = "${var.project_name}-nginx-key"
  public_key = var.ssh_public_key

  tags = {
    Name        = "${var.project_name}-nginx-key"
    Environment = var.environment
  }
}

# Security Group for Nginx EC2
resource "aws_security_group" "nginx" {
  name        = "${var.project_name}-nginx-sg"
  description = "Security group for Nginx reverse proxy"
  vpc_id      = var.vpc_id

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from internet"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from internet"
  }

  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidrs
    description = "SSH access"
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound"
  }

  tags = {
    Name        = "${var.project_name}-nginx-sg"
    Environment = var.environment
  }
}

# IAM Role for EC2 (to access EKS if needed)
resource "aws_iam_role" "nginx_ec2_role" {
  name = "${var.project_name}-nginx-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-nginx-ec2-role"
    Environment = var.environment
  }
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "nginx_profile" {
  name = "${var.project_name}-nginx-profile"
  role = aws_iam_role.nginx_ec2_role.name

  tags = {
    Name        = "${var.project_name}-nginx-profile"
    Environment = var.environment
  }
}

# Attach SSM policy for Systems Manager access
resource "aws_iam_role_policy_attachment" "nginx_ssm" {
  role       = aws_iam_role.nginx_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Attach EKS read-only policy for kubectl configuration
resource "aws_iam_role_policy_attachment" "nginx_eks_readonly" {
  role       = aws_iam_role.nginx_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# Custom policy to allow EKS DescribeCluster
resource "aws_iam_role_policy" "nginx_eks_describe" {
  name = "${var.project_name}-nginx-eks-describe"
  role = aws_iam_role.nginx_ec2_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "eks:DescribeCluster",
          "eks:ListClusters"
        ]
        Resource = "*"
      }
    ]
  })
}

# Elastic IP
resource "aws_eip" "nginx" {
  domain = "vpc"

  tags = {
    Name        = "${var.project_name}-nginx-eip"
    Environment = var.environment
  }
}

# EC2 Instance
resource "aws_instance" "nginx" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.nginx.id]
  key_name               = aws_key_pair.nginx_key.key_name
  iam_instance_profile   = aws_iam_instance_profile.nginx_profile.name

  user_data = templatefile("${path.module}/user-data.sh", {
    eks_cluster_name    = var.eks_cluster_name
    frontend_nodeport   = var.frontend_nodeport
    backend_nodeport    = var.backend_nodeport
    eks_node_ips        = var.eks_node_ips
  })

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
  }

  tags = {
    Name        = "${var.project_name}-nginx-proxy"
    Environment = var.environment
    Role        = "reverse-proxy"
  }

  lifecycle {
    ignore_changes = [user_data]
  }
}

# Associate Elastic IP with EC2
resource "aws_eip_association" "nginx" {
  instance_id   = aws_instance.nginx.id
  allocation_id = aws_eip.nginx.id
}
