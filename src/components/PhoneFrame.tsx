import { ReactNode } from "react";

export const PhoneFrame = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen w-full bg-muted flex items-start md:items-center justify-center md:py-8">
    <div className="w-full md:w-[420px] md:rounded-[2.25rem] md:border-8 md:border-foreground/90 md:shadow-2xl bg-background overflow-hidden md:h-[860px] md:max-h-[90vh] flex flex-col">
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  </div>
);
