"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maskDocumentIncremental } from "@/lib/document";

interface SearchFormProps {
  defaultValue?: string;
}

export function SearchForm({ defaultValue = "" }: SearchFormProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(maskDocumentIncremental(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/tracking?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-lg flex-col gap-2 rounded-2xl border bg-card p-3 shadow-lg shadow-black/[0.03] sm:flex-row"
    >
      <Input
        id="tracking-document"
        name="document"
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        maxLength={18}
        autoComplete="off"
        aria-label="CPF ou CNPJ do cliente"
        aria-describedby="tracking-document-help"
        placeholder="Digite o CPF ou CNPJ do cliente..."
        value={query}
        onChange={handleChange}
        className="min-h-12 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 sm:pl-3"
      />
      <span id="tracking-document-help" className="sr-only">
        Informe o CPF ou CNPJ do cliente, com ou sem pontuação.
      </span>
      <Button type="submit" className="min-h-12 w-full sm:w-auto sm:px-6">
        <Search className="mr-2 size-4" />
        Buscar
      </Button>
    </form>
  );
}
