import type { ReactNode } from "react";
import { AdminProviders } from "./AdminProviders";
import { AdminRouteGate } from "./AdminRouteGate";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return (
    <AdminProviders>
      <AdminRouteGate>{children}</AdminRouteGate>
    </AdminProviders>
  );
}
