/**
 * Copy to clipboard hook.
 */

"use client";

import { useCallback, useState } from "react";

export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
      return true;
    } catch {
      setCopiedText(null);
      return false;
    }
  }, []);

  return { copiedText, copy };
}
