import { Home, Sparkles, Heart, Search, PiggyBank, User, ShoppingCart } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStore } from "@/contexts/DemoStoreContext";

const tabs = [
  { to: "/", label: "Shop", icon: Home, exact: true },
  { to: "/ai", label: "AI Planner", icon: Sparkles, highlight: true },
  { to: "/basket", label: "Cart", icon: ShoppingCart, cartBadge: true },
  { to: "/my-items", label: "My Items", icon: Heart },
  { to: "/wellness", label: "Savings", icon: PiggyBank },
  { to: "/account", label: "Account", icon: User },
];

export const BottomTabs = () => {
  const loc = useLocation();
  const { cartCount, cartTotal } = useStore();

  return (
    <nav className="sticky bottom-0 z-30 inset-x-0 bg-card border-t border-border shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.06)]">
      <ul className="flex">
        {tabs.map(t => {
          const active = t.exact ? loc.pathname === t.to : loc.pathname.startsWith(t.to);
          const Icon = t.icon;
          const showCartBadge = t.cartBadge && cartCount > 0;

          return (
            <li key={t.to} className="flex-1">
              <NavLink
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors relative",
                  active ? "text-walmart-blue-dark" : "text-muted-foreground",
                )}
              >
                {active && !t.highlight && (
                  <span className="absolute top-0 inset-x-4 h-0.5 rounded-full bg-walmart-blue" />
                )}
                <span
                  className={cn(
                    "relative flex items-center justify-center transition",
                    t.highlight && "size-7 rounded-full bg-walmart-yellow text-walmart-blue-dark",
                    active && !t.highlight && "scale-110",
                  )}
                >
                  <Icon className={cn("size-5", t.highlight && "size-4")} strokeWidth={active ? 2.6 : 2} />

                  {/* Dynamic cart badge */}
                  {showCartBadge && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-0.5 rounded-full bg-walmart-yellow text-walmart-blue-dark text-[9px] font-bold flex items-center justify-center leading-none">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>

                {/* Cart tab: show spend total when items in cart */}
                {t.cartBadge && cartCount > 0 ? (
                  <span className={cn("font-bold", active ? "text-walmart-blue-dark" : "text-muted-foreground")}>
                    ${cartTotal.toFixed(0)}
                  </span>
                ) : (
                  <span className={cn(active && "font-bold")}>{t.label}</span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
