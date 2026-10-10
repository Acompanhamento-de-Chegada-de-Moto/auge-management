type NavigationIcon =
  | "dashboard"
  | "clients"
  | "inventory"
  | "operators"
  | "support"
  | "check-in"
  | "tracking";
export type SidebarItem = {
  title: string;
  href: string;
  icon: NavigationIcon;
  roles?: readonly string[];
  portal?: boolean;
};
export type SidebarSection = { title: string; items: SidebarItem[] };

const navigation: SidebarSection[] = [
  {
    title: "Operação",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: "dashboard",
        roles: ["ADMIN"],
      },
      { title: "Clientes · BDC", href: "/bdc", icon: "clients" },
      { title: "Estoque", href: "/inventory", icon: "inventory" },
    ],
  },
  {
    title: "Administração",
    items: [
      { title: "Equipe", href: "/squad", icon: "clients", roles: ["ADMIN"] },
      {
        title: "Operadores",
        href: "/squad/check-in",
        icon: "operators",
        roles: ["ADMIN"],
      },
      {
        title: "Suporte",
        href: "/support",
        icon: "support",
        roles: ["ADMIN", "MANAGER"],
      },
    ],
  },
  {
    title: "Portais",
    items: [
      {
        title: "Recebimento",
        href: "/check-in",
        icon: "check-in",
        portal: true,
      },
      {
        title: "Acompanhamento",
        href: "/tracking",
        icon: "tracking",
        portal: true,
      },
    ],
  },
];

export function getSidebarSections(role?: string | null): SidebarSection[] {
  return navigation
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(role ?? ""),
      ),
    }))
    .filter((section) => section.items.length > 0);
}

export function getActiveSidebarHref(
  pathname: string,
  sections: SidebarSection[],
) {
  // Prefer the most specific visible route; /squad/check-in must not select /squad.
  return sections
    .flatMap((section) => section.items)
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((left, right) => right.href.length - left.href.length)[0]?.href;
}
