"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/actions/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
 const router = useRouter();
 const [isLoggingOut, setIsLoggingOut] = useState(false);

 async function handleLogout() {
 setIsLoggingOut(true);

 try {
 const supabase = createClient();
 await supabase.auth.signOut();
 router.replace("/login");
 router.refresh();
 } finally {
 setIsLoggingOut(false);
 }
 }

 return (
 <Button
 type="button"
 variant="destructive"
 size="lg"
 onClick={handleLogout}
 disabled={isLoggingOut}
 >
 <LogOut className="size-4" aria-hidden="true" />
 {isLoggingOut ? "Cerrando..." : "Cerrar sesion"}
 </Button>
 );
}
