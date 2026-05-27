import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="pt-24 lg:pl-28 lg:pt-8">{children}</main>
      <SiteFooter className="lg:ml-28" />
    </div>
  );
}
