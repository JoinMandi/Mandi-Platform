resource "aws_cognito_user_pool" "main" {
  name = "mandi-${var.environment}"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]
  mfa_configuration        = "ON"

  software_token_mfa_configuration {
    enabled = true
  }

  password_policy {
    minimum_length    = 12
    require_lowercase = true
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  admin_create_user_config {
    # Members self-register; staff are created by a superadmin through the app.
    allow_admin_create_user_only = false
  }

  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name         = "mandi-${var.environment}-web"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = true

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["openid", "email", "profile"]
  supported_identity_providers         = ["COGNITO"]

  callback_urls = ["https://${var.app_domain}/auth/callback"]
  logout_urls   = ["https://${var.app_domain}/auth/logged-out"]

  prevent_user_existence_errors = "ENABLED"
  enable_token_revocation       = true
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "mandi-${var.environment}-${random_id.suffix.hex}"
  user_pool_id = aws_cognito_user_pool.main.id
}

resource "aws_cognito_user_group" "roles" {
  for_each = toset(["member", "clinician", "admin", "superadmin"])

  name         = each.value
  user_pool_id = aws_cognito_user_pool.main.id
  description  = "Mandi ${each.value} group"
}
