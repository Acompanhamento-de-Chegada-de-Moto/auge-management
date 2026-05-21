"use client";

import {
  Bike,
  LogOut,
  Search,
  Settings,
  TextAlignJustify,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const navigationData = [
  { title: "Home", href: "/" },
  { title: "BDC", href: "/bdc" },
  { title: "Logística", href: "/logistica" },
];

const filterPlaceholders = [
  { title: "Todos", href: "#" },
  { title: "Pendentes", href: "#" },
  { title: "Concluídos", href: "#" },
  { title: "Atrasados", href: "#" },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [sticky, setSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background transition-shadow duration-300",
        sticky && "shadow-sm",
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* ─── Top Row ─── */}
        <div className="flex items-center h-14 justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Bike className="size-5" />
            </div>
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
            {navigationData.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <ModeToggle />

            {/* User Dropdown */}
            {session?.user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg size-9 border border-border/60 bg-muted/40 hover:bg-muted"
                  >
                    {userInitials ? (
                      <span className="text-xs font-semibold">
                        {userInitials}
                      </span>
                    ) : (
                      <User className="size-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/configuracoes")}
                    className="cursor-pointer"
                  >
                    <Settings className="mr-2 size-4" />
                    Configurações
                  </DropdownMenuItem>
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

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <DropdownMenu
                open={mobileMenuOpen}
                onOpenChange={setMobileMenuOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-lg size-9 border border-border/60 bg-muted/40 hover:bg-muted"
                  >
                    <TextAlignJustify className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1">
                  {navigationData.map((item) => (
                    <DropdownMenuItem key={item.title} asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "w-full cursor-pointer text-sm font-medium",
                          pathname === item.href && "font-semibold",
                        )}
                      >
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* ─── Bottom Row (Toolbar) ─── */}
        <div className="flex items-center justify-between h-11 gap-4 border-t border-border/40">
          {/* Filter placeholders — left */}
          <nav className="hidden sm:flex items-center gap-5 overflow-x-auto">
            {filterPlaceholders.map((filter) => (
              <Link
                key={filter.title}
                href={filter.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {filter.title}
              </Link>
            ))}
          </nav>

          {/* Spacer for mobile so search stays right */}
          <div className="sm:hidden" />

          {/* Search — right */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Buscar..."
                className="h-8 w-40 sm:w-56 pl-8 pr-2 text-sm rounded-lg bg-muted/40 border-border/60 focus-visible:bg-background"
              />
            </div>
            <Button size="icon" className="size-8 rounded-lg shrink-0">
              <Search className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
