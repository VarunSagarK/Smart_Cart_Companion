import { Home, Sparkles, Heart, Search, PiggyBank, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Shop", icon: Home, exact: true },
  { to: "/ai", label: "AI", icon: Sparkles, highlight: true },
  { to: "/my-items", label: "My Items", icon: Heart },
  { to: "/search", label: "Search", icon: Search },
  { to: "/wellness", label: "Savings", icon: PiggyBank },
  { to: "/account", label: "Account", icon: User },
];

export const BottomTabs = () => {
  const loc = useLocation();
  return (
    <nav className="sticky bottom-0 inset-x-0 bg-card border-t border-border">
      <ul className="flex">
        {tabs.map(t => {
          const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex-1">
              <NavLink
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-walmart-blue" : "text-muted-foreground",
                )}
              >
                <span className={cn(
                  "relative flex items-center justify-center",
                  t.highlight && "size-7 rounded-full bg-walmart-yellow text-walmart-blue-dark",
                )}>
                  <Icon className={cn("size-5", t.highlight && "size-4")} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span>{t.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
