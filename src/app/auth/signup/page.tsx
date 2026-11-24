import { redirect } from "next/navigation";

/** Sign-up is handled by the Cognito hosted UI. */
export default function SignupPage() {
  redirect("/auth/sso/login?signup=1&next=/my-journey");
}
