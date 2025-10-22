resource "aws_db_instance" "jobvector_db" {
    identifier = var.db_name
    engine= var.db_engine
    engine_version = var.db_engine_version
    instance_class = var.db_instance_class
    allocated_storage = var.db_allocated_storage
    db_name = var.db_name
    username = var.db_username
    password = var.db_password
    vpc_security_group_ids = var.vpc_security_group_ids
    db_subnet_group_name    = aws_db_subnet_group.default.name
    multi_az = var.multi_az
    skip_final_snapshot = true
    tags = {
        Name = var.db_name
    }


  
}


resource "aws_db_subnet_group" "default" {
    name       = "${var.db_name}-subnet-group"
    subnet_ids = var.subnet_ids

    tags = {
        Name = "${var.db_name}-subnet-group"
    }
}