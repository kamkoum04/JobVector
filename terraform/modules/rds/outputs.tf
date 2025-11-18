output "endpoint" {
  description = "The connection endpoint for the RDS instance"
  value       = aws_db_instance.jobvector_db.endpoint
}

output "address" {
  description = "The address of the RDS instance"
  value       = aws_db_instance.jobvector_db.address
}

output "port" {
  description = "The port of the RDS instance"
  value       = aws_db_instance.jobvector_db.port
}

output "db_name" {
  description = "The name of the database"
  value       = aws_db_instance.jobvector_db.db_name
}