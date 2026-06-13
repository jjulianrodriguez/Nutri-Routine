import { notFound, redirect } from "next/navigation";

import {
  getAppRouteKind,
  getAppRoutePath,
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
    await requireCurrentUserAccess();

    notFound();
  }

  await requireRouteAccess(pathname);
  redirect(getAppRoutePath(route));
}
