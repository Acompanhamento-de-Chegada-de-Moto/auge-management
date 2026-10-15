import { Badge } from "@/components/ui/badge";

interface UserRoleBadgeProps {
  role: string;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const isAdmin = role === "ADMIN";

  return (
    <Badge
      variant="outline"
      className={
        isAdmin
          ? "border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          : "border-gray-200 bg-gray-50 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
      }
    >
      {role}
    </Badge>
  );
}
