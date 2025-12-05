output "nginx_public_ip" {
  description = "Public IP of Nginx reverse proxy"
  value       = aws_eip.nginx.public_ip
}

output "nginx_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.nginx.id
}

output "nginx_security_group_id" {
  description = "Security group ID of Nginx instance"
  value       = aws_security_group.nginx.id
}

output "ssh_command" {
  description = "SSH command to connect to Nginx instance"
  value       = "ssh -i ~/.ssh/${var.project_name}-nginx-key ec2-user@${aws_eip.nginx.public_ip}"
}

output "public_url" {
  description = "Public URL to access the application"
  value       = "http://${aws_eip.nginx.public_ip}"
}
