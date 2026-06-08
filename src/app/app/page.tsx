import { redirect } from "next/navigation";

import { getDefaultAppRoute } from "@/lib/auth/access-rules";
import { requireCurrentUserAccess } from "@/lib/auth/current-user-access";

export default async function AppIndexPage() {
  const access = await requireCurrentUserAccess();

  redirect(getDefaultAppRoute(access));
}
