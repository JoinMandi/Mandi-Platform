output "app_url" {
  value = "https://${var.app_domain}"
}

output "elastic_ip" {
  value = aws_eip.app.public_ip
}

output "dns_record" {
  value = "Create an A record: ${var.app_domain} -> ${aws_eip.app.public_ip}"
}

output "ecr_repository_url" {
  value = aws_ecr_repository.app.repository_url
}

output "instance_id" {
  value = aws_instance.app.id
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.main.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.web.id
}

output "cognito_domain" {
  value = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.region}.amazoncognito.com"
}

output "database_endpoint" {
  value = aws_db_instance.main.address
}

output "secret_arn" {
  value = aws_secretsmanager_secret.app.arn
}

output "deploy_role_arn" {
  value = aws_iam_role.deploy.arn
}

output "alert_topic_arn" {
  value = aws_sns_topic.alerts.arn
}
