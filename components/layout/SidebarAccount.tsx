"use client";
import { LoaderCircle, LogOut, UserRound } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarFooter } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";
import { initialsOf } from "@/lib/utils";

export type SidebarUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};
export function SidebarAccount({ user }: { user: SidebarUser }) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const userInitials = initialsOf(
    user.name.trim().replace(/\s+/g, " "),
  ).toUpperCase();
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
  );
}
