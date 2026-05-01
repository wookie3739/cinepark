import type { ReactNode } from "react";
import SupportShell from "./SupportShell";

export default function SupportLayout({ children }: { children: ReactNode }) {
  return (
    <SupportShell>
      <main className="support-main-surface">{children}</main>
    </SupportShell>
  );
}
