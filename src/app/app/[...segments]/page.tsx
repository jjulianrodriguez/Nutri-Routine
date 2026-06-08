import { redirect } from "next/navigation";

import {
  getAppRouteKind,
  getAppRoutePath,
  getDefaultAppRoute,
} from "@/lib/auth/access-rules";
import {
  requireCurrentUserAccess,
  requireRouteAccess,
} from "@/lib/auth/current-user-access";

type GuardedAliasPageProps = {
  params: Promise<{
    segments?: string[];
  }>;
};

export default async function GuardedAliasPage({
  params,
}: GuardedAliasPageProps) {
  const { segments = [] } = await params;
  const pathname = `/app/${segments.join("/")}`;
  const route = getAppRouteKind(pathname);

  if (!route) {
    const access = await requireCurrentUserAccess();

    redirect(getDefaultAppRoute(access));
  }

  await requireRouteAccess(pathname);
  redirect(getAppRoutePath(route));
}
