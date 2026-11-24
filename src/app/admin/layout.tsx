import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { getSessionUser } from "@/server/auth";

export const metadata = {
  title: "Mandi Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login?next=/admin");
  if (user.role !== "admin" && user.role !== "superadmin") {
    redirect("/?denied=admin");
  }
  if (!user.mfa) {
    redirect("/auth/sso/login?next=/admin");
  }
  return <AdminShell>{children}</AdminShell>;
}
