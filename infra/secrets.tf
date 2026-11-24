resource "aws_secretsmanager_secret" "app" {
  name                    = "mandi/${var.environment}/app"
  description             = "Mandi ${var.environment} runtime environment"
  recovery_window_in_days = 0
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    NODE_ENV                  = "production"
    DATABASE_URL              = "postgres://mandi_admin:${random_password.master.result}@${aws_db_instance.main.address}:5432/mandi"
    DATABASE_APP_URL          = "postgres://mandi_app:${random_password.app.result}@${aws_db_instance.main.address}:5432/mandi"
    DATABASE_SERVICE_URL      = "postgres://mandi_service:${random_password.service.result}@${aws_db_instance.main.address}:5432/mandi"
    DATABASE_APP_PASSWORD     = random_password.app.result
    DATABASE_SERVICE_PASSWORD = random_password.service.result
    SESSION_SECRET            = random_password.session.result

    COGNITO_REGION        = var.region
    COGNITO_USER_POOL_ID  = aws_cognito_user_pool.main.id
    COGNITO_CLIENT_ID     = aws_cognito_user_pool_client.web.id
    COGNITO_CLIENT_SECRET = aws_cognito_user_pool_client.web.client_secret
    COGNITO_DOMAIN        = "${aws_cognito_user_pool_domain.main.domain}.auth.${var.region}.amazoncognito.com"

    APP_URL    = "https://${var.app_domain}"
    APP_DOMAIN = var.app_domain
    AWS_REGION = var.region
    S3_BUCKET  = aws_s3_bucket.media.bucket

    RESEND_API_KEY = ""
    RESEND_FROM    = ""
  })
}
