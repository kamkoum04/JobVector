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

resource "aws_s3_bucket_acl" "cv_upload_bucket" {
  bucket = aws_s3_bucket.cv_upload_bucket.id
  acl    = var.acl
}