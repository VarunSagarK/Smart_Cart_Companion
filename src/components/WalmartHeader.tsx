import { ArrowLeft, ShoppingCart, Sparkles, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "@/contexts/DemoStoreContext";

interface Props {
  title?: string;
  back?: boolean;
  subtitle?: string;
  showSearch?: boolean;
}

export const WalmartHeader = ({ title, back, subtitle, showSearch }: Props) => {
  const nav = useNavigate();
  const { cartCount, cartTotal } = useStore();

  return (
    <header className="sticky top-0 z-30 bg-walmart-blue text-primary-foreground shadow-sm">
      <div className="px-4 pt-5 pb-3 flex items-center gap-3">
        {back ? (
          <button
            onClick={() => nav(-1)}
            aria-label="Back"
            className="p-1 -ml-1 rounded-full hover:bg-white/10"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <div className="size-8 rounded-full bg-walmart-yellow flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-walmart-blue-dark" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold leading-tight truncate">{title ?? "Walmart AI"}</h1>
          {subtitle && <p className="text-xs text-white/80 truncate">{subtitle}</p>}
        </div>

        {/* Cart icon with badge + spend total */}
        <Link
          to="/basket"
          aria-label={`Cart — ${cartCount} items, $${cartTotal.toFixed(2)}`}
          className="relative p-2 -mr-1 rounded-full hover:bg-white/10 flex flex-col items-center"
        >
          <div className="relative">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-walmart-yellow text-walmart-blue-dark text-[9px] font-bold flex items-center justify-center leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          {cartCount > 0 && (
            <span className="text-[9px] text-walmart-yellow font-bold leading-none mt-0.5">
              ${cartTotal.toFixed(0)}
            </span>
          )}
        </Link>
      </div>

      {/* Search bar — shown on home page */}
      {showSearch && (
        <div className="px-4 pb-3">
          <Link
            to="/search"
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white text-muted-foreground text-sm w-full"
          >
            <Search className="size-4 text-gray-400 shrink-0" />
            <span className="text-gray-400">Search Walmart</span>
          </Link>
        </div>
      )}
    </header>
  );
};
