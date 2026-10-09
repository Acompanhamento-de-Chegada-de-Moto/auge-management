"use client";

import {
  type LucideIcon,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Package,
  Search,
  User,
  Users,
  UsersIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

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
} from "@/components/ui/sidebar";

import { authClient } from "@/lib/auth-client";

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

export function AppSidebar({ logoUrl }: { logoUrl?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  };

  const user = session?.user;

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
      <SidebarHeader className="border-b px-3 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              tooltip="Auge"
              className="h-12"
            >
              <Link href="/tracking">
                <Image
                  src={logoUrl || "/logo-auge.png"}
                  alt="Auge"
                  width={36}
                  height={36}
                  className="size-9 shrink-0 rounded-lg object-contain"
                  unoptimized={Boolean(logoUrl)}
                />

                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">
                    Acompanhamento
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Chegada de Moto
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu principal</SidebarGroupLabel>

          <SidebarMenu>
            {visibleNav.map((item) => {
              const active = isActive(item.href);

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={active}
                    tooltip={item.title}
                    className="h-10"
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
      <SidebarFooter className="border-t p-2">
        {user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={user.name || "Minha conta"}
                    className="h-12"
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
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sair da conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
