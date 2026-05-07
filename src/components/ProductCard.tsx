import { Tag } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CatalogItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  item: CatalogItem;
  selected?: boolean;
  onToggle?: (id: string) => void;
  showCheckbox?: boolean;
}

const EMOJI: Record<string, string> = {
  produce: "🥬",
  dairy: "🥛",
  pantry: "🥫",
  snacks: "🍿",
  beverages: "🥤",
  protein: "🍗",
};

export const ProductCard = ({ item, selected, onToggle, showCheckbox = true }: Props) => {
  const saving = +(item.basePrice - item.price).toFixed(2);
  const onSale = item.onSale && saving > 0;

  return (
    <button
      type="button"
      onClick={() => onToggle?.(item.id)}
      className={cn(
        "relative text-left bg-card border rounded-lg p-2 flex flex-col gap-1.5 transition",
        selected ? "border-walmart-blue ring-2 ring-walmart-blue/30" : "border-border hover:border-walmart-blue/50",
      )}
    >
      {showCheckbox && (
        <div className="absolute top-2 left-2 z-10 bg-background rounded">
          <Checkbox checked={!!selected} className="size-5 border-walmart-blue data-[state=checked]:bg-walmart-blue" />
        </div>
      )}
      {onSale && (
        <Badge className="absolute top-2 right-2 z-10 bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow text-[10px] px-1.5 py-0.5 gap-1">
          <Tag className="size-2.5" /> Save ${saving.toFixed(2)}
        </Badge>
      )}
      <div className="aspect-square w-full rounded-md bg-secondary flex items-center justify-center text-5xl">
        {EMOJI[item.category] ?? "🛒"}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-base font-bold text-walmart-blue-dark">${item.price.toFixed(2)}</span>
        {onSale && (
          <span className="text-[11px] line-through text-muted-foreground">${item.basePrice.toFixed(2)}</span>
        )}
      </div>
      <p className="text-xs font-medium leading-tight line-clamp-2 min-h-[2rem]">{item.name}</p>
      <p className="text-[11px] text-muted-foreground truncate">{item.brand} · {item.unit}</p>
      {item.healthScore >= 8 && (
        <span className="text-[10px] font-semibold text-success uppercase">Healthy pick</span>
      )}
    </button>
  );
};
