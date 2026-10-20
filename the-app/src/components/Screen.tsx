import { ReactNode } from "react";
import { PhoneFrame } from "./PhoneFrame";
import { WalmartHeader } from "./WalmartHeader";
import { BottomTabs } from "./BottomTabs";

interface Props {
  title?: string;
  subtitle?: string;
  back?: boolean;
  hideTabs?: boolean;
  showSearch?: boolean;
  children: ReactNode;
}

export const Screen = ({ title, subtitle, back, hideTabs, showSearch, children }: Props) => (
  <PhoneFrame>
    <div className="flex flex-col min-h-full">
      <WalmartHeader title={title} subtitle={subtitle} back={back} showSearch={showSearch} />
      <main className="flex-1 p-4 space-y-4">{children}</main>
      {!hideTabs && <BottomTabs />}
    </div>
  </PhoneFrame>
);
