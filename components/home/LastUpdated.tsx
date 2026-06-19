"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";
import { useEffect, useState } from "react";

dayjs.extend(relativeTime);
dayjs.locale("pt-br");

interface LastUpdatedProps {
  updatedAt: Date;
}

export function LastUpdated({ updatedAt }: LastUpdatedProps) {
  const [label, setLabel] = useState(() => dayjs(updatedAt).fromNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setLabel(dayjs(updatedAt).fromNow());
    }, 30_000);
    return () => clearInterval(timer);
  }, [updatedAt]);

  return (
    <span className="text-xs text-muted-foreground">
      Atualizado {label}
    </span>
  );
}
