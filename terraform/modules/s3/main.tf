resource "aws_s3_bucket" "cv_upload_bucket" {
  bucket = var.bucket_name

  tags = merge(
    var.tags,
    {
      Name        = var.bucket_name
      Environment = var.environment
    }
  )
}


resource "aws_s3_bucket_versioning" "cv_upload_bucket" {
  bucket = aws_s3_bucket.cv_upload_bucket.id

  versioning_configuration {
    status = var.versioning ? "Enabled" : "Disabled"
  }
}

# Block public access - modern S3 best practice
resource "aws_s3_bucket_public_access_block" "cv_upload_bucket" {
  bucket = aws_s3_bucket.cv_upload_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}