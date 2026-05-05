import { Home, Sparkles, ShoppingCart, User, LayoutDashboard } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/budget", label: "AI", icon: Sparkles },
  { to: "/basket", label: "Cart", icon: ShoppingCart },
  { to: "/dashboard", label: "Wellness", icon: LayoutDashboard },
  { to: "/account", label: "Account", icon: User },
];

export const BottomTabs = () => {
  const loc = useLocation();
  return (
    <nav className="sticky bottom-0 inset-x-0 bg-card border-t border-border">
      <ul className="flex">
        {tabs.map(t => {
          const active =
            t.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(t.to);
          const Icon = t.icon;
          return (
            <li key={t.to} className="flex-1">
              <NavLink
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-walmart-blue" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                <span>{t.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
