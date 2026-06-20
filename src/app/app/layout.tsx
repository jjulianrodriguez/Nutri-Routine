import { Sidebar } from "@/components/app/Sidebar";
import { requireCurrentUserAccess } from "@/lib/auth/current-user-access";
import { getUnreadNotificationCount } from "@/lib/notifications/data";

export default async function PrivateAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const access = await requireCurrentUserAccess();
  const unreadNotifications = await getUnreadNotificationCount(access.userId);

  return (
    <Sidebar
      access={access}
      unreadNotifications={unreadNotifications}
    >
      {children}
    </Sidebar>
  );
}
