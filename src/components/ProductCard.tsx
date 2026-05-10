import { Heart, Plus, Leaf, DollarSign } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { CatalogItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useStore } from "@/contexts/DemoStoreContext";
import { toast } from "sonner";
import { itemRating, itemReviewCount } from "@/lib/ratings";

interface Props {
  item: CatalogItem;
  selected?: boolean;
  onToggle?: (id: string) => void;
  showCheckbox?: boolean;
  reason?: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  produce: "🥬",
  dairy: "🥛",
  pantry: "🥫",
  snacks: "🍿",
  beverages: "🥤",
  protein: "🍗",
  frozen: "🧊",
  bakery: "🍞",
  household: "🧴",
};

function StarRow({ id }: { id: string }) {
  const rating = itemRating(id);
  const reviews = itemReviewCount(id);
  const fullStars = Math.round(rating);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`f${i}`} className="text-[11px] text-yellow-400">★</span>
      ))}
      {Array.from({ length: 5 - fullStars }).map((_, i) => (
        <span key={`e${i}`} className="text-[11px] text-muted-foreground/40">★</span>
      ))}
      <span className="text-[10px] text-muted-foreground ml-0.5">{rating} ({reviews > 999 ? `${(reviews / 1000).toFixed(1)}k` : reviews})</span>
    </div>
  );
}

export const ProductCard = ({ item, selected, onToggle, showCheckbox = true, reason }: Props) => {
  const { state, addItemsToBasket, toggleWishlist } = useStore();
  const saving = +(item.basePrice - item.price).toFixed(2);
  const onSale = item.onSale && saving > 0;
  const savingPct = onSale ? Math.round((saving / item.basePrice) * 100) : 0;
  const wished = state.wishlist.includes(item.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItemsToBasket([item]);
    toast.success(`${item.name} added to cart`);
  };

  const handleHeart = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(item.id);
    toast(wished ? "Removed from favorites" : "Saved to favorites");
  };

  const handleCard = () => onToggle?.(item.id);

  return (
    <div
      role={onToggle ? "button" : undefined}
      onClick={handleCard}
      className={cn(
        "relative text-left bg-card border rounded-lg p-2 flex flex-col gap-1.5 transition cursor-pointer",
        selected ? "border-walmart-blue ring-2 ring-walmart-blue/30" : "border-border hover:border-walmart-blue/50",
      )}
    >
      {showCheckbox && (
        <div className="absolute top-2 left-2 z-10 bg-background rounded">
          <Checkbox
            checked={!!selected}
            onCheckedChange={() => onToggle?.(item.id)}
            onClick={e => e.stopPropagation()}
            className="size-5 border-walmart-blue data-[state=checked]:bg-walmart-blue"
          />
        </div>
      )}
      <button
        type="button"
        onClick={handleHeart}
        aria-label={wished ? "Remove from favorites" : "Save to favorites"}
        className="absolute top-2 right-2 z-10 size-7 rounded-full bg-background/95 border border-border flex items-center justify-center hover:bg-secondary"
      >
        <Heart className={cn("size-3.5", wished ? "fill-destructive text-destructive" : "text-muted-foreground")} />
      </button>

      {/* Discount badge — shown on all sale items */}
      {onSale && (
        <div className="absolute top-10 right-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md leading-tight">
          -{savingPct}%
        </div>
      )}

      <div className="aspect-square w-full rounded-md bg-secondary flex items-center justify-center text-5xl">
        {item.emoji ?? CATEGORY_EMOJI[item.category] ?? "🛒"}
      </div>

      {/* Price row */}
      <div className="flex items-baseline gap-1">
        <span className="text-base font-bold text-walmart-blue-dark">${item.price.toFixed(2)}</span>
        {onSale && (
          <span className="text-[11px] line-through text-muted-foreground">${item.basePrice.toFixed(2)}</span>
        )}
        {onSale && (
          <span className="text-[10px] font-semibold text-red-500 ml-auto">Save ${saving.toFixed(2)}</span>
        )}
      </div>

      <p className="text-xs font-medium leading-tight line-clamp-2 min-h-[2rem]">{item.name}</p>
      <p className="text-[11px] text-muted-foreground truncate">{item.brand} · {item.unit}</p>

      {/* Star ratings */}
      <StarRow id={item.id} />

      {/* AI reason chip */}
      {reason && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-walmart-blue/10 text-walmart-blue w-fit">
          {item.healthScore >= 8 ? <Leaf className="size-2.5" /> : <DollarSign className="size-2.5" />}
          {reason}
        </span>
      )}
      {!reason && item.healthScore >= 8 && (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
          <Leaf className="size-2.5" /> Healthy pick
        </span>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="mt-auto w-full h-8 rounded-full bg-walmart-blue text-primary-foreground text-xs font-bold flex items-center justify-center gap-1 hover:bg-walmart-blue-dark transition"
      >
        <Plus className="size-3.5" /> Add
      </button>
    </div>
  );
};
