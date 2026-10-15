import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function ResourceNotFound({
  title = "Registro não encontrado",
  description = "Este registro pode ter sido excluído em outra sessão ou o link não está mais disponível.",
  returnHref = "/",
  returnLabel = "Voltar ao início",
}: {
  title?: string;
  description?: string;
  returnHref?: string;
  returnLabel?: string;
}) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 px-6 py-16 text-center">
      <div className="rounded-2xl bg-base-200 p-4 text-base-content/60">
        <FileQuestion className="size-10" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-widest text-base-content/60">
          404
        </p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm leading-6 text-base-content/65">{description}</p>
      </div>
      <Link href={returnHref} className={buttonVariants()}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        {returnLabel}
      </Link>
    </section>
  );
}
