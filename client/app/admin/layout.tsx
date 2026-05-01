import type { ReactNode } from "react";
import { AdminProviders } from "./AdminProviders";
import { AdminShell } from "./AdminShell";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return (
    <AdminProviders>
      <AdminShell>{children}</AdminShell>
    </AdminProviders>
  );
}
