"use client";

import {
  LayoutDashboard,
  LifeBuoy,
  LoaderCircle,
  LogOut,
  type LucideIcon,
  Package,
  QrCode,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

type SidebarUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  managerOnly?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navigation: NavSection[] = [
  {
    title: "Operação",
    items: [
      { title: "Clientes · BDC", href: "/bdc", icon: UsersRound },
      { title: "Estoque", href: "/inventory", icon: Package },
      { title: "Recebimento", href: "/check-in", icon: QrCode },
    ],
  },
  {
    title: "Análises",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        adminOnly: true,
      },
    ],
  },
  {
    title: "Portal do cliente",
    items: [{ title: "Acompanhamento", href: "/tracking", icon: Search }],
  },
  {
    title: "Administração",
    items: [
      {
        title: "Operadores de recebimento",
        href: "/squad/check-in",
        icon: QrCode,
        adminOnly: true,
      },
      {
        title: "Equipe",
        href: "/squad",
        icon: UsersRound,
        adminOnly: true,
      },
      {
        title: "Suporte",
        href: "/support",
        icon: LifeBuoy,
        managerOnly: true,
      },
    ],
  },
];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function canSeeItem(item: NavItem, role?: string | null) {
  if (item.adminOnly) return role === "ADMIN";
  if (item.managerOnly) return role === "ADMIN" || role === "MANAGER";
  return true;
}

export function AppSidebar({
  logoUrl,
  user,
}: {
  logoUrl?: string | null;
  user: SidebarUser;
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const userInitials = initials(user.name);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();
      if (result.error) {
        toast.error("Não foi possível sair da conta.", {
          description: result.error.status
            ? `O servidor retornou o erro ${result.error.status}.`
            : "Tente novamente em instantes.",
        });
        setIsSigningOut(false);
        return;
      }
      window.location.replace("/sign-in");
    } catch {
      toast.error("Não foi possível sair da conta. Verifique sua conexão.");
      setIsSigningOut(false);
    }
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-4">
        <Link
          href="/bdc"
          aria-label="Auge Management — clientes"
          onClick={() => setOpenMobile(false)}
          title="Auge Management"
          className="group flex h-12 items-center gap-3 rounded-2xl px-2 transition-colors hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Image
            src={logoUrl || "/logo-auge.png"}
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-xl object-contain"
            unoptimized={Boolean(logoUrl)}
          />
          <span className="grid min-w-0 text-left leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold tracking-tight">
              Auge
            </span>
            <span className="truncate pt-1 text-xs text-muted-foreground">
              Console de operações
            </span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="gap-1 px-2 py-3">
        <nav aria-label="Navegação principal" className="space-y-3">
          {navigation.map((section) => {
            const items = section.items.filter((item) =>
              canSeeItem(item, user.role),
            );
            if (items.length === 0) return null;

            return (
              <SidebarGroup key={section.title} className="p-0">
                <SidebarGroupLabel className="h-7 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50 group-data-[collapsible=icon]:opacity-0">
                  {section.title}
                </SidebarGroupLabel>
                <SidebarMenu className="gap-1">
                  {items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <SidebarMenuItem key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setOpenMobile(false)}
                          aria-current={active ? "page" : undefined}
                          aria-label={item.title}
                          title={item.title}
                          data-active={active}
                          className="group/nav-link relative flex h-10 items-center gap-3 overflow-hidden rounded-lg px-3 text-sm font-medium text-sidebar-foreground/75 outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-2 focus-visible:ring-primary data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&_svg]:size-[18px] [&_svg]:shrink-0"
                        >
                          <Icon aria-hidden="true" />
                          <span className="truncate group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          {active && (
                            <span
                              aria-hidden="true"
                              className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-primary group-data-[collapsible=icon]:hidden"
                            />
                          )}
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroup>
            );
          })}
        </nav>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-2">
        <details className="group/account relative">
          <summary
            aria-label={`Conta de ${user.name}`}
            title={user.name}
            className="flex h-12 cursor-pointer list-none items-center gap-3 rounded-xl px-2 outline-none transition-colors hover:bg-sidebar-accent/70 focus-visible:ring-2 focus-visible:ring-primary group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 [&::-webkit-details-marker]:hidden"
          >
            <Avatar className="size-8 shrink-0">
              {user.image && <AvatarImage src={user.image} alt="" />}
              <AvatarFallback className="text-xs font-semibold">
                {userInitials || <UserRound className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate pt-1 text-xs text-muted-foreground">
                {user.email}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-success group-data-[collapsible=icon]:hidden"
            />
          </summary>

          <div className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl group-data-[collapsible=icon]:left-12 group-data-[collapsible=icon]:w-56">
            <div className="border-b border-base-300 px-3 py-2">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-base-content/60">
                {user.email}
              </p>
              <p className="mt-1 text-[11px] text-base-content/50">
                {user.role === "ADMIN"
                  ? "Administrador"
                  : user.role === "MANAGER"
                    ? "Gerente"
                    : "Colaborador"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
              className="mt-1 flex h-10 w-full items-center gap-2 rounded-xl px-3 text-left text-sm text-error outline-none transition-colors hover:bg-error/10 focus-visible:ring-2 focus-visible:ring-error disabled:opacity-60"
            >
              {isSigningOut ? (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
              {isSigningOut ? "Saindo…" : "Sair da conta"}
            </button>
          </div>
        </details>
      </SidebarFooter>
    </Sidebar>
  );
}
