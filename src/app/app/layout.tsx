import { Sidebar } from "@/components/app/Sidebar";
import { getAppUserProfile } from "@/components/app/session-profile";
import { requireUserContext } from "@/lib/auth/session";

export default async function PrivateAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile: databaseProfile, user } = await requireUserContext();
  const profile = getAppUserProfile(user, databaseProfile);

  return (
    <Sidebar
      displayName={profile.displayName}
      email={profile.email}
      initials={profile.initials}
      role={profile.role}
      roleLabel={profile.roleLabel}
    >
      {children}
    </Sidebar>
  );
}
