"use client";

import {
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  LoaderCircle,
  type LucideIcon,
  Package,
  Search,
  User,
  Users,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { authClient } from "@/lib/auth-client";

type SidebarUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

const navigationData: NavItem[] = [
  { title: "Acompanhamento", href: "/tracking", icon: Search },
  { title: "BDC", href: "/bdc", icon: Users },
  { title: "Estoque", href: "/inventory", icon: Package },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: true,
  },
  {
    title: "Usuários",
    href: "/squad",
    icon: UsersIcon,
    adminOnly: true,
  },
  {
    title: "Suporte",
    href: "/support",
    icon: LifeBuoy,
    managerOnly: true,
  },
];

export function AppSidebar({
  logoUrl,
  user,
}: {
  logoUrl?: string | null;
  user: SidebarUser;
}) {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  const userInitials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  const visibleNav = navigationData.filter((item) => {
    if (item.adminOnly) return user?.role === "ADMIN";

    if (item.managerOnly) {
      return user?.role === "ADMIN" || user?.role === "MANAGER";
    }

    return true;
  });

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border/60 px-3 py-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Auge"
              className="h-14 rounded-2xl px-2 hover:bg-sidebar-accent/70"
            >
              <Link href="/tracking">
                <Image
                  src={logoUrl || "/logo-auge.png"}
                  alt="Auge"
                  width={36}
                  height={36}
                  className="size-10 shrink-0 rounded-xl object-contain"
                  unoptimized={Boolean(logoUrl)}
                />

                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold tracking-tight">
                    Auge Management
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Operação de concessionária
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/50">
            Workspace
          </SidebarGroupLabel>

          <SidebarMenu>
            {visibleNav.map((item) => {
              const active = isActive(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                    className="h-11 rounded-xl px-3 text-sm transition-colors"
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={user.name || "Minha conta"}
                    className="h-14 rounded-2xl px-2 hover:bg-sidebar-accent/70"
                  >
                    <Avatar className="size-8 shrink-0">
                      {user.image && (
                        <AvatarImage
                          src={user.image}
                          alt={user.name || "Usuário"}
                        />
                      )}
                      <AvatarFallback className="text-xs font-semibold">
                        {userInitials || <User className="size-4" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className="grid flex-1 text-left leading-tight">
                      <span className="truncate text-sm font-medium">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="top" align="start" className="w-64">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        {user.image && (
                          <AvatarImage
                            src={user.image}
                            alt={user.name || "Usuário"}
                          />
                        )}
                        <AvatarFallback>
                          {userInitials || <User className="size-4" />}
                        </AvatarFallback>
                      </Avatar>

                      <div className="grid min-w-0 flex-1">
                        <span className="truncate text-sm font-medium">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onSelect={() => void handleSignOut()}
                    disabled={isSigningOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    {isSigningOut ? (
                      <LoaderCircle className="mr-2 size-4 animate-spin" />
                    ) : (
                      <LogOut className="mr-2 size-4" />
                    )}
                    {isSigningOut ? "Saindo…" : "Sair da conta"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
