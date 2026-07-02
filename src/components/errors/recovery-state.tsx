"use client";

import {
 AlertTriangle,
 ArrowLeft,
 Home,
 RefreshCw,
 SearchX,
 ShieldX,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconByKind = {
 forbidden: ShieldX,
 "not-found": SearchX,
 unexpected: AlertTriangle,
} as const;

type RecoveryStateProps = {
 backLabel?: string;
 className?: string;
 description: string;
 eyebrow: string;
 fallbackHref: string;
 fallbackLabel: string;
 kind?: keyof typeof iconByKind;
 retry?: () => void;
 retryLabel?: string;
 title: string;
};

export function RecoveryState({
 backLabel = "Volver atras",
 className,
 description,
 eyebrow,
 fallbackHref,
 fallbackLabel,
 kind = "unexpected",
 retry,
 retryLabel = "Intentar de nuevo",
 title,
}: RecoveryStateProps) {
 const router = useRouter();
 const Icon = iconByKind[kind];

 function handleBack() {
 if (window.history.length > 1) {
 router.back();
 return;
 }

 router.push(fallbackHref);
 }

 return (
 <Card
 className={cn(
 "relative mx-auto w-full max-w-3xl overflow-hidden border-foreground/10 bg-surface py-0 ",
 className,
 )}
 aria-labelledby="recovery-state-title"
 aria-describedby="recovery-state-description"
 role={kind === "unexpected" ? "alert" : "region"}
 >
 <div className="h-2 bg-primary" aria-hidden="true" />
 <CardHeader className="gap-4 px-6 pt-7 sm:px-9 sm:pt-9">
 <div className="grid size-14 place-items-center rounded-full border-foreground/10 bg-primary-soft text-muted-foreground">
 <Icon className="size-6" aria-hidden="true" />
 </div>
 <div>
 <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
 {eyebrow}
 </p>
 <h1
 id="recovery-state-title"
 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl"
 >
 {title}
 </h1>
 </div>
 <CardDescription
 id="recovery-state-description"
 className="max-w-2xl text-base leading-7 text-muted-foreground"
 >
 {description}
 </CardDescription>
 </CardHeader>

 <CardContent className="px-6 pb-7 pt-2 sm:px-9 sm:pb-9">
 <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
 {retry ? (
 <Button type="button" size="lg" onClick={retry}>
 <RefreshCw className="size-4" aria-hidden="true" />
 {retryLabel}
 </Button>
 ) : null}
 <Button
 type="button"
 size="lg"
 variant={retry ? "outline" : "default"}
 onClick={handleBack}
 >
 <ArrowLeft className="size-4" aria-hidden="true" />
 {backLabel}
 </Button>
 <Button asChild size="lg" variant="ghost">
 <a href={fallbackHref}>
 <Home className="size-4" aria-hidden="true" />
 {fallbackLabel}
 </a>
 </Button>
 </div>
 </CardContent>
 </Card>
 );
}
