"use client";

import {
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  Settings,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
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
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    adminOnly: true,
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [sticky, setSticky] = useState(false);

  const handleScroll = useCallback(() => {
    setSticky(window.scrollY >= 10);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/sign-in"),
      },
    });
  };

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  const visibleNav = navigationData.filter(
    (item) => !item.adminOnly || session?.user?.role === "ADMIN",
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background transition-shadow duration-300",
        sticky && "shadow-sm",
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 justify-between gap-4">
          {/* Logo */}
          <Link href="/tracking" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo-auge.png"
              alt="Auge"
              width={36}
              height={36}
              className="rounded-lg object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-foreground leading-tight">
                Acompanhamento
              </h1>
              <p className="text-[11px] text-muted-foreground font-medium leading-none">
                Chegada de Moto
              </p>
            </div>
          </Link>

          {/* Center Nav — Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleNav.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors inline-flex items-center gap-2",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg size-9 border border-border/60 bg-muted/40 hover:bg-muted"
                  >
                    {session.user.image ? (
                      <Avatar className="size-9">
                        <AvatarImage
                          src={session.user.image}
                          alt={session.user.name}
                        />
                        <AvatarFallback className="text-xs font-semibold">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    ) : userInitials ? (
                      <span className="text-xs font-semibold">
                        {userInitials}
                      </span>
                    ) : (
                      <User className="size-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-3 px-2 py-2">
                    <Avatar className="size-9">
                      {session.user.image ? (
                        <AvatarImage src={session.user.image} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  {/* Nav links — apenas mobile */}
                  <div className="md:hidden">
                    <DropdownMenuSeparator />
                    {visibleNav.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        pathname.startsWith(`${item.href}/`);

                      return (
                        <DropdownMenuItem key={item.title} asChild>
                          <Link
                            href={item.href}
                            className={cn(
                              "w-full cursor-pointer text-sm font-medium",
                              isActive && "font-semibold",
                            )}
                          >
                            <item.icon className="mr-2 size-4" />
                            {item.title}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </div>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
