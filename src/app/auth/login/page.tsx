import { redirect } from "next/navigation";

/** Entry point: hands off to the Cognito hosted UI. */
export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  const query = new URLSearchParams();
  if (searchParams.next) query.set("next", searchParams.next);
  const suffix = query.toString();
  redirect(`/auth/sso/login${suffix ? `?${suffix}` : ""}`);
}
