export type AppRole = "client" | "admin" | "professional";

export type ProfessionalSpecialty = "nutrition" | "training" | "both";

export type AppRouteKind =
  | "dashboard"
  | "profile"
  | "progress"
  | "clients"
  | "nutrition"
  | "pending"
  | "professionalAccounts"
  | "training"
  | "resources"
  | "calendar"
  | "settings";

export type AppNavIcon =
  | "dashboard"
  | "profile"
  | "progress"
  | "clients"
  | "nutrition"
  | "training"
  | "resources"
  | "calendar"
  | "pending"
  | "settings";

export type AppNavigationItem = {
  href: string;
  icon: AppNavIcon;
  label: string;
  route: AppRouteKind;
};

export type AppNavigationSection = {
  items: AppNavigationItem[];
  label: string;
};

export type CurrentUserAccess = {
  assignedNutritionistId: string | null;
  assignedTrainerId: string | null;
  canAccessApp: boolean;
  canAccessOnlyBasicSettings: boolean;
  canManageClientPlans: boolean;
  canManageNutrition: boolean;
  canManageProfessionalAccounts: boolean;
  canManageTraining: boolean;
  canViewNutrition: boolean;
  canViewTraining: boolean;
  clientProfileExists: boolean;
  displayName: string;
  email: string;
  hasNutritionService: boolean;
  hasTrainingService: boolean;
  initials: string;
  isAdmin: boolean;
  isClient: boolean;
  isClientActivated: boolean;
  isProfessional: boolean;
  isProfessionalActive: boolean;
  role: AppRole;
  roleLabel: string;
  specialty: ProfessionalSpecialty | null;
  userId: string;
};

const ROUTE_PATHS: Record<AppRouteKind, string> = {
  calendar: "/app/calendario",
  clients: "/app/clientes",
  dashboard: "/app/dashboard",
  nutrition: "/app/nutricion",
  pending: "/app/pending",
  profile: "/app/perfil",
  professionalAccounts: "/app/configuracion/profesionales",
  progress: "/app/progreso",
  resources: "/app/recursos",
  settings: "/app/configuracion",
  training: "/app/entrenamiento",
};

const ROUTE_ALIASES: Partial<Record<AppRouteKind, string[]>> = {
  calendar: ["/app/calendar"],
  clients: ["/app/clients"],
  nutrition: ["/app/nutrition", "/app/dietas"],
  pending: ["/app/account-pending"],
  profile: ["/app/profile"],
  progress: ["/app/progress"],
  resources: ["/app/resources"],
  settings: ["/app/settings"],
  training: ["/app/training", "/app/rutinas", "/app/ejercicios"],
};

function item(route: AppRouteKind, icon: AppNavIcon, label: string): AppNavigationItem {
  return {
    href: ROUTE_PATHS[route],
    icon,
    label,
    route,
  };
}

export function buildNavigationForUser(
  access: CurrentUserAccess,
): AppNavigationSection[] {
  if (access.canAccessOnlyBasicSettings) {
    return [
      {
        items: [item("settings", "settings", "Configuracion")],
        label: "Cuenta",
      },
    ];
  }

  if (access.isClient) {
    const personalItems: AppNavigationItem[] = [
      item("dashboard", "dashboard", "Dashboard"),
      item("profile", "profile", "Mi perfil"),
      item("progress", "progress", "Mi progreso"),
    ];

    if (access.canViewNutrition) {
      personalItems.push(item("nutrition", "nutrition", "Nutrici\u00f3n"));
    }

    if (access.canViewTraining) {
      personalItems.push(item("training", "training", "Entrenamiento"));
    }

    return [
      {
        items: personalItems,
        label: "Mi bienestar",
      },
      {
        items: [
          item("resources", "resources", "Recursos"),
          item("calendar", "calendar", "Calendario"),
        ],
        label: "Acompa\u00f1amiento",
      },
      {
        items: [item("settings", "settings", "Configuraci\u00f3n")],
        label: "Cuenta",
      },
    ];
  }

  const managementItems: AppNavigationItem[] = [
    item("dashboard", "dashboard", "Dashboard"),
  ];

  if (access.canManageClientPlans) {
    managementItems.push(item("clients", "clients", "Clientes"));
  }

  if (access.role === "admin") {
    managementItems.push(item("progress", "progress", "Progreso"));
  }

  if (access.canManageNutrition) {
    managementItems.push(item("nutrition", "nutrition", "Nutrici\u00f3n"));
  }

  if (access.canManageTraining) {
    managementItems.push(item("training", "training", "Entrenamiento"));
  }

  return [
    {
      items: managementItems,
      label: "Gesti\u00f3n",
    },
    {
      items: [
        item("resources", "resources", "Recursos"),
        item("calendar", "calendar", "Calendario"),
      ],
      label: "Operaci\u00f3n",
    },
    {
      items: [item("settings", "settings", "Configuraci\u00f3n")],
      label: "Cuenta",
    },
  ];
}

export function getAppRoutePath(route: AppRouteKind) {
  return ROUTE_PATHS[route];
}

function normalizePathname(pathname: string) {
  const [pathWithoutHash] = pathname.split("#");
  const [pathWithoutQuery] = pathWithoutHash.split("?");
  const normalized =
    pathWithoutQuery.length > 1 && pathWithoutQuery.endsWith("/")
      ? pathWithoutQuery.slice(0, -1)
      : pathWithoutQuery;

  return normalized || "/";
}

function matchesPath(pathname: string, basePath: string) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

export function getAppRouteKind(pathname: string): AppRouteKind | null {
  const path = normalizePathname(pathname);

  if (path === "/app" || path === "/app/") {
    return "dashboard";
  }

  for (const [route, basePath] of Object.entries(ROUTE_PATHS)) {
    if (matchesPath(path, basePath)) {
      return route as AppRouteKind;
    }

    const aliases = ROUTE_ALIASES[route as AppRouteKind] ?? [];

    if (aliases.some((alias) => matchesPath(path, alias))) {
      return route as AppRouteKind;
    }
  }

  return null;
}

export function canAccessRoute(
  access: CurrentUserAccess,
  pathname: string,
): boolean {
  const route = getAppRouteKind(pathname);

  if (!route) {
    return false;
  }

  if (access.canAccessOnlyBasicSettings) {
    return route === "settings";
  }

  if (access.isClient && !access.isClientActivated) {
    return false;
  }

  switch (route) {
    case "dashboard":
    case "resources":
    case "calendar":
    case "settings":
      return true;
    case "pending":
      return access.canAccessOnlyBasicSettings;
    case "profile":
      return access.isClient;
    case "progress":
      return access.isClient || access.role === "admin";
    case "clients":
      return access.canManageClientPlans;
    case "professionalAccounts":
      return access.canManageProfessionalAccounts;
    case "nutrition":
      return access.canViewNutrition;
    case "training":
      return access.canViewTraining;
  }
}

export function getDefaultAppRoute(access: CurrentUserAccess) {
  if (access.canAccessOnlyBasicSettings) {
    return ROUTE_PATHS.settings;
  }

  return ROUTE_PATHS.dashboard;
}
