
output "db_endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.default.endpoint
}

output "db_port" {
  description = "The port of the RDS instance"
  value       = aws_db_instance.default.port
}

output "db_username" {
  description = "The master username for the RDS instance"
  value       = aws_db_instance.default.username
  sensitive   = true
}

output "db_name" {
  description = "The name of the database"
  value       = aws_db_instance.default.db_name
}