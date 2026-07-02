"use client";

import {
 createContext,
 useContext,
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

export function useCurrentUserAccess() {
 const access = useContext(CurrentUserAccessContext);

 if (!access) {
 throw new Error(
 "useCurrentUserAccess must be used inside CurrentUserAccessProvider.",
 );
 }

 return access;
}
