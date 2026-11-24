resource "random_password" "master" {
  length  = 32
  special = false
}

resource "random_password" "app" {
  length  = 32
  special = false
}

resource "random_password" "service" {
  length  = 32
  special = false
}

resource "random_password" "session" {
  length  = 48
  special = false
}

resource "aws_db_subnet_group" "main" {
  name       = "mandi-${var.environment}"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_db_instance" "main" {
  identifier             = "mandi-${var.environment}"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = var.db_instance_class
  allocated_storage      = 20
  max_allocated_storage  = 50
  storage_type           = "gp3"
  storage_encrypted      = true
  db_name                = "mandi"
  username               = "mandi_admin"
  password               = random_password.master.result
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false

  backup_retention_period = 14
  backup_window           = "02:00-03:00"
  maintenance_window      = "sun:03:00-sun:04:00"
  copy_tags_to_snapshot   = true

  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "mandi-${var.environment}-final"

  auto_minor_version_upgrade   = true
  apply_immediately            = false
  performance_insights_enabled = false
}
