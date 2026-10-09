"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { maskCPFIncremental } from "@/lib/cpf";

interface SearchFormProps {
  defaultValue?: string;
}

export function SearchForm({ defaultValue = "" }: SearchFormProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(maskCPFIncremental(e.target.value));
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
        id="tracking-cpf"
        name="cpf"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label="CPF do cliente"
        aria-describedby="tracking-cpf-help"
        placeholder="Digite o CPF do cliente..."
        value={query}
        onChange={handleChange}
        className="min-h-12 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 sm:pl-3"
      />
      <span id="tracking-cpf-help" className="sr-only">
        Informe os 11 dígitos do CPF para consultar.
      </span>
      <Button type="submit" className="min-h-12 w-full sm:w-auto sm:px-6">
        <Search className="mr-2 size-4" />
        Buscar
      </Button>
    </form>
  );
}
