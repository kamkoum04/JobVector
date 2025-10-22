resource "aws_eks_cluster" "this" {
    name = var.cluster_name
    role_arn = aws_iam_role.eks_cluster_role.arn
    vpc_config {
        subnet_ids = var.subnet_ids
    }
    depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
  
}



resource "aws_eks_node_group" "this" {
    cluster_name = aws_eks_cluster.this.name
    node_group_name = var.node_group_name
    node_role_arn = aws_iam_role.eks_node_role.arn
    subnet_ids = var.subnet_ids
    instance_types = [var.node_instance_type]

    scaling_config {
      desired_size = coalesce(var.desired_capacity, var.desired_size)
        max_size     = var.max_size
        min_size     = var.min_size
    }
     depends_on = [
    aws_eks_cluster.this,
    aws_iam_role_policy_attachment.eks_node_group_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_registry_policy
  ]
    



  
}