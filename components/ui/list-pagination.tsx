import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

export function ListPagination({
  page,
  totalPages,
  isPending,
  onPageChange,
  label,
}: {
  page: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
  label: string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav
      aria-label={label}
      className="flex flex-wrap items-center justify-center gap-4 border-t border-base-300/70 py-4"
    >
      <Button
        variant="outline"
        disabled={page <= 1 || isPending}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="size-4" aria-hidden="true" /> Anterior
      </Button>
      <span className="text-sm text-base-content/65" aria-live="polite">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        disabled={page >= totalPages || isPending}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
