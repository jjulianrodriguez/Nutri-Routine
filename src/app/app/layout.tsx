import { Sidebar } from "@/components/app/Sidebar";
import { requireCurrentUserAccess } from "@/lib/auth/current-user-access";

export default async function PrivateAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await requireCurrentUserAccess();

  return (
    <Sidebar access={access}>
      {children}
    </Sidebar>
  );
}
