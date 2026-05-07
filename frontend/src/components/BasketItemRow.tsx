import { Minus, Plus, Repeat, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BasketLine } from "@/lib/types";
import { ProductImage } from "@/components/ProductImage";
import { useDemoStore } from "@/hooks/useDemoStore";

interface Props {
  line: BasketLine;
  onSwap?: () => void;
  /** When true, render qty controls + remove. */
  editable?: boolean;
}

export const BasketItemRow = ({ line, onSwap, editable = true }: Props) => {
  const { item, qty, appliedDeal, weekIndex } = line;
  const { updateLineQty, removeLineFromBasket } = useDemoStore();

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <ProductImage item={item} className="size-12 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm leading-tight line-clamp-1">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.brand} · {item.unit}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {appliedDeal && (
            <Badge className="bg-walmart-yellow text-walmart-blue-dark hover:bg-walmart-yellow gap-1">
              <Tag className="size-3" /> {appliedDeal.label}
            </Badge>
          )}
          {item.healthScore >= 8 && (
            <Badge variant="secondary" className="text-success">Healthy</Badge>
          )}
        </div>
        {editable && (
          <div className="flex items-center gap-1 mt-2">
            <button
              type="button"
              onClick={() => updateLineQty(item.id, qty - 1, weekIndex)}
              aria-label="Decrease quantity"
              className="size-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-secondary"
            >
              <Minus className="size-3" />
            </button>
            <span className="text-xs font-semibold w-5 text-center">{qty}</span>
            <button
              type="button"
              onClick={() => updateLineQty(item.id, qty + 1, weekIndex)}
              aria-label="Increase quantity"
              className="size-6 rounded-full border border-border bg-background flex items-center justify-center hover:bg-secondary"
            >
              <Plus className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => removeLineFromBasket(item.id, weekIndex)}
              aria-label="Remove from cart"
              className="ml-1 size-6 rounded-full text-muted-foreground hover:text-destructive flex items-center justify-center"
            >
              <Trash2 className="size-3" />
            </button>
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-sm">${(item.price * qty).toFixed(2)}</p>
        {onSwap && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-walmart-blue"
            onClick={onSwap}
          >
            <Repeat className="size-3 mr-1" /> Swap
          </Button>
        )}
      </div>
    </div>
  );
};
