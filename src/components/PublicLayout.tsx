import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <SiteHeader />
      <main className="lg:pl-[280px] pt-24 lg:pt-20 pb-20">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 lg:px-12">
          {children}
        </div>
      </main>
      <SiteFooter className="lg:ml-[280px]" />
    </div>
  );
}
