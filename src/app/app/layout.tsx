import { Sidebar } from "@/components/app/Sidebar";
import { UserPreferenceApplier } from "@/components/app/user-preference-applier";
import { requireCurrentUserAccess } from "@/lib/auth/current-user-access";
import { getUnreadNotificationCount } from "@/lib/notifications/data";
import { getUserSettings } from "@/lib/user-settings/data";

export default async function PrivateAppLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 const access = await requireCurrentUserAccess();
 const [settings, unreadNotifications] = await Promise.all([
 getUserSettings(access.userId),
 getUnreadNotificationCount(access.userId),
 ]);

 return (
 <Sidebar
 access={access}
 unreadNotifications={unreadNotifications}
 >
 <UserPreferenceApplier settings={settings} />
 {children}
 </Sidebar>
 );
}
