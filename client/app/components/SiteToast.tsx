"use client";

import { createPortal } from "react-dom";
import { useCallback, useEffect, useState } from "react";

type Props = {
  message: string | null;
  onDismiss: () => void;
  /** 자동으로 사라지기까지 ms (기본 2.6초) */
  durationMs?: number;
};

export function SiteToast({ message, onDismiss, durationMs = 2600 }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(dismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [message, durationMs, dismiss]);

  if (!mounted || !message) return null;

  return createPortal(
    <div className="site-toast" role="status" aria-live="polite">
      {message}
    </div>,
    document.body,
  );
}
