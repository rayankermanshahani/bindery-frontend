// src/hooks/useClipboard.ts
import { useState } from "react";

export function useClipboard(timeout: number = 2000) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => {
      setCopiedValue(null);
    }, timeout);
  };

  return { copy, copiedValue };
}
