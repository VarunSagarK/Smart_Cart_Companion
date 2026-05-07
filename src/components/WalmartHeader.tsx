import { ArrowLeft, ShoppingCart, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDemoStore } from "@/hooks/useDemoStore";

interface Props {
  title?: string;
  back?: boolean;
  subtitle?: string;
}

export const WalmartHeader = ({ title, back, subtitle }: Props) => {
  const nav = useNavigate();
  const { cartCount } = useDemoStore();
  return (
    <header className="sticky top-0 z-30 bg-walmart-blue text-primary-foreground shadow-sm">
      <div className="px-4 pt-5 pb-4 flex items-center gap-3">
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
        <Link
          to="/basket"
          aria-label="Cart"
          className="relative p-2 -mr-1 rounded-full hover:bg-white/10"
        >
          <ShoppingCart className="size-5" />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-walmart-yellow text-walmart-blue-dark text-[10px] font-bold flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};
