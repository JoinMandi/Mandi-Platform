variable "region" {
  type    = string
  default = "af-south-1"
}

variable "environment" {
  type    = string
  default = "staging"
}

variable "app_domain" {
  type        = string
  description = "Public hostname Caddy serves, e.g. staging.joinmandi.co.za"
}

variable "alert_email" {
  type        = string
  description = "Email for budget and CloudWatch alarm notifications"
  default     = "info@joinmandi.com"
}

variable "budget_limit_usd" {
  type    = number
  default = 50
}

variable "instance_type" {
  type    = string
  default = "t4g.small"
}

variable "db_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "github_repo" {
  type        = string
  description = "owner/repo allowed to assume the deploy role"
  default     = "devbusi/Mandi-Platform"
}

variable "admin_cidrs" {
  type        = list(string)
  description = "Optional extra CIDRs allowed to reach the instance directly"
  default     = []
}
