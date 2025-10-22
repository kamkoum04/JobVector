output "bucket_name" {
  description = "The name of the S3 bucket"
  value       = aws_s3_bucket.cv_upload_bucket.bucket
}

output "bucket_arn" {
  description = "The ARN of the S3 bucket"
  value       = aws_s3_bucket.cv_upload_bucket.arn
}

output "bucket_id" {
  description = "The ID of the S3 bucket"
  value       = aws_s3_bucket.cv_upload_bucket.id
}