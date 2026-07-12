"use client";

import {
 createContext,
 type ReactNode,
} from "react";

import type { CurrentUserAccess } from "@/lib/auth/access-rules";

const CurrentUserAccessContext = createContext<CurrentUserAccess | null>(null);

export function CurrentUserAccessProvider({
 access,
 children,
}: {
 access: CurrentUserAccess;
 children: ReactNode;
}) {
 return (
 <CurrentUserAccessContext.Provider value={access}>
 {children}
 </CurrentUserAccessContext.Provider>
 );
}

